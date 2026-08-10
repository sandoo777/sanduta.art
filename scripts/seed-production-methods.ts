import { prisma } from '../src/lib/prisma';

type SeedPrintMethod = {
  name: string;
  type: string;
  description: string;
  isOutsourced: boolean;
  markup: number | null;
  active: boolean;
};

const productionPrintMethods: SeedPrintMethod[] = [
  {
    name: 'Tipar Digital CMYK',
    type: 'Digital',
    description:
      'Proces digital policromie pentru tiraje mici si medii: flyere, afise, documentatie comerciala si materiale promotionale cu livrare rapida.',
    isOutsourced: false,
    markup: null,
    active: true,
  },
  {
    name: 'Tipar Digital K (Monocrom)',
    type: 'Digital',
    description:
      'Print digital monocrom (negru) optimizat pentru costuri reduse la volume mari de documente, manuale, formulare si materiale office.',
    isOutsourced: false,
    markup: null,
    active: true,
  },
  {
    name: 'Tipar Large Format Ecosolvent',
    type: 'Large Format',
    description:
      'Print de mari dimensiuni ecosolvent pe materiale flexibile precum banner, mesh si autocolant, cu rezistenta buna la exterior.',
    isOutsourced: false,
    markup: null,
    active: true,
  },
  {
    name: 'Sublimare',
    type: 'Transfer',
    description:
      'Transfer termic prin sublimare pe textile poliester, ceramica si metal tratat, cu culori intense si aderenta ridicata.',
    isOutsourced: false,
    markup: null,
    active: true,
  },
  {
    name: 'Decupare Autocolante (Plotter Cutting)',
    type: 'Cutting',
    description:
      'Decupare vectoriala pentru autocolante, folii si litere volumetrice, folosita in productie de semnalistica si branding aplicat.',
    isOutsourced: false,
    markup: null,
    active: true,
  },
  {
    name: 'Flex pentru Textile (Transfer Vinyl)',
    type: 'Textile',
    description:
      'Aplicare folie flex termotransfer pentru tricouri, hanorace si echipamente sportive, cu contur precis si rezistenta la spalare.',
    isOutsourced: false,
    markup: null,
    active: true,
  },
  {
    name: 'Flex Ecosolvent pentru Textile',
    type: 'Textile',
    description:
      'Flux combinat: print ecosolvent pe folie flex imprimabila, decupare la plotter si transfer termic pe material textil.',
    isOutsourced: false,
    markup: null,
    active: true,
  },
  {
    name: 'Tipar UV (Outsource)',
    type: 'UV',
    description:
      'Print UV externalizat pentru materiale rigide (PVC, forex, plexi, dibond) si aplicatii speciale pe suporturi care necesita echipamente dedicate.',
    isOutsourced: true,
    markup: 20,
    active: true,
  },
  {
    name: 'DTF (Direct-to-Film)',
    type: 'Transfer',
    description:
      'Serviciu externalizat DTF (print + pudrare + presare), ideal pentru personalizari textile in serii mici si medii.',
    isOutsourced: true,
    markup: 18,
    active: true,
  },
  {
    name: 'Tipar Offset (Outsource)',
    type: 'Offset',
    description:
      'Tipar offset externalizat pentru tiraje mari de reviste, brosuri, pliante si cataloage cu cost per exemplar optimizat.',
    isOutsourced: true,
    markup: 15,
    active: true,
  },
  {
    name: 'Tipar Ecosolvent Wide (>160 cm)',
    type: 'Large Format',
    description:
      'Productie ecosolvent externalizata pentru latimi mari (180-320 cm), peste capacitatea imprimantelor interne.',
    isOutsourced: true,
    markup: 16,
    active: true,
  },
  {
    name: 'Gravare (Laser / CNC) - Outsource',
    type: 'Engraving',
    description:
      'Gravare externalizata laser/CNC pentru materiale rigide, placute, semnalistica si proiecte care necesita echipamente de precizie.',
    isOutsourced: true,
    markup: 22,
    active: true,
  },
  {
    name: 'Serigrafie (Outsource)',
    type: 'Serigrafie',
    description:
      'Serigrafie externalizata pentru textile, sacose, carton si plastic in tiraje medii si mari.',
    isOutsourced: true,
    markup: 20,
    active: true,
  },
  {
    name: 'Broderie (Outsource)',
    type: 'Embroidery',
    description:
      'Broderie computerizata externalizata pentru textile promotionale, uniforme si patch-uri personalizate.',
    isOutsourced: true,
    markup: 25,
    active: true,
  },
];

async function main() {
  console.log('Seeding official production print methods...');

  for (const method of productionPrintMethods) {
    await prisma.printMethod.upsert({
      where: { name: method.name },
      update: {
        type: method.type,
        description: method.description,
        isOutsourced: method.isOutsourced,
        markup: method.markup,
        active: method.active,
      },
      create: {
        name: method.name,
        type: method.type,
        description: method.description,
        isOutsourced: method.isOutsourced,
        markup: method.markup,
        active: method.active,
      },
    });

    console.log(`- ${method.name} (${method.isOutsourced ? 'OUTSOURCE' : 'INTERNAL'})`);
  }

  console.log(`Done. Upserted ${productionPrintMethods.length} methods.`);
}

main()
  .catch((error) => {
    console.error('Failed to seed production methods:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
