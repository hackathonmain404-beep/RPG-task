import { useContext } from 'react';
import { ShopContext } from './shopContextDef';
import type { ShopContextType } from './shopContextDef';
import type { PurchaseResponse, EquipResponse } from '../types/contract';

const defaultShopContext: ShopContextType = {
  shopItems: [],
  inventory: [],
  equippedTheme: 'dark-citadel',
  isLoadingShop: false,
  isLoadingInventory: false,
  shopError: null,
  inventoryError: null,
  pendingPurchaseItemIds: new Set(),
  pendingEquipItemIds: new Set(),
  loadShop: async () => {},
  loadInventory: async () => {},
  purchaseItem: async (itemId: string): Promise<PurchaseResponse> => ({
    purchase: { itemId, price: 0 },
    wallet: { gold: 0 },
    inventoryItem: { id: '', itemId },
  }),
  equipItem: async (itemId: string): Promise<EquipResponse> => ({
    success: false,
    equippedItemId: itemId,
  }),
  isOwned: () => false,
  isEquipped: () => false,
};

export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  return context ?? defaultShopContext;
};
