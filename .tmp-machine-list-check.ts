import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: { name: 'asc' },
    });
    console.log('machines', machines.length);

    const machineIds = machines.map((m) => m.id);
    const maintenanceHistory = machineIds.length > 0
      ? await prisma.machineMaintenanceRecord.findMany({
          where: { machineId: { in: machineIds } },
          orderBy: { date: 'desc' },
        })
      : [];

    console.log('maintenance', maintenanceHistory.length);
    console.log('first-machine-first-history', maintenanceHistory[0] ?? null);
  } catch (e) {
    console.error('RUNTIME_ERROR', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();