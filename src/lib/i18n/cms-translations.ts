/**
 * CMS Translations Helpers
 * Funcții pentru lucrul cu traduceri de pagini și blog
 */

import type { Locale } from '@/i18n/config';
import { getLocalizedField, generateLocalizedSlug } from '@/lib/i18n/translations';

export interface PageTranslation {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

export interface PageWithTranslations {
  id: string;
  title?: string;
  slug?: string;
  content?: string;
  translations?: Record<string, PageTranslation>;
  [key: string]: any;
}

/**
 * Obține titlul paginii în limba specificată
 */
export function getPageTitle(
  page: PageWithTranslations,
  locale: Locale
): string {
  if (!page.translations) {
    return page.title || '';
  }

  const translation = getLocalizedField(page.translations, locale);
  return translation?.title || page.title || '';
}

/**
 * Obține slug-ul paginii în limba specificată
 */
export function getPageSlug(
  page: PageWithTranslations,
  locale: Locale
): string {
  if (!page.translations) {
    return page.slug || '';
  }

  const translation = getLocalizedField(page.translations, locale);
  return translation?.slug || page.slug || '';
}

/**
 * Obține conținutul paginii în limba specificată
 */
export function getPageContent(
  page: PageWithTranslations,
  locale: Locale
): string {
  if (!page.translations) {
    return page.content || '';
  }

  const translation = getLocalizedField(page.translations, locale);
  return translation?.content || page.content || '';
}

/**
 * Obține pagina localizată complet
 */
export function getLocalizedPage(
  page: PageWithTranslations,
  locale: Locale
): PageWithTranslations {
  const translation = page.translations
    ? getLocalizedField(page.translations, locale)
    : null;

  return {
    ...page,
    title: translation?.title || page.title,
    slug: translation?.slug || page.slug,
    content: translation?.content || page.content,
    excerpt: translation?.excerpt || page.excerpt,
    metaTitle: translation?.metaTitle,
    metaDescription: translation?.metaDescription,
    keywords: translation?.keywords,
  };
}

/**
 * Generează slug pentru pagină în toate limbile
 */
export function generatePageSlugs(
  title: string
): Record<Locale, string> {
  return {
    ro: generateLocalizedSlug(title, 'ro'),
    en: generateLocalizedSlug(title, 'en'),
    ru: generateLocalizedSlug(title, 'ru'),
  };
}

/**
 * Validează traducerile unei pagini
 */
export function validatePageTranslations(
  page: PageWithTranslations,
  requiredLocales: Locale[]
): { valid: boolean; missing: Locale[] } {
  const missing: Locale[] = [];

  for (const locale of requiredLocales) {
    if (!page.translations || !page.translations[locale]) {
      missing.push(locale);
      continue;
    }

    const translation = page.translations[locale];
    if (!translation.title || !translation.content || !translation.slug) {
      missing.push(locale);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Obține articol blog localizat
 */
export function getLocalizedBlogPost(
  post: PageWithTranslations,
  locale: Locale
): PageWithTranslations {
  return getLocalizedPage(post, locale);
}
