-- AlterTable
ALTER TABLE "print_methods" ADD COLUMN     "costFurnizorPerM2" DECIMAL(10,2),
ADD COLUMN     "costFurnizorPerUnit" DECIMAL(10,2),
ADD COLUMN     "isOutsourced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "markup" DECIMAL(5,2),
ADD COLUMN     "termenFurnizor" TEXT;

-- AlterTable
ALTER TABLE "production_jobs" ADD COLUMN     "outsourcedCost" DECIMAL(10,2),
ADD COLUMN     "outsourcedProfit" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "print_methods_isOutsourced_idx" ON "print_methods"("isOutsourced");
