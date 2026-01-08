import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting to seed machines...');

  // Get all materials and print methods for compatibility
  const materials = await prisma.material.findMany();
  const printMethods = await prisma.printMethod.findMany({ where: { active: true } });

  const paperMaterials = materials
    .filter((m) => ['Paper', 'Canvas', 'Photo Paper'].some((type) => m.name.includes(type)))
    .map((m) => m.id);
  const vinylMaterials = materials
    .filter((m) => m.name.toLowerCase().includes('vinyl') || m.name.toLowerCase().includes('vinil'))
    .map((m) => m.id);
  const rigidMaterials = materials
    .filter((m) =>
      ['Foam', 'PVC', 'Acrylic', 'Dibond'].some((type) => m.name.includes(type))
    )
    .map((m) => m.id);

  const digitalPrint = printMethods.find((p) => p.name.includes('Digital'))?.id || printMethods[0]?.id;
  const offsetPrint = printMethods.find((p) => p.name.includes('Offset'))?.id || printMethods[0]?.id;
  const uvPrint = printMethods.find((p) => p.name.includes('UV'))?.id || printMethods[0]?.id;

  const machines = [
    {
      name: 'HP Latex 570',
      type: 'digital-printer',
      costPerHour: 45.0,
      speed: '23 m²/oră',
      maxWidth: 1625,
      maxHeight: null,
      compatibleMaterialIds: [...paperMaterials, ...vinylMaterials].filter(Boolean),
      compatiblePrintMethodIds: [digitalPrint].filter(Boolean),
      description:
        'Imprimantă digitală large format HP Latex cu tehnologie eco-friendly, ideală pentru bannere, postere și afișe.',
      active: true,
    },
    {
      name: 'Roland VersaUV LEF2-300',
      type: 'uv-flatbed',
      costPerHour: 65.0,
      speed: '8 m²/oră',
      maxWidth: 770,
      maxHeight: 330,
      compatibleMaterialIds: rigidMaterials,
      compatiblePrintMethodIds: [uvPrint].filter(Boolean),
      description:
        'Imprimantă UV flatbed pentru materiale rigide, cu imprimare directă pe diverse suprafețe.',
      active: true,
    },
    {
      name: 'Mimaki CJV300-160',
      type: 'digital-printer',
      costPerHour: 38.0,
      speed: '19 m²/oră',
      maxWidth: 1610,
      maxHeight: null,
      compatibleMaterialIds: [...paperMaterials, ...vinylMaterials].filter(Boolean),
      compatiblePrintMethodIds: [digitalPrint].filter(Boolean),
      description:
        'Imprimantă și cutter integrat, perfect pentru semnalistică și afișaj exterior.',
      active: true,
    },
    {
      name: 'Heidelberg Speedmaster SM 74',
      type: 'offset-press',
      costPerHour: 120.0,
      speed: '15000 coli/oră',
      maxWidth: 520,
      maxHeight: 740,
      compatibleMaterialIds: paperMaterials,
      compatiblePrintMethodIds: [offsetPrint].filter(Boolean),
      description:
        'Mașină de tipar offset pentru tiraje mari, calitate superioară pentru cărți, reviste și broșuri.',
      active: true,
    },
    {
      name: 'Epson SureColor P9000',
      type: 'large-format',
      costPerHour: 28.0,
      speed: '12 m²/oră',
      maxWidth: 1118,
      maxHeight: null,
      compatibleMaterialIds: paperMaterials,
      compatiblePrintMethodIds: [digitalPrint].filter(Boolean),
      description:
        'Imprimantă large format pentru artă și fotografie, cu acuratețe cromatică excepțională.',
      active: true,
    },
    {
      name: 'GMP Excelam Q1-1400',
      type: 'laminator',
      costPerHour: 22.0,
      speed: '25 m/min',
      maxWidth: 1400,
      maxHeight: null,
      compatibleMaterialIds: [...paperMaterials, ...vinylMaterials].filter(Boolean),
      compatiblePrintMethodIds: printMethods.map((p) => p.id),
      description:
        'Laminator profesional pentru protecția printurilor, cu feed automat și control al temperaturii.',
      active: true,
    },
    {
      name: 'Graphtec FC9000-140',
      type: 'cutter-plotter',
      costPerHour: 18.0,
      speed: '1350 mm/sec',
      maxWidth: 1372,
      maxHeight: null,
      compatibleMaterialIds: vinylMaterials,
      compatiblePrintMethodIds: [digitalPrint].filter(Boolean),
      description:
        'Plotter de tăiere de înaltă precizie pentru vinil, ideal pentru stickere și litere autocolante.',
      active: true,
    },
    {
      name: 'Zünd G3 L-3200',
      type: 'cutter-plotter',
      costPerHour: 42.0,
      speed: '80 m²/oră',
      maxWidth: 3200,
      maxHeight: null,
      compatibleMaterialIds: [...paperMaterials, ...vinylMaterials, ...rigidMaterials].filter(Boolean),
      compatiblePrintMethodIds: printMethods.map((p) => p.id),
      description:
        'Sistem de tăiere digital profesional pentru materiale flexibile și rigide, multi-funcțional.',
      active: true,
    },
    {
      name: 'Polar 115 XT',
      type: 'ghilotina',
      costPerHour: 15.0,
      speed: '65 taieri/oră',
      maxWidth: 1150,
      maxHeight: null,
      compatibleMaterialIds: paperMaterials,
      compatiblePrintMethodIds: [offsetPrint, digitalPrint].filter(Boolean),
      description:
        'Ghilotină automată de precizie pentru tăiere post-print, cu presoare pneumatic.',
      active: true,
    },
    {
      name: 'Konica Minolta AccurioPress C12000',
      type: 'digital-printer',
      costPerHour: 85.0,
      speed: '120 ppm',
      maxWidth: 330,
      maxHeight: 487,
      compatibleMaterialIds: paperMaterials,
      compatiblePrintMethodIds: [digitalPrint].filter(Boolean),
      description:
        'Presă digitală de producție pentru tiraje medii, cu calitate premium și viteză ridicată.',
      active: true,
    },
    {
      name: 'Roland DGA VersaCAMM VS-640i',
      type: 'digital-printer',
      costPerHour: 35.0,
      speed: '16 m²/oră',
      maxWidth: 1625,
      maxHeight: null,
      compatibleMaterialIds: [...paperMaterials, ...vinylMaterials].filter(Boolean),
      compatiblePrintMethodIds: [digitalPrint].filter(Boolean),
      description:
        'Imprimantă și cutter integrat, versatil pentru aplicații de semnalistică și decor.',
      active: false,
    },
    {
      name: 'Oki Pro9542',
      type: 'digital-printer',
      costPerHour: 32.0,
      speed: '30 ppm',
      maxWidth: 330,
      maxHeight: 1219,
      compatibleMaterialIds: paperMaterials,
      compatiblePrintMethodIds: [digitalPrint].filter(Boolean),
      description:
        'Imprimantă LED de format A3+ pentru bannere și postere, cu sistem de toner alb.',
      active: true,
    },
  ];

  console.log(`📦 Creating ${machines.length} machines...`);

  for (const machine of machines) {
    try {
      await prisma.machine.create({
        data: machine,
      });
      console.log(`✅ Created: ${machine.name} (${machine.type})`);
    } catch (error) {
      console.error(`❌ Error creating ${machine.name}:`, error);
    }
  }

  const totalMachines = await prisma.machine.count();
  const activeMachines = await prisma.machine.count({ where: { active: true } });

  console.log(`\n✨ Seeding complete!`);
  console.log(`📊 Total machines: ${totalMachines}`);
  console.log(`✅ Active machines: ${activeMachines}`);
  console.log(`❌ Inactive machines: ${totalMachines - activeMachines}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
