-- AlterTable: Drop constraint dacă există
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'categories_name_key'
  ) THEN
    ALTER TABLE "categories" DROP CONSTRAINT "categories_name_key";
  END IF;
END $$;

-- AlterTable: Adăugare coloane noi pentru ierarhie și metadata
ALTER TABLE "categories" 
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "image" TEXT,
  ADD COLUMN IF NOT EXISTS "parentId" TEXT,
  ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "metaTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;

-- CreateIndex: Index pentru căutări rapide (doar dacă nu există)
CREATE INDEX IF NOT EXISTS "categories_parentId_idx" ON "categories"("parentId");
CREATE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories"("slug");
CREATE INDEX IF NOT EXISTS "categories_active_idx" ON "categories"("active");
CREATE INDEX IF NOT EXISTS "categories_order_idx" ON "categories"("order");

-- AddForeignKey: Relație self-referential pentru ierarhie (doar dacă nu există)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'categories_parentId_fkey'
  ) THEN
    ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" 
      FOREIGN KEY ("parentId") REFERENCES "categories"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex: Unique constraint pentru nume în cadrul aceluiași părinte
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_parentId_key" ON "categories"("name", "parentId");
