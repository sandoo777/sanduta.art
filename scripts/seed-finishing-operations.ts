import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding finishing operations...\n');

  // Get materials and print methods for compatibility
  const materials = await prisma.material.findMany();
  const printMethods = await prisma.printMethod.findMany();

  if (materials.length === 0 || printMethods.length === 0) {
    console.log('⚠️  Please seed materials and print methods first!');
    return;
  }

  // Group materials by type for easier selection
  const paperMaterials = materials.filter(m => m.type && m.type.includes('Hârtie')).map(m => m.id);
  const cardboardMaterials = materials.filter(m => m.type && m.type.includes('Carton')).map(m => m.id);
  const pvcMaterials = materials.filter(m => m.type && m.type.includes('PVC')).map(m => m.id);
  const vinylMaterials = materials.filter(m => m.type && m.type.includes('Vinil')).map(m => m.id);
  const allMaterialIds = materials.map(m => m.id);

  // Group print methods
  const digitalMethods = printMethods.filter(m => m.type === 'Digital').map(m => m.id);
  const offsetMethods = printMethods.filter(m => m.type === 'Offset').map(m => m.id);
  const uvMethods = printMethods.filter(m => m.type === 'UV').map(m => m.id);
  const allPrintMethodIds = printMethods.map(m => m.id);

  const finishingOperations = [
    {
      name: 'Laminare Mat',
      type: 'Laminare',
      costPerM2: 5.50,
      timeSeconds: 180,
      compatibleMaterialIds: [...paperMaterials, ...cardboardMaterials],
      compatiblePrintMethodIds: [...digitalMethods, ...offsetMethods],
      description: 'Laminare cu folie mată, protecție anti-amprente',
      active: true,
    },
    {
      name: 'Laminare Lucioasă',
      type: 'Laminare',
      costPerM2: 5.50,
      timeSeconds: 180,
      compatibleMaterialIds: [...paperMaterials, ...cardboardMaterials],
      compatiblePrintMethodIds: [...digitalMethods, ...offsetMethods],
      description: 'Laminare cu folie lucioasă, culori vibrante',
      active: true,
    },
    {
      name: 'Tăiere la Dimensiune',
      type: 'Tăiere',
      costPerUnit: 0.50,
      timeSeconds: 30,
      compatibleMaterialIds: allMaterialIds,
      compatiblePrintMethodIds: allPrintMethodIds,
      description: 'Tăiere precisă la dimensiunea dorită',
      active: true,
    },
    {
      name: 'Tăiere Contour',
      type: 'Tăiere',
      costPerUnit: 1.20,
      timeSeconds: 120,
      compatibleMaterialIds: [...paperMaterials, ...vinylMaterials, ...pvcMaterials],
      compatiblePrintMethodIds: allPrintMethodIds,
      description: 'Tăiere pe contur complex cu plotter',
      active: true,
    },
    {
      name: 'Băgăuire Standard',
      type: 'Băgăuire',
      costPerUnit: 0.80,
      timeSeconds: 45,
      compatibleMaterialIds: [...paperMaterials, ...cardboardMaterials],
      compatiblePrintMethodIds: [...digitalMethods, ...offsetMethods],
      description: 'Băgăuire pentru perforare și detașare ușoară',
      active: true,
    },
    {
      name: 'Capsare 2 Capse',
      type: 'Capsare',
      costPerUnit: 0.35,
      timeSeconds: 20,
      compatibleMaterialIds: paperMaterials,
      compatiblePrintMethodIds: [...digitalMethods, ...offsetMethods],
      description: 'Capsare standard cu 2 capse metalice',
      active: true,
    },
    {
      name: 'Perforare 2 Găuri',
      type: 'Perforare',
      costPerUnit: 0.25,
      timeSeconds: 15,
      compatibleMaterialIds: [...paperMaterials, ...cardboardMaterials],
      compatiblePrintMethodIds: allPrintMethodIds,
      description: 'Perforare 2 găuri pentru fișiere/dosare',
      active: true,
    },
    {
      name: 'Colțuri Rotunjite',
      type: 'Colț rotunjit',
      costPerUnit: 0.40,
      timeSeconds: 25,
      compatibleMaterialIds: [...paperMaterials, ...cardboardMaterials, ...pvcMaterials],
      compatiblePrintMethodIds: allPrintMethodIds,
      description: 'Rotunjire colțuri pentru aspect premium',
      active: true,
    },
    {
      name: 'Îndoire/Bigorare',
      type: 'Îndoire',
      costPerUnit: 0.60,
      timeSeconds: 40,
      compatibleMaterialIds: [...paperMaterials, ...cardboardMaterials],
      compatiblePrintMethodIds: [...digitalMethods, ...offsetMethods],
      description: 'Îndoire sau bigorare pentru pliante/broșuri',
      active: true,
    },
    {
      name: 'Laminare Soft Touch',
      type: 'Laminare',
      costPerM2: 8.50,
      timeSeconds: 200,
      compatibleMaterialIds: cardboardMaterials,
      compatiblePrintMethodIds: [...digitalMethods, ...offsetMethods],
      description: 'Laminare cu finisaj catifelat, aspect premium',
      active: true,
    },
    {
      name: 'UV Spot Lacquer',
      type: 'Altele',
      costPerM2: 12.00,
      timeSeconds: 300,
      compatibleMaterialIds: [...paperMaterials, ...cardboardMaterials],
      compatiblePrintMethodIds: [...digitalMethods, ...offsetMethods, ...uvMethods],
      description: 'Lac UV selectiv pentru zone specifice',
      active: true,
    },
    {
      name: 'Foil Stamping Auriu',
      type: 'Altele',
      costPerM2: 25.00,
      timeSeconds: 600,
      compatibleMaterialIds: [...paperMaterials, ...cardboardMaterials],
      compatiblePrintMethodIds: offsetMethods,
      description: 'Aplicare folie metalică aurie prin stanțare la cald',
      active: false, // Inactive - special service
    },
  ];

  // Delete existing finishing operations
  await prisma.finishingOperation.deleteMany();

  for (const operation of finishingOperations) {
    const created = await prisma.finishingOperation.create({
      data: operation,
    });

    const statusIcon = created.active ? '✅' : '⚠️ INACTIVE';
    
    let costInfo = 'No cost';
    if (created.costFix) {
      costInfo = `${Number(created.costFix).toFixed(2)} lei (fix)`;
    } else if (created.costPerUnit) {
      costInfo = `${Number(created.costPerUnit).toFixed(2)} lei/buc`;
    } else if (created.costPerM2) {
      costInfo = `${Number(created.costPerM2).toFixed(2)} lei/m²`;
    }

    const timeInfo = created.timeSeconds 
      ? `${Math.floor(created.timeSeconds / 60)}m ${created.timeSeconds % 60}s`
      : 'No time';

    console.log(`${statusIcon} ${created.name} (${created.type})`);
    console.log(`   Cost: ${costInfo}, Time: ${timeInfo}`);
    console.log(`   Materials: ${created.compatibleMaterialIds.length}, Print methods: ${created.compatiblePrintMethodIds.length}`);
  }

  console.log('\n✨ Seeding completed successfully!\n');

  const totalCount = await prisma.finishingOperation.count();
  const activeCount = await prisma.finishingOperation.count({ where: { active: true } });
  const inactiveCount = totalCount - activeCount;

  console.log('📊 Total finishing operations:', totalCount);
  console.log('✅ Active:', activeCount);
  console.log('⚠️ Inactive:', inactiveCount);
  console.log('\n🔗 Access at: http://localhost:3000/admin/finishing');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
