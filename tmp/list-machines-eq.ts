import { prisma } from '../src/lib/prisma';

async function main() {
  const rows = await prisma.machine.findMany({
    select: { id: true, name: true, equipmentType: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  for (const r of rows) {
    console.log(`${r.id} | ${r.name} | ${r.equipmentType} | ${r.createdAt.toISOString()}`);
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
