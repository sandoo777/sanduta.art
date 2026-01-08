'use client';

import Image from 'next/image';
import { MoreVertical, Edit, Copy, Power } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { Product } from '@/modules/products/types';
import { PRODUCT_TYPES } from '@/modules/products/types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDuplicate: (id: string) => void;
  onToggleStatus: (id: string, active: boolean) => void;
}

export function ProductCard({
  product,
  onEdit,
  onDuplicate,
  onToggleStatus,
}: ProductCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const thumbnail = product.images?.[0]?.url || '/placeholder-product.svg';
  const productType = PRODUCT_TYPES.find((t) => t.value === product.type);

  const getBadgeVariant = (color: string) => {
    switch (color) {
      case 'blue':
        return 'primary';
      case 'purple':
        return 'info';
      case 'gray':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={thumbnail}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header with menu */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-2">
              {product.name}
            </h3>
            {product.sku && (
              <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
            )}
          </div>

          {/* Actions menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      onEdit(product);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4" />
                    Editează
                  </button>
                  <button
                    onClick={() => {
                      onDuplicate(product.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4" />
                    Duplică
                  </button>
                  <button
                    onClick={() => {
                      onToggleStatus(product.id, !product.active);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Power className="h-4 w-4" />
                    {product.active ? 'Dezactivează' : 'Activează'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Category */}
        {product.category && (
          <div className="flex items-center gap-1 mb-3">
            <span className="text-lg">{product.category.icon || '📦'}</span>
            <span className="text-sm text-gray-600">{product.category.name}</span>
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {productType && (
            <Badge variant={getBadgeVariant(productType.color)}>
              {productType.label}
            </Badge>
          )}
          <Badge variant={product.active ? 'success' : 'danger'}>
            {product.active ? 'Activ' : 'Inactiv'}
          </Badge>
        </div>

        {/* Price */}
        {product.price > 0 && (
          <div className="text-lg font-bold text-gray-900">
            {Number(product.price).toFixed(2)} MDL
          </div>
        )}
      </div>
    </div>
  );
}
