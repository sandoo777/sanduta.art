-- Add missing materialIds column to print_methods table
-- This column was dropped in migration 20260601104429 but remains in the Prisma schema
-- as a deprecated backward-compat field used by some API routes and UI components

ALTER TABLE "print_methods"
  ADD COLUMN IF NOT EXISTS "materialIds" TEXT[] NOT NULL DEFAULT '{}';
