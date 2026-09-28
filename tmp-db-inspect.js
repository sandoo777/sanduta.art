const { Client } = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sanduta';

(async () => {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const tables = [
      'materials',
      'material_price_breaks',
      'material_suppliers',
      'suppliers',
      'print_methods',
      '_PrintMethodMaterials',
      'material_categories',
      'inventory_items',
      'job_material_usages'
    ];

    const { rows } = await client.query(
      `SELECT table_name, column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = ANY($1)
       ORDER BY table_name, ordinal_position`,
      [tables]
    );

    console.log(JSON.stringify(rows, null, 2));

    const migrationRows = await client.query(
      `SELECT migration_name, started_at, finished_at, success
       FROM prisma_migrations
       ORDER BY started_at ASC;`
    );
    console.log('\n--- prisma_migrations ---');
    console.log(JSON.stringify(migrationRows.rows, null, 2));
  } finally {
    await client.end();
  }
})();
