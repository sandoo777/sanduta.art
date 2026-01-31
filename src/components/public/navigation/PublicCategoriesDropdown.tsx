'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import { CategoryTreeNode } from '@/lib/categoryTree';
import Link from 'next/link';

interface PublicCategoriesDropdownProps {
  categories: CategoryTreeNode[];
}

export function PublicCategoriesDropdown({ categories }: PublicCategoriesDropdownProps) {
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
            ? 'bg-primary text-white shadow-lg shadow-primary/30' 
            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-primary/50'
        }`}
        aria-label="Categorii produse"
        aria-expanded={isOpen}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-[calc(100vh-120px)] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-blue-50 flex-shrink-0">
            <h3 className="text-base font-bold text-gray-900">Toate Categoriile</h3>
            <p className="text-xs text-gray-600 mt-1">Explorează produsele noastre</p>
          </div>

          <div className="py-2 overflow-y-auto flex-1">
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

          <div className="p-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <Link
              href="/produse"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-sm"
            >
              Vezi toate produsele
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
      onMouseLeave={() => setHoveredCategory(null)}
    >
      <Link
        href={`/produse?category=${category.slug}`}
        onClick={onClose}
        onMouseEnter={() => hasChildren && setHoveredCategory(category.id)}
        className={`
          flex items-center justify-between px-4 py-3 mx-2 rounded-lg transition-all duration-150
          ${isHovered 
            ? 'bg-primary/10 text-primary' 
            : 'text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
          <p className="text-sm font-semibold truncate">{category.name}</p>
        </div>

        {/* Arrow for children */}
        {hasChildren && (
          <ChevronRight 
            className={`flex-shrink-0 w-4 h-4 transition-all ${
              isHovered ? 'text-primary translate-x-0.5' : 'text-gray-400'
            }`}
          />
        )}
      </Link>

      {/* Subcategories Submenu */}
      {hasChildren && isHovered && (
        <div 
          className="fixed w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-[60] max-h-[400px] overflow-y-auto"
          style={{
            left: '340px',
            top: 'auto'
          }}
          onMouseEnter={() => setHoveredCategory(category.id)}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-primary/10 to-blue-50">
            <p className="text-sm font-bold text-gray-900">
              {category.name}
            </p>
          </div>

          <div className="py-2">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/produse?category=${child.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary transition group"
              >
                <p className="text-sm font-medium truncate group-hover:text-primary flex-1">{child.name}</p>

                {/* Indicator for nested children */}
                {child.children && child.children.length > 0 && (
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <span className="text-xs text-gray-400 font-medium">
                      +{child.children.length}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
