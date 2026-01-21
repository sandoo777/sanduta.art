'use client';

/**
 * Hook pentru gestionarea autentificării utilizatorilor
 * 
 * Acest hook oferă interfață completă pentru lucrul cu autentificarea NextAuth,
 * incluzând login, logout, verificare sesiune și protecție bazată pe roluri.
 * 
 * Features:
 * - Login/logout utilizatori
 * - Verificare stare autentificare
 * - Acces la informații utilizator curent
 * - Verificare roluri (ADMIN, MANAGER, OPERATOR, VIEWER)
 * - Gestionare stări de loading/error
 * 
 * @module hooks/useAuth
 * @see src/modules/auth/nextauth.ts - Configurație NextAuth
 * @see src/lib/auth-helpers.ts - Helper funcții pentru autentificare
 */

import { useState, useEffect, useCallback } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import type { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

interface UseAuthReturn {
  /** Utilizatorul curent autentificat */
  user: AuthUser | null;
  /** Indicator dacă utilizatorul este autentificat */
  isAuthenticated: boolean;
  /** Indicator de încărcare sesiune */
  isLoading: boolean;
  /** Indicator de încărcare operațiune auth */
  isProcessing: boolean;
  /** Eroare întâlnită */
  error: string | null;
  /** Autentifică utilizatorul */
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  /** Deconectează utilizatorul */
  logout: () => Promise<void>;
  /** Verifică dacă utilizatorul are un anumit rol */
  hasRole: (role: UserRole | UserRole[]) => boolean;
  /** Verifică dacă utilizatorul este admin */
  isAdmin: boolean;
  /** Verifică dacă utilizatorul este manager */
  isManager: boolean;
  /** Verifică dacă utilizatorul este operator */
  isOperator: boolean;
}

/**
 * Hook pentru gestionarea autentificării
 * 
 * @example
 * ```tsx
 * // Login form
 * function LoginPage() {
 *   const { login, isProcessing, error } = useAuth();
 * 
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     const result = await login({ email, password });
 *     
 *     if (result.success) {
 *       router.push('/admin');
 *     }
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input type="email" value={email} onChange={...} />
 *       <input type="password" value={password} onChange={...} />
 *       <button disabled={isProcessing}>Login</button>
 *       {error && <p>{error}</p>}
 *     </form>
 *   );
 * }
 * 
 * // Protected component
 * function AdminPanel() {
 *   const { user, isAdmin, isLoading } = useAuth();
 * 
 *   if (isLoading) return <Spinner />;
 *   if (!isAdmin) return <AccessDenied />;
 * 
 *   return <AdminDashboard user={user} />;
 * }
 * 
 * // Role checking
 * function ManagerSection() {
 *   const { hasRole } = useAuth();
 * 
 *   if (!hasRole(['ADMIN', 'MANAGER'])) {
 *     return null;
 *   }
 * 
 *   return <ManagerControls />;
 * }
 * ```
 * 
 * @returns {UseAuthReturn} Obiect cu user, stare și metode de control
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  // Extrage utilizatorul din sesiune
  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? undefined,
        role: session.user.role,
      }
    : null;

  /**
   * Verifică dacă utilizatorul are un anumit rol
   */
  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!user) return false;

      if (Array.isArray(role)) {
        return role.includes(user.role);
      }

      return user.role === role;
    },
    [user]
  );

  // Roluri quick access
  const isAdmin = hasRole('ADMIN');
  const isManager = hasRole(['ADMIN', 'MANAGER']);
  const isOperator = hasRole(['ADMIN', 'OPERATOR']);

  /**
   * Autentifică utilizatorul cu credențiale
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      setIsProcessing(true);
      setError(null);

      // Validare credențiale
      if (!credentials.email || !credentials.password) {
        const errorMsg = 'Email și parola sunt obligatorii';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Validare format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        const errorMsg = 'Email-ul nu este valid';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Apelează NextAuth signIn
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        const errorMsg = result.error === 'CredentialsSignin'
          ? 'Email sau parolă incorectă'
          : 'Autentificare eșuată';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!result?.ok) {
        const errorMsg = 'Autentificare eșuată';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Success
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Autentificare eșuată';
      setError(message);
      console.error('useAuth: Login failed', err);
      return { success: false, error: message };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Deconectează utilizatorul
   */
  const logout = useCallback(async () => {
    try {
      setIsProcessing(true);
      setError(null);

      await signOut({ redirect: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      console.error('useAuth: Logout failed', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Clear error când sesiunea se schimbă
  useEffect(() => {
    if (status !== 'loading') {
      setError(null);
    }
  }, [status]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isProcessing,
    error,
    login,
    logout,
    hasRole,
    isAdmin,
    isManager,
    isOperator,
  };
}

/**
 * Helper pentru protecție componente bazată pe rol
 * 
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   useRequireAuth(['ADMIN', 'MANAGER']);
 * 
 *   return <AdminContent />;
 * }
 * ```
 */
export function useRequireAuth(allowedRoles?: UserRole | UserRole[]) {
  const { user, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      window.location.href = '/admin/login';
      return;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
      window.location.href = '/403'; // Forbidden
    }
  }, [user, isLoading, hasRole, allowedRoles]);

  return { user, isLoading };
}
