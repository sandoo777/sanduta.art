/*
  Warnings:

  - A unique constraint covering the columns `[orderNumber]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "editor_projects" ADD COLUMN     "finalFile" TEXT,
ADD COLUMN     "layers" JSONB,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "previewImage" TEXT,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "configuration" JSONB,
ADD COLUMN     "finalFileUrl" TEXT,
ADD COLUMN     "previewImage" TEXT,
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "specifications" JSONB;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "discount" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "orderNumber" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "shippingCost" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "subtotal" DECIMAL(10,2),
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "vat" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "editor_projects_productId_idx" ON "editor_projects"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");

-- AddForeignKey
ALTER TABLE "editor_projects" ADD CONSTRAINT "editor_projects_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
