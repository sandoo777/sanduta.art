import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { logger, logApiError, createErrorResponse } from "@/lib/logger";
import {
  Permission,
  PermissionGroups,
  PermissionDescriptions,
  RolePermissions,
  getAllPermissions,
} from "@/lib/auth/permissions";

/**
 * GET /api/admin/settings/permissions
 * Obține toate permisiunile disponibile în sistem
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRole(["ADMIN", "MANAGER"]);
    if (error) return error;

    logger.info("API:Settings:Permissions", "Fetching permissions", { userId: user.id });

    const allPermissions = getAllPermissions();

    // Construiește structura detaliată pentru UI
    const permissionDetails = allPermissions.map((permission) => ({
      id: permission,
      name: permission,
      description: PermissionDescriptions[permission],
      group: findPermissionGroup(permission),
    }));

    // Construiește matrix-ul rol-permisiuni pentru UI
    const rolePermissionMatrix = Object.entries(RolePermissions).map(([role, permissions]) => ({
      role,
      permissions: permissions,
      permissionCount: permissions.length,
    }));

    return NextResponse.json({
      permissions: permissionDetails,
      groups: PermissionGroups,
      rolePermissionMatrix,
      total: allPermissions.length,
    });
  } catch (err) {
    logApiError("API:Settings:Permissions", err);
    return createErrorResponse("Failed to fetch permissions", 500);
  }
}

// Helper function
function findPermissionGroup(permission: Permission): string {
  for (const [key, group] of Object.entries(PermissionGroups)) {
    if (group.permissions.includes(permission)) {
      return key;
    }
  }
  return "other";
}
