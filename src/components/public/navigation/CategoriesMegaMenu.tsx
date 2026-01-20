'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  parentId?: number | null;
  _count?: {
    products: number;
  };
}

interface CategoriesHierarchy {
  parent: Category;
  children: Category[];
}

export function CategoriesMegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (_error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Organize categories into hierarchy
  const categoriesHierarchy: CategoriesHierarchy[] = categories
    .filter((cat) => !cat.parentId)
    .map((parent) => ({
      parent,
      children: categories.filter((cat) => cat.parentId === parent.id),
    }));

  if (loading || categories.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        onMouseEnter={() => setIsOpen(true)}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
          isOpen ? 'text-primary' : 'text-gray-700 hover:text-primary'
        }`}
      >
        <span>Categorii</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Mega menu dropdown */}
      {isOpen && (
        <div
          onMouseLeave={() => setIsOpen(false)}
          className="absolute left-0 top-full z-50 mt-2 w-screen max-w-6xl rounded-lg border border-gray-200 bg-white shadow-xl"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="p-6">
            {/* Grid of categories */}
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {categoriesHierarchy.map(({ parent, children }) => (
                <div key={parent.id} className="space-y-3">
                  {/* Parent category */}
                  <Link
                    href={`/produse/${parent.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center space-x-2 font-semibold text-secondary transition-colors hover:text-primary"
                  >
                    {parent.icon && (
                      <span className="text-xl">{parent.icon}</span>
                    )}
                    <span className="text-sm">{parent.name}</span>
                  </Link>

                  {/* Subcategories */}
                  {children.length > 0 && (
                    <ul className="space-y-2 border-l-2 border-gray-100 pl-4">
                      {children.slice(0, 6).map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/produse/${parent.slug}/${child.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="group flex items-center justify-between text-sm text-gray-600 transition-colors hover:text-primary"
                          >
                            <span>{child.name}</span>
                            {child._count && child._count.products > 0 && (
                              <span className="text-xs text-gray-400">
                                ({child._count.products})
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                      {children.length > 6 && (
                        <li>
                          <Link
                            href={`/produse/${parent.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Vezi toate ({children.length})
                          </Link>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <Link
                href="/products"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center space-x-2 text-sm font-medium text-primary hover:underline"
              >
                <span>Vezi toate produsele</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
