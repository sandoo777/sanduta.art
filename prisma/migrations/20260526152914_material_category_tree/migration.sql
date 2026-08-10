/*
  Warnings:

  - You are about to drop the column `category` on the `materials` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `materials` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "materials_category_idx";

-- CreateTable
CREATE TABLE "material_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "requiresThickness" BOOLEAN NOT NULL DEFAULT false,
    "requiresDensity" BOOLEAN NOT NULL DEFAULT false,
    "requiresPricePerSqm" BOOLEAN NOT NULL DEFAULT false,
    "requiresPricePerMeter" BOOLEAN NOT NULL DEFAULT false,
    "requiresPricePerUnit" BOOLEAN NOT NULL DEFAULT false,
    "requiresWastePercent" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "material_categories_name_key" ON "material_categories"("name");

-- CreateIndex
CREATE INDEX "material_categories_parentId_idx" ON "material_categories"("parentId");

-- Insert default categories based on old enum values
INSERT INTO "material_categories" ("id", "name", "description", "requiresThickness", "requiresPricePerSqm", "requiresWastePercent", "active", "createdAt", "updatedAt")
VALUES 
  ('default_sheet', 'Sheet Materials', 'Flat sheet materials', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('default_roll', 'Roll Materials', 'Roll materials (vinyl, fabric)', false, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('default_rigid', 'Rigid Materials', 'Rigid board materials', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('default_paper', 'Paper', 'Paper materials', true, true, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('default_vinyl', 'Vinyl', 'Vinyl materials', false, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('default_textile', 'Textile', 'Textile materials', false, false, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('default_other', 'Other', 'Other materials', false, false, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable: Add categoryId column (nullable first)
ALTER TABLE "materials" ADD COLUMN "categoryId" TEXT;

-- Migrate existing data: map old enum values to new category IDs
UPDATE "materials" 
SET "categoryId" = CASE
  WHEN "category" = 'sheet' THEN 'default_sheet'
  WHEN "category" = 'roll' THEN 'default_roll'
  WHEN "category" = 'rigid' THEN 'default_rigid'
  WHEN "category" = 'paper' THEN 'default_paper'
  WHEN "category" = 'vinyl' THEN 'default_vinyl'
  WHEN "category" = 'textile' THEN 'default_textile'
  ELSE 'default_other'
END;

-- Now make categoryId NOT NULL and drop the old category column
ALTER TABLE "materials" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "materials" DROP COLUMN "category";

-- DropEnum
DROP TYPE "MaterialCategory";

-- CreateIndex
CREATE INDEX "materials_categoryId_idx" ON "materials"("categoryId");

-- AddForeignKey
ALTER TABLE "material_categories" ADD CONSTRAINT "material_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "material_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "material_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
