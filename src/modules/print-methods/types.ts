export interface PrintMethod {
  id: string;
  name: string;
  type: string;
  costPerM2: number | null;
  costPerSheet: number | null;
  speed: string | null;
  maxWidth: number | null;
  maxHeight: number | null;
  description: string | null;
  active: boolean;
  materialIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrintMethodInput {
  name: string;
  type: string;
  costPerM2?: number;
  costPerSheet?: number;
  speed?: string;
  maxWidth?: number;
  maxHeight?: number;
  description?: string;
  active?: boolean;
  materialIds?: string[];
}

export interface UpdatePrintMethodInput {
  name?: string;
  type?: string;
  costPerM2?: number;
  costPerSheet?: number;
  speed?: string;
  maxWidth?: number;
  maxHeight?: number;
  description?: string;
  active?: boolean;
  materialIds?: string[];
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
