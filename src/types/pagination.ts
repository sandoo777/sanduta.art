/**
 * Pagination Types
 * Tipuri pentru paginare și liste paginate
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE PAGINATION
// ═══════════════════════════════════════════════════════════════════════════

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTENDED PAGINATION
// ═══════════════════════════════════════════════════════════════════════════

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
  direction?: 'forward' | 'backward';
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  previousCursor?: string;
  hasMore: boolean;
  totalCount?: number;
}

export interface OffsetPaginationParams {
  offset: number;
  limit: number;
}

export interface OffsetPaginatedResponse<T> {
  items: T[];
  offset: number;
  limit: number;
  totalCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION WITH FILTERS
// ═══════════════════════════════════════════════════════════════════════════

export interface PaginatedRequest<F = Record<string, unknown>> {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: F;
  search?: string;
}

export interface PaginatedResult<T, F = Record<string, unknown>> {
  items: T[];
  pagination: PaginationMeta;
  filters?: F;
  appliedFilters?: Partial<F>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SORT OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: string;
  order: SortOrder;
  label?: string;
}

export interface SortConfig {
  defaultSortBy: string;
  defaultSortOrder: SortOrder;
  allowedSortFields: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE INFO
// ═══════════════════════════════════════════════════════════════════════════

export interface PageInfo {
  startCursor?: string;
  endCursor?: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export interface PaginationLimits {
  minLimit: number;
  maxLimit: number;
  defaultLimit: number;
}

export interface PaginationConfig {
  limits: PaginationLimits;
  defaultSortBy?: string;
  defaultSortOrder?: SortOrder;
  maxPages?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculează offset din pagină și limit
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calculează numărul total de pagini
 */
export function calculateTotalPages(totalItems: number, itemsPerPage: number): number {
  return Math.ceil(totalItems / itemsPerPage);
}

/**
 * Creează metadata de paginare
 */
export function createPaginationMeta(
  currentPage: number,
  totalItems: number,
  itemsPerPage: number
): PaginationMeta {
  const totalPages = calculateTotalPages(totalItems, itemsPerPage);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Validează parametrii de paginare
 */
export function validatePaginationParams(
  params: Partial<PaginationParams>,
  config: PaginationConfig
): PaginationParams {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(
    config.limits.maxLimit,
    Math.max(config.limits.minLimit, params.limit || config.limits.defaultLimit)
  );

  return {
    page,
    limit,
    sortBy: params.sortBy || config.defaultSortBy,
    sortOrder: params.sortOrder || config.defaultSortOrder,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGS
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_PAGINATION_LIMITS: PaginationLimits = {
  minLimit: 1,
  maxLimit: 100,
  defaultLimit: 10,
};

export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  limits: DEFAULT_PAGINATION_LIMITS,
  defaultSortBy: 'createdAt',
  defaultSortOrder: 'desc',
  maxPages: 1000,
};

// ═══════════════════════════════════════════════════════════════════════════
// QUERY BUILDERS
// ═══════════════════════════════════════════════════════════════════════════

export interface PrismaSkipTake {
  skip: number;
  take: number;
}

/**
 * Convertește pagination params în Prisma skip/take
 */
export function toPrismaSkipTake(params: PaginationParams): PrismaSkipTake {
  return {
    skip: calculateOffset(params.page, params.limit),
    take: params.limit,
  };
}

export interface PrismaOrderBy {
  [key: string]: 'asc' | 'desc';
}

/**
 * Convertește sort params în Prisma orderBy
 */
export function toPrismaOrderBy(sortBy?: string, sortOrder?: SortOrder): PrismaOrderBy | undefined {
  if (!sortBy) return undefined;
  return { [sortBy]: sortOrder || 'desc' };
}
