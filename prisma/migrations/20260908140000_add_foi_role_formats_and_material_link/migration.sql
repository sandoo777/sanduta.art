ALTER TABLE "formats"
    DROP CONSTRAINT IF EXISTS "formats_categoryCode_fkey";

DROP TABLE IF EXISTS "formats_categories" CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FormatCategory') THEN
    CREATE TYPE "FormatCategory" AS ENUM ('FOI', 'ROLE');
  END IF;
END $$;

ALTER TABLE "formats"
    ADD COLUMN IF NOT EXISTS "category" "FormatCategory";

UPDATE "formats"
SET "category" = 'FOI'
WHERE "category" IS NULL;

ALTER TABLE "formats"
    ALTER COLUMN "category" SET NOT NULL;

ALTER TABLE "formats"
    ALTER COLUMN "height_mm" DROP NOT NULL;

ALTER TABLE "formats"
    ADD COLUMN IF NOT EXISTS "name" TEXT;

UPDATE "formats"
SET "name" = CASE
    WHEN "height_mm" IS NULL THEN CAST("width_mm" AS TEXT) || ' mm'
    ELSE CAST("width_mm" AS TEXT) || 'x' || CAST("height_mm" AS TEXT) || ' mm'
END
WHERE "name" IS NULL;

ALTER TABLE "formats"
    ALTER COLUMN "name" SET NOT NULL;

ALTER TABLE "formats"
    DROP COLUMN IF EXISTS "categoryCode";

ALTER TABLE "formats"
    DROP COLUMN IF EXISTS "unit";

ALTER TABLE "formats"
    DROP COLUMN IF EXISTS "waste_percent";

ALTER TABLE "formats"
    DROP COLUMN IF EXISTS "notes";

ALTER TABLE "materials"
    ADD COLUMN IF NOT EXISTS "formatId" TEXT;

ALTER TABLE "materials"
    ADD COLUMN IF NOT EXISTS "formatName" TEXT;

ALTER TABLE "materials"
    ADD COLUMN IF NOT EXISTS "width_mm" INTEGER;

ALTER TABLE "materials"
    ADD COLUMN IF NOT EXISTS "height_mm" INTEGER;

ALTER TABLE "materials"
    ADD CONSTRAINT "materials_formatId_fkey"
    FOREIGN KEY ("formatId") REFERENCES "formats"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "materials_formatId_idx"
    ON "materials"("formatId");
