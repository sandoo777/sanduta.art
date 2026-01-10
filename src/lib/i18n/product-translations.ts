/**
 * Product Translations Helpers
 * Funcții pentru lucrul cu traduceri de produse
 */

import type { Locale } from '@/i18n/config';
import { getLocalizedField } from '@/lib/i18n/translations';

export interface ProductTranslation {
  name: string;
  description?: string;
  descriptionShort?: string;
  features?: string[];
  specifications?: Record<string, string>;
}

export interface ProductWithTranslations {
  id: string;
  name: string;
  description?: string;
  descriptionShort?: string;
  translations?: Record<string, ProductTranslation>;
  [key: string]: any;
}

/**
 * Obține numele produsului în limba specificată
 */
export function getProductName(
  product: ProductWithTranslations,
  locale: Locale
): string {
  if (!product.translations) {
    return product.name;
  }

  const translation = getLocalizedField(product.translations, locale);
  return translation?.name || product.name;
}

/**
 * Obține descrierea produsului în limba specificată
 */
export function getProductDescription(
  product: ProductWithTranslations,
  locale: Locale
): string {
  if (!product.translations) {
    return product.description || '';
  }

  const translation = getLocalizedField(product.translations, locale);
  return translation?.description || product.description || '';
}

/**
 * Obține descrierea scurtă a produsului în limba specificată
 */
export function getProductShortDescription(
  product: ProductWithTranslations,
  locale: Locale
): string {
  if (!product.translations) {
    return product.descriptionShort || '';
  }

  const translation = getLocalizedField(product.translations, locale);
  return translation?.descriptionShort || product.descriptionShort || '';
}

/**
 * Obține toate datele traduse ale produsului
 */
export function getLocalizedProduct(
  product: ProductWithTranslations,
  locale: Locale
): ProductWithTranslations {
  return {
    ...product,
    name: getProductName(product, locale),
    description: getProductDescription(product, locale),
    descriptionShort: getProductShortDescription(product, locale),
  };
}

/**
 * Verifică dacă produsul are traduceri complete pentru o limbă
 */
export function hasCompleteTranslation(
  product: ProductWithTranslations,
  locale: Locale
): boolean {
  if (!product.translations || !product.translations[locale]) {
    return false;
  }

  const translation = product.translations[locale];
  return !!(translation.name && translation.description);
}

/**
 * Obține toate limbile disponibile pentru un produs
 */
export function getAvailableLocales(
  product: ProductWithTranslations
): Locale[] {
  if (!product.translations) {
    return [];
  }

  return Object.keys(product.translations).filter((locale) => {
    const translation = product.translations![locale];
    return translation && translation.name;
  }) as Locale[];
}
