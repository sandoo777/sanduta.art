/**
 * I18n System Tests
 * Teste pentru sistemul multilingv
 */

import { describe, it, expect } from 'vitest';
import {
  isValidLocale,
  detectLocale,
  getFallbackChain,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
} from '@/i18n/config';
import {
  loadTranslations,
  getTranslation,
  interpolate,
  getLocalizedField,
  generateLocalizedSlug,
} from '@/lib/i18n/translations';
import { getProductName } from '@/lib/i18n/product-translations';
import { getPageTitle } from '@/lib/i18n/cms-translations';
import { generateHreflangTags, generateCanonicalUrl } from '@/lib/seo/generateSeoTags';

describe('I18n Config', () => {
  it('should validate supported locales', () => {
    expect(isValidLocale('ro')).toBe(true);
    expect(isValidLocale('en')).toBe(true);
    expect(isValidLocale('ru')).toBe(true);
    expect(isValidLocale('fr')).toBe(false);
    expect(isValidLocale('invalid')).toBe(false);
  });

  it('should detect locale correctly', () => {
    expect(detectLocale('en', undefined, undefined)).toBe('en');
    expect(detectLocale(undefined, 'ru', undefined)).toBe('ru');
    expect(detectLocale(undefined, undefined, 'en-US')).toBe('en');
    expect(detectLocale(undefined, undefined, 'fr-FR')).toBe('ro'); // fallback
  });

  it('should generate fallback chain', () => {
    expect(getFallbackChain('ro')).toEqual(['ro']);
    expect(getFallbackChain('en')).toContain('ro');
    expect(getFallbackChain('ru')).toContain('ro');
  });
});

describe('Translation Loading', () => {
  it('should load translations for all locales', async () => {
    for (const locale of SUPPORTED_LOCALES) {
      const translations = await loadTranslations(locale);
      expect(translations).toBeDefined();
      expect(translations.common).toBeDefined();
      expect(translations.nav).toBeDefined();
    }
  });

  it('should have consistent keys across locales', async () => {
    const roTranslations = await loadTranslations('ro');
    const enTranslations = await loadTranslations('en');
    const ruTranslations = await loadTranslations('ru');

    expect(Object.keys(roTranslations)).toEqual(Object.keys(enTranslations));
    expect(Object.keys(roTranslations)).toEqual(Object.keys(ruTranslations));
  });
});

describe('Translation Functions', () => {
  it('should get translation with fallback', async () => {
    const translations = await loadTranslations('ro');
    const result = getTranslation('common.loading', translations, 'ro');
    
    expect(result.value).toBe('Se încarcă...');
    expect(result.isFallback).toBe(false);
  });

  it('should interpolate parameters', () => {
    const template = 'Minim {{min}} caractere';
    const result = interpolate(template, { min: '5' });
    expect(result).toBe('Minim 5 caractere');
  });

  it('should get localized field with fallback', () => {
    const data = {
      ro: 'Numele în română',
      en: 'Name in English',
    };
    
    expect(getLocalizedField(data, 'ro')).toBe('Numele în română');
    expect(getLocalizedField(data, 'en')).toBe('Name in English');
    expect(getLocalizedField(data, 'ru')).toBe('Numele în română'); // fallback
  });

  it('should generate localized slugs', () => {
    expect(generateLocalizedSlug('Produse Noi', 'ro')).toBe('produse-noi');
    expect(generateLocalizedSlug('New Products', 'en')).toBe('new-products');
    expect(generateLocalizedSlug('Новые Продукты', 'ru')).toMatch(/[a-z-]+/);
  });
});

describe('Product Translations', () => {
  it('should get product name in correct locale', () => {
    const product = {
      id: '1',
      name: 'Default Name',
      translations: {
        ro: { name: 'Nume în Română', description: 'Descriere' },
        en: { name: 'Name in English', description: 'Description' },
      },
    };

    expect(getProductName(product, 'ro')).toBe('Nume în Română');
    expect(getProductName(product, 'en')).toBe('Name in English');
    expect(getProductName(product, 'ru')).toBe('Nume în Română'); // fallback
  });
});

describe('CMS Translations', () => {
  it('should get page title in correct locale', () => {
    const page = {
      id: '1',
      title: 'Default Title',
      translations: {
        ro: { title: 'Titlu RO', slug: 'titlu-ro', content: 'Content' },
        en: { title: 'Title EN', slug: 'title-en', content: 'Content' },
      },
    };

    expect(getPageTitle(page, 'ro')).toBe('Titlu RO');
    expect(getPageTitle(page, 'en')).toBe('Title EN');
  });
});

describe('SEO Multilingual', () => {
  it('should generate hreflang tags', () => {
    const tags = generateHreflangTags('/about', 'https://sanduta.art');
    
    expect(tags).toHaveLength(4); // ro, en, ru, x-default
    expect(tags.find(t => t.hrefLang === 'ro')?.href).toBe('https://sanduta.art/ro/about');
    expect(tags.find(t => t.hrefLang === 'en')?.href).toBe('https://sanduta.art/en/about');
    expect(tags.find(t => t.hrefLang === 'x-default')?.href).toBe('https://sanduta.art/ro/about');
  });

  it('should generate canonical URL', () => {
    const canonical = generateCanonicalUrl('/products', 'en', 'https://sanduta.art');
    expect(canonical).toBe('https://sanduta.art/en/products');
  });

  it('should strip existing locale from pathname', () => {
    const tags = generateHreflangTags('/ro/products', 'https://sanduta.art');
    expect(tags.find(t => t.hrefLang === 'en')?.href).toBe('https://sanduta.art/en/products');
  });
});

describe('Email Templates', () => {
  it('should have email templates for all locales', async () => {
    const { emailTemplates } = await import('@/lib/email/templates-i18n');
    
    for (const type of Object.keys(emailTemplates)) {
      for (const locale of SUPPORTED_LOCALES) {
        expect(emailTemplates[type][locale]).toBeDefined();
        expect(emailTemplates[type][locale].subject).toBeTruthy();
        expect(emailTemplates[type][locale].body).toBeTruthy();
      }
    }
  });
});

describe('Middleware I18n', () => {
  it('should detect locale from path', () => {
    const { getLocaleFromPath } = require('@/lib/i18n/middleware');
    
    expect(getLocaleFromPath('/ro/products')).toBe('ro');
    expect(getLocaleFromPath('/en/about')).toBe('en');
    expect(getLocaleFromPath('/ru/contact')).toBe('ru');
    expect(getLocaleFromPath('/products')).toBeNull();
  });

  it('should strip locale from path', () => {
    const { stripLocaleFromPath } = require('@/lib/i18n/middleware');
    
    expect(stripLocaleFromPath('/ro/products')).toBe('/products');
    expect(stripLocaleFromPath('/en/about')).toBe('/about');
    expect(stripLocaleFromPath('/products')).toBe('/products');
  });

  it('should add locale to path', () => {
    const { addLocaleToPath } = require('@/lib/i18n/middleware');
    
    expect(addLocaleToPath('/products', 'ro')).toBe('/ro/products');
    expect(addLocaleToPath('/ro/products', 'en')).toBe('/en/products');
  });
});
