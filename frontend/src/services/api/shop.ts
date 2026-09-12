/**
 * Shop & Inventory API Service
 * 
 * CONTRACT_FRONTEND_BACKEND.md Sections 6 & 7:
 * - GET /api/shop
 * - POST /api/shop/:itemId/purchase
 * - GET /api/inventory
 * - POST /api/inventory/:itemId/equip
 * 
 * Strict server-authority: Frontend does NOT pass price in purchase request.
 */
import type { ShopItem, InventoryItem, PurchaseResponse, EquipResponse } from '../../types/contract';
import { request } from './client';

export const shopApi = {
  /**
   * GET /api/shop
   * Retrieves current active catalog from backend.
   */
  async getShopItems(): Promise<ShopItem[]> {
    const data = await request<ShopItem[] | { items: ShopItem[] } | { shopItems: ShopItem[] }>('/shop', {
      method: 'GET',
    });
    if (Array.isArray(data)) return data;
    if (data && 'items' in data && Array.isArray(data.items)) return data.items;
    if (data && 'shopItems' in data && Array.isArray(data.shopItems)) return data.shopItems;
    return [];
  },

  /**
   * POST /api/shop/:itemId/purchase
   * Purchases an item. Authoritative price is determined exclusively on server.
   */
  async purchaseItem(itemId: string): Promise<PurchaseResponse> {
    return request<PurchaseResponse>(`/shop/${encodeURIComponent(itemId)}/purchase`, {
      method: 'POST',
      data: {},
    });
  },

  /**
   * GET /api/inventory
   * Retrieves authenticated user's owned inventory items.
   */
  async getInventory(): Promise<InventoryItem[]> {
    const data = await request<InventoryItem[] | { items: InventoryItem[] } | { inventory: InventoryItem[] }>('/inventory', {
      method: 'GET',
    });
    if (Array.isArray(data)) return data;
    if (data && 'inventory' in data && Array.isArray(data.inventory)) return data.inventory;
    if (data && 'items' in data && Array.isArray(data.items)) return data.items;
    return [];
  },

  /**
   * POST /api/inventory/:itemId/equip
   * Equips an owned theme or cosmetic. Server verifies ownership before equipping.
   */
  async equipItem(itemId: string): Promise<EquipResponse> {
    const data = await request<EquipResponse>(`/inventory/${encodeURIComponent(itemId)}/equip`, {
      method: 'POST',
      data: {},
    });
    return data || { success: true, equippedItemId: itemId };
  },
};
