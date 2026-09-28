import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

// ── Dev-only guard ──────────────────────────────────────────────────────────
// This seed is for development/staging only. Never run in production.
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Seed script must not run in production. Set NODE_ENV != production.');
  process.exit(1);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Create ADMIN user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sanduta.art' },
    update: {
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
    create: {
      name: 'Admin User',
      email: 'admin@sanduta.art',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  const materialPropertyTypes = ['finishes', 'colors', 'textures'] as const;

  for (const type of materialPropertyTypes) {
    const key = `material_property_lists.${type}`;
    const payload: Array<{ id: string; value: string; enabled: boolean; usageCount: number; createdAt: string; updatedAt: string }> = [];

    const existing = await prisma.systemSetting.findUnique({ where: { key } });
    if (!existing) {
      await prisma.systemSetting.create({
        data: { key, value: JSON.stringify(payload) },
      });
      continue;
    }

    let shouldInitialize = false;
    try {
      const parsed = JSON.parse(existing.value);
      shouldInitialize = !Array.isArray(parsed) || parsed.length === 0;
    } catch {
      shouldInitialize = true;
    }

    if (shouldInitialize) {
      await prisma.systemSetting.update({
        where: { key },
        data: { value: JSON.stringify(payload) },
      });
    }
  }

  console.log('✅ Material property list keys ensured (initialized only when missing/empty)');

  const formatCategoriesKey = 'format_categories';
  const defaultFormatCategories = [
    { id: 'fmt-cat-foi', code: 'FOI', name: 'Foi', enabled: true, usageCount: 0 },
    { id: 'fmt-cat-role', code: 'ROLE', name: 'Role', enabled: true, usageCount: 0 },
  ];

  const existingFormatCategories = await prisma.systemSetting.findUnique({ where: { key: formatCategoriesKey } });
  if (!existingFormatCategories) {
    await prisma.systemSetting.create({
      data: {
        key: formatCategoriesKey,
        value: JSON.stringify(defaultFormatCategories),
      },
    });
  }

  const formats = await prisma.format.createMany({
    data: [
      { category: 'FOI', width_mm: 210, height_mm: 297, name: '210x297 mm' },
      { category: 'FOI', width_mm: 297, height_mm: 420, name: '297x420 mm' },
      { category: 'ROLE', width_mm: 420, name: '420 mm' },
      { category: 'FOI', width_mm: 320, height_mm: 450, name: '320x450 mm' },
      { category: 'ROLE', width_mm: 707, name: '707 mm' },
    ],
    skipDuplicates: false,
  });
  console.log(`✅ Created ${formats.count} formats`);

  // Create sample customers
  const customers = await prisma.customer.createMany({
    data: [
      {
        name: 'Ion Popescu',
        email: 'ion@example.com',
        phone: '+373 69 123 456',
        source: 'ONLINE',
      },
      {
        name: 'Maria Ionescu',
        email: 'maria@example.com',
        phone: '+373 69 789 012',
        source: 'OFFLINE',
        company: 'Print Studio SRL',
      },
      {
        name: 'Andrei Dumitru',
        email: 'andrei@business.md',
        phone: '+373 69 345 678',
        source: 'ONLINE',
        company: 'Marketing Pro',
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Created ${customers.count} customers`);

  // Create sample categories
  const categories = await prisma.category.createMany({
    data: [
      {
        name: 'Business Cards',
        slug: 'business-cards',
        color: '#3B82F6',
        icon: '💼',
      },
      {
        name: 'Flyers & Leaflets',
        slug: 'flyers-leaflets',
        color: '#10B981',
        icon: '📄',
      },
      {
        name: 'Banners & Posters',
        slug: 'banners-posters',
        color: '#F59E0B',
        icon: '🎨',
      },
      {
        name: 'Photo Printing',
        slug: 'photo-printing',
        color: '#EC4899',
        icon: '📸',
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Created ${categories.count} categories`);

  // Get created category for products
  const businessCardCategory = await prisma.category.findFirst({
    where: { slug: 'business-cards' },
  });

  // Create sample products
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'Standard Business Cards',
        slug: 'standard-business-cards',
        description: '350gsm cardstock, full color, matte or glossy finish',
        categoryId: businessCardCategory!.id,
        price: 50,
        active: true,
      },
      {
        name: 'Premium Business Cards',
        slug: 'premium-business-cards',
        description: '450gsm premium cardstock with soft-touch lamination',
        categoryId: businessCardCategory!.id,
        price: 100,
        active: true,
      },
      {
        name: 'A5 Flyers',
        slug: 'a5-flyers',
        description: '150gsm coated paper, full color both sides',
        categoryId: businessCardCategory!.id,
        price: 25,
        active: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Created ${products.count} products`);

  // Create sample machines
  const machineData = [
    {
      name: 'Mimaki UCJV300-160',
      type: 'UV Flatbed',
      status: 'AVAILABLE' as const,
      costPerHour: 120,
      speed: '52 m²/oră',
      maxWidth: 1600,
      maxHeight: null,
      description: 'Imprimantă UV cu role și flatbed, ideală pentru vinil și materiale rigide',
      notes: 'Calibrare săptămânală necesară. Cerneală: CMYK + White + Gloss.',
      lastMaintenance: new Date('2026-05-01'),
      compatibleMaterialIds: [],
      compatiblePrintMethodIds: [],
      active: true,
    },
    {
      name: 'Xerox Versant 280',
      type: 'Digital Printer',
      status: 'BUSY' as const,
      costPerHour: 85,
      speed: '280 ppm',
      maxWidth: 330,
      maxHeight: 488,
      description: 'Imprimantă digitală de producție, format SRA3',
      notes: 'Consumabile: toner standard. Service anual inclus în contract.',
      lastMaintenance: new Date('2026-04-15'),
      compatibleMaterialIds: [],
      compatiblePrintMethodIds: [],
      active: true,
    },
    {
      name: 'Roland BN-20D',
      type: 'Large Format Printer',
      status: 'AVAILABLE' as const,
      costPerHour: 65,
      speed: '13 m²/oră',
      maxWidth: 508,
      maxHeight: null,
      description: 'Printer/Cutter pentru vinil adeziv și banner',
      notes: 'Verificare cuțit la fiecare 500 m².',
      lastMaintenance: new Date('2026-03-20'),
      compatibleMaterialIds: [],
      compatiblePrintMethodIds: [],
      active: true,
    },
    {
      name: 'Graphtec FC9000-160',
      type: 'Cutter Plotter',
      status: 'MAINTENANCE' as const,
      costPerHour: 30,
      speed: '1000 mm/s',
      maxWidth: 1600,
      maxHeight: null,
      description: 'Plotter de decupaj pentru vinil, etichete și materiale subțiri',
      notes: 'Cuțit schimbat 2026-05-10. Momentan în service pentru sistem presiune.',
      lastMaintenance: new Date('2026-05-10'),
      compatibleMaterialIds: [],
      compatiblePrintMethodIds: [],
      active: true,
    },
    {
      name: 'GMP Genie II F',
      type: 'Laminator',
      status: 'AVAILABLE' as const,
      costPerHour: 40,
      speed: '6 m/min',
      maxWidth: 1600,
      maxHeight: null,
      description: 'Laminatoare la cald/rece pentru formate mari',
      notes: 'Temperatura optimă: 80-110°C. Verificare role lunar.',
      lastMaintenance: new Date('2026-04-01'),
      compatibleMaterialIds: [],
      compatiblePrintMethodIds: [],
      active: true,
    },
    {
      name: 'Epson SureColor S80600',
      type: 'Large Format Printer',
      status: 'AVAILABLE' as const,
      costPerHour: 75,
      speed: '26 m²/oră',
      maxWidth: 1625,
      maxHeight: null,
      description: 'Imprimantă large-format pentru bannere, mesh și materiale textile',
      notes: 'Cap de tipărire verificat lunar. Cerneală: Ultrachrome GS3.',
      lastMaintenance: new Date('2026-05-05'),
      compatibleMaterialIds: [],
      compatiblePrintMethodIds: [],
      active: true,
    },
    {
      name: 'HP Indigo 7K',
      type: 'Digital Printer',
      status: 'AVAILABLE' as const,
      costPerHour: 110,
      speed: '120 ppm',
      maxWidth: 340,
      maxHeight: 500,
      description: 'Imprimantă digitală de înaltă calitate pentru etichete și ambalaje',
      notes: 'Calibrare culori la fiecare 500 de coli. Cerneală ElectroInk.',
      lastMaintenance: new Date('2026-04-20'),
      compatibleMaterialIds: [],
      compatiblePrintMethodIds: [],
      active: true,
    },
    {
      name: 'Polar 115 XT',
      type: 'Ghilotină',
      status: 'AVAILABLE' as const,
      costPerHour: 35,
      speed: '200 cicluri/oră',
      maxWidth: 1150,
      maxHeight: null,
      description: 'Ghilotină automată programabilă pentru tăiere hârtie și carton',
      notes: 'Cuțit ascuțit lunar. Presiune verificată la fiecare 10.000 cicluri.',
      lastMaintenance: new Date('2026-05-12'),
      compatibleMaterialIds: [],
      compatiblePrintMethodIds: [],
      active: true,
    },
  ];

  for (const machine of machineData) {
    await prisma.machine.upsert({
      where: { id: `seed-machine-${machine.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: machine,
      create: {
        id: `seed-machine-${machine.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...machine,
      },
    });
  }
  console.log(`✅ Created ${machineData.length} machines`);

  // ── Materials ──────────────────────────────────────────────────────────────
  // Fields aligned to actual Prisma schema:
  //   categoryId (FK to MaterialCategory), purchasePrice, salePrice,
  //   unit (MaterialUnit enum), notes, consumptionType, wastePercent, stock, minStock
  const materialData: Array<{
    id: string;
    name: string;
    sku: string;
    categoryId: string;
    materialType: 'SUPORT_FOI' | 'SUPORT_ROLA' | 'SUPORT_M2' | 'CERNEALA' | 'CONSUMABIL';
    unit: 'liter' | 'ml' | 'gram' | 'kg' | 'unit' | 'm2' | 'meter' | 'pcs' | 'sheet';
    consumptionType: 'AREA_BASED' | 'DIRECT';
    purchasePrice: number;
    salePrice: number;
    wastePercent: number;
    stock: number;
    minStock: number;
    active: boolean;
    notes: string;
    finishType?: string | null;
    thickness?: number | null;
    consumptionRate?: number | null;
    isTemplate?: boolean;
    width_mm?: number | null;
    height_mm?: number | null;
  }> = [
    {
      id: 'seed-mat-001',
      name: 'Support foi A4',
      sku: 'SUPORT-FOI-A4',
      categoryId: 'default_sheet',
      materialType: 'SUPORT_FOI',
      unit: 'sheet',
      consumptionType: 'DIRECT',
      purchasePrice: 35,
      salePrice: 45,
      wastePercent: 8,
      stock: 200,
      minStock: 20,
      active: true,
      notes: 'Suport din foi A4 pentru imprimare și montaj',
      width_mm: 210,
      height_mm: 297,
      isTemplate: true,
    },
    {
      id: 'seed-mat-002',
      name: 'Support rolă 420mm',
      sku: 'SUPORT-ROLA-420',
      categoryId: 'default_sheet',
      materialType: 'SUPORT_ROLA',
      unit: 'm2',
      consumptionType: 'AREA_BASED',
      purchasePrice: 42,
      salePrice: 55,
      wastePercent: 8,
      stock: 300,
      minStock: 30,
      active: true,
      notes: 'Suport de rolă pentru format mare, lățime 420mm',
      width_mm: 420,
      consumptionRate: 1.2,
    },
    {
      id: 'seed-mat-003',
      name: 'Support m² standard',
      sku: 'SUPORT-M2-STD',
      categoryId: 'default_roll',
      materialType: 'SUPORT_M2',
      unit: 'm2',
      consumptionType: 'AREA_BASED',
      purchasePrice: 9,
      salePrice: 12,
      wastePercent: 5,
      stock: 500,
      minStock: 50,
      active: true,
      notes: 'Suprafețe de bază pe metru pătrat pentru aplicații de format mare',
      consumptionRate: 0.85,
    },
    {
      id: 'seed-mat-004',
      name: 'Cerneală UV albă',
      sku: 'CERNEALA-UV-WHITE',
      categoryId: 'default_roll',
      materialType: 'CERNEALA',
      unit: 'ml',
      consumptionType: 'DIRECT',
      purchasePrice: 14,
      salePrice: 18,
      wastePercent: 10,
      stock: 150,
      minStock: 15,
      active: true,
      notes: 'Cerneală UV albă pentru imprimare pe suporturi speciale',
      consumptionRate: 5,
    },
    {
      id: 'seed-mat-005',
      name: 'Consumabil cap rotativ',
      sku: 'CONSUMABIL-CAP-ROT',
      categoryId: 'default_rigid',
      materialType: 'CONSUMABIL',
      unit: 'pcs',
      consumptionType: 'DIRECT',
      purchasePrice: 90,
      salePrice: 120,
      wastePercent: 5,
      stock: 80,
      minStock: 10,
      active: true,
      notes: 'Consumabil pentru cap rotativ, schimbabil după 5000 ore',
      consumptionRate: 1,
    },
    {
      id: 'seed-mat-006',
      name: 'Hârtie foto lucioasă 200g',
      sku: 'PAPER-PHOTO-200G',
      categoryId: 'default_paper',
      unit: 'm2',
      consumptionType: 'AREA_BASED',
      purchasePrice: 5,
      salePrice: 8,
      wastePercent: 3,
      stock: 1000,
      minStock: 100,
      active: true,
      notes: 'Hârtie foto RC lucioasă 200g/m² pentru print de calitate',
      finishType: 'lucios',
    },
    {
      id: 'seed-mat-007',
      name: 'Hârtie mată 170g',
      sku: 'PAPER-MATTE-170G',
      categoryId: 'default_paper',
      unit: 'm2',
      consumptionType: 'AREA_BASED',
      purchasePrice: 4,
      salePrice: 6,
      wastePercent: 3,
      stock: 800,
      minStock: 80,
      active: true,
      notes: 'Hârtie mată 170g/m² pentru afișe și materiale promoționale',
      finishType: 'mat',
    },
    {
      id: 'seed-mat-008',
      name: 'Folie one-way vision',
      sku: 'VINYL-OWV-1520',
      categoryId: 'default_vinyl',
      unit: 'meter',
      consumptionType: 'AREA_BASED',
      purchasePrice: 17,
      salePrice: 22,
      wastePercent: 10,
      stock: 100,
      minStock: 10,
      active: true,
      notes: 'Folie microperforată one-way vision 1520mm lățime',
    },
    {
      id: 'seed-mat-009',
      name: 'Pânză banner backlit',
      sku: 'TEXTILE-BACKLIT-500',
      categoryId: 'default_textile',
      unit: 'meter',
      consumptionType: 'AREA_BASED',
      purchasePrice: 26,
      salePrice: 35,
      wastePercent: 6,
      stock: 250,
      minStock: 25,
      active: true,
      notes: 'Pânză poliester backlit 500g/m² pentru casete luminoase',
    },
    {
      id: 'seed-mat-010',
      name: 'Sistem banner roll-up',
      sku: 'ROLLUP-SYS-85',
      categoryId: 'default_other',
      unit: 'unit',
      consumptionType: 'DIRECT',
      purchasePrice: 65,
      salePrice: 95,
      wastePercent: 0,
      stock: 30,
      minStock: 5,
      active: true,
      notes: 'Mecanism roll-up aluminium 85×200cm cu geantă transport',
    },
  ];

  for (const mat of materialData) {
    await prisma.material.upsert({
      where: { id: mat.id },
      update: {
        name: mat.name,
        sku: mat.sku,
        categoryId: mat.categoryId,
        unit: mat.unit,
        consumptionType: mat.consumptionType,
        purchasePrice: mat.purchasePrice,
        salePrice: mat.salePrice,
        wastePercent: mat.wastePercent,
        stock: mat.stock,
        minStock: mat.minStock,
        active: mat.active,
        notes: mat.notes,
        materialType: mat.materialType,
        ...(mat.finishType !== undefined ? { finishType: mat.finishType } : {}),
        ...(mat.thickness !== undefined ? { thickness: mat.thickness } : {}),
        ...(mat.consumptionRate !== undefined ? { consumptionRate: mat.consumptionRate } : {}),
        ...(mat.isTemplate !== undefined ? { isTemplate: mat.isTemplate } : {}),
        ...(mat.width_mm !== undefined ? { width_mm: mat.width_mm } : {}),
        ...(mat.height_mm !== undefined ? { height_mm: mat.height_mm } : {}),
      },
      create: {
        id: mat.id,
        name: mat.name,
        sku: mat.sku,
        categoryId: mat.categoryId,
        materialType: mat.materialType,
        unit: mat.unit,
        consumptionType: mat.consumptionType,
        purchasePrice: mat.purchasePrice,
        salePrice: mat.salePrice,
        wastePercent: mat.wastePercent,
        stock: mat.stock,
        minStock: mat.minStock,
        active: mat.active,
        notes: mat.notes,
        ...(mat.finishType !== undefined ? { finishType: mat.finishType } : {}),
        ...(mat.thickness !== undefined ? { thickness: mat.thickness } : {}),
        ...(mat.consumptionRate !== undefined ? { consumptionRate: mat.consumptionRate } : {}),
        ...(mat.isTemplate !== undefined ? { isTemplate: mat.isTemplate } : {}),
        ...(mat.width_mm !== undefined ? { width_mm: mat.width_mm } : {}),
        ...(mat.height_mm !== undefined ? { height_mm: mat.height_mm } : {}),
      },
    });
  }
  console.log(`✅ Created ${materialData.length} materials`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });