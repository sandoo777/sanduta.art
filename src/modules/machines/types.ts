import { Printer, PrinterCheck, Scissors, Layers, Gauge, MoreHorizontal, Cpu, Zap } from 'lucide-react';

export type MachineStatus = 'AVAILABLE' | 'BUSY' | 'MAINTENANCE';
export type EquipmentType = 'LARGE_FORMAT' | 'DIGITAL' | 'HOURLY';

export const EQUIPMENT_TYPE_CONFIG: Record<EquipmentType, { label: string; description: string; unit: string; color: string; bg: string }> = {
  LARGE_FORMAT: { label: 'Large Format', description: 'Imprimare pe m²', unit: 'm²', color: 'text-purple-700', bg: 'bg-purple-100' },
  DIGITAL:      { label: 'Digital',       description: 'Cost per click/coală', unit: 'click', color: 'text-blue-700',   bg: 'bg-blue-100' },
  HOURLY:       { label: 'Pe oră',        description: 'Cost per oră', unit: 'oră', color: 'text-orange-700', bg: 'bg-orange-100' },
};

export interface Machine {
  id: string;
  name: string;
  type: string;
  equipmentType: EquipmentType;
  status: MachineStatus;

  // Comune
  costPerHour?: number | null;
  speed?: string | null;
  maxWidth?: number | null;
  maxHeight?: number | null;
  operatorCostPerHour?: number | null;
  energyConsumptionKw?: number | null;

  // Large Format
  speedM2PerHour?: number | null;
  inkPerM2?: number | null;
  materialPerM2?: number | null;
  headAmortPerM2?: number | null;
  printerAmortPerM2?: number | null;
  maintCostPerM2?: number | null;

  // Digital
  costClickColor?: number | null;
  costClickBW?: number | null;
  servicePerClick?: number | null;
  maxFormat?: string | null;
  maxGramWeight?: number | null;
  speedPpm?: number | null;

  compatibleMaterialIds: string[];
  /** Populat de API – obiecte complete pentru badge-uri */
  compatibleMaterials?: { id: string; name: string; unit: string }[];
  compatiblePrintMethodIds: string[];
  /** Populat de API – obiecte complete pentru badge-uri */ 
  compatiblePrintMethods?: { id: string; name: string; type: string }[];
  description?: string | null;
  notes?: string | null;
  lastMaintenance?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Consumabile asociate echipamentului
  consumables?: EquipmentConsumable[];
}

/** Consumabil folosit de un echipament (vopsea, pulbere, soluție) */
export interface EquipmentConsumable {
  id: string;
  machineId: string;
  materialId: string;
  
  // Consum pe diferite unități
  consumptionPerSqm?: number | null;   // pentru echipamente Large Format
  consumptionPerUnit?: number | null;  // pentru echipamente Digital (per click/pagină)
  consumptionPerJob?: number | null;   // consum fix per job
  
  unit: string; // MaterialUnit
  active: boolean;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relații populate de API
  material?: {
    id: string;
    name: string;
    unit: string;
    stock: number;
    pricePerUnit?: number;
  };
}

/** Calculează costul estimat pe unitate (lei/m², lei/click sau lei/oră) */
export function calcCostPerUnit(m: Machine): number {
  if (m.equipmentType === 'LARGE_FORMAT') {
    return (
      (m.inkPerM2 ?? 0) +
      (m.materialPerM2 ?? 0) +
      (m.headAmortPerM2 ?? 0) +
      (m.printerAmortPerM2 ?? 0) +
      (m.maintCostPerM2 ?? 0)
    );
  }
  if (m.equipmentType === 'DIGITAL') {
    return (m.costClickColor ?? 0) + (m.servicePerClick ?? 0);
  }
  return m.costPerHour ?? 0;
}

/** Calculează timp estimat în minute */
export function calcEstimatedMinutes(m: Machine, quantity: number): number {
  if (m.equipmentType === 'LARGE_FORMAT' && m.speedM2PerHour && m.speedM2PerHour > 0) {
    return Math.ceil((quantity / m.speedM2PerHour) * 60);
  }
  if (m.equipmentType === 'DIGITAL' && m.speedPpm && m.speedPpm > 0) {
    return Math.ceil(quantity / m.speedPpm);
  }
  // Hourly: quantity = ore
  return Math.ceil(quantity * 60);
}

/** Calculează cost total estimat (lei) */
export function calcEstimatedCost(m: Machine, quantity: number): number {
  const minutes = calcEstimatedMinutes(m, quantity);
  const hours = minutes / 60;

  if (m.equipmentType === 'LARGE_FORMAT') {
    const materialCost = calcCostPerUnit(m) * quantity;
    const operatorCost = (m.operatorCostPerHour ?? 0) * hours;
    return materialCost + operatorCost;
  }
  if (m.equipmentType === 'DIGITAL') {
    const clickCost = calcCostPerUnit(m) * quantity;
    const operatorCost = (m.operatorCostPerHour ?? 0) * hours;
    return clickCost + operatorCost;
  }
  // Hourly
  const machineCost = (m.costPerHour ?? 0) * hours;
  const operatorCost = (m.operatorCostPerHour ?? 0) * hours;
  const energyCost = (m.energyConsumptionKw ?? 0) * hours * 2.5; // 2.5 lei/kWh
  return machineCost + operatorCost + energyCost;
}

export interface CreateMachineInput extends Omit<Machine, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateMachineInput extends Partial<Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>> {}

export const MACHINE_STATUS_CONFIG: Record<MachineStatus, { label: string; color: string; bg: string; dot: string }> = {
  AVAILABLE:   { label: 'Liber',          color: 'text-green-700',  bg: 'bg-green-100',  dot: 'bg-green-500' },
  BUSY:        { label: 'Ocupat',         color: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  MAINTENANCE: { label: 'În mentenanță', color: 'text-red-700',    bg: 'bg-red-100',    dot: 'bg-red-500' },
};

export const MACHINE_TYPES = [
  { value: 'Digital Printer',      label: 'Digital Printer',      equipmentType: 'DIGITAL'       as EquipmentType, icon: Printer },
  { value: 'Offset Press',         label: 'Offset Press',         equipmentType: 'DIGITAL'       as EquipmentType, icon: PrinterCheck },
  { value: 'Large Format Printer', label: 'Large Format Printer', equipmentType: 'LARGE_FORMAT'  as EquipmentType, icon: Printer },
  { value: 'UV Flatbed',           label: 'UV Flatbed',           equipmentType: 'LARGE_FORMAT'  as EquipmentType, icon: Layers },
  { value: 'Sublimation Printer',  label: 'Sublimation Printer',  equipmentType: 'LARGE_FORMAT'  as EquipmentType, icon: Printer },
  { value: 'Laser Cutter',         label: 'Laser Cutter',         equipmentType: 'HOURLY'        as EquipmentType, icon: Scissors },
  { value: 'Laminator',            label: 'Laminator',            equipmentType: 'HOURLY'        as EquipmentType, icon: Layers },
  { value: 'Cutter Plotter',       label: 'Cutter Plotter',       equipmentType: 'HOURLY'        as EquipmentType, icon: Scissors },
  { value: 'Ghilotină',            label: 'Ghilotină',            equipmentType: 'HOURLY'        as EquipmentType, icon: Scissors },
  { value: 'CNC',                  label: 'CNC',                  equipmentType: 'HOURLY'        as EquipmentType, icon: Cpu },
  { value: 'Sublimation',          label: 'Sublimare',            equipmentType: 'LARGE_FORMAT'  as EquipmentType, icon: Zap },
  { value: 'Altele',               label: 'Altele',               equipmentType: 'HOURLY'        as EquipmentType, icon: MoreHorizontal },
] as const;

