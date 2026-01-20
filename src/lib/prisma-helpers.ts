/**
 * Utilitare pentru optimizare Prisma queries
 */

/**
 * Parametri standard pentru paginare
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Rezultat paginat standard
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Generează parametri Prisma pentru paginare optimizată
 */
export function getPaginationParams(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  return {
    skip,
    take: limit,
  };
}

/**
 * Construiește răspuns paginat standard
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 20
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Select fields optimizat pentru User (evită date sensibile)
 */
export const userSelectSafe = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  createdAt: true,
} as const;

/**
 * Select fields optimizat pentru Product în liste
 */
export const productSelectList = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  categoryId: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      color: true,
    },
  },
  images: {
    select: {
      id: true,
      url: true,
      alt: true,
      order: true,
    },
    orderBy: {
      order: 'asc' as const,
    },
    take: 1, // Doar prima imagine pentru listă
  },
  _count: {
    select: {
      variants: true,
    },
  },
} as const;

/**
 * Select fields optimizat pentru Order în liste
 */
export const orderSelectList = {
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  total: true,
  createdAt: true,
  customer: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
  _count: {
    select: {
      items: true,
    },
  },
} as const;

/**
 * Select fields optimizat pentru Project în liste
 */
export const projectSelectList = {
  id: true,
  name: true,
  thumbnail: true,
  width: true,
  height: true,
  updatedAt: true,
  folderId: true,
  _count: {
    select: {
      versions: true,
    },
  },
} as const;

/**
 * Where clause pentru search text în multiple câmpuri
 */
export function buildSearchWhere(
  search: string | undefined,
  fields: string[]
): { OR?: Array<Record<string, { contains: string; mode: 'insensitive' }>> } {
  if (!search || !fields.length) return {};

  const searchTerm = search.trim();
  if (!searchTerm) return {};

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    })),
  };
}

/**
 * OrderBy pentru sortare dinamică
 */
export function buildOrderBy(
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): Record<string, 'asc' | 'desc'> {
  if (!sortBy) {
    return { createdAt: sortOrder };
  }

  return { [sortBy]: sortOrder };
}

/**
 * Optimizare pentru count queries - folosește cursor pagination pentru liste mari
 */
export async function getCursorPaginatedData<T>(
  prismaModel: any,
  params: {
    where?: any;
    cursor?: any;
    take?: number;
    orderBy?: any;
    select?: any;
    include?: any;
  }
) {
  const { where, cursor, take = 20, orderBy, select, include } = params;

  const items = await prismaModel.findMany({
    where,
    cursor: cursor ? { id: cursor } : undefined,
    take: take + 1, // +1 pentru a verifica dacă sunt mai multe
    orderBy,
    select,
    include,
  });

  const hasMore = items.length > take;
  const data = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? data[data.length - 1]?.id : null;

  return {
    data,
    nextCursor,
    hasMore,
  };
}
