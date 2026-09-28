const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.material.count();
    const rows = await prisma.material.findMany({
      take: 3,
      include: {
        category: true,
        materialSuppliers: true,
        priceBreaks: true,
      },
    });
    console.log('material_count', count);
    console.log('sample_materials', rows.map((m) => ({ id: m.id, name: m.name, supplierLinks: m.materialSuppliers.length, priceBreaks: m.priceBreaks.length })));
  } catch (error) {
    console.error('PRISMA_QUERY_ERROR');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
