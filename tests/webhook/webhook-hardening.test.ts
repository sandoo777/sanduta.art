import { describe, expect, it } from 'vitest';
import { calculateBackoffMs } from '@/jobs/webhookRetry';

describe('webhook hardening', () => {
  it('uses exponential backoff', () => {
    expect(calculateBackoffMs(0)).toBe(1000);
    expect(calculateBackoffMs(3)).toBe(8000);
  });
});
