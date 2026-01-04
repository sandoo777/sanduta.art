// Re-export Prisma types that are commonly used
// This file provides a central location for type imports

import type { Role as PrismaRole } from '@prisma/client';

export { Role } from '@prisma/client';

// Type guard for Role
export function isRole(value: string): value is PrismaRole {
  return ['USER', 'MANAGER', 'ADMIN'].includes(value);
}
