const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sanduta';
  const client = new Client({ connectionString });
  await client.connect();

  const materialCheck = await client.query(`
    SELECT
      COUNT(*)::int AS total_materials,
      MIN("createdAt") AS earliest_created_at,
      MAX("createdAt") AS latest_created_at
    FROM public."materials";
  `);

  const materialSample = await client.query(`
    SELECT id, name, "createdAt", "updatedAt"
    FROM public."materials"
    ORDER BY "createdAt" ASC
    LIMIT 3;
  `);

  const materialTables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name ILIKE '%material%'
    ORDER BY table_name;
  `);

  const tableCounts = await client.query(`
    SELECT table_name, to_jsonb(row_count) AS row_count
    FROM (
      SELECT 'materials' AS table_name, (SELECT COUNT(*) FROM public."materials") AS row_count
      UNION ALL
      SELECT 'material_price_breaks', (SELECT COUNT(*) FROM public."material_price_breaks")
      UNION ALL
      SELECT 'material_suppliers', (SELECT COUNT(*) FROM public."material_suppliers")
      UNION ALL
      SELECT 'suppliers', (SELECT COUNT(*) FROM public."suppliers")
      UNION ALL
      SELECT 'material_categories', (SELECT COUNT(*) FROM public."material_categories")
    ) q;
  `);

  console.log(JSON.stringify({
    materialCheck: materialCheck.rows[0],
    sample: materialSample.rows,
    relatedTables: materialTables.rows.map((r) => r.table_name),
    tableCounts: tableCounts.rows,
  }, null, 2));

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
