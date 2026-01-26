/**
 * Utility functions for category tree operations
 */

import { CategoryWithRelations } from '@/types/models';

export interface CategoryTreeNode extends Omit<CategoryWithRelations, 'children'> {
  children: CategoryTreeNode[];
  level: number; // Depth level in tree (0 = root)
}

/**
 * Build a tree structure from flat category list
 */
export function buildCategoryTree(categories: CategoryWithRelations[]): CategoryTreeNode[] {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootCategories: CategoryTreeNode[] = [];

  // Create nodes with level 0 initially
  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
      level: 0,
    });
  });

  // Build tree structure and calculate levels
  categories.forEach(cat => {
    const node = categoryMap.get(cat.id)!;
    
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        node.level = parent.level + 1;
        parent.children.push(node);
        // Sort children by order, then by name
        parent.children.sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return a.name.localeCompare(b.name);
        });
      } else {
        // Parent not found, treat as root
        rootCategories.push(node);
      }
    } else {
      rootCategories.push(node);
    }
  });

  // Sort root categories
  rootCategories.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.name.localeCompare(b.name);
  });

  return rootCategories;
}

/**
 * Flatten tree structure into a list with level information
 */
export function flattenCategoryTree(tree: CategoryTreeNode[]): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = [];
  
  function traverse(nodes: CategoryTreeNode[]) {
    nodes.forEach(node => {
      result.push(node);
      if (node.children.length > 0) {
        traverse(node.children);
      }
    });
  }
  
  traverse(tree);
  return result;
}

/**
 * Get all descendant IDs of a category (for cycle prevention)
 */
export function getDescendantIds(categoryId: string, categories: CategoryWithRelations[]): string[] {
  const descendants: string[] = [];
  
  function traverse(parentId: string) {
    categories.forEach(cat => {
      if (cat.parentId === parentId) {
        descendants.push(cat.id);
        traverse(cat.id);
      }
    });
  }
  
  traverse(categoryId);
  return descendants;
}

/**
 * Check if moving a category would create a cycle
 */
export function wouldCreateCycle(
  categoryId: string,
  newParentId: string | null,
  categories: CategoryWithRelations[]
): boolean {
  if (!newParentId) return false; // Moving to root is always safe
  if (categoryId === newParentId) return true; // Can't be its own parent
  
  // Check if newParent is a descendant of category
  const descendants = getDescendantIds(categoryId, categories);
  return descendants.includes(newParentId);
}
