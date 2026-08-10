-- Allow materials without a defined price during ERP imports.
-- Business rule: if source Excel has no price, persist NULL.
ALTER TABLE "materials"
DROP CONSTRAINT IF EXISTS "materials_price_required_chk";
