import { vi } from 'vitest';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  // allow tests to spy/replace fetch safely
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    writable: true,
    value: originalFetch || vi.fn(() => Promise.resolve(new Response('{}'))),
  });
});

afterEach(() => {
  try {
    globalThis.fetch = originalFetch;
  } catch {}
});