-- AlterTable
ALTER TABLE "production_jobs" ADD COLUMN     "productId" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isOutsourced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "materialId" TEXT,
ADD COLUMN     "minOrderQty" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "pricePerM2" DECIMAL(10,4),
ADD COLUMN     "pricePerUnit" DECIMAL(10,4),
ADD COLUMN     "printMethodId" TEXT;

-- CreateIndex
CREATE INDEX "production_jobs_productId_idx" ON "production_jobs"("productId");

-- CreateIndex
CREATE INDEX "products_printMethodId_idx" ON "products"("printMethodId");

-- CreateIndex
CREATE INDEX "products_materialId_idx" ON "products"("materialId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_printMethodId_fkey" FOREIGN KEY ("printMethodId") REFERENCES "print_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_jobs" ADD CONSTRAINT "production_jobs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
