const { Client } = require('pg');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
const skipConfirmation = args.includes('--yes') || args.includes('--confirm');
const dryRun = args.includes('--dry-run');

if (!skipConfirmation && !dryRun) {
  console.log('⚠️  WARNING: This script can alter schema and potentially expose data loss risk.');
  console.log('Database target: ' + (process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sanduta'));
  console.log('Type REPAIR_DATABASE to continue.');
  process.stdout.write('> ');

  const input = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  input.question('', (answer) => {
    input.close();
    if (answer.trim() !== 'REPAIR_DATABASE') {
      console.log('Aborted. No schema repair was executed.');
      process.exit(0);
    }

    runRepair();
  });
} else {
  runRepair();
}

function runRepair() {
  if (dryRun) {
    console.log('Dry run enabled: backup step skipped, schema repair would continue.');
    return;
  }

  const backup = spawnSync(process.execPath, ['scripts/db-safety.ts', 'backup', '--yes'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  });

  if (backup.status !== 0) {
    console.error('Backup failed. Aborting custom repair.');
    process.exit(backup.status || 1);
  }

  main();
}

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sanduta',
  });

  await client.connect();

  const enumCheck = await client.query(`
    SELECT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'MaintenanceType'
    ) AS exists
  `);

  if (!enumCheck.rows[0].exists) {
    await client.query(`
      CREATE TYPE "MaintenanceType" AS ENUM (
        'PREVENTIVE',
        'CORRECTIVE',
        'CALIBRATION',
        'REPAIR',
        'PART_REPLACEMENT',
        'INSPECTION'
      )
    `);
    console.log('Created enum MaintenanceType');
  }

  const tableCheck = await client.query(`
    SELECT to_regclass('public.machine_maintenance_records') AS table_name
  `);

  if (!tableCheck.rows[0].table_name) {
    await client.query(`
      CREATE TABLE "machine_maintenance_records" (
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
        PRIMARY KEY ("id")
      )
    `);
    console.log('Created table machine_maintenance_records');
  }

  const indexCheck = await client.query(`
    SELECT to_regclass('public.machine_maintenance_records_machineId_date_idx') AS index_name
  `);

  if (!indexCheck.rows[0].index_name) {
    await client.query(`
      CREATE INDEX "machine_maintenance_records_machineId_date_idx"
      ON "machine_maintenance_records" ("machineId", "date")
    `);
    console.log('Created index machine_maintenance_records_machineId_date_idx');
  }

  const fkCheck = await client.query(`
    SELECT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'machine_maintenance_records_machineId_fkey'
    ) AS exists
  `);

  if (!fkCheck.rows[0].exists) {
    await client.query(`
      ALTER TABLE "machine_maintenance_records"
      ADD CONSTRAINT "machine_maintenance_records_machineId_fkey"
      FOREIGN KEY ("machineId") REFERENCES "machines"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('Created FK machine_maintenance_records_machineId_fkey');
  }

  console.log('MAINTENANCE_SCHEMA_REPAIRED');
  await client.end();
}
