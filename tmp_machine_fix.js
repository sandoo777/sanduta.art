const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'sanduta',
  });

  await client.connect();

  const check = await client.query("SELECT to_regclass('public.machine_maintenance_records') AS table_exists");
  console.log('CHECK', JSON.stringify(check.rows[0]));

  if (!check.rows[0]?.table_exists) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public."machine_maintenance_records" (
        "id" TEXT NOT NULL,
        "machineId" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "type" "MaintenanceType" NOT NULL DEFAULT 'PREVENTIVE',
        "description" TEXT NOT NULL,
        "cost" DECIMAL(10,2),
        "technician" TEXT,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "machine_maintenance_records_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "machine_maintenance_records_machineId_date_idx"
      ON public."machine_maintenance_records" ("machineId", "date");
    `);

    await client.query(`
      ALTER TABLE public."machine_maintenance_records"
      DROP CONSTRAINT IF EXISTS "machine_maintenance_records_machineId_fkey";
    `);

    await client.query(`
      ALTER TABLE public."machine_maintenance_records"
      ADD CONSTRAINT "machine_maintenance_records_machineId_fkey"
      FOREIGN KEY ("machineId") REFERENCES public."machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    console.log('CREATED_TABLE_AND_FK');
  } else {
    console.log('TABLE_ALREADY_EXISTS');
  }

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
