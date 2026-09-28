const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.material.findMany({
      orderBy: { name: 'asc' },
      take: 5,
      include: {
        category: true,
        materialSuppliers: true,
        priceBreaks: true,
      },
    });

    console.log(JSON.stringify({
      count: rows.length,
      sample: rows.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category?.name ?? null,
        priceBreaks: m.priceBreaks?.length ?? 0,
        suppliers: m.materialSuppliers?.length ?? 0,
      })),
    }, null, 2));
  } catch (error) {
    console.error('PRISMA_QUERY_ERROR');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
