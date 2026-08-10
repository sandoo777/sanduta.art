ALTER TABLE "production_jobs"
ADD COLUMN "printMethodId" TEXT,
ADD COLUMN "materialId" TEXT;

CREATE INDEX "production_jobs_printMethodId_idx" ON "production_jobs"("printMethodId");
CREATE INDEX "production_jobs_materialId_idx" ON "production_jobs"("materialId");

ALTER TABLE "production_jobs"
ADD CONSTRAINT "production_jobs_printMethodId_fkey"
FOREIGN KEY ("printMethodId") REFERENCES "print_methods"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "production_jobs"
ADD CONSTRAINT "production_jobs_materialId_fkey"
FOREIGN KEY ("materialId") REFERENCES "materials"("id")
ON DELETE SET NULL ON UPDATE CASCADE;