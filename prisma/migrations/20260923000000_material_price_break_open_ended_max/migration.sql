-- The material_price_breaks table was declared in the Prisma schema but was never
-- created by a migration in this database. Create it now with qtyMax nullable so the
-- last pricing tier can be open-ended (unlimited max quantity, e.g. "5000+").
-- CreateTable
CREATE TABLE IF NOT EXISTS "material_price_breaks" (
    "id" TEXT NOT NULL,
    "qtyMin" INTEGER NOT NULL,
    "qtyMax" INTEGER,
    "price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION,
    "materialId" TEXT NOT NULL,

    CONSTRAINT "material_price_breaks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "material_price_breaks_materialId_idx" ON "material_price_breaks"("materialId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'material_price_breaks_materialId_fkey'
    ) THEN
        ALTER TABLE "material_price_breaks"
            ADD CONSTRAINT "material_price_breaks_materialId_fkey"
            FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- In case the table already exists in some environment with qtyMax NOT NULL, relax it.
ALTER TABLE "material_price_breaks" ALTER COLUMN "qtyMax" DROP NOT NULL;
