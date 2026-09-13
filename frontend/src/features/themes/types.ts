/**
 * Theme & Color Specification Types
 * 
 * Strict specifications for Theme Marketplace, Theme Collection,
 * Settings HUD customizer, and global CSS custom properties.
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
  is_pregiven?: boolean;
  created_at?: string;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
}

/**
 * Pre-given starter theme slugs that all players receive free of charge.
 */
export const PREGIVEN_THEME_SLUGS = [
  'dark-citadel',
  'default',
  'neon-outpost',
  'neon_outpost',
  'mystic-forest',
  'mystic_forest',
  'solaris-gold',
  'solaris_gold',
] as const;

/**
 * 4 Pre-Given Free Themes (Dark Citadel, Neon Outpost, Mystic Forest, Solaris Gold)
 * Free and unlocked for all players immediately upon arrival in the Citadel.
 */
export const PREGIVEN_THEMES: Theme[] = [
  {
    id: 'dark-citadel',
    slug: 'dark-citadel',
    name: 'Dark Citadel',
    description: 'Midnight obsidian with sky-blue tactical HUD (Default Realm Theme)',
    rarity: 'common',
    price: 0,
    is_pregiven: true,
    colors: {
      background: '#090C10',
      surface: '#0F141C',
      surfaceHover: '#161D28',
      primary: '#38BDF8',
      secondary: '#818CF8',
      text: '#F8FAFC',
      textMuted: '#94A3B8',
      border: '#232E3E',
    },
    sort_order: 1,
    is_active: true,
    is_featured: true,
  },
  {
    id: 'neon-outpost',
    slug: 'neon-outpost',
    name: 'Neon Outpost',
    description: 'Deep cyber-void with electric fuchsia and cyan accents',
    rarity: 'uncommon',
    price: 0,
    is_pregiven: true,
    colors: {
      background: '#07070F',
      surface: '#120F24',
      surfaceHover: '#1A1636',
      primary: '#06B6D4',
      secondary: '#D946EF',
      text: '#F8FAFC',
      textMuted: '#9D98BA',
      border: '#312752',
    },
    sort_order: 2,
    is_active: true,
    is_featured: true,
  },
  {
    id: 'mystic-forest',
    slug: 'mystic-forest',
    name: 'Mystic Forest',
    description: 'Dark emerald grove with ancient glowing runes',
    rarity: 'uncommon',
    price: 0,
    is_pregiven: true,
    colors: {
      background: '#07100B',
      surface: '#0E1D15',
      surfaceHover: '#152C20',
      primary: '#10B981',
      secondary: '#34D399',
      text: '#ECFDF5',
      textMuted: '#86A395',
      border: '#204230',
    },
    sort_order: 3,
    is_active: true,
    is_featured: true,
  },
  {
    id: 'solaris-gold',
    slug: 'solaris-gold',
    name: 'Solaris Gold',
    description: 'Celestial warmth with golden amber and solar radiance',
    rarity: 'rare',
    price: 0,
    is_pregiven: true,
    colors: {
      background: '#100D0A',
      surface: '#1B1611',
      surfaceHover: '#292119',
      primary: '#F59E0B',
      secondary: '#FB923C',
      text: '#FFFBEB',
      textMuted: '#A89886',
      border: '#483928',
    },
    sort_order: 4,
    is_active: true,
    is_featured: true,
  },
];

/**
 * 5 Initial Unlockable Themes specified by test contract:
 * - Dark Matrix Theme (common, 50 gold)
 * - Cyberpunk Theme (common, 50 gold)
 * - Retro Theme (uncommon, 150 gold)
 * - Lo-Fi Theme (uncommon, 200 gold)
 * - Cyberpunk Neon (rare, 250 gold)
 */
export const INITIAL_THEMES: Theme[] = [
  {
    id: 'dark-matrix',
    slug: 'dark-matrix',
    name: 'Dark Matrix Theme',
    description: 'Terminal aesthetics with matrix green phosphor glow',
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
    description: 'Neon-soaked dystopian interface with glitch effects',
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
 * Default fallback theme: Dark Matrix Theme (meets test suite requirement)
 */
export const DEFAULT_THEME: Theme = INITIAL_THEMES[0];

/**
 * Full combined theme catalog available in Marketplace and Vault (4 pre-given + 5 initial unlockables)
 */
export const ALL_THEMES: Theme[] = [...PREGIVEN_THEMES, ...INITIAL_THEMES];
