/**
 * SEO Multilingual Utilities
 * Funcții pentru generarea metatagurilor SEO multilingve
 */

import type { Locale } from '@/i18n/config';
import { SUPPORTED_LOCALES } from '@/i18n/config';

export interface SeoMeta {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

export interface MultilingualSeoMeta {
  [locale: string]: SeoMeta;
}

/**
 * Generează hreflang tags pentru toate limbile
 */
export function generateHreflangTags(
  pathname: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://sanduta.art'
): Array<{ rel: string; hrefLang: string; href: string }> {
  const tags: Array<{ rel: string; hrefLang: string; href: string }> = [];

  // Strip existing locale from pathname
  const cleanPathname = pathname.replace(/^\/(ro|en|ru)/, '');

  // Adaugă tag pentru fiecare limbă
  for (const locale of SUPPORTED_LOCALES) {
    tags.push({
      rel: 'alternate',
      hrefLang: locale,
      href: `${baseUrl}/${locale}${cleanPathname}`,
    });
  }

  // Adaugă x-default (limba implicită)
  tags.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${baseUrl}/ro${cleanPathname}`,
  });

  return tags;
}

/**
 * Generează canonical URL pentru o limbă
 */
export function generateCanonicalUrl(
  pathname: string,
  locale: Locale,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://sanduta.art'
): string {
  const cleanPathname = pathname.replace(/^\/(ro|en|ru)/, '');
  return `${baseUrl}/${locale}${cleanPathname}`;
}

/**
 * Generează toate URL-urile alternative pentru o pagină
 */
export function generateAlternateUrls(
  pathname: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://sanduta.art'
): Record<Locale, string> {
  const cleanPathname = pathname.replace(/^\/(ro|en|ru)/, '');
  const urls: Record<Locale, string> = {} as any;

  for (const locale of SUPPORTED_LOCALES) {
    urls[locale] = `${baseUrl}/${locale}${cleanPathname}`;
  }

  return urls;
}

/**
 * Generează metataguri complete pentru SEO multilingv
 */
export function generateSeoTags(
  meta: SeoMeta,
  locale: Locale,
  pathname: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://sanduta.art'
) {
  const canonical = generateCanonicalUrl(pathname, locale, baseUrl);
  const alternates = generateAlternateUrls(pathname, baseUrl);
  const hreflangTags = generateHreflangTags(pathname, baseUrl);

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    
    // Open Graph
    openGraph: {
      title: meta.ogTitle || meta.title,
      description: meta.ogDescription || meta.description,
      url: canonical,
      siteName: 'Sanduta.art',
      images: meta.ogImage ? [{ url: meta.ogImage }] : [],
      locale,
      type: 'website',
    },

    // Twitter
    twitter: {
      card: meta.twitterCard || 'summary_large_image',
      title: meta.ogTitle || meta.title,
      description: meta.ogDescription || meta.description,
      images: meta.ogImage ? [meta.ogImage] : [],
    },

    // Canonical și alternate
    alternates: {
      canonical,
      languages: alternates,
    },

    // Alte metataguri
    other: {
      'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },

    // Links pentru hreflang (în head)
    links: hreflangTags,
  };
}

/**
 * Generează breadcrumbs multilingve
 */
export function generateBreadcrumbs(
  segments: Array<{ label: string; href: string }>,
  locale: Locale
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: segments.map((segment, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: segment.label,
      item: `https://sanduta.art/${locale}${segment.href}`,
    })),
  };
}

/**
 * Generează schema.org pentru produs multilingv
 */
export function generateProductSchema(
  product: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency: string;
    sku?: string;
    brand?: string;
  },
  locale: Locale
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Sanduta.art',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock',
    },
    inLanguage: locale,
  };
}

/**
 * Generează sitemap XML multilingv
 */
export function generateSitemapEntry(
  url: string,
  lastmod: Date,
  priority: number = 0.7
): string {
  const alternates = SUPPORTED_LOCALES.map((locale) => {
    const localeUrl = url.replace(/\/(ro|en|ru)\//, `/${locale}/`);
    return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${localeUrl}" />`;
  }).join('\n');

  return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod.toISOString()}</lastmod>
    <priority>${priority}</priority>
${alternates}
  </url>`;
}
