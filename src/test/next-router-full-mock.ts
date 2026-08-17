import { vi } from 'vitest';

// next/navigation is fully mocked in vitest-setup-mocks.ts — no duplicate here

vi.mock('next/router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), pathname: '/' }),
}));