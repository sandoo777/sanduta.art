-- CreateTable
CREATE TABLE "equipment_consumables" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "consumptionPerSqm" DECIMAL(10,4),
    "consumptionPerUnit" DECIMAL(10,4),
    "consumptionPerJob" DECIMAL(10,4),
    "unit" "MaterialUnit" NOT NULL DEFAULT 'unit',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_consumables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "equipment_consumables_machineId_idx" ON "equipment_consumables"("machineId");

-- CreateIndex
CREATE INDEX "equipment_consumables_materialId_idx" ON "equipment_consumables"("materialId");

-- CreateIndex
CREATE INDEX "equipment_consumables_active_idx" ON "equipment_consumables"("active");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_consumables_machineId_materialId_key" ON "equipment_consumables"("machineId", "materialId");

-- AddForeignKey
ALTER TABLE "equipment_consumables" ADD CONSTRAINT "equipment_consumables_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_consumables" ADD CONSTRAINT "equipment_consumables_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
