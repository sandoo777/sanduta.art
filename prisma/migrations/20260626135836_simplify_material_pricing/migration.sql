/*
  Warnings:

  - You are about to drop the column `costPerUnit` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerMeter` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerSqm` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerUnit` on the `materials` table. All the data in the column will be lost.
  - You are about to alter the column `purchasePrice` on the `materials` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `salePrice` on the `materials` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "materials" DROP COLUMN "costPerUnit",
DROP COLUMN "pricePerMeter",
DROP COLUMN "pricePerSqm",
DROP COLUMN "pricePerUnit",
ALTER COLUMN "purchasePrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "salePrice" SET DATA TYPE DECIMAL(10,2);
