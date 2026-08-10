-- Populate type field based on category name mappings
UPDATE "material_categories" 
SET "type" = CASE 
  WHEN LOWER(name) LIKE '%textile%' THEN 'textile'::"MaterialCategory"
  WHEN LOWER(name) LIKE '%flexibil%' OR LOWER(name) LIKE '%rola%' OR LOWER(name) LIKE '%roll%' THEN 'roll'::"MaterialCategory"
  WHEN LOWER(name) LIKE '%rigid%' OR LOWER(name) LIKE '%pvc%' OR LOWER(name) LIKE '%forex%' THEN 'rigid'::"MaterialCategory"
  WHEN LOWER(name) LIKE '%vinil%' OR LOWER(name) LIKE '%vinyl%' OR LOWER(name) LIKE '%autocolant%' THEN 'vinyl'::"MaterialCategory"
  WHEN LOWER(name) LIKE '%hartie imprimante%' OR LOWER(name) LIKE '%hârtie%carton%' THEN 'sheet'::"MaterialCategory"
  WHEN LOWER(name) LIKE '%plic%' THEN 'paper'::"MaterialCategory"
  ELSE 'other'::"MaterialCategory"
END
WHERE "type" IS NULL;
