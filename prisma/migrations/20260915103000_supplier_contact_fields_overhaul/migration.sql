-- Supplier contact fields overhaul
-- Adds multi-channel contact fields and removes legacy API credential fields.

DO $$
BEGIN
  CREATE TYPE "SupplierPreferredChannel" AS ENUM ('email', 'phone', 'chat', 'web');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "suppliers"
  ADD COLUMN IF NOT EXISTS "phones" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "address" TEXT,
  ADD COLUMN IF NOT EXISTS "website" TEXT,
  ADD COLUMN IF NOT EXISTS "codFiscal" TEXT,
  ADD COLUMN IF NOT EXISTS "preferredChannel" "SupplierPreferredChannel",
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

UPDATE "suppliers"
SET "phones" = ARRAY[]::TEXT[]
WHERE "phones" IS NULL;

ALTER TABLE "suppliers"
  ALTER COLUMN "phones" SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'apiEndpoint'
  ) OR EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'apiKey'
  ) THEN
    CREATE TABLE IF NOT EXISTS supplier_secrets_backup (
      id TEXT PRIMARY KEY,
      "apiEndpoint" TEXT,
      "apiKey" TEXT,
      backed_up_at TIMESTAMPTZ DEFAULT now()
    );

    INSERT INTO supplier_secrets_backup (id, "apiEndpoint", "apiKey")
    SELECT id, "apiEndpoint", "apiKey"
    FROM "suppliers"
    ON CONFLICT (id) DO UPDATE
    SET "apiEndpoint" = EXCLUDED."apiEndpoint",
        "apiKey" = EXCLUDED."apiKey",
        backed_up_at = now();
  END IF;
END $$;

ALTER TABLE "suppliers"
  DROP COLUMN IF EXISTS "apiEndpoint",
  DROP COLUMN IF EXISTS "apiKey";
