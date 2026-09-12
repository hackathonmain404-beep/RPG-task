import { PrismaClient } from '@prisma/client';

async function test(port, extra = '') {
  const url = `postgresql://postgres.wawjrbiqadlbsrmnllrv:Samurai34Aalu15Mamboo07@aws-0-ap-northeast-2.pooler.supabase.com:${port}/postgres${extra}`;
  console.log(`Testing port ${port} with extra="${extra}"...`);
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });
  try {
    const count = await prisma.user.count();
    console.log(`SUCCESS on port ${port}! User count: ${count}`);
    return true;
  } catch (err) {
    console.error(`FAILED on port ${port}:`, err.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  await test(6543, '?pgbouncer=true&connection_limit=2');
  await test(5432, '?connection_limit=2');
}

run();
