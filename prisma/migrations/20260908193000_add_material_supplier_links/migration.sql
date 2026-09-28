ALTER TABLE "materials"
  ADD COLUMN IF NOT EXISTS "primarySupplierId" TEXT;

CREATE TABLE IF NOT EXISTS "material_suppliers" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "leadTimeDays" INTEGER,
    "unitCost" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_suppliers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "material_suppliers_materialId_supplierId_key"
    ON "material_suppliers"("materialId", "supplierId");

CREATE INDEX IF NOT EXISTS "material_suppliers_materialId_idx"
    ON "material_suppliers"("materialId");

CREATE INDEX IF NOT EXISTS "material_suppliers_supplierId_idx"
    ON "material_suppliers"("supplierId");

CREATE INDEX IF NOT EXISTS "materials_primarySupplierId_idx"
    ON "materials"("primarySupplierId");

ALTER TABLE "materials"
    ADD CONSTRAINT "materials_primarySupplierId_fkey"
    FOREIGN KEY ("primarySupplierId") REFERENCES "suppliers"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

ALTER TABLE "material_suppliers"
    ADD CONSTRAINT "material_suppliers_materialId_fkey"
    FOREIGN KEY ("materialId") REFERENCES "materials"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE "material_suppliers"
    ADD CONSTRAINT "material_suppliers_supplierId_fkey"
    FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;
