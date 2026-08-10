/**
 * Material Categories Types
 * Tree structure with dynamic field flags
 */

export interface MaterialCategory {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  
  // Dynamic field flags
  requiresThickness: boolean;
  requiresDensity: boolean;
  requiresPricePerSqm: boolean;
  requiresPricePerMeter: boolean;
  requiresPricePerUnit: boolean;
  requiresWastePercent: boolean;
  active: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  parent?: MaterialCategory | null;
  children?: MaterialCategory[];
  _count?: {
    children: number;
    materials: number;
  };
}

export interface MaterialCategoryTree extends MaterialCategory {
  children: MaterialCategoryTree[];
}

export interface CreateMaterialCategoryInput {
  name: string;
  description?: string;
  parentId?: string | null;
  requiresThickness?: boolean;
  requiresDensity?: boolean;
  requiresPricePerSqm?: boolean;
  requiresPricePerMeter?: boolean;
  requiresPricePerUnit?: boolean;
  requiresWastePercent?: boolean;
  active?: boolean;
}

export interface UpdateMaterialCategoryInput {
  name?: string;
  description?: string | null;
  parentId?: string | null;
  requiresThickness?: boolean;
  requiresDensity?: boolean;
  requiresPricePerSqm?: boolean;
  requiresPricePerMeter?: boolean;
  requiresPricePerUnit?: boolean;
  requiresWastePercent?: boolean;
  active?: boolean;
}

export class MaterialCategoryValidationError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
    this.name = 'MaterialCategoryValidationError';
  }
}
