import { vi } from 'vitest';

vi.mock(import('next/navigation'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), pathname: '/', prefetch: vi.fn(), back: vi.fn() }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
  };
});

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) =>
    require('react').createElement('img', { ...props, 'data-testid': 'next-image' }),
}));

// Global DOM mocks
if (typeof globalThis.window !== 'undefined') {
  if (!globalThis.window.matchMedia) {
    globalThis.window.matchMedia = () => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }
  if (!globalThis.window.scrollTo) {
    globalThis.window.scrollTo = () => {};
  }
}

// i18n mocks (safe fallbacks)
try {
  vi.mock('@/utils/i18n', async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      t: (k: unknown) => String(k),
      generateLocalizedSlug: (text: unknown) =>
        String(text)
          .normalize('NFKD')
          .replace(/[^\w\s-]/g, '')
          .toLowerCase()
          .replace(/\s+/g, '-'),
    };
  });
} catch (_e) {
  // ignore if module not present
}