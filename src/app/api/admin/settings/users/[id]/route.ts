import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { requireRole, canManageUsers, canManageRoles } from "@/lib/auth-helpers";
import { UserRole } from "@prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/admin/settings/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { user, error } = await requireRole(["ADMIN", "MANAGER", "OPERATOR"]);
  
  if (error) {
    return error;
  }

  try {
    const params = await context.params;
    const { id } = params;

    const foundUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!foundUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(foundUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const { user, error } = await requireRole(["ADMIN", "MANAGER"]);
  
  if (error) {
    return error;
  }

  if (!canManageUsers(user.role)) {
    return NextResponse.json(
      { error: "Forbidden: Insufficient permissions" },
      { status: 403 }
    );
  }

  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { name, email, password, role, active } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (email !== undefined) {
      if (!email.trim()) {
        return NextResponse.json(
          { error: "Email cannot be empty" },
          { status: 400 }
        );
      }

      // Check email uniqueness (if changed)
      if (email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        });

        if (emailExists) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 400 }
          );
        }

        updateData.email = email;
      }
    }

    if (password !== undefined && password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      updateData.password = await hash(password, 10);
    }

    if (role !== undefined) {
      // Only ADMIN can change roles
      if (!canManageRoles(user.role)) {
        return NextResponse.json(
          { error: "Forbidden: Only admins can change user roles" },
          { status: 403 }
        );
      }
      updateData.role = role;
    }

    if (active !== undefined) {
      updateData.active = active;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/settings/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { user, error } = await requireRole(["ADMIN"]);
  
  if (error) {
    return error;
  }

  try {
    const params = await context.params;
    const { id } = params;

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id }
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (userToDelete.email === user.email || userToDelete.id === user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if this is the last ADMIN
    if (userToDelete.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" }
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last admin user" },
          { status: 400 }
        );
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
