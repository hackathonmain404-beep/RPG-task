import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const chars = await prisma.character.findMany({
    include: {
      user: { select: { email: true, id: true, displayName: true } },
      attributes: true,
    },
  });

  console.log(`TOTAL CHARACTERS IN DB: ${chars.length}`);
  for (const c of chars) {
    console.log(`\nUser: ${c.user?.email} (${c.user?.displayName}) [id: ${c.user?.id}]`);
    console.log(`  Level: ${c.level}, XP: ${c.totalXp}, Gold: ${c.gold}`);
    console.log(`  Attributes:`);
    for (const a of c.attributes) {
      console.log(`    - ${a.key} (${a.displayName}): ${a.value}`);
    }
  }

  // Also check tasks
  const tasks = await prisma.task.findMany({
    select: { id: true, userId: true, title: true, completed: true, completedAt: true, categoryKey: true, difficulty: true },
  });
  console.log(`\nTOTAL TASKS IN DB: ${tasks.length}`);
  for (const t of tasks) {
    console.log(`  Task: ${t.title}, completed: ${t.completed}, category: ${t.categoryKey}, diff: ${t.difficulty}, user: ${t.userId}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
