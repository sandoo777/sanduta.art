const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sanduta';

const sql = [
  'ALTER TABLE "materials" DROP COLUMN IF EXISTS "supportedColorModes";',
  'ALTER TABLE "material_categories" DROP COLUMN IF EXISTS "type";',
  'ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "colorCode" TEXT;',
  'ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "colorName" TEXT;',
  'ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "thumbnailUrl" TEXT;',
  'ALTER TABLE "materials" ADD COLUMN IF NOT EXISTS "macroTextureUrl" TEXT;',
  'CREATE TABLE IF NOT EXISTS "material_price_breaks" ("id" TEXT NOT NULL, "qtyMin" INTEGER NOT NULL, "qtyMax" INTEGER, "price" DOUBLE PRECISION NOT NULL, "discount" DOUBLE PRECISION, "materialId" TEXT NOT NULL, CONSTRAINT "material_price_breaks_pkey" PRIMARY KEY ("id"));',
  'CREATE INDEX IF NOT EXISTS "material_price_breaks_materialId_idx" ON "material_price_breaks" ("materialId");',
  `DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'material_price_breaks_materialId_fkey'
     ) THEN
       ALTER TABLE "material_price_breaks"
         ADD CONSTRAINT "material_price_breaks_materialId_fkey"
         FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
     END IF;
   END $$;`,
  'ALTER TABLE "material_price_breaks" ALTER COLUMN "qtyMax" DROP NOT NULL;',
  'CREATE TABLE IF NOT EXISTS "material_suppliers" ("id" TEXT NOT NULL, "materialId" TEXT NOT NULL, "supplierId" TEXT NOT NULL, "isPrimary" BOOLEAN NOT NULL DEFAULT false, "leadTimeDays" INTEGER, "unitCost" DECIMAL(10,2), "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "material_suppliers_pkey" PRIMARY KEY ("id"));',
  'CREATE UNIQUE INDEX IF NOT EXISTS "material_suppliers_materialId_supplierId_key" ON "material_suppliers" ("materialId", "supplierId");',
  'CREATE INDEX IF NOT EXISTS "material_suppliers_materialId_idx" ON "material_suppliers" ("materialId");',
  'CREATE INDEX IF NOT EXISTS "material_suppliers_supplierId_idx" ON "material_suppliers" ("supplierId");',
  `DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'material_suppliers_materialId_fkey'
     ) THEN
       ALTER TABLE "material_suppliers"
         ADD CONSTRAINT "material_suppliers_materialId_fkey"
         FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE;
     END IF;
   END $$;`,
  `DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'material_suppliers_supplierId_fkey'
     ) THEN
       ALTER TABLE "material_suppliers"
         ADD CONSTRAINT "material_suppliers_supplierId_fkey"
         FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT;
     END IF;
   END $$;`
];

(async () => {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    for (const stmt of sql) {
      await client.query(stmt);
      console.log('OK:', stmt.slice(0, 90));
    }
    console.log('material drift repair complete');
  } catch (error) {
    console.error('repair failed');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
