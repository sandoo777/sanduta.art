import { prisma } from '../src/lib/prisma';

async function main() {
  const target = ['Ricoh pro c5200', 'Roland BN-20D', 'Xerox Versant 280'];
  const machines = await prisma.machine.findMany({
    where: { name: { in: target } },
    select: { id: true, name: true },
  });

  for (const machine of machines) {
    const records = await prisma.machineMaintenanceRecord.findMany({
      where: { machineId: machine.id },
      orderBy: { date: 'desc' },
      select: { id: true, machineId: true, date: true, type: true, description: true, cost: true },
    });

    console.log(JSON.stringify({
      machine: machine.name,
      machineId: machine.id,
      maintenanceCount: records.length,
      records,
    }, null, 2));
  }
}

main()
  .catch((error) => {
    console.error('CHECK_MAINTENANCE_ERROR', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
