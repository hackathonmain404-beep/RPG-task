import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ShopItem, InventoryItem, PurchaseResponse, EquipResponse } from '../types/contract';
import { shopApi } from '../services/api/shop';
import { useAuth } from './useAuth';
import { ShopContext } from './shopContextDef';
import { useSSE } from '../hooks/useSSE';



function mapItemIdToThemeKey(itemId: string): string {
  if (itemId.includes('neon')) return 'neon_outpost';
  if (itemId.includes('mystic')) return 'mystic_forest';
  if (itemId.includes('solaris')) return 'solaris_gold';
  return 'default';
}

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, reconcilePurchase } = useAuth();

  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equippedTheme, setEquippedTheme] = useState<string>('default');
  const [isLoadingShop, setIsLoadingShop] = useState<boolean>(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(false);
  const [shopError, setShopError] = useState<string | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [pendingPurchaseItemIds, setPendingPurchaseItemIds] = useState<Set<string>>(new Set());
  const [pendingEquipItemIds, setPendingEquipItemIds] = useState<Set<string>>(new Set());

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

  // Load user inventory from GET /api/inventory
  const loadInventory = useCallback(async () => {
    if (!user) {
      setInventory([]);
      return;
    }

    setIsLoadingInventory(true);
    setInventoryError(null);
    try {
      const items = await shopApi.getInventory();
      setInventory(Array.isArray(items) ? items : []);

      // Re-hydrate equipped theme if present
      const equippedThemeItem = items.find(
        item => item.equipped && (item.shopItem?.itemType === 'theme' || item.itemId?.startsWith('theme_') || item.shopItemId?.startsWith('theme_'))
      );
      if (equippedThemeItem) {
        const themeKey = mapItemIdToThemeKey(equippedThemeItem.itemId || equippedThemeItem.shopItemId);
        setEquippedTheme(themeKey);
        if (themeKey === 'default') {
          document.documentElement.removeAttribute('data-theme');
        } else {
          document.documentElement.setAttribute('data-theme', themeKey);
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
      document.documentElement.removeAttribute('data-theme');
    }
  }, [user, loadShop, loadInventory]);

  // SSE: Real-time shop updates from admin Market Studio
  const sseHandlers = useMemo(() => ({
    'shop:update': (data: any) => {
      if (data.action === 'created' && data.item) {
        setShopItems(prev => {
          // Avoid duplicates
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
        const res = await shopApi.equipItem(itemId);

        // Find the item being equipped
        const targetInv = inventory.find(i => (i.itemId || i.shopItemId) === itemId);
        const itemType = targetInv?.shopItem?.itemType || (itemId.startsWith('theme_') ? 'theme' : 'item');

        // Update inventory equipped state
        setInventory(prev =>
          prev.map(item => {
            const currentType = item.shopItem?.itemType || ((item.itemId || item.shopItemId)?.startsWith('theme_') ? 'theme' : 'item');
            if (currentType === itemType) {
              const matches = (item.itemId || item.shopItemId) === itemId;
              return { ...item, equipped: matches, equippedAt: matches ? new Date().toISOString() : undefined };
            }
            return item;
          })
        );

        // If it's a theme, dynamically apply CSS custom properties
        if (itemType === 'theme' || itemId.startsWith('theme_')) {
          const themeKey = mapItemIdToThemeKey(itemId);
          setEquippedTheme(themeKey);
          if (themeKey === 'default') {
            document.documentElement.removeAttribute('data-theme');
          } else {
            document.documentElement.setAttribute('data-theme', themeKey);
          }
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
    [pendingEquipItemIds, inventory]
  );

  const isOwned = useCallback(
    (itemId: string): boolean => {
      return inventory.some(i => i.itemId === itemId || i.shopItemId === itemId);
    },
    [inventory]
  );

  const isEquipped = useCallback(
    (itemId: string): boolean => {
      const invItem = inventory.find(i => i.itemId === itemId || i.shopItemId === itemId);
      if (invItem?.equipped) return true;
      if (itemId.startsWith('theme_')) {
        return mapItemIdToThemeKey(itemId) === equippedTheme;
      }
      return false;
    },
    [inventory, equippedTheme]
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
