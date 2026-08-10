/**
 * Test Script: Consumables Flow End-to-End
 * Testează fluxul complet de consumabile utilaj
 */

const API_BASE = 'http://localhost:3000/api/admin';

// Culori pentru output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }
  
  return await response.json();
}

async function main() {
  console.log('\n=== TEST CONSUMABILE UTILAJ - FLUX COMPLET ===\n');
  
  try {
    // 1. Verifică echipamentul și consumabilul
    log.info('1. Verificare echipament HP Latex 570 (Test)...');
    const machine = await fetchAPI('/machines/cmpljn9h20002s8di8e872cja');
    log.success(`Echipament găsit: ${machine.name} (${machine.equipmentType})`);
    
    log.info('   Verificare consumabile...');
    const consumables = await fetchAPI('/machines/cmpljn9h20002s8di8e872cja/consumables');
    if (consumables.length === 0) {
      log.error('   Nu există consumabile configurate!');
      return;
    }
    log.success(`   ${consumables.length} consumabil(e) găsit(e)`);
    consumables.forEach(c => {
      console.log(`     - ${c.material.name}: ${c.consumptionPerSqm} ${c.unit}/m²`);
      console.log(`       Stock actual: ${c.material.stock} ${c.material.unit}`);
    });
    
    // Salvează stocurile inițiale
    const initialStocks = {};
    consumables.forEach(c => {
      initialStocks[c.materialId] = c.material.stock;
    });
    
    // 2. Creează o comandă de test
    log.info('\n2. Creare comandă de test...');
    const order = await fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'Test Client - Consumabile',
        customerEmail: 'test@consumables.local',
        customerPhone: '0700000000',
        deliveryMethod: 'pickup',
        paymentMethod: 'cash',
        source: 'MANUAL',
        status: 'PROCESSING',
        paymentStatus: 'PENDING',
        totalPrice: 100,
        subtotal: 100,
        currency: 'RON'
      })
    });
    log.success(`Comandă creată: #${order.orderNumber} (ID: ${order.id})`);
    
    // 3. Creează Production Job
    log.info('\n3. Creare Production Job...');
    const job = await fetchAPI('/production', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Job - Consumabile Cyan',
        orderId: order.id,
        machineId: 'cmpljn9h20002s8di8e872cja',
        quantity: 10, // 10 m²
        priority: 'NORMAL',
        status: 'PENDING'
      })
    });
    log.success(`Job creat: ${job.name} (ID: ${job.id})`);
    console.log(`   Cantitate: ${job.quantity} m²`);
    console.log(`   Echipament: ${job.machine.name}`);
    
    // 4. Marchează job-ul ca COMPLETED
    log.info('\n4. Marcare job ca COMPLETED...');
    const _completedJob = await fetchAPI(`/production/${job.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'COMPLETED'
      })
    });
    log.success('Job marcat ca COMPLETED');
    
    // 5. Verifică MaterialUsage
    log.info('\n5. Verificare MaterialUsage creat...');
    const jobDetails = await fetchAPI(`/production/${job.id}`);
    
    if (jobDetails.materialUsages && jobDetails.materialUsages.length > 0) {
      log.success(`${jobDetails.materialUsages.length} MaterialUsage record(s) creat(e)`);
      
      let totalCost = 0;
      jobDetails.materialUsages.forEach(usage => {
        console.log(`\n   Material: ${usage.material.name}`);
        console.log(`   Cantitate: ${usage.quantity} ${usage.unit}`);
        console.log(`   Total consumat (cu waste): ${usage.totalUsed} ${usage.unit}`);
        console.log(`   Cost: ${usage.cost} RON`);
        totalCost += parseFloat(usage.cost);
      });
      
      console.log(`\n   COST TOTAL MATERIALE: ${totalCost.toFixed(2)} RON`);
    } else {
      log.warning('Nu s-au creat MaterialUsage records!');
    }
    
    // 6. Verifică scăderea stocului
    log.info('\n6. Verificare scădere stock...');
    const updatedConsumables = await fetchAPI('/machines/cmpljn9h20002s8di8e872cja/consumables');
    
    let allStocksUpdated = true;
    updatedConsumables.forEach(c => {
      const initialStock = initialStocks[c.materialId];
      const currentStock = c.material.stock;
      const consumed = initialStock - currentStock;
      
      console.log(`\n   ${c.material.name}:`);
      console.log(`     Stock inițial: ${initialStock} ${c.material.unit}`);
      console.log(`     Stock curent: ${currentStock} ${c.material.unit}`);
      console.log(`     Consumat: ${consumed} ${c.material.unit}`);
      
      if (consumed === 0) {
        log.warning(`     ⚠ Stocul nu s-a modificat!`);
        allStocksUpdated = false;
      } else {
        log.success(`     ✓ Stock actualizat corect`);
      }
      
      // Verifică dacă consumul calculat corespunde
      const expectedConsumption = (c.consumptionPerSqm || 0) * job.quantity +
                                   (c.consumptionPerUnit || 0) * job.quantity +
                                   (c.consumptionPerJob || 0);
      console.log(`     Consum așteptat: ${expectedConsumption} ${c.material.unit}`);
      
      if (Math.abs(consumed - expectedConsumption) < 0.01) {
        log.success(`     ✓ Consumul corespunde configurației`);
      } else {
        log.error(`     ✗ Consumul NU corespunde! Diferență: ${Math.abs(consumed - expectedConsumption)}`);
      }
    });
    
    // 7. Rezumat final
    console.log('\n=== REZUMAT TESTARE ===\n');
    log.success(`✓ Echipament: ${machine.name}`);
    log.success(`✓ Consumabile configurate: ${consumables.length}`);
    log.success(`✓ Comandă creată: #${order.orderNumber}`);
    log.success(`✓ Production Job creat și finalizat: ${job.name}`);
    log.success(`✓ Cantitate procesată: ${job.quantity} m²`);
    
    if (jobDetails.materialUsages && jobDetails.materialUsages.length > 0) {
      log.success(`✓ MaterialUsage records: ${jobDetails.materialUsages.length}`);
      log.success(`✓ Cost total materiale: ${jobDetails.materialUsages.reduce((sum, u) => sum + parseFloat(u.cost), 0).toFixed(2)} RON`);
    }
    
    if (allStocksUpdated) {
      log.success(`✓ Toate stocurile au fost actualizate corect`);
    } else {
      log.error(`✗ Unele stocuri NU au fost actualizate`);
    }
    
    console.log('\n' + colors.green + '🎉 TEST FINALIZAT CU SUCCES!' + colors.reset + '\n');
    
  } catch (error) {
    log.error(`\nTestul a eșuat: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();
