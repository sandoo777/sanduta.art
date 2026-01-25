'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ProductQuickView } from './ProductQuickView';

interface ProductCardProps {
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

export function ProductCard({
  id,
  name,
  slug,
  description,
  imageUrl,
  basePrice,
  badges = [],
  discount = 0,
  specifications,
}: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const safeBasePrice = typeof basePrice === 'number' && !isNaN(basePrice) ? basePrice : 0;
  const safeDiscount = typeof discount === 'number' && !isNaN(discount) ? discount : 0;
  const finalPrice = safeDiscount > 0 ? safeBasePrice * (1 - safeDiscount / 100) : safeBasePrice;

  const badgeConfig = {
    bestseller: {
      label: 'Best Seller',
      color: 'bg-blue-600 text-white',
    },
    promo: {
      label: 'Promoție',
      color: 'bg-yellow-400 text-gray-900',
    },
    eco: {
      label: 'Eco',
      color: 'bg-green-600 text-white',
    },
  };

  return (
    <>
      <Card hover className="group relative overflow-hidden">
        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {badges.map((badge) => (
              <Badge key={badge} value={badge} />
            ))}
          </div>
        )}

        {/* Quick View Button */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setQuickViewOpen(true)}
            title="Previzualizare rapidă"
            aria-label="Previzualizare rapidă"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* Image */}
        <Link href={`/produse/${slug}`}>
          <div className="relative w-full h-64 overflow-hidden bg-gray-100">
            <Image
              src={imageUrl || '/images/placeholder-product.jpg'}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
      </Link>

        {/* Content */}
        <CardContent className="p-5">
          <Link href={`/produse/${slug}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {name}
            </h3>
          </Link>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">De la</p>
              <div className="flex items-baseline gap-2">
                {safeDiscount > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    {safeBasePrice.toFixed(2)} MDL
                  </span>
                )}
                <span className="text-xl font-bold text-gray-900">
                  {finalPrice.toFixed(2)} MDL
                </span>
              </div>
              {discount > 0 && (
                <span className="text-xs text-red-600 font-semibold">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          {/* Button */}
          <Link href={`/produse/${slug}`}>
            <Button variant="primary" fullWidth>
              <Plus className="w-5 h-5" />
              Configurează
            </Button>
          </Link>
        </CardContent>
      </Card>

    {/* Quick View Modal */}
    <ProductQuickView
      isOpen={quickViewOpen}
      onClose={() => setQuickViewOpen(false)}
      product={{
        id,
        name,
        slug,
        description,
        imageUrl,
        basePrice,
        badges,
        discount,
        specifications,
      }}
    />
  </>
  );
}
