import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning up duplicate themes and frame items in DB ---');

  // 1. Delete inventory items associated with the test duplicate themes
  await prisma.inventoryItem.deleteMany({
    where: {
      shopItem: {
        sku: { in: ['security_test_theme_1', 'security_test_theme_2'] },
      },
    },
  });

  // 2. Delete the duplicate test themes
  const deletedTestThemes = await prisma.shopItem.deleteMany({
    where: {
      sku: { in: ['security_test_theme_1', 'security_test_theme_2'] },
    },
  });
  console.log(`Deleted ${deletedTestThemes.count} duplicate test themes.`);

  // 3. Deactivate frame items so they never appear in armory
  const deactivatedFrames = await prisma.shopItem.updateMany({
    where: {
      OR: [
        { sku: { startsWith: 'frame_' } },
        { itemType: 'FRAME' },
        { name: { contains: 'Frame', mode: 'insensitive' } },
      ],
    },
    data: { active: false },
  });
  console.log(`Deactivated ${deactivatedFrames.count} frame items.`);

  // 4. Inspect active shop items
  const activeItems = await prisma.shopItem.findMany({
    where: { active: true },
    orderBy: { price: 'asc' },
  });

  console.log(`\nActive Shop Items (${activeItems.length}):`);
  const seen = new Set();
  for (const item of activeItems) {
    const isDup = seen.has(item.name.toLowerCase().trim());
    seen.add(item.name.toLowerCase().trim());
    console.log(`- [${item.sku}] ${item.name} (${item.itemType}, ${item.price} gold) ${isDup ? '⚠️ DUPLICATE' : '✅'}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
