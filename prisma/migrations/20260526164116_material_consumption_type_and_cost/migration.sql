/*
  Warnings:

  - The `unit` column on the `material_usages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `unit` column on the `materials` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MaterialConsumptionType" AS ENUM ('AREA_BASED', 'DIRECT');

-- CreateEnum
CREATE TYPE "MaterialUnit" AS ENUM ('liter', 'ml', 'gram', 'kg', 'unit', 'm2', 'meter', 'pcs');

-- AlterTable
ALTER TABLE "material_usages" ADD COLUMN     "cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
DROP COLUMN "unit",
ADD COLUMN     "unit" "MaterialUnit" NOT NULL DEFAULT 'pcs';

-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "consumptionType" "MaterialConsumptionType" NOT NULL DEFAULT 'AREA_BASED',
DROP COLUMN "unit",
ADD COLUMN     "unit" "MaterialUnit" NOT NULL DEFAULT 'pcs';

-- CreateIndex
CREATE INDEX "material_usages_materialId_idx" ON "material_usages"("materialId");

-- CreateIndex
CREATE INDEX "material_usages_jobId_idx" ON "material_usages"("jobId");

-- CreateIndex
CREATE INDEX "materials_consumptionType_idx" ON "materials"("consumptionType");
