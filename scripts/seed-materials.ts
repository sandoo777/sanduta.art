import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding materials...\n');

  const materials = [
    // Paper materials
    {
      name: 'Hârtie offset 80g/m²',
      sku: 'PAPER-OFF-80',
      unit: 'm²',
      stock: 5000,
      minStock: 1000,
      costPerUnit: 2.50,
      notes: 'Hârtie standard pentru flyere și broșuri',
    },
    {
      name: 'Hârtie offset 120g/m²',
      sku: 'PAPER-OFF-120',
      unit: 'm²',
      stock: 3500,
      minStock: 800,
      costPerUnit: 3.80,
      notes: 'Hârtie premium pentru imprimare high-quality',
    },
    {
      name: 'Hârtie lucioasă 130g/m²',
      sku: 'PAPER-GLO-130',
      unit: 'm²',
      stock: 2800,
      minStock: 600,
      costPerUnit: 4.20,
      notes: 'Hârtie lucioasă pentru flyere premium',
    },
    {
      name: 'Hârtie lucioasă 170g/m²',
      sku: 'PAPER-GLO-170',
      unit: 'm²',
      stock: 2200,
      minStock: 500,
      costPerUnit: 5.60,
      notes: 'Hârtie lucioasă groasă pentru flyere de lux',
    },
    {
      name: 'Hârtie mată 170g/m²',
      sku: 'PAPER-MAT-170',
      unit: 'm²',
      stock: 1800,
      minStock: 400,
      costPerUnit: 5.40,
      notes: 'Hârtie mată elegantă pentru flyere business',
    },

    // Cardboard materials
    {
      name: 'Carton 300g/m²',
      sku: 'CARD-300',
      unit: 'm²',
      stock: 1500,
      minStock: 300,
      costPerUnit: 8.50,
      notes: 'Carton pentru cărți de vizită și postere',
    },
    {
      name: 'Carton 350g/m²',
      sku: 'CARD-350',
      unit: 'm²',
      stock: 1200,
      minStock: 250,
      costPerUnit: 9.80,
      notes: 'Carton gros premium pentru cărți de vizită de lux',
    },

    // PVC and banner materials
    {
      name: 'PVC banner 440g/m²',
      sku: 'PVC-BAN-440',
      unit: 'm²',
      stock: 800,
      minStock: 150,
      costPerUnit: 12.50,
      notes: 'Material rezistent pentru bannere exterior',
    },
    {
      name: 'PVC rigid 3mm',
      sku: 'PVC-RIG-3',
      unit: 'm²',
      stock: 600,
      minStock: 100,
      costPerUnit: 18.00,
      notes: 'PVC rigid pentru panouri publicitare',
    },
    {
      name: 'PVC rigid 5mm',
      sku: 'PVC-RIG-5',
      unit: 'm²',
      stock: 450,
      minStock: 80,
      costPerUnit: 25.00,
      notes: 'PVC rigid gros pentru panouri durabile',
    },

    // Vinyl and stickers
    {
      name: 'Autocolant alb glossy',
      sku: 'VINYL-WHT-GLO',
      unit: 'm²',
      stock: 1000,
      minStock: 200,
      costPerUnit: 6.50,
      notes: 'Autocolant luccios pentru stickere',
    },
    {
      name: 'Autocolant transparent',
      sku: 'VINYL-TRS',
      unit: 'm²',
      stock: 750,
      minStock: 150,
      costPerUnit: 7.80,
      notes: 'Autocolant transparent pentru aplicații speciale',
    },

    // Forex materials
    {
      name: 'Forex 3mm',
      sku: 'FOREX-3',
      unit: 'm²',
      stock: 400,
      minStock: 80,
      costPerUnit: 16.00,
      notes: 'Forex standard pentru panouri ușoare',
    },
    {
      name: 'Forex 5mm',
      sku: 'FOREX-5',
      unit: 'm²',
      stock: 300,
      minStock: 60,
      costPerUnit: 22.00,
      notes: 'Forex gros pentru panouri rezistente',
    },

    // Textile materials
    {
      name: 'Textil banner 110g/m²',
      sku: 'TEX-BAN-110',
      unit: 'm²',
      stock: 500,
      minStock: 100,
      costPerUnit: 14.50,
      notes: 'Material textil pentru bannere și rollup-uri',
    },

    // Low stock materials (for testing alerts)
    {
      name: 'Hârtie specială A4',
      sku: 'PAPER-SPC-A4',
      unit: 'coală',
      stock: 150,
      minStock: 500,
      costPerUnit: 0.80,
      notes: 'Hârtie specială - STOC SCĂZUT',
    },
    {
      name: 'Carton metalic A5',
      sku: 'CARD-MET-A5',
      unit: 'coală',
      stock: 80,
      minStock: 300,
      costPerUnit: 1.50,
      notes: 'Carton cu finisaj metalic - STOC SCĂZUT',
    },
  ];

  for (const material of materials) {
    const created = await prisma.material.upsert({
      where: { sku: material.sku },
      update: material,
      create: material,
    });
    
    const stockStatus = created.stock < created.minStock ? '⚠️ LOW STOCK' : '✅';
    console.log(`${stockStatus} ${created.name} (${created.sku}) - ${created.stock} ${created.unit}`);
  }

  console.log('\n✨ Seeding completed successfully!');
  console.log(`\n📊 Total materials: ${materials.length}`);
  console.log(`⚠️ Low stock materials: ${materials.filter(m => m.stock < m.minStock).length}`);
  console.log('\n🔗 Access at: http://localhost:3000/admin/materials');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
