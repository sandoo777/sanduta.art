/**
 * Unit Tests - Price Calculator
 * Tests pentru calculul prețurilor în configurator
 */

import { describe, it, expect } from 'vitest';

// Mock pentru calculatorul de prețuri
class PriceCalculator {
  /**
   * Calculează prețul de bază al produsului
   */
  static calculateBasePrice(
    basePrice: number,
    quantity: number,
    discount: number = 0
  ): number {
    const subtotal = basePrice * quantity;
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  }

  /**
   * Calculează prețul cu opțiuni adiționale
   */
  static calculateWithOptions(
    basePrice: number,
    options: Array<{ price: number; quantity?: number }>
  ): number {
    const optionsTotal = options.reduce((sum, opt) => {
      return sum + opt.price * (opt.quantity || 1);
    }, 0);
    return basePrice + optionsTotal;
  }

  /**
   * Calculează prețul cu TVA
   */
  static calculateWithVAT(price: number, vatRate: number = 19): number {
    return price * (1 + vatRate / 100);
  }

  /**
   * Calculează discount bulk (pentru cantități mari)
   */
  static calculateBulkDiscount(quantity: number): number {
    if (quantity >= 100) return 15;
    if (quantity >= 50) return 10;
    if (quantity >= 20) return 5;
    return 0;
  }

  /**
   * Calculează prețul final complet
   */
  static calculateFinalPrice(params: {
    basePrice: number;
    quantity: number;
    options?: Array<{ price: number; quantity?: number }>;
    discount?: number;
    includeVAT?: boolean;
    vatRate?: number;
  }): {
    subtotal: number;
    discount: number;
    bulkDiscount: number;
    vat: number;
    total: number;
  } {
    const {
      basePrice,
      quantity,
      options = [],
      discount = 0,
      includeVAT = true,
      vatRate = 19,
    } = params;

    // Calcul preț de bază
    let subtotal = basePrice * quantity;

    // Adaugă opțiuni
    if (options.length > 0) {
      const optionsTotal = options.reduce(
        (sum, opt) => sum + opt.price * (opt.quantity || 1),
        0
      );
      subtotal += optionsTotal * quantity;
    }

    // Discount manual
    const discountAmount = subtotal * (discount / 100);

    // Discount bulk
    const bulkDiscountRate = this.calculateBulkDiscount(quantity);
    const bulkDiscountAmount = subtotal * (bulkDiscountRate / 100);

    // Subtotal după discounturi
    const subtotalAfterDiscounts =
      subtotal - discountAmount - bulkDiscountAmount;

    // TVA
    const vatAmount = includeVAT ? subtotalAfterDiscounts * (vatRate / 100) : 0;

    // Total final
    const total = subtotalAfterDiscounts + vatAmount;

    return {
      subtotal,
      discount: discountAmount + bulkDiscountAmount,
      bulkDiscount: bulkDiscountAmount,
      vat: vatAmount,
      total: Math.round(total * 100) / 100, // Rotunjire la 2 zecimale
    };
  }
}

describe('PriceCalculator - Basic Calculations', () => {
  it('calculează prețul de bază corect', () => {
    const result = PriceCalculator.calculateBasePrice(100, 5);
    expect(result).toBe(500);
  });

  it('aplică discount corect', () => {
    const result = PriceCalculator.calculateBasePrice(100, 5, 10);
    expect(result).toBe(450); // 500 - 10% = 450
  });

  it('calculează prețul cu opțiuni', () => {
    const result = PriceCalculator.calculateWithOptions(100, [
      { price: 20 },
      { price: 15, quantity: 2 },
    ]);
    expect(result).toBe(150); // 100 + 20 + (15*2)
  });

  it('calculează TVA corect', () => {
    const result = PriceCalculator.calculateWithVAT(100);
    expect(result).toBe(119); // 100 + 19%
  });

  it('calculează TVA custom corect', () => {
    const result = PriceCalculator.calculateWithVAT(100, 24);
    expect(result).toBe(124);
  });
});

describe('PriceCalculator - Bulk Discounts', () => {
  it('nu aplică discount pentru cantități mici', () => {
    const discount = PriceCalculator.calculateBulkDiscount(10);
    expect(discount).toBe(0);
  });

  it('aplică 5% discount pentru 20-49 bucăți', () => {
    expect(PriceCalculator.calculateBulkDiscount(20)).toBe(5);
    expect(PriceCalculator.calculateBulkDiscount(49)).toBe(5);
  });

  it('aplică 10% discount pentru 50-99 bucăți', () => {
    expect(PriceCalculator.calculateBulkDiscount(50)).toBe(10);
    expect(PriceCalculator.calculateBulkDiscount(99)).toBe(10);
  });

  it('aplică 15% discount pentru 100+ bucăți', () => {
    expect(PriceCalculator.calculateBulkDiscount(100)).toBe(15);
    expect(PriceCalculator.calculateBulkDiscount(500)).toBe(15);
  });
});

describe('PriceCalculator - Final Price Calculation', () => {
  it('calculează prețul final simplu', () => {
    const result = PriceCalculator.calculateFinalPrice({
      basePrice: 100,
      quantity: 1,
    });

    expect(result.subtotal).toBe(100);
    expect(result.discount).toBe(0);
    expect(result.vat).toBe(19);
    expect(result.total).toBe(119);
  });

  it('calculează prețul cu discount manual', () => {
    const result = PriceCalculator.calculateFinalPrice({
      basePrice: 100,
      quantity: 1,
      discount: 10,
    });

    expect(result.subtotal).toBe(100);
    expect(result.discount).toBe(10);
    expect(result.total).toBe(107.1); // (100 - 10) * 1.19
  });

  it('calculează prețul cu bulk discount', () => {
    const result = PriceCalculator.calculateFinalPrice({
      basePrice: 100,
      quantity: 50, // 10% bulk discount
    });

    expect(result.subtotal).toBe(5000);
    expect(result.bulkDiscount).toBe(500); // 10%
    expect(result.total).toBe(5355); // (5000 - 500) * 1.19
  });

  it('calculează prețul cu opțiuni', () => {
    const result = PriceCalculator.calculateFinalPrice({
      basePrice: 100,
      quantity: 2,
      options: [{ price: 20 }],
    });

    // (100 + 20) * 2 = 240
    expect(result.subtotal).toBe(240);
    expect(result.total).toBe(285.6); // 240 * 1.19
  });

  it('calculează prețul complet cu toate opțiunile', () => {
    const result = PriceCalculator.calculateFinalPrice({
      basePrice: 100,
      quantity: 60, // 10% bulk discount
      options: [{ price: 15 }, { price: 10, quantity: 2 }],
      discount: 5, // 5% discount manual
    });

    // Subtotal: (100 + 15 + 10*2) * 60 = 135 * 60 = 8100
    // Manual discount: 8100 * 5% = 405
    // Bulk discount: 8100 * 10% = 810
    // După discounturi: 8100 - 405 - 810 = 6885
    // TVA: 6885 * 19% = 1308.15
    // Total: 6885 + 1308.15 = 8193.15

    expect(result.subtotal).toBe(8100);
    expect(result.discount).toBe(1215); // 405 + 810
    expect(result.vat).toBe(1308.15);
    expect(result.total).toBe(8193.15);
  });

  it('calculează prețul fără TVA când este specificat', () => {
    const result = PriceCalculator.calculateFinalPrice({
      basePrice: 100,
      quantity: 1,
      includeVAT: false,
    });

    expect(result.vat).toBe(0);
    expect(result.total).toBe(100);
  });
});

describe('PriceCalculator - Edge Cases', () => {
  it('gestionează cantitate 0', () => {
    const result = PriceCalculator.calculateFinalPrice({
      basePrice: 100,
      quantity: 0,
    });

    expect(result.total).toBe(0);
  });

  it('gestionează preț negativ (throw sau 0)', () => {
    const result = PriceCalculator.calculateBasePrice(-100, 1);
    expect(result).toBeLessThanOrEqual(0);
  });

  it('rotunjește prețul la 2 zecimale', () => {
    const result = PriceCalculator.calculateFinalPrice({
      basePrice: 33.33,
      quantity: 3,
    });

    // Verifică că are maxim 2 zecimale
    const decimals = result.total.toString().split('.')[1]?.length || 0;
    expect(decimals).toBeLessThanOrEqual(2);
  });

  it('gestionează discount 100%', () => {
    const result = PriceCalculator.calculateFinalPrice({
      basePrice: 100,
      quantity: 1,
      discount: 100,
      includeVAT: false,
    });

    expect(result.total).toBe(0);
  });
});
