-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('AVAILABLE', 'BUSY', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "machines" ADD COLUMN     "lastMaintenance" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" "MachineStatus" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "production_jobs" ADD COLUMN     "machineId" TEXT;

-- CreateIndex
CREATE INDEX "machines_status_idx" ON "machines"("status");

-- CreateIndex
CREATE INDEX "machines_active_idx" ON "machines"("active");

-- CreateIndex
CREATE INDEX "production_jobs_machineId_idx" ON "production_jobs"("machineId");

-- AddForeignKey
ALTER TABLE "production_jobs" ADD CONSTRAINT "production_jobs_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
