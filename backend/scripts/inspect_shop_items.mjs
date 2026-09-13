import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.shopItem.findMany();
  console.log(`Found ${items.length} shop items in DB:`);
  for (const item of items) {
    console.log(JSON.stringify(item));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
