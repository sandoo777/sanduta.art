/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.material_categories.findMany({
    select: {
      id: true,
      name: true,
      description: true
    }
  });
  
  console.log('Material Categories:');
  console.log(JSON.stringify(categories, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
