'use client';

/**
 * Hook pentru obținere categorii cu ierarhie
 * Type-safe cu CategoryWithChildren din @/types/models
 */

import { useState, useEffect } from 'react';
import { Category, CategoryWithChildren } from '@/types/models';

export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data: Category[] = await response.json();
      
      // Build hierarchy - type-safe with CategoryWithChildren
      const categoryMap = new Map<string, CategoryWithChildren>();
      const rootCategories: CategoryWithChildren[] = [];

      // First pass: create map
      data.forEach((cat) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      // Second pass: build hierarchy - no casts needed
      data.forEach((cat) => {
        const category = categoryMap.get(cat.id);
        if (!category) return; // Type guard
        
        if (cat.parentId) {
          const parent = categoryMap.get(cat.parentId);
          if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(category);
          } else {
            // Parent not found - treat as root
            rootCategories.push(category);
          }
        } else {
          rootCategories.push(category);
        }
      });

      setCategories(rootCategories);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, refetch: fetchCategories };
}
