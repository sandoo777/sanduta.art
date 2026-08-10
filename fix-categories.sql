-- Update material_categories with better mapping logic
UPDATE "material_categories" 
SET "type" = CASE 
  -- Textile
  WHEN LOWER(name) LIKE '%textile%' THEN 'textile'::"MaterialCategory"
  
  -- Roll/Flexibile
  WHEN LOWER(name) LIKE '%flexibil%' THEN 'roll'::"MaterialCategory"
  WHEN LOWER(name) LIKE '%rola%' OR LOWER(name) LIKE '%roll%' THEN 'roll'::"MaterialCategory"
  WHEN name = 'large format – flexibile' THEN 'roll'::"MaterialCategory"
  
  -- Rigid
  WHEN LOWER(name) LIKE '%rigid%' THEN 'rigid'::"MaterialCategory"
  WHEN LOWER(name) LIKE '%pvc%' OR LOWER(name) LIKE '%forex%' THEN 'rigid'::"MaterialCategory"
  WHEN name = 'large format – rigide' THEN 'rigid'::"MaterialCategory"
  
  -- Vinyl
  WHEN LOWER(name) LIKE '%vinil%' OR LOWER(name) LIKE '%vinyl%' THEN 'vinyl'::"MaterialCategory"
  WHEN LOWER(name) LIKE '%autocolant%' THEN 'vinyl'::"MaterialCategory"
  
  -- Sheet (hartie pentru imprimare - sheets/coli)
  WHEN name = 'hartie imprimante laser' THEN 'sheet'::"MaterialCategory"
  WHEN name = 'hârtie & carton' THEN 'sheet'::"MaterialCategory"
  
  -- Paper (bucati - plicuri, etc.)
  WHEN LOWER(name) LIKE '%plic%' THEN 'paper'::"MaterialCategory"
  
  -- Other (default)
  ELSE 'other'::"MaterialCategory"
END;

-- Verify the changes
SELECT name, type FROM "material_categories" ORDER BY name;
