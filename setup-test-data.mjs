/**
 * Quick Test Setup - Create minimal test data for Print Methods API testing
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creating minimal test data...\n');

  try {
    // 1. Create MaterialCategory
    const category = await prisma.materialCategory.upsert({
      where: { id: 'test-cat-001' },
      update: {},
      create: {
        id: 'test-cat-001',
        name: 'Test Category',
        description: 'For testing',
        parent: null,
      },
    });
    console.log('✓ Material category created:', category.name);

    // 2. Create test materials
    const material1 = await prisma.material.upsert({
      where: { id: 'test-mat-001' },
      update: {},
      create: {
        id: 'test-mat-001',
        name: 'Test PVC White 3mm',
        categoryId: category.id,
        unit: 'sqm',
        pricePerSqm: 25,
        stock: 100,
        active: true,
      },
    });
    console.log('✓ Material created:', material1.name);

    const material2 = await prisma.material.upsert({
      where: { id: 'test-mat-002' },
      update: {},
      create: {
        id: 'test-mat-002',
        name: 'Test UV Ink Cyan',
        categoryId: category.id,
        unit: 'ml',
        pricePerUnit: 0.15,
        stock: 5000,
        active: true,
      },
    });
    console.log('✓ Material created:', material2.name);

    // 3. Create test machine
    const machine = await prisma.machine.upsert({
      where: { id: 'test-machine-001' },
      update: {},
      create: {
        id: 'test-machine-001',
        name: 'Test Roland LEF2-300',
        type: 'UV Printer',
        status: 'AVAILABLE',
        costPerHour: 50,
        active: true,
      },
    });
    console.log('✓ Machine created:', machine.name);

    console.log('\n✅ Test data ready!\n');
    console.log('Material IDs:');
    console.log('  -', material1.id, '→', material1.name);
    console.log('  -', material2.id, '→', material2.name);
    console.log('Machine IDs:');
    console.log('  -', machine.id, '→', machine.name);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
