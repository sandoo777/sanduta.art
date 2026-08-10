/**
 * Middleware pentru verificarea rolurilor și permisiunilor
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Verifică dacă utilizatorul este autentificat
 */
export async function requireAuth(
  _request: NextRequest
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  console.log('🔐 requireAuth: Getting session...');
  
  const session = await getServerSession(authOptions);

  console.log('🔐 requireAuth: Session result:', { 
    hasSession: !!session, 
    hasUser: !!session?.user,
    userId: session?.user?.id 
  });

  if (!session || !session.user) {
    console.log('❌ requireAuth: No session or user found');
    return NextResponse.json(
      { error: 'Neautorizat. Autentificare necesară.' },
      { status: 401 }
    );
  }

  console.log('✅ requireAuth: User authenticated successfully');

  return {
    user: {
      id: session.user.id!,
      email: session.user.email!,
      name: session.user.name!,
      role: session.user.role as UserRole,
    },
  };
}

/**
 * Verifică dacă utilizatorul are rolul specificat
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Interzis. Nu ai permisiunile necesare.' },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Verifică dacă utilizatorul este ADMIN
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  return requireRole(request, [UserRole.ADMIN]);
}

/**
 * Verifică dacă utilizatorul este ADMIN sau MANAGER
 */
export async function requireAdminOrManager(
  request: NextRequest
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  return requireRole(request, [UserRole.ADMIN, UserRole.MANAGER]);
}

/**
 * Verifică dacă utilizatorul poate accesa resursa specificată
 * (fie este proprietarul, fie are rol de ADMIN/MANAGER)
 */
export async function requireOwnershipOrAdmin(
  request: NextRequest,
  resourceUserId: string
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user: _user } = authResult;

  const isOwner = user.id === resourceUserId;
  const isAdminOrManager = [UserRole.ADMIN, UserRole.MANAGER].includes(user.role);

  if (!isOwner && !isAdminOrManager) {
    return NextResponse.json(
      { error: 'Interzis. Nu poți accesa această resursă.' },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Helper pentru a wrappa route handlers cu verificare de rol
 */
export function withRole(
  allowedRoles: UserRole[],
  handler: (
    request: NextRequest,
    context: { params: Record<string, string>; user: AuthenticatedUser }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: { params: Record<string, string> }) => {
    const authResult = await requireRole(request, allowedRoles);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    return handler(request, { ...context, user: authResult.user });
  };
}

/**
 * Helper pentru route handlers care necesită autentificare
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string>; user: AuthenticatedUser }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: { params: Record<string, string> }) => {
    console.log('🔐 withAuth: Starting authentication check...');
    
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      console.log('❌ withAuth: Authentication failed, returning error response');
      return authResult;
    }

    console.log('✅ withAuth: Authentication successful', { 
      userId: authResult.user.id, 
      role: authResult.user.role 
    });

    return handler(request, { ...context, user: authResult.user });
  };
}

/**
 * Permissions helpers
 */
export const canManageOrders = (role: UserRole) =>
  [UserRole.ADMIN, UserRole.MANAGER].includes(role);

export const canManageUsers = (role: UserRole) =>
  role === UserRole.ADMIN;

export const canManageProducts = (role: UserRole) =>
  [UserRole.ADMIN, UserRole.MANAGER].includes(role);

export const canManageMaterials = (role: UserRole) =>
  [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR].includes(role);

export const canViewReports = (role: UserRole) =>
  [UserRole.ADMIN, UserRole.MANAGER].includes(role);

export const canManageProduction = (role: UserRole) =>
  [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR].includes(role);
