import { describe, expect, it } from 'vitest';
import { mapPaynetStatusToPaymentStatus } from '@/jobs/reconcilePayments';
import { calculateBackoffMs } from '@/jobs/webhookRetry';

describe('payments reconcile smoke helpers', () => {
  it('maps paid-like statuses to PAID', () => {
    expect(mapPaynetStatusToPaymentStatus('completed')).toBe('PAID');
    expect(mapPaynetStatusToPaymentStatus('success')).toBe('PAID');
    expect(mapPaynetStatusToPaymentStatus('paid')).toBe('PAID');
  });

  it('maps failed-like statuses to FAILED', () => {
    expect(mapPaynetStatusToPaymentStatus('failed')).toBe('FAILED');
    expect(mapPaynetStatusToPaymentStatus('cancelled')).toBe('FAILED');
  });

  it('falls back to PENDING for unknown statuses', () => {
    expect(mapPaynetStatusToPaymentStatus('processing')).toBe('PENDING');
    expect(mapPaynetStatusToPaymentStatus(undefined)).toBe('PENDING');
  });

  it('calculates exponential backoff', () => {
    expect(calculateBackoffMs(0)).toBe(1000);
    expect(calculateBackoffMs(1)).toBe(2000);
    expect(calculateBackoffMs(2)).toBe(4000);
  });
});
