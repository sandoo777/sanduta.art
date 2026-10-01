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

  const tables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name LIKE '%prisma%';
  `);

  console.log('PRISMA_TABLES', JSON.stringify(tables.rows, null, 2));

  const migrationExists = await client.query(`
    SELECT to_regclass('public._prisma_migrations') AS migration_table;
  `);

  console.log('MIGRATION_TABLE', JSON.stringify(migrationExists.rows, null, 2));

  if (migrationExists.rows[0]?.migration_table) {
    const rows = await client.query(`
      SELECT *
      FROM public._prisma_migrations
      ORDER BY started_at;
    `);
    console.log('MIGRATION_ROWS', JSON.stringify(rows.rows.slice(-20), null, 2));
  }

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
