import { MaterialUnit, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

type CategoryCode =
  | 'paper'
  | 'lf-flex'
  | 'lf-rigid'
  | 'textile'
  | 'consumables'
  | 'accessories'
  | 'semi-finished'
  | 'calendar'
  | 'envelopes';

interface SeedMaterialInput {
  name: string;
  category: CategoryCode;
  unit: MaterialUnit;
  price: number | null;
  active: true;
}

const OFFICIAL_CATEGORIES: Array<{ name: string; code: CategoryCode }> = [
  { name: 'Hârtie & Carton', code: 'paper' },
  { name: 'Large Format – Flexibile', code: 'lf-flex' },
  { name: 'Large Format – Rigide', code: 'lf-rigid' },
  { name: 'Textile', code: 'textile' },
  { name: 'Consumabile', code: 'consumables' },
  { name: 'Accesorii producție', code: 'accessories' },
  { name: 'Produse semifinite', code: 'semi-finished' },
  { name: 'Calendare', code: 'calendar' },
  { name: 'Plicuri', code: 'envelopes' },
];

const MATERIALS: SeedMaterialInput[] = [
  // HARTIE & CARTON
  { name: 'Hârtie A4 80g', category: 'paper', unit: 'pcs', price: 100, active: true },
  { name: 'Hârtie A3 80g', category: 'paper', unit: 'pcs', price: 151, active: true },
  { name: 'Hârtie cretată 115g', category: 'paper', unit: 'm2', price: 31.88, active: true },
  { name: 'Hârtie cretată 130g', category: 'paper', unit: 'm2', price: 31.88, active: true },
  { name: 'Hârtie cretată 150g', category: 'paper', unit: 'm2', price: 31.88, active: true },
  { name: 'Hârtie cretată 200g', category: 'paper', unit: 'm2', price: 36.5, active: true },
  { name: 'Hârtie cretată 300g Fin', category: 'paper', unit: 'm2', price: 36.43, active: true },
  { name: 'Hârtie cretată 350g Fin', category: 'paper', unit: 'm2', price: 36.23, active: true },
  { name: 'Hârtie colorată A4 80g', category: 'paper', unit: 'pcs', price: 190, active: true },
  { name: 'Hârtie acuarelă A3 200g', category: 'paper', unit: 'pcs', price: 70, active: true },

  // LARGE FORMAT – FLEXIBILE
  { name: 'Banner Frontlit 440 matte', category: 'lf-flex', unit: 'm2', price: 30.11, active: true },
  { name: 'Banner BlockOut 340', category: 'lf-flex', unit: 'm2', price: 25, active: true },
  { name: 'Mesh 250', category: 'lf-flex', unit: 'm2', price: 24, active: true },
  { name: 'Photopaper SOL Poster PRO WB 200 mat', category: 'lf-flex', unit: 'm2', price: 42.6, active: true },
  { name: 'One Way Vision', category: 'lf-flex', unit: 'm2', price: 76.59, active: true },
  { name: 'Canvas Fabric Solvent Gloss', category: 'lf-flex', unit: 'm2', price: 129.79, active: true },
  { name: 'Fototapet 130cm', category: 'lf-flex', unit: 'm2', price: 86.97, active: true },

  // LARGE FORMAT – RIGIDE
  { name: 'PVC 1mm', category: 'lf-rigid', unit: 'm2', price: 83.23, active: true },
  { name: 'PVC 3mm', category: 'lf-rigid', unit: 'm2', price: 136.72, active: true },
  { name: 'PVC 4.5mm', category: 'lf-rigid', unit: 'm2', price: 198.54, active: true },
  { name: 'PET G clear 0.5mm', category: 'lf-rigid', unit: 'm2', price: 84.29, active: true },
  { name: 'ORACAL 100 mic Europa', category: 'lf-rigid', unit: 'm2', price: 33, active: true },
  { name: 'ORACAL alb gloss China', category: 'lf-rigid', unit: 'm2', price: 22.51, active: true },

  // TEXTILE
  { name: 'Roly Dogo Premium', category: 'textile', unit: 'pcs', price: 67, active: true },
  { name: 'Roly Atomic 150', category: 'textile', unit: 'pcs', price: 44, active: true },
  { name: 'Roly Beagle (1–12 ani)', category: 'textile', unit: 'pcs', price: 48, active: true },
  { name: "Sol's Buzz", category: 'textile', unit: 'pcs', price: 25, active: true },

  // CONSUMABILE
  { name: 'Peliculă adezivă', category: 'consumables', unit: 'm2', price: null, active: true },
  { name: 'Peliculă laminare A4 80 mic', category: 'consumables', unit: 'pcs', price: 185, active: true },

  // ACCESORII PRODUCTIE
  { name: 'Reică șasiu', category: 'accessories', unit: 'meter', price: null, active: true },
  { name: 'Cursor calendar', category: 'accessories', unit: 'pcs', price: 1, active: true },

  // PRODUSE SEMIFINITE
  { name: 'Roll-Up 80×200', category: 'semi-finished', unit: 'pcs', price: 469, active: true },

  // PLICURI
  { name: 'Plic C4 229×324mm', category: 'envelopes', unit: 'pcs', price: 2.1, active: true },
];

function resolvePricing(unit: MaterialUnit, price: number | null) {
  if (price == null) {
    return {
      pricePerSqm: null,
      pricePerMeter: null,
      pricePerUnit: null,
      costPerUnit: 0,
    };
  }

  if (unit === 'm2') {
    return {
      pricePerSqm: price,
      pricePerMeter: null,
      pricePerUnit: null,
      costPerUnit: price,
    };
  }

  if (unit === 'meter') {
    return {
      pricePerSqm: null,
      pricePerMeter: price,
      pricePerUnit: null,
      costPerUnit: price,
    };
  }

  return {
    pricePerSqm: null,
    pricePerMeter: null,
    pricePerUnit: price,
    costPerUnit: price,
  };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🌱 Seeding official material categories and materials...');

    const categoryIdByCode = new Map<CategoryCode, string>();

    for (const category of OFFICIAL_CATEGORIES) {
      const savedCategory = await prisma.materialCategory.upsert({
        where: { name: category.name },
        update: {
          description: category.code,
          active: true,
        },
        create: {
          name: category.name,
          description: category.code,
          active: true,
        },
      });

      categoryIdByCode.set(category.code, savedCategory.id);
    }

    for (const material of MATERIALS) {
      const categoryId = categoryIdByCode.get(material.category);
      if (!categoryId) {
        throw new Error(`Missing category mapping for ${material.category}`);
      }

      const pricing = resolvePricing(material.unit, material.price);
      const consumptionType = material.unit === 'm2' ? 'AREA_BASED' : 'DIRECT';

      const payload = {
        name: material.name,
        categoryId,
        unit: material.unit,
        active: true,
        consumptionType,
        stock: 0,
        minStock: 0,
        wastePercent: 0,
        ...pricing,
      };

      await prisma.material.upsert({
        where: { name: material.name },
        update: payload,
        create: payload,
      });
    }

    const duplicates = await prisma.material.groupBy({
      by: ['name'],
      _count: { name: true },
      having: {
        name: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    if (duplicates.length > 0) {
      console.warn('⚠️ Duplicate names detected:', duplicates.map((d) => d.name));
    }

    console.log(`✅ Categories seeded: ${OFFICIAL_CATEGORIES.length}`);
    console.log(`✅ Materials seeded: ${MATERIALS.length}`);
    console.log(`✅ Duplicate names: ${duplicates.length}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('❌ Failed to seed materials:', error);
  process.exit(1);
});
