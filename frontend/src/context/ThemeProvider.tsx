import React, { useState, useEffect, useCallback } from 'react';
import type { Theme } from '../features/themes/types';
import { DEFAULT_THEME } from '../features/themes/types';
import { themeService } from '../services/themeService';
import { ThemeContext } from './themeContextDef';
import { useAuth } from './useAuth';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, character, reconcilePurchase } = useAuth();

  const [activeTheme, setActiveThemeState] = useState<Theme>(DEFAULT_THEME);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [ownedThemeIds, setOwnedThemeIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Apply CSS custom properties to document.documentElement (:root)
  const applyTheme = useCallback((theme: Theme) => {
    if (!theme || !theme.colors) return;
    const root = document.documentElement;
    const { colors } = theme;

    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-surface', colors.surface);
    root.style.setProperty('--theme-surface-hover', colors.surfaceHover);
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-text-muted', colors.textMuted);
    root.style.setProperty('--theme-border', colors.border);

    // Also set data-theme attribute for CSS targeting
    root.setAttribute('data-theme', theme.slug);
  }, []);

  // Set active theme and apply CSS variables
  const setActiveTheme = useCallback(async (theme: Theme) => {
    setActiveThemeState(theme);
    applyTheme(theme);
    await themeService.setActiveTheme(theme.slug, user?.id);
  }, [applyTheme, user?.id]);

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
      setOwnedThemeIds(prev => new Set(prev).add(theme.slug).add(theme.id));
      return { success: true };
    }

    return { success: false, error: res.error || 'Failed to purchase theme.' };
  }, [user, character?.gold, reconcilePurchase]);

  // Equip theme action
  const equipTheme = useCallback(async (theme: Theme) => {
    await setActiveTheme(theme);
  }, [setActiveTheme]);

  const isOwned = useCallback((themeId: string): boolean => {
    return ownedThemeIds.has(themeId);
  }, [ownedThemeIds]);

  const isEquipped = useCallback((themeId: string): boolean => {
    return activeTheme.slug === themeId || activeTheme.id === themeId;
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
