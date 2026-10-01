const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sanduta' } }
});
(async () => {
  try {
    const rows = await prisma.machine.findMany({
      where: { name: { contains: 'Ricoh', mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
