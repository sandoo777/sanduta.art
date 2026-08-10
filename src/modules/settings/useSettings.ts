import { useState, useCallback } from "react";
import { User, UserRole } from '@/types/models';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  active?: boolean;
}

export interface SystemSettings {
  [key: string]: string;
}

export function useSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUsers = useCallback(async (): Promise<User[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/settings/users");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch users");
      }
      return await response.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUser = useCallback(async (id: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/settings/users/${id}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch user");
      }
      return await response.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: CreateUserData): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }
      return await response.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: UpdateUserData): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/settings/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }
      return await response.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/settings/users/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSystemSettings = useCallback(async (): Promise<SystemSettings> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/settings/system");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch system settings");
      }
      const data = await response.json();
      return data.settings || {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSystemSettings = useCallback(async (settings: SystemSettings): Promise<SystemSettings> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/settings/system", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update system settings");
      }
      const data = await response.json();
      return data.settings || {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getSystemSettings,
    updateSystemSettings,
  };
}


export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  active?: boolean;
}

export interface SystemSettings {
  [key: string]: string;
}

export function useSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Users Management
  const getUsers = async (): Promise<User[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/settings/users");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch users");
      }
      const users = await response.json();
      return users;
    } catch (err: unknown) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUser = async (id: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/settings/users/${id}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch user");
      }
      const user = await response.json();
      return user;
    } catch (err: unknown) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserData): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/settings/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }
      
      const user = await response.json();
      return user;
    } catch (err: unknown) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, data: UpdateUserData): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/settings/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }
      
      const user = await response.json();
      return user;
    } catch (err: unknown) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/settings/users/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }
    } catch (err: unknown) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // System Settings Management
  const getSystemSettings = async (): Promise<SystemSettings> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/settings/system");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch system settings");
      }
      const data = await response.json();
      return data.settings || {};
    } catch (err: unknown) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSystemSettings = async (settings: SystemSettings): Promise<SystemSettings> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/settings/system", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update system settings");
      }
      
      const data = await response.json();
      return data.settings || {};
    } catch (err: unknown) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getSystemSettings,
    updateSystemSettings,
  };
}
