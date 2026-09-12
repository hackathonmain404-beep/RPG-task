/**
 * Rarity System Configuration
 * 
 * Strict separation: The rarity configuration controls the item badge presentation,
 * while the theme palette controls application colors.
 */
import type { RarityTier } from './types';

export interface RarityConfig {
  text: string;
  border: string;
  bg?: string;
  label: string;
}

export const RARITY_CONFIG: Record<RarityTier, RarityConfig> = {
  common: {
    text: '#9CA3AF',
    border: '#4B5563',
    bg: 'rgba(75, 85, 99, 0.15)',
    label: 'COMMON',
  },
  uncommon: {
    text: '#10B981',
    border: '#059669',
    bg: 'rgba(16, 185, 129, 0.15)',
    label: 'UNCOMMON',
  },
  rare: {
    text: '#00BFFF',
    border: '#0088CC',
    bg: 'rgba(0, 191, 255, 0.15)',
    label: 'RARE',
  },
  epic: {
    text: '#A855F7',
    border: '#7E22CE',
    bg: 'rgba(168, 85, 247, 0.15)',
    label: 'EPIC',
  },
  legendary: {
    text: '#F59E0B',
    border: '#D97706',
    bg: 'rgba(245, 158, 11, 0.15)',
    label: 'LEGENDARY',
  },
};

export function getRarityConfig(rarity: string): RarityConfig {
  const normalized = (rarity || 'common').toLowerCase() as RarityTier;
  return RARITY_CONFIG[normalized] || RARITY_CONFIG.common;
}
