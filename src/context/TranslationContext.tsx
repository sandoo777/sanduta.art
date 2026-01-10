'use client';

/**
 * Translation Context
 * Context pentru managementul traducerilor în client components
 */

import { createContext, useContext, ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import type { TranslationDictionary, TranslateFunction } from '@/i18n/types';
import { createTranslateFunction } from '@/lib/i18n/translations';

interface TranslationContextValue {
  locale: Locale;
  translations: TranslationDictionary;
  t: TranslateFunction;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

interface TranslationProviderProps {
  locale: Locale;
  translations: TranslationDictionary;
  children: ReactNode;
}

export function TranslationProvider({
  locale,
  translations,
  children,
}: TranslationProviderProps) {
  const t = createTranslateFunction(locale, translations);

  return (
    <TranslationContext.Provider value={{ locale, translations, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Hook pentru utilizarea traducerilor
 */
export function useTranslations() {
  const context = useContext(TranslationContext);
  
  if (!context) {
    throw new Error('useTranslations must be used within TranslationProvider');
  }
  
  return context;
}

/**
 * Hook pentru obținerea doar a funcției de traducere
 */
export function useT() {
  const { t } = useTranslations();
  return t;
}
