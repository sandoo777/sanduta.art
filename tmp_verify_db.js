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

  const columns = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'machine_maintenance_records'
    ORDER BY ordinal_position;
  `);

  const indexes = await client.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'machine_maintenance_records'
    ORDER BY indexname;
  `);

  const fks = await client.query(`
    SELECT conname, pg_get_constraintdef(oid) AS definition
    FROM pg_constraint
    WHERE conrelid = 'public.machine_maintenance_records'::regclass;
  `);

  const tables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('machines', 'machine_maintenance_records')
    ORDER BY table_name;
  `);

  console.log('TABLES');
  console.log(JSON.stringify(tables.rows, null, 2));
  console.log('COLUMNS');
  console.log(JSON.stringify(columns.rows, null, 2));
  console.log('INDEXES');
  console.log(JSON.stringify(indexes.rows, null, 2));
  console.log('FOREIGN_KEYS');
  console.log(JSON.stringify(fks.rows, null, 2));

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
