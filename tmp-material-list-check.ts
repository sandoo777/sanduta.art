import { listMaterials } from './src/modules/materials/server';

async function main() {
  const rows = await listMaterials();
  console.log(JSON.stringify({
    count: rows.length,
    sample: rows.slice(0, 5).map((m) => ({
      id: m.id,
      name: m.name,
      categoryId: m.categoryId,
      active: m.active,
      priceBreaks: Array.isArray(m.priceBreaks) ? m.priceBreaks.length : 0,
    })),
  }, null, 2));
}

main().catch((error) => {
  console.error('LIST_MATERIALS_ERROR');
  console.error(error);
  process.exit(1);
});
