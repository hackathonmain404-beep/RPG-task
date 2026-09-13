import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addBadge() {
  const badgeShopItem = await prisma.shopItem.findUnique({
    where: { sku: 'badge_shadow' },
  });
  console.log('Badge shop item:', badgeShopItem);

  if (!badgeShopItem) return;

  const users = await prisma.user.findMany();
  for (const u of users) {
    const existing = await prisma.inventoryItem.findFirst({
      where: { userId: u.id, shopItemId: badgeShopItem.id },
    });
    if (!existing) {
      const inv = await prisma.inventoryItem.create({
        data: {
          userId: u.id,
          shopItemId: badgeShopItem.id,
        },
      });
      console.log(`Granted Shadow Badge to ${u.email} (${u.displayName}):`, inv.id);
    } else {
      console.log(`${u.email} already has Shadow Badge`);
    }
  }
}

addBadge().catch(console.error).finally(() => prisma.$disconnect());
