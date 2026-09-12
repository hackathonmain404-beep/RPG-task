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
import { ApiError } from '../../types/contract';

const API_BASE = '/api';

export const shopApi = {
  /**
   * GET /api/shop
   * Retrieves current active catalog from backend.
   */
  async getShopItems(): Promise<ShopItem[]> {
    const res = await fetch(`${API_BASE}/shop`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      let errorData: { error?: { code?: string; message?: string } } = {};
      try {
        errorData = await res.json();
      } catch {
        // Non-JSON response
      }
      throw new ApiError(
        errorData.error?.code || 'SHOP_FETCH_ERROR',
        errorData.error?.message || `HTTP ${res.status}: Failed to fetch shop catalog`,
        res.status
      );
    }

    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || data.shopItems || []);
  },

  /**
   * POST /api/shop/:itemId/purchase
   * Purchases an item. Authoritative price is determined exclusively on server.
   */
  async purchaseItem(itemId: string): Promise<PurchaseResponse> {
    const res = await fetch(`${API_BASE}/shop/${encodeURIComponent(itemId)}/purchase`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      let errorData: { error?: { code?: string; message?: string } } = {};
      try {
        errorData = await res.json();
      } catch {
        // Non-JSON response
      }
      throw new ApiError(
        errorData.error?.code || 'PURCHASE_FAILED',
        errorData.error?.message || `HTTP ${res.status}: Purchase transaction rejected`,
        res.status
      );
    }

    return res.json();
  },

  /**
   * GET /api/inventory
   * Retrieves authenticated user's owned inventory items.
   */
  async getInventory(): Promise<InventoryItem[]> {
    const res = await fetch(`${API_BASE}/inventory`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      let errorData: { error?: { code?: string; message?: string } } = {};
      try {
        errorData = await res.json();
      } catch {
        // Non-JSON response
      }
      throw new ApiError(
        errorData.error?.code || 'INVENTORY_FETCH_ERROR',
        errorData.error?.message || `HTTP ${res.status}: Failed to fetch inventory`,
        res.status
      );
    }

    const data = await res.json();
    return Array.isArray(data) ? data : (data.inventory || data.items || []);
  },

  /**
   * POST /api/inventory/:itemId/equip
   * Equips an owned theme or cosmetic. Server verifies ownership before equipping.
   */
  async equipItem(itemId: string): Promise<EquipResponse> {
    const res = await fetch(`${API_BASE}/inventory/${encodeURIComponent(itemId)}/equip`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      let errorData: { error?: { code?: string; message?: string } } = {};
      try {
        errorData = await res.json();
      } catch {
        // Non-JSON response
      }
      throw new ApiError(
        errorData.error?.code || 'EQUIP_FAILED',
        errorData.error?.message || `HTTP ${res.status}: Failed to equip item`,
        res.status
      );
    }

    const data = await res.json();
    return data || { success: true, equippedItemId: itemId };
  },
};
