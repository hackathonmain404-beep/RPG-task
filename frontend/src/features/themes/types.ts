/**
 * Theme & Color Specification Types
 * 
 * Strict specifications for Theme Marketplace, Theme Collection,
 * and global CSS custom properties.
 */

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  primary: string;
  secondary: string;
  text: string;
  textMuted: string;
  border: string;
}

export type RarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Theme {
  id: string;
  slug: string;
  name: string;
  description: string;
  rarity: RarityTier;
  price: number;
  colors: ThemeColors;
  created_at?: string;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
}

/**
 * 5 Initial Themes as defined in specification.
 * Cyberpunk Theme (Common) and Cyberpunk Neon (Rare) are strictly separated.
 */
export const INITIAL_THEMES: Theme[] = [
  {
    id: 'dark-matrix',
    slug: 'dark-matrix',
    name: 'Dark Matrix Theme',
    description: 'A test theme',
    rarity: 'common',
    price: 50,
    colors: {
      background: '#070B12',
      surface: '#0F1722',
      surfaceHover: '#151F2E',
      primary: '#00FF9C',
      secondary: '#00C77A',
      text: '#E5E7EB',
      textMuted: '#8994A5',
      border: '#263244',
    },
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'cyberpunk',
    slug: 'cyberpunk',
    name: 'Cyberpunk Theme',
    description: 'Another test theme',
    rarity: 'common',
    price: 50,
    colors: {
      background: '#090516',
      surface: '#11101F',
      surfaceHover: '#1B1630',
      primary: '#FF2BD6',
      secondary: '#8B5CF6',
      text: '#F5F3FF',
      textMuted: '#9D94B5',
      border: '#3B315C',
    },
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'retro',
    slug: 'retro',
    name: 'Retro Theme',
    description: 'Pixel-art inspired classic gaming interface',
    rarity: 'uncommon',
    price: 150,
    colors: {
      background: '#171322',
      surface: '#211B32',
      surfaceHover: '#2C2342',
      primary: '#FFD21F',
      secondary: '#FF8A00',
      text: '#FFF7D6',
      textMuted: '#A99DB8',
      border: '#514466',
    },
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'lofi',
    slug: 'lofi',
    name: 'Lo-Fi Theme',
    description: 'Calm pastel aesthetic with smooth animations',
    rarity: 'uncommon',
    price: 200,
    colors: {
      background: '#17131F',
      surface: '#242033',
      surfaceHover: '#302940',
      primary: '#D78BCB',
      secondary: '#9F7AEA',
      text: '#F2EAF4',
      textMuted: '#A99CAF',
      border: '#594C68',
    },
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'cyberpunk-neon',
    slug: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Neon-soaked dystopian interface with glitch effects',
    rarity: 'rare',
    price: 250,
    colors: {
      background: '#080312',
      surface: '#130A24',
      surfaceHover: '#201039',
      primary: '#00D9FF',
      secondary: '#FF2BD6',
      text: '#F5F3FF',
      textMuted: '#A49BB8',
      border: '#245A78',
    },
    sort_order: 5,
    is_active: true,
  },
];

/**
 * Default fallback theme: Dark Matrix Theme
 * Used when logged out, unequipped, or if loading fails.
 */
export const DEFAULT_THEME: Theme = INITIAL_THEMES[0];
