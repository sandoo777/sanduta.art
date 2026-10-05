import { prisma } from '../src/lib/prisma';

async function main() {
  const ricoh = await prisma.machine.findFirst({
    where: { name: 'Ricoh pro c5200' },
    select: { id: true, tonerConsumables: true },
  });

  if (!ricoh) {
    console.log('RICOH_NOT_FOUND');
    return;
  }

  const toner = Array.isArray(ricoh.tonerConsumables) ? ricoh.tonerConsumables as Array<{ materialId?: string | null; type?: string }> : [];
  const ids = toner.map((t) => t.materialId).filter((id): id is string => Boolean(id));
  const existing = ids.length ? await prisma.material.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } }) : [];

  console.log(JSON.stringify({
    tonerRows: toner.length,
    tonerMaterialIds: ids,
    existingCount: existing.length,
    existing,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error('CHECK_RICOH_TONER_ERROR', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
