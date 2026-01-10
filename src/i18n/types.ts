/**
 * I18n Types
 * Tipuri pentru sistemul multilingv
 */

import type { Locale } from './config';

/**
 * Traducere pentru un câmp
 */
export type Translation<T = string> = {
  [K in Locale]?: T;
};

/**
 * Dicționar de traduceri
 */
export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

/**
 * Funcție de traducere
 */
export type TranslateFunction = (
  key: string,
  params?: Record<string, string | number>,
  fallback?: string
) => string;

/**
 * Context de traducere
 */
export interface TranslationContext {
  locale: Locale;
  t: TranslateFunction;
  setLocale: (locale: Locale) => void;
  translations: TranslationDictionary;
}

/**
 * Traduceri pentru produse
 */
export interface ProductTranslations {
  name: Translation;
  shortDescription?: Translation;
  description?: Translation;
  features?: Translation<string[]>;
  specifications?: Translation<Record<string, string>>;
}

/**
 * Traduceri pentru opțiuni produs
 */
export interface ProductOptionTranslations {
  name: Translation;
  description?: Translation;
  values?: Translation<Record<string, string>>;
}

/**
 * Traduceri pentru materiale
 */
export interface MaterialTranslations {
  name: Translation;
  description?: Translation;
  properties?: Translation<Record<string, string>>;
}

/**
 * Traduceri pentru categorii
 */
export interface CategoryTranslations {
  name: Translation;
  description?: Translation;
  seo?: Translation<{
    title: string;
    description: string;
    keywords?: string;
  }>;
}

/**
 * Traduceri pentru pagini CMS
 */
export interface PageTranslations {
  title: Translation;
  slug: Translation;
  content: Translation;
  excerpt?: Translation;
  seo?: Translation<{
    metaTitle: string;
    metaDescription: string;
    keywords?: string;
  }>;
}

/**
 * Traduceri pentru articole blog
 */
export interface BlogPostTranslations {
  title: Translation;
  slug: Translation;
  content: Translation;
  excerpt?: Translation;
  seo?: Translation<{
    metaTitle: string;
    metaDescription: string;
    keywords?: string;
  }>;
}

/**
 * Traduceri pentru template-uri email
 */
export interface EmailTemplateTranslations {
  subject: Translation;
  body: Translation;
  preheader?: Translation;
}

/**
 * Traduceri pentru notificări
 */
export interface NotificationTranslations {
  title: Translation;
  message: Translation;
}

/**
 * Metadate SEO multilingve
 */
export interface MultilingualSeoMeta {
  title: Translation;
  description: Translation;
  keywords?: Translation;
  ogTitle?: Translation;
  ogDescription?: Translation;
  ogImage?: Translation;
  canonical?: Translation;
}

/**
 * Rezultat traducere cu fallback
 */
export interface TranslationResult {
  value: string;
  locale: Locale;
  isFallback: boolean;
}
