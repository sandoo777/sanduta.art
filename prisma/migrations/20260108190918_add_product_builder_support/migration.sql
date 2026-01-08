-- AlterTable
ALTER TABLE "products" ADD COLUMN     "descriptionShort" TEXT,
ADD COLUMN     "dimensions" JSONB,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "ogImage" TEXT,
ADD COLUMN     "options" JSONB,
ADD COLUMN     "pricing" JSONB,
ADD COLUMN     "production" JSONB;

-- CreateTable
CREATE TABLE "product_materials" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "priceModifier" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_print_methods" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "printMethodId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_print_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_finishing" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "finishingId" TEXT NOT NULL,
    "priceModifier" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_finishing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_materials_productId_materialId_key" ON "product_materials"("productId", "materialId");

-- CreateIndex
CREATE UNIQUE INDEX "product_print_methods_productId_printMethodId_key" ON "product_print_methods"("productId", "printMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "product_finishing_productId_finishingId_key" ON "product_finishing"("productId", "finishingId");

-- AddForeignKey
ALTER TABLE "product_materials" ADD CONSTRAINT "product_materials_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_materials" ADD CONSTRAINT "product_materials_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_print_methods" ADD CONSTRAINT "product_print_methods_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_print_methods" ADD CONSTRAINT "product_print_methods_printMethodId_fkey" FOREIGN KEY ("printMethodId") REFERENCES "print_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_finishing" ADD CONSTRAINT "product_finishing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_finishing" ADD CONSTRAINT "product_finishing_finishingId_fkey" FOREIGN KEY ("finishingId") REFERENCES "finishing_operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
