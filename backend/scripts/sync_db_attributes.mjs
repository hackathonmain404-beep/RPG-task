import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- 1. Updating column default in PostgreSQL ---');
  await prisma.$executeRawUnsafe(`ALTER TABLE "Attribute" ALTER COLUMN "value" SET DEFAULT 0;`);
  console.log('Attribute.value default altered to 0 in PostgreSQL.');

  console.log('\n--- 2. Recalculating all character attributes based on real earned quest rewards ---');
  const characters = await prisma.character.findMany({
    include: {
      user: { select: { email: true, id: true, displayName: true } },
      attributes: true,
    },
  });

  console.log(`Found ${characters.length} characters in DB.`);

  for (const char of characters) {
    console.log(`\nProcessing user: ${char.user?.email} (${char.user?.displayName}) [id: ${char.userId}]`);
    for (const attr of char.attributes) {
      // Sum all real AttributeEvents for this user and attribute
      const eventSum = await prisma.attributeEvent.aggregate({
        where: {
          userId: char.userId,
          attributeKey: attr.key,
        },
        _sum: { amount: true },
      });

      const trueValue = eventSum._sum.amount || 0;
      const oldValue = attr.value;

      if (oldValue !== trueValue) {
        await prisma.attribute.update({
          where: { id: attr.id },
          data: { value: trueValue },
        });
        console.log(`  - ${attr.key}: ${oldValue} -> ${trueValue} (earned: +${trueValue})`);
      } else {
        console.log(`  - ${attr.key}: already ${trueValue}`);
      }
    }
  }

  console.log('\n--- 3. Verifying Samurai-34 specifically ---');
  const samurai = await prisma.user.findFirst({
    where: { email: 'jibankumarsethy34@gmail.com' },
    include: { character: { include: { attributes: true } } },
  });

  console.log('Samurai-34 attributes:');
  for (const a of samurai?.character?.attributes || []) {
    console.log(`  ${a.key}: ${a.value}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
