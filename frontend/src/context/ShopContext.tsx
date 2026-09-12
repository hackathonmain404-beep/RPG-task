import React, { useState, useEffect, useCallback } from 'react';
import type { ShopItem, InventoryItem, PurchaseResponse, EquipResponse } from '../types/contract';
import { shopApi } from '../services/api/shop';
import { useAuth } from './useAuth';
import { ShopContext } from './shopContextDef';

// Canonical starter catalog matching UI_SPEC.md & DESIGN_SYSTEM.md
const CANONICAL_SEED_ITEMS: ShopItem[] = [
  {
    id: 'theme_neon',
    sku: 'THM-NEON-01',
    name: 'Neon Outpost Theme',
    description: 'Deep cyber-void interface with electric fuchsia and cyan accents.',
    itemType: 'theme',
    price: 250,
    rarity: 'epic',
    active: true,
  },
  {
    id: 'theme_mystic',
    sku: 'THM-MYST-01',
    name: 'Mystic Forest Theme',
    description: 'Dark emerald grove with ancient glowing runes and calm tranquility.',
    itemType: 'theme',
    price: 200,
    rarity: 'rare',
    active: true,
  },
  {
    id: 'theme_solaris',
    sku: 'THM-SOL-01',
    name: 'Solaris Gold Theme',
    description: 'Celestial solar radiance bathed in warm amber and radiant light.',
    itemType: 'theme',
    price: 500,
    rarity: 'legendary',
    active: true,
  },
  {
    id: 'frame_bastion',
    sku: 'FRM-BAST-01',
    name: 'Midnight Bastion Frame',
    description: 'Hardened obsidian armor border forged in the Citadel gates.',
    itemType: 'frame',
    price: 75,
    rarity: 'common',
    active: true,
  },
  {
    id: 'badge_century',
    sku: 'BDG-CENT-01',
    name: 'Century of Quests Relic',
    description: 'Ancient honorary insignia celebrating unwavering discipline mastery.',
    itemType: 'badge',
    price: 350,
    rarity: 'epic',
    active: true,
  },
  {
    id: 'title_archmage',
    sku: 'TTL-ARCH-01',
    name: 'Grand Archmage of Code',
    description: 'Prestigious honorary title displayed across your public hero profile.',
    itemType: 'title',
    price: 1000,
    rarity: 'legendary',
    active: true,
  },
];

function mapItemIdToThemeKey(itemId: string): string {
  if (itemId.includes('neon')) return 'neon_outpost';
  if (itemId.includes('mystic')) return 'mystic_forest';
  if (itemId.includes('solaris')) return 'solaris_gold';
  return 'default';
}

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, reconcilePurchase } = useAuth();

  const [shopItems, setShopItems] = useState<ShopItem[]>(CANONICAL_SEED_ITEMS);
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
      if (Array.isArray(items) && items.length > 0) {
        setShopItems(items);
      } else {
        // Retain canonical seed items if server returns empty catalog
        setShopItems(CANONICAL_SEED_ITEMS);
      }
    } catch (err) {
      setShopError(err instanceof Error ? err.message : 'Failed to load shop catalog');
      // Gracefully fall back to canonical items
      setShopItems(CANONICAL_SEED_ITEMS);
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
