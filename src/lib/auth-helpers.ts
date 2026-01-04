import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
      user: null
    };
  }

  // Get full user from database with role
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
    }
  });

  if (!dbUser || !dbUser.active) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized: User not found or inactive" },
        { status: 401 }
      ),
      user: null
    };
  }

  return { user: dbUser, error: null };
}

export async function requireRole(allowedRoles: UserRole[]) {
  const { user, error } = await requireAuth();
  
  if (error) {
    return { user: null, error };
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      ),
      user: null
    };
  }

  return { user, error: null };
}

export function canManageUsers(role: UserRole): boolean {
  return role === "ADMIN" || role === "MANAGER";
}

export function canManageRoles(role: UserRole): boolean {
  return role === "ADMIN";
}

export function canManageSystemSettings(role: UserRole): boolean {
  return role === "ADMIN" || role === "MANAGER";
}

export function canViewUsers(role: UserRole): boolean {
  return role === "ADMIN" || role === "MANAGER" || role === "OPERATOR";
}
