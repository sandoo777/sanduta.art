/**
 * Material Categories Server Functions
 * CRUD operations with tree structure support
 */

import { prisma } from '@/lib/prisma';
import type {
  CreateMaterialCategoryInput,
  UpdateMaterialCategoryInput,
  MaterialCategory,
  MaterialCategoryTree,
} from './types';
import { MaterialCategoryValidationError } from './types';

type DbMaterialCategory = Awaited<ReturnType<typeof prisma.materialCategory.findFirst>>;

function slugifyCategoryId(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || `material-category-${Date.now()}`;
}

function mapDbCategoryToMaterialCategory(
  category: NonNullable<DbMaterialCategory> & {
    _count?: {
      other_material_categories?: number;
      materials?: number;
    };
  }
): MaterialCategory {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    parentId: category.parentId,
    requiresThickness: category.requiresThickness,
    requiresDensity: category.requiresDensity,
    requiresPricePerSqm: category.requiresPricePerSqm,
    requiresPricePerMeter: category.requiresPricePerMeter,
    requiresPricePerUnit: category.requiresPricePerUnit,
    requiresWastePercent: category.requiresWastePercent,
    active: category.active,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    _count: {
      children: category._count?.other_material_categories ?? 0,
      materials: category._count?.materials ?? 0,
    },
  };
}

/**
 * Get all material categories as a flat list
 */
export async function listMaterialCategories(): Promise<MaterialCategory[]> {
  const categories = await prisma.materialCategory.findMany({
    include: {
      _count: {
        select: {
          children: true,
          materials: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return categories.map(mapDbCategoryToMaterialCategory);
}

/**
 * Get material categories as a tree structure
 */
export async function getMaterialCategoriesTree(): Promise<MaterialCategoryTree[]> {
  const categories = await listMaterialCategories();
  
  // Build tree: find root categories (no parent) and recursively build children
  const categoryMap = new Map<string, MaterialCategoryTree>(
    categories.map(cat => [cat.id, { ...cat, children: [] }])
  );
  
  const roots: MaterialCategoryTree[] = [];
  
  categories.forEach(category => {
    const node = categoryMap.get(category.id)!;
    
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Parent not found, treat as root
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });
  
  return roots;
}

/**
 * Get a single material category by ID
 */
export async function getMaterialCategoryById(id: string): Promise<MaterialCategory | null> {
  const category = await prisma.materialCategory.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      _count: {
        select: {
          children: true,
          materials: true,
        },
      },
    },
  });

  return category ? mapDbCategoryToMaterialCategory(category) : null;
}

/**
 * Get full breadcrumb path for a category
 */
export async function getCategoryBreadcrumb(categoryId: string): Promise<string[]> {
  const path: string[] = [];
  let currentId: string | null = categoryId;
  
  while (currentId) {
    const category = await prisma.materialCategory.findUnique({
      where: { id: currentId },
      select: { id: true, name: true, parentId: true },
    });
    
    if (!category) break;
    
    path.unshift(category.name);
    currentId = category.parentId;
  }
  
  return path;
}

/**
 * Create a new material category
 */
export async function createMaterialCategory(
  data: CreateMaterialCategoryInput
): Promise<MaterialCategory> {
  const trimmedName = data.name?.trim();
  if (!trimmedName) {
    throw new MaterialCategoryValidationError('Numele categoriei este obligatoriu', 400);
  }

  // Validate name uniqueness
  const existing = await prisma.materialCategory.findUnique({
    where: { name: trimmedName },
  });
  
  if (existing) {
    throw new MaterialCategoryValidationError('O categorie cu acest nume există deja', 409);
  }
  
  // Validate parent exists
  if (data.parentId) {
    const parent = await prisma.materialCategory.findUnique({
      where: { id: data.parentId },
    });
    
    if (!parent) {
      throw new MaterialCategoryValidationError('Categoria părinte nu există', 404);
    }
  }
  
  let generatedId = slugifyCategoryId(trimmedName);
  const idExists = await prisma.materialCategory.findUnique({ where: { id: generatedId }, select: { id: true } });
  if (idExists) {
    generatedId = `${generatedId}-${Date.now()}`;
  }

  const category = await prisma.materialCategory.create({
    data: {
      id: generatedId,
      name: trimmedName,
      description: data.description,
      parentId: data.parentId,
      requiresThickness: data.requiresThickness ?? false,
      requiresDensity: data.requiresDensity ?? false,
      requiresPricePerSqm: data.requiresPricePerSqm ?? false,
      requiresPricePerMeter: data.requiresPricePerMeter ?? false,
      requiresPricePerUnit: data.requiresPricePerUnit ?? false,
      requiresWastePercent: data.requiresWastePercent ?? false,
      active: data.active ?? true,
    },
    include: {
      _count: {
        select: {
          children: true,
          materials: true,
        },
      },
    },
  });

  return mapDbCategoryToMaterialCategory(category);
}

/**
 * Update a material category
 */
export async function updateMaterialCategory(
  id: string,
  data: UpdateMaterialCategoryInput
): Promise<MaterialCategory> {
  // Check if category exists
  const existing = await prisma.materialCategory.findUnique({
    where: { id },
  });
  
  if (!existing) {
    throw new MaterialCategoryValidationError('Categoria nu a fost găsită', 404);
  }
  
  // Validate name uniqueness if name is being changed
  if (data.name && data.name.trim() !== existing.name) {
    const duplicate = await prisma.materialCategory.findUnique({
      where: { name: data.name.trim() },
    });
    
    if (duplicate) {
      throw new MaterialCategoryValidationError('O categorie cu acest nume există deja', 409);
    }
  }
  
  // Validate parent exists and prevent circular references
  if (data.parentId !== undefined) {
    if (data.parentId === id) {
      throw new MaterialCategoryValidationError('O categorie nu poate fi propriul părinte', 400);
    }
    
    if (data.parentId) {
      const parent = await prisma.materialCategory.findUnique({
        where: { id: data.parentId },
      });
      
      if (!parent) {
        throw new MaterialCategoryValidationError('Categoria părinte nu există', 404);
      }
      
      // Check for circular reference (parent is a descendant)
      const isDescendant = await checkIsDescendant(id, data.parentId);
      if (isDescendant) {
        throw new MaterialCategoryValidationError(
          'Nu se poate crea o referință circulară în ierarhie',
          400
        );
      }
    }
  }
  
  const category = await prisma.materialCategory.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.requiresThickness !== undefined && { requiresThickness: data.requiresThickness }),
      ...(data.requiresDensity !== undefined && { requiresDensity: data.requiresDensity }),
      ...(data.requiresPricePerSqm !== undefined && { requiresPricePerSqm: data.requiresPricePerSqm }),
      ...(data.requiresPricePerMeter !== undefined && { requiresPricePerMeter: data.requiresPricePerMeter }),
      ...(data.requiresPricePerUnit !== undefined && { requiresPricePerUnit: data.requiresPricePerUnit }),
      ...(data.requiresWastePercent !== undefined && { requiresWastePercent: data.requiresWastePercent }),
      ...(data.active !== undefined && { active: data.active }),
    },
    include: {
      _count: {
        select: {
          children: true,
          materials: true,
        },
      },
    },
  });

  return mapDbCategoryToMaterialCategory(category);
}

/**
 * Delete a material category
 */
export async function deleteMaterialCategory(id: string): Promise<void> {
  // Check if category exists
  const category = await prisma.materialCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          children: true,
          materials: true,
        },
      },
    },
  });
  
  if (!category) {
    throw new MaterialCategoryValidationError('Categoria nu a fost găsită', 404);
  }
  
  // Prevent deletion if has children
  if (category._count.children > 0) {
    throw new MaterialCategoryValidationError(
      `Nu se poate șterge categoria. Aceasta conține ${category._count.children} subcategorii`,
      409
    );
  }
  
  // Prevent deletion if has materials
  if (category._count.materials > 0) {
    throw new MaterialCategoryValidationError(
      `Nu se poate șterge categoria. Aceasta conține ${category._count.materials} materiale`,
      409
    );
  }
  
  await prisma.materialCategory.delete({
    where: { id },
  });
}

/**
 * Check if potentialDescendantId is a descendant of categoryId
 * Used to prevent circular references
 */
async function checkIsDescendant(categoryId: string, potentialDescendantId: string): Promise<boolean> {
  const descendants = await getDescendants(categoryId);
  return descendants.includes(potentialDescendantId);
}

/**
 * Get all descendant category IDs
 */
async function getDescendants(categoryId: string): Promise<string[]> {
  const descendants: string[] = [];
  const queue: string[] = [categoryId];
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    
    const children = await prisma.materialCategory.findMany({
      where: { parentId: currentId },
      select: { id: true },
    });
    
    children.forEach(child => {
      descendants.push(child.id);
      queue.push(child.id);
    });
  }
  
  return descendants;
}
