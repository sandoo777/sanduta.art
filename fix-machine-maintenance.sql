CREATE TABLE IF NOT EXISTS "machine_maintenance_records" (
  "id" TEXT NOT NULL,
  "machineId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "type" "MaintenanceType" NOT NULL DEFAULT 'PREVENTIVE',
  "description" TEXT NOT NULL,
  "cost" DECIMAL(10,2),
  "technician" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "machine_maintenance_records_machineId_date_idx"
  ON "machine_maintenance_records" ("machineId", "date");

ALTER TABLE "machine_maintenance_records"
  ADD CONSTRAINT IF NOT EXISTS "machine_maintenance_records_machineId_fkey"
  FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
