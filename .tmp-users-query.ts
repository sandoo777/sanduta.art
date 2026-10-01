import { prisma } from './src/lib/prisma';

(async () => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true },
    take: 20,
    orderBy: { email: 'asc' },
  });
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});