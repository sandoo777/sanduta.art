import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding print methods...\n');

  // Get material IDs for compatibility
  const materials = await prisma.material.findMany();
  const paperMaterials = materials.filter(m => m.name.toLowerCase().includes('hârtie') || m.name.toLowerCase().includes('paper'));
  const cartonMaterials = materials.filter(m => m.name.toLowerCase().includes('carton'));
  const pvcMaterials = materials.filter(m => m.name.toLowerCase().includes('pvc'));
  const vinylMaterials = materials.filter(m => m.name.toLowerCase().includes('autocolant') || m.name.toLowerCase().includes('vinyl'));
  const forexMaterials = materials.filter(m => m.name.toLowerCase().includes('forex'));
  const textileMaterials = materials.filter(m => m.name.toLowerCase().includes('textil'));

  const printMethods = [
    {
      name: 'Digital Color Print',
      type: 'Digital',
      costPerM2: 15.50,
      costPerSheet: null,
      speed: '100 m²/oră',
      maxWidth: 3200,
      maxHeight: 1600,
      description: 'Imprimare digitală color de înaltă calitate pentru tiraje mici și medii. Ideal pentru bannere, postere și materiale promoționale.',
      active: true,
      materialIds: [
        ...paperMaterials.map(m => m.id),
        ...vinylMaterials.map(m => m.id),
        ...textileMaterials.map(m => m.id),
      ].slice(0, 8),
    },
    {
      name: 'Offset Color 4+0',
      type: 'Offset',
      costPerM2: null,
      costPerSheet: 0.35,
      speed: '15,000 coli/oră',
      maxWidth: 700,
      maxHeight: 1000,
      description: 'Tipărire offset tradițională pentru tiraje mari. Calitate excelentă pentru flyere, broșuri și cărți de vizită.',
      active: true,
      materialIds: [
        ...paperMaterials.map(m => m.id),
        ...cartonMaterials.map(m => m.id),
      ].slice(0, 7),
    },
    {
      name: 'UV Flatbed Printing',
      type: 'UV',
      costPerM2: 35.00,
      costPerSheet: null,
      speed: '20 m²/oră',
      maxWidth: 2500,
      maxHeight: 1300,
      description: 'Imprimare UV pe materiale rigide. Uscare instantanee, rezistent la apă și UV. Perfect pentru PVC, forex, plexiglas.',
      active: true,
      materialIds: [
        ...pvcMaterials.map(m => m.id),
        ...forexMaterials.map(m => m.id),
      ].slice(0, 6),
    },
    {
      name: 'Large Format Inkjet',
      type: 'Inkjet',
      costPerM2: 12.00,
      costPerSheet: null,
      speed: '150 m²/oră',
      maxWidth: 5000,
      maxHeight: null,
      description: 'Imprimare inkjet de mare format pentru bannere și mesh-uri. Viteză mare de producție pentru exterior și interior.',
      active: true,
      materialIds: [
        ...pvcMaterials.map(m => m.id),
        ...vinylMaterials.map(m => m.id),
        ...textileMaterials.map(m => m.id),
      ].slice(0, 8),
    },
    {
      name: 'Latex Large Format',
      type: 'Latex',
      costPerM2: 18.50,
      costPerSheet: null,
      speed: '80 m²/oră',
      maxWidth: 3200,
      maxHeight: null,
      description: 'Imprimare latex ecologică, fără miros. Ideal pentru interior și aplicații unde sunt necesare cerințe ecologice stricte.',
      active: true,
      materialIds: [
        ...paperMaterials.map(m => m.id),
        ...vinylMaterials.map(m => m.id),
        ...textileMaterials.map(m => m.id),
      ].slice(0, 7),
    },
    {
      name: 'Screen Printing (Serigrafie)',
      type: 'Serigrafie',
      costPerM2: null,
      costPerSheet: 2.50,
      speed: '200 bucăți/oră',
      maxWidth: 700,
      maxHeight: 1000,
      description: 'Serigrafie manuală pentru tiraje mici și aplicații speciale. Culori vibrante, durabile. Perfect pentru textile și surface speciale.',
      active: true,
      materialIds: [
        ...textileMaterials.map(m => m.id),
        ...paperMaterials.map(m => m.id),
        ...pvcMaterials.map(m => m.id),
      ].slice(0, 6),
    },
    {
      name: 'Direct to Garment (DTG)',
      type: 'Digital',
      costPerM2: null,
      costPerSheet: 8.50,
      speed: '50 bucăți/oră',
      maxWidth: 400,
      maxHeight: 500,
      description: 'Imprimare directă pe textile. Detalii fine, gradiente complexe. Ideal pentru tricouri personalizate și textile.',
      active: true,
      materialIds: textileMaterials.map(m => m.id).slice(0, 3),
    },
    {
      name: 'Roll-to-Roll UV',
      type: 'UV',
      costPerM2: 28.00,
      costPerSheet: null,
      speed: '45 m²/oră',
      maxWidth: 1600,
      maxHeight: null,
      description: 'Imprimare UV roll-to-roll pentru producție în serie. Calitate superioară, uscare instantanee.',
      active: false, // Inactive for testing
      materialIds: [
        ...vinylMaterials.map(m => m.id),
        ...pvcMaterials.map(m => m.id),
      ].slice(0, 5),
    },
  ];

  // Delete existing print methods
  await prisma.printMethod.deleteMany();

  for (const method of printMethods) {
    const created = await prisma.printMethod.create({
      data: method,
    });
    
    const statusIcon = created.active ? '✅' : '⚠️ INACTIVE';
    const costInfo = created.costPerM2 
      ? `${Number(created.costPerM2).toFixed(2)} lei/m²`
      : created.costPerSheet 
        ? `${Number(created.costPerSheet).toFixed(2)} lei/coală`
        : 'No cost';
    
    console.log(`${statusIcon} ${created.name} (${created.type}) - ${costInfo}`);
    console.log(`   Compatible with ${created.materialIds.length} materials`);
  }

  console.log('\n✨ Seeding completed successfully!');
  console.log(`\n📊 Total print methods: ${printMethods.length}`);
  console.log(`✅ Active: ${printMethods.filter(m => m.active).length}`);
  console.log(`⚠️ Inactive: ${printMethods.filter(m => !m.active).length}`);
  console.log('\n🔗 Access at: http://localhost:3000/admin/print-methods');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
