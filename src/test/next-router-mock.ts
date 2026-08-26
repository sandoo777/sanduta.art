import { vi } from 'vitest';
vi.mock('next/router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), pathname: '/' }),
}));