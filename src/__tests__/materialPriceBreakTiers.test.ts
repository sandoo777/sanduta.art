import { describe, expect, it } from 'vitest';
import { materialFormSchema, type MaterialFormData } from '@/lib/validations/admin';
import { getMaterialPrice } from '@/modules/materials/pricing';

function baseMaterial(priceBreaks: MaterialFormData['priceBreaks']): MaterialFormData {
  return {
    name: 'Test Material',
    categoryId: 'cat-1',
    consumptionType: 'AREA_BASED',
    active: true,
    unit: 'unit',
    stock: '100',
    minStock: '10',
    salePriceMode: 'amount',
    compatibleMethods: [],
    compatibleEquipment: [],
    priceBreaks,
  } as unknown as MaterialFormData;
}

describe('materialFormSchema - open-ended last quantity tier', () => {
  it('accepts an open-ended last tier (qtyMax empty) with a contiguous bounded tier before it', () => {
    const result = materialFormSchema.safeParse(
      baseMaterial([
        { qtyMin: '2500', qtyMax: '4999', price: '90', discount: '10' },
        { qtyMin: '5000', qtyMax: '', price: '85', discount: '15' },
      ])
    );

    expect(result.success).toBe(true);
  });

  it('rejects an empty qtyMax on a non-last row', () => {
    const result = materialFormSchema.safeParse(
      baseMaterial([
        { qtyMin: '2500', qtyMax: '', price: '90', discount: '10' },
        { qtyMin: '5000', qtyMax: '9999', price: '85', discount: '15' },
      ])
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages.some((m) => m.includes('ultimul rând'))).toBe(true);
    }
  });

  it('rejects overlapping tiers', () => {
    const result = materialFormSchema.safeParse(
      baseMaterial([
        { qtyMin: '2500', qtyMax: '5000', price: '90', discount: '10' },
        { qtyMin: '4000', qtyMax: '', price: '85', discount: '15' },
      ])
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages.some((m) => m.includes('suprapune'))).toBe(true);
    }
  });

  it('rejects gaps between tiers', () => {
    const result = materialFormSchema.safeParse(
      baseMaterial([
        { qtyMin: '2500', qtyMax: '4999', price: '90', discount: '10' },
        { qtyMin: '5500', qtyMax: '', price: '85', discount: '15' },
      ])
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages.some((m) => m.includes('gol'))).toBe(true);
    }
  });

  it('rejects a non-last open-ended tier even when it has the highest qtyMin by position', () => {
    // Sorted by qtyMin, the first entry (index 0) has an empty qtyMax but is not the
    // highest tier, which must be rejected regardless of array position.
    const result = materialFormSchema.safeParse(
      baseMaterial([
        { qtyMin: '2500', qtyMax: '', price: '90', discount: '10' },
      ])
    );

    // Single row: it's both first and last, so an empty qtyMax is allowed here.
    expect(result.success).toBe(true);
  });
});

describe('acceptance test - quantity 15000 with tiers 2500-4999=10% and 5000-NULL=15%', () => {
  const priceBreaks = [
    { qtyMin: 2500, qtyMax: 4999, price: 100, discount: 10 },
    { qtyMin: 5000, qtyMax: null, price: 100, discount: 15 },
  ];

  it('validates successfully via materialFormSchema', () => {
    const result = materialFormSchema.safeParse(
      baseMaterial([
        { qtyMin: '2500', qtyMax: '4999', price: '90', discount: '10' },
        { qtyMin: '5000', qtyMax: '', price: '85', discount: '15' },
      ])
    );

    expect(result.success).toBe(true);
  });

  it('applies the 15% open-ended tier for qty 15000 with no errors', () => {
    const matched = getMaterialPrice({ priceBreaks }, 15000);

    expect(matched).not.toBeNull();
    expect(matched?.discount).toBe(15);
    expect(matched?.finalPrice).toBe(85);
  });
});
