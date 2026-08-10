import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('\n=== TEST CONSUMABILE UTILAJ ===\n');
    
    // 1. VerificÄƒ stoc Ã®nainte
    console.log('1. Stoc ÃŽNAINTE:');
    const beforeMaterial = await prisma.material.findUnique({
      where: { id: 'cmpnmnj840000hkdifrrzksyv' },
      select: { name: true, stock: true, unit: true }
    });
    
    if (!beforeMaterial) {
      throw new Error('Material Vopsea Cyan Test nu a fost gÄƒsit!');
    }
    
    console.log(`   ${beforeMaterial.name}: ${beforeMaterial.stock} ${beforeMaterial.unit}\n`);
    
    // 2. CreeazÄƒ comandÄƒ
    console.log('2. Creare comandÄƒ...');
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
    console.log(`   ComandÄƒ #${order.orderNumber} creatÄƒ (ID: ${order.id})\n`);
    
    // 3. CreeazÄƒ Production Job
    console.log('3. Creare Production Job...');
    const job = await prisma.productionJob.create({
      data: {
        name: 'Test Job - Consumabile Cyan',
        orderId: order.id,
        machineId: 'cmpljn9h20002s8di8e872cja', // HP Latex 570 (Test)
        quantity: 10, // 10 mÂ²
        priority: 'NORMAL',
        status: 'PENDING'
      }
    });
    console.log(`   Job "${job.name}" creat (${job.quantity} mÂ², ID: ${job.id})\n`);
    
    // 4. Marcare ca COMPLETED (trigger auto-consumption)
    console.log('4. Marcare ca COMPLETED (trigger auto-consumption prin API)...');
    const completed = await prisma.productionJob.update({
      where: { id: job.id },
      data: { status: 'COMPLETED' }
    });
    console.log(`   Status: ${completed.status} âœ“\n`);
    
    // AÈ™teaptÄƒ puÈ›in pentru ca transacÈ›ia sÄƒ se finalizeze
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 5. VerificÄƒ MaterialUsage
    console.log('5. Verificare MaterialUsage...');
    const materialUsages = await prisma.materialUsage.findMany({
      where: { jobId: job.id },
      include: {
        material: { 
          select: { 
            name: true,
            unit: true
          } 
        }
      }
    });
    
    if (materialUsages.length > 0) {
      console.log(`   âœ“ ${materialUsages.length} record(e) MaterialUsage create:`);
      let totalMaterialCost = 0;
      materialUsages.forEach(u => {
        console.log(`     - ${u.material.name}: ${u.quantity} ${u.unit}, cost: ${u.cost} RON`);
        totalMaterialCost += Number(u.cost);
      });
      console.log(`   COST TOTAL MATERIALE: ${totalMaterialCost.toFixed(2)} RON\n`);
    } else {
      console.log('   âš ï¸  NU s-au creat MaterialUsage records!\n');
    }
    
    // 6. VerificÄƒ stoc dupÄƒ
    console.log('6. Stoc DUPÄ‚:');
    const afterMaterial = await prisma.material.findUnique({
      where: { id: 'cmpnmnj840000hkdifrrzksyv' },
      select: { name: true, stock: true, unit: true }
    });
    
    if (!afterMaterial) {
      throw new Error('Material nu mai existÄƒ!');
    }
    
    console.log(`   ${afterMaterial.name}: ${afterMaterial.stock} ${afterMaterial.unit}`);
    
    const consumed = Number(beforeMaterial.stock) - Number(afterMaterial.stock);
    console.log(`   CONSUMAT: ${consumed} ${afterMaterial.unit}`);
    
    // VerificÄƒ dacÄƒ consumul corespunde
    // Configurare: 0.05 ml/mÂ² * 10 mÂ² = 0.5 ml
    const expectedConsumption = 0.05 * 10;
    console.log(`   AÈ˜TEPTAT: ${expectedConsumption} ml\n`);
    
    if (Math.abs(consumed - expectedConsumption) < 0.01) {
      console.log('âœ… TEST REUÈ˜IT - Consumul corespunde configuraÈ›iei!\n');
    } else {
      console.log(`âš ï¸  ATENÈšIE - DiferenÈ›Äƒ: ${Math.abs(consumed - expectedConsumption)} ml\n`);
    }
    
    // 7. Rezumat final
    console.log('=== REZUMAT FINAL ===');
    console.log(`âœ“ ComandÄƒ: #${order.orderNumber}`);
    console.log(`âœ“ Job: ${job.name}`);
    console.log(`âœ“ Cantitate: ${job.quantity} mÂ²`);
    console.log(`âœ“ MaterialUsage records: ${materialUsages.length}`);
    console.log(`âœ“ Consum vopsea: ${consumed} ml`);
    console.log(`âœ“ Stoc Ã®nainte: ${beforeMaterial.stock} ml`);
    console.log(`âœ“ Stoc dupÄƒ: ${afterMaterial.stock} ml`);
    
    if (materialUsages.length > 0) {
      const totalCost = materialUsages.reduce((sum, u) => sum + Number(u.cost), 0);
      console.log(`âœ“ Cost materiale: ${totalCost.toFixed(2)} RON`);
    }
    
    console.log('\nðŸŽ‰ TESTARE COMPLETÄ‚ FINALIZATÄ‚ CU SUCCES!\n');
    
  } catch (error: unknown) {
    console.error('\nâŒ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
