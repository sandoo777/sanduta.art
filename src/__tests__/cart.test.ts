/**
 * Test Suite: Cart Functionality
 * Tests cart state management, price calculations, validations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/modules/cart/cartStore';
import { recalculateItemPrice } from '@/lib/cart/recalculateItemPrice';
import { validateCart } from '@/lib/cart/validateCart';
import type { CartItem } from '@/modules/cart/cartStore';

describe('Cart Store', () => {
  beforeEach(() => {
    const store = useCartStore.getState();
    store.clearCart();
  });

  it('should add item to cart', () => {
    const store = useCartStore.getState();
    
    const itemId = store.addItem({
      productId: 'prod-123',
      productSlug: 'poster-foto',
      name: 'Poster Foto Premium',
      previewUrl: 'https://example.com/preview.png',
      specifications: {
        dimensions: { width: 50, height: 70 },
        material: { id: 'mat-1', name: 'Satin Premium' },
        quantity: 5,
        productionTime: '3-5 zile lucratoare',
      },
      upsells: [],
      priceBreakdown: {
        basePrice: 100,
        materialCost: 50,
        finishingCost: 20,
        upsellsCost: 0,
        quantityDiscount: 0,
        subtotal: 170,
      },
      totalPrice: 170,
    });

    expect(itemId).toBeDefined();
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Poster Foto Premium');
  });

  it('should remove item from cart', () => {
    const store = useCartStore.getState();
    
    const itemId = store.addItem({
      productId: 'prod-123',
      productSlug: 'poster-foto',
      name: 'Test Product',
      specifications: {
        dimensions: { width: 50, height: 70 },
        material: { id: 'mat-1', name: 'Material' },
        quantity: 1,
        productionTime: '3 zile',
      },
      upsells: [],
      priceBreakdown: {
        basePrice: 100,
        materialCost: 0,
        finishingCost: 0,
        upsellsCost: 0,
        quantityDiscount: 0,
        subtotal: 100,
      },
      totalPrice: 100,
    });

    store.removeItem(itemId);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(0);
  });

  it('should update item quantity', () => {
    const store = useCartStore.getState();
    
    const itemId = store.addItem({
      productId: 'prod-123',
      productSlug: 'poster',
      name: 'Product',
      specifications: {
        dimensions: { width: 50, height: 70 },
        material: { id: 'mat-1', name: 'Material' },
        quantity: 5,
        productionTime: '3 zile',
      },
      upsells: [],
      priceBreakdown: {
        basePrice: 100,
        materialCost: 50,
        finishingCost: 0,
        upsellsCost: 0,
        quantityDiscount: 0,
        subtotal: 150,
      },
      totalPrice: 150,
    });

    store.updateItem(itemId, {
      specifications: {
        dimensions: { width: 50, height: 70 },
        material: { id: 'mat-1', name: 'Material' },
        quantity: 10,
        productionTime: '3 zile',
      },
    });

    const items = useCartStore.getState().items;
    const updatedItem = items.find(i => i.id === itemId);
    expect(updatedItem?.specifications.quantity).toBe(10);
  });

  it('should duplicate item', () => {
    const store = useCartStore.getState();
    
    const originalId = store.addItem({
      productId: 'prod-123',
      productSlug: 'poster',
      name: 'Product',
      specifications: {
        dimensions: { width: 50, height: 70 },
        material: { id: 'mat-1', name: 'Material' },
        quantity: 5,
        productionTime: '3 zile',
      },
      upsells: [],
      priceBreakdown: {
        basePrice: 100,
        materialCost: 50,
        finishingCost: 0,
        upsellsCost: 0,
        quantityDiscount: 0,
        subtotal: 150,
      },
      totalPrice: 150,
    });

    const duplicatedId = store.duplicateItem(originalId);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(2);
    expect(duplicatedId).not.toBe(originalId);
    expect(items[0].name).toBe(items[1].name);
  });

  it('should calculate totals correctly', () => {
    const store = useCartStore.getState();
    
    store.addItem({
      productId: 'prod-1',
      productSlug: 'product-1',
      name: 'Product 1',
      specifications: {
        dimensions: { width: 50, height: 70 },
        material: { id: 'mat-1', name: 'Material' },
        quantity: 5,
        productionTime: '3 zile',
      },
      upsells: [],
      priceBreakdown: {
        basePrice: 100,
        materialCost: 50,
        finishingCost: 0,
        upsellsCost: 0,
        quantityDiscount: 0,
        subtotal: 150,
      },
      totalPrice: 500,
    });

    store.addItem({
      productId: 'prod-2',
      productSlug: 'product-2',
      name: 'Product 2',
      specifications: {
        dimensions: { width: 60, height: 80 },
        material: { id: 'mat-2', name: 'Material 2' },
        quantity: 3,
        productionTime: '5 zile',
      },
      upsells: [],
      priceBreakdown: {
        basePrice: 200,
        materialCost: 100,
        finishingCost: 0,
        upsellsCost: 0,
        quantityDiscount: 0,
        subtotal: 300,
      },
      totalPrice: 600,
    });

    const totals = store.getTotals();
    expect(totals.subtotal).toBe(1100);
    expect(totals.itemCount).toBe(8);
    expect(totals.discount).toBeGreaterThan(0);
    expect(totals.vat).toBeGreaterThan(0);
    expect(totals.total).toBeGreaterThan(totals.subtotal);
  });
});

describe('Price Recalculation', () => {
  it('should recalculate price when quantity changes', () => {
    const item: CartItem = {
      id: 'item-1',
      productId: 'prod-123',
      productSlug: 'poster',
      name: 'Poster',
      specifications: {
        dimensions: { width: 50, height: 70 },
        material: { id: 'mat-1', name: 'Material' },
        quantity: 5,
        productionTime: '3 zile',
      },
      upsells: [],
      priceBreakdown: {
        basePrice: 100,
        materialCost: 50,
        finishingCost: 20,
        upsellsCost: 0,
        quantityDiscount: 0,
        subtotal: 170,
      },
      totalPrice: 170,
      addedAt: new Date(),
    };

    const result = recalculateItemPrice(item, { quantity: 10 });
    expect(result.totalPrice).toBeGreaterThan(170);
    expect(result.priceBreakdown.quantityDiscount).toBeGreaterThan(0);
  });

  it('should apply quantity discounts correctly', () => {
    const item: CartItem = {
      id: 'item-1',
      productId: 'prod-123',
      productSlug: 'poster',
      name: 'Poster',
      specifications: {
        dimensions: { width: 50, height: 70 },
        material: { id: 'mat-1', name: 'Material' },
        quantity: 5,
        productionTime: '3 zile',
      },
      upsells: [],
      priceBreakdown: {
        basePrice: 100,
        materialCost: 50,
        finishingCost: 20,
        upsellsCost: 0,
        quantityDiscount: 0,
        subtotal: 170,
      },
      totalPrice: 170,
      addedAt: new Date(),
    };

    const result10 = recalculateItemPrice(item, { quantity: 10 });
    expect(result10.priceBreakdown.quantityDiscount).toBeGreaterThan(0);

    const result50 = recalculateItemPrice(item, { quantity: 50 });
    expect(result50.priceBreakdown.quantityDiscount).toBeGreaterThan(result10.priceBreakdown.quantityDiscount);

    const result100 = recalculateItemPrice(item, { quantity: 100 });
    expect(result100.priceBreakdown.quantityDiscount).toBeGreaterThan(result50.priceBreakdown.quantityDiscount);
  });
});

describe('Cart Validation', () => {
  it('should return no errors for valid cart', () => {
    const items: CartItem[] = [
      {
        id: 'item-1',
        productId: 'prod-123',
        productSlug: 'poster',
        name: 'Poster',
        specifications: {
          dimensions: { width: 50, height: 70 },
          material: { id: 'mat-1', name: 'Material' },
          quantity: 5,
          productionTime: '3 zile',
        },
        upsells: [],
        priceBreakdown: {
          basePrice: 100,
          materialCost: 50,
          finishingCost: 0,
          upsellsCost: 0,
          quantityDiscount: 0,
          subtotal: 150,
        },
        totalPrice: 150,
        addedAt: new Date(),
      },
    ];

    const errors = validateCart(items);
    expect(errors).toHaveLength(0);
  });

  it('should detect invalid quantity', () => {
    const items: CartItem[] = [
      {
        id: 'item-1',
        productId: 'prod-123',
        productSlug: 'poster',
        name: 'Poster',
        specifications: {
          dimensions: { width: 50, height: 70 },
          material: { id: 'mat-1', name: 'Material' },
          quantity: 0,
          productionTime: '3 zile',
        },
        upsells: [],
        priceBreakdown: {
          basePrice: 100,
          materialCost: 50,
          finishingCost: 0,
          upsellsCost: 0,
          quantityDiscount: 0,
          subtotal: 150,
        },
        totalPrice: 150,
        addedAt: new Date(),
      },
    ];

    const errors = validateCart(items);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('Cantitatea');
  });

  it('should detect missing material', () => {
    const items: CartItem[] = [
      {
        id: 'item-1',
        productId: 'prod-123',
        productSlug: 'poster',
        name: 'Poster',
        specifications: {
          dimensions: { width: 50, height: 70 },
          material: { id: '', name: '' },
          quantity: 5,
          productionTime: '3 zile',
        },
        upsells: [],
        priceBreakdown: {
          basePrice: 100,
          materialCost: 50,
          finishingCost: 0,
          upsellsCost: 0,
          quantityDiscount: 0,
          subtotal: 150,
        },
        totalPrice: 150,
        addedAt: new Date(),
      },
    ];

    const errors = validateCart(items);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('Materialul');
  });
});
