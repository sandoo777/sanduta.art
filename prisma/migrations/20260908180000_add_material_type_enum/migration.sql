CREATE TYPE "MaterialType" AS ENUM (
  'SUPORT_FOI',
  'SUPORT_ROLA',
  'SUPORT_M2',
  'CERNEALA',
  'CONSUMABIL'
);

ALTER TABLE "materials"
  ADD COLUMN "materialType" "MaterialType",
  ADD COLUMN "consumptionRate" DOUBLE PRECISION,
  ADD COLUMN "isTemplate" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "materials_materialType_idx"
  ON "materials"("materialType");
