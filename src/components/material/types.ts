import type { MaterialCategoryTree } from '@/modules/material-categories/types';

export type SupplierOption = {
  id: string;
  name: string;
};

export type SupplierLinkState = {
  supplierId: string;
};

export type FormatOption = {
  id: string;
  name: string;
  category?: string | null;
  category_code?: string | null;
  width_mm: number;
  height_mm: number | null;
  unit?: string;
};

export type FormatCategoryOption = {
  id: string;
  code: string;
  name: string;
  enabled?: boolean;
};

export type CategoryChangeHandler = (categoryId: string, category: MaterialCategoryTree | null) => void;
