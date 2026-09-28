DO $$
BEGIN
  CREATE TYPE "SupplierPreferredChannel" AS ENUM ('email', 'phone', 'chat', 'web');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "suppliers"
  ADD COLUMN IF NOT EXISTS "phones" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "address" TEXT,
  ADD COLUMN IF NOT EXISTS "website" TEXT,
  ADD COLUMN IF NOT EXISTS "codFiscal" TEXT,
  ADD COLUMN IF NOT EXISTS "preferredChannel" "SupplierPreferredChannel",
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "defaultLeadTimeDays" INTEGER DEFAULT 7,
  ADD COLUMN IF NOT EXISTS "defaultCurrency" TEXT DEFAULT 'MDL';

UPDATE "suppliers" SET "phones" = ARRAY[]::TEXT[] WHERE "phones" IS NULL;
ALTER TABLE "suppliers" ALTER COLUMN "phones" SET NOT NULL;
