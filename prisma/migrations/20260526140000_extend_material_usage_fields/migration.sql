-- CreateEnum
CREATE TYPE "UsageUnit" AS ENUM ('sqm', 'meter', 'unit');

-- AlterTable: add new columns with defaults so existing rows stay valid
ALTER TABLE "material_usages"
ADD COLUMN "unit"         "UsageUnit"      NOT NULL DEFAULT 'unit',
ADD COLUMN "wastePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "totalUsed"    DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Backfill: set totalUsed = quantity for pre-existing rows
UPDATE "material_usages"
SET "totalUsed" = "quantity"
WHERE "totalUsed" = 0 AND "quantity" > 0;
