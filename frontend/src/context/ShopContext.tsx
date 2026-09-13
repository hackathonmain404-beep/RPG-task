import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ShopItem, InventoryItem, PurchaseResponse, EquipResponse } from '../types/contract';
import { shopApi } from '../services/api/shop';
import { useAuth } from './useAuth';
import { ShopContext } from './shopContextDef';
import { useSSE } from '../hooks/useSSE';
import { applyThemeColors } from '../features/themes/applyTheme';
import { themeService } from '../services/themeService';
import { supabase } from '../lib/supabase';

import { PREGIVEN_THEME_SLUGS } from '../features/themes/types';

export function mapItemIdToThemeKey(itemId?: string): string {
  const lower = (itemId || '').toLowerCase();
  if (lower.includes('cyberpunk_neon') || lower.includes('cyberpunk-neon')) return 'cyberpunk-neon';
  if (lower.includes('cyberpunk')) return 'cyberpunk';
  if (lower.includes('matrix') || lower.includes('dark_matrix') || lower.includes('dark-matrix')) return 'dark-matrix';
  if (lower.includes('citadel') || lower === 'default' || lower.includes('dark-citadel')) return 'dark-citadel';
  if (lower.includes('neon-outpost') || lower.includes('neon_outpost') || lower === 'neon') return 'neon-outpost';
  if (lower.includes('mystic')) return 'mystic-forest';
  if (lower.includes('solaris')) return 'solaris-gold';
  if (lower.includes('retro')) return 'retro';
  if (lower.includes('lofi') || lower.includes('lo-fi')) return 'lofi';
  return 'dark-citadel';
}

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, reconcilePurchase } = useAuth();

  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equippedTheme, setEquippedTheme] = useState<string>(() => {
    return localStorage.getItem('liferpg_active_theme_id') || 'default';
  });
  const [isLoadingShop, setIsLoadingShop] = useState<boolean>(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(false);
  const [shopError, setShopError] = useState<string | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [pendingPurchaseItemIds, setPendingPurchaseItemIds] = useState<Set<string>>(new Set());
  const [pendingEquipItemIds, setPendingEquipItemIds] = useState<Set<string>>(new Set());

  // Listen to external theme events (e.g. equipping from Theme Marketplace)
  useEffect(() => {
    const onThemeChange = (e: Event) => {
      const detail = (e as CustomEvent<{ themeSlug: string }>).detail;
      if (detail?.themeSlug) {
        setEquippedTheme(detail.themeSlug);
      }
    };
    window.addEventListener('liferpg-theme-changed', onThemeChange);
    return () => window.removeEventListener('liferpg-theme-changed', onThemeChange);
  }, []);

  // Load shop catalog from GET /api/shop
  const loadShop = useCallback(async () => {
    setIsLoadingShop(true);
    setShopError(null);
    try {
      const items = await shopApi.getShopItems();
      setShopItems(Array.isArray(items) ? items : []);
    } catch (err) {
      setShopError(err instanceof Error ? err.message : 'Failed to load shop catalog');
      setShopItems([]);
    } finally {
      setIsLoadingShop(false);
    }
  }, []);

  // Load user inventory from GET /api/inventory and Supabase
  const loadInventory = useCallback(async () => {
    if (!user) {
      setInventory([]);
      return;
    }

    setIsLoadingInventory(true);
    setInventoryError(null);
    try {
      let combined: InventoryItem[] = [];

      // 1. Try Express backend inventory
      try {
        const items = await shopApi.getInventory();
        if (Array.isArray(items)) {
          combined = [...items];
        }
      } catch {
        // Express backend may be unreachable or offline
      }

      // 2. Cross-reference with Supabase InventoryItem table
      try {
        const { data: supaInv } = await supabase
          .from('InventoryItem')
          .select('*, shopItem:ShopItem(*)')
          .eq('userId', user.id);

        if (Array.isArray(supaInv) && supaInv.length > 0) {
          supaInv.forEach(si => {
            if (!combined.some(c => (c.itemId || c.shopItemId) === si.shopItemId || c.id === si.id)) {
              combined.push({
                id: si.id,
                shopItemId: si.shopItemId,
                purchasedAt: si.purchasedAt,
                equipped: false,
                shopItem: si.shopItem,
              });
            }
          });
        }
      } catch {
        // Non-critical
      }

      setInventory(combined);

      // Re-hydrate equipped theme if present
      const equippedThemeItem = combined.find(
        item => item.equipped && (
          item.shopItem?.itemType?.toUpperCase() === 'THEME' || 
          item.itemId?.startsWith('theme_') || 
          item.shopItemId?.startsWith('theme_') ||
          item.shopItem?.sku?.startsWith('theme_')
        )
      );

      if (equippedThemeItem) {
        const sku = equippedThemeItem.shopItem?.sku || equippedThemeItem.itemId || equippedThemeItem.shopItemId || '';
        const themeKey = mapItemIdToThemeKey(sku);
        setEquippedTheme(themeKey);
        applyThemeColors(themeKey);
      } else {
        const cached = localStorage.getItem('liferpg_active_theme_id');
        if (cached && cached !== 'default') {
          setEquippedTheme(cached);
          applyThemeColors(cached);
        }
      }
    } catch (err) {
      setInventoryError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setIsLoadingInventory(false);
    }
  }, [user]);

  // Initial load when user session changes
  useEffect(() => {
    if (user) {
      void loadShop();
      void loadInventory();
    } else {
      setInventory([]);
      setEquippedTheme('default');
    }
  }, [user, loadShop, loadInventory]);

  // SSE: Real-time shop updates from admin Market Studio
  const sseHandlers = useMemo(() => ({
    'shop:update': (data: any) => {
      if (data.action === 'created' && data.item) {
        setShopItems(prev => {
          if (prev.some(i => i.id === data.item.id)) return prev;
          return [...prev, data.item];
        });
      } else if (data.action === 'updated' && data.item) {
        setShopItems(prev =>
          prev.map(i => (i.id === data.item.id ? { ...i, ...data.item } : i))
        );
      } else if (data.action === 'deleted' && data.itemId) {
        setShopItems(prev => prev.filter(i => i.id !== data.itemId));
      }
    },
  } as const), []);

  useSSE(sseHandlers, !!user);

  // Purchase item: dispatches POST /api/shop/:itemId/purchase with duplicate click protection
  const purchaseItem = useCallback(
    async (itemId: string): Promise<PurchaseResponse> => {
      if (pendingPurchaseItemIds.has(itemId)) {
        throw new Error('Purchase is already processing.');
      }

      setPendingPurchaseItemIds(prev => new Set(prev).add(itemId));

      try {
        const res = await shopApi.purchaseItem(itemId);

        // Reconcile authoritative wallet balance into AuthContext
        if (res.wallet && typeof res.wallet.gold === 'number') {
          reconcilePurchase(res.wallet.gold);
        }

        // Add confirmed item to user inventory
        if (res.inventoryItem) {
          const matchingShopItem = shopItems.find(s => s.id === itemId);
          const newItem: InventoryItem = {
            id: res.inventoryItem.id,
            shopItemId: res.inventoryItem.itemId,
            purchasedAt: new Date().toISOString(),
            equipped: false,
            shopItem: matchingShopItem,
          };
          setInventory(prev => [newItem, ...prev.filter(i => (i.itemId || i.shopItemId) !== itemId)]);

          // Cache theme ownership locally and fire cross-event
          if (matchingShopItem && (matchingShopItem.itemType?.toUpperCase() === 'THEME' || matchingShopItem.sku?.startsWith('theme_') || matchingShopItem.name?.toLowerCase().includes('theme'))) {
            const themeSlug = mapItemIdToThemeKey(matchingShopItem.sku || matchingShopItem.name);
            try {
              const cached = localStorage.getItem('liferpg_owned_themes');
              const arr = cached ? JSON.parse(cached) : [];
              const set = new Set(Array.isArray(arr) ? arr : []);
              set.add(themeSlug);
              set.add(matchingShopItem.sku);
              if (themeSlug.includes('cyberpunk')) {
                set.add('cyberpunk');
                set.add('cyberpunk-neon');
              }
              localStorage.setItem('liferpg_owned_themes', JSON.stringify(Array.from(set)));
            } catch {
              // Ignore
            }
            window.dispatchEvent(new CustomEvent('liferpg-theme-purchased', { detail: { themeSlug } }));
          }
        }

        return res;
      } finally {
        setPendingPurchaseItemIds(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    [pendingPurchaseItemIds, shopItems, reconcilePurchase]
  );

  // Equip item: dispatches POST /api/inventory/:itemId/equip with server confirmation
  const equipItem = useCallback(
    async (itemId: string): Promise<EquipResponse> => {
      if (pendingEquipItemIds.has(itemId)) {
        throw new Error('Equipment is already processing.');
      }

      setPendingEquipItemIds(prev => new Set(prev).add(itemId));

      try {
        const matchingShop = shopItems.find(s => 
          s.id === itemId || 
          s.sku === itemId || 
          s.name.toLowerCase() === itemId.toLowerCase()
        );

        const targetInv = inventory.find(i => 
          i.id === itemId || 
          i.itemId === itemId || 
          i.shopItemId === itemId || 
          i.shopItem?.id === itemId || 
          i.shopItem?.sku === itemId ||
          (matchingShop && (i.shopItemId === matchingShop.id || i.shopItem?.id === matchingShop.id))
        );

        const isTheme = 
          Boolean(matchingShop && (matchingShop.itemType?.toUpperCase() === 'THEME' || matchingShop.sku?.startsWith('theme_') || matchingShop.name?.toLowerCase().includes('theme'))) ||
          Boolean(targetInv?.shopItem && (targetInv.shopItem.itemType?.toUpperCase() === 'THEME' || targetInv.shopItem.sku?.startsWith('theme_') || targetInv.shopItem.name?.toLowerCase().includes('theme'))) ||
          itemId.startsWith('theme_') || 
          itemId.includes('cyberpunk') || 
          itemId.includes('matrix') || 
          itemId.includes('retro') || 
          itemId.includes('lofi');

        const idToSend = targetInv?.id || itemId;
        let res: EquipResponse = { success: true, equippedItemId: itemId };
        try {
          res = await shopApi.equipItem(idToSend);
        } catch (apiErr) {
          console.warn('Equip API response notice:', apiErr);
        }

        // Update inventory equipped state
        setInventory(prev =>
          prev.map(item => {
            const currentType = (item.shopItem?.itemType || ((item.itemId || item.shopItemId)?.startsWith('theme_') ? 'THEME' : 'item')).toUpperCase();
            if (isTheme && currentType === 'THEME') {
              const matches = item.id === targetInv?.id || item.id === itemId || item.itemId === itemId || item.shopItemId === itemId || item.shopItem?.id === itemId || (matchingShop && (item.shopItemId === matchingShop.id || item.shopItem?.id === matchingShop.id));
              return { ...item, equipped: Boolean(matches), equippedAt: matches ? new Date().toISOString() : undefined };
            }
            return item;
          })
        );

        // If it's a theme, dynamically apply CSS custom properties and website colors
        if (isTheme) {
          const identifier = matchingShop?.sku || targetInv?.shopItem?.sku || matchingShop?.name || targetInv?.shopItem?.name || itemId;
          const themeKey = mapItemIdToThemeKey(identifier);
          setEquippedTheme(themeKey);
          applyThemeColors(themeKey);
          await themeService.setActiveTheme(themeKey, user?.id);
          window.dispatchEvent(new CustomEvent('liferpg-theme-changed', { detail: { themeSlug: themeKey } }));
        }

        return res;
      } finally {
        setPendingEquipItemIds(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    [pendingEquipItemIds, inventory, shopItems, user?.id]
  );

  const isOwned = useCallback(
    (itemId: string): boolean => {
      const clean = (itemId || '').toLowerCase().replace(/^theme_/, '').replace(/_/g, '-');
      if ((PREGIVEN_THEME_SLUGS as readonly string[]).includes(clean) || (PREGIVEN_THEME_SLUGS as readonly string[]).includes(itemId)) {
        return true;
      }

      const matchingShop = shopItems.find(s => s.id === itemId || s.sku === itemId || s.name.toLowerCase() === itemId.toLowerCase());
      const hasInInv = inventory.some(i => 
        i.id === itemId || 
        i.itemId === itemId || 
        i.shopItemId === itemId || 
        i.shopItem?.id === itemId || 
        i.shopItem?.sku === itemId ||
        (matchingShop && (i.shopItemId === matchingShop.id || i.shopItem?.id === matchingShop.id))
      );
      if (hasInInv) return true;

      try {
        const cached = localStorage.getItem('liferpg_owned_themes');
        if (cached) {
          const arr: string[] = JSON.parse(cached);
          const sku = matchingShop?.sku || itemId;
          const slug = mapItemIdToThemeKey(sku);
          if (arr.includes(itemId) || arr.includes(sku) || arr.includes(slug)) {
            return true;
          }
          if ((slug === 'cyberpunk' || slug === 'cyberpunk-neon') && (arr.includes('cyberpunk') || arr.includes('cyberpunk-neon') || arr.includes('theme_cyberpunk') || arr.includes('theme_cyberpunk_neon'))) {
            return true;
          }
        }
      } catch {
        // Ignore
      }

      return false;
    },
    [inventory, shopItems]
  );

  const isEquipped = useCallback(
    (itemId: string): boolean => {
      const matchingShop = shopItems.find(s => s.id === itemId || s.sku === itemId || s.name.toLowerCase() === itemId.toLowerCase());
      const invItem = inventory.find(i => 
        i.id === itemId || 
        i.itemId === itemId || 
        i.shopItemId === itemId || 
        i.shopItem?.id === itemId || 
        i.shopItem?.sku === itemId ||
        (matchingShop && (i.shopItemId === matchingShop.id || i.shopItem?.id === matchingShop.id))
      );
      if (invItem?.equipped) return true;

      const sku = matchingShop?.sku || invItem?.shopItem?.sku || itemId;
      const itemThemeKey = mapItemIdToThemeKey(sku);
      if (itemThemeKey && itemThemeKey === equippedTheme) {
        return true;
      }
      if ((itemThemeKey === 'dark-citadel' || itemThemeKey === 'default') && (equippedTheme === 'dark-citadel' || equippedTheme === 'default')) {
        return true;
      }
      if ((itemThemeKey === 'neon-outpost' || itemThemeKey === 'neon_outpost') && (equippedTheme === 'neon-outpost' || equippedTheme === 'neon_outpost')) {
        return true;
      }
      if ((itemThemeKey === 'mystic-forest' || itemThemeKey === 'mystic_forest') && (equippedTheme === 'mystic-forest' || equippedTheme === 'mystic_forest')) {
        return true;
      }
      if ((itemThemeKey === 'solaris-gold' || itemThemeKey === 'solaris_gold') && (equippedTheme === 'solaris-gold' || equippedTheme === 'solaris_gold')) {
        return true;
      }
      if ((itemThemeKey === 'cyberpunk' || itemThemeKey === 'cyberpunk-neon') && (equippedTheme === 'cyberpunk' || equippedTheme === 'cyberpunk-neon')) {
        return true;
      }
      return false;
    },
    [inventory, shopItems, equippedTheme]
  );

  return (
    <ShopContext.Provider
      value={{
        shopItems,
        inventory,
        equippedTheme,
        isLoadingShop,
        isLoadingInventory,
        shopError,
        inventoryError,
        pendingPurchaseItemIds,
        pendingEquipItemIds,
        loadShop,
        loadInventory,
        purchaseItem,
        equipItem,
        isOwned,
        isEquipped,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
