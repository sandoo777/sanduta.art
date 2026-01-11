import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🏭 Seeding complete digital print shop inventory...\n');

  // 1️⃣ MATERIALS - All available printing materials
  console.log('📦 Adding Materials...');
  
  const materials = [
    // Photo Papers
    {
      name: 'Hârtie Foto Lucioasă',
      sku: 'PHOTO-GLOSS-260',
      unit: 'm²',
      stock: 50,
      minStock: 10,
      costPerUnit: 25.50,
      notes: '260gsm, finish glossy, compatibil inkjet/laser',
    },
    {
      name: 'Hârtie Foto Mată',
      sku: 'PHOTO-MATT-260',
      unit: 'm²',
      stock: 45,
      minStock: 10,
      costPerUnit: 24.00,
      notes: '260gsm, finish matt, compatibil inkjet/laser',
    },
    
    // Office Papers
    {
      name: 'Hârtie Offset 90g',
      sku: 'OFFSET-90',
      unit: 'm²',
      stock: 200,
      minStock: 50,
      costPerUnit: 5.50,
      notes: '90gsm, alb, ideal pentru documente și flyere',
    },
    {
      name: 'Hârtie Offset 120g',
      sku: 'OFFSET-120',
      unit: 'm²',
      stock: 150,
      minStock: 30,
      costPerUnit: 7.80,
      notes: '120gsm, alb, pentru broșuri și prezentări',
    },
    {
      name: 'Hârtie Offset 160g',
      sku: 'OFFSET-160',
      unit: 'm²',
      stock: 100,
      minStock: 20,
      costPerUnit: 10.50,
      notes: '160gsm, alb, pentru cărți de vizită și postere',
    },
    
    // Cardstock
    {
      name: 'Carton 250g',
      sku: 'CARD-250',
      unit: 'm²',
      stock: 80,
      minStock: 15,
      costPerUnit: 15.00,
      notes: '250gsm, rigid, pentru cărți de vizită premium',
    },
    {
      name: 'Carton 300g',
      sku: 'CARD-300',
      unit: 'm²',
      stock: 60,
      minStock: 10,
      costPerUnit: 18.50,
      notes: '300gsm, foarte rigid, pentru ambalaje și diplome',
    },
    
    // Specialty Materials
    {
      name: 'Autocolant PVC',
      sku: 'VINYL-PVC',
      unit: 'm²',
      stock: 40,
      minStock: 10,
      costPerUnit: 35.00,
      notes: 'Autocolant PVC alb, impermeabil, exterior/interior',
    },
    {
      name: 'Canvas',
      sku: 'CANVAS-380',
      unit: 'm²',
      stock: 30,
      minStock: 5,
      costPerUnit: 45.00,
      notes: '380gsm, pânză pictură, pentru tablouri și artă',
    },
    {
      name: 'Hârtie Magnetică',
      sku: 'MAGNETIC-SHEET',
      unit: 'm²',
      stock: 20,
      minStock: 5,
      costPerUnit: 55.00,
      notes: 'Folie magnetică flexibilă, pentru frigider și whiteboard',
    },
    {
      name: 'Hârtie Reciclabilă',
      sku: 'RECYCLED-100',
      unit: 'm²',
      stock: 70,
      minStock: 15,
      costPerUnit: 8.00,
      notes: '100gsm, kraft, eco-friendly, aspect natural',
    },
    {
      name: 'Hârtie Colorată',
      sku: 'COLOR-MIX-120',
      unit: 'm²',
      stock: 50,
      minStock: 10,
      costPerUnit: 9.50,
      notes: '120gsm, diverse culori, pentru design creativ',
    },
    {
      name: 'Hârtie Transparentă',
      sku: 'TRANSPARENT-100',
      unit: 'm²',
      stock: 25,
      minStock: 5,
      costPerUnit: 22.00,
      notes: '100gsm, translucidă, pentru overlay și ferestre',
    },
    {
      name: 'Hârtie Termică',
      sku: 'THERMAL-80',
      unit: 'm²',
      stock: 60,
      minStock: 15,
      costPerUnit: 12.00,
      notes: '80gsm, pentru chitanțe și bonuri fiscale',
    },
  ];

  const createdMaterials: Record<string, string> = {};
  
  for (const material of materials) {
    const created = await prisma.material.upsert({
      where: { sku: material.sku },
      update: material,
      create: material,
    });
    createdMaterials[material.sku] = created.id;
    console.log(`  ✓ ${material.name} (${material.sku})`);
  }

  console.log(`\n✅ Created ${materials.length} materials\n`);

  // 2️⃣ PRINT METHODS - All printing processes
  console.log('🖨️  Adding Print Methods...');

  const printMethods = [
    {
      name: 'Inkjet',
      type: 'Digital',
      costPerM2: 8.50,
      costPerSheet: null,
      speed: '25 m²/oră',
      maxWidth: 1118,
      maxHeight: null,
      description: 'Imprimare inkjet cu cerneală apoasă, calitate foto excelentă, ideal pentru foto, canvas, artă',
      active: true,
      materialIds: [
        createdMaterials['PHOTO-GLOSS-260'],
        createdMaterials['PHOTO-MATT-260'],
        createdMaterials['CANVAS-380'],
        createdMaterials['OFFSET-120'],
        createdMaterials['OFFSET-160'],
      ],
    },
    {
      name: 'Laser',
      type: 'Digital',
      costPerM2: 6.00,
      costPerSheet: 0.15,
      speed: '80 ppm (A4)',
      maxWidth: 330,
      maxHeight: 488,
      description: 'Imprimare laser color/mono, rapidă și economică pentru volume mari de documente',
      active: true,
      materialIds: [
        createdMaterials['OFFSET-90'],
        createdMaterials['OFFSET-120'],
        createdMaterials['OFFSET-160'],
        createdMaterials['CARD-250'],
        createdMaterials['CARD-300'],
        createdMaterials['COLOR-MIX-120'],
      ],
    },
    {
      name: 'Sublimare',
      type: 'Transfer',
      costPerM2: 12.00,
      costPerSheet: null,
      speed: '15 m²/oră',
      maxWidth: 1600,
      maxHeight: null,
      description: 'Transfer termic pentru textile și obiecte, culori vii și durabile',
      active: true,
      materialIds: [
        createdMaterials['PHOTO-GLOSS-260'],
      ],
    },
    {
      name: 'UV',
      type: 'Digital',
      costPerM2: 18.00,
      costPerSheet: null,
      speed: '30 m²/oră',
      maxWidth: 2500,
      maxHeight: null,
      description: 'Imprimare UV cu uscare instant, pentru materiale rigide și flexibile, rezistent exterior',
      active: true,
      materialIds: [
        createdMaterials['VINYL-PVC'],
        createdMaterials['CARD-300'],
        createdMaterials['TRANSPARENT-100'],
      ],
    },
    {
      name: 'Eco-Solvent',
      type: 'Large Format',
      costPerM2: 14.00,
      costPerSheet: null,
      speed: '20 m²/oră',
      maxWidth: 1600,
      maxHeight: null,
      description: 'Imprimare eco-solvent pentru bannere și autocolante exterior, rezistent UV și apă',
      active: true,
      materialIds: [
        createdMaterials['VINYL-PVC'],
        createdMaterials['CANVAS-380'],
      ],
    },
    {
      name: 'Termotransfer',
      type: 'Transfer',
      costPerM2: 10.00,
      costPerSheet: 0.50,
      speed: '40 transferuri/oră',
      maxWidth: 400,
      maxHeight: 500,
      description: 'Transfer termic pentru textile și obiecte promoționale',
      active: true,
      materialIds: [
        createdMaterials['PHOTO-GLOSS-260'],
      ],
    },
    {
      name: 'DTG (Direct to Garment)',
      type: 'Textile',
      costPerM2: null,
      costPerSheet: 2.50,
      speed: '30 tricouri/oră',
      maxWidth: 400,
      maxHeight: 500,
      description: 'Imprimare directă pe textile, calitate foto pe tricouri, hanorace, genți',
      active: true,
      materialIds: [],
    },
    {
      name: 'DTF (Direct to Film)',
      type: 'Transfer',
      costPerM2: 15.00,
      costPerSheet: null,
      speed: '25 m²/oră',
      maxWidth: 600,
      maxHeight: null,
      description: 'Transfer pe film pentru textile, calitate superioară și versatilitate mare',
      active: true,
      materialIds: [
        createdMaterials['PHOTO-GLOSS-260'],
      ],
    },
  ];

  const createdPrintMethods: Record<string, string> = {};

  for (const method of printMethods) {
    const created = await prisma.printMethod.create({
      data: method,
    });
    createdPrintMethods[method.name] = created.id;
    console.log(`  ✓ ${method.name} (${method.type})`);
  }

  console.log(`\n✅ Created ${printMethods.length} print methods\n`);

  // 3️⃣ FINISHING OPERATIONS - All finishing options
  console.log('✂️  Adding Finishing Operations...');

  const finishingOps = [
    {
      name: 'Laminare Lucioasă',
      type: 'Laminare',
      costFix: 5.00,
      costPerUnit: null,
      costPerM2: 8.00,
      timeSeconds: 300,
      description: 'Laminare cu folie lucioasă, protecție și aspect premium',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['PHOTO-GLOSS-260'],
        createdMaterials['OFFSET-160'],
        createdMaterials['CARD-250'],
        createdMaterials['CARD-300'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Inkjet'],
        createdPrintMethods['Laser'],
        createdPrintMethods['UV'],
      ],
    },
    {
      name: 'Laminare Mată',
      type: 'Laminare',
      costFix: 5.00,
      costPerUnit: null,
      costPerM2: 8.00,
      timeSeconds: 300,
      description: 'Laminare cu folie mată, aspect elegant și anti-amprentă',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['PHOTO-MATT-260'],
        createdMaterials['OFFSET-160'],
        createdMaterials['CARD-250'],
        createdMaterials['CARD-300'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Inkjet'],
        createdPrintMethods['Laser'],
        createdPrintMethods['UV'],
      ],
    },
    {
      name: 'Capsare',
      type: 'Îndosariere',
      costFix: 2.00,
      costPerUnit: 0.10,
      costPerM2: null,
      timeSeconds: 60,
      description: 'Capsare cu agrafă metalică, pentru broșuri și cataloage',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['OFFSET-90'],
        createdMaterials['OFFSET-120'],
        createdMaterials['OFFSET-160'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Laser'],
        createdPrintMethods['Inkjet'],
      ],
    },
    {
      name: 'Spiralare',
      type: 'Îndosariere',
      costFix: 3.00,
      costPerUnit: 0.50,
      costPerM2: null,
      timeSeconds: 180,
      description: 'Îndosariere cu spirală plastică sau metalică',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['OFFSET-90'],
        createdMaterials['OFFSET-120'],
        createdMaterials['OFFSET-160'],
        createdMaterials['CARD-250'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Laser'],
        createdPrintMethods['Inkjet'],
      ],
    },
    {
      name: 'Tăiere Contur',
      type: 'Tăiere',
      costFix: 10.00,
      costPerUnit: null,
      costPerM2: 12.00,
      timeSeconds: 600,
      description: 'Tăiere la forma dorită cu plotter de contur',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['VINYL-PVC'],
        createdMaterials['CARD-250'],
        createdMaterials['CARD-300'],
        createdMaterials['MAGNETIC-SHEET'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['UV'],
        createdPrintMethods['Eco-Solvent'],
        createdPrintMethods['Laser'],
      ],
    },
    {
      name: 'Biguire',
      type: 'Finisare',
      costFix: 2.00,
      costPerUnit: 0.05,
      costPerM2: null,
      timeSeconds: 120,
      description: 'Realizare șanț pentru pliere precisă, pentru cărți de vizită și flyere',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['CARD-250'],
        createdMaterials['CARD-300'],
        createdMaterials['OFFSET-160'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Laser'],
        createdPrintMethods['UV'],
      ],
    },
    {
      name: 'Perforare',
      type: 'Finisare',
      costFix: 1.50,
      costPerUnit: 0.03,
      costPerM2: null,
      timeSeconds: 90,
      description: 'Găurire pentru îndosariere sau agățare',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['OFFSET-90'],
        createdMaterials['OFFSET-120'],
        createdMaterials['OFFSET-160'],
        createdMaterials['CARD-250'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Laser'],
        createdPrintMethods['Inkjet'],
      ],
    },
    {
      name: 'Pliere',
      type: 'Finisare',
      costFix: 1.00,
      costPerUnit: 0.05,
      costPerM2: null,
      timeSeconds: 60,
      description: 'Pliere la jumătate, în 3 părți sau conform șablon',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['OFFSET-90'],
        createdMaterials['OFFSET-120'],
        createdMaterials['OFFSET-160'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Laser'],
        createdPrintMethods['Inkjet'],
      ],
    },
    {
      name: 'Îndosariere',
      type: 'Îndosariere',
      costFix: 5.00,
      costPerUnit: 1.00,
      costPerM2: null,
      timeSeconds: 300,
      description: 'Asamblare completă cu coperte și finisaje profesionale',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['OFFSET-90'],
        createdMaterials['OFFSET-120'],
        createdMaterials['CARD-250'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Laser'],
        createdPrintMethods['Inkjet'],
      ],
    },
    {
      name: 'Colț Rotunjit',
      type: 'Finisare',
      costFix: 3.00,
      costPerUnit: 0.10,
      costPerM2: null,
      timeSeconds: 120,
      description: 'Rotunjire colțuri pentru aspect elegant și protecție',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['CARD-250'],
        createdMaterials['CARD-300'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Laser'],
        createdPrintMethods['UV'],
      ],
    },
    {
      name: 'Aplicare Magnet',
      type: 'Montaj',
      costFix: 5.00,
      costPerUnit: null,
      costPerM2: 20.00,
      timeSeconds: 180,
      description: 'Aplicare folie magnetică pe spate pentru frigider sau whiteboard',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['PHOTO-GLOSS-260'],
        createdMaterials['PHOTO-MATT-260'],
        createdMaterials['CARD-300'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Inkjet'],
        createdPrintMethods['UV'],
      ],
    },
    {
      name: 'Aplicare Suport Rigid',
      type: 'Montaj',
      costFix: 8.00,
      costPerUnit: null,
      costPerM2: 25.00,
      timeSeconds: 300,
      description: 'Montaj pe foam board, dibond sau PVC pentru rigiditate',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['PHOTO-GLOSS-260'],
        createdMaterials['PHOTO-MATT-260'],
        createdMaterials['CANVAS-380'],
        createdMaterials['VINYL-PVC'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Inkjet'],
        createdPrintMethods['UV'],
        createdPrintMethods['Eco-Solvent'],
      ],
    },
  ];

  for (const finishing of finishingOps) {
    await prisma.finishingOperation.create({
      data: finishing,
    });
    console.log(`  ✓ ${finishing.name} (${finishing.type})`);
  }

  console.log(`\n✅ Created ${finishingOps.length} finishing operations\n`);

  // 4️⃣ MACHINES - All printing equipment
  console.log('🖨️  Adding Machines...');

  const machines = [
    {
      name: 'Epson SureColor P700',
      type: 'Photo Inkjet Printer',
      costPerHour: 15.00,
      speed: '13 minute/A2',
      maxWidth: 432,
      maxHeight: null,
      description: 'Imprimantă photo profesională A3+, 10 culori, calitate muzeală pentru artă și fotografie',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['PHOTO-GLOSS-260'],
        createdMaterials['PHOTO-MATT-260'],
        createdMaterials['CANVAS-380'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Inkjet'],
      ],
    },
    {
      name: 'Canon imagePROGRAF PRO-300',
      type: 'Photo Inkjet Printer',
      costPerHour: 18.00,
      speed: '90 secunde/A3',
      maxWidth: 432,
      maxHeight: null,
      description: 'Imprimantă A3+ cu 10 cerneale pigment, gamă cromatică extinsă pentru fotografi profesioniști',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['PHOTO-GLOSS-260'],
        createdMaterials['PHOTO-MATT-260'],
        createdMaterials['CANVAS-380'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Inkjet'],
      ],
    },
    {
      name: 'HP Latex 315',
      type: 'Large Format Printer',
      costPerHour: 35.00,
      speed: '23 m²/oră',
      maxWidth: 1625,
      maxHeight: null,
      description: 'Imprimantă latex 64", calitate excelentă pentru bannere, rollup-uri, autocolante',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['VINYL-PVC'],
        createdMaterials['CANVAS-380'],
        createdMaterials['PHOTO-GLOSS-260'],
        createdMaterials['PHOTO-MATT-260'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Eco-Solvent'],
      ],
    },
    {
      name: 'Mimaki CJV300-160',
      type: 'Print & Cut',
      costPerHour: 40.00,
      speed: '20 m²/oră',
      maxWidth: 1610,
      maxHeight: null,
      description: 'Imprimantă eco-solvent cu plotter integrat, perfectă pentru autocolante și grafică vehicule',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['VINYL-PVC'],
        createdMaterials['MAGNETIC-SHEET'],
        createdMaterials['TRANSPARENT-100'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Eco-Solvent'],
        createdPrintMethods['UV'],
      ],
    },
    {
      name: 'Xerox Versant 180',
      type: 'Production Printer',
      costPerHour: 50.00,
      speed: '80 ppm',
      maxWidth: 330,
      maxHeight: 660,
      description: 'Imprimantă digitală de producție, perfectă pentru volume mari și calitate consistentă',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['OFFSET-90'],
        createdMaterials['OFFSET-120'],
        createdMaterials['OFFSET-160'],
        createdMaterials['CARD-250'],
        createdMaterials['CARD-300'],
        createdMaterials['COLOR-MIX-120'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Laser'],
      ],
    },
    {
      name: 'Ricoh Pro C5300s',
      type: 'Production Printer',
      costPerHour: 55.00,
      speed: '90 ppm',
      maxWidth: 330,
      maxHeight: 700,
      description: 'Imprimantă de producție cu inline finishing, ideală pentru cărți, cataloage, broșuri',
      active: true,
      compatibleMaterialIds: [
        createdMaterials['OFFSET-90'],
        createdMaterials['OFFSET-120'],
        createdMaterials['OFFSET-160'],
        createdMaterials['CARD-250'],
        createdMaterials['RECYCLED-100'],
      ],
      compatiblePrintMethodIds: [
        createdPrintMethods['Laser'],
      ],
    },
  ];

  for (const machine of machines) {
    await prisma.machine.create({
      data: machine,
    });
    console.log(`  ✓ ${machine.name} (${machine.type})`);
  }

  console.log(`\n✅ Created ${machines.length} machines\n`);

  // 5️⃣ PRODUCTION WORKFLOWS (stored as system settings)
  console.log('🔄 Adding Production Workflows...');

  const workflows = [
    {
      key: 'workflow_standard',
      value: JSON.stringify({
        name: 'Standard: Imprimare → Finisare → Ambalare',
        steps: [
          { order: 1, name: 'Primire comandă', duration: 300, description: 'Verificare fișiere și specificații' },
          { order: 2, name: 'Pre-press', duration: 600, description: 'Pregătire fișiere pentru imprimare' },
          { order: 3, name: 'Imprimare', duration: 1800, description: 'Imprimare pe echipament' },
          { order: 4, name: 'Control calitate', duration: 300, description: 'Verificare culori și defecte' },
          { order: 5, name: 'Finisare', duration: 900, description: 'Tăiere, laminare, alte finisaje' },
          { order: 6, name: 'Ambalare', duration: 300, description: 'Ambalare protectivă' },
          { order: 7, name: 'Livrare', duration: 600, description: 'Pregătire pentru curier' },
        ],
        estimatedTime: 4800, // 80 minute
        compatibleProducts: ['business-cards', 'flyers', 'posters', 'photos'],
      }),
    },
    {
      key: 'workflow_large_format',
      value: JSON.stringify({
        name: 'Large Format: Imprimare → Tăiere → Laminare → Livrare',
        steps: [
          { order: 1, name: 'Primire comandă', duration: 300, description: 'Verificare dimensiuni și materiale' },
          { order: 2, name: 'Pre-press', duration: 900, description: 'Pregătire RIP și profil culoare' },
          { order: 3, name: 'Imprimare large format', duration: 3600, description: 'Imprimare pe plotter' },
          { order: 4, name: 'Uscare', duration: 1800, description: 'Lăsare la uscat pentru stabilizare' },
          { order: 5, name: 'Tăiere contur', duration: 1200, description: 'Tăiere cu plotter de contur' },
          { order: 6, name: 'Laminare', duration: 1800, description: 'Aplicare folie protectoare' },
          { order: 7, name: 'Control final', duration: 600, description: 'Verificare finală și curățare' },
          { order: 8, name: 'Livrare', duration: 900, description: 'Rulare și ambalare pentru transport' },
        ],
        estimatedTime: 11100, // 185 minute (~3 ore)
        compatibleProducts: ['banners', 'vinyl-stickers', 'canvas-prints', 'vehicle-graphics'],
      }),
    },
    {
      key: 'workflow_premium',
      value: JSON.stringify({
        name: 'Premium: Imprimare → Verificare → Producție → Livrare',
        steps: [
          { order: 1, name: 'Primire comandă VIP', duration: 600, description: 'Consultare client și aprobare mostre' },
          { order: 2, name: 'Pre-press avansat', duration: 1200, description: 'Color matching și calibrare' },
          { order: 3, name: 'Imprimare probă', duration: 900, description: 'Creare mostre pentru aprobare' },
          { order: 4, name: 'Aprobare client', duration: 1800, description: 'Review și ajustări' },
          { order: 5, name: 'Imprimare finală', duration: 2400, description: 'Imprimare cu setări aprobate' },
          { order: 6, name: 'Control calitate strict', duration: 900, description: 'Verificare cu densitometru și spectrofotometru' },
          { order: 7, name: 'Finisaje premium', duration: 1800, description: 'Laminare, biguire, alte finisaje de lux' },
          { order: 8, name: 'Ambalare premium', duration: 600, description: 'Ambalare în cutii branded' },
          { order: 9, name: 'Livrare prioritară', duration: 900, description: 'Curier express sau livrare personalizată' },
        ],
        estimatedTime: 11100, // 185 minute (~3 ore)
        compatibleProducts: ['business-cards-premium', 'art-prints', 'packaging', 'luxury-invitations'],
      }),
    },
  ];

  for (const workflow of workflows) {
    await prisma.systemSetting.upsert({
      where: { key: workflow.key },
      update: { value: workflow.value },
      create: workflow,
    });
    const parsed = JSON.parse(workflow.value);
    console.log(`  ✓ ${parsed.name} (${parsed.steps.length} steps)`);
  }

  console.log(`\n✅ Created ${workflows.length} production workflows\n`);

  console.log('🎉 Inventory seeding complete!\n');
  console.log('📊 Summary:');
  console.log(`   • ${materials.length} materials`);
  console.log(`   • ${printMethods.length} print methods`);
  console.log(`   • ${finishingOps.length} finishing operations`);
  console.log(`   • ${machines.length} machines`);
  console.log(`   • ${workflows.length} production workflows`);
  console.log('\n✅ All inventory data successfully added to database!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding inventory:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
