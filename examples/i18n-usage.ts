/**
 * I18N USAGE EXAMPLES
 * Exemple concise de utilizare a sistemului multilingv
 */

import { loadTranslations, createTranslateFunction } from '@/lib/i18n/translations';
import type { Locale } from '@/i18n/config';

export function buildProductCardCopy(t: (key: string, params?: Record<string, unknown>) => string) {
  return {
    title: t('product.title'),
    description: t('product.description'),
    addToCartLabel: t('product.addToCart'),
  };
}

export function buildValidationMessage(
  t: (key: string, params?: Record<string, unknown>) => string,
  min: number
) {
  return t('validation.min', { min });
}

export async function buildHomePageCopy(lang: Locale) {
  const translations = await loadTranslations(lang);
  const t = createTranslateFunction(lang, translations);

  return {
    title: t('nav.home'),
    welcome: t('common.welcome'),
  };
}

export async function buildLocalizedProductResponse(
  product: { id: string },
  locale: Locale
) {
  const translations = await loadTranslations(locale);
  const t = createTranslateFunction(locale, translations);

  return {
    productId: product.id,
    title: t('product.title'),
  };
}
