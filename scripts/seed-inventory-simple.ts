import { PrismaClient } from '@prisma/client';

// Create simple Prisma client for seeding
const prisma = new PrismaClient();

async function main() {
  console.log('🏭 Seeding inventory...\n');

  // Materials
  console.log('📦 Adding Materials...');
  const materials = [
    { name: 'Hârtie Foto Lucioasă', sku: 'PHOTO-GLOSS-260', unit: 'm²', stock: 50, minStock: 10, costPerUnit: 25.50, notes: '260gsm, finish glossy' },
    { name: 'Hârtie Foto Mată', sku: 'PHOTO-MATT-260', unit: 'm²', stock: 45, minStock: 10, costPerUnit: 24.00, notes: '260gsm, finish matt' },
    { name: 'Hârtie Offset 90g', sku: 'OFFSET-90', unit: 'm²', stock: 200, minStock: 50, costPerUnit: 5.50, notes: '90gsm, alb' },
    { name: 'Hârtie Offset 120g', sku: 'OFFSET-120', unit: 'm²', stock: 150, minStock: 30, costPerUnit: 7.80, notes: '120gsm, alb' },
    { name: 'Hârtie Offset 160g', sku: 'OFFSET-160', unit: 'm²', stock: 100, minStock: 20, costPerUnit: 10.50, notes: '160gsm, alb' },
    { name: 'Carton 250g', sku: 'CARD-250', unit: 'm²', stock: 80, minStock: 15, costPerUnit: 15.00, notes: '250gsm, rigid' },
    { name: 'Carton 300g', sku: 'CARD-300', unit: 'm²', stock: 60, minStock: 10, costPerUnit: 18.50, notes: '300gsm, rigid' },
    { name: 'Autocolant PVC', sku: 'VINYL-PVC', unit: 'm²', stock: 40, minStock: 10, costPerUnit: 35.00, notes: 'PVC impermeabil' },
    { name: 'Canvas', sku: 'CANVAS-380', unit: 'm²', stock: 30, minStock: 5, costPerUnit: 45.00, notes: '380gsm, pânză' },
    { name: 'Hârtie Magnetică', sku: 'MAGNETIC-SHEET', unit: 'm²', stock: 20, minStock: 5, costPerUnit: 55.00, notes: 'Folie magnetică' },
    { name: 'Hârtie Reciclabilă', sku: 'RECYCLED-100', unit: 'm²', stock: 70, minStock: 15, costPerUnit: 8.00, notes: '100gsm, kraft' },
    { name: 'Hârtie Colorată', sku: 'COLOR-MIX-120', unit: 'm²', stock: 50, minStock: 10, costPerUnit: 9.50, notes: '120gsm, diverse culori' },
    { name: 'Hârtie Transparentă', sku: 'TRANSPARENT-100', unit: 'm²', stock: 25, minStock: 5, costPerUnit: 22.00, notes: '100gsm, translucidă' },
    { name: 'Hârtie Termică', sku: 'THERMAL-80', unit: 'm²', stock: 60, minStock: 15, costPerUnit: 12.00, notes: '80gsm, termică' },
  ];

  for (const m of materials) {
    await prisma.material.upsert({
      where: { sku: m.sku },
      update: m,
      create: m,
    });
    console.log(`  ✓ ${m.name}`);
  }

  // Print Methods
  console.log('\n🖨️  Adding Print Methods...');
  const printMethods = [
    { name: 'Inkjet', type: 'Digital', costPerM2: 8.50, speed: '25 m²/oră', maxWidth: 1118, description: 'Imprimare inkjet calitate foto', active: true },
    { name: 'Laser', type: 'Digital', costPerM2: 6.00, costPerSheet: 0.15, speed: '80 ppm', maxWidth: 330, maxHeight: 488, description: 'Imprimare laser rapidă', active: true },
    { name: 'Sublimare', type: 'Transfer', costPerM2: 12.00, speed: '15 m²/oră', maxWidth: 1600, description: 'Transfer termic textile', active: true },
    { name: 'UV', type: 'Digital', costPerM2: 18.00, speed: '30 m²/oră', maxWidth: 2500, description: 'Imprimare UV instant', active: true },
    { name: 'Eco-Solvent', type: 'Large Format', costPerM2: 14.00, speed: '20 m²/oră', maxWidth: 1600, description: 'Eco-solvent exterior', active: true },
    { name: 'Termotransfer', type: 'Transfer', costPerM2: 10.00, costPerSheet: 0.50, speed: '40/oră', maxWidth: 400, maxHeight: 500, description: 'Transfer termic', active: true },
    { name: 'DTG', type: 'Textile', costPerSheet: 2.50, speed: '30 tricouri/oră', maxWidth: 400, maxHeight: 500, description: 'Direct to garment', active: true },
    { name: 'DTF', type: 'Transfer', costPerM2: 15.00, speed: '25 m²/oră', maxWidth: 600, description: 'Direct to film', active: true },
  ];

  for (const pm of printMethods) {
    await prisma.printMethod.create({ data: pm });
    console.log(`  ✓ ${pm.name}`);
  }

  // Finishing
  console.log('\n✂️  Adding Finishing...');
  const finishing = [
    { name: 'Laminare Lucioasă', type: 'Laminare', costFix: 5.00, costPerM2: 8.00, timeSeconds: 300, description: 'Laminare lucioasă', active: true },
    { name: 'Laminare Mată', type: 'Laminare', costFix: 5.00, costPerM2: 8.00, timeSeconds: 300, description: 'Laminare mată', active: true },
    { name: 'Capsare', type: 'Îndosariere', costFix: 2.00, costPerUnit: 0.10, timeSeconds: 60, description: 'Capsare agrafă', active: true },
    { name: 'Spiralare', type: 'Îndosariere', costFix: 3.00, costPerUnit: 0.50, timeSeconds: 180, description: 'Îndosariere spirală', active: true },
    { name: 'Tăiere Contur', type: 'Tăiere', costFix: 10.00, costPerM2: 12.00, timeSeconds: 600, description: 'Tăiere plotter', active: true },
    { name: 'Biguire', type: 'Finisare', costFix: 2.00, costPerUnit: 0.05, timeSeconds: 120, description: 'Șanț pliere', active: true },
    { name: 'Perforare', type: 'Finisare', costFix: 1.50, costPerUnit: 0.03, timeSeconds: 90, description: 'Găurire', active: true },
    { name: 'Pliere', type: 'Finisare', costFix: 1.00, costPerUnit: 0.05, timeSeconds: 60, description: 'Pliere', active: true },
    { name: 'Îndosariere', type: 'Îndosariere', costFix: 5.00, costPerUnit: 1.00, timeSeconds: 300, description: 'Asamblare', active: true },
    { name: 'Colț Rotunjit', type: 'Finisare', costFix: 3.00, costPerUnit: 0.10, timeSeconds: 120, description: 'Rotunjire colțuri', active: true },
    { name: 'Aplicare Magnet', type: 'Montaj', costFix: 5.00, costPerM2: 20.00, timeSeconds: 180, description: 'Aplicare magnetică', active: true },
    { name: 'Aplicare Suport Rigid', type: 'Montaj', costFix: 8.00, costPerM2: 25.00, timeSeconds: 300, description: 'Montaj rigid', active: true },
  ];

  for (const f of finishing) {
    await prisma.finishingOperation.create({ data: f });
    console.log(`  ✓ ${f.name}`);
  }

  // Machines
  console.log('\n🖨️  Adding Machines...');
  const machines = [
    { name: 'Epson SureColor P700', type: 'Photo Inkjet', costPerHour: 15.00, speed: '13 min/A2', maxWidth: 432, description: 'Photo A3+ 10 culori', active: true },
    { name: 'Canon imagePROGRAF PRO-300', type: 'Photo Inkjet', costPerHour: 18.00, speed: '90s/A3', maxWidth: 432, description: 'A3+ pigment', active: true },
    { name: 'HP Latex 315', type: 'Large Format', costPerHour: 35.00, speed: '23 m²/oră', maxWidth: 1625, description: 'Latex 64"', active: true },
    { name: 'Mimaki CJV300-160', type: 'Print & Cut', costPerHour: 40.00, speed: '20 m²/oră', maxWidth: 1610, description: 'Eco-solvent plotter', active: true },
    { name: 'Xerox Versant 180', type: 'Production', costPerHour: 50.00, speed: '80 ppm', maxWidth: 330, maxHeight: 660, description: 'Digitală producție', active: true },
    { name: 'Ricoh Pro C5300s', type: 'Production', costPerHour: 55.00, speed: '90 ppm', maxWidth: 330, maxHeight: 700, description: 'Producție finishing', active: true },
  ];

  for (const mach of machines) {
    await prisma.machine.create({ data: mach });
    console.log(`  ✓ ${mach.name}`);
  }

  console.log('\n🎉 Inventory seeding complete!');
  console.log('\n📊 Summary:');
  console.log(`   • ${materials.length} materials`);
  console.log(`   • ${printMethods.length} print methods`);
  console.log(`   • ${finishing.length} finishing operations`);
  console.log(`   • ${machines.length} machines`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
