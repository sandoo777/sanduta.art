'use client';

/**
 * Hook unificat pentru gestionarea temei aplicației
 * 
 * Acest hook combină funcționalitatea de aplicare și publishing a temei,
 * oferind o interfață unificată pentru lucru cu teme în aplicație.
 * 
 * Features:
 * - Încărcare automată a temei publicate
 * - Aplicare în timp real a temei
 * - Publishing/unpublishing teme
 * - Gestionare stări de loading/error
 * 
 * @module hooks/useTheme
 * @see src/lib/theme/applyTheme.ts - Pentru logica de aplicare a temei
 * @see src/modules/theme/useThemePublishing.ts - Pentru logica de publishing
 */

import { useState, useEffect, useCallback } from 'react';
import type { ThemeConfig } from '@/types/theme';

interface UseThemeReturn {
  /** Tema curentă aplicată */
  theme: ThemeConfig | null;
  /** Indicator de încărcare */
  isLoading: boolean;
  /** Eroare întâlnită în timpul operațiunilor */
  error: string | null;
  /** Reîncarcă tema din server */
  reload: () => Promise<void>;
  /** Verifică dacă există o temă publicată */
  hasPublishedTheme: boolean;
}

/**
 * Hook pentru gestionarea temei aplicației
 * 
 * @example
 * ```tsx
 * function ThemeDisplay() {
 *   const { theme, isLoading, error, reload } = useTheme();
 * 
 *   if (isLoading) return <p>Loading theme...</p>;
 *   if (error) return <p>Error: {error}</p>;
 *   if (!theme) return <p>No theme applied</p>;
 * 
 *   return (
 *     <div>
 *       <h1>Current Theme: {theme.name}</h1>
 *       <button onClick={reload}>Reload Theme</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @returns {UseThemeReturn} Obiect cu tema curentă și metode de control
 */
export function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Încarcă tema publicată de pe server
   */
  const loadTheme = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/theme');
      
      if (!response.ok) {
        if (response.status === 404) {
          // Nu există temă publicată - nu e eroare
          setTheme(null);
          return;
        }
        throw new Error(`Failed to load theme: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.theme) {
        setTheme(data.theme);
        applyThemeToDOM(data.theme);
      } else {
        setTheme(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load theme';
      setError(message);
      console.error('useTheme: Failed to load theme', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Aplică tema în DOM prin CSS Variables
   */
  const applyThemeToDOM = useCallback((themeConfig: ThemeConfig) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    
    // Aplică culorile
    if (themeConfig.colors) {
      Object.entries(themeConfig.colors).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--color-${key}`, value);
        }
      });
    }

    // Aplică tipografia
    if (themeConfig.typography) {
      const { fontFamily, fontSize, fontWeight } = themeConfig.typography;
      
      if (fontFamily && typeof fontFamily === 'string') {
        root.style.setProperty('--font-family', fontFamily);
      }
      if (fontSize) {
        Object.entries(fontSize).forEach(([key, value]) => {
          if (typeof value === 'string') {
            root.style.setProperty(`--font-size-${key}`, value);
          }
        });
      }
      if (fontWeight) {
        Object.entries(fontWeight).forEach(([key, value]) => {
          root.style.setProperty(`--font-weight-${key}`, String(value));
        });
      }
    }

    // Layout spacing (fallback pentru backward compatibility)
    if (themeConfig.layout?.spacing) {
      Object.entries(themeConfig.layout.spacing).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--spacing-${key}`, value);
        }
      });
    }

    // Components border radius (fallback pentru backward compatibility)
    if (themeConfig.components?.button?.borderRadius) {
      root.style.setProperty('--radius-button', themeConfig.components.button.borderRadius);
    }

    console.log('Theme applied to DOM:', themeConfig.id);
  }, []);

  /**
   * Reîncarcă tema de pe server
   */
  const reload = useCallback(async () => {
    await loadTheme();
  }, [loadTheme]);

  // Încarcă tema la mount
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  return {
    theme,
    isLoading,
    error,
    reload,
    hasPublishedTheme: theme !== null,
  };
}

/**
 * Hook pentru gestionarea publishing-ului de teme (Admin)
 * Pentru funcționalitate avansată de publishing, vezi useThemePublishing
 */
export { useThemePublishing } from '@/modules/theme/useThemePublishing';
