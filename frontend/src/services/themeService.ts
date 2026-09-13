/**
 * Theme Service
 * 
 * Handles theme fetching, caching, ownership, purchasing, and equipping.
 * Coordinates with Supabase and shop API with robust offline / seed fallback.
 */
import type { Theme } from '../features/themes/types';
import { INITIAL_THEMES, DEFAULT_THEME } from '../features/themes/types';
import { supabase } from '../lib/supabase';
import { shopApi } from './api/shop';

const EQUIPPED_THEME_KEY = 'liferpg_active_theme_id';

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
      // 1. Try Supabase query
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const parsed: Theme[] = data.map(row => ({
          id: row.slug || row.id,
          slug: row.slug || row.id,
          name: row.name,
          description: row.description || '',
          rarity: (row.rarity || 'common').toLowerCase() as any,
          price: typeof row.price === 'number' ? row.price : 50,
          colors: typeof row.colors === 'object' && row.colors !== null ? row.colors : DEFAULT_THEME.colors,
          is_active: row.is_active ?? true,
          is_featured: row.is_featured ?? false,
          sort_order: row.sort_order ?? 0,
        }));
        this.memoryThemes = parsed;
        return parsed;
      }
    } catch {
      // Supabase query failed or table not found, fallback to initial seed catalog
    }

    // 2. Fallback to INITIAL_THEMES
    this.memoryThemes = INITIAL_THEMES;
    return INITIAL_THEMES;
  }

  /**
   * Fetch IDs of themes owned by the given user.
   */
  async getOwnedThemeIds(userId: string): Promise<Set<string>> {
    const owned = new Set<string>();

    if (!userId) return owned;

    // 1. Check Supabase user_themes if available
    try {
      const { data, error } = await supabase
        .from('user_themes')
        .select('theme_id')
        .eq('user_id', userId);

      if (!error && Array.isArray(data)) {
        data.forEach(row => {
          if (row.theme_id) owned.add(String(row.theme_id));
        });
      }
    } catch {
      // Table may not exist yet
    }

    // 2. Cross-reference with standard store inventory
    try {
      const inventory = await shopApi.getInventory();
      if (Array.isArray(inventory)) {
        inventory.forEach(item => {
          const sku = item.shopItem?.sku || item.itemId || item.shopItemId || '';
          if (sku.startsWith('theme_')) {
            const cleanSlug = sku.replace('theme_', '').replace(/_/g, '-');
            owned.add(cleanSlug);
            // Also map standard names
            if (cleanSlug === 'cyberpunk') owned.add('cyberpunk');
            if (cleanSlug === 'cyberpunk-neon') owned.add('cyberpunk-neon');
            if (cleanSlug === 'dark-matrix') owned.add('dark-matrix');
            if (cleanSlug === 'retro') owned.add('retro');
            if (cleanSlug === 'lofi') owned.add('lofi');
          }
        });
      }
    } catch {
      // Fallback
    }

    return owned;
  }

  /**
   * Fetch currently equipped theme ID for user.
   */
  async getActiveThemeId(userId?: string): Promise<string> {
    // 1. Check local storage first for instant zero-flash application
    const cached = localStorage.getItem(EQUIPPED_THEME_KEY);
    if (cached) return cached;

    if (!userId) return DEFAULT_THEME.id;

    // 2. Check Supabase profiles
    try {
      const { data } = await supabase
        .from('profiles')
        .select('active_theme_id')
        .eq('id', userId)
        .maybeSingle();

      if (data?.active_theme_id) {
        localStorage.setItem(EQUIPPED_THEME_KEY, data.active_theme_id);
        return data.active_theme_id;
      }
    } catch {
      // Ignore
    }

    return DEFAULT_THEME.id;
  }

  /**
   * Persist active theme locally and in database.
   */
  async setActiveTheme(themeId: string, userId?: string): Promise<void> {
    localStorage.setItem(EQUIPPED_THEME_KEY, themeId);

    if (userId) {
      try {
        await supabase
          .from('profiles')
          .update({ active_theme_id: themeId, updated_at: new Date().toISOString() })
          .eq('id', userId);
      } catch {
        // Fallback silently if table not yet configured
      }

      // Also notify existing shop equip endpoint if matching sku exists
      try {
        const sku = `theme_${themeId.replace(/-/g, '_')}`;
        await shopApi.equipItem(sku).catch(() => {});
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Purchase a theme.
   */
  async purchaseTheme(theme: Theme, currentGold: number, userId?: string): Promise<{ success: boolean; newGold?: number; error?: string }> {
    if (!userId) {
      return { success: false, error: 'Authentication required to purchase themes.' };
    }

    if (currentGold < theme.price) {
      return { success: false, error: 'Not enough Gold.' };
    }

    // Try Supabase RPC first if configured
    try {
      const { data, error } = await supabase.rpc('purchase_theme', { p_theme_id: theme.id });
      if (!error && data?.success) {
        return { success: true, newGold: data.new_gold ?? (currentGold - theme.price) };
      }
    } catch {
      // Fall through to store API
    }

    // Purchase via existing shop backend
    try {
      const sku = `theme_${theme.slug.replace(/-/g, '_')}`;
      const res = await shopApi.purchaseItem(sku);
      const newGold = res.wallet?.gold ?? (currentGold - theme.price);
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
