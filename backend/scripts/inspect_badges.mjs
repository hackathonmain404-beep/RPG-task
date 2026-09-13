import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function inspect() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, displayName: true } });
  console.log('USERS:', users);
  const shopItems = await prisma.shopItem.findMany();
  console.log('SHOP ITEMS:', shopItems.map(i => ({ id: i.id, sku: i.sku, name: i.name, itemType: i.itemType })));
  const inv = await prisma.inventoryItem.findMany({ include: { shopItem: true } });
  console.log('INVENTORIES:', inv.map(i => ({ id: i.id, userId: i.userId, name: i.shopItem?.name, sku: i.shopItem?.sku, itemType: i.shopItem?.itemType })));
  const userBadges = await prisma.userBadge.findMany({ include: { badge: true } });
  console.log('USER BADGES:', userBadges);
}

inspect().catch(console.error).finally(() => prisma.$disconnect());
