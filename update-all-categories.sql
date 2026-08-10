-- Update ALL material_categories with correct types (no WHERE clause)
UPDATE "material_categories" 
SET "type" = CASE 
  -- Textile
  WHEN name LIKE '%extile%' THEN 'textile'::"MaterialCategory"
  
  -- Roll/Flexibile  
  WHEN name = 'large format – flexibile' THEN 'roll'::"MaterialCategory"
  
  -- Rigid
  WHEN name = 'large format – rigide' THEN 'rigid'::"MaterialCategory"
  
  -- Sheet (hartie pentru imprimare - sheets/coli)
  WHEN name = 'hartie imprimante laser' THEN 'sheet'::"MaterialCategory"
  WHEN name = 'hârtie & carton' THEN 'sheet'::"MaterialCategory"
  
  -- Paper (bucati - plicuri, etc.)
  WHEN name = 'plicuri' THEN 'paper'::"MaterialCategory"
  
  -- Other (default for all remaining)
  ELSE 'other'::"MaterialCategory"
END;
