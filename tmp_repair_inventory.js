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

  const statements = [
    `CREATE TABLE IF NOT EXISTS public."inventory_items" (
      "id" TEXT NOT NULL,
      "materialId" TEXT NOT NULL,
      "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "unit" TEXT NOT NULL,
      "costPerUnit" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
    );`,
    `CREATE TABLE IF NOT EXISTS public."job_material_usages" (
      "id" TEXT NOT NULL,
      "jobId" TEXT NOT NULL,
      "materialId" TEXT NOT NULL,
      "formatId" TEXT,
      "width_mm" INTEGER,
      "height_mm" INTEGER,
      "area_m2" DOUBLE PRECISION,
      "length_m" DOUBLE PRECISION,
      "quantityUsed" DOUBLE PRECISION NOT NULL,
      "unit" TEXT NOT NULL,
      "cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "job_material_usages_pkey" PRIMARY KEY ("id")
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "inventory_items_materialId_key" ON public."inventory_items" ("materialId");`,
    `CREATE INDEX IF NOT EXISTS "job_material_usages_jobId_idx" ON public."job_material_usages" ("jobId");`,
    `CREATE INDEX IF NOT EXISTS "job_material_usages_materialId_idx" ON public."job_material_usages" ("materialId");`,
    `ALTER TABLE public."inventory_items" DROP CONSTRAINT IF EXISTS "inventory_items_materialId_fkey";`,
    `ALTER TABLE public."inventory_items" ADD CONSTRAINT "inventory_items_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES public."materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE public."job_material_usages" DROP CONSTRAINT IF EXISTS "job_material_usages_jobId_fkey";`,
    `ALTER TABLE public."job_material_usages" ADD CONSTRAINT "job_material_usages_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public."production_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE public."job_material_usages" DROP CONSTRAINT IF EXISTS "job_material_usages_materialId_fkey";`,
    `ALTER TABLE public."job_material_usages" ADD CONSTRAINT "job_material_usages_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES public."materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;`
  ];

  for (const sql of statements) {
    await client.query(sql);
  }

  console.log('inventory tables and FKs restored');
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
