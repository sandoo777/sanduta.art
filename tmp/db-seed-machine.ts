import { prisma } from '../src/lib/prisma';

async function main() {
  const count = await prisma.machine.count();
  if (count === 0) {
    const material = await prisma.material.findFirst({ where: { active: true }, select: { id: true } });
    const method = await prisma.printMethod.findFirst({ where: { active: true }, select: { id: true } });

    if (!material || !method) {
      console.log('MISSING_DEPS', { hasMaterial: Boolean(material), hasMethod: Boolean(method) });
      return;
    }

    const machine = await prisma.machine.create({
      data: {
        name: `E2E Machine Seed ${Date.now()}`,
        type: 'DIGITAL_COLOR',
        equipmentType: 'HOURLY',
        status: 'AVAILABLE',
        costPerHour: 120,
        compatibleMaterialIds: [material.id],
        compatiblePrintMethodIds: [method.id],
        active: true,
        notes: 'seed for update capture',
      },
      select: { id: true, name: true },
    });

    console.log('CREATED', machine);
    return;
  }

  console.log('EXISTS', count);
}

main()
  .catch((error) => {
    console.error('SEED_FAILED', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
