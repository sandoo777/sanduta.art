ALTER TABLE "materials"
  ADD COLUMN IF NOT EXISTS "properties" JSONB;
