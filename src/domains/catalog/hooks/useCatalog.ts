// Catalog Hook - React Hook pentru catalog public

'use client';

import { useState } from 'react';
import { catalogService } from '../services/CatalogService';
import { CatalogQueryParams, CatalogResponse, CategoryWithProducts } from '../types';

export function useCatalog() {
  const [loading, setLoading] = useState(false);

  /**
   * Obține produse pentru catalog
   */
  const getProducts = async (
    params: CatalogQueryParams = {}
  ): Promise<CatalogResponse> => {
    setLoading(true);
    try {
      return await catalogService.getProducts(params);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obține categorii pentru meniu
   */
  const getCategories = async (): Promise<CategoryWithProducts[]> => {
    setLoading(true);
    try {
      return await catalogService.getCategories();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obține categorie după slug
   */
  const getCategoryBySlug = async (
    slug: string
  ): Promise<CategoryWithProducts | null> => {
    setLoading(true);
    try {
      return await catalogService.getCategoryBySlug(slug);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getProducts,
    getCategories,
    getCategoryBySlug,
  };
}
