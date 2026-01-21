'use client';

/**
 * Hook pentru gestionarea utilizatorilor (Admin)
 * 
 * Oferă interfață completă pentru operațiuni CRUD pe utilizatori,
 * inclusiv gestionare roluri și permisiuni.
 * 
 * Features:
 * - Listare utilizatori cu filtre
 * - Actualizare rol utilizator
 * - Ștergere utilizatori
 * - Gestionare stări loading/error
 * 
 * @module domains/admin/hooks/useUsers
 */

import { useState, useCallback } from 'react';
import type { User, UserRole } from '@prisma/client';

export interface UserWithCount extends User {
  _count?: {
    orders: number;
  };
}

export interface UsersFilters {
  role?: UserRole;
  search?: string;
}

interface UseUsersReturn {
  /** Lista utilizatorilor */
  users: UserWithCount[];
  /** Indicator de încărcare */
  isLoading: boolean;
  /** Eroare întâlnită */
  error: string | null;
  /** Încarcă lista de utilizatori */
  loadUsers: (filters?: UsersFilters) => Promise<void>;
  /** Actualizează rolul unui utilizator */
  updateUserRole: (userId: string, role: UserRole) => Promise<boolean>;
  /** Șterge un utilizator */
  deleteUser: (userId: string) => Promise<boolean>;
  /** Resetează starea */
  reset: () => void;
}

/**
 * Hook pentru gestionarea utilizatorilor (Admin)
 * 
 * @example
 * ```tsx
 * function UsersManager() {
 *   const { users, isLoading, loadUsers, updateUserRole } = useUsers();
 * 
 *   useEffect(() => {
 *     loadUsers();
 *   }, []);
 * 
 *   const handleRoleChange = async (userId: string, newRole: UserRole) => {
 *     const success = await updateUserRole(userId, newRole);
 *     if (success) {
 *       toast.success('Role updated');
 *     }
 *   };
 * 
 *   return <UsersList users={users} onRoleChange={handleRoleChange} />;
 * }
 * ```
 * 
 * @returns {UseUsersReturn} Obiect cu users, stare și metode de control
 */
export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<UserWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Încarcă lista de utilizatori cu filtre opționale
   */
  const loadUsers = useCallback(async (filters?: UsersFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      // Construiește query string din filtre
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `/api/admin/users${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to load users: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users';
      setError(message);
      console.error('useUsers: Failed to load users', err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualizează rolul unui utilizator
   */
  const updateUserRole = useCallback(async (userId: string, role: UserRole): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }

      // Reload users după update
      await loadUsers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user role';
      setError(message);
      console.error('useUsers: Failed to update role', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadUsers]);

  /**
   * Șterge un utilizator
   */
  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      // Reload users după ștergere
      await loadUsers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      setError(message);
      console.error('useUsers: Failed to delete user', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadUsers]);

  /**
   * Resetează starea la valorile inițiale
   */
  const reset = useCallback(() => {
    setUsers([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    users,
    isLoading,
    error,
    loadUsers,
    updateUserRole,
    deleteUser,
    reset,
  };
}
