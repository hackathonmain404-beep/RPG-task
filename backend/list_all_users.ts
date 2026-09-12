import { prisma } from './src/utils/prisma.js';

async function main() {
  const users = await (prisma as any).user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      githubUsername: true,
      avatarUrl: true,
      passwordHash: true,
      githubId: true,
      createdAt: true,
      lastActiveAt: true,
    },
  });

  console.log(`\n=== ALL USERS IN DATABASE (${users.length} total) ===\n`);

  users.forEach((u: any, i: number) => {
    const authMethod = u.passwordHash
      ? 'PASSWORD'
      : u.githubId
        ? 'GITHUB'
        : u.avatarUrl?.includes('googleusercontent')
          ? 'GOOGLE'
          : 'MAGIC_LINK/UNKNOWN';

    console.log(`--- User #${i + 1} ---`);
    console.log(`  ID:          ${u.id}`);
    console.log(`  Email:       ${u.email}`);
    console.log(`  Display:     ${u.displayName}`);
    console.log(`  Role:        ${u.role || 'USER'}`);
    console.log(`  GitHub:      ${u.githubUsername || '—'}`);
    console.log(`  Auth:        ${authMethod}`);
    console.log(`  Created:     ${u.createdAt}`);
    console.log(`  Last Active: ${u.lastActiveAt || '—'}`);
    console.log(`  Avatar:      ${u.avatarUrl ? u.avatarUrl.substring(0, 60) + '...' : '—'}`);
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
