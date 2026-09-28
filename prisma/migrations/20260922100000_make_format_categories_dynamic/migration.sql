-- Convert enum-based format category to text so categories can be DB-driven.
ALTER TABLE "formats"
  ALTER COLUMN "category" TYPE TEXT USING "category"::TEXT;

-- The enum is no longer needed after column conversion.
DROP TYPE IF EXISTS "FormatCategory";
