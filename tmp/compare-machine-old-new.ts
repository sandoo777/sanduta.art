import { prisma } from '../src/lib/prisma';

async function main() {
  const rows = await prisma.machine.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      equipmentType: true,
      status: true,
      speedProfiles: true,
      maintenanceComponents: true,
      tonerConsumables: true,
      compatibleMaterialIds: true,
      compatiblePrintMethodIds: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log('COUNT', rows.length);
  if (rows.length === 0) {
    console.log('NO_MACHINES');
    return;
  }

  console.log(JSON.stringify({
    oldest: rows[0],
    newest: rows[rows.length - 1],
  }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
