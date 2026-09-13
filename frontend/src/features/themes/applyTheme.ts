import type { Theme } from './types';
import { INITIAL_THEMES, DEFAULT_THEME } from './types';

/**
 * Applies theme CSS variables to document.documentElement (:root) and body.
 * Updates both the theme-specific variables and the core Life RPG layout variables,
 * ensuring the entire web application (background, cards, borders, text, and accents)
 * immediately reflects the active theme.
 */
export function applyThemeColors(themeOrSlug: Theme | string) {
  let theme: Theme | undefined;

  if (typeof themeOrSlug === 'string') {
    const raw = themeOrSlug.toLowerCase();
    const clean = raw.replace(/^theme_/, '').replace(/_/g, '-').trim();

    if (clean.includes('cyberpunk-neon') || clean.includes('cyberpunk_neon')) {
      theme = INITIAL_THEMES.find(t => t.slug === 'cyberpunk-neon');
    } else if (clean.includes('cyberpunk')) {
      theme = INITIAL_THEMES.find(t => t.slug === 'cyberpunk') || INITIAL_THEMES.find(t => t.slug === 'cyberpunk-neon');
    } else if (clean.includes('matrix') || clean.includes('dark-matrix') || clean.includes('dark_matrix')) {
      theme = INITIAL_THEMES.find(t => t.slug === 'dark-matrix');
    } else if (clean.includes('retro')) {
      theme = INITIAL_THEMES.find(t => t.slug === 'retro');
    } else if (clean.includes('lofi') || clean.includes('lo-fi')) {
      theme = INITIAL_THEMES.find(t => t.slug === 'lofi');
    } else {
      theme = INITIAL_THEMES.find(t => t.slug === clean || t.id === clean) ||
              INITIAL_THEMES.find(t => t.name.toLowerCase() === raw) ||
              DEFAULT_THEME;
    }
  } else {
    theme = themeOrSlug;
  }

  if (!theme || !theme.colors) return;
  const root = document.documentElement;
  const { colors } = theme;

  // 1. Theme-specific variables
  root.style.setProperty('--theme-background', colors.background);
  root.style.setProperty('--theme-surface', colors.surface);
  root.style.setProperty('--theme-surface-hover', colors.surfaceHover);
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-secondary', colors.secondary);
  root.style.setProperty('--theme-text', colors.text);
  root.style.setProperty('--theme-text-muted', colors.textMuted);
  root.style.setProperty('--theme-border', colors.border);

  // 2. Core application design system variables used by index.css, AppShell, Shop, Quests, Dashboard
  root.style.setProperty('--bg-canvas', colors.background);
  root.style.setProperty('--bg-surface', colors.surface);
  root.style.setProperty('--bg-surface-elevated', colors.surfaceHover);
  root.style.setProperty('--bg-surface-sunken', colors.background);
  root.style.setProperty('--border-subtle', colors.border);
  root.style.setProperty('--border-strong', `${colors.primary}45`);
  root.style.setProperty('--border-focus', colors.primary);
  root.style.setProperty('--text-primary', colors.text);
  root.style.setProperty('--text-secondary', colors.textMuted);
  root.style.setProperty('--color-xp', colors.primary);
  root.style.setProperty('--color-xp-bg', `${colors.primary}25`);
  root.style.setProperty('--glow-xp', `0 0 16px ${colors.primary}45`);
  root.style.setProperty('--color-gold', colors.secondary);

  // 3. Set data-theme on root AND body
  root.setAttribute('data-theme', theme.slug);
  if (typeof document !== 'undefined' && document.body) {
    document.body.setAttribute('data-theme', theme.slug);
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.text;
  }

  // 4. Save to local storage for persistence across reloads
  try {
    localStorage.setItem('liferpg_active_theme_id', theme.slug);
  } catch {
    // Ignore storage quota errors
  }
}
