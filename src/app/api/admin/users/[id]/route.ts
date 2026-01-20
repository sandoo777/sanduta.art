import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth-middleware";
import { UserRole } from "@prisma/client";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { validateInput } from "@/lib/validation";
import { logAuditAction, AUDIT_ACTIONS } from "@/lib/audit-log";
import { z } from "zod";

const updateUserRoleSchema = z.object({
  role: z.enum([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER]),
});

export const PATCH = withRole(
  [UserRole.ADMIN],
  async (request: NextRequest, { params, user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_STRICT);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const { id } = await params;
      const body = await request.json();

      // Validate input
      const validation = await validateInput(updateUserRoleSchema, body);
      if (!validation.success) {
        return NextResponse.json({ errors: validation.errors }, { status: 400 });
      }

      const { role } = validation.data;

      // Get old user data for audit
      const oldUser = await prisma.user.findUnique({
        where: { id },
        select: { role: true, email: true },
      });

      if (!oldUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      // Audit log
      await logAuditAction({
        userId: user.id,
        action: AUDIT_ACTIONS.USER_ROLE_CHANGE,
        resourceType: 'user',
        resourceId: id,
        details: {
          oldRole: oldUser.role,
          newRole: role,
          targetEmail: oldUser.email,
        },
      });

      return NextResponse.json(updatedUser);
    } catch (_error) {
      console.error('Failed to update user:', error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
  }
);

export const DELETE = withRole(
  [UserRole.ADMIN],
  async (request: NextRequest, { params, user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_STRICT);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const { id } = await params;
      
      // Prevent admin from deleting themselves
      if (user.id === id) {
        return NextResponse.json(
          { error: "Cannot delete your own account" },
          { status: 400 }
        );
      }

      // Get user data for audit
      const userToDelete = await prisma.user.findUnique({
        where: { id },
        select: { email: true, role: true },
      });

      if (!userToDelete) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await prisma.user.delete({
        where: { id },
      });

      // Audit log
      await logAuditAction({
        userId: user.id,
        action: AUDIT_ACTIONS.USER_DELETE,
        resourceType: 'user',
        resourceId: id,
        details: {
          deletedEmail: userToDelete.email,
          deletedRole: userToDelete.role,
        },
      });

      return NextResponse.json({ success: true });
    } catch (_error) {
      console.error('Failed to delete user:', error);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
  }
);