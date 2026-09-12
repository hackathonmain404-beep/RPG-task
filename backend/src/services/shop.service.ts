import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';

/**
 * Returns the active shop catalog.
 * Only shows items where active=true.
 */
export async function getShopCatalog() {
  const items = await prisma.shopItem.findMany({
    where: { active: true },
    orderBy: { price: 'asc' },
  });
  return items;
}

/**
 * Atomic purchase transaction.
 *
 * Flow:
 *   authenticate → load item from DB → load server price → verify gold
 *   → check duplicate ownership → deduct gold → create InventoryItem
 *   → create ActivityLog → commit
 *
 * NEVER accepts price from frontend.
 * Prevents: negative balance, duplicate purchase, unauthorized access.
 */
export async function purchaseItem(userId: string, itemId: string) {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Load item from database — verify exists and is active
    const item = await tx.shopItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new AppError(404, 'NOT_FOUND', 'Shop item not found.');
    }

    if (!item.active) {
      throw new AppError(400, 'ITEM_INACTIVE', 'This item is no longer available.');
    }

    // 2. Load server price (from DB, NEVER from client)
    const serverPrice = item.price;

    // 3. Load character to get gold balance
    const character = await tx.character.findUnique({
      where: { userId },
    });

    if (!character) {
      throw new AppError(500, 'INTERNAL_SERVER_ERROR', 'Character not found.');
    }

    // 4. Verify sufficient gold (prevent negative balance)
    if (character.gold < serverPrice) {
      throw new AppError(400, 'INSUFFICIENT_GOLD', 'You need more Gold to purchase this item.');
    }

    // 5. Check duplicate ownership (@@unique([userId, shopItemId]))
    const existingOwnership = await tx.inventoryItem.findUnique({
      where: { userId_shopItemId: { userId, shopItemId: itemId } },
    });

    if (existingOwnership) {
      throw new AppError(409, 'ALREADY_OWNED', 'You already own this item.');
    }

    // 6. Deduct gold atomically
    await tx.character.update({
      where: { userId },
      data: { gold: character.gold - serverPrice },
    });

    // 7. Create inventory ownership
    const inventoryItem = await tx.inventoryItem.create({
      data: {
        userId,
        shopItemId: itemId,
      },
    });

    // 8. Create ActivityLog audit record
    await tx.activityLog.create({
      data: {
        userId,
        eventType: 'PURCHASE',
        metadataJson: {
          shopItemId: itemId,
          itemSku: item.sku,
          itemName: item.name,
          price: serverPrice,
        },
      },
    });

    return {
      purchase: {
        itemId: item.id,
        sku: item.sku,
        name: item.name,
        price: serverPrice,
      },
      wallet: {
        gold: character.gold - serverPrice,
      },
      inventoryItem: {
        id: inventoryItem.id,
        itemId: inventoryItem.shopItemId,
      },
    };
  });

  return result;
}
