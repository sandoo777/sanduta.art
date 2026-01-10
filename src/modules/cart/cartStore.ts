import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { recalculateItemPrice } from '@/lib/cart/recalculateItemPrice';

export interface CartItemSpecifications {
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  material: {
    id: string;
    name: string;
  };
  finishes?: {
    id: string;
    name: string;
    type: string;
  }[];
  quantity: number;
  productionTime: string;
}

export interface CartItemUpsell {
  id: string;
  name: string;
  price: number;
}

export interface CartItemPriceBreakdown {
  basePrice: number;
  materialCost: number;
  finishingCost: number;
  upsellsCost: number;
  quantityDiscount: number;
  subtotal: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  name: string;
  previewUrl?: string;
  fileUrl?: string;
  specifications: CartItemSpecifications;
  upsells: CartItemUpsell[];
  priceBreakdown: CartItemPriceBreakdown;
  totalPrice: number;
  addedAt: Date;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => string;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<Omit<CartItem, 'id' | 'addedAt'>>) => void;
  duplicateItem: (itemId: string) => string;
  clearCart: () => void;
  getTotals: () => {
    subtotal: number;
    discount: number;
    vat: number;
    total: number;
    itemCount: number;
  };
  getItem: (itemId: string) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const newId = `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newItem: CartItem = {
          ...item,
          id: newId,
          addedAt: new Date(),
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));

        return newId;
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateItem: (itemId, updates) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== itemId) return item;
            // Обновляем спецификации, если есть
            let newSpecs = item.specifications;
            if (updates.specifications) {
              newSpecs = { ...item.specifications, ...updates.specifications };
            }
            // Пересчитываем цену
            const { priceBreakdown, totalPrice } = recalculateItemPrice(
              { ...item, specifications: newSpecs },
              { quantity: newSpecs.quantity }
            );
            return {
              ...item,
              ...updates,
              specifications: newSpecs,
              priceBreakdown,
              totalPrice,
            };
          }),
        }));
      },

      duplicateItem: (itemId) => {
        const item = get().items.find((i) => i.id === itemId);
        if (!item) return '';

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, addedAt, ...itemData } = item;
        return get().addItem(itemData);
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotals: () => {
        const items = get().items;
        
        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        
        // Calculate discount (e.g., 5% for orders over 1000 lei)
        const discount = subtotal > 1000 ? subtotal * 0.05 : 0;
        
        // Calculate VAT (19% in Romania)
        const vat = (subtotal - discount) * 0.19;
        
        // Calculate total
        const total = subtotal - discount + vat;
        
        // Count items
        const itemCount = items.reduce((count, item) => count + item.specifications.quantity, 0);

        return {
          subtotal,
          discount,
          vat,
          total,
          itemCount,
        };
      },

      getItem: (itemId) => {
        return get().items.find((item) => item.id === itemId);
      },
    }),
    {
      name: 'sanduta-cart-storage',
    }
  )
);
