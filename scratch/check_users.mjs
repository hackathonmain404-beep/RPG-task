import { PrismaClient } from '@prisma/client';

const p = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres.wawjrbiqadlbsrmnllrv:Samurai34Aalu15Mamboo07@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=2' } }
});

async function main() {
  const user = await p.user.findUnique({
    where: { email: 'jibankumarsethy34@gmail.com' }
  });
  console.log('Jiban user:', JSON.stringify(user, null, 2));
  await p.$disconnect();
}
main();
