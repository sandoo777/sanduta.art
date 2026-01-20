import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { logger, logApiError, createErrorResponse } from "@/lib/logger";
import { UserRole } from "@prisma/client";
import {
  RolePermissions,
  Permission,
  PermissionGroups,
  PermissionDescriptions,
  getAllPermissions,
  getPermissionsForRole,
} from "@/lib/auth/permissions";

/**
 * GET /api/admin/settings/roles
 * Obține toate rolurile și permisiunile lor
 */
export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(["ADMIN", "MANAGER"]);
    if (error) return error;

    logger.info("API:Settings:Roles", "Fetching roles", { userId: user.id });

    // Construiește structura de răspuns
    const roles = Object.values(UserRole).map((role) => ({
      id: role,
      name: role,
      displayName: getRoleDisplayName(role),
      description: getRoleDescription(role),
      permissions: getPermissionsForRole(role),
      permissionCount: getPermissionsForRole(role).length,
      isSystem: true, // Toate rolurile sunt sistem (nu se pot șterge)
    }));

    return NextResponse.json({
      roles,
      allPermissions: getAllPermissions(),
      permissionGroups: PermissionGroups,
      permissionDescriptions: PermissionDescriptions,
    });
  } catch (err) {
    logApiError("API:Settings:Roles", err);
    return createErrorResponse("Failed to fetch roles", 500);
  }
}

/**
 * GET /api/admin/settings/roles/[roleId]
 * Obține detaliile unui rol specific
 */
export async function getRoleDetails(role: UserRole) {
  return {
    id: role,
    name: role,
    displayName: getRoleDisplayName(role),
    description: getRoleDescription(role),
    permissions: getPermissionsForRole(role),
    permissionGroups: getPermissionGroupsForRole(role),
  };
}

// Helper functions
function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    ADMIN: "Super Administrator",
    MANAGER: "Manager",
    OPERATOR: "Operator Producție",
    VIEWER: "Vizualizator",
  };
  return displayNames[role];
}

function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    ADMIN: "Acces complet la toate funcționalitățile platformei. Poate gestiona utilizatori, roluri, setări și are acces la toate operațiunile.",
    MANAGER: "Acces complet la producție, comenzi și rapoarte. Poate gestiona utilizatori și configura majoritatea setărilor platformei.",
    OPERATOR: "Acces la producție și comenzi. Poate actualiza statusuri, urca fișiere și gestiona operațiunile de producție.",
    VIEWER: "Acces doar pentru vizualizare. Poate vedea produse, comenzi, producție și rapoarte fără a putea modifica.",
  };
  return descriptions[role];
}

function getPermissionGroupsForRole(role: UserRole): any {
  const permissions = getPermissionsForRole(role);
  const permissionSet = new Set(permissions);

  const result: any = {};
  
  Object.entries(PermissionGroups).forEach(([key, group]) => {
    const groupPermissions = group.permissions.filter(p => permissionSet.has(p));
    if (groupPermissions.length > 0) {
      result[key] = {
        name: group.name,
        permissions: groupPermissions,
        total: group.permissions.length,
        granted: groupPermissions.length,
      };
    }
  });

  return result;
}
