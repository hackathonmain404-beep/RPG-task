import React, { useEffect, useState, useCallback } from 'react';
import type { 
  User, 
  Character, 
  LoginRequest, 
  RegisterRequest, 
  CompleteTaskResponse, 
  Attribute 
} from '../types/contract';
import type { 
  XpProgress, 
  ProgressionActivityItem, 
  AttributeChangeNotice 
} from './authContextDef';
import { ApiError } from '../types/contract';
import { authApi } from '../services/api/auth';
import { characterApi } from '../services/api/character';
import { AuthContext } from './authContextDef';

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
  const [serverReachable, setServerReachable] = useState<boolean>(true);
  const [xpProgress, setXpProgress] = useState<XpProgress | null>(null);
  const [recentActivity, setRecentActivity] = useState<ProgressionActivityItem[]>([]);
  const [lastAttributeChange, setLastAttributeChange] = useState<AttributeChangeNotice | null>(null);

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

  // Authenticate session from backend on initial mount
  const refreshSession = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      setUser(data.user);
      
      // Fetch full attributes from /api/character if available
      let attrs = data.character.attributes;
      try {
        const fullChar = await characterApi.getCharacter();
        if (fullChar.attributes) {
          attrs = fullChar.attributes;
        }
      } catch {
        // Fallback to data.character
      }

      setCharacter({
        ...data.character,
        attributes: normalizeAttributes(attrs),
      });
      setServerReachable(true);

      // Attempt to load server history if available
      try {
        const historyData = await characterApi.getHistory();
        if (Array.isArray(historyData) && historyData.length > 0) {
          setRecentActivity(
            historyData.map((item, idx) => ({
              id: item.id || `hist_${idx}`,
              type: (item.type as any) || 'quest_completed',
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
        // GET /api/character/history may not be implemented yet in backend
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setUser(null);
          setCharacter(null);
          setServerReachable(true);
        } else if (err.code === 'NETWORK_ERROR' || err.status === 0) {
          setUser(null);
          setCharacter(null);
          setServerReachable(false);
        } else {
          setUser(null);
          setCharacter(null);
        }
      } else {
        setUser(null);
        setCharacter(null);
        setServerReachable(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const data = await authApi.getMe();
        if (!isMounted) return;

        setUser(data.user);
        
        let attrs = data.character.attributes;
        try {
          const fullChar = await characterApi.getCharacter();
          if (fullChar.attributes) {
            attrs = fullChar.attributes;
          }
        } catch {
          // Fallback to data.character
        }

        if (isMounted) {
          setCharacter({
            ...data.character,
            attributes: normalizeAttributes(attrs),
          });
          setServerReachable(true);
        }

        // Try to load history
        try {
          const historyData = await characterApi.getHistory();
          if (isMounted && Array.isArray(historyData) && historyData.length > 0) {
            setRecentActivity(
              historyData.map((item, idx) => ({
                id: item.id || `hist_${idx}`,
                type: (item.type as any) || 'quest_completed',
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
          // Endpoint might not exist yet
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiError && err.status === 401) {
            setUser(null);
            setCharacter(null);
            setServerReachable(true);
          } else {
            setUser(null);
            setCharacter(null);
            setServerReachable(false);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    void initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    
    let attrs = data.character.attributes;
    try {
      const fullChar = await characterApi.getCharacter();
      if (fullChar.attributes) {
        attrs = fullChar.attributes;
      }
    } catch {
      // Fallback
    }

    setCharacter({
      ...data.character,
      attributes: normalizeAttributes(attrs),
    });
    setServerReachable(true);
  };

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    setUser(res.user);
    setCharacter({
      ...res.character,
      attributes: normalizeAttributes(res.character.attributes),
    });
    setServerReachable(true);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setCharacter(null);
      setXpProgress(null);
      setRecentActivity([]);
      setLastAttributeChange(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        character,
        isLoading,
        serverReachable,
        xpProgress,
        recentActivity,
        lastAttributeChange,
        login,
        register,
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

