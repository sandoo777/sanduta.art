// Products Hook - React Hook pentru UI

'use client';

import { useState, useCallback } from 'react';
import { productsService } from '../services/ProductsService';
import {
  ProductsQueryParams,
  ProductsListResponse,
  ProductWithRelations,
  CreateProductDTO,
  UpdateProductDTO,
  ProductServiceResult,
} from '../types';

export function useProducts() {
  const [loading, setLoading] = useState(false);

  const getProducts = useCallback(
    async (params?: ProductsQueryParams): Promise<ProductServiceResult<ProductsListResponse>> => {
      setLoading(true);
      try {
        return await productsService.getProducts(params);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getProduct = useCallback(
    async (id: string): Promise<ProductServiceResult<ProductWithRelations>> => {
      setLoading(true);
      try {
        return await productsService.getProductById(id);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createProduct = useCallback(
    async (data: CreateProductDTO): Promise<ProductServiceResult> => {
      setLoading(true);
      try {
        return await productsService.createProduct(data);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateProduct = useCallback(
    async (id: string, updates: UpdateProductDTO): Promise<ProductServiceResult> => {
      setLoading(true);
      try {
        return await productsService.updateProduct(id, updates);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<ProductServiceResult> => {
      setLoading(true);
      try {
        return await productsService.deleteProduct(id);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
