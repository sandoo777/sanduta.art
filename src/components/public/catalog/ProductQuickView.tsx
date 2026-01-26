'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';

interface ProductQuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
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
  };
}

export function ProductQuickView({
  isOpen,
  onClose,
  product,
}: ProductQuickViewProps) {
  const [imageHovered, setImageHovered] = useState(false);

  // Safe price calculation with fallback to 0
  const safeBasePrice = typeof product.basePrice === 'number' ? product.basePrice : 0;
  const safeDiscount = typeof product.discount === 'number' ? product.discount : 0;
  
  const finalPrice =
    safeDiscount > 0
      ? safeBasePrice * (1 - safeDiscount / 100)
      : safeBasePrice;

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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
        {/* Left Side - Image */}
        <div className="relative">
          {/* Badges */}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-0 left-0 z-10 flex flex-col gap-2">
              {product.badges.map((badge) => (
                <span
                  key={badge}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${badgeConfig[badge].color}`}
                >
                  {badgeConfig[badge].label}
                </span>
              ))}
            </div>
          )}

          {/* Product Image */}
          <div
            className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden"
            onMouseEnter={() => setImageHovered(true)}
            onMouseLeave={() => setImageHovered(false)}
          >
            <Image
              src={product.imageUrl || '/images/placeholder-product.jpg'}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-500 ${
                imageHovered ? 'scale-110' : 'scale-100'
              }`}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Additional Images Preview (Optional) */}
          <div className="flex gap-2 mt-4">
            <button className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-blue-600">
              <Image
                src={product.imageUrl || '/images/placeholder-product.jpg'}
                alt={`${product.name} - thumb`}
                width={64}
                height={64}
                className="object-cover rounded-lg"
              />
            </button>
          </div>
        </div>

        {/* Right Side - Info */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {product.name}
            </h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Price */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Preț de la</p>
            <div className="flex items-baseline gap-3">
              {safeDiscount > 0 && (
                <span className="text-lg text-gray-400 line-through">
                  {safeBasePrice.toFixed(2)} MDL
                </span>
              )}
              <span className="text-4xl font-bold text-gray-900">
                {finalPrice.toFixed(2)} MDL
              </span>
              {safeDiscount > 0 && (
                <span className="text-sm text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
                  -{safeDiscount}%
                </span>
              )}
            </div>
          </div>

          {/* Specifications */}
          {product.specifications && (
            <div className="mb-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Specificații rapide
              </h3>

              {/* Sizes */}
              {product.specifications.sizes && product.specifications.sizes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Dimensiuni disponibile:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.specifications.sizes.map((size) => (
                      <span
                        key={size}
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {product.specifications.materials &&
                product.specifications.materials.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Materiale:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.specifications.materials.map((material) => (
                        <span
                          key={material}
                          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Finishes */}
              {product.specifications.finishes &&
                product.specifications.finishes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Finisaje:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.specifications.finishes.map((finish) => (
                        <span
                          key={finish}
                          className="px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 rounded-lg"
                        >
                          {finish}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Production Time */}
              {product.specifications.productionTime && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Timp de producție:{' '}
                    <strong>{product.specifications.productionTime}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="mt-auto space-y-3">
            {/* Primary CTA */}
            <Link href={`/produse/${product.slug}`} onClick={onClose}>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
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
                Configurează produsul
              </button>
            </Link>

            {/* Secondary CTA */}
            <Link href={`/produse/${product.slug}`} onClick={onClose}>
              <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg border-2 border-gray-300 transition-colors flex items-center justify-center gap-2">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Vezi detalii complete
              </button>
            </Link>
          </div>

          {/* Trust Signals */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <svg
                  className="w-8 h-8 text-blue-600 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs text-gray-600">Calitate premium</span>
              </div>
              <div className="flex flex-col items-center">
                <svg
                  className="w-8 h-8 text-blue-600 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-xs text-gray-600">Livrare rapidă</span>
              </div>
              <div className="flex flex-col items-center">
                <svg
                  className="w-8 h-8 text-blue-600 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="text-xs text-gray-600">Suport dedicat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
