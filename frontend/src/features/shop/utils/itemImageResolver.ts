import type { ShopItem } from '../../../types/contract';

const KNOWN_PROJECT_ASSETS: Record<string, string> = {
  theme_cyberpunk: '/assets/items/theme_cyberpunk.svg',
  theme_lofi: '/assets/items/theme_lofi.svg',
  theme_retro: '/assets/items/theme_retro.svg',
  frame_golden: '/assets/items/frame_golden.svg',
  badge_shadow: '/assets/items/badge_shadow.svg',
  avatar_phoenix: '/assets/items/avatar_phoenix.svg',
  avatar_cyber_ninja: '/assets/items/avatar_cyber_ninja.svg',
  avatar_void_knight: '/assets/items/avatar_void_knight.svg',
  avatar_arcane_mage: '/assets/items/avatar_arcane_mage.svg',
  avatar_celestial_valkyrie: '/assets/items/avatar_celestial_valkyrie.svg',
  avatar_iron_sentinel: '/assets/items/avatar_iron_sentinel.svg',
  theme_neon: '/assets/items/theme_neon.svg',
  'thm-neon-01': '/assets/items/theme_neon.svg',
  theme_mystic: '/assets/items/theme_mystic.svg',
  'thm-myst-01': '/assets/items/theme_mystic.svg',
  frame_bastion: '/assets/items/frame_bastion.svg',
  'frm-bast-01': '/assets/items/frame_bastion.svg',
  security_test_theme_1: '/assets/items/theme_cyberpunk.svg',
  security_test_theme_2: '/assets/items/theme_cyberpunk.svg',
  luxury_crown: '/assets/items/frame_golden.svg',
};

/**
 * Dynamically resolves the authentic image URL for a shop item.
 * 
 * Precedence:
 * 1. Explicit item image properties (imageUrl, image, assetPath, iconUrl, icon)
 * 2. Parsed metadataJson fields (imageUrl, image, assetPath, iconUrl, icon)
 * 3. Matching project asset based on SKU, ID, or item attributes
 * 4. Returns null if genuinely no image exists (triggering fallback)
 */
export function resolveItemImageUrl(item?: ShopItem | null): string | null {
  if (!item) return null;

  // 1. Direct item properties
  const anyItem = item as unknown as Record<string, unknown>;
  const directFields = ['imageUrl', 'image', 'assetPath', 'iconUrl', 'icon'];
  for (const field of directFields) {
    const val = anyItem[field];
    if (typeof val === 'string' && val.trim()) {
      return val.trim();
    }
  }

  // 2. metadataJson property (object or stringified JSON)
  if (item.metadataJson) {
    let meta: Record<string, unknown> | null = null;
    if (typeof item.metadataJson === 'object') {
      meta = item.metadataJson as Record<string, unknown>;
    } else if (typeof item.metadataJson === 'string') {
      try {
        meta = JSON.parse(item.metadataJson);
      } catch {
        meta = null;
      }
    }

    if (meta && typeof meta === 'object') {
      for (const field of directFields) {
        const val = meta[field];
        if (typeof val === 'string' && val.trim()) {
          return val.trim();
        }
      }
    }
  }

  // 3. Match from project item assets using SKU or ID
  const sku = (item.sku || '').toLowerCase().trim();
  const id = (item.id || '').toLowerCase().trim();
  const name = (item.name || '').toLowerCase().trim();

  if (sku && KNOWN_PROJECT_ASSETS[sku]) {
    return KNOWN_PROJECT_ASSETS[sku];
  }
  if (id && KNOWN_PROJECT_ASSETS[id]) {
    return KNOWN_PROJECT_ASSETS[id];
  }

  // Check matching prefixes or normalized identifiers
  for (const [key, assetPath] of Object.entries(KNOWN_PROJECT_ASSETS)) {
    if (sku && (sku.includes(key) || key.includes(sku))) {
      return assetPath;
    }
    if (id && (id.includes(key) || key.includes(id))) {
      return assetPath;
    }
  }

  // Check item name hints if SKU/ID are opaque (e.g. CUIDs)
  if (name.includes('cyberpunk')) return KNOWN_PROJECT_ASSETS.theme_cyberpunk;
  if (name.includes('lo-fi') || name.includes('lofi')) return KNOWN_PROJECT_ASSETS.theme_lofi;
  if (name.includes('retro')) return KNOWN_PROJECT_ASSETS.theme_retro;
  if (name.includes('golden') || name.includes('gold frame')) return KNOWN_PROJECT_ASSETS.frame_golden;
  if (name.includes('shadow badge') || name.includes('shadow')) return KNOWN_PROJECT_ASSETS.badge_shadow;
  if (name.includes('phoenix')) return KNOWN_PROJECT_ASSETS.avatar_phoenix;
  if (name.includes('neon')) return KNOWN_PROJECT_ASSETS.theme_neon;
  if (name.includes('mystic')) return KNOWN_PROJECT_ASSETS.theme_mystic;
  if (name.includes('bastion')) return KNOWN_PROJECT_ASSETS.frame_bastion;

  return null;
}
