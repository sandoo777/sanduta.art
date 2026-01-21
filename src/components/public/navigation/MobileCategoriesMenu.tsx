'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CategoryNav {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  parentId?: number | null;
}

interface MobileCategoriesMenuProps {
  onLinkClick: () => void;
}

export function MobileCategoriesMenu({ onLinkClick }: MobileCategoriesMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (_error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const parentCategories = categories.filter((cat) => !cat.parentId);
  
  const getSubcategories = (parentId: number) => {
    return categories.filter((cat) => cat.parentId === parentId);
  };

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-100 pt-4">
      {/* Main categories toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-base font-medium text-gray-700 transition-colors hover:text-primary"
      >
        <span>Categorii</span>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Categories list */}
      {isExpanded && (
        <div className="mt-4 space-y-2 pl-4">
          {parentCategories.map((parent) => {
            const subcategories = getSubcategories(parent.id);
            const isParentExpanded = expandedCategories.has(parent.id);

            return (
              <div key={parent.id}>
                {/* Parent category */}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/produse/${parent.slug}`}
                    onClick={onLinkClick}
                    className="flex items-center space-x-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-primary"
                  >
                    {parent.icon && <span>{parent.icon}</span>}
                    <span>{parent.name}</span>
                  </Link>
                  
                  {subcategories.length > 0 && (
                    <button
                      onClick={() => toggleCategory(parent.id)}
                      className="p-2 text-gray-500 hover:text-primary"
                      aria-label={`Toggle ${parent.name} subcategories`}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          isParentExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                {isParentExpanded && subcategories.length > 0 && (
                  <div className="ml-6 space-y-1 border-l-2 border-gray-100 pl-4">
                    {subcategories.map((child) => (
                      <Link
                        key={child.id}
                        href={`/produse/${parent.slug}/${child.slug}`}
                        onClick={onLinkClick}
                        className="block py-1.5 text-sm text-gray-600 transition-colors hover:text-primary"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
