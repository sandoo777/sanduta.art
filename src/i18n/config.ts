/**
 * I18n Configuration
 * Configurare globală pentru sistemul multilingv
 */

export const SUPPORTED_LOCALES = ['ro', 'en', 'ru'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

export const DEFAULT_LOCALE: Locale = 'ro';

export const LOCALE_NAMES: Record<Locale, string> = {
  ro: 'Română',
  en: 'English',
  ru: 'Русский',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  ro: '🇷🇴',
  en: '🇬🇧',
  ru: '🇷🇺',
};

export const i18nConfig = {
  defaultLocale: DEFAULT_LOCALE,
  locales: SUPPORTED_LOCALES,
  localeDetection: {
    cookie: true,
    cookieName: 'NEXT_LOCALE',
    url: true,
    browser: true,
  },
  fallback: {
    en: ['ro'],
    ru: ['ro', 'en'],
  },
} as const;

/**
 * Verifică dacă o limbă este suportată
 */
export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * Obține limba din cookie, URL sau browser
 */
export function detectLocale(
  cookieLocale?: string,
  urlLocale?: string,
  browserLocale?: string
): Locale {
  // 1. Prioritate: URL
  if (urlLocale && isValidLocale(urlLocale)) {
    return urlLocale as Locale;
  }

  // 2. Cookie
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale as Locale;
  }

  // 3. Browser
  if (browserLocale) {
    const lang = browserLocale.split('-')[0];
    if (isValidLocale(lang)) {
      return lang as Locale;
    }
  }

  // 4. Default
  return DEFAULT_LOCALE;
}

/**
 * Obține fallback chain pentru o limbă
 */
export function getFallbackChain(locale: Locale): Locale[] {
  const chain: Locale[] = [locale];
  
  if (locale !== DEFAULT_LOCALE) {
    const fallbacks = i18nConfig.fallback[locale] || [];
    chain.push(...fallbacks as Locale[]);
    
    if (!chain.includes(DEFAULT_LOCALE)) {
      chain.push(DEFAULT_LOCALE);
    }
  }
  
  return chain;
}
