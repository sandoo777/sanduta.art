// Direct PostgreSQL import without Prisma adapter issues
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sanduta',
});

async function addMaterials() {
  console.log('\n📦 Adding Materials...');
  const materials = [
    ['Hârtie Foto Lucioasă', 'PHOTO-GLOSS-260', 'm²', 50, 10, 25.50, '260gsm, finish glossy'],
    ['Hârtie Foto Mată', 'PHOTO-MATT-260', 'm²', 45, 10, 24.00, '260gsm, finish matt'],
    ['Hârtie Offset 90g', 'OFFSET-90', 'm²', 200, 50, 5.50, '90gsm, alb'],
    ['Hârtie Offset 120g', 'OFFSET-120', 'm²', 150, 30, 7.80, '120gsm, alb'],
    ['Hârtie Offset 160g', 'OFFSET-160', 'm²', 100, 20, 10.50, '160gsm, alb'],
    ['Carton 250g', 'CARD-250', 'm²', 80, 15, 15.00, '250gsm, rigid'],
    ['Carton 300g', 'CARD-300', 'm²', 60, 10, 18.50, '300gsm, rigid'],
    ['Autocolant PVC', 'VINYL-PVC', 'm²', 40, 10, 35.00, 'PVC impermeabil'],
    ['Canvas', 'CANVAS-380', 'm²', 30, 5, 45.00, '380gsm, pânză'],
    ['Hârtie Magnetică', 'MAGNETIC-SHEET', 'm²', 20, 5, 55.00, 'Folie magnetică'],
    ['Hârtie Reciclabilă', 'RECYCLED-100', 'm²', 70, 15, 8.00, '100gsm, kraft'],
    ['Hârtie Colorată', 'COLOR-MIX-120', 'm²', 50, 10, 9.50, '120gsm, culori'],
    ['Hârtie Transparentă', 'TRANSPARENT-100', 'm²', 25, 5, 22.00, '100gsm, transparent'],
    ['Hârtie Termică', 'THERMAL-80', 'm²', 60, 15, 12.00, '80gsm, termică'],
  ];

  for (const [name, sku, unit, stock, minStock, cost, notes] of materials) {
    await pool.query(
      `INSERT INTO materials (id, name, sku, unit, stock, "minStock", "costPerUnit", notes, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (sku) DO UPDATE SET 
         name = EXCLUDED.name,
         unit = EXCLUDED.unit,
         stock = EXCLUDED.stock,
         "minStock" = EXCLUDED."minStock",
         "costPerUnit" = EXCLUDED."costPerUnit",
         notes = EXCLUDED.notes,
         "updatedAt" = NOW()`,
      [name, sku, unit, stock, minStock, cost, notes]
    );
    console.log(`  ✓ ${name}`);
  }
  console.log(`✅ Added ${materials.length} materials`);
}

async function addPrintMethods() {
  console.log('\n🖨️  Adding Print Methods...');
  const methods = [
    ['Inkjet', 'Digital', 8.50, null, '25 m²/oră', 1118, null, 'Imprimare inkjet foto', true],
    ['Laser', 'Digital', 6.00, 0.15, '80 ppm', 330, 488, 'Laser rapid', true],
    ['Sublimare', 'Transfer', 12.00, null, '15 m²/oră', 1600, null, 'Transfer textile', true],
    ['UV', 'Digital', 18.00, null, '30 m²/oră', 2500, null, 'UV instant', true],
    ['Eco-Solvent', 'Large Format', 14.00, null, '20 m²/oră', 1600, null, 'Eco exterior', true],
    ['Termotransfer', 'Transfer', 10.00, 0.50, '40/oră', 400, 500, 'Transfer termic', true],
    ['DTG', 'Textile', null, 2.50, '30 tricouri/oră', 400, 500, 'Direct garment', true],
    ['DTF', 'Transfer', 15.00, null, '25 m²/oră', 600, null, 'Direct film', true],
  ];

  for (const [name, type, costM2, costSheet, speed, width, height, desc, active] of methods) {
    await pool.query(
      `INSERT INTO print_methods (id, name, type, "costPerM2", "costPerSheet", speed, "maxWidth", "maxHeight", description, active, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
      [name, type, costM2, costSheet, speed, width, height, desc, active]
    );
    console.log(`  ✓ ${name}`);
  }
  console.log(`✅ Added ${methods.length} print methods`);
}

async function addFinishing() {
  console.log('\n✂️  Adding Finishing...');
  const finishing = [
    ['Laminare Lucioasă', 'Laminare', 5.00, null, 8.00, 300, 'Laminare lucioasă', true],
    ['Laminare Mată', 'Laminare', 5.00, null, 8.00, 300, 'Laminare mată', true],
    ['Capsare', 'Îndosariere', 2.00, 0.10, null, 60, 'Capsare agrafă', true],
    ['Spiralare', 'Îndosariere', 3.00, 0.50, null, 180, 'Spirală', true],
    ['Tăiere Contur', 'Tăiere', 10.00, null, 12.00, 600, 'Tăiere plotter', true],
    ['Biguire', 'Finisare', 2.00, 0.05, null, 120, 'Șanț', true],
    ['Perforare', 'Finisare', 1.50, 0.03, null, 90, 'Găuri', true],
    ['Pliere', 'Finisare', 1.00, 0.05, null, 60, 'Pliere', true],
    ['Îndosariere', 'Îndosariere', 5.00, 1.00, null, 300, 'Asamblare', true],
    ['Colț Rotunjit', 'Finisare', 3.00, 0.10, null, 120, 'Rotunjire', true],
    ['Aplicare Magnet', 'Montaj', 5.00, null, 20.00, 180, 'Magnetică', true],
    ['Aplicare Suport Rigid', 'Montaj', 8.00, null, 25.00, 300, 'Rigid', true],
  ];

  for (const [name, type, costFix, costUnit, costM2, time, desc, active] of finishing) {
    await pool.query(
      `INSERT INTO finishing_operations (id, name, type, "costFix", "costPerUnit", "costPerM2", "timeSeconds", description, active, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [name, type, costFix, costUnit, costM2, time, desc, active]
    );
    console.log(`  ✓ ${name}`);
  }
  console.log(`✅ Added ${finishing.length} finishing operations`);
}

async function addMachines() {
  console.log('\n🖨️  Adding Machines...');
  const machines = [
    ['Epson SureColor P700', 'Photo Inkjet', 15.00, '13 min/A2', 432, null, 'Photo A3+', true],
    ['Canon imagePROGRAF PRO-300', 'Photo Inkjet', 18.00, '90s/A3', 432, null, 'A3+ pigment', true],
    ['HP Latex 315', 'Large Format', 35.00, '23 m²/oră', 1625, null, 'Latex 64"', true],
    ['Mimaki CJV300-160', 'Print & Cut', 40.00, '20 m²/oră', 1610, null, 'Eco-solvent', true],
    ['Xerox Versant 180', 'Production', 50.00, '80 ppm', 330, 660, 'Producție', true],
    ['Ricoh Pro C5300s', 'Production', 55.00, '90 ppm', 330, 700, 'Finishing', true],
  ];

  for (const [name, type, cost, speed, width, height, desc, active] of machines) {
    await pool.query(
      `INSERT INTO machines (id, name, type, "costPerHour", speed, "maxWidth", "maxHeight", description, active, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [name, type, cost, speed, width, height, desc, active]
    );
    console.log(`  ✓ ${name}`);
  }
  console.log(`✅ Added ${machines.length} machines`);
}

async function main() {
  console.log('🏭 Importing inventory via direct PostgreSQL...\n');
  
  try {
    await addMaterials();
    await addPrintMethods();
    await addFinishing();
    await addMachines();
    
    console.log('\n🎉 Import complete!');
    console.log('\n✅ Check Admin Panel:');
    console.log('   • http://localhost:3000/admin/materials');
    console.log('   • http://localhost:3000/admin/print-methods');
    console.log('   • http://localhost:3000/admin/finishing');
    console.log('   • http://localhost:3000/admin/machines');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
