export type Unit = 'pcs' | 'm' | 'm2' | 'kg';

export interface Material {
  id: string;
  sku: string;
  name: string;
  categoryId?: string;
  purchasePrice: number;
  sellPrice: number;
  unit: Unit;
  wastePercent: number;
  compatiblePrintMethods: string[];
  active: boolean;
}