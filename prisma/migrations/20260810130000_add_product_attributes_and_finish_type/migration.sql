-- Add finishType to materials
ALTER TABLE "materials"
  ADD COLUMN IF NOT EXISTS "finishType" TEXT;

-- Add AttributeType enum
DO $$ BEGIN
  CREATE TYPE "AttributeType" AS ENUM ('SELECT', 'MULTISELECT', 'NUMBER', 'TOGGLE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add PriceModifierType enum
DO $$ BEGIN
  CREATE TYPE "PriceModifierType" AS ENUM ('FIXED', 'PERCENT', 'PER_SQM', 'REPLACE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create product_attributes table
CREATE TABLE IF NOT EXISTS "product_attributes" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "label"     TEXT NOT NULL,
  "type"      "AttributeType" NOT NULL DEFAULT 'SELECT',
  "required"  BOOLEAN NOT NULL DEFAULT true,
  "helpText"  TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_attributes_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "product_attributes_productId_idx" ON "product_attributes"("productId");

-- Create product_attribute_options table
CREATE TABLE IF NOT EXISTS "product_attribute_options" (
  "id"                TEXT NOT NULL PRIMARY KEY,
  "attributeId"       TEXT NOT NULL,
  "label"             TEXT NOT NULL,
  "value"             TEXT NOT NULL,
  "description"       TEXT,
  "priceModifier"     DECIMAL(10,4) NOT NULL DEFAULT 0,
  "priceModifierType" "PriceModifierType" NOT NULL DEFAULT 'FIXED',
  "materialId"        TEXT,
  "sortOrder"         INTEGER NOT NULL DEFAULT 0,
  "isDefault"         BOOLEAN NOT NULL DEFAULT false,
  "active"            BOOLEAN NOT NULL DEFAULT true,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_attribute_options_attributeId_fkey"
    FOREIGN KEY ("attributeId") REFERENCES "product_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "product_attribute_options_materialId_fkey"
    FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "product_attribute_options_attributeId_idx" ON "product_attribute_options"("attributeId");
