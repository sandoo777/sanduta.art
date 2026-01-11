'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: number;
  name: string;
  icon?: string;
  parentId?: number | null;
}

interface FiltersProps {
  onFilterChange: (filters: FilterState) => void;
  categories: Category[];
}

export interface FilterState {
  categoryId: number | null;
  minPrice: number;
  maxPrice: number;
  productTypes: string[];
  materials: string[];
}

const productTypeOptions = [
  'Flyere',
  'Cărți de vizită',
  'Bannere',
  'Postere',
  'Broșuri',
  'Cataloage',
  'Etichete',
  'Roll-up',
];

const materialOptions = [
  'Hârtie standard',
  'Hârtie premium',
  'Carton',
  'Vinil',
  'Canvas',
  'Material textil',
];

export function Filters({ onFilterChange, categories }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categoryId: null,
    minPrice: 0,
    maxPrice: 10000,
    productTypes: [],
    materials: [],
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      categoryId: null,
      minPrice: 0,
      maxPrice: 10000,
      productTypes: [],
      materials: [],
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const toggleProductType = (type: string) => {
    const updated = filters.productTypes.includes(type)
      ? filters.productTypes.filter((t) => t !== type)
      : [...filters.productTypes, type];
    handleFilterChange({ productTypes: updated });
  };

  const toggleMaterial = (material: string) => {
    const updated = filters.materials.includes(material)
      ? filters.materials.filter((m) => m !== material)
      : [...filters.materials, material];
    handleFilterChange({ materials: updated });
  };

  // Organizează categoriile în ierarhie
  const categoriesHierarchy = useMemo(() => {
    const parentCategories = categories.filter((cat) => !cat.parentId);
    return parentCategories.map((parent) => ({
      ...parent,
      children: categories.filter((cat) => cat.parentId === parent.id),
    }));
  }, [categories]);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filtre</h3>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Resetează
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Categorie
        </label>
        <select
          value={filters.categoryId || ''}
          onChange={(e) =>
            handleFilterChange({
              categoryId: e.target.value ? Number(e.target.value) : null,
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Toate categoriile</option>
          {categoriesHierarchy.map((parentCategory) => (
            <optgroup
              key={parentCategory.id}
              label={`${parentCategory.icon || ''} ${parentCategory.name}`}
            >
              <option value={parentCategory.id}>
                {parentCategory.name} (toate)
              </option>
              {parentCategory.children.map((subcat) => (
                <option key={subcat.id} value={subcat.id}>
                  └─ {subcat.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preț (MDL)
        </label>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500">Minim</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) =>
                handleFilterChange({ minPrice: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Maxim</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) =>
                handleFilterChange({ maxPrice: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Product Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tip produs
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {productTypeOptions.map((type) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.productTypes.includes(type)}
                onChange={() => toggleProductType(type)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Material
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {materialOptions.map((material) => (
            <label
              key={material}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.materials.includes(material)}
                onChange={() => toggleMaterial(material)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{material}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filtrează
          {(filters.categoryId ||
            filters.productTypes.length > 0 ||
            filters.materials.length > 0) && (
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {(filters.categoryId ? 1 : 0) +
                filters.productTypes.length +
                filters.materials.length}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <FilterContent />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 overflow-y-auto lg:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filtre</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <FilterContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
