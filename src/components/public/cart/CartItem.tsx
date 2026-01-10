'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Edit2, Copy } from 'lucide-react';
import type { CartItem as CartItemType } from '@/modules/cart/cartStore';
import { QuantitySelector } from './QuantitySelector';


interface CartItemProps {
  item: CartItemType;
  onRemove: (itemId: string) => void;
  onDuplicate: (itemId: string) => void;
  onQuantityChange?: (itemId: string, newQty: number) => void;
}

export function CartItem({ item, onRemove, onDuplicate, onQuantityChange }: CartItemProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Preview Image */}
        <div className="flex-shrink-0">
          <div className="relative w-full md:w-32 h-48 md:h-32 bg-gray-100 rounded-lg overflow-hidden">
            {item.previewUrl ? (
              <Image
                src={item.previewUrl}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Adăugat la {new Date(item.addedAt).toLocaleDateString('ro-RO')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Preț per bucată</div>
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(item.totalPrice / item.specifications.quantity)}
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#0066FF] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Dimensiuni</div>
                <div className="text-sm font-medium text-gray-900">
                  {item.specifications.dimensions.width} × {item.specifications.dimensions.height}
                  {item.specifications.dimensions.depth && ` × ${item.specifications.dimensions.depth}`} cm
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#0066FF] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Material</div>
                <div className="text-sm font-medium text-gray-900">{item.specifications.material.name}</div>
              </div>
            </div>

            {item.specifications.finishes && item.specifications.finishes.length > 0 && (
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#0066FF] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Finisaje</div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.specifications.finishes.map(f => f.name).join(', ')}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#0066FF] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Timp producție</div>
                <div className="text-sm font-medium text-gray-900">{item.specifications.productionTime}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#0066FF] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Cantitate</div>
                <QuantitySelector
                  value={item.specifications.quantity}
                  min={1}
                  max={999}
                  onChange={(qty) => onQuantityChange?.(item.id, qty)}
                />
              </div>
            </div>
          </div>

          {/* Upsells */}
          {item.upsells.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Opțiuni adiționale</div>
              <div className="flex flex-wrap gap-2">
                {item.upsells.map((upsell) => (
                  <span
                    key={upsell.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FACC15] text-gray-900"
                  >
                    {upsell.name} (+{formatPrice(upsell.price)})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Detalii preț</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Preț de bază</span>
                <span className="text-gray-900">{formatPrice(item.priceBreakdown.basePrice)}</span>
              </div>
              {item.priceBreakdown.materialCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost material</span>
                  <span className="text-gray-900">{formatPrice(item.priceBreakdown.materialCost)}</span>
                </div>
              )}
              {item.priceBreakdown.finishingCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost finisaje</span>
                  <span className="text-gray-900">{formatPrice(item.priceBreakdown.finishingCost)}</span>
                </div>
              )}
              {item.priceBreakdown.upsellsCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Opțiuni adiționale</span>
                  <span className="text-gray-900">{formatPrice(item.priceBreakdown.upsellsCost)}</span>
                </div>
              )}
              {item.priceBreakdown.quantityDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Reducere cantitate</span>
                  <span>-{formatPrice(item.priceBreakdown.quantityDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-[#0066FF]">{formatPrice(item.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/produse/${item.productSlug}/configure?editItemId=${item.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0066FF] text-white rounded-lg hover:bg-[#0052CC] transition-colors text-sm font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Editează configurarea
            </Link>
            
            <button
              onClick={() => onDuplicate(item.id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Copy className="w-4 h-4" />
              Duplică
            </button>
            
            <button
              onClick={() => onRemove(item.id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Șterge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
