import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Find all test/dummy users ending with @security.com or @example.com
  const dummyUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { endsWith: '@security.com' } },
        { email: { endsWith: '@example.com' } },
      ],
    },
    select: { id: true, email: true, displayName: true },
  });

  console.log(`Found ${dummyUsers.length} dummy/test accounts to remove:`);
  dummyUsers.forEach(u => console.log(` - ${u.email} (${u.displayName})`));

  if (dummyUsers.length === 0) {
    console.log('No dummy accounts found.');
    return;
  }

  const dummyIds = dummyUsers.map(u => u.id);
  const dummyEmails = dummyUsers.map(u => u.email);

  // Clean up all related foreign key tables
  const ml = await prisma.magicLinkToken.deleteMany({ where: { email: { in: dummyEmails } } });
  console.log(`Deleted ${ml.count} MagicLinkTokens`);

  const al = await prisma.activityLog.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`Deleted ${al.count} ActivityLogs`);

  const ce = await prisma.completionEvent.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`Deleted ${ce.count} CompletionEvents`);

  const ae = await prisma.attributeEvent.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`Deleted ${ae.count} AttributeEvents`);

  const ii = await prisma.inventoryItem.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`Deleted ${ii.count} InventoryItems`);

  const fb = await prisma.feedback.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`Deleted ${fb.count} Feedback items`);

  const ub = await prisma.userBadge.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`Deleted ${ub.count} UserBadges`);

  const ut = await prisma.userTheme.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`Deleted ${ut.count} UserThemes`);

  const tk = await prisma.task.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`Deleted ${tk.count} Tasks`);

  const ch = await prisma.character.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`Deleted ${ch.count} Characters`);

  const us = await prisma.user.deleteMany({ where: { id: { in: dummyIds } } });
  console.log(`Deleted ${us.count} Users`);

  console.log('\n--- VERIFYING REMAINING REAL USERS ---');
  const remaining = await prisma.user.findMany({
    include: { character: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Total real users remaining: ${remaining.length}`);
  remaining.forEach((u, i) => {
    console.log(`${i + 1}. ${u.displayName} (${u.email}) [Role: ${u.role}] - Level: ${u.character?.level ?? 1}, XP: ${u.character?.totalXp ?? 0}, Gold: ${u.character?.gold ?? 0}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
