import { prisma } from '../src/lib/prisma';

async function main() {
  const target = ['Ricoh pro c5200', 'Roland BN-20D', 'Xerox Versant 280'];

  const all = await prisma.machine.findMany({
    select: {
      id: true,
      name: true,
      equipmentType: true,
      status: true,
      active: true,
      compatibleMaterialIds: true,
      compatiblePrintMethodIds: true,
      speedProfiles: true,
      tonerConsumables: true,
      updatedAt: true,
    },
  });

  const rows = all.filter((r) => target.includes(r.name));

  console.log(JSON.stringify({
    totalMachines: all.length,
    targetCount: rows.length,
    rows,
  }, null, 2));

  const ricoh = rows.find((r) => r.name === 'Ricoh pro c5200');
  if (!ricoh) {
    console.log('RICOH_NOT_FOUND');
    return;
  }

  const materialCount = ricoh.compatibleMaterialIds.length
    ? await prisma.material.count({ where: { id: { in: ricoh.compatibleMaterialIds } } })
    : 0;
  const methodCount = ricoh.compatiblePrintMethodIds.length
    ? await prisma.printMethod.count({ where: { id: { in: ricoh.compatiblePrintMethodIds } } })
    : 0;

  console.log(JSON.stringify({
    ricohId: ricoh.id,
    materialIds: ricoh.compatibleMaterialIds.length,
    materialIdsExisting: materialCount,
    printMethodIds: ricoh.compatiblePrintMethodIds.length,
    printMethodIdsExisting: methodCount,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error('CHECK_MACHINES_DB_ERROR', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
