const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.material.findMany({
    take: 10,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      sku: true,
      density: true,
      thickness: true,
      primarySupplierId: true,
      wastePercent: true,
      formatId: true,
      unit: true,
    },
  });

  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
