'use client';

/**
 * Hook pentru gestionarea setup-ului inițial al aplicației
 * 
 * Acest hook gestionează procesul de setup pentru prima configurare
 * a aplicației, inclusiv crearea primului cont de administrator.
 * 
 * Features:
 * - Verificare dacă aplicația necesită setup
 * - Creare administrator inițial
 * - Validare date setup (email, parolă)
 * - Gestionare stări de loading/error/success
 * 
 * @module hooks/useSetup
 * @see src/app/api/setup/route.ts - API endpoint pentru setup
 */

import { useState, useEffect, useCallback } from 'react';

interface SetupStatus {
  /** Indică dacă aplicația necesită setup */
  needsSetup: boolean;
  /** Numărul de administratori existenți */
  adminCount: number;
}

interface SetupData {
  email: string;
  password: string;
  name?: string;
}

interface SetupResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface UseSetupReturn {
  /** Status curent al setup-ului */
  setupStatus: SetupStatus | null;
  /** Indicator de încărcare pentru verificare status */
  isCheckingStatus: boolean;
  /** Indicator de încărcare pentru procesare setup */
  isProcessing: boolean;
  /** Eroare întâlnită */
  error: string | null;
  /** Verifică dacă aplicația necesită setup */
  checkSetupStatus: () => Promise<void>;
  /** Procesează setup-ul cu datele furnizate */
  processSetup: (data: SetupData) => Promise<SetupResult>;
  /** Validează datele de setup */
  validateSetupData: (data: SetupData) => { valid: boolean; errors: Record<string, string> };
}

/**
 * Hook pentru gestionarea setup-ului aplicației
 * 
 * @example
 * ```tsx
 * function SetupPage() {
 *   const {
 *     setupStatus,
 *     isCheckingStatus,
 *     isProcessing,
 *     error,
 *     processSetup,
 *     validateSetupData,
 *   } = useSetup();
 * 
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     
 *     const data = { email, password, name };
 *     const validation = validateSetupData(data);
 *     
 *     if (!validation.valid) {
 *       setErrors(validation.errors);
 *       return;
 *     }
 * 
 *     const result = await processSetup(data);
 *     
 *     if (result.success) {
 *       router.push('/admin/login');
 *     }
 *   };
 * 
 *   if (isCheckingStatus) return <p>Checking...</p>;
 *   if (!setupStatus?.needsSetup) return <p>Setup already completed</p>;
 * 
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 * 
 * @returns {UseSetupReturn} Obiect cu status setup și metode de control
 */
export function useSetup(): UseSetupReturn {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Verifică dacă aplicația necesită setup
   */
  const checkSetupStatus = useCallback(async () => {
    try {
      setIsCheckingStatus(true);
      setError(null);

      const response = await fetch('/api/setup');
      
      if (!response.ok) {
        throw new Error('Failed to check setup status');
      }

      const data = await response.json();
      setSetupStatus(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check setup status';
      setError(message);
      console.error('useSetup: Failed to check status', err);
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  /**
   * Validează datele de setup
   */
  const validateSetupData = useCallback((data: SetupData): { 
    valid: boolean; 
    errors: Record<string, string> 
  } => {
    const errors: Record<string, string> = {};

    // Validare email
    if (!data.email?.trim()) {
      errors.email = 'Email-ul este obligatoriu';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Email-ul nu este valid';
      }
    }

    // Validare parolă
    if (!data.password) {
      errors.password = 'Parola este obligatorie';
    } else if (data.password.length < 6) {
      errors.password = 'Parola trebuie să conțină cel puțin 6 caractere';
    }

    // Validare nume (opțional dar dacă e furnizat, trebuie valid)
    if (data.name && data.name.trim().length < 2) {
      errors.name = 'Numele trebuie să conțină cel puțin 2 caractere';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }, []);

  /**
   * Procesează setup-ul cu datele furnizate
   */
  const processSetup = useCallback(async (data: SetupData): Promise<SetupResult> => {
    try {
      setIsProcessing(true);
      setError(null);

      // Validare date
      const validation = validateSetupData(data);
      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0];
        setError(firstError);
        return { success: false, error: firstError };
      }

      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete setup');
      }

      // Actualizează status
      await checkSetupStatus();

      return {
        success: true,
        user: result.user,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete setup';
      setError(message);
      console.error('useSetup: Failed to process setup', err);
      return { success: false, error: message };
    } finally {
      setIsProcessing(false);
    }
  }, [checkSetupStatus, validateSetupData]);

  // Verifică status la mount
  useEffect(() => {
    checkSetupStatus();
  }, [checkSetupStatus]);

  return {
    setupStatus,
    isCheckingStatus,
    isProcessing,
    error,
    checkSetupStatus,
    processSetup,
    validateSetupData,
  };
}
