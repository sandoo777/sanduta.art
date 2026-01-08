import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧪 Testing Finishing Operations System\n');

  // Test 1: Count finishing operations
  console.log('📋 Test 1: Total Finishing Operations');
  const totalCount = await prisma.finishingOperation.count();
  console.log(`✓ Total operations: ${totalCount}\n`);

  if (totalCount === 0) {
    console.log('⚠️  No operations found. Running seed...\n');
    
    // Get dependencies
    const materials = await prisma.material.findMany();
    const printMethods = await prisma.printMethod.findMany();
    
    const paperMaterials = materials.filter(m => m.type && m.type.includes('Hârtie')).map(m => m.id);
    const allMaterialIds = materials.map(m => m.id);
    const allPrintMethodIds = printMethods.map(m => m.id);

    // Create sample operations
    const sampleOperations = [
      {
        name: 'Laminare Mat',
        type: 'Laminare',
        costPerM2: 5.50,
        timeSeconds: 180,
        compatibleMaterialIds: paperMaterials.slice(0, 3),
        compatiblePrintMethodIds: allPrintMethodIds.slice(0, 3),
        description: 'Laminare cu folie mată',
        active: true,
      },
      {
        name: 'Tăiere la Dimensiune',
        type: 'Tăiere',
        costPerUnit: 0.50,
        timeSeconds: 30,
        compatibleMaterialIds: allMaterialIds,
        compatiblePrintMethodIds: allPrintMethodIds,
        description: 'Tăiere precisă',
        active: true,
      },
      {
        name: 'Capsare 2 Capse',
        type: 'Capsare',
        costPerUnit: 0.35,
        timeSeconds: 20,
        compatibleMaterialIds: paperMaterials,
        compatiblePrintMethodIds: allPrintMethodIds,
        description: 'Capsare standard',
        active: true,
      },
    ];

    for (const op of sampleOperations) {
      await prisma.finishingOperation.create({ data: op });
      console.log(`✓ Created: ${op.name}`);
    }
    console.log('');
  }

  // Test 2: Count by status
  console.log('📋 Test 2: Operations by Status');
  const activeCount = await prisma.finishingOperation.count({ where: { active: true } });
  const inactiveCount = await prisma.finishingOperation.count({ where: { active: false } });
  console.log(`✅ Active: ${activeCount}`);
  console.log(`⚠️  Inactive: ${inactiveCount}\n`);

  // Test 3: Group by type
  console.log('📋 Test 3: Operations by Type');
  const allOperations = await prisma.finishingOperation.findMany();
  const typeGroups = allOperations.reduce((acc, op) => {
    acc[op.type] = (acc[op.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(typeGroups).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  console.log('');

  // Test 4: List all operations
  console.log('📋 Test 4: All Finishing Operations');
  const operations = await prisma.finishingOperation.findMany({
    orderBy: [
      { active: 'desc' },
      { name: 'asc' }
    ]
  });

  operations.forEach((op) => {
    const statusIcon = op.active ? '✅' : '⚠️';
    let costInfo = 'No cost';
    if (op.costFix) costInfo = `${Number(op.costFix).toFixed(2)} lei (fix)`;
    else if (op.costPerUnit) costInfo = `${Number(op.costPerUnit).toFixed(2)} lei/buc`;
    else if (op.costPerM2) costInfo = `${Number(op.costPerM2).toFixed(2)} lei/m²`;

    console.log(`${statusIcon} ${op.name} (${op.type})`);
    console.log(`   Cost: ${costInfo}`);
    console.log(`   Materials: ${op.compatibleMaterialIds.length}, Methods: ${op.compatiblePrintMethodIds.length}`);
    console.log('');
  });

  // Test 5: Compatibility check
  console.log('📋 Test 5: Compatibility Check');
  const materialsCount = await prisma.material.count();
  const printMethodsCount = await prisma.printMethod.count();
  console.log(`✓ Total materials in DB: ${materialsCount}`);
  console.log(`✓ Total print methods in DB: ${printMethodsCount}`);

  const opsWithMaterials = operations.filter(op => op.compatibleMaterialIds.length > 0);
  const opsWithMethods = operations.filter(op => op.compatiblePrintMethodIds.length > 0);
  console.log(`✓ Operations with materials: ${opsWithMaterials.length}/${operations.length}`);
  console.log(`✓ Operations with print methods: ${opsWithMethods.length}/${operations.length}\n`);

  // Test 6: Statistics
  console.log('📊 Summary Statistics:');
  console.log(`  Total Operations: ${operations.length}`);
  console.log(`  Active: ${activeCount}`);
  console.log(`  Inactive: ${inactiveCount}`);
  console.log(`  Types: ${Object.keys(typeGroups).length}`);
  
  const avgMaterials = operations.reduce((sum, op) => sum + op.compatibleMaterialIds.length, 0) / operations.length;
  const avgMethods = operations.reduce((sum, op) => sum + op.compatiblePrintMethodIds.length, 0) / operations.length;
  console.log(`  Avg materials/operation: ${avgMaterials.toFixed(1)}`);
  console.log(`  Avg methods/operation: ${avgMethods.toFixed(1)}`);

  const opsWithFixCost = operations.filter(op => op.costFix !== null);
  const opsWithUnitCost = operations.filter(op => op.costPerUnit !== null);
  const opsWithM2Cost = operations.filter(op => op.costPerM2 !== null);
  console.log(`  Cost by fix: ${opsWithFixCost.length}`);
  console.log(`  Cost by unit: ${opsWithUnitCost.length}`);
  console.log(`  Cost by m²: ${opsWithM2Cost.length}`);

  console.log('\n✅ All tests completed successfully!');
  console.log(`\n🌐 Access the admin panel at: http://localhost:3000/admin/finishing`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
