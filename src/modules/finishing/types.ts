import { Scissors, Sparkles, FoldVertical, Paperclip, Circle, CornerDownRight, Layers, MoreHorizontal } from 'lucide-react';

export interface FinishingOperation {
  id: string;
  name: string;
  type: string;
  costFix?: number;
  costPerUnit?: number;
  costPerM2?: number;
  timeSeconds?: number;
  compatibleMaterialIds: string[];
  compatiblePrintMethodIds: string[];
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFinishingOperationInput {
  name: string;
  type: string;
  costFix?: number;
  costPerUnit?: number;
  costPerM2?: number;
  timeSeconds?: number;
  compatibleMaterialIds: string[];
  compatiblePrintMethodIds: string[];
  description?: string;
  active: boolean;
}

export interface UpdateFinishingOperationInput {
  name?: string;
  type?: string;
  costFix?: number;
  costPerUnit?: number;
  costPerM2?: number;
  timeSeconds?: number;
  compatibleMaterialIds?: string[];
  compatiblePrintMethodIds?: string[];
  description?: string;
  active?: boolean;
}

export const FINISHING_OPERATION_TYPES = [
  { value: 'Tăiere', label: 'Tăiere', icon: Scissors },
  { value: 'Laminare', label: 'Laminare', icon: Layers },
  { value: 'Băgăuire', label: 'Băgăuire', icon: Circle },
  { value: 'Capsare', label: 'Capsare', icon: Paperclip },
  { value: 'Perforare', label: 'Perforare', icon: Circle },
  { value: 'Colț rotunjit', label: 'Colț rotunjit', icon: CornerDownRight },
  { value: 'Îndoire', label: 'Îndoire', icon: FoldVertical },
  { value: 'Altele', label: 'Altele', icon: MoreHorizontal },
] as const;
