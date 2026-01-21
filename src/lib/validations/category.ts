/**
 * Category Validation Schemas
 * Zod schemas for category-related data validation
 */

import { z } from 'zod';

/**
 * Category Tree Node Schema - Recursive validation
 * Ensures type-safe hierarchical category structure
 */
type CategoryTreeNodeType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  color: string | null;
  icon: string | null;
  order: number;
  active: boolean;
  featured: boolean;
  productCount: number;
  parentId?: string | null;
  children: CategoryTreeNodeType[];
};

export const categoryTreeNodeSchema: z.ZodType<CategoryTreeNodeType> = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().nullable(),
  image: z.string().url().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
  icon: z.string().nullable(),
  order: z.number().int().min(0),
  active: z.boolean(),
  featured: z.boolean(),
  productCount: z.number().int().min(0),
  parentId: z.string().cuid().nullable().optional(),
  children: z.lazy(() => categoryTreeNodeSchema.array()),
});

/**
 * Category Tree Response Schema
 */
export const categoryTreeResponseSchema = z.object({
  categories: z.array(categoryTreeNodeSchema),
  totalCount: z.number().int().min(0),
});

/**
 * Category List Response Schema
 */
export const categoryListResponseSchema = z.array(
  z.object({
    id: z.string().cuid(),
    name: z.string(),
    slug: z.string(),
    icon: z.string().nullable(),
    color: z.string().nullable(),
    parentId: z.string().cuid().nullable(),
    order: z.number().int(),
    description: z.string().nullable(),
    image: z.string().nullable(),
    _count: z.object({
      products: z.number().int().min(0),
    }),
  })
);

/**
 * Category Create Schema
 */
export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Numele este obligatoriu').max(100),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug invalid'),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  icon: z.string().optional().nullable(),
  order: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  parentId: z.string().cuid().optional().nullable(),
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
});

/**
 * Category Update Schema
 */
export const categoryUpdateSchema = categoryCreateSchema.partial();

/**
 * Type exports
 */
export type CategoryTreeNode = z.infer<typeof categoryTreeNodeSchema>;
export type CategoryTreeResponse = z.infer<typeof categoryTreeResponseSchema>;
export type CategoryListResponse = z.infer<typeof categoryListResponseSchema>;
export type CategoryCreate = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>;

/**
 * Validation helper functions
 */
export function validateCategoryTree(data: unknown): CategoryTreeResponse {
  return categoryTreeResponseSchema.parse(data);
}

export function validateCategoryList(data: unknown): CategoryListResponse {
  return categoryListResponseSchema.parse(data);
}

export function validateCategoryCreate(data: unknown): CategoryCreate {
  return categoryCreateSchema.parse(data);
}

export function validateCategoryUpdate(data: unknown): CategoryUpdate {
  return categoryUpdateSchema.parse(data);
}
