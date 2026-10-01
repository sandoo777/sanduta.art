const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:password@localhost:5432/sanduta',
  });

  await client.connect();

  const { rows: tables } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND (table_name LIKE '%machine%' OR table_name LIKE '%material%')
    ORDER BY table_name
  `);

  const { rows: enums } = await client.query(`
    SELECT typname, enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname IN ('MaintenanceType', 'EquipmentType', 'MachineStatus', 'ProductionMode')
    ORDER BY typname, enumsortorder
  `);

  console.log('TABLES');
  console.log(JSON.stringify(tables, null, 2));
  console.log('ENUMS');
  console.log(JSON.stringify(enums, null, 2));

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
