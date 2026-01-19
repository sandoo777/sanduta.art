-- Seed pentru categorii de test - Header Demo
-- Categorii principale cu subcategorii

-- 1. Îmbrăcăminte
INSERT INTO categories (id, name, slug, icon, color, "order", active, featured, "createdAt", "updatedAt")
VALUES 
  ('cat-1', 'Îmbrăcăminte', 'imbracaminte', '👕', '#3B82F6', 1, true, true, NOW(), NOW());

-- Subcategorii Îmbrăcăminte
INSERT INTO categories (id, name, slug, icon, color, "parentId", "order", active, "createdAt", "updatedAt")
VALUES 
  ('cat-1-1', 'Tricouri', 'tricouri', '👕', '#3B82F6', 'cat-1', 1, true, NOW(), NOW()),
  ('cat-1-2', 'Hanorace', 'hanorace', '🧥', '#3B82F6', 'cat-1', 2, true, NOW(), NOW()),
  ('cat-1-3', 'Șepci', 'sepci', '🧢', '#3B82F6', 'cat-1', 3, true, NOW(), NOW()),
  ('cat-1-4', 'Sacose', 'sacose', '🎒', '#3B82F6', 'cat-1', 4, true, NOW(), NOW());

-- 2. Accesorii
INSERT INTO categories (id, name, slug, icon, color, "order", active, featured, "createdAt", "updatedAt")
VALUES 
  ('cat-2', 'Accesorii', 'accesorii', '🎁', '#8B5CF6', 2, true, true, NOW(), NOW());

-- Subcategorii Accesorii
INSERT INTO categories (id, name, slug, icon, color, "parentId", "order", active, "createdAt", "updatedAt")
VALUES 
  ('cat-2-1', 'Căni', 'cani', '☕', '#8B5CF6', 'cat-2', 1, true, NOW(), NOW()),
  ('cat-2-2', 'Brelocuri', 'brelocuri', '🔑', '#8B5CF6', 'cat-2', 2, true, NOW(), NOW()),
  ('cat-2-3', 'Mouse Pad-uri', 'mouse-pad', '🖱️', '#8B5CF6', 'cat-2', 3, true, NOW(), NOW()),
  ('cat-2-4', 'Stickere', 'stickere', '🏷️', '#8B5CF6', 'cat-2', 4, true, NOW(), NOW());

-- 3. Birou & Școală
INSERT INTO categories (id, name, slug, icon, color, "order", active, featured, "createdAt", "updatedAt")
VALUES 
  ('cat-3', 'Birou & Școală', 'birou-scoala', '📚', '#F59E0B', 3, true, false, NOW(), NOW());

-- Subcategorii Birou & Școală
INSERT INTO categories (id, name, slug, icon, color, "parentId", "order", active, "createdAt", "updatedAt")
VALUES 
  ('cat-3-1', 'Agende', 'agende', '📔', '#F59E0B', 'cat-3', 1, true, NOW(), NOW()),
  ('cat-3-2', 'Pixuri', 'pixuri', '🖊️', '#F59E0B', 'cat-3', 2, true, NOW(), NOW()),
  ('cat-3-3', 'Caiete', 'caiete', '📓', '#F59E0B', 'cat-3', 3, true, NOW(), NOW());

-- 4. Cadouri
INSERT INTO categories (id, name, slug, icon, color, "order", active, featured, "createdAt", "updatedAt")
VALUES 
  ('cat-4', 'Cadouri', 'cadouri', '🎁', '#EF4444', 4, true, true, NOW(), NOW());

-- Subcategorii Cadouri
INSERT INTO categories (id, name, slug, icon, color, "parentId", "order", active, "createdAt", "updatedAt")
VALUES 
  ('cat-4-1', 'Cutii Cadou', 'cutii-cadou', '📦', '#EF4444', 'cat-4', 1, true, NOW(), NOW()),
  ('cat-4-2', 'Plicuri', 'plicuri', '✉️', '#EF4444', 'cat-4', 2, true, NOW(), NOW()),
  ('cat-4-3', 'Ambalaje', 'ambalaje', '🎀', '#EF4444', 'cat-4', 3, true, NOW(), NOW());

-- 5. Postere & Print-uri
INSERT INTO categories (id, name, slug, icon, color, "order", active, featured, "createdAt", "updatedAt")
VALUES 
  ('cat-5', 'Postere & Print-uri', 'postere-printuri', '🖼️', '#10B981', 5, true, false, NOW(), NOW());

-- Subcategorii Postere
INSERT INTO categories (id, name, slug, icon, color, "parentId", "order", active, "createdAt", "updatedAt")
VALUES 
  ('cat-5-1', 'Postere A4', 'postere-a4', '📄', '#10B981', 'cat-5', 1, true, NOW(), NOW()),
  ('cat-5-2', 'Postere A3', 'postere-a3', '📃', '#10B981', 'cat-5', 2, true, NOW(), NOW()),
  ('cat-5-3', 'Canvas', 'canvas', '🎨', '#10B981', 'cat-5', 3, true, NOW(), NOW());
