import { prisma } from '../src/lib/prisma';

async function main() {
  const machine = await prisma.machine.findFirst({ orderBy: { createdAt: 'desc' }, select: { id: true } });
  if (!machine) return;

  try {
    await prisma.machine.update({
      where: { id: machine.id },
      data: {
        maintenanceHistory: {
          upsert: [
            {
              where: { id: `draft-${Date.now()}` },
              update: {
                date: new Date(),
                type: 'PREVENTIVE' as any,
                description: 'test',
                cost: 1,
                technician: null,
                notes: null,
              },
              create: {
                id: `draft-${Date.now()}-c`,
                date: new Date(),
                type: 'PREVENTIVE' as any,
                description: 'test',
                cost: 1,
                technician: null,
                notes: null,
              },
            },
          ],
        } as any,
      } as any,
    });
    console.log('OK');
  } catch (error) {
    console.error(String((error as Error).message));
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
