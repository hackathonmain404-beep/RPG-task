import { createContext } from 'react';
import type { ShopItem, InventoryItem, PurchaseResponse, EquipResponse } from '../types/contract';

export interface ShopContextType {
  shopItems: ShopItem[];
  inventory: InventoryItem[];
  equippedTheme: string;
  isLoadingShop: boolean;
  isLoadingInventory: boolean;
  shopError: string | null;
  inventoryError: string | null;
  pendingPurchaseItemIds: Set<string>;
  pendingEquipItemIds: Set<string>;
  loadShop: () => Promise<void>;
  loadInventory: () => Promise<void>;
  purchaseItem: (itemId: string) => Promise<PurchaseResponse>;
  equipItem: (itemId: string) => Promise<EquipResponse>;
  isOwned: (itemId: string) => boolean;
  isEquipped: (itemId: string) => boolean;
}

export const ShopContext = createContext<ShopContextType | undefined>(undefined);
