import { Printer, PrinterCheck, Scissors, Layers, Cpu, Zap } from 'lucide-react';

export type MachineStatus = 'AVAILABLE' | 'BUSY' | 'MAINTENANCE';
export type ProductionMode = 'IN_HOUSE' | 'OUTSOURCE';
export type MachineMaintenanceType = 'Preventive' | 'Corrective' | 'Calibration' | 'Repair' | 'Part Replacement' | 'Inspection';

export const MACHINE_MAINTENANCE_TYPES: MachineMaintenanceType[] = [
  'Preventive',
  'Corrective',
  'Calibration',
  'Repair',
  'Part Replacement',
  'Inspection',
];

export const EQUIPMENT_TYPE_VALUES = [
  'DIGITAL_COLOR',
  'DIGITAL_MONO',
  'UV',
  'LARGE_FORMAT',
  'DTF',
  'SUBLIMATION',
  'OFFSET',
  'EMBROIDERY',
  'PLOTTER_CUTTING',
] as const;

export type EquipmentType = typeof EQUIPMENT_TYPE_VALUES[number];

export const LEGACY_EQUIPMENT_TYPE_MAP: Record<string, EquipmentType> = {
  DIGITAL: 'DIGITAL_COLOR',
  DIGITAL_PRINTER: 'DIGITAL_COLOR',
  DIGITAL_MONOCHROME: 'DIGITAL_MONO',
  LARGE_FORMAT: 'LARGE_FORMAT',
  UV: 'UV',
  UV_FLATBED: 'UV',
  DTF: 'DTF',
  DTF_PRINTER: 'DTF',
  SUBLIMATION: 'SUBLIMATION',
  SUBLIMATION_PRINTER: 'SUBLIMATION',
  OFFSET: 'OFFSET',
  OFFSET_PRESS: 'OFFSET',
  EMBROIDERY: 'EMBROIDERY',
  EMBROIDERY_MACHINE: 'EMBROIDERY',
  PLOTTER_CUTTING: 'PLOTTER_CUTTING',
  CUTTER_PLOTTER: 'PLOTTER_CUTTING',
  HOURLY: 'PLOTTER_CUTTING',
  LASER_CUTTER: 'PLOTTER_CUTTING',
  LAMINATOR: 'PLOTTER_CUTTING',
  CNC: 'PLOTTER_CUTTING',
  GHILOTINA: 'PLOTTER_CUTTING',
  ALTELE: 'PLOTTER_CUTTING',
};

export function normalizeEquipmentType(value?: string | null): EquipmentType {
  if (!value) return 'DIGITAL_COLOR';

  const normalized = value.trim().toUpperCase().replace(/[-\s]+/g, '_');
  if (EQUIPMENT_TYPE_VALUES.some((entry) => entry === normalized)) {
    return normalized as EquipmentType;
  }

  return LEGACY_EQUIPMENT_TYPE_MAP[normalized] ?? 'DIGITAL_COLOR';
}

export function isLargeFormatEquipmentType(type?: string | null): boolean {
  const normalized = normalizeEquipmentType(type);
  return ['UV', 'LARGE_FORMAT', 'DTF', 'SUBLIMATION'].includes(normalized);
}

export function isDigitalEquipmentType(type?: string | null): boolean {
  const normalized = normalizeEquipmentType(type);
  return ['DIGITAL_COLOR', 'DIGITAL_MONO'].includes(normalized);
}

export function isHourlyEquipmentType(type?: string | null): boolean {
  const normalized = normalizeEquipmentType(type);
  return ['OFFSET', 'EMBROIDERY', 'PLOTTER_CUTTING'].includes(normalized);
}

export const PRODUCTION_MODE_CONFIG: Record<ProductionMode, { label: string; color: string; bg: string }> = {
  IN_HOUSE: { label: 'In-House', color: 'text-blue-700', bg: 'bg-blue-100' },
  OUTSOURCE: { label: 'Outsource', color: 'text-amber-700', bg: 'bg-amber-100' },
};

export const EQUIPMENT_TYPE_CONFIG: Record<EquipmentType, { label: string; description: string; unit: string; color: string; bg: string }> = {
  DIGITAL_COLOR:   { label: 'Digital Color', description: 'Cost per click color', unit: 'click', color: 'text-blue-700', bg: 'bg-blue-100' },
  DIGITAL_MONO:    { label: 'Digital Mono', description: 'Cost per click mono', unit: 'click', color: 'text-sky-700', bg: 'bg-sky-100' },
  UV:              { label: 'UV', description: 'Cost per m²', unit: 'm²', color: 'text-violet-700', bg: 'bg-violet-100' },
  LARGE_FORMAT:    { label: 'Large Format', description: 'Cost per m²', unit: 'm²', color: 'text-purple-700', bg: 'bg-purple-100' },
  DTF:             { label: 'DTF', description: 'Cost per m²', unit: 'm²', color: 'text-pink-700', bg: 'bg-pink-100' },
  SUBLIMATION:     { label: 'Sublimation', description: 'Cost per m²', unit: 'm²', color: 'text-fuchsia-700', bg: 'bg-fuchsia-100' },
  OFFSET:          { label: 'Offset', description: 'Cost per hour', unit: 'h', color: 'text-orange-700', bg: 'bg-orange-100' },
  EMBROIDERY:      { label: 'Embroidery', description: 'Cost per hour', unit: 'h', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  PLOTTER_CUTTING: { label: 'Plotter Cutting', description: 'Cost per hour', unit: 'h', color: 'text-amber-700', bg: 'bg-amber-100' },
};

export interface Machine {
  id: string;
  name: string;
  type: string;
  equipmentType: EquipmentType;
  productionMode?: ProductionMode;
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
  purchaseCostMdl?: number | null;
  expectedLifetimePages?: number | null;
  electricityCostPerKwh?: number | null;
  powerConsumptionKw?: number | null;
  maintenanceComponents?: Array<{ name: string; cost: number; expectedLifetimePages: number }>;
  tonerConsumables?: Array<{ type: string; cost: number; yieldPages: number }>;
  speedProfiles?: Array<{ minWeight: number; maxWeight: number; speedPpm: number }>;

  compatibleMaterialIds: string[];
  compatiblePrintMethodIds?: string[];
  compatibleMaterials?: { id: string; name: string; unit: string }[];
  description?: string | null;
  notes?: string | null;
  lastMaintenance?: string | null;
  maintenanceHistory?: MachineMaintenanceRecord[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  consumables?: EquipmentConsumable[];
}

export interface MachineMaintenanceRecord {
  id: string;
  machineId: string;
  date: string;
  type: MachineMaintenanceType;
  description: string;
  cost?: number | null;
  technician?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentConsumable {
  id: string;
  machineId: string;
  materialId: string;
  consumptionPerSqm?: number | null;
  consumptionPerUnit?: number | null;
  consumptionPerJob?: number | null;
  unit: string;
  active: boolean;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  material?: {
    id: string;
    name: string;
    unit: string;
    stock: number;
    pricePerUnit?: number;
  };
}

export function calcCostPerUnit(m: Machine): number {
  const equipmentType = normalizeEquipmentType(m.equipmentType);

  if (isLargeFormatEquipmentType(equipmentType)) {
    return (
      (m.inkPerM2 ?? 0) +
      (m.materialPerM2 ?? 0) +
      (m.headAmortPerM2 ?? 0) +
      (m.printerAmortPerM2 ?? 0) +
      (m.maintCostPerM2 ?? 0)
    );
  }

  if (isDigitalEquipmentType(equipmentType)) {
    return (m.costClickColor ?? 0) + (m.servicePerClick ?? 0);
  }

  return m.costPerHour ?? 0;
}

export function calcEstimatedMinutes(m: Machine, quantity: number): number {
  const equipmentType = normalizeEquipmentType(m.equipmentType);

  if (isLargeFormatEquipmentType(equipmentType) && m.speedM2PerHour && m.speedM2PerHour > 0) {
    return Math.ceil((quantity / m.speedM2PerHour) * 60);
  }
  if (isDigitalEquipmentType(equipmentType) && m.speedPpm && m.speedPpm > 0) {
    return Math.ceil(quantity / m.speedPpm);
  }
  return Math.ceil(quantity * 60);
}

export function calcEstimatedCost(m: Machine, quantity: number): number {
  const minutes = calcEstimatedMinutes(m, quantity);
  const hours = minutes / 60;
  const equipmentType = normalizeEquipmentType(m.equipmentType);

  if (isLargeFormatEquipmentType(equipmentType)) {
    const materialCost = calcCostPerUnit(m) * quantity;
    const operatorCost = (m.operatorCostPerHour ?? 0) * hours;
    return materialCost + operatorCost;
  }
  if (isDigitalEquipmentType(equipmentType)) {
    const clickCost = calcCostPerUnit(m) * quantity;
    const operatorCost = (m.operatorCostPerHour ?? 0) * hours;
    return clickCost + operatorCost;
  }

  const machineCost = (m.costPerHour ?? 0) * hours;
  const operatorCost = (m.operatorCostPerHour ?? 0) * hours;
  const energyCost = (m.energyConsumptionKw ?? 0) * hours * 2.5;
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
  { value: 'Digital Color', equipmentType: 'DIGITAL_COLOR' as EquipmentType, label: 'Digital Color', icon: Printer },
  { value: 'Digital Mono', equipmentType: 'DIGITAL_MONO' as EquipmentType, label: 'Digital Mono', icon: PrinterCheck },
  { value: 'UV', equipmentType: 'UV' as EquipmentType, label: 'UV', icon: Layers },
  { value: 'Large Format', equipmentType: 'LARGE_FORMAT' as EquipmentType, label: 'Large Format', icon: Printer },
  { value: 'DTF', equipmentType: 'DTF' as EquipmentType, label: 'DTF', icon: Printer },
  { value: 'Sublimation', equipmentType: 'SUBLIMATION' as EquipmentType, label: 'Sublimation', icon: Zap },
  { value: 'Offset', equipmentType: 'OFFSET' as EquipmentType, label: 'Offset', icon: PrinterCheck },
  { value: 'Embroidery', equipmentType: 'EMBROIDERY' as EquipmentType, label: 'Embroidery', icon: Scissors },
  { value: 'Plotter Cutting', equipmentType: 'PLOTTER_CUTTING' as EquipmentType, label: 'Plotter Cutting', icon: Scissors },
] as const;

