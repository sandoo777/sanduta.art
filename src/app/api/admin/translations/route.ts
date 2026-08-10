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
import type { TranslationDictionary } from '@/i18n/types';

type TranslationEntries = Array<{ key: string; translations: Record<Locale, string> }>;

function getTranslationValue(
  dictionary: TranslationDictionary,
  keyPath: string
): string | undefined {
  const keys = keyPath.split('.');
  let value: string | TranslationDictionary | undefined = dictionary;

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return typeof value === 'string' ? value : undefined;
}

function flattenTranslations(
  obj: TranslationDictionary,
  allTranslations: Record<Locale, TranslationDictionary>,
  entries: TranslationEntries,
  prefix = ''
) {
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (typeof value === 'string') {
      const translations = {} as Record<Locale, string>;

      for (const locale of SUPPORTED_LOCALES) {
        translations[locale] = getTranslationValue(allTranslations[locale], fullKey) || '';
      }

      entries.push({ key: fullKey, translations });
    } else if (value && typeof value === 'object') {
      flattenTranslations(value, allTranslations, entries, fullKey);
    }
  }
}

export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    logger.info('API:Translations', 'Fetching all translations', { userId: user.id });

    // Încarcă traducerile pentru toate limbile
    const allTranslations = {} as Record<Locale, TranslationDictionary>;
    
    for (const locale of SUPPORTED_LOCALES) {
      allTranslations[locale] = await loadTranslations(locale);
    }

    // Flatten traducerile într-o listă
    const entries: TranslationEntries = [];
    flattenTranslations(allTranslations.ro, allTranslations, entries);

    return NextResponse.json(entries);
  } catch (err) {
    logApiError('API:Translations', err);
    return createErrorResponse('Failed to fetch translations', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    const { key, locale } = await req.json() as { key?: string; locale?: Locale; value?: string };

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
