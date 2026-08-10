/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `print_methods` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "print_methods" ADD COLUMN     "baseCost" DECIMAL(10,2),
ADD COLUMN     "colorMode" TEXT;

-- CreateTable
CREATE TABLE "print_method_consumables" (
    "id" TEXT NOT NULL,
    "printMethodId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "costPerSqm" DECIMAL(10,4),
    "costPerJob" DECIMAL(10,4),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "print_method_consumables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MachinePrintMethodCompatibility" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MachinePrintMethodCompatibility_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "print_method_consumables_printMethodId_idx" ON "print_method_consumables"("printMethodId");

-- CreateIndex
CREATE INDEX "print_method_consumables_materialId_idx" ON "print_method_consumables"("materialId");

-- CreateIndex
CREATE INDEX "print_method_consumables_active_idx" ON "print_method_consumables"("active");

-- CreateIndex
CREATE UNIQUE INDEX "print_method_consumables_printMethodId_materialId_key" ON "print_method_consumables"("printMethodId", "materialId");

-- CreateIndex
CREATE INDEX "_MachinePrintMethodCompatibility_B_index" ON "_MachinePrintMethodCompatibility"("B");

-- CreateIndex
CREATE UNIQUE INDEX "print_methods_name_key" ON "print_methods"("name");

-- CreateIndex
CREATE INDEX "print_methods_active_idx" ON "print_methods"("active");

-- CreateIndex
CREATE INDEX "print_methods_name_idx" ON "print_methods"("name");

-- AddForeignKey
ALTER TABLE "print_method_consumables" ADD CONSTRAINT "print_method_consumables_printMethodId_fkey" FOREIGN KEY ("printMethodId") REFERENCES "print_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_method_consumables" ADD CONSTRAINT "print_method_consumables_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MachinePrintMethodCompatibility" ADD CONSTRAINT "_MachinePrintMethodCompatibility_A_fkey" FOREIGN KEY ("A") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MachinePrintMethodCompatibility" ADD CONSTRAINT "_MachinePrintMethodCompatibility_B_fkey" FOREIGN KEY ("B") REFERENCES "print_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
