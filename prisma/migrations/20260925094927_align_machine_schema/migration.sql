/*
  Warnings:

  - The values [DIGITAL,HOURLY] on the enum `EquipmentType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `inkChangeoverCost` on the `machines` table. All the data in the column will be lost.
  - You are about to drop the column `supportedColorModes` on the `machines` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `material_categories` table. All the data in the column will be lost.
  - You are about to drop the column `supportedColorModes` on the `materials` table. All the data in the column will be lost.
  - The `colorMode` column on the `print_methods` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `cart_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supplier_secrets_backup` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductionMode" AS ENUM ('IN_HOUSE', 'OUTSOURCE');

-- AlterEnum
BEGIN;
CREATE TYPE "EquipmentType_new" AS ENUM ('DIGITAL_COLOR', 'DIGITAL_MONO', 'UV', 'LARGE_FORMAT', 'DTF', 'SUBLIMATION', 'OFFSET', 'EMBROIDERY', 'PLOTTER_CUTTING');
ALTER TABLE "public"."machines" ALTER COLUMN "equipmentType" DROP DEFAULT;
ALTER TABLE "machines" ALTER COLUMN "equipmentType" TYPE "EquipmentType_new" USING ("equipmentType"::text::"EquipmentType_new");
ALTER TYPE "EquipmentType" RENAME TO "EquipmentType_old";
ALTER TYPE "EquipmentType_new" RENAME TO "EquipmentType";
DROP TYPE "public"."EquipmentType_old";
ALTER TABLE "machines" ALTER COLUMN "equipmentType" SET DEFAULT 'DIGITAL_COLOR';
COMMIT;

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_userId_fkey";

-- DropIndex
DROP INDEX "materials_name_key";

-- AlterTable
ALTER TABLE "machines" DROP COLUMN "inkChangeoverCost",
DROP COLUMN "supportedColorModes",
ADD COLUMN     "productionMode" "ProductionMode" NOT NULL DEFAULT 'IN_HOUSE',
ALTER COLUMN "equipmentType" SET DEFAULT 'DIGITAL_COLOR';

-- AlterTable
ALTER TABLE "material_categories" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "materials" DROP COLUMN "supportedColorModes",
ADD COLUMN     "colorCode" TEXT,
ADD COLUMN     "colorName" TEXT,
ADD COLUMN     "macroTextureUrl" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "print_methods" DROP COLUMN "colorMode",
ADD COLUMN     "colorMode" TEXT;

-- AlterTable
ALTER TABLE "product_attributes" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "cart_items";

-- DropTable
DROP TABLE "supplier_secrets_backup";

-- DropEnum
DROP TYPE "ColorMode";

-- DropEnum
DROP TYPE "MaterialCategory";

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "costPerUnit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_material_usages" (
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

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_materialId_key" ON "inventory_items"("materialId");

-- CreateIndex
CREATE INDEX "job_material_usages_jobId_idx" ON "job_material_usages"("jobId");

-- CreateIndex
CREATE INDEX "job_material_usages_materialId_idx" ON "job_material_usages"("materialId");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_material_usages" ADD CONSTRAINT "job_material_usages_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "production_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_material_usages" ADD CONSTRAINT "job_material_usages_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
