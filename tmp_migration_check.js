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

  const migrationTable = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = '_prisma_migrations';
  `);

  if (migrationTable.rows.length > 0) {
    const rows = await client.query(`
      SELECT migration_name, started_at, finished_at, status
      FROM _prisma_migrations
      WHERE migration_name LIKE '%machine%' OR migration_name LIKE '%inventory%' OR migration_name LIKE '%materials%'
      ORDER BY started_at;
    `);
    console.log(JSON.stringify(rows.rows, null, 2));
  } else {
    console.log('NO_PRISMA_MIGRATIONS_TABLE');
  }

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
