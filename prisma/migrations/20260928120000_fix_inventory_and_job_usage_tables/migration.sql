-- Safe repair for missing InventoryItem and JobMaterialUsage tables.
-- This migration preserves the existing migration history and avoids the invalid
-- drop of the materials_name_key unique constraint that caused the earlier drift.

CREATE TABLE IF NOT EXISTS "inventory_items" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "costPerUnit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "job_material_usages" (
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
);

CREATE UNIQUE INDEX IF NOT EXISTS "inventory_items_materialId_key"
    ON "inventory_items"("materialId");

CREATE INDEX IF NOT EXISTS "job_material_usages_jobId_idx"
    ON "job_material_usages"("jobId");

CREATE INDEX IF NOT EXISTS "job_material_usages_materialId_idx"
    ON "job_material_usages"("materialId");

ALTER TABLE "inventory_items"
    DROP CONSTRAINT IF EXISTS "inventory_items_materialId_fkey";

ALTER TABLE "job_material_usages"
    DROP CONSTRAINT IF EXISTS "job_material_usages_jobId_fkey";

ALTER TABLE "job_material_usages"
    DROP CONSTRAINT IF EXISTS "job_material_usages_materialId_fkey";

ALTER TABLE "inventory_items"
    ADD CONSTRAINT "inventory_items_materialId_fkey"
    FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "job_material_usages"
    ADD CONSTRAINT "job_material_usages_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "production_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "job_material_usages"
    ADD CONSTRAINT "job_material_usages_materialId_fkey"
    FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
