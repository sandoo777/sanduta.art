/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    log: ['error'],
  });
  
  try {
    const categories = await prisma.material_categories.findMany({
      select: {
        id: true,
        name: true,
        type: true
      },
      take: 15
    });
    
    console.log('Material Categories with types:');
    categories.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.type || 'NULL'}`);
    });
    
    // Check materials
    const materials = await prisma.material.findMany({
      select: {
        id: true,
        name: true,
        categoryId: true,
        material_categories: {
          select: {
            name: true,
            type: true
          }
        }
      },
      take: 5
    });
    
    console.log('\nFirst 5 Materials:');
    materials.forEach(mat => {
      console.log(`- ${mat.name}: categoryId=${mat.categoryId}, cat.name=${mat.material_categories?.name}, cat.type=${mat.material_categories?.type || 'NULL'}`);
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
