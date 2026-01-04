import { useState } from 'react';
import type { PriceBreakdown, PriceSelection } from './usePriceCalculator';
import type { SidebarUpsell } from '@/components/public/configurator/PriceSidebar';

interface AddToCartPayload {
  productId: string;
  productName?: string;
  selection: PriceSelection;
  upsells?: SidebarUpsell[];
  fileUrl?: string;
  previewUrl?: string;
  priceBreakdown: PriceBreakdown;
  totalPrice: number;
}

interface UseAddToCartResult {
  loading: boolean;
  error: string | null;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
}

export function useAddToCart(): UseAddToCartResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = async (payload: AddToCartPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Nu am putut adăuga în coș. Încearcă din nou.');
      }

      window.location.href = '/cart';
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, addToCart };
}
