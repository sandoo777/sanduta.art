CREATE TABLE IF NOT EXISTS public."machine_maintenance_records" (
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
  CONSTRAINT "machine_maintenance_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "machine_maintenance_records_machineId_date_idx"
  ON public."machine_maintenance_records" ("machineId", "date");

ALTER TABLE public."machine_maintenance_records"
  ADD CONSTRAINT IF NOT EXISTS "machine_maintenance_records_machineId_fkey"
  FOREIGN KEY ("machineId") REFERENCES public."machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
