// Re-export Prisma types that are commonly used
// This file provides a central location for type imports

// Define Role type locally since it's not exported by Prisma
export type Role = 'USER' | 'MANAGER' | 'ADMIN';

// Type guard for Role
export function isRole(value: string): value is Role {
  return ['USER', 'MANAGER', 'ADMIN'].includes(value);
}
