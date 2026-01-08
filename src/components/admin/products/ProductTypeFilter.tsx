'use client';

import { PRODUCT_TYPES } from '@/modules/products/types';
import type { ProductType } from '@/modules/products/types';

interface ProductTypeFilterProps {
  value: ProductType | 'all';
  onChange: (value: ProductType | 'all') => void;
}

export function ProductTypeFilter({ value, onChange }: ProductTypeFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ProductType | 'all')}
      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
    >
      <option value="all">Toate tipurile</option>
      {PRODUCT_TYPES.map((type) => (
        <option key={type.value} value={type.value}>
          {type.label}
        </option>
      ))}
    </select>
  );
}
