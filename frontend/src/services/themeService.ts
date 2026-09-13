/**
 * Theme Service
 * 
 * Authoritative coordinator for theme catalog, ownership, equipping, and persistence.
 * Synchronizes with Supabase (Theme, UserTheme, ShopItem, InventoryItem), Express shop API,
 * and localStorage for immediate, zero-flash UI updates.
 */
import type { Theme } from '../features/themes/types';
import { ALL_THEMES, DEFAULT_THEME, PREGIVEN_THEME_SLUGS } from '../features/themes/types';
import { supabase } from '../lib/supabase';
import { shopApi } from './api/shop';

const EQUIPPED_THEME_KEY = 'liferpg_active_theme_id';
const OWNED_THEMES_KEY = 'liferpg_owned_themes';

class ThemeService {
  private memoryThemes: Theme[] | null = null;

  /**
   * Fetch all themes from Supabase or fallback catalog.
   */
  async getThemes(): Promise<Theme[]> {
    if (this.memoryThemes && this.memoryThemes.length > 0) {
      return this.memoryThemes;
    }

    try {
      // Query Supabase Theme table
      const { data, error } = await supabase
        .from('Theme')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        // Merge with full catalog to ensure color fidelity and sort orders
        const parsed: Theme[] = ALL_THEMES.map(initTheme => {
          const dbMatch = data.find(row => 
            row.key === initTheme.slug || 
            row.key === initTheme.slug.replace(/-/g, '_') ||
            row.id === initTheme.id
          );

          if (dbMatch) {
            return {
              ...initTheme,
              id: dbMatch.id,
              name: dbMatch.name || initTheme.name,
              description: dbMatch.description || initTheme.description,
              price: typeof dbMatch.price === 'number' ? dbMatch.price : initTheme.price,
              colors: (typeof dbMatch.themeJson === 'object' && dbMatch.themeJson !== null)
                ? (dbMatch.themeJson as any)
                : initTheme.colors,
            };
          }
          return initTheme;
        });

        this.memoryThemes = parsed;
        return parsed;
      }
    } catch {
      // Fall through to ALL_THEMES
    }

    this.memoryThemes = ALL_THEMES;
    return ALL_THEMES;
  }

  /**
   * Fetch IDs of themes owned by the given user across all data layers:
   * 1. Local storage cache (instant)
   * 2. Supabase UserTheme table
   * 3. Supabase InventoryItem table (with ShopItem)
   * 4. Shop backend inventory API
   */
  async getOwnedThemeIds(userId: string): Promise<Set<string>> {
    const owned = new Set<string>();

    // Pre-given free starter themes are unlocked for all players by default
    PREGIVEN_THEME_SLUGS.forEach(slug => owned.add(slug));

    // 0. Load cached owned themes from localStorage for instant display
    try {
      const cached = localStorage.getItem(OWNED_THEMES_KEY);
      if (cached) {
        const arr = JSON.parse(cached);
        if (Array.isArray(arr)) {
          arr.forEach(id => {
            const str = String(id);
            owned.add(str);
            if (str === 'cyberpunk' || str === 'cyberpunk-neon' || str === 'theme_cyberpunk') {
              owned.add('cyberpunk');
              owned.add('cyberpunk-neon');
            }
          });
        }
      }
    } catch {
      // Ignore
    }

    if (!userId) return owned;

    // Helper to map item attributes to theme slugs
    const registerThemeItem = (skuOrKey?: string, name?: string) => {
      const lowerSku = (skuOrKey || '').toLowerCase();
      const lowerName = (name || '').toLowerCase();

      if (lowerSku.includes('cyberpunk') || lowerName.includes('cyberpunk')) {
        owned.add('cyberpunk');
        owned.add('cyberpunk-neon');
      }
      if (lowerSku.includes('matrix') || lowerName.includes('matrix') || lowerSku.includes('dark_matrix') || lowerSku.includes('dark-matrix')) {
        owned.add('dark-matrix');
      }
      if (lowerSku.includes('citadel') || lowerName.includes('citadel') || lowerSku === 'default') {
        owned.add('dark-citadel');
        owned.add('default');
      }
      if (lowerSku.includes('neon-outpost') || lowerSku.includes('neon_outpost') || lowerName.includes('neon outpost')) {
        owned.add('neon-outpost');
        owned.add('neon_outpost');
      }
      if (lowerSku.includes('mystic') || lowerName.includes('mystic')) {
        owned.add('mystic-forest');
        owned.add('mystic_forest');
      }
      if (lowerSku.includes('solaris') || lowerName.includes('solaris')) {
        owned.add('solaris-gold');
        owned.add('solaris_gold');
      }
      if (lowerSku.includes('retro') || lowerName.includes('retro')) {
        owned.add('retro');
      }
      if (lowerSku.includes('lofi') || lowerSku.includes('lo-fi') || lowerName.includes('lofi') || lowerName.includes('lo-fi')) {
        owned.add('lofi');
      }
      if (lowerSku) {
        owned.add(lowerSku);
      }
    };

    // 1. Query Supabase UserTheme table
    try {
      const { data: utData } = await supabase
        .from('UserTheme')
        .select('*, theme:Theme(*)')
        .eq('userId', userId);

      if (Array.isArray(utData)) {
        utData.forEach(row => {
          if (row.theme?.key) {
            registerThemeItem(row.theme.key, row.theme.name);
          }
          if (row.themeId) {
            owned.add(row.themeId);
          }
        });
      }
    } catch {
      // Non-critical
    }

    // 2. Query Supabase InventoryItem table
    try {
      const { data: invData } = await supabase
        .from('InventoryItem')
        .select('*, shopItem:ShopItem(*)')
        .eq('userId', userId);

      if (Array.isArray(invData)) {
        invData.forEach(row => {
          registerThemeItem(row.shopItem?.sku, row.shopItem?.name);
          if (row.shopItemId) owned.add(row.shopItemId);
          if (row.id) owned.add(row.id);
        });
      }
    } catch {
      // Non-critical
    }

    // 3. Query Express backend inventory API
    try {
      const inventory = await shopApi.getInventory();
      if (Array.isArray(inventory)) {
        inventory.forEach(item => {
          const sku = item.shopItem?.sku || item.itemId || item.shopItemId;
          const name = item.shopItem?.name;
          registerThemeItem(sku, name);
        });
      }
    } catch {
      // Fallback
    }

    // Cache refreshed set to localStorage
    try {
      localStorage.setItem(OWNED_THEMES_KEY, JSON.stringify(Array.from(owned)));
    } catch {
      // Ignore
    }

    return owned;
  }

  /**
   * Fetch currently equipped theme ID for user.
   */
  async getActiveThemeId(userId?: string): Promise<string> {
    // 1. Check local storage first for instant zero-flash application
    const cached = localStorage.getItem(EQUIPPED_THEME_KEY);
    if (cached && cached !== 'default') return cached;

    if (!userId) return DEFAULT_THEME.slug;

    // 2. Check Supabase UserTheme equippedAt
    try {
      const { data } = await supabase
        .from('UserTheme')
        .select('*, theme:Theme(*)')
        .eq('userId', userId)
        .not('equippedAt', 'is', null)
        .order('equippedAt', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.theme?.key) {
        const slug = data.theme.key;
        localStorage.setItem(EQUIPPED_THEME_KEY, slug);
        return slug;
      }
    } catch {
      // Ignore
    }

    return cached || DEFAULT_THEME.slug;
  }

  /**
   * Persist active theme locally and in database across Supabase and backend.
   */
  async setActiveTheme(themeId: string, userId?: string): Promise<void> {
    const slug = (themeId || '').toLowerCase().replace(/^theme_/, '').replace(/_/g, '-');
    localStorage.setItem(EQUIPPED_THEME_KEY, slug);

    if (userId) {
      try {
        // Find matching theme in Supabase Theme table
        const { data: t } = await supabase
          .from('Theme')
          .select('id, key')
          .or(`key.eq.${slug},key.eq.${slug.replace(/-/g, '_')},key.eq.cyberpunk`)
          .maybeSingle();

        if (t) {
          // Clear previous equips for this user
          await supabase
            .from('UserTheme')
            .update({ equippedAt: null })
            .eq('userId', userId);

          // Find existing UserTheme row
          const { data: existingUt } = await supabase
            .from('UserTheme')
            .select('id')
            .eq('userId', userId)
            .eq('themeId', t.id)
            .maybeSingle();

          if (existingUt) {
            await supabase
              .from('UserTheme')
              .update({ equippedAt: new Date().toISOString() })
              .eq('id', existingUt.id);
          } else {
            await supabase
              .from('UserTheme')
              .insert({
                id: 'ut_' + Math.random().toString(36).substring(2, 10),
                userId,
                themeId: t.id,
                equippedAt: new Date().toISOString()
              });
          }
        }
      } catch (err) {
        console.warn('Supabase UserTheme equip notice:', err);
      }

      // Also notify backend inventory equip endpoint if reachable
      try {
        const sku = `theme_${slug.replace(/-/g, '_')}`;
        await shopApi.equipItem(sku).catch(() => {});
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Purchase a theme: executes transaction across Supabase and/or backend store.
   */
  async purchaseTheme(theme: Theme, currentGold: number, userId?: string): Promise<{ success: boolean; newGold?: number; error?: string }> {
    if (!userId) {
      return { success: false, error: 'Authentication required to purchase themes.' };
    }

    if (currentGold < theme.price) {
      return { success: false, error: 'Not enough Gold.' };
    }

    // 1. Direct Supabase purchase handling
    try {
      // Find theme in Supabase
      const { data: dbTheme } = await supabase
        .from('Theme')
        .select('id')
        .or(`key.eq.${theme.slug},key.eq.${theme.slug.replace(/-/g, '_')}`)
        .maybeSingle();

      if (dbTheme) {
        // Check if already in UserTheme
        const { data: existingUt } = await supabase
          .from('UserTheme')
          .select('id')
          .eq('userId', userId)
          .eq('themeId', dbTheme.id)
          .maybeSingle();

        if (!existingUt) {
          // Insert UserTheme
          await supabase.from('UserTheme').insert({
            id: 'ut_' + Math.random().toString(36).substring(2, 10),
            userId,
            themeId: dbTheme.id,
            equippedAt: null,
          });

          // Deduct gold on character if table exists
          const newGold = Math.max(0, currentGold - theme.price);
          try {
            await supabase
              .from('Character')
              .update({ gold: newGold })
              .eq('userId', userId);
          } catch {
            // Ignore
          }

          // Cache ownership locally
          try {
            const cached = localStorage.getItem(OWNED_THEMES_KEY);
            const arr = cached ? JSON.parse(cached) : [];
            const set = new Set(Array.isArray(arr) ? arr : []);
            set.add(theme.slug);
            set.add(theme.id);
            if (theme.slug.includes('cyberpunk')) {
              set.add('cyberpunk');
              set.add('cyberpunk-neon');
            }
            localStorage.setItem(OWNED_THEMES_KEY, JSON.stringify(Array.from(set)));
          } catch {
            // Ignore
          }

          return { success: true, newGold };
        }
      }
    } catch (supaErr) {
      console.warn('Direct Supabase purchase fallback to store API:', supaErr);
    }

    // 2. Store API purchase fallback
    try {
      const sku = `theme_${theme.slug.replace(/-/g, '_')}`;
      const res = await shopApi.purchaseItem(sku);
      const newGold = res.wallet?.gold ?? (currentGold - theme.price);

      // Cache ownership locally
      try {
        const cached = localStorage.getItem(OWNED_THEMES_KEY);
        const arr = cached ? JSON.parse(cached) : [];
        const set = new Set(Array.isArray(arr) ? arr : []);
        set.add(theme.slug);
        set.add(theme.id);
        if (theme.slug.includes('cyberpunk')) {
          set.add('cyberpunk');
          set.add('cyberpunk-neon');
        }
        localStorage.setItem(OWNED_THEMES_KEY, JSON.stringify(Array.from(set)));
      } catch {
        // Ignore
      }

      return { success: true, newGold };
    } catch (err: any) {
      const msg = err?.message || 'Failed to purchase theme.';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('owned')) {
        return { success: false, error: 'You already own this theme.' };
      }
      if (msg.toLowerCase().includes('gold') || msg.toLowerCase().includes('funds')) {
        return { success: false, error: 'Not enough Gold.' };
      }
      return { success: false, error: msg };
    }
  }
}

export const themeService = new ThemeService();
