import { vi } from 'vitest';

vi.mock('@/lib/i18n/translations', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/i18n/translations')>();

  return {
    ...actual,
    generateLocalizedSlug: (text: string, _locale: string) => {
      // fallback: transliterate non-latin to ascii simple fallback
      return String(text)
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '-');
    },
  };
});