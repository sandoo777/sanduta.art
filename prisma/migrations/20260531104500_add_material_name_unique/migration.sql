-- Enforce strict idempotency by material name for upsert-by-name imports.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "materials"
    GROUP BY "name"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add unique constraint on materials.name: duplicate names exist.';
  END IF;
END $$;

ALTER TABLE "materials"
ADD CONSTRAINT "materials_name_key" UNIQUE ("name");
