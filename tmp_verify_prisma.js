const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();

  try {
    const machines = await prisma.machine.findMany({
      take: 3,
      orderBy: { name: 'asc' },
    });

    console.log('MACHINES_COUNT', machines.length);
    console.log(JSON.stringify(machines.slice(0, 1), null, 2));

    const maintenance = await prisma.machineMaintenanceRecord.findMany({
      take: 3,
      orderBy: { date: 'desc' },
    });

    console.log('MAINT_COUNT', maintenance.length);
    console.log(JSON.stringify(maintenance.slice(0, 1), null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
