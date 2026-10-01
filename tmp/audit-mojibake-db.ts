import { prisma } from '../src/lib/prisma';

type Row = Record<string, unknown>;

const pattern = /(Ã|Â|â€™|â€œ|â€|â€“|â€”|â€¢|ðŸ|â”€|Äƒ|È™|È›|Ã¢|Ãș|Ãț|Ãă)/;

function hasMojibake(value: unknown): boolean {
  return typeof value === 'string' && pattern.test(value);
}

function pickCorrupted(row: Row, fields: string[]) {
  const out: Record<string, string> = {};
  for (const field of fields) {
    const value = row[field];
    if (hasMojibake(value)) out[field] = String(value);
  }
  return out;
}

async function main() {
  const [machines, materials, categories] = await Promise.all([
    prisma.machine.findMany({
      select: { id: true, name: true, type: true, description: true, notes: true, speed: true, maxFormat: true },
      take: 500,
    }),
    prisma.material.findMany({
      select: { id: true, name: true, sku: true, notes: true, formatName: true, packagingLabel: true, colorName: true },
      take: 1000,
    }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true, description: true, metaTitle: true, metaDescription: true },
      take: 500,
    }),
  ]);

  const machineCorrupt = machines
    .map((r) => ({ id: r.id, bad: pickCorrupted(r as unknown as Row, ['name', 'type', 'description', 'notes', 'speed', 'maxFormat']) }))
    .filter((r) => Object.keys(r.bad).length > 0);

  const materialCorrupt = materials
    .map((r) => ({ id: r.id, bad: pickCorrupted(r as unknown as Row, ['name', 'sku', 'notes', 'formatName', 'packagingLabel', 'colorName']) }))
    .filter((r) => Object.keys(r.bad).length > 0);

  const categoryCorrupt = categories
    .map((r) => ({ id: r.id, bad: pickCorrupted(r as unknown as Row, ['name', 'slug', 'description', 'metaTitle', 'metaDescription']) }))
    .filter((r) => Object.keys(r.bad).length > 0);

  const report = {
    checked: {
      machines: machines.length,
      materials: materials.length,
      categories: categories.length,
    },
    corrupted: {
      machines: machineCorrupt,
      materials: materialCorrupt,
      categories: categoryCorrupt,
    },
  };

  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
