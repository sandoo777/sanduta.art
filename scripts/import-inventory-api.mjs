#!/usr/bin/env node

/**
 * Import complete inventory via Admin Panel API
 * Run: node scripts/import-inventory-api.mjs
 */

const BASE_URL = 'http://localhost:3000';

// Materials data
const materials = [
  { name: 'Hârtie Foto Lucioasă', sku: 'PHOTO-GLOSS-260', unit: 'm²', stock: 50, minStock: 10, costPerUnit: 25.50, notes: '260gsm, finish glossy, compatibil inkjet/laser' },
  { name: 'Hârtie Foto Mată', sku: 'PHOTO-MATT-260', unit: 'm²', stock: 45, minStock: 10, costPerUnit: 24.00, notes: '260gsm, finish matt, compatibil inkjet/laser' },
  { name: 'Hârtie Offset 90g', sku: 'OFFSET-90', unit: 'm²', stock: 200, minStock: 50, costPerUnit: 5.50, notes: '90gsm, alb, ideal pentru documente' },
  { name: 'Hârtie Offset 120g', sku: 'OFFSET-120', unit: 'm²', stock: 150, minStock: 30, costPerUnit: 7.80, notes: '120gsm, alb, pentru broșuri' },
  { name: 'Hârtie Offset 160g', sku: 'OFFSET-160', unit: 'm²', stock: 100, minStock: 20, costPerUnit: 10.50, notes: '160gsm, alb, pentru cărți de vizită' },
  { name: 'Carton 250g', sku: 'CARD-250', unit: 'm²', stock: 80, minStock: 15, costPerUnit: 15.00, notes: '250gsm, rigid, pentru cărți de vizită premium' },
  { name: 'Carton 300g', sku: 'CARD-300', unit: 'm²', stock: 60, minStock: 10, costPerUnit: 18.50, notes: '300gsm, foarte rigid, pentru ambalaje' },
  { name: 'Autocolant PVC', sku: 'VINYL-PVC', unit: 'm²', stock: 40, minStock: 10, costPerUnit: 35.00, notes: 'Autocolant PVC alb impermeabil' },
  { name: 'Canvas', sku: 'CANVAS-380', unit: 'm²', stock: 30, minStock: 5, costPerUnit: 45.00, notes: '380gsm, pânză pictură' },
  { name: 'Hârtie Magnetică', sku: 'MAGNETIC-SHEET', unit: 'm²', stock: 20, minStock: 5, costPerUnit: 55.00, notes: 'Folie magnetică flexibilă' },
  { name: 'Hârtie Reciclabilă', sku: 'RECYCLED-100', unit: 'm²', stock: 70, minStock: 15, costPerUnit: 8.00, notes: '100gsm, kraft, eco-friendly' },
  { name: 'Hârtie Colorată', sku: 'COLOR-MIX-120', unit: 'm²', stock: 50, minStock: 10, costPerUnit: 9.50, notes: '120gsm, diverse culori' },
  { name: 'Hârtie Transparentă', sku: 'TRANSPARENT-100', unit: 'm²', stock: 25, minStock: 5, costPerUnit: 22.00, notes: '100gsm, translucidă' },
  { name: 'Hârtie Termică', sku: 'THERMAL-80', unit: 'm²', stock: 60, minStock: 15, costPerUnit: 12.00, notes: '80gsm, pentru chitanțe' },
];

// Print methods data
const printMethods = [
  { name: 'Inkjet', type: 'Digital', costPerM2: 8.50, speed: '25 m²/oră', maxWidth: 1118, description: 'Imprimare inkjet calitate foto', active: true },
  { name: 'Laser', type: 'Digital', costPerM2: 6.00, costPerSheet: 0.15, speed: '80 ppm', maxWidth: 330, maxHeight: 488, description: 'Imprimare laser rapidă', active: true },
  { name: 'Sublimare', type: 'Transfer', costPerM2: 12.00, speed: '15 m²/oră', maxWidth: 1600, description: 'Transfer termic pentru textile', active: true },
  { name: 'UV', type: 'Digital', costPerM2: 18.00, speed: '30 m²/oră', maxWidth: 2500, description: 'Imprimare UV cu uscare instant', active: true },
  { name: 'Eco-Solvent', type: 'Large Format', costPerM2: 14.00, speed: '20 m²/oră', maxWidth: 1600, description: 'Imprimare eco-solvent exterior', active: true },
  { name: 'Termotransfer', type: 'Transfer', costPerM2: 10.00, costPerSheet: 0.50, speed: '40 transferuri/oră', maxWidth: 400, maxHeight: 500, description: 'Transfer termic obiecte', active: true },
  { name: 'DTG', type: 'Textile', costPerSheet: 2.50, speed: '30 tricouri/oră', maxWidth: 400, maxHeight: 500, description: 'Imprimare directă pe textile', active: true },
  { name: 'DTF', type: 'Transfer', costPerM2: 15.00, speed: '25 m²/oră', maxWidth: 600, description: 'Transfer pe film', active: true },
];

// Finishing operations data
const finishingOps = [
  { name: 'Laminare Lucioasă', type: 'Laminare', costFix: 5.00, costPerM2: 8.00, timeSeconds: 300, description: 'Laminare folie lucioasă', active: true },
  { name: 'Laminare Mată', type: 'Laminare', costFix: 5.00, costPerM2: 8.00, timeSeconds: 300, description: 'Laminare folie mată', active: true },
  { name: 'Capsare', type: 'Îndosariere', costFix: 2.00, costPerUnit: 0.10, timeSeconds: 60, description: 'Capsare cu agrafă', active: true },
  { name: 'Spiralare', type: 'Îndosariere', costFix: 3.00, costPerUnit: 0.50, timeSeconds: 180, description: 'Îndosariere cu spirală', active: true },
  { name: 'Tăiere Contur', type: 'Tăiere', costFix: 10.00, costPerM2: 12.00, timeSeconds: 600, description: 'Tăiere la formă cu plotter', active: true },
  { name: 'Biguire', type: 'Finisare', costFix: 2.00, costPerUnit: 0.05, timeSeconds: 120, description: 'Șanț pentru pliere', active: true },
  { name: 'Perforare', type: 'Finisare', costFix: 1.50, costPerUnit: 0.03, timeSeconds: 90, description: 'Găurire pentru îndosariere', active: true },
  { name: 'Pliere', type: 'Finisare', costFix: 1.00, costPerUnit: 0.05, timeSeconds: 60, description: 'Pliere la jumătate sau în 3', active: true },
  { name: 'Îndosariere', type: 'Îndosariere', costFix: 5.00, costPerUnit: 1.00, timeSeconds: 300, description: 'Asamblare completă', active: true },
  { name: 'Colț Rotunjit', type: 'Finisare', costFix: 3.00, costPerUnit: 0.10, timeSeconds: 120, description: 'Rotunjire colțuri', active: true },
  { name: 'Aplicare Magnet', type: 'Montaj', costFix: 5.00, costPerM2: 20.00, timeSeconds: 180, description: 'Aplicare folie magnetică', active: true },
  { name: 'Aplicare Suport Rigid', type: 'Montaj', costFix: 8.00, costPerM2: 25.00, timeSeconds: 300, description: 'Montaj pe foam/dibond', active: true },
];

// Machines data
const machines = [
  { name: 'Epson SureColor P700', type: 'Photo Inkjet', costPerHour: 15.00, speed: '13 min/A2', maxWidth: 432, description: 'Imprimantă photo A3+ 10 culori', active: true },
  { name: 'Canon imagePROGRAF PRO-300', type: 'Photo Inkjet', costPerHour: 18.00, speed: '90s/A3', maxWidth: 432, description: 'Imprimantă A3+ pigment', active: true },
  { name: 'HP Latex 315', type: 'Large Format', costPerHour: 35.00, speed: '23 m²/oră', maxWidth: 1625, description: 'Latex 64 inch', active: true },
  { name: 'Mimaki CJV300-160', type: 'Print & Cut', costPerHour: 40.00, speed: '20 m²/oră', maxWidth: 1610, description: 'Eco-solvent cu plotter', active: true },
  { name: 'Xerox Versant 180', type: 'Production', costPerHour: 50.00, speed: '80 ppm', maxWidth: 330, maxHeight: 660, description: 'Digitală de producție', active: true },
  { name: 'Ricoh Pro C5300s', type: 'Production', costPerHour: 55.00, speed: '90 ppm', maxWidth: 330, maxHeight: 700, description: 'Producție cu finishing', active: true },
];

async function addMaterials() {
  console.log('\n📦 Adding Materials...');
  let added = 0;
  for (const material of materials) {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(material),
      });
      
      if (response.ok) {
        console.log(`  ✓ ${material.name}`);
        added++;
      } else {
        console.log(`  ✗ ${material.name} - ${response.status}`);
      }
    } catch (error) {
      console.log(`  ✗ ${material.name} - ${error.message}`);
    }
  }
  console.log(`✅ Added ${added}/${materials.length} materials`);
}

async function addPrintMethods() {
  console.log('\n🖨️  Adding Print Methods...');
  let added = 0;
  for (const method of printMethods) {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/print-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method),
      });
      
      if (response.ok) {
        console.log(`  ✓ ${method.name}`);
        added++;
      } else {
        console.log(`  ✗ ${method.name} - ${response.status}`);
      }
    } catch (error) {
      console.log(`  ✗ ${method.name} - ${error.message}`);
    }
  }
  console.log(`✅ Added ${added}/${printMethods.length} print methods`);
}

async function addFinishing() {
  console.log('\n✂️  Adding Finishing Operations...');
  let added = 0;
  for (const finishing of finishingOps) {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/finishing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finishing),
      });
      
      if (response.ok) {
        console.log(`  ✓ ${finishing.name}`);
        added++;
      } else {
        console.log(`  ✗ ${finishing.name} - ${response.status}`);
      }
    } catch (error) {
      console.log(`  ✗ ${finishing.name} - ${error.message}`);
    }
  }
  console.log(`✅ Added ${added}/${finishingOps.length} finishing operations`);
}

async function addMachines() {
  console.log('\n🖨️  Adding Machines...');
  let added = 0;
  for (const machine of machines) {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/machines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(machine),
      });
      
      if (response.ok) {
        console.log(`  ✓ ${machine.name}`);
        added++;
      } else {
        console.log(`  ✗ ${machine.name} - ${response.status}`);
      }
    } catch (error) {
      console.log(`  ✗ ${machine.name} - ${error.message}`);
    }
  }
  console.log(`✅ Added ${added}/${machines.length} machines`);
}

async function main() {
  console.log('🏭 Importing complete digital print shop inventory via API...\n');
  
  await addMaterials();
  await addPrintMethods();
  await addFinishing();
  await addMachines();
  
  console.log('\n🎉 Import complete!');
  console.log('\n✅ Check Admin Panel:');
  console.log('   • Materials: http://localhost:3000/admin/materials');
  console.log('   • Print Methods: http://localhost:3000/admin/print-methods');
  console.log('   • Finishing: http://localhost:3000/admin/finishing');
  console.log('   • Machines: http://localhost:3000/admin/machines');
}

main().catch(console.error);
