CREATE TABLE "formats" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width_mm" INTEGER NOT NULL,
    "height_mm" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'mm',
    "waste_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "formats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "formats_code_key"
    ON "formats"("code");

ALTER TABLE "materials"
    ADD COLUMN "formatCode" TEXT;

CREATE INDEX "materials_formatCode_idx"
    ON "materials"("formatCode");
