-- CreateEnum
CREATE TYPE "SaleUnit" AS ENUM ('M2', 'UNIT');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "saleUnit" "SaleUnit" NOT NULL DEFAULT 'UNIT';
