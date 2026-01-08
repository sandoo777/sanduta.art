'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
} from './types';

export function useProducts() {
  const [loading, setLoading] = useState(false);

  const getProducts = async (): Promise<Product[]> => {
    try {
      const response = await fetch('/api/admin/products', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Eroare la încărcarea produselor');
      throw error;
    }
  };

  const createProduct = async (input: CreateProductInput): Promise<Product> => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }

      const product = await response.json();
      toast.success('Produs creat cu succes');
      return product;
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Eroare la crearea produsului');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    id: string,
    input: UpdateProductInput
  ): Promise<Product> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
      }

      const product = await response.json();
      toast.success('Produs actualizat cu succes');
      return product;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Eroare la actualizarea produsului');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast.success('Produs șters cu succes');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Eroare la ștergerea produsului');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const duplicateProduct = async (id: string): Promise<Product> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${id}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate product');
      }

      const product = await response.json();
      toast.success('Produs duplicat cu succes');
      return product;
    } catch (error) {
      console.error('Error duplicating product:', error);
      toast.error('Eroare la duplicarea produsului');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (
    id: string,
    active: boolean
  ): Promise<Product> => {
    return updateProduct(id, { active });
  };

  const searchProducts = (products: Product[], searchTerm: string): Product[] => {
    if (!searchTerm.trim()) return products;

    const term = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term)
    );
  };

  const filterProducts = (
    products: Product[],
    filters: ProductFilters
  ): Product[] => {
    let filtered = [...products];

    if (filters.search) {
      filtered = searchProducts(filtered, filters.search);
    }

    if (filters.categoryId && filters.categoryId !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === filters.categoryId);
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter((p) => p.type === filters.type);
    }

    if (filters.activeOnly) {
      filtered = filtered.filter((p) => p.active);
    }

    return filtered;
  };

  return {
    loading,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    toggleProductStatus,
    searchProducts,
    filterProducts,
  };
}
