import { describe, expect, it } from 'vitest';
import { aggregateDraftPoLines, evaluateReorderCandidates } from '@/modules/purchasing/reorder';

describe('reorder evaluator', () => {
  it('triggers a reorder when quantity is at or below the minimum threshold', () => {
    const rules = [
      { id: 'r1', materialId: 'm1', minThreshold: 25, reorderQuantity: 100, supplierId: 's1', enabled: true },
    ];

    const inventory = [
      { materialId: 'm1', quantity: 20, unit: 'm2' },
      { materialId: 'm2', quantity: 90, unit: 'unit' },
    ];

    expect(evaluateReorderCandidates(rules, inventory)).toEqual([
      expect.objectContaining({ materialId: 'm1', triggerQuantity: 20, reorderQuantity: 100, supplierId: 's1' }),
    ]);
  });

  it('skips disabled rules or healthy inventory', () => {
    const rules = [
      { id: 'r1', materialId: 'm1', minThreshold: 25, reorderQuantity: 100, supplierId: 's1', enabled: false },
      { id: 'r2', materialId: 'm2', minThreshold: 30, reorderQuantity: 50, supplierId: 's2', enabled: true },
    ];

    const inventory = [
      { materialId: 'm1', quantity: 5, unit: 'm2' },
      { materialId: 'm2', quantity: 45, unit: 'unit' },
    ];

    expect(evaluateReorderCandidates(rules, inventory)).toEqual([]);
  });

  it('aggregates draft PO lines for the same supplier and material within the same window', () => {
    const lines = [
      { materialId: 'm1', quantity: 50, unit: 'm2', unitCost: 12 },
      { materialId: 'm1', quantity: 25, unit: 'm2', unitCost: 12 },
      { materialId: 'm2', quantity: 10, unit: 'unit', unitCost: 4 },
    ];

    expect(aggregateDraftPoLines(lines)).toEqual([
      { materialId: 'm1', quantity: 75, unit: 'm2', unitCost: 12 },
      { materialId: 'm2', quantity: 10, unit: 'unit', unitCost: 4 },
    ]);
  });
});
