/*
  Warnings:

  - You are about to drop the column `notes` on the `orders` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "categories_name_key";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "notes",
ADD COLUMN     "internalNotes" TEXT;

-- CreateTable
CREATE TABLE "order_timeline" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "description" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_notes" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_timeline_orderId_idx" ON "order_timeline"("orderId");

-- CreateIndex
CREATE INDEX "order_timeline_createdAt_idx" ON "order_timeline"("createdAt");

-- CreateIndex
CREATE INDEX "order_timeline_eventType_idx" ON "order_timeline"("eventType");

-- CreateIndex
CREATE INDEX "order_notes_orderId_idx" ON "order_notes"("orderId");

-- CreateIndex
CREATE INDEX "order_notes_createdAt_idx" ON "order_notes"("createdAt");

-- CreateIndex
CREATE INDEX "order_notes_isInternal_idx" ON "order_notes"("isInternal");

-- AddForeignKey
ALTER TABLE "order_timeline" ADD CONSTRAINT "order_timeline_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_timeline" ADD CONSTRAINT "order_timeline_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
