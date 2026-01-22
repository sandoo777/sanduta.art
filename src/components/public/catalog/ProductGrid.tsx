'use client';

import { EmptyState } from '@/components/ui';
import { Package } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface ProductView {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  badges?: ('bestseller' | 'promo' | 'eco')[];
  discount?: number;
  specifications?: {
    sizes?: string[];
    materials?: string[];
    finishes?: string[];
    productionTime?: string;
  };
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export function ProductGrid({ products, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
          >
            <div className="w-full h-64 bg-gray-200" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-10 bg-gray-200 rounded w-1/2" />
              <div className="h-12 bg-gray-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-16 w-16" />}
        title="Niciun produs găsit"
        description="Nu am găsit produse care să corespundă criteriilor tale de căutare. Încearcă să modifici filtrele sau să verifici din nou."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          slug={product.slug}
          description={product.description}
          imageUrl={product.imageUrl}
          basePrice={product.basePrice}
          badges={product.badges}
          discount={product.discount}
          specifications={product.specifications}
        />
      ))}
    </div>
  );
}
