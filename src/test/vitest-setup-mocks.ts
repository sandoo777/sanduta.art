import { vi } from 'vitest';

vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>();

  return {
    ...actual,
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), pathname: '/' }),
  };
});

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) =>
    require('react').createElement('img', { ...props, 'data-testid': 'next-image' }),
}));