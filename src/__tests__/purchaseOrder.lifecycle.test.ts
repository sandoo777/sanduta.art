import { describe, expect, it } from 'vitest';
import { applyPoStatusTransition } from '@/modules/purchasing/reorder';

describe('purchase order lifecycle', () => {
  it('moves from draft to pending approval and then to sent', () => {
    expect(applyPoStatusTransition('DRAFT', 'approve')).toBe('PENDING_APPROVAL');
    expect(applyPoStatusTransition('PENDING_APPROVAL', 'send')).toBe('SENT');
  });

  it('marks a sent order as received and updates the inventory delta', () => {
    expect(applyPoStatusTransition('SENT', 'receive')).toBe('RECEIVED');
  });

  it('rejects invalid state transitions', () => {
    expect(() => applyPoStatusTransition('SENT', 'approve')).toThrow('Invalid PO status transition');
  });
});
