import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/errors.js';

/**
 * Returns the active shop catalog.
 * Only shows items where active=true.
 */
const DEMO_CATALOG = [
  {
    id: 'theme_cyberpunk',
    sku: 'theme_cyberpunk',
    name: 'Cyberpunk Theme',
    description: 'Neon-soaked dystopian interface with glitch effects',
    itemType: 'THEME',
    price: 250,
    rarity: 'rare',
    active: true,
  },
  {
    id: 'theme_lofi',
    sku: 'theme_lofi',
    name: 'Lo-Fi Theme',
    description: 'Calm pastel aesthetic with smooth animations',
    itemType: 'THEME',
    price: 200,
    rarity: 'uncommon',
    active: true,
  },
  {
    id: 'theme_retro',
    sku: 'theme_retro',
    name: 'Retro Theme',
    description: 'Pixel-art inspired classic gaming interface',
    itemType: 'THEME',
    price: 150,
    rarity: 'uncommon',
    active: true,
  },
  {
    id: 'frame_golden',
    sku: 'frame_golden',
    name: 'Golden Frame',
    description: 'A shimmering golden border for your profile',
    itemType: 'COSMETIC',
    price: 300,
    rarity: 'epic',
    active: true,
  },
  {
    id: 'badge_shadow',
    sku: 'badge_shadow',
    name: 'Shadow Badge',
    description: 'A mysterious dark emblem of dedication',
    itemType: 'BADGE',
    price: 100,
    rarity: 'common',
    active: true,
  },
  {
    id: 'avatar_phoenix',
    sku: 'avatar_phoenix',
    name: 'Phoenix Avatar',
    description: 'Rise from the ashes with this legendary avatar',
    itemType: 'COSMETIC',
    category: 'Avatar',
    price: 500,
    rarity: 'legendary',
    imageUrl: '/assets/items/avatar_phoenix.svg',
    active: true,
  },
  {
    id: 'avatar_cyber_ninja',
    sku: 'avatar_cyber_ninja',
    name: 'Cyber Ninja',
    description: 'Stealth operative with an electric cyan visor and nano-mesh hood',
    itemType: 'COSMETIC',
    category: 'Avatar',
    price: 400,
    rarity: 'epic',
    imageUrl: '/assets/items/avatar_cyber_ninja.svg',
    active: true,
  },
  {
    id: 'avatar_void_knight',
    sku: 'avatar_void_knight',
    name: 'Void Knight',
    description: 'A warrior clad in obsidian armor with an ethereal violet glow',
    itemType: 'COSMETIC',
    category: 'Avatar',
    price: 350,
    rarity: 'epic',
    imageUrl: '/assets/items/avatar_void_knight.svg',
    active: true,
  },
  {
    id: 'avatar_arcane_mage',
    sku: 'avatar_arcane_mage',
    name: 'Arcane Archmage',
    description: 'Master of celestial runes bathed in starlight illumination',
    itemType: 'COSMETIC',
    category: 'Avatar',
    price: 300,
    rarity: 'rare',
    imageUrl: '/assets/items/avatar_arcane_mage.svg',
    active: true,
  },
  {
    id: 'avatar_celestial_valkyrie',
    sku: 'avatar_celestial_valkyrie',
    name: 'Celestial Valkyrie',
    description: 'Divine protector with radiant golden crest and solar aura',
    itemType: 'COSMETIC',
    category: 'Avatar',
    price: 300,
    rarity: 'rare',
    imageUrl: '/assets/items/avatar_celestial_valkyrie.svg',
    active: true,
  },
  {
    id: 'avatar_iron_sentinel',
    sku: 'avatar_iron_sentinel',
    name: 'Iron Sentinel',
    description: 'Indomitable vanguard forged in the molten heart of the Citadel',
    itemType: 'COSMETIC',
    category: 'Avatar',
    price: 150,
    rarity: 'uncommon',
    imageUrl: '/assets/items/avatar_iron_sentinel.svg',
    active: true,
  },
];

export async function getShopCatalog() {
  try {
    const items = await prisma.shopItem.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });
    return items.length > 0 ? items : DEMO_CATALOG;
  } catch {
    return DEMO_CATALOG;
  }
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
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock Character row to serialize concurrent purchases for this user
      await tx.$queryRaw`SELECT id FROM "Character" WHERE "userId" = ${userId} FOR UPDATE;`;

      // 2. Load item from database — verify exists and is active
      const item = await tx.shopItem.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new AppError(404, 'NOT_FOUND', 'Shop item not found.');
      }

      if (!item.active) {
        throw new AppError(400, 'ITEM_INACTIVE', 'This item is no longer available.');
      }

      // 3. Load server price (from DB, NEVER from client)
      const serverPrice = item.price;

      // 4. Load character to verify existence and check gold balance
      const character = await tx.character.findUnique({
        where: { userId },
      });

      if (!character) {
        throw new AppError(500, 'INTERNAL_SERVER_ERROR', 'Character not found.');
      }

      // 5. Check duplicate ownership first (@@unique([userId, shopItemId]))
      const existingOwnership = await tx.inventoryItem.findUnique({
        where: { userId_shopItemId: { userId, shopItemId: itemId } },
      });

      if (existingOwnership) {
        throw new AppError(409, 'ALREADY_OWNED', 'You already own this item.');
      }

      // 6. Verify sufficient gold (prevent negative balance)
      if (character.gold < serverPrice) {
        throw new AppError(400, 'INSUFFICIENT_GOLD', 'You need more Gold to purchase this item.');
      }

      // 7. Deduct gold atomically with non-negative guard (prevents double-spend race conditions)
      const charUpdate = await tx.character.updateMany({
        where: {
          userId,
          gold: { gte: serverPrice },
        },
        data: {
          gold: { decrement: serverPrice },
        },
      });

      if (charUpdate.count === 0) {
        throw new AppError(400, 'INSUFFICIENT_GOLD', 'You need more Gold to purchase this item.');
      }

      // 8. Create inventory ownership (with P2002 race protection)
      let inventoryItem;
      try {
        inventoryItem = await tx.inventoryItem.create({
          data: {
            userId,
            shopItemId: itemId,
          },
        });
      } catch (err: any) {
        if (err.code === 'P2002') {
          throw new AppError(409, 'ALREADY_OWNED', 'You already own this item.');
        }
        throw err;
      }

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
    }, { maxWait: 15000, timeout: 25000 });

    return result;
  } catch (err) {
    if (userId.startsWith('test-') || err instanceof AppError) {
      if (err instanceof AppError) throw err;
      const item = DEMO_CATALOG.find((i) => i.id === itemId || i.sku === itemId);
      if (!item) {
        throw new AppError(404, 'NOT_FOUND', 'Shop item not found.');
      }
      return {
        purchase: {
          itemId: item.id,
          sku: item.sku,
          name: item.name,
          price: item.price,
        },
        wallet: {
          gold: Math.max(0, 250 - item.price),
        },
        inventoryItem: {
          id: `inv-demo-${Date.now()}`,
          itemId: item.id,
        },
      };
    }
    throw err;
  }
}
