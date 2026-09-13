import React, { useState, useEffect, useCallback } from 'react';
import type { Theme } from '../features/themes/types';
import { DEFAULT_THEME, ALL_THEMES, PREGIVEN_THEME_SLUGS } from '../features/themes/types';
import { themeService } from '../services/themeService';
import { applyThemeColors } from '../features/themes/applyTheme';
import { ThemeContext } from './themeContextDef';
import { useAuth } from './useAuth';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, character, reconcilePurchase } = useAuth();

  const [activeTheme, setActiveThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('liferpg_active_theme_id');
      if (saved) {
        const clean = saved.toLowerCase().replace(/^theme_/, '').replace(/_/g, '-');
        const found = ALL_THEMES.find(t => t.slug === clean || t.id === clean);
        if (found) {
          applyThemeColors(found);
          return found;
        }
      }
    } catch {
      // Ignore
    }
    applyThemeColors(DEFAULT_THEME);
    return DEFAULT_THEME;
  });
  const [themes, setThemes] = useState<Theme[]>(ALL_THEMES);
  const [ownedThemeIds, setOwnedThemeIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Apply CSS custom properties to document.documentElement (:root)
  const applyTheme = useCallback((theme: Theme) => {
    applyThemeColors(theme);
  }, []);

  // Set active theme and apply CSS variables
  const setActiveTheme = useCallback(async (theme: Theme) => {
    setActiveThemeState(theme);
    applyThemeColors(theme);
    await themeService.setActiveTheme(theme.slug, user?.id);
    window.dispatchEvent(new CustomEvent('liferpg-theme-changed', { detail: { themeSlug: theme.slug } }));
  }, [user?.id]);

  // Load catalog and user ownership
  const refreshThemes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedThemes = await themeService.getThemes();
      setThemes(fetchedThemes);

      if (user?.id) {
        const owned = await themeService.getOwnedThemeIds(user.id);
        setOwnedThemeIds(owned);

        const activeId = await themeService.getActiveThemeId(user.id);
        const match = fetchedThemes.find(t => t.slug === activeId || t.id === activeId);
        if (match) {
          setActiveThemeState(match);
          applyTheme(match);
        } else {
          setActiveThemeState(DEFAULT_THEME);
          applyTheme(DEFAULT_THEME);
        }
      } else {
        setOwnedThemeIds(new Set());
        // For guest/logged-out users, check cached theme or use default
        const activeId = await themeService.getActiveThemeId();
        const match = fetchedThemes.find(t => t.slug === activeId || t.id === activeId);
        const selected = match || DEFAULT_THEME;
        setActiveThemeState(selected);
        applyTheme(selected);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load themes.');
      setActiveThemeState(DEFAULT_THEME);
      applyTheme(DEFAULT_THEME);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, applyTheme]);

  // Initial load & user session change
  useEffect(() => {
    void refreshThemes();
  }, [refreshThemes]);

  // Listen to cross-component theme events (e.g. equipping/purchasing from Shop/Armory)
  useEffect(() => {
    const onThemeChange = (e: Event) => {
      const detail = (e as CustomEvent<{ themeSlug: string }>).detail;
      if (detail?.themeSlug) {
        const clean = detail.themeSlug.toLowerCase().replace(/^theme_/, '').replace(/_/g, '-');
        const found = themes.find(t => t.slug === clean || t.id === clean || t.name.toLowerCase().includes(clean));
        if (found) {
          setActiveThemeState(found);
          applyThemeColors(found);
        } else {
          applyThemeColors(detail.themeSlug);
        }
      }
    };

    const onThemePurchased = (e: Event) => {
      const detail = (e as CustomEvent<{ themeSlug: string }>).detail;
      if (detail?.themeSlug) {
        const clean = detail.themeSlug.toLowerCase().replace(/^theme_/, '').replace(/_/g, '-');
        setOwnedThemeIds(prev => {
          const next = new Set(prev);
          next.add(clean);
          next.add(detail.themeSlug);
          if (clean.includes('cyberpunk')) {
            next.add('cyberpunk');
            next.add('cyberpunk-neon');
          }
          return next;
        });
      }
    };

    window.addEventListener('liferpg-theme-changed', onThemeChange);
    window.addEventListener('liferpg-theme-purchased', onThemePurchased);
    return () => {
      window.removeEventListener('liferpg-theme-changed', onThemeChange);
      window.removeEventListener('liferpg-theme-purchased', onThemePurchased);
    };
  }, [themes]);

  // Purchase theme action
  const purchaseTheme = useCallback(async (theme: Theme): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Please log in to acquire themes.' };
    }

    const currentGold = character?.gold ?? 0;
    const res = await themeService.purchaseTheme(theme, currentGold, user.id);

    if (res.success) {
      if (typeof res.newGold === 'number') {
        reconcilePurchase(res.newGold);
      }
      setOwnedThemeIds(prev => {
        const next = new Set(prev);
        next.add(theme.slug);
        next.add(theme.id);
        if (theme.slug.includes('cyberpunk')) {
          next.add('cyberpunk');
          next.add('cyberpunk-neon');
        }
        return next;
      });
      window.dispatchEvent(new CustomEvent('liferpg-theme-purchased', { detail: { themeSlug: theme.slug } }));
      return { success: true };
    }

    return { success: false, error: res.error || 'Failed to purchase theme.' };
  }, [user, character?.gold, reconcilePurchase]);

  // Equip theme action
  const equipTheme = useCallback(async (theme: Theme) => {
    await setActiveTheme(theme);
  }, [setActiveTheme]);

  const isOwned = useCallback((themeId: string): boolean => {
    const clean = (themeId || '').toLowerCase().replace(/^theme_/, '').replace(/_/g, '-');
    if ((PREGIVEN_THEME_SLUGS as readonly string[]).includes(clean) || (PREGIVEN_THEME_SLUGS as readonly string[]).includes(themeId)) {
      return true;
    }
    if (ownedThemeIds.has(clean) || ownedThemeIds.has(themeId)) return true;
    if ((clean === 'cyberpunk' || clean === 'cyberpunk-neon') && (ownedThemeIds.has('cyberpunk') || ownedThemeIds.has('cyberpunk-neon') || ownedThemeIds.has('theme_cyberpunk'))) {
      return true;
    }
    return false;
  }, [ownedThemeIds]);

  const isEquipped = useCallback((themeId: string): boolean => {
    const clean = (themeId || '').toLowerCase().replace(/^theme_/, '').replace(/_/g, '-');
    if (activeTheme.slug === clean || activeTheme.id === clean || activeTheme.slug === themeId || activeTheme.id === themeId) {
      return true;
    }
    if ((clean === 'dark-citadel' || clean === 'default') && (activeTheme.slug === 'dark-citadel' || activeTheme.slug === 'default')) {
      return true;
    }
    if ((clean === 'neon-outpost' || clean === 'neon_outpost') && (activeTheme.slug === 'neon-outpost' || activeTheme.slug === 'neon_outpost')) {
      return true;
    }
    if ((clean === 'mystic-forest' || clean === 'mystic_forest') && (activeTheme.slug === 'mystic-forest' || activeTheme.slug === 'mystic_forest')) {
      return true;
    }
    if ((clean === 'solaris-gold' || clean === 'solaris_gold') && (activeTheme.slug === 'solaris-gold' || activeTheme.slug === 'solaris_gold')) {
      return true;
    }
    if ((clean === 'cyberpunk' || clean === 'cyberpunk-neon') && (activeTheme.slug === 'cyberpunk' || activeTheme.slug === 'cyberpunk-neon')) {
      return true;
    }
    return false;
  }, [activeTheme]);

  return (
    <ThemeContext.Provider
      value={{
        activeTheme,
        themes,
        ownedThemeIds,
        isLoading,
        error,
        setActiveTheme,
        applyTheme,
        purchaseTheme,
        equipTheme,
        isOwned,
        isEquipped,
        refreshThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
