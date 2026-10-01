const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'sanduta',
    ssl: false,
  });

  await client.connect();

  const checks = await client.query(`
    SELECT
      to_regclass('public.inventory_items') AS inventory_items,
      to_regclass('public.job_material_usages') AS job_material_usages,
      to_regclass('public.materials') AS materials,
      to_regclass('public.production_jobs') AS production_jobs;
  `);

  console.log(JSON.stringify(checks.rows[0], null, 2));

  const constraints = await client.query(`
    SELECT conname, contype, pg_get_constraintdef(oid) AS def
    FROM pg_constraint
    WHERE conrelid = 'public.materials'::regclass
    ORDER BY conname;
  `);

  console.log('CONSTRAINTS');
  console.log(JSON.stringify(constraints.rows, null, 2));

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
