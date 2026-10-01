import { prisma } from './src/lib/prisma';

async function main() {
  const rows = await prisma.$queryRawUnsafe('SELECT id, "machineId", type, description FROM public.machine_maintenance_records ORDER BY "createdAt" DESC');
  console.log(JSON.stringify(rows, null, 2));
  await prisma.$disconnect();
}
main();