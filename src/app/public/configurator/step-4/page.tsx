"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Step4Summary } from '@/components/public/configurator/Step4Summary';
import { useAddToCart } from '@/modules/configurator/useAddToCart';
import type { ConfiguratorSelection, UpsellItem } from '@/components/public/configurator/Step4Summary';

// TODO: replace with actual selection from context/store
const mockSelection: ConfiguratorSelection = {
  productId: 'rollup-banner',
  dimensions: '85 x 200 cm',
  material: 'Material textil premium',
  finish: 'Capse + tiv',
  quantity: 2,
  productionSpeed: 'Produse în 48h',
  unitPrice: 450,
  totalPrice: 900,
  previewUrl: '/images/sample-rollup.jpg',
  fileName: 'rollup-final.pdf',
  fileStatus: 'ok',
};

const mockUpsells: UpsellItem[] = [
  { id: 'proof', title: 'Verificare fișier premium', description: 'Designer dedicat', price: 59 },
  { id: 'express', title: 'Livrare expres', description: 'În 24h după producție', price: 89 },
];

export default function Step4SummaryPage() {
  const router = useRouter();
  const { addToCart, loading } = useAddToCart();
  const [upsells, setUpsells] = useState(mockUpsells);

  const handleAddToCart = async () => {
    const upsellsTotal = upsells.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    
    await addToCart({
      productId: mockSelection.productId,
      selection: {
        dimensions: mockSelection.dimensions,
        material: mockSelection.material,
        finish: mockSelection.finish,
        productionSpeed: mockSelection.productionSpeed,
        quantity: mockSelection.quantity,
      },
      upsells: upsells.map((u) => ({ id: u.id, title: u.title, price: u.price })),
      fileUrl: mockSelection.previewUrl,
      previewUrl: mockSelection.previewUrl,
      priceBreakdown: {
        unitPrice: mockSelection.unitPrice,
        totalPrice: mockSelection.totalPrice + upsellsTotal,
        upsellsTotal,
      },
      totalPrice: mockSelection.totalPrice + upsellsTotal,
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
