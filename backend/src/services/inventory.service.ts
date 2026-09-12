import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';

/**
 * Returns all inventory items owned by the authenticated user.
 * Includes shop item details for display.
 */
export async function getUserInventory(userId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: { userId },
    include: {
      shopItem: {
        select: {
          id: true,
          sku: true,
          name: true,
          description: true,
          itemType: true,
          rarity: true,
          metadataJson: true,
        },
      },
    },
    orderBy: { purchasedAt: 'desc' },
  });
  return items;
}

/**
 * Equip a theme item owned by the user.
 * Unequips any previously equipped theme for this user first.
 *
 * Only items of type THEME from InventoryItem can be equipped.
 * The equip state is tracked via UserTheme.equippedAt.
 *
 * For simplicity in Phase 5, we equip via InventoryItem and
 * track the equipped item ID on the response.
 */
export async function equipItem(userId: string, inventoryItemId: string) {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Verify ownership
    const inventoryItem = await tx.inventoryItem.findFirst({
      where: { id: inventoryItemId, userId },
      include: { shopItem: true },
    });

    if (!inventoryItem) {
      throw new AppError(404, 'NOT_FOUND', 'Item not found in your inventory.');
    }

    // 2. If it's a THEME type, manage via UserTheme
    if (inventoryItem.shopItem.itemType === 'THEME') {
      // Find associated theme by SKU pattern
      const themeKey = inventoryItem.shopItem.sku.replace('theme_', '');
      const theme = await tx.theme.findUnique({
        where: { key: themeKey },
      });

      if (theme) {
        // Unequip all currently equipped themes for this user
        await tx.userTheme.updateMany({
          where: { userId, equippedAt: { not: null } },
          data: { equippedAt: null },
        });

        // Ensure UserTheme exists (upsert)
        await tx.userTheme.upsert({
          where: { userId_themeId: { userId, themeId: theme.id } },
          update: { equippedAt: new Date() },
          create: {
            userId,
            themeId: theme.id,
            equippedAt: new Date(),
          },
        });
      }
    }

    // 3. Log equip activity
    await tx.activityLog.create({
      data: {
        userId,
        eventType: 'EQUIP',
        metadataJson: {
          inventoryItemId,
          itemSku: inventoryItem.shopItem.sku,
          itemName: inventoryItem.shopItem.name,
        },
      },
    });

    return {
      equipped: {
        id: inventoryItem.id,
        itemId: inventoryItem.shopItemId,
        name: inventoryItem.shopItem.name,
        type: inventoryItem.shopItem.itemType,
      },
    };
  });

  return result;
}
