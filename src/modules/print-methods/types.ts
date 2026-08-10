/**
 * TypeScript types for Print Methods module
 */

// Basic Print Method interface
export interface PrintMethod {
  id: string;
  name: string;
  type: string;
  baseCost: number | null;
  costPerM2: number | null;
  costPerSheet: number | null;
  speed: string | null;
  isOutsourced: boolean;
  costFurnizorPerM2: number | null;
  costFurnizorPerUnit: number | null;
  termenFurnizor: string | null;
  markup: number | null;
  colorMode: string | null;
  maxWidth: number | null;
  maxHeight: number | null;
  description: string | null;
  active: boolean;
  materialIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Print Method with relations
export interface PrintMethodWithRelations extends PrintMethod {
  compatibleMaterials?: Array<{
    id: string;
    name: string;
    unit: string;
    active: boolean;
  }>;
  compatibleEquipment?: Array<{
    id: string;
    name: string;
    type: string;
    active: boolean;
  }>;
  consumables?: PrintMethodConsumable[];
  _count?: {
    compatibleMaterials: number;
    compatibleEquipment: number;
    consumables: number;
  };
}

// Print Method Consumable interface
export interface PrintMethodConsumable {
  id: string;
  printMethodId: string;
  materialId: string;
  costPerSqm: number | null;
  costPerJob: number | null;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  material?: {
    id: string;
    name: string;
    unit: string;
    stock: number;
    pricePerUnit: number | null;
  };
}

export interface CreatePrintMethodInput {
  name: string;
  type: string;
  baseCost?: number;
  costPerM2?: number;
  costPerSheet?: number;
  speed?: string;
  isOutsourced?: boolean;
  costFurnizorPerM2?: number | null;
  costFurnizorPerUnit?: number | null;
  termenFurnizor?: string | null;
  markup?: number | null;
  colorMode?: string;
  maxWidth?: number;
  maxHeight?: number;
  description?: string;
  active?: boolean;
  compatibleMaterialIds?: string[];
  compatibleEquipmentIds?: string[];
}

export interface UpdatePrintMethodInput {
  name?: string;
  type?: string;
  baseCost?: number;
  costPerM2?: number;
  costPerSheet?: number;
  speed?: string;
  isOutsourced?: boolean;
  costFurnizorPerM2?: number | null;
  costFurnizorPerUnit?: number | null;
  termenFurnizor?: string | null;
  markup?: number | null;
  colorMode?: string;
  maxWidth?: number;
  maxHeight?: number;
  description?: string;
  active?: boolean;
  compatibleMaterialIds?: string[];
  compatibleEquipmentIds?: string[];
  materialIds?: string[];
}

// Consumable request types
export interface CreatePrintMethodConsumableInput {
  materialId: string;
  costPerSqm?: number;
  costPerJob?: number;
  active?: boolean;
  notes?: string;
}

export interface UpdatePrintMethodConsumableInput {
  costPerSqm?: number;
  costPerJob?: number;
  active?: boolean;
  notes?: string;
}

export interface PrintMethodFilters {
  search?: string;
  type?: string;
  active?: boolean;
}

export const PRINT_METHOD_TYPES = [
  { value: 'Digital', label: 'Digital', icon: '💻' },
  { value: 'Offset', label: 'Offset', icon: '🖨️' },
  { value: 'Inkjet', label: 'Inkjet', icon: '💧' },
  { value: 'UV', label: 'UV', icon: '☀️' },
  { value: 'Latex', label: 'Latex', icon: '🎨' },
  { value: 'Serigrafie', label: 'Serigrafie', icon: '🧵' },
  { value: 'Other', label: 'Altele', icon: '⚙️' },
] as const;
