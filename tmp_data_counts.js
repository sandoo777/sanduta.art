const { Client } = require('pg');

const tables = [
  'users',
  'categories',
  'products',
  'materials',
  'suppliers',
  'inventory_items',
  'machines',
  'machine_maintenance_records',
  'orders',
  'purchase_orders',
  'production_jobs',
];

(async () => {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'sanduta',
    ssl: false,
  });

  await client.connect();
  const counts = {};

  for (const table of tables) {
    try {
      const result = await client.query(`SELECT COUNT(*)::int AS c FROM public."${table}"`);
      counts[table] = Number(result.rows[0].c);
    } catch (error) {
      counts[table] = 'MISSING_TABLE';
    }
  }

  console.log(JSON.stringify(counts, null, 2));
  await client.end();
})();
