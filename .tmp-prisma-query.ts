import { prisma } from './src/lib/prisma';

(async () => {
  const machines = await prisma.machine.findMany({
    orderBy: { name: 'asc' },
    take: 50,
    select: { id: true, name: true, type: true, equipmentType: true },
  });
  console.log(JSON.stringify(machines, null, 2));
  await prisma.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});