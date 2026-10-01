const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'sanduta',
    ssl: false,
    statement_timeout: 20000,
  });

  await client.connect();

  const tables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  const modelNames = [
    'users', 'categories', 'products', 'materials', 'machines', 'orders',
    'purchase_orders', 'inventory_items', 'production_jobs', 'suppliers',
    'material_categories', 'product_materials', 'order_items', 'purchase_order_lines',
    'machine_maintenance_records', 'material_suppliers'
  ];

  const modelTables = {};
  for (const name of modelNames) {
    const res = await client.query(`SELECT to_regclass('public.${name}') AS table_exists;`);
    modelTables[name] = res.rows[0]?.table_exists || null;
  }

  console.log(JSON.stringify({
    tableCount: tables.rows.length,
    tables: tables.rows.map(r => r.table_name).slice(0, 80),
    modelTables,
  }, null, 2));

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
