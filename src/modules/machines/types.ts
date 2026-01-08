import { Printer, PrinterCheck, Scissors, Layers, Gauge, MoreHorizontal } from 'lucide-react';

export interface Machine {
  id: string;
  name: string;
  type: string;
  costPerHour?: number;
  speed?: string;
  maxWidth?: number;
  maxHeight?: number;
  compatibleMaterialIds: string[];
  compatiblePrintMethodIds: string[];
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMachineInput {
  name: string;
  type: string;
  costPerHour?: number;
  speed?: string;
  maxWidth?: number;
  maxHeight?: number;
  compatibleMaterialIds: string[];
  compatiblePrintMethodIds: string[];
  description?: string;
  active: boolean;
}

export interface UpdateMachineInput {
  name?: string;
  type?: string;
  costPerHour?: number;
  speed?: string;
  maxWidth?: number;
  maxHeight?: number;
  compatibleMaterialIds?: string[];
  compatiblePrintMethodIds?: string[];
  description?: string;
  active?: boolean;
}

export const MACHINE_TYPES = [
  { value: 'Digital Printer', label: 'Digital Printer', icon: Printer },
  { value: 'Offset Press', label: 'Offset Press', icon: PrinterCheck },
  { value: 'Large Format Printer', label: 'Large Format Printer', icon: Printer },
  { value: 'UV Flatbed', label: 'UV Flatbed', icon: Layers },
  { value: 'Laminator', label: 'Laminator', icon: Layers },
  { value: 'Cutter Plotter', label: 'Cutter Plotter', icon: Scissors },
  { value: 'Ghilotină', label: 'Ghilotină', icon: Scissors },
  { value: 'Altele', label: 'Altele', icon: MoreHorizontal },
] as const;
