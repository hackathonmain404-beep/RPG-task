import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { 
  User, 
  Character, 
  CompleteTaskResponse, 
  Attribute 
} from '../types/contract';
import { ApiError } from '../types/contract';
import type { 
  XpProgress, 
  ProgressionActivityItem, 
  AttributeChangeNotice 
} from './authContextDef';
import { supabase } from '../lib/supabase';
import { authApi } from '../services/api/auth';
import { characterApi } from '../services/api/character';
import { sendMagicLink as sendMagicLinkApi, verifyMagicLink as verifyMagicLinkApi } from '../services/api/magicLink';
import { AuthContext } from './authContextDef';

/**
 * Probes the backend /api/health endpoint to reliably verify server reachability.
 */
export async function pingServerHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('/api/health', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

const DEFAULT_ATTRIBUTES: Attribute[] = [
  { key: 'intellect', displayName: 'Intellect', value: 0 },
  { key: 'strength', displayName: 'Strength', value: 0 },
  { key: 'wisdom', displayName: 'Wisdom', value: 0 },
  { key: 'charisma', displayName: 'Charisma', value: 0 },
  { key: 'vitality', displayName: 'Vitality', value: 0 },
];

function normalizeAttributes(serverAttrs?: Attribute[]): Attribute[] {
  if (!serverAttrs || serverAttrs.length === 0) return DEFAULT_ATTRIBUTES;
  const map = new Map(serverAttrs.map(a => [a.key.toLowerCase(), a]));
  return DEFAULT_ATTRIBUTES.map(def => {
    const existing = map.get(def.key.toLowerCase());
    return existing ? { ...def, ...existing } : def;
  });
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [serverReachable, setServerReachable] = useState<boolean>(true);
  const [xpProgress, setXpProgress] = useState<XpProgress | null>(null);
  const [recentActivity, setRecentActivity] = useState<ProgressionActivityItem[]>([]);
  const [lastAttributeChange, setLastAttributeChange] = useState<AttributeChangeNotice | null>(null);
  const activeUserRef = useRef<User | null>(null);

  useEffect(() => {
    activeUserRef.current = user;
  }, [user]);

  // Synchronize the Supabase-authenticated user with our Prisma backend
  const syncWithBackend = useCallback(async () => {
    try {
      const data = await authApi.sync();
      setUser(data.user);
      
      // Fetch full attributes from /api/character if available
      let attrs = data.character.attributes;
      try {
        const fullChar = await characterApi.getCharacter();
        if (fullChar.attributes) {
          attrs = fullChar.attributes;
        }
      } catch {
        // Fallback to sync response
      }

      setCharacter({
        ...data.character,
        attributes: normalizeAttributes(attrs),
      });
      setServerReachable(true);

      // Try to load history
      try {
        const historyData = await characterApi.getHistory();
        if (Array.isArray(historyData) && historyData.length > 0) {
          setRecentActivity(
            historyData.map((item, idx) => ({
              id: item.id || `hist_${idx}`,
              type: (item.type as ProgressionActivityItem['type']) || 'quest_completed',
              title: item.title,
              timestamp: item.timestamp,
              xpGained: item.xpGained,
              goldGained: item.goldGained,
              attributeGained: item.attributeGained,
              levelBefore: item.levelBefore,
              levelAfter: item.levelAfter,
              streakCurrent: item.streakCurrent,
            }))
          );
        }
      } catch {
        // GET /api/character/history may not be implemented yet
      }
    } catch (err: unknown) {
      // 1. If 401 or 403: Server is alive and responsive, but auth token is invalid or expired
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setServerReachable(true);
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore signout errors
        }
        setUser(null);
        setCharacter(null);
        return;
      }

      // 2. For network failure or 5xx, probe actual server health before setting offline
      const isUp = await pingServerHealth();
      setServerReachable(isUp);
    }
  }, []);

  // Synchronizes full character sheet with attributes from GET /api/character
  const refreshCharacter = useCallback(async () => {
    try {
      const charData = await characterApi.getCharacter();
      setCharacter(prev => {
        const normalized = normalizeAttributes(charData.attributes);
        if (!prev) {
          return {
            ...charData,
            attributes: normalized,
          };
        }
        return {
          ...prev,
          level: charData.level ?? prev.level,
          totalXp: charData.totalXp ?? prev.totalXp,
          gold: charData.gold ?? prev.gold,
          streakCurrent: charData.streakCurrent ?? prev.streakCurrent,
          streakBest: charData.streakBest ?? prev.streakBest,
          attributes: normalized,
        };
      });
      setServerReachable(true);
    } catch {
      // If /api/character fails, keep existing character state
    }
  }, []);

  // Refresh session by checking Supabase auth + syncing with backend
  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await syncWithBackend();
    } else {
      setUser(null);
      setCharacter(null);
    }
  }, [syncWithBackend]);

  // Reconciles authoritative rewards and progression returned by completion endpoint
  const reconcileCompletion = useCallback((res: CompleteTaskResponse, taskTitle?: string) => {
    let attrNotice: AttributeChangeNotice | null = null;

    setCharacter(prev => {
      if (!prev) return prev;

      let currentAttrs = normalizeAttributes(prev.attributes);

      // Update attributes if authoritative attribute reward is returned
      if (res.rewards?.attribute) {
        const targetKey = res.rewards.attribute.key.toLowerCase();
        const existingAttr = currentAttrs.find(a => a.key.toLowerCase() === targetKey);
        const prevVal = existingAttr?.value ?? 0;
        const newVal = prevVal + res.rewards.attribute.amount;

        currentAttrs = currentAttrs.map(a =>
          a.key.toLowerCase() === targetKey
            ? { ...a, value: newVal }
            : a
        );

        attrNotice = {
          key: res.rewards.attribute.key,
          amount: res.rewards.attribute.amount,
          prevValue: prevVal,
          newValue: newVal,
          timestamp: Date.now(),
        };
      }

      const updated: Character = {
        ...prev,
        level: res.progression?.levelAfter ?? prev.level,
        totalXp: res.progression?.totalXp ?? (res.rewards?.xp ? prev.totalXp + res.rewards.xp : prev.totalXp),
        gold: res.rewards?.gold ? prev.gold + res.rewards.gold : prev.gold,
        streakCurrent: res.streak?.current ?? prev.streakCurrent,
        streakBest: res.streak?.best ?? prev.streakBest,
        attributes: currentAttrs,
      };
      return updated;
    });

    if (attrNotice) {
      setLastAttributeChange(attrNotice);
    }

    // Update XP progress from server-authoritative progression data
    if (res.progression) {
      setXpProgress({
        currentLevelXp: res.progression.currentLevelXp ?? 0,
        nextLevelXp: res.progression.nextLevelXp ?? 100,
        progressPercent: res.progression.progressPercent ?? 0,
      });
    }

    // Append to recent activity feed
    const activityItem: ProgressionActivityItem = {
      id: `act_${Date.now()}_${res.task.id}`,
      type: (res.progression?.levelAfter && res.progression.levelBefore && res.progression.levelAfter > res.progression.levelBefore)
        ? 'level_up'
        : 'quest_completed',
      title: taskTitle || 'Completed Citadel Quest',
      timestamp: res.task.completedAt || new Date().toISOString(),
      xpGained: res.rewards?.xp,
      goldGained: res.rewards?.gold,
      attributeGained: res.rewards?.attribute,
      levelBefore: res.progression?.levelBefore,
      levelAfter: res.progression?.levelAfter,
      streakCurrent: res.streak?.current,
    };

    setRecentActivity(prev => [activityItem, ...prev].slice(0, 25));
  }, []);

  const clearAttributeChangeNotice = useCallback(() => {
    setLastAttributeChange(null);
  }, []);

  // Reconciles authoritative wallet balance returned by server after purchase
  const reconcilePurchase = useCallback((walletGold: number) => {
    setCharacter(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        gold: walletGold,
      };
    });
  }, []);

  // Probes server reachability on-demand (e.g. from Retry buttons)
  const checkServerReachability = useCallback(async (): Promise<boolean> => {
    const isUp = await pingServerHealth();
    setServerReachable(isUp);
    return isUp;
  }, []);

  // Auto-recovery: if backend was momentarily unreachable/restarting, poll until restored
  useEffect(() => {
    if (serverReachable) return;

    const interval = setInterval(async () => {
      const isUp = await pingServerHealth();
      if (isUp) {
        setServerReachable(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [serverReachable]);

  // Listen for Supabase auth state changes
  useEffect(() => {
    let isMounted = true;

    // Initial session check
    const initAuth = async () => {
      try {
        // Probe backend health to ensure accurate online/offline state
        const isUp = await pingServerHealth();
        if (isMounted) {
          setServerReachable(isUp);
        }

        // Check for local JWT auth token (Magic Link auth)
        const localToken = localStorage.getItem('auth_token');
        if (localToken) {
          try {
            const data = await authApi.getMe();
            if (!isMounted) return;
            setUser(data.user);
            setCharacter({
              ...data.character,
              attributes: normalizeAttributes(data.character.attributes),
            });
            setServerReachable(true);
            setIsLoading(false);
            return;
          } catch {
            localStorage.removeItem('auth_token');
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session) {
          // User is signed in with Supabase — sync with our backend
          await syncWithBackend();
        } else {
          setUser(null);
          setCharacter(null);
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setCharacter(null);
          const isUp = await pingServerHealth();
          setServerReachable(isUp);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initAuth();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session) {
          // Only show the blocking verification screen if user logs in for the 1st time
          // (i.e. no user loaded in memory yet). During live browsing, tab switching or
          // window minimizing will never show the full-screen verifying screen.
          const isInitialLogin = !activeUserRef.current;
          if (isInitialLogin) {
            setIsLoading(true);
          }
          await syncWithBackend();
          if (isInitialLogin) {
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setCharacter(null);
          setXpProgress(null);
          setRecentActivity([]);
          setLastAttributeChange(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token refreshed silently, no action needed
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncWithBackend]);

  // OAuth sign-in: Google
  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app/dashboard`,
      },
    });
    if (error) throw error;
  }, []);

  // OAuth sign-in: GitHub
  const signInWithGithub = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/app/dashboard`,
      },
    });
    if (error) throw error;
  }, []);

  // Sign in as guest — entirely local, no database persistence
  const signInAsGuest = useCallback(() => {
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      email: 'guest@liferpg.local',
      displayName: 'Wandering Traveler',
    };
    const guestCharacter: Character = {
      level: 1,
      totalXp: 0,
      gold: 50,
      streakCurrent: 0,
      streakBest: 0,
      attributes: [...DEFAULT_ATTRIBUTES],
    };
    setUser(guestUser);
    setCharacter(guestCharacter);
    setIsGuest(true);
    setServerReachable(true);
    setIsLoading(false);
  }, []);

  // Sign in with Magic Link
  const signInWithMagicLink = useCallback(async (email: string) => {
    return sendMagicLinkApi(email);
  }, []);

  // Verify Magic Link Token
  const verifyMagicLinkToken = useCallback(async (token: string) => {
    const res = await verifyMagicLinkApi(token);
    localStorage.setItem('auth_token', res.token);
    setUser(res.user);
    try {
      const me = await authApi.getMe();
      setUser(me.user);
      setCharacter({
        ...me.character,
        attributes: normalizeAttributes(me.character.attributes),
      });
    } catch {
      // Me endpoint fallback
    }
    return res;
  }, []);

  // Sign out
  const logout = useCallback(async () => {
    localStorage.removeItem('auth_token');
    if (isGuest) {
      setUser(null);
      setCharacter(null);
      setIsGuest(false);
      setXpProgress(null);
      setRecentActivity([]);
      setLastAttributeChange(null);
      return;
    }
    try {
      await authApi.logout();
    } catch {
      // Backend logout may fail if server is down, that's ok
    }
    await supabase.auth.signOut();
    setUser(null);
    setCharacter(null);
    setXpProgress(null);
    setRecentActivity([]);
    setLastAttributeChange(null);
  }, [isGuest]);

  const isAdmin = Boolean(user && user.role === 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        character,
        isLoading,
        isGuest,
        isAdmin,
        serverReachable,
        xpProgress,
        recentActivity,
        lastAttributeChange,
        checkServerReachability,
        signInWithGoogle,
        signInWithGithub,
        signInWithMagicLink,
        verifyMagicLinkToken,
        signInAsGuest,
        logout,
        refreshSession,
        refreshCharacter,
        reconcileCompletion,
        reconcilePurchase,
        clearAttributeChangeNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
