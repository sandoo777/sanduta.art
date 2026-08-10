import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

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
  const materialData = [
    // 2× sheet
    {
      id: 'seed-mat-001',
      name: 'Banner mesh 440g',
      sku: 'BANNER-MESH-440',
      category: 'sheet' as const,
      unit: 'm2',
      pricePerSqm: 45,
      wastePercent: 8,
      stock: 200,
      active: true,
      description: 'Mesh poliester 440g/m² pentru bannere exterioare',
    },
    {
      id: 'seed-mat-002',
      name: 'Banner frontlit 510g',
      sku: 'BANNER-FL-510',
      category: 'sheet' as const,
      unit: 'm2',
      pricePerSqm: 55,
      wastePercent: 8,
      stock: 300,
      active: true,
      description: 'PVC frontlit 510g/m² pentru bannere iluminate',
    },
    // 2× roll
    {
      id: 'seed-mat-003',
      name: 'Vinil adeziv gri',
      sku: 'VINYL-ADH-GRI',
      category: 'roll' as const,
      unit: 'm',
      pricePerMeter: 12,
      wastePercent: 5,
      stock: 500,
      active: true,
      description: 'Vinil adeziv cu spate gri, 1520mm lățime',
    },
    {
      id: 'seed-mat-004',
      name: 'Vinil perforat 50/50',
      sku: 'VINYL-PERF-5050',
      category: 'roll' as const,
      unit: 'm',
      pricePerMeter: 18,
      wastePercent: 10,
      stock: 150,
      active: true,
      description: 'Vinil perforat one-way vision 50/50 pentru geamuri',
    },
    // 1× rigid
    {
      id: 'seed-mat-005',
      name: 'PVC expandat 5mm',
      sku: 'PVC-EXP-5MM',
      category: 'rigid' as const,
      unit: 'm2',
      pricePerSqm: 120,
      wastePercent: 5,
      stock: 80,
      active: true,
      description: 'Placă PVC expandat 5mm pentru panouri rigide',
    },
    // 2× paper
    {
      id: 'seed-mat-006',
      name: 'Hârtie foto lucioasă 200g',
      sku: 'PAPER-PHOTO-200G',
      category: 'paper' as const,
      unit: 'm2',
      pricePerSqm: 8,
      wastePercent: 3,
      stock: 1000,
      active: true,
      description: 'Hârtie foto RC lucioasă 200g/m² pentru print de calitate',
    },
    {
      id: 'seed-mat-007',
      name: 'Hârtie mată 170g',
      sku: 'PAPER-MATTE-170G',
      category: 'paper' as const,
      unit: 'm2',
      pricePerSqm: 6,
      wastePercent: 3,
      stock: 800,
      active: true,
      description: 'Hârtie mată 170g/m² pentru afișe și materiale promoționale',
    },
    // 1× vinyl (folie) → uses pricePerMeter (meter resolution)
    {
      id: 'seed-mat-008',
      name: 'Folie one-way vision',
      sku: 'VINYL-OWV-1520',
      category: 'vinyl' as const,
      unit: 'm',
      pricePerMeter: 22,
      wastePercent: 10,
      stock: 100,
      active: true,
      description: 'Folie microperforată one-way vision 1520mm lățime',
    },
    // 1× textile
    {
      id: 'seed-mat-009',
      name: 'Pânză banner backlit',
      sku: 'TEXTILE-BACKLIT-500',
      category: 'textile' as const,
      unit: 'm',
      pricePerMeter: 35,
      wastePercent: 6,
      stock: 250,
      active: true,
      description: 'Pânză poliester backlit 500g/m² pentru casete luminoase',
    },
    // 1× other
    {
      id: 'seed-mat-010',
      name: 'Sistem banner roll-up',
      sku: 'ROLLUP-SYS-85',
      category: 'other' as const,
      unit: 'buc',
      pricePerUnit: 95,
      stock: 30,
      active: true,
      description: 'Mecanism roll-up aluminium 85×200cm cu geantă transport',
    },
  ];

  for (const mat of materialData) {
    await prisma.material.upsert({
      where: { id: mat.id },
      update: mat,
      create: mat,
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