export interface Material {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  stock: number;
  minStock: number;
  costPerUnit: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lowStock?: boolean;
  totalConsumption?: number;
}

export interface MaterialUsage {
  id: string;
  materialId: string;
  jobId: string;
  quantity: number;
  createdAt: string;
  job?: {
    id: string;
    name: string;
    status: string;
    priority: string;
    order: {
      id: string;
      customerName: string;
      customerEmail: string;
    };
  };
}

export interface MaterialWithDetails extends Material {
  consumption: MaterialUsage[];
}

export interface CreateMaterialInput {
  name: string;
  sku?: string;
  unit: string;
  stock?: number;
  minStock?: number;
  costPerUnit?: number;
  notes?: string;
}

export interface UpdateMaterialInput {
  name?: string;
  sku?: string;
  unit?: string;
  stock?: number;
  minStock?: number;
  costPerUnit?: number;
  notes?: string;
}

export interface ConsumeMaterialInput {
  jobId: string;
  quantity: number;
}

export interface MaterialFilters {
  search?: string;
  lowStock?: boolean;
  unit?: string;
}
