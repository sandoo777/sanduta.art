'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  const finalPrice = discount > 0 ? basePrice * (1 - discount / 100) : basePrice;

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden"
      >
        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className={`px-2 py-1 text-xs font-semibold rounded ${badgeConfig[badge].color}`}
              >
                {badgeConfig[badge].label}
              </span>
            ))}
          </div>
        )}

        {/* Quick View Button */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => setQuickViewOpen(true)}
            className="p-2 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg shadow-lg transition-colors"
            title="Previzualizare rapidă"
            aria-label="Previzualizare rapidă"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
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
      <div className="p-5">
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
              {discount > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  {basePrice.toFixed(2)} MDL
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
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Configurează
          </button>
        </Link>
      </div>
    </motion.div>

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
