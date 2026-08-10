/*
  Warnings:

  - Added the required column `category` to the `materials` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MaterialCategory" AS ENUM ('sheet', 'roll', 'rigid', 'paper', 'vinyl', 'textile', 'other');

-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "category" "MaterialCategory",
ADD COLUMN     "density" DOUBLE PRECISION,
ADD COLUMN     "pricePerMeter" DOUBLE PRECISION,
ADD COLUMN     "pricePerSqm" DOUBLE PRECISION,
ADD COLUMN     "pricePerUnit" DOUBLE PRECISION,
ADD COLUMN     "thickness" DOUBLE PRECISION,
ADD COLUMN     "wastePercent" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "materials"
SET
  "category" = 'other',
  "pricePerUnit" = COALESCE("pricePerUnit", "costPerUnit"::double precision)
WHERE "category" IS NULL OR "pricePerUnit" IS NULL;

ALTER TABLE "materials"
ALTER COLUMN "category" SET NOT NULL;

ALTER TABLE "materials"
ADD CONSTRAINT "materials_price_required_chk"
CHECK (
  "pricePerSqm" IS NOT NULL
  OR "pricePerMeter" IS NOT NULL
  OR "pricePerUnit" IS NOT NULL
),
ADD CONSTRAINT "materials_waste_percent_chk"
CHECK ("wastePercent" >= 0 AND "wastePercent" <= 100);

-- CreateTable
CREATE TABLE "_MaterialPrintMethodCompatibility" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MaterialPrintMethodCompatibility_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MaterialMachineCompatibility" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MaterialMachineCompatibility_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MaterialPrintMethodCompatibility_B_index" ON "_MaterialPrintMethodCompatibility"("B");

-- CreateIndex
CREATE INDEX "_MaterialMachineCompatibility_B_index" ON "_MaterialMachineCompatibility"("B");

-- CreateIndex
CREATE INDEX "materials_category_idx" ON "materials"("category");

-- CreateIndex
CREATE INDEX "materials_active_idx" ON "materials"("active");

-- AddForeignKey
ALTER TABLE "_MaterialPrintMethodCompatibility" ADD CONSTRAINT "_MaterialPrintMethodCompatibility_A_fkey" FOREIGN KEY ("A") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MaterialPrintMethodCompatibility" ADD CONSTRAINT "_MaterialPrintMethodCompatibility_B_fkey" FOREIGN KEY ("B") REFERENCES "print_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MaterialMachineCompatibility" ADD CONSTRAINT "_MaterialMachineCompatibility_A_fkey" FOREIGN KEY ("A") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MaterialMachineCompatibility" ADD CONSTRAINT "_MaterialMachineCompatibility_B_fkey" FOREIGN KEY ("B") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
