import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'jibankumarsethy34@gmail.com' },
    include: {
      character: { include: { attributes: true } },
      tasks: true,
    },
  });

  console.log('User:', user?.email, user?.id);
  console.log('Attributes:', user?.character?.attributes);
  console.log('Tasks:', user?.tasks);

  const events = await prisma.attributeEvent.findMany({
    where: { userId: user?.id },
  });
  console.log('Attribute Events:', events);

  const completions = await prisma.completionEvent.findMany({
    where: { userId: user?.id },
  });
  console.log('Completion Events:', completions);
}

main().catch(console.error).finally(() => prisma.$disconnect());
