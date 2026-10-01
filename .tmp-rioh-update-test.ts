import { prisma } from './src/lib/prisma';

(async () => {
  const machineId = 'cmun3tqy40000cgdian5lkvbf';
  const before = await prisma.machine.findUnique({
    where: { id: machineId },
    select: { id: true, name: true, notes: true, description: true },
  });

  const testValue = 'RIOH2-UPDATE-TEST-2026-09-29';
  await prisma.machine.update({
    where: { id: machineId },
    data: { notes: testValue },
  });

  const after = await prisma.machine.findUnique({
    where: { id: machineId },
    select: { id: true, name: true, notes: true, description: true },
  });

  await prisma.machine.update({
    where: { id: machineId },
    data: { notes: before?.notes ?? null },
  });

  console.log(JSON.stringify({ before, after, restored: await prisma.machine.findUnique({ where: { id: machineId }, select: { notes: true } }) }, null, 2));
  await prisma.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});