-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "salePriceMode" TEXT NOT NULL DEFAULT 'amount',
ADD COLUMN     "salePricePercent" DOUBLE PRECISION;
