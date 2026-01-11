/**
 * Permission Enforcement Module
 * Role-based access control (RBAC) for all protected routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { UserRole } from '@prisma/client';
import { logger } from '@/lib/logger';

/**
 * Permission definitions
 */
export const PERMISSIONS = {
  // Users
  'users.view': ['ADMIN'],
  'users.create': ['ADMIN'],
  'users.edit': ['ADMIN'],
  'users.delete': ['ADMIN'],

  // Orders
  'orders.view': ['ADMIN', 'MANAGER', 'OPERATOR'],
  'orders.create': ['ADMIN', 'MANAGER'],
  'orders.edit': ['ADMIN', 'MANAGER'],
  'orders.delete': ['ADMIN'],

  // Products
  'products.view': ['ADMIN', 'MANAGER'],
  'products.create': ['ADMIN', 'MANAGER'],
  'products.edit': ['ADMIN', 'MANAGER'],
  'products.delete': ['ADMIN'],

  // Categories
  'categories.view': ['ADMIN', 'MANAGER'],
  'categories.create': ['ADMIN', 'MANAGER'],
  'categories.edit': ['ADMIN', 'MANAGER'],
  'categories.delete': ['ADMIN'],

  // Materials
  'materials.view': ['ADMIN', 'MANAGER', 'OPERATOR'],
  'materials.create': ['ADMIN', 'MANAGER'],
  'materials.edit': ['ADMIN', 'MANAGER'],
  'materials.delete': ['ADMIN'],

  // Reports
  'reports.view': ['ADMIN', 'MANAGER'],
  'reports.create': ['ADMIN', 'MANAGER'],
  'reports.export': ['ADMIN', 'MANAGER'],

  // Settings
  'settings.view': ['ADMIN'],
  'settings.edit': ['ADMIN'],

  // Theme
  'theme.view': ['ADMIN'],
  'theme.edit': ['ADMIN'],

  // Customers
  'customers.view': ['ADMIN', 'MANAGER'],
  'customers.edit': ['ADMIN', 'MANAGER'],

  // Production
  'production.view': ['ADMIN', 'MANAGER', 'OPERATOR'],
  'production.edit': ['ADMIN', 'MANAGER', 'OPERATOR'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if user has permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(userRole);
}

/**
 * Check if user has any of the permissions
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Check if user has all permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Enforce permission in API route
 */
export async function enforcePermission(
  req: NextRequest,
  permission: Permission
): Promise<
  | { authorized: true; user: { id: string; email: string; role: UserRole } }
  | { authorized: false; response: NextResponse }
> {
  try {
    // Get session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      logger.warn('PermissionEnforcement', 'Unauthorized access attempt', {
        path: req.nextUrl.pathname,
        permission,
      });
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    const userRole = session.user.role as UserRole;

    // Check permission
    if (!hasPermission(userRole, permission)) {
      logger.warn('PermissionEnforcement', 'Forbidden access attempt', {
        path: req.nextUrl.pathname,
        permission,
        userRole,
        userId: session.user.id,
      });
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: 'Forbidden',
            message: 'You do not have permission to access this resource',
          },
          { status: 403 }
        ),
      };
    }

    // Log successful authorization
    logger.info('PermissionEnforcement', 'Access granted', {
      path: req.nextUrl.pathname,
      permission,
      userRole,
      userId: session.user.id,
    });

    return {
      authorized: true,
      user: {
        id: session.user.id,
        email: session.user.email || '',
        role: userRole,
      },
    };
  } catch (error) {
    logger.error('PermissionEnforcement', 'Permission check error', { error });
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    };
  }
}

/**
 * Enforce any of the permissions
 */
export async function enforceAnyPermission(
  req: NextRequest,
  permissions: Permission[]
): Promise<
  | { authorized: true; user: { id: string; email: string; role: UserRole } }
  | { authorized: false; response: NextResponse }
> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    const userRole = session.user.role as UserRole;

    if (!hasAnyPermission(userRole, permissions)) {
      logger.warn('PermissionEnforcement', 'Forbidden access attempt (any)', {
        path: req.nextUrl.pathname,
        permissions,
        userRole,
      });
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      };
    }

    return {
      authorized: true,
      user: {
        id: session.user.id,
        email: session.user.email || '',
        role: userRole,
      },
    };
  } catch (error) {
    logger.error('PermissionEnforcement', 'Permission check error', { error });
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    };
  }
}

/**
 * Higher-order function to wrap API handlers with permission check
 */
export function withPermission(
  permission: Permission,
  handler: (
    req: NextRequest,
    context: { user: { id: string; email: string; role: UserRole } }
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const result = await enforcePermission(req, permission);

    if (!result.authorized) {
      return result.response;
    }

    return handler(req, { user: result.user });
  };
}

/**
 * Check permission for resource ownership
 */
export async function enforceResourceOwnership(
  req: NextRequest,
  resourceUserId: string
): Promise<
  | { authorized: true; user: { id: string; email: string; role: UserRole } }
  | { authorized: false; response: NextResponse }
> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    const userRole = session.user.role as UserRole;
    const userId = session.user.id;

    // Admin can access everything
    if (userRole === 'ADMIN') {
      return {
        authorized: true,
        user: {
          id: userId,
          email: session.user.email || '',
          role: userRole,
        },
      };
    }

    // User can only access their own resources
    if (userId !== resourceUserId) {
      logger.warn('PermissionEnforcement', 'Resource ownership violation', {
        path: req.nextUrl.pathname,
        userId,
        resourceUserId,
      });
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden', message: 'You can only access your own resources' },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      user: {
        id: userId,
        email: session.user.email || '',
        role: userRole,
      },
    };
  } catch (error) {
    logger.error('PermissionEnforcement', 'Ownership check error', { error });
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    };
  }
}
