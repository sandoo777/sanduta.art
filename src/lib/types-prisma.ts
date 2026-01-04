// Re-export Prisma types that are commonly used
// This file provides a central location for type imports

// Export UserRole enum from Prisma
export { UserRole } from "@prisma/client";

// Define Role enum for backward compatibility
export const Role = {
  ADMIN: 'ADMIN' as const,
  MANAGER: 'MANAGER' as const,
  OPERATOR: 'OPERATOR' as const,
  VIEWER: 'VIEWER' as const,
};

// Define Role type for backward compatibility
export type Role = typeof Role[keyof typeof Role];

// Type guard for Role
export function isRole(value: string): value is Role {
  return ['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'].includes(value);
}
