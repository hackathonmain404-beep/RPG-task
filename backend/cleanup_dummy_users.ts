import { prisma } from './src/utils/prisma.js';

async function main() {
  const keepEmails = [
    'microsoft1gab@gmail.com',
    'abhijeetraika063@gmail.com',
    'jibankumarsethy34@gmail.com',
    'bindhaniansuman62@gmail.com',
    'gourangabehera9437@gmail.com',
    'Achiever_admin_4.com',
  ];

  const dummyUsers = await (prisma as any).user.findMany({
    where: { email: { notIn: keepEmails } },
    select: { id: true, email: true },
  });

  console.log(`Found ${dummyUsers.length} dummy users to delete.\n`);
  const dummyIds = dummyUsers.map((u: any) => u.id);
  const dummyEmails = dummyUsers.map((u: any) => u.email);

  // 1. MagicLinkTokens (keyed by email, not userId)
  const ml = await (prisma as any).magicLinkToken.deleteMany({
    where: { email: { in: dummyEmails } },
  });
  console.log(`  Deleted ${ml.count} MagicLinkTokens`);

  // 2. ActivityLogs
  const al = await (prisma as any).activityLog.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`  Deleted ${al.count} ActivityLogs`);

  // 3. CompletionEvents
  const ce = await (prisma as any).completionEvent.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`  Deleted ${ce.count} CompletionEvents`);

  // 4. AttributeEvents
  const ae = await (prisma as any).attributeEvent.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`  Deleted ${ae.count} AttributeEvents`);

  // 5. InventoryItems
  const ii = await (prisma as any).inventoryItem.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`  Deleted ${ii.count} InventoryItems`);

  // 6. Feedback
  const fb = await (prisma as any).feedback.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`  Deleted ${fb.count} Feedbacks`);

  // 7. UserBadges
  const ub = await (prisma as any).userBadge.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`  Deleted ${ub.count} UserBadges`);

  // 8. UserThemes
  const ut = await (prisma as any).userTheme.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`  Deleted ${ut.count} UserThemes`);

  // 9. Tasks
  const tk = await (prisma as any).task.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`  Deleted ${tk.count} Tasks`);

  // 10. Characters (must be after attributeEvents since Attribute cascades from Character)
  const ch = await (prisma as any).character.deleteMany({ where: { userId: { in: dummyIds } } });
  console.log(`  Deleted ${ch.count} Characters`);

  // 11. Finally delete Users
  const us = await (prisma as any).user.deleteMany({ where: { id: { in: dummyIds } } });
  console.log(`  Deleted ${us.count} Users`);

  console.log(`\n✅ Cleanup complete. Remaining users:`);
  const remaining = await (prisma as any).user.findMany({
    select: { email: true, displayName: true, role: true },
    orderBy: { createdAt: 'asc' },
  });
  remaining.forEach((u: any) => {
    console.log(`  • ${u.email} — ${u.displayName} [${u.role || 'USER'}]`);
  });

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
