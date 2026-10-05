import { prisma } from '../src/lib/prisma';

async function main() {
  const ricoh = await prisma.machine.findFirst({ where: { name: 'Ricoh pro c5200' } });
  if (!ricoh) {
    console.log('RICOH_NOT_FOUND');
    return;
  }

  const originalNotes = ricoh.notes;

  const updated = await prisma.machine.update({
    where: { id: ricoh.id },
    data: { notes: `${originalNotes ?? ''}` },
    select: { id: true, name: true, updatedAt: true },
  });

  console.log(JSON.stringify({ ok: true, updated }, null, 2));
}

main()
  .catch((error) => {
    console.error('DIRECT_UPDATE_ERROR', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
