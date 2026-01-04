'use client';

import { Edit, Trash2 } from 'lucide-react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
    _count: {
      products: number;
    };
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const color = category.color || '#3B82F6';
  const icon = category.icon || '📦';

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border border-gray-100">
      {/* Icon and Color */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${color}20` }}
        >
          <span>{icon}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
            title="Edit category"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {category.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          /{category.slug}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
            <span className="text-xs text-gray-500">{color}</span>
          </div>
          
          <span className="text-sm font-medium text-gray-600">
            {category._count.products} {category._count.products === 1 ? 'product' : 'products'}
          </span>
        </div>
      </div>
    </div>
  );
}
