-- Add packaging fields to materials table
ALTER TABLE "materials"
  ADD COLUMN IF NOT EXISTS "packagingLabel"  TEXT,
  ADD COLUMN IF NOT EXISTS "packagingQty"    DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "packagingPrice"  DECIMAL(10,2);

-- Add 'sheet' value to MaterialUnit enum (safe — IF NOT EXISTS workaround via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'sheet'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'MaterialUnit')
  ) THEN
    ALTER TYPE "MaterialUnit" ADD VALUE 'sheet';
  END IF;
END$$;
