DROP INDEX IF EXISTS "formats_code_key";

ALTER TABLE "formats"
    DROP COLUMN IF EXISTS "code";

DROP INDEX IF EXISTS "materials_formatCode_idx";

ALTER TABLE "materials"
    DROP COLUMN IF EXISTS "formatCode";
