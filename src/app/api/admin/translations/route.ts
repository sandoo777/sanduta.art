/**
 * Admin Translations API
 * GET /api/admin/translations - listă toate traducerile
 * PUT /api/admin/translations - actualizează o traducere
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/config';
import { loadTranslations } from '@/lib/i18n/translations';

export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    logger.info('API:Translations', 'Fetching all translations', { userId: user.id });

    // Încarcă traducerile pentru toate limbile
    const allTranslations: Record<Locale, any> = {} as any;
    
    for (const locale of SUPPORTED_LOCALES) {
      allTranslations[locale] = await loadTranslations(locale);
    }

    // Flatten traducerile într-o listă
    const entries: Array<{ key: string; translations: Record<Locale, string> }> = [];
    
    function flattenTranslations(obj: any, prefix = '') {
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        if (typeof value === 'string') {
          // Este o traducere finală
          const translations: Record<Locale, string> = {} as any;
          
          for (const locale of SUPPORTED_LOCALES) {
            const localeObj = allTranslations[locale];
            const keys = fullKey.split('.');
            let val: any = localeObj;
            
            for (const k of keys) {
              if (val && typeof val === 'object') {
                val = val[k];
              } else {
                val = undefined;
                break;
              }
            }
            
            translations[locale] = typeof val === 'string' ? val : '';
          }
          
          entries.push({ key: fullKey, translations });
        } else if (typeof value === 'object') {
          // Continuă recursiv
          flattenTranslations(value, fullKey);
        }
      }
    }

    flattenTranslations(allTranslations.ro);

    return NextResponse.json(entries);
  } catch (err) {
    logApiError('API:Translations', err);
    return createErrorResponse('Failed to fetch translations', 500);
  }
}

export async function PUT(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    const { key, locale, value } = await req.json();

    if (!key || !locale || !SUPPORTED_LOCALES.includes(locale)) {
      return createErrorResponse('Invalid parameters', 400);
    }

    logger.info('API:Translations', 'Updating translation', {
      userId: user.id,
      key,
      locale,
    });

    // În producție, salvează în baza de date sau fișier
    // Pentru demo, returnăm success
    // TODO: Implementează persistență

    return NextResponse.json({ success: true });
  } catch (err) {
    logApiError('API:Translations', err);
    return createErrorResponse('Failed to update translation', 500);
  }
}
