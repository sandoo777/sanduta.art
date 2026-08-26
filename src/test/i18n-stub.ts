import { vi } from 'vitest';

vi.mock('@/utils/i18n', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    generateLocalizedSlug: (text: unknown) => {
      return String(text || '').normalize('NFKD').replace(/[^\w\s-]/g, '').toLowerCase().replace(/\s+/g, '-');
    },
    t: (k: unknown) => String(k),
  };
});
