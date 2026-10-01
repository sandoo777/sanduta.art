import { prisma } from '../src/lib/prisma';

async function main() {
  const machines = await prisma.machine.findMany({
    select: { id: true, name: true, createdAt: true, compatibleMaterialIds: true },
    orderBy: { createdAt: 'asc' },
  });

  const allIds = [...new Set(machines.flatMap((m) => m.compatibleMaterialIds || []))];
  const materials = allIds.length
    ? await prisma.material.findMany({ where: { id: { in: allIds } }, select: { id: true } })
    : [];
  const valid = new Set(materials.map((m) => m.id));

  const broken = machines
    .map((m) => ({
      id: m.id,
      name: m.name,
      createdAt: m.createdAt,
      invalidIds: (m.compatibleMaterialIds || []).filter((id) => !valid.has(id)),
    }))
    .filter((m) => m.invalidIds.length > 0);

  console.log(JSON.stringify({
    machineCount: machines.length,
    uniqueMaterialRefs: allIds.length,
    validRefs: materials.length,
    brokenCount: broken.length,
    broken,
  }, null, 2));
}

main().finally(async () => {
  await prisma.$disconnect();
});
