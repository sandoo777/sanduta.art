/**
 * Translation Utilities
 * Funcții pentru încărcarea și managementul traducerilor
 */

import type { Locale } from '@/i18n/config';
import { DEFAULT_LOCALE, getFallbackChain } from '@/i18n/config';
import type { TranslationDictionary, TranslationResult } from '@/i18n/types';

// Cache pentru traduceri
const translationsCache = new Map<Locale, TranslationDictionary>();

/**
 * Încarcă traducerile pentru o limbă
 */
export async function loadTranslations(locale: Locale): Promise<TranslationDictionary> {
  // Check cache
  if (translationsCache.has(locale)) {
    return translationsCache.get(locale)!;
  }

  try {
    const translations = await import(`@/i18n/translations/${locale}.json`);
    const data = translations.default || translations;
    translationsCache.set(locale, data);
    return data;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    
    // Fallback la limba implicită
    if (locale !== DEFAULT_LOCALE) {
      return loadTranslations(DEFAULT_LOCALE);
    }
    
    return {};
  }
}

/**
 * Obține o traducere cu fallback
 */
export function getTranslation(
  key: string,
  translations: TranslationDictionary,
  locale: Locale,
  fallbackChain?: Locale[]
): TranslationResult {
  const keys = key.split('.');
  let value: any = translations;

  // Navighează prin obiectul de traduceri
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      value = undefined;
      break;
    }
  }

  if (typeof value === 'string') {
    return {
      value,
      locale,
      isFallback: false,
    };
  }

  // Încearcă fallback chain
  if (fallbackChain && fallbackChain.length > 0) {
    for (const fallbackLocale of fallbackChain) {
      if (fallbackLocale === locale) continue;
      
      const fallbackTranslations = translationsCache.get(fallbackLocale);
      if (fallbackTranslations) {
        const fallbackResult = getTranslation(key, fallbackTranslations, fallbackLocale, []);
        if (!fallbackResult.isFallback) {
          return {
            ...fallbackResult,
            isFallback: true,
          };
        }
      }
    }
  }

  // Returnează cheia dacă nu găsește traducere
  return {
    value: key,
    locale,
    isFallback: true,
  };
}

/**
 * Interpolează parametri într-o traducere
 */
export function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
}

/**
 * Creează funcție de traducere
 */
export function createTranslateFunction(
  locale: Locale,
  translations: TranslationDictionary
) {
  const fallbackChain = getFallbackChain(locale);

  return function translate(
    key: string,
    params?: Record<string, string | number>,
    fallback?: string
  ): string {
    const result = getTranslation(key, translations, locale, fallbackChain);
    const value = result.isFallback && fallback ? fallback : result.value;
    return interpolate(value, params);
  };
}

/**
 * Obține traducere pentru un obiect cu câmpuri multilingve
 */
export function getLocalizedField<T = string>(
  translations: Record<string, T> | null | undefined,
  locale: Locale,
  fallback?: T
): T | undefined {
  if (!translations) return fallback;

  // Încearcă limba curentă
  if (translations[locale]) {
    return translations[locale];
  }

  // Încearcă fallback chain
  const fallbackChain = getFallbackChain(locale);
  for (const fallbackLocale of fallbackChain) {
    if (translations[fallbackLocale]) {
      return translations[fallbackLocale];
    }
  }

  return fallback;
}

/**
 * Generează slug localizat
 */
export function generateLocalizedSlug(
  text: string,
  locale: Locale
): string {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  // Conversii specifice limbii
  if (locale === 'ro') {
    slug = slug
      .replace(/ă/g, 'a')
      .replace(/â/g, 'a')
      .replace(/î/g, 'i')
      .replace(/ș/g, 's')
      .replace(/ț/g, 't');
  } else if (locale === 'ru') {
    // Transliterare simplă pentru rusă
    const ruMap: Record<string, string> = {
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo',
      ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
      н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
      ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
      ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    };
    
    slug = slug.replace(/[а-яё]/g, (char) => ruMap[char] || char);
  }

  return slug;
}

/**
 * Validează dacă toate traducerile necesare există
 */
export function validateTranslations(
  translations: Record<string, any>,
  requiredKeys: string[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const key of requiredKeys) {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        missing.push(key);
        break;
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
