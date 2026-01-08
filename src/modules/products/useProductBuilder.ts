'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { FullProduct, CreateFullProductInput } from './productBuilder.types';

export function useProductBuilder() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchFullProduct = async (id: string): Promise<FullProduct> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${id}/full`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Eroare la încărcarea produsului');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createFullProduct = async (
    input: CreateFullProductInput
  ): Promise<FullProduct> => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/products/full', {
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
    } catch (error) {
      console.error('Error creating product:', error);
      const message = error instanceof Error ? error.message : 'Eroare la crearea produsului';
      toast.error(message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateFullProduct = async (
    id: string,
    input: Partial<CreateFullProductInput>
  ): Promise<FullProduct> => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${id}/full`, {
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
    } catch (error) {
      console.error('Error updating product:', error);
      const message = error instanceof Error ? error.message : 'Eroare la actualizarea produsului';
      toast.error(message);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const validateProduct = (data: Partial<CreateFullProductInput>): string[] => {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Numele produsului este obligatoriu');
    }

    if (!data.slug?.trim()) {
      errors.push('Slug-ul este obligatoriu');
    }

    if (!data.categoryId) {
      errors.push('Categoria este obligatorie');
    }

    if (data.type === 'CONFIGURABLE') {
      if (!data.compatibleMaterials || data.compatibleMaterials.length === 0) {
        errors.push('Produsele configurabile necesită cel puțin un material');
      }
    }

    if (data.pricing) {
      if (data.pricing.basePrice < 0) {
        errors.push('Prețul de bază nu poate fi negativ');
      }

      if (data.pricing.priceBreaks && data.pricing.priceBreaks.length > 0) {
        const sorted = [...data.pricing.priceBreaks].sort(
          (a, b) => a.minQuantity - b.minQuantity
        );
        for (let i = 0; i < sorted.length; i++) {
          const pb = sorted[i];
          if (pb.minQuantity < 0) {
            errors.push('Cantitatea minimă nu poate fi negativă');
          }
          if (pb.maxQuantity !== null && pb.maxQuantity < pb.minQuantity) {
            errors.push('Cantitatea maximă trebuie să fie mai mare decât cea minimă');
          }
          if (pb.pricePerUnit < 0) {
            errors.push('Prețul per unitate nu poate fi negativ');
          }
        }
      }
    }

    return errors;
  };

  const calculatePreviewPrice = (
    pricing: CreateFullProductInput['pricing'],
    quantity: number = 1,
    area?: number
  ): number => {
    let price = pricing.basePrice;

    // Apply price breaks
    if (pricing.priceBreaks && pricing.priceBreaks.length > 0) {
      const applicableBreak = pricing.priceBreaks.find(
        (pb) =>
          quantity >= pb.minQuantity &&
          (pb.maxQuantity === null || quantity <= pb.maxQuantity)
      );
      if (applicableBreak) {
        price = applicableBreak.pricePerUnit;
      }
    }

    // Apply pricing type
    if (pricing.type === 'per_sqm' && area) {
      price = price * area;
    } else if (pricing.type === 'per_unit' || pricing.type === 'per_weight') {
      price = price * quantity;
    }

    // Apply discounts
    if (pricing.discounts) {
      for (const discount of pricing.discounts) {
        if (!discount.minQuantity || quantity >= discount.minQuantity) {
          if (discount.type === 'percentage') {
            price = price * (1 - discount.value / 100);
          } else {
            price = price - discount.value;
          }
        }
      }
    }

    return Math.max(0, price);
  };

  return {
    loading,
    saving,
    fetchFullProduct,
    createFullProduct,
    updateFullProduct,
    validateProduct,
    calculatePreviewPrice,
  };
}
