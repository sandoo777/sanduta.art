/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

// DATABASE_URL este citit automat din .env de către Prisma
const prisma = new PrismaClient();

async function main() {
  const material = await prisma.materials.findFirst({
    where: {
      name: '80gr office A4'
    },
    select: {
      id: true,
      name: true,
      sku: true,
      category: true,
      unit: true,
      purchasePrice: true,
      salePrice: true,
      active: true
    }
  });

  console.log('Material "80gr office A4" data:');
  console.log(JSON.stringify(material, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
