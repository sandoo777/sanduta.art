'use client';

/**
 * Hook pentru obținere categorii cu ierarhie
 */

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
  order: number;
}

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

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
      
      // Construim ierarhia: categorii principale cu copiii lor
      const categoryMap = new Map<string, CategoryWithChildren>();
      const rootCategories: CategoryWithChildren[] = [];

      // Prima tură: cream map-ul
      data.forEach((cat) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      // A doua tură: construim ierarhia
      data.forEach((cat) => {
        const category = categoryMap.get(cat.id)!;
        
        if (cat.parentId) {
          // Este subcategorie
          const parent = categoryMap.get(cat.parentId);
          if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(category);
          }
        } else {
          // Este categorie principală
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
