import { useState, useCallback } from "react";
import { UserRole } from "@prisma/client";

/**
 * Hook pentru gestionarea Admin Settings & Permissions
 * Oferă funcții pentru interacțiunea cu API-urile de setări
 */

export function useAdminSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Users Management
  const fetchUsers = useCallback(async (params?: {
    search?: string;
    role?: UserRole;
    active?: boolean;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append("search", params.search);
      if (params?.role) searchParams.append("role", params.role);
      if (params?.active !== undefined) searchParams.append("active", String(params.active));
      if (params?.page) searchParams.append("page", String(params.page));
      if (params?.limit) searchParams.append("limit", String(params.limit));

      const response = await fetch(`/api/admin/settings/users?${searchParams}`);
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    company?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: string, userData: Partial<{
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    company?: string;
    active: boolean;
  }>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/settings/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Failed to update user");

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const disableUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/settings/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false }),
      });

      if (!response.ok) throw new Error("Failed to disable user");

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Roles Management
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/settings/roles");
      if (!response.ok) throw new Error("Failed to fetch roles");

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (role: UserRole, permissions: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/settings/roles/${role}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Permissions Management
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/settings/permissions");
      if (!response.ok) throw new Error("Failed to fetch permissions");

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePermissions = useCallback(async (role: UserRole, permissions: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/settings/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, permissions }),
      });

      if (!response.ok) throw new Error("Failed to update permissions");

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Audit Logs
  const fetchAuditLogs = useCallback(async (params?: {
    userId?: string;
    type?: string;
    success?: boolean;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params?.userId) searchParams.append("userId", params.userId);
      if (params?.type) searchParams.append("type", params.type);
      if (params?.success !== undefined) searchParams.append("success", String(params.success));
      if (params?.startDate) searchParams.append("startDate", params.startDate);
      if (params?.endDate) searchParams.append("endDate", params.endDate);
      if (params?.page) searchParams.append("page", String(params.page));
      if (params?.limit) searchParams.append("limit", String(params.limit));

      const response = await fetch(`/api/admin/settings/audit-logs?${searchParams}`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Platform Settings
  const fetchPlatformSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/settings/platform");
      if (!response.ok) throw new Error("Failed to fetch platform settings");

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlatformSettings = useCallback(async (section: string, settings: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/settings/platform", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data: settings }),
      });

      if (!response.ok) throw new Error("Failed to update platform settings");

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    // Users
    fetchUsers,
    createUser,
    updateUser,
    disableUser,
    // Roles
    fetchRoles,
    updateRole,
    // Permissions
    fetchPermissions,
    updatePermissions,
    // Audit Logs
    fetchAuditLogs,
    // Platform Settings
    fetchPlatformSettings,
    updatePlatformSettings,
  };
}

export default useAdminSettings;
