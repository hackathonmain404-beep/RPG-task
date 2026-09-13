import { createContext } from 'react';
import type { Theme } from '../features/themes/types';

export interface ThemeContextType {
  activeTheme: Theme;
  themes: Theme[];
  ownedThemeIds: Set<string>;
  isLoading: boolean;
  error: string | null;
  setActiveTheme: (theme: Theme) => Promise<void>;
  applyTheme: (theme: Theme) => void;
  purchaseTheme: (theme: Theme) => Promise<{ success: boolean; error?: string }>;
  equipTheme: (theme: Theme) => Promise<void>;
  isOwned: (themeId: string) => boolean;
  isEquipped: (themeId: string) => boolean;
  refreshThemes: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
