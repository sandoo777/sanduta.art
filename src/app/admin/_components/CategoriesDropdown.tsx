'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import { CategoryTreeNode } from '@/lib/categoryTree';
import Link from 'next/link';

interface CategoriesDropdownProps {
  categories: CategoryTreeNode[];
}

export function CategoriesDropdown({ categories }: CategoriesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredCategory(null);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setHoveredCategory(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hamburger Button */}
      <button
        onClick={handleToggle}
        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
          isOpen 
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-purple-300'
        }`}
        aria-label="Categorii"
        aria-expanded={isOpen}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-12 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Toate Categoriile</h3>
            <p className="text-xs text-gray-500 mt-0.5">Selectați o categorie pentru a vedea subcategoriile</p>
          </div>

          <div className="py-2">
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                hoveredCategory={hoveredCategory}
                setHoveredCategory={setHoveredCategory}
                onClose={() => {
                  setIsOpen(false);
                  setHoveredCategory(null);
                }}
              />
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <Link
              href="/admin/categories"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
            >
              Gestionează Categoriile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryItemProps {
  category: CategoryTreeNode;
  hoveredCategory: string | null;
  setHoveredCategory: (id: string | null) => void;
  onClose: () => void;
}

function CategoryItem({ 
  category, 
  hoveredCategory, 
  setHoveredCategory,
  onClose 
}: CategoryItemProps) {
  const hasChildren = category.children && category.children.length > 0;
  const isHovered = hoveredCategory === category.id;

  return (
    <div 
      className="relative"
      onMouseEnter={() => hasChildren && setHoveredCategory(category.id)}
      onMouseLeave={() => hasChildren && setHoveredCategory(null)}
    >
      <Link
        href={`/admin/categories?categoryId=${category.id}`}
        onClick={onClose}
        className={`
          flex items-center justify-between px-4 py-2.5 mx-2 rounded-lg transition-all duration-150
          ${isHovered 
            ? 'bg-purple-50 text-purple-700' 
            : 'text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon */}
          <div 
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ backgroundColor: category.color || '#3B82F6' }}
          >
            <span className="text-white">{category.icon || '📦'}</span>
          </div>

          {/* Name and count */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{category.name}</p>
            <p className="text-xs text-gray-500">
              {category._count?.products ?? 0} produse
            </p>
          </div>
        </div>

        {/* Arrow for children */}
        {hasChildren && (
          <ChevronRight 
            className={`flex-shrink-0 w-4 h-4 transition-transform ${
              isHovered ? 'text-purple-600' : 'text-gray-400'
            }`}
          />
        )}
      </Link>

      {/* Subcategories Submenu */}
      {hasChildren && isHovered && (
        <div 
          className="absolute left-full top-0 ml-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[400px] overflow-y-auto"
          onMouseEnter={() => setHoveredCategory(category.id)}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <div className="p-2 border-b border-gray-100 bg-purple-50">
            <p className="text-xs font-semibold text-purple-900">
              Subcategorii din {category.name}
            </p>
          </div>

          <div className="py-2">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/admin/categories?categoryId=${child.id}`}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <div 
                  className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs"
                  style={{ backgroundColor: child.color || '#3B82F6' }}
                >
                  <span className="text-white">{child.icon || '📦'}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{child.name}</p>
                  <p className="text-xs text-gray-500">
                    {child._count?.products ?? 0} produse
                  </p>
                </div>

                {/* Indicator for nested children */}
                {child.children && child.children.length > 0 && (
                  <span className="flex-shrink-0 text-xs text-gray-400 font-medium">
                    +{child.children.length}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
