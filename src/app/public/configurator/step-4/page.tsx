"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Step4Summary } from '@/components/public/configurator/Step4Summary';
import { useAddToCart } from '@/modules/configurator/useAddToCart';
import { usePriceCalculator, type PriceSelection } from '@/modules/configurator/usePriceCalculator';
import type { ConfiguratorSelection, UpsellItem } from '@/components/public/configurator/Step4Summary';

// TODO: replace with actual selection from context/store
const defaultSelection: PriceSelection = {
  dimension: 'A4',
  material: '170g',
  finishes: ['laminare-mata'],
  quantity: 2,
  productionSpeed: 'express',
};

const mockUpsells: UpsellItem[] = [
  { id: 'proof', title: 'Verificare fișier premium', description: 'Designer dedicat', price: 59 },
  { id: 'express', title: 'Livrare expres', description: 'În 24h după producție', price: 89 },
];

export default function Step4SummaryPage() {
  const router = useRouter();
  const calculator = usePriceCalculator();
  const { addToCart, loading } = useAddToCart();
  const selectionInput = useMemo<PriceSelection>(() => defaultSelection, []);
  const breakdown = useMemo(() => calculator.calcTotal(selectionInput), [calculator, selectionInput]);
  const [upsells, setUpsells] = useState(mockUpsells);

  const mockSelection: ConfiguratorSelection = useMemo(
    () => ({
      productId: 'rollup-banner',
      dimensions: 'A4 (210 x 297 mm)',
      material: selectionInput.material,
      finish: 'Laminare mată',
      quantity: selectionInput.quantity,
      productionSpeed: 'Express (48h)',
      unitPrice: Number((breakdown.total / selectionInput.quantity).toFixed(2)),
      totalPrice: breakdown.total,
      previewUrl: '/images/sample-rollup.jpg',
      fileName: 'rollup-final.pdf',
      fileStatus: 'ok',
    }),
    [breakdown.total, selectionInput.material, selectionInput.quantity]
  );

  const handleAddToCart = async () => {
    const upsellsTotal = upsells.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    const totalWithUpsells = breakdown.total + upsellsTotal;
    
    await addToCart({
      productId: mockSelection.productId,
      selection: selectionInput,
      upsells: upsells.map((u) => ({ label: u.title, delta: u.price })),
      fileUrl: mockSelection.previewUrl,
      previewUrl: mockSelection.previewUrl,
      priceBreakdown: { ...breakdown, total: totalWithUpsells },
      totalPrice: totalWithUpsells,
    });
  };

  return (
    <Step4Summary
      selection={mockSelection}
      upsells={upsells}
      currency="RON"
      vatIncluded
      loading={loading}
      onUpload={() => router.push('/public/configurator/step-2')}
      onRemoveUpsell={(id) => setUpsells((prev) => prev.filter((u) => u.id !== id))}
      onAddToCart={handleAddToCart}
    />
  );
}
