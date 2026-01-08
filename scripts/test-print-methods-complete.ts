import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧪 Testing Print Methods Management System\n');

  // Test 1: Count total methods
  console.log('📋 Test 1: Total Print Methods');
  const totalCount = await prisma.printMethod.count();
  console.log(`✓ Total methods: ${totalCount}\n`);

  // Test 2: Count by status
  console.log('📋 Test 2: Methods by Status');
  const activeCount = await prisma.printMethod.count({ where: { active: true } });
  const inactiveCount = await prisma.printMethod.count({ where: { active: false } });
  console.log(`✅ Active: ${activeCount}`);
  console.log(`⚠️  Inactive: ${inactiveCount}\n`);

  // Test 3: Group by type
  console.log('📋 Test 3: Methods by Type');
  const allMethods = await prisma.printMethod.findMany();
  const typeGroups = allMethods.reduce((acc, method) => {
    acc[method.type] = (acc[method.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(typeGroups).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  console.log('');

  // Test 4: List all methods with details
  console.log('📋 Test 4: All Print Methods');
  const methods = await prisma.printMethod.findMany({
    orderBy: [
      { active: 'desc' },
      { name: 'asc' }
    ]
  });

  methods.forEach((method) => {
    const statusIcon = method.active ? '✅' : '⚠️';
    const costInfo = method.costPerM2 
      ? `${Number(method.costPerM2).toFixed(2)} lei/m²`
      : method.costPerSheet 
        ? `${Number(method.costPerSheet).toFixed(2)} lei/coală`
        : 'No cost';
    
    console.log(`${statusIcon} ${method.name} (${method.type})`);
    console.log(`   Cost: ${costInfo}`);
    console.log(`   Materials: ${method.materialIds.length} compatible`);
    if (method.speed) console.log(`   Speed: ${method.speed}`);
    if (method.maxWidth && method.maxHeight) {
      console.log(`   Max size: ${method.maxWidth}x${method.maxHeight}mm`);
    }
    console.log('');
  });

  // Test 5: Check material references
  console.log('📋 Test 5: Material Compatibility Check');
  const materialsCount = await prisma.material.count();
  console.log(`✓ Total materials in database: ${materialsCount}`);
  
  const methodsWithMaterials = methods.filter(m => m.materialIds.length > 0);
  console.log(`✓ Methods with materials: ${methodsWithMaterials.length}/${methods.length}`);
  
  // Check if material IDs are valid
  const allMaterialIds = await prisma.material.findMany({ select: { id: true } });
  const validMaterialIds = new Set(allMaterialIds.map(m => m.id));
  
  let invalidReferences = 0;
  for (const method of methods) {
    for (const matId of method.materialIds) {
      if (!validMaterialIds.has(matId)) {
        invalidReferences++;
        console.log(`⚠️  ${method.name} references invalid material: ${matId}`);
      }
    }
  }
  
  if (invalidReferences === 0) {
    console.log('✓ All material references are valid\n');
  } else {
    console.log(`⚠️  Found ${invalidReferences} invalid material references\n`);
  }

  // Test 6: Statistics
  console.log('📊 Summary Statistics:');
  console.log(`  Total Methods: ${totalCount}`);
  console.log(`  Active: ${activeCount}`);
  console.log(`  Inactive: ${inactiveCount}`);
  console.log(`  Types: ${Object.keys(typeGroups).length}`);
  console.log(`  Avg materials/method: ${(methods.reduce((sum, m) => sum + m.materialIds.length, 0) / methods.length).toFixed(1)}`);
  
  const methodsWithM2Cost = methods.filter(m => m.costPerM2 !== null);
  const methodsWithSheetCost = methods.filter(m => m.costPerSheet !== null);
  console.log(`  Cost by m²: ${methodsWithM2Cost.length}`);
  console.log(`  Cost by sheet: ${methodsWithSheetCost.length}`);
  
  console.log('\n✅ All tests completed successfully!');
  console.log(`\n🌐 Access the admin panel at: http://localhost:3000/admin/print-methods`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
