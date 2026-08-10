-- Add missing array columns to machines table
-- These were added to schema.prisma without a corresponding migration

ALTER TABLE "machines" 
  ADD COLUMN IF NOT EXISTS "compatibleMaterialIds" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "compatiblePrintMethodIds" TEXT[] NOT NULL DEFAULT '{}';
