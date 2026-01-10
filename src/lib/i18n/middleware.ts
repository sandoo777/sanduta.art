/**
 * Middleware Extensions pentru I18n
 * Extinde middleware-ul existent cu logică de detectare limbă
 */

import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, detectLocale, type Locale } from '@/i18n/config';

/**
 * Verifică dacă path-ul are un locale valid
 */
export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  
  return null;
}

/**
 * Elimină locale din path
 */
export function stripLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/';
  }
  return pathname;
}

/**
 * Adaugă locale la path
 */
export function addLocaleToPath(pathname: string, locale: Locale): string {
  const stripped = stripLocaleFromPath(pathname);
  return `/${locale}${stripped}`;
}

/**
 * Middleware pentru I18n routing
 * Trebuie integrat în middleware.ts principal
 */
export function i18nMiddleware(req: NextRequest): NextResponse | null {
  const pathname = req.nextUrl.pathname;
  
  // Skip API routes, _next, static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return null;
  }
  
  // Skip admin routes (ele nu sunt multilingve)
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/manager') ||
    pathname.startsWith('/operator') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')
  ) {
    return null;
  }

  const localeFromPath = getLocaleFromPath(pathname);
  
  // Dacă are deja locale valid în path, continuă
  if (localeFromPath) {
    // Salvează locale în cookie dacă nu există
    const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value;
    if (cookieLocale !== localeFromPath) {
      const response = NextResponse.next();
      response.cookies.set('NEXT_LOCALE', localeFromPath, {
        path: '/',
        maxAge: 31536000, // 1 an
      });
      return response;
    }
    return null;
  }
  
  // Detectează limba preferată
  const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value;
  const browserLocale = req.headers.get('accept-language')?.split(',')[0];
  
  const detectedLocale = detectLocale(cookieLocale, undefined, browserLocale);
  
  // Redirect către path cu locale
  const newPath = addLocaleToPath(pathname, detectedLocale);
  const url = new URL(newPath, req.url);
  url.search = req.nextUrl.search;
  
  return NextResponse.redirect(url);
}
