import { prisma } from './src/lib/prisma';

async function main() {
  try {
    console.log('=== TEST CONSUMABILE UTILAJ ===\n');
    
    // 1. Verifică stoc înainte
    console.log('1. Stoc ÎNAINTE:');
    const beforeMaterial = await prisma.material.findUnique({
      where: { id: 'cmpnmnj840000hkdifrrzksyv' },
      select: { name: true, stock: true, unit: true }
    });
    console.log(`   ${beforeMaterial.name}: ${beforeMaterial.stock} ${beforeMaterial.unit}\n`);
    
    // 2. Creează comandă
    console.log('2. Creare comandă...');
    const order = await prisma.order.create({
      data: {
        customerName: 'Test Consumabile',
        customerEmail: 'test@consumables.test',
        customerPhone: '0700000000',
        deliveryMethod: 'PICKUP',
        paymentMethod: 'CASH',
        paymentStatus: 'PENDING',
        status: 'PROCESSING',
        subtotal: 100,
        totalPrice: 100,
        currency: 'RON',
        source: 'MANUAL'
      }
    });
    console.log(`   Comandă #${order.orderNumber} creată (ID: ${order.id})\n`);
    
    // 3. Creează Production Job
    console.log('3. Creare Production Job...');
    const job = await prisma.productionJob.create({
      data: {
        name: 'Test Job - Consumabile Cyan',
        orderId: order.id,
        machineId: 'cmpljn9h20002s8di8e872cja',
        quantity: 10,
        priority: 'NORMAL',
        status: 'PENDING'
      }
    });
    console.log(`   Job "${job.name}" creat (10 m², ID: ${job.id})\n`);
    
    // 4. Marcare ca COMPLETED (trigger auto-consumption)
    console.log('4. Marcare ca COMPLETED (trigger auto-consumption)...');
    const completed = await prisma.productionJob.update({
      where: { id: job.id },
      data: { status: 'COMPLETED' }
    });
    console.log(`   Status: ${completed.status} ✓\n`);
    
    // 5. Verifică MaterialUsage
    console.log('5. Verificare MaterialUsage...');
    const materialUsages = await prisma.materialUsage.findMany({
      where: { jobId: job.id },
      include: {
        material: { select: { name: true } }
      }
    });
    
    if (materialUsages.length > 0) {
      console.log(`   ✓ ${materialUsages.length} record(e) MaterialUsage create:`);
      materialUsages.forEach(u => {
        console.log(`     - ${u.material.name}: ${u.quantity} ${u.unit}, cost: ${u.cost} RON`);
      });
      console.log();
    } else {
      console.log('   ✗ NU s-au creat MaterialUsage records!\n');
    }
    
    // 6. Verifică stoc după
    console.log('6. Stoc DUPĂ:');
    const afterMaterial = await prisma.material.findUnique({
      where: { id: 'cmpnmnj840000hkdifrrzksyv' },
      select: { name: true, stock: true, unit: true }
    });
    console.log(`   ${afterMaterial.name}: ${afterMaterial.stock} ${afterMaterial.unit}`);
    
    const consumed = beforeMaterial.stock - afterMaterial.stock;
    console.log(`   CONSUMAT: ${consumed} ${afterMaterial.unit}`);
    
    // Verifică dacă consumul corespunde
    const expectedConsumption = 0.05 * 10; // 0.05 ml/m² * 10 m²
    console.log(`   AȘTEPTAT: ${expectedConsumption} ml\n`);
    
    if (Math.abs(consumed - expectedConsumption) < 0.01) {
      console.log('✅ TEST REUȘIT - Consumul corespunde configurației!');
    } else {
      console.log(`⚠️  ATENȚIE - Diferență: ${Math.abs(consumed - expectedConsumption)} ml`);
    }
    
    console.log('\n=== REZUMAT ===');
    console.log(`Comandă: #${order.orderNumber}`);
    console.log(`Job: ${job.name}`);
    console.log(`Cantitate: ${job.quantity} m²`);
    console.log(`MaterialUsage records: ${materialUsages.length}`);
    console.log(`Consum vopsea: ${consumed} ml`);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
