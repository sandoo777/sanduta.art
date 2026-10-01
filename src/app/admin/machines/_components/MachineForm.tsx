'use client';

import { Info, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCompatibilitySelector } from '../../finishing/_components/MaterialCompatibilitySelector';
import { PrintMethodCompatibilitySelector } from '../../finishing/_components/PrintMethodCompatibilitySelector';
import type { Machine, MachineMaintenanceRecord } from '@/modules/machines/types';
import { MACHINE_TYPES, MACHINE_STATUS_CONFIG, EQUIPMENT_TYPE_CONFIG, normalizeEquipmentType } from '@/modules/machines/types';
import { machineFormSchema, type MachineFormData } from '@/lib/validations/admin';
import { FormField } from '@/components/ui/FormField';
import { FormLabel } from '@/components/ui/FormLabel';
import { FormMessage } from '@/components/ui/FormMessage';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/modules/settings/useSettings';
import { DEFAULT_GLOBAL_PRODUCTION_COST_SETTINGS, normalizeGlobalProductionCostSettings } from '@/lib/global-cost-settings';
import { calculateDigitalColorCostPerPage } from '@/lib/production-time';

interface MachineFormProps {
  machine?: Machine;
  onSubmit: (data: MachineFormData & { maintenanceHistory?: MachineMaintenanceRecord[] }) => Promise<void>;
  onClose: () => void;
}

type MaintenanceComponentItem = {
  id: string;
  name: string;
  cost: number;
  expectedLifetimePages: number;
};

function createMaintenanceComponentItem(component?: Partial<MaintenanceComponentItem>, fallbackIndex = 0): MaintenanceComponentItem {
  return {
    id: component?.id ?? `maintenance-component-${fallbackIndex}-${Math.random().toString(36).slice(2, 10)}`,
    name: component?.name ?? '',
    cost: Number(component?.cost ?? 0),
    expectedLifetimePages: Number(component?.expectedLifetimePages ?? 0),
  };
}

const MaintenanceComponentRow = memo(function MaintenanceComponentRow({
  component,
  onChange,
  onDelete,
}: {
  component: MaintenanceComponentItem;
  onChange: (component: MaintenanceComponentItem) => void;
  onDelete: (componentId: string) => void;
}) {
  const [draft, setDraft] = useState(component);

  useEffect(() => {
    setDraft(component);
  }, [component]);

  const updateDraft = <K extends keyof MaintenanceComponentItem>(key: K, value: MaintenanceComponentItem[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <tr className="border-t border-amber-100">
      <td className="px-3 py-2"><input type="text" placeholder="ex: Drum" value={draft.name ?? ''} onChange={(e) => updateDraft('name', e.target.value)} onBlur={() => onChange(draft)} className="w-full rounded border border-gray-300 px-2 py-1" /></td>
      <td className="px-3 py-2"><input type="number" value={draft.cost ?? 0} onChange={(e) => updateDraft('cost', Number(e.target.value) || 0)} onBlur={() => onChange(draft)} className="w-full rounded border border-gray-300 px-2 py-1" /></td>
      <td className="px-3 py-2"><input type="number" value={draft.expectedLifetimePages ?? 0} onChange={(e) => updateDraft('expectedLifetimePages', Number(e.target.value) || 0)} onBlur={() => onChange(draft)} className="w-full rounded border border-gray-300 px-2 py-1" /></td>
      <td className="px-3 py-2">{(Number(draft.cost ?? 0) / Math.max(Number(draft.expectedLifetimePages ?? 0), 1)).toFixed(2)}</td>
      <td className="px-3 py-2"><button type="button" onClick={() => onDelete(component.id)} className="rounded border border-red-200 px-2 py-1 text-red-600">Șterge</button></td>
    </tr>
  );
});

function NumericField({ name, label, placeholder, step = '0.01', min = '0', suffix, tooltip }: {
  name: string; label: string; placeholder?: string; step?: string; min?: string; suffix?: string; tooltip?: string;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <div>
          <FormLabel>
            <span className="inline-flex items-center gap-1.5">
              <span>{label}</span>
              {suffix && <span className="text-xs text-gray-400">({suffix})</span>}
              {tooltip && (
                <span
                  title={tooltip}
                  aria-label={tooltip}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-gray-500 cursor-help"
                >
                  <Info className="h-3 w-3" />
                </span>
              )}
            </span>
          </FormLabel>
          <Input
            type="number"
            step={step}
            min={min}
            placeholder={placeholder ?? '0.00'}
            title={tooltip}
            {...field}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value !== '' ? parseFloat(e.target.value) : null)}
          />
          <FormMessage />
        </div>
      )}
    />
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-3">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export function MachineForm({ machine, onSubmit, onClose }: MachineFormProps) {
  const { getSystemSettings } = useSettings();
  const [maintenanceRecords, setMaintenanceRecords] = useState<MachineMaintenanceRecord[]>(() => machine?.maintenanceHistory ?? []);
  const [draftRecord, setDraftRecord] = useState<MachineMaintenanceRecord | null>(null);
  const [isEditingMaintenance, setIsEditingMaintenance] = useState(false);
  const [maintenanceComponents, setMaintenanceComponents] = useState<MaintenanceComponentItem[]>(() => Array.isArray(machine?.maintenanceComponents) && machine.maintenanceComponents.length > 0
    ? machine.maintenanceComponents.map((component, index) => createMaintenanceComponentItem(component, index))
    : [createMaintenanceComponentItem(undefined, 0)]);
  const [globalCostSettings, setGlobalCostSettings] = useState(DEFAULT_GLOBAL_PRODUCTION_COST_SETTINGS);
  const [availableMaterials, setAvailableMaterials] = useState<Array<{ id: string; name: string; purchasePrice?: number | null; salePrice?: number | null; unit?: string | null; categoryId?: string | null; categoryName?: string | null }>>([]);
  const [tonerPickerIndex, setTonerPickerIndex] = useState<number | null>(null);
  const [tonerMaterialSearch, setTonerMaterialSearch] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const maintenanceHistory = useMemo(() => {
    return [...maintenanceRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [maintenanceRecords]);

  const latestMaintenanceDate = useMemo(() => {
    const newest = maintenanceHistory[0];
    return newest?.date ? new Date(newest.date).toLocaleDateString('ro-MD') : null;
  }, [maintenanceHistory]);

  useEffect(() => {
    setMaintenanceRecords(machine?.maintenanceHistory ?? []);
  }, [machine?.maintenanceHistory]);

  useEffect(() => {
    setMaintenanceComponents(Array.isArray(machine?.maintenanceComponents) && machine.maintenanceComponents.length > 0
      ? machine.maintenanceComponents.map((component, index) => createMaintenanceComponentItem(component, index))
      : [createMaintenanceComponentItem(undefined, 0)]);
  }, [machine?.maintenanceComponents]);

  useEffect(() => {
    void (async () => {
      try {
        const settings = await getSystemSettings();
        setGlobalCostSettings(normalizeGlobalProductionCostSettings(settings));
      } catch {
        setGlobalCostSettings(DEFAULT_GLOBAL_PRODUCTION_COST_SETTINGS);
      }
    })();
  }, [getSystemSettings]);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch('/api/admin/materials', { credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data)) {
          setAvailableMaterials(data.map((item) => ({
            id: String(item.id ?? ''),
            name: String(item.name ?? ''),
            purchasePrice: typeof item.purchasePrice === 'number' ? item.purchasePrice : null,
            salePrice: typeof item.salePrice === 'number' ? item.salePrice : null,
            unit: typeof item.unit === 'string' ? item.unit : null,
            categoryId: typeof item.categoryId === 'string' ? item.categoryId : null,
            categoryName:
              typeof item.categoryName === 'string'
                ? item.categoryName
                : typeof item.category?.name === 'string'
                  ? item.category.name
                  : null,
          })).filter((item) => item.id && item.name));
        }
      } catch {
        setAvailableMaterials([]);
      }
    })();
  }, []);

  const form = useForm<any>({
    resolver: zodResolver(machineFormSchema),
    shouldFocusError: false,
    defaultValues: {
      name:          machine?.name          ?? '',
      type:          machine?.type          ?? 'Digital Printer',
      equipmentType: machine?.equipmentType ?? 'DIGITAL_COLOR',
      status:        machine?.status        ?? 'AVAILABLE',
      speed:         machine?.speed         ?? '',
      maxWidth:      machine?.maxWidth      ?? null,
      maxHeight:     machine?.maxHeight     ?? null,
      operatorCostPerHour: machine?.operatorCostPerHour ?? globalCostSettings.productionOperatorCostMdlPerHour,
      energyConsumptionKw: machine?.energyConsumptionKw ?? null,
      electricityCostPerKwh: machine?.electricityCostPerKwh ?? globalCostSettings.electricityCostMdlPerKwh,
      purchaseCostMdl: machine?.purchaseCostMdl ?? null,
      expectedLifetimePages: machine?.expectedLifetimePages ?? null,
      costPerHour:      machine?.costPerHour     ?? null,
      speedM2PerHour:   machine?.speedM2PerHour  ?? null,
      inkPerM2:         machine?.inkPerM2        ?? null,
      materialPerM2:    machine?.materialPerM2   ?? null,
      headAmortPerM2:   machine?.headAmortPerM2  ?? null,
      printerAmortPerM2: machine?.printerAmortPerM2 ?? null,
      maintCostPerM2:   machine?.maintCostPerM2  ?? null,
      costClickColor:   machine?.costClickColor  ?? null,
      costClickBW:      machine?.costClickBW     ?? null,
      servicePerClick:  machine?.servicePerClick ?? null,
      maxFormat:        machine?.maxFormat       ?? null,
      maxGramWeight:    machine?.maxGramWeight   ?? null,
      speedPpm:         machine?.speedPpm        ?? null,
      speedProfiles:    machine?.speedProfiles ?? [
        { minWeight: 0, maxWeight: 120, speedPpm: 80 },
        { minWeight: 121, maxWeight: 200, speedPpm: 60 },
        { minWeight: 201, maxWeight: 300, speedPpm: 40 },
        { minWeight: 301, maxWeight: 400, speedPpm: 20 },
      ],
      maintenanceComponents: Array.isArray(machine?.maintenanceComponents) && machine.maintenanceComponents.length > 0 ? machine.maintenanceComponents : [{ name: '', cost: 0, expectedLifetimePages: 0 }],
      tonerConsumables: Array.isArray(machine?.tonerConsumables) && machine.tonerConsumables.length > 0 ? machine.tonerConsumables : [{ type: availableMaterials[0]?.name ?? 'Alege material', materialId: availableMaterials[0]?.id ?? null, cost: Number(availableMaterials[0]?.purchasePrice ?? availableMaterials[0]?.salePrice ?? 0), yieldPages: 0 }],
      compatibleMaterialIds:    machine?.compatibleMaterialIds    ?? [],
      compatiblePrintMethodIds: machine?.compatiblePrintMethodIds ?? [],
      description:     machine?.description     ?? '',
      notes:           machine?.notes           ?? '',
      active: machine?.active ?? true,
    },
  });

  const { formState: { isSubmitting } } = form;
  const equipmentType = useWatch({ control: form.control, name: 'equipmentType' });
  const speedProfiles: Array<{ minWeight: number; maxWeight: number; speedPpm: number }> = useWatch({ control: form.control, name: 'speedProfiles' }) ?? [
    { minWeight: 0, maxWeight: 120, speedPpm: 80 },
    { minWeight: 121, maxWeight: 200, speedPpm: 60 },
    { minWeight: 201, maxWeight: 300, speedPpm: 40 },
    { minWeight: 301, maxWeight: 400, speedPpm: 20 },
  ];
  const tonerConsumables: Array<{ type: string; materialId: string | null; cost: number; yieldPages: number }> = useWatch({ control: form.control, name: 'tonerConsumables' }) ?? [{ type: 'Alege material', materialId: null, cost: 0, yieldPages: 0 }];
  const energyConsumptionKw = Number(useWatch({ control: form.control, name: 'energyConsumptionKw' }) ?? 0) || 0;
  const electricityCostPerKwh = Number(globalCostSettings.electricityCostMdlPerKwh ?? 0) || 0;
  const operatorCostPerHour = Number(globalCostSettings.productionOperatorCostMdlPerHour ?? 0) || 0;
  const costClickColor = Number(useWatch({ control: form.control, name: 'costClickColor' }) ?? 0) || 0;
  const costClickBW = Number(useWatch({ control: form.control, name: 'costClickBW' }) ?? 0) || 0;
  const servicePerClick = Number(useWatch({ control: form.control, name: 'servicePerClick' }) ?? 0) || 0;
  const purchaseCostMdl = Number(useWatch({ control: form.control, name: 'purchaseCostMdl' }) ?? 0) || 0;
  const expectedLifetimePages = Number(useWatch({ control: form.control, name: 'expectedLifetimePages' }) ?? 0) || 0;
  const normalizedEquipmentType = normalizeEquipmentType(equipmentType ?? machine?.equipmentType ?? 'DIGITAL_COLOR');
  const [activeTab, setActiveTab] = useState<'general' | 'compatibilities' | 'technical' | 'maintenance'>('general');
  const equipmentCostPerPage = purchaseCostMdl / Math.max(expectedLifetimePages, 1);
  const hourlyEnergyCost = energyConsumptionKw * electricityCostPerKwh;
  const hourlyEnergyCostPerMinute = hourlyEnergyCost / 60;

  useEffect(() => {
    form.setValue('electricityCostPerKwh', electricityCostPerKwh);
    form.setValue('operatorCostPerHour', operatorCostPerHour);
  }, [form, electricityCostPerKwh, operatorCostPerHour]);

  const tonerCostPerPage = useMemo<number>(() => tonerConsumables.reduce((acc, item) => acc + (Number(item.cost ?? 0) / Math.max(Number(item.yieldPages ?? 0), 1)), 0), [tonerConsumables]);

  const maintenanceCostPerPage = useMemo<number>(() => maintenanceComponents.reduce((acc, component) => acc + (Number(component.cost ?? 0) / Math.max(Number(component.expectedLifetimePages ?? 0), 1)), 0), [maintenanceComponents]);

  const clickCostPerPage = useMemo(() => {
    const directClick = Math.max(costClickColor, costClickBW);
    return directClick + servicePerClick;
  }, [costClickColor, costClickBW, servicePerClick]);

  const baseDigitalCostPerPage = useMemo(() => {
    return equipmentCostPerPage + tonerCostPerPage + maintenanceCostPerPage + clickCostPerPage;
  }, [equipmentCostPerPage, tonerCostPerPage, maintenanceCostPerPage, clickCostPerPage]);

  const digitalProfileCosts: Array<{ minWeight: number; maxWeight: number; speedPpm: number; timeDrivenCostPerPage: number; netCostPerPage: number }> = useMemo(() => {
    return speedProfiles.map((profile: { minWeight?: number; maxWeight?: number; speedPpm?: number }) => {
      const ppm = Math.max(Number(profile?.speedPpm ?? 0), 1);
      const pagesPerHour = ppm * 60;
      const timeDrivenCostPerPage = (operatorCostPerHour + hourlyEnergyCost) / pagesPerHour;
      const netCostPerPage = baseDigitalCostPerPage + timeDrivenCostPerPage;

      return {
        minWeight: Number(profile?.minWeight ?? 0),
        maxWeight: Number(profile?.maxWeight ?? 0),
        speedPpm: ppm,
        timeDrivenCostPerPage,
        netCostPerPage,
      };
    });
  }, [speedProfiles, operatorCostPerHour, hourlyEnergyCost, baseDigitalCostPerPage]);

  const updateSpeedProfile = (index: number, key: 'minWeight' | 'maxWeight' | 'speedPpm', value: number) => {
    const next = [...speedProfiles];
    next[index] = { ...next[index], [key]: value };
    form.setValue('speedProfiles', next);
  };

  const updateMaintenanceComponent = (component: MaintenanceComponentItem) => {
    setMaintenanceComponents((current) => current.map((item) => (item.id === component.id ? component : item)));
  };

  const addMaintenanceComponent = () => {
    setMaintenanceComponents((current) => [...current, createMaintenanceComponentItem(undefined, current.length)]);
  };

  const deleteMaintenanceComponent = (componentId: string) => {
    setMaintenanceComponents((current) => {
      const next = current.filter((component) => component.id !== componentId);
      return next.length > 0 ? next : [createMaintenanceComponentItem(undefined, 0)];
    });
  };

  const updateTonerConsumable = (index: number, key: 'type' | 'materialId' | 'cost' | 'yieldPages', value: string | number | null) => {
    form.setValue(`tonerConsumables.${index}.${key}` as const, value as never);
  };

  const addTonerConsumable = () => {
    const fallbackMaterial = availableMaterials[0];
    const next = [
      ...tonerConsumables,
      {
        type: fallbackMaterial?.name ?? 'Alege material',
        materialId: fallbackMaterial?.id ?? null,
        cost: Number(fallbackMaterial?.purchasePrice ?? fallbackMaterial?.salePrice ?? 0),
        yieldPages: 0,
      },
    ];
    form.setValue('tonerConsumables', next as never);
  };

  const selectTonerMaterial = (index: number, selectedMaterialId: string) => {
    const material = availableMaterials.find((item) => item.id === selectedMaterialId);
    if (!material) {
      updateTonerConsumable(index, 'type', 'Alege material');
      updateTonerConsumable(index, 'materialId', null);
      updateTonerConsumable(index, 'cost', 0);
      setTonerPickerIndex(null);
      return;
    }

    updateTonerConsumable(index, 'type', material.name);
    updateTonerConsumable(index, 'materialId', material.id);
    updateTonerConsumable(index, 'cost', Number(material.purchasePrice ?? material.salePrice ?? 0));
    setTonerPickerIndex(null);
  };

  const materialLookup = new Map(availableMaterials.map((item) => [item.id, item]));

  const filteredMaterials = useMemo(() => {
    const search = tonerMaterialSearch.trim().toLowerCase();
    if (!search) return availableMaterials;
    return availableMaterials.filter((item) => {
      const categoryName = String(item.categoryName ?? 'Fără mapă').toLowerCase();
      return item.name.toLowerCase().includes(search) || categoryName.includes(search);
    });
  }, [availableMaterials, tonerMaterialSearch]);

  const materialsByFolder = useMemo(() => {
    const grouped = new Map<string, Array<{ id: string; name: string; purchasePrice?: number | null; salePrice?: number | null; unit?: string | null; categoryId?: string | null; categoryName?: string | null }>>();
    filteredMaterials.forEach((material) => {
      const folder = material.categoryName ?? 'Fără mapă';
      const existing = grouped.get(folder) ?? [];
      existing.push(material);
      grouped.set(folder, existing);
    });
    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredMaterials]);

  useEffect(() => {
    form.setValue(
      'maintenanceComponents',
      maintenanceComponents.map((component) => ({
        name: component.name ?? '',
        cost: Number(component.cost ?? 0),
        expectedLifetimePages: Number(component.expectedLifetimePages ?? 0),
      }))
    );
  }, [form, maintenanceComponents]);

  const handleTypeChange = (value: string) => {
    form.setValue('type', value);
    const found = MACHINE_TYPES.find((t) => t.value === value);
    if (found) form.setValue('equipmentType', found.equipmentType);
  };

  const handleFormSubmit = async (data: MachineFormData) => {
    setSubmitError(null);

    const sortedRecords = [...maintenanceRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    console.log('MACHINE_FORM_SUBMIT_START', {
      name: data.name,
      machineId: machine?.id,
      maintenanceRecords: sortedRecords.length,
    });

    try {
      const payload: MachineFormData & { maintenanceHistory?: MachineMaintenanceRecord[] } = {
        ...(data as MachineFormData),
        maintenanceHistory: sortedRecords,
      };
      await onSubmit(payload);
      onClose();
      console.log('MACHINE_FORM_ONSUBMIT_RESOLVED');
    } catch (error) {
      console.error('MACHINE_FORM_SUBMIT_FAILED', error);
      const message = error instanceof Error && error.message
        ? error.message
        : 'Actualizarea nu a reusit. Verifica datele introduse si incearca din nou.';
      setSubmitError(message);
    }
  };

  const etCfg = EQUIPMENT_TYPE_CONFIG[normalizedEquipmentType as keyof typeof EQUIPMENT_TYPE_CONFIG];

  const openNewMaintenanceForm = () => {
    setDraftRecord({
      id: `draft-${Date.now()}`,
      machineId: machine?.id ?? 'new-machine',
      date: new Date().toISOString().split('T')[0],
      type: 'Preventive',
      description: '',
      cost: 0,
      technician: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsEditingMaintenance(false);
  };

  const openEditMaintenanceForm = (record: MachineMaintenanceRecord) => {
    setDraftRecord(record);
    setIsEditingMaintenance(true);
  };

  const saveMaintenanceRecord = () => {
    if (!draftRecord) return;

    const normalizedDraft = {
      ...draftRecord,
      description: draftRecord.description?.trim() || 'Maintenance record',
      cost: typeof draftRecord.cost === 'number' ? draftRecord.cost : Number(draftRecord.cost ?? 0),
    };

    setMaintenanceRecords((current) => {
      const existing = current.filter((item) => item.id !== normalizedDraft.id);
      return [...existing, normalizedDraft].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    setDraftRecord(null);
    setIsEditingMaintenance(false);
  };

  const deleteMaintenanceRecord = (recordId: string) => {
    setMaintenanceRecords((current) => current.filter((item) => item.id !== recordId));
    if (draftRecord?.id === recordId) {
      setDraftRecord(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {machine ? 'Editează echipament' : 'Adaugă echipament'}
            </h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${etCfg.bg} ${etCfg.color} mt-1 inline-block`}>
              {etCfg.label} · {etCfg.description}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="p-6 space-y-6" noValidate>
            {submitError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <strong className="font-semibold">Actualizarea a esuat:</strong> {submitError}
              </div>
            )}

            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
              {[
                ['general', 'General'],
                ['compatibilities', 'Compatibilities'],
                ['technical', 'Technical Parameters'],
                ['maintenance', 'Maintenance'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTab === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <section className={activeTab === 'general' ? 'space-y-5 rounded-2xl border border-gray-200 bg-gray-50/70 p-5' : 'hidden'}>
            <SectionHeading
              title="General"
              description="Datele de bază, categoria de cost și starea operațională a echipamentului."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="name"
                render={({ field }) => (
                  <div>
                    <FormLabel required>Nume echipament</FormLabel>
                    <Input {...field} placeholder="ex: Xerox Versant 280, Mimaki UCJV300" />
                    <FormMessage />
                  </div>
                )}
              />
              <FormField
                name="type"
                render={({ field }) => (
                  <div>
                    <FormLabel required>Tip echipament</FormLabel>
                    <select
                      value={field.value}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {MACHINE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <FormMessage />
                  </div>
                )}
              />
            </div>

            <FormField
              name="equipmentType"
              render={({ field }) => (
                <div>
                  <FormLabel required>Categorie calcul cost</FormLabel>
                  <div className="flex gap-3 flex-wrap">
                    {(Object.entries(EQUIPMENT_TYPE_CONFIG) as [string, typeof EQUIPMENT_TYPE_CONFIG[keyof typeof EQUIPMENT_TYPE_CONFIG]][]).map(([key, cfg]) => (
                      <label
                        key={key}
                        className={`flex flex-col px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                          field.value === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input type="radio" value={key} checked={field.value === key} onChange={() => field.onChange(key)} className="sr-only" />
                        <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs text-gray-500">{cfg.description}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </div>
              )}
            />

            <FormField
              name="status"
              render={({ field }) => (
                <div>
                  <FormLabel required>Stare</FormLabel>
                  <div className="flex gap-3 flex-wrap">
                    {(Object.entries(MACHINE_STATUS_CONFIG) as [string, typeof MACHINE_STATUS_CONFIG[keyof typeof MACHINE_STATUS_CONFIG]][]).map(([key, cfg]) => (
                      <label
                        key={key}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                          field.value === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input type="radio" value={key} checked={field.value === key} onChange={() => field.onChange(key)} className="sr-only" />
                        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                        <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </div>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="active"
                render={({ field }) => (
                  <div className="flex h-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                    <input
                      type="checkbox"
                      id="active"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="active" className="text-sm font-medium text-gray-700">
                      Echipament activ
                    </label>
                  </div>
                )}
              />
            </div>

            <FormField
              name="description"
              render={({ field }) => (
                <div>
                  <FormLabel>Descriere tehnică</FormLabel>
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Detalii tehnice despre echipament..."
                  />
                  <FormMessage />
                </div>
              )}
            />

            <FormField
              name="notes"
              render={({ field }) => (
                <div>
                  <FormLabel>Observații tehnice</FormLabel>
                  <textarea
                    {...field}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="ex: necesită calibrare săptămânală, consumabile speciale..."
                  />
                  <FormMessage />
                </div>
              )}
            />
          </section>

          <section className={activeTab === 'compatibilities' ? 'space-y-5 rounded-2xl border border-gray-200 bg-white p-5' : 'hidden'}>
            <SectionHeading
              title="Compatibilități"
              description="Selectează materialele și metodele de tipărire pe care le poate procesa acest echipament."
            />

            <FormField
              name="compatibleMaterialIds"
              render={({ field }) => (
                <div>
                  <FormLabel>Materiale compatibile</FormLabel>
                  <MaterialCompatibilitySelector
                    selectedMaterialIds={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </div>
              )}
            />

            <FormField
              name="compatiblePrintMethodIds"
              render={({ field }) => (
                <div>
                  <FormLabel>Metode de tipărire compatibile</FormLabel>
                  <PrintMethodCompatibilitySelector
                    selectedPrintMethodIds={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </div>
              )}
            />
          </section>

          <section className={activeTab === 'technical' ? 'space-y-5 rounded-2xl border border-gray-200 bg-white p-5' : 'hidden'}>
            <SectionHeading
              title="Parametri tehnici"
              description="Valorile de mai jos sunt folosite pentru estimarea timpului și costului de producție."
            />

            {/* ===== LARGE FORMAT ===== */}
            {['UV', 'LARGE_FORMAT', 'DTF', 'SUBLIMATION'].includes(normalizedEquipmentType) && (
            <div className="space-y-4 rounded-xl border border-purple-200 bg-purple-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-all">
              <h3 className="text-sm font-semibold text-purple-800">Parametri Large Format (cost per m²)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <NumericField name="speedM2PerHour"    label="Viteză" suffix="m²/h" step="0.1" placeholder="20" tooltip="Capacitatea efectivă de producție pe oră. Este folosită la calculul timpului estimat." />
                <NumericField name="inkPerM2"          label="Cerneală" suffix="lei/m²" step="0.001" placeholder="0.80" tooltip="Costul mediu de cerneală consumată pentru un metru pătrat imprimat." />
                <NumericField name="materialPerM2"     label="Material" suffix="lei/m²" step="0.001" placeholder="1.20" tooltip="Costul substratului sau al materialului de bază pentru un metru pătrat." />
                <NumericField name="headAmortPerM2"    label="Amort. cap" suffix="lei/m²" step="0.0001" placeholder="0.15" tooltip="Amortizarea capului de print repartizată per metru pătrat produs." />
                <NumericField name="printerAmortPerM2" label="Amort. imprimantă" suffix="lei/m²" step="0.0001" placeholder="0.30" tooltip="Amortizarea echipamentului principal repartizată per metru pătrat." />
                <NumericField name="maintCostPerM2"    label="Mentenanță" suffix="lei/m²" step="0.0001" placeholder="0.10" tooltip="Cost mediu de întreținere, piese și consumabile auxiliare per metru pătrat." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumericField name="operatorCostPerHour" label="Cost operator" suffix="lei/h" placeholder="25" tooltip="Costul orar al operatorului alocat echipamentului." />
              </div>
            </div>
          )}

          {/* ===== DIGITAL ===== */}
          {['DIGITAL_COLOR', 'DIGITAL_MONO'].includes(normalizedEquipmentType) && (
            <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-all">
              <h3 className="text-sm font-semibold text-blue-800">Parametri Digital (cost per click/coală)</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <NumericField name="purchaseCostMdl" label="Cost echipament" suffix="MDL" step="0.01" placeholder="80000" tooltip="Costul total al echipamentului, folosit la calculul amortizării per pagină." />
                <NumericField name="expectedLifetimePages" label="Pagini recomandate" suffix="pagini" step="1" placeholder="1000000" tooltip="Numărul estimat de pagini de-a lungul duratei de viață a echipamentului." />
                <div>
                  <FormLabel>Preț per pagină</FormLabel>
                  <div className="flex h-10 items-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-blue-900">
                    {equipmentCostPerPage.toFixed(4)} MDL/pag.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <NumericField name="energyConsumptionKw" label="Consum kW/oră" suffix="kW" step="0.1" placeholder="2.8" tooltip="Consum energetic mediu pe oră." />
                <div>
                  <FormLabel>Tarif electric <span className="text-xs text-gray-400">(MDL/kWh)</span></FormLabel>
                  <div className="flex h-10 items-center rounded-lg border border-gray-300 bg-gray-100 px-3 text-sm font-semibold text-blue-900">
                    {electricityCostPerKwh.toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Din System Settings</div>
                </div>
                <div>
                  <FormLabel>Preț energie / oră</FormLabel>
                  <div className="flex h-10 items-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-blue-900">
                    {hourlyEnergyCost.toFixed(2)} MDL/oră
                  </div>
                  <div className="mt-1 text-xs text-blue-700">{hourlyEnergyCostPerMinute.toFixed(2)} MDL/min</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <FormLabel>Cost operator <span className="text-xs text-gray-400">(MDL/oră)</span></FormLabel>
                  <div className="flex h-10 items-center rounded-lg border border-gray-300 bg-gray-100 px-3 text-sm font-semibold text-blue-900">
                    {operatorCostPerHour.toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Din System Settings</div>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-violet-200 bg-violet-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-violet-800">Tonner</h4>
                  <button
                    type="button"
                    onClick={addTonerConsumable}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adaugă tonner
                  </button>
                </div>
                <div className="overflow-hidden rounded-lg border border-violet-200 bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="bg-violet-50 text-violet-900">
                      <tr>
                        <th className="px-3 py-2 text-left">Tip</th>
                        <th className="px-3 py-2 text-left">Preț</th>
                        <th className="px-3 py-2 text-left">Pagini / toner</th>
                        <th className="px-3 py-2 text-left">Cost / pagină</th>
                        <th className="px-3 py-2 text-left">Acțiune</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tonerConsumables.map((item, index) => (
                        <tr key={index} className="border-t border-violet-100">
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => {
                                setTonerPickerIndex(index);
                                setTonerMaterialSearch('');
                              }}
                              className="w-full rounded border border-violet-200 bg-violet-50 px-2 py-1 text-left text-violet-700 hover:bg-violet-100"
                            >
                              {item.type || 'Alege material'}
                            </button>
                          </td>
                          <td className="px-3 py-2"><input type="number" readOnly value={item.cost ?? 0} className="w-full rounded border border-gray-300 bg-gray-50 px-2 py-1" /></td>
                          <td className="px-3 py-2"><input type="number" value={item.yieldPages ?? 0} onChange={(e) => updateTonerConsumable(index, 'yieldPages', Number(e.target.value) || 0)} className="w-full rounded border border-gray-300 px-2 py-1" /></td>
                          <td className="px-3 py-2">{((Number(item.cost ?? 0) / Math.max(Number(item.yieldPages ?? 0), 1))).toFixed(2)}</td>
                          <td className="px-3 py-2"><button type="button" className="rounded border border-red-200 px-2 py-1 text-red-600">Șterge</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {tonerPickerIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                  <div className="w-full max-w-3xl rounded-xl border border-violet-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                      <h4 className="text-sm font-semibold text-violet-900">Selectează material tonner după mapă</h4>
                      <button
                        type="button"
                        onClick={() => setTonerPickerIndex(null)}
                        className="rounded border border-gray-200 p-1 text-gray-500 hover:bg-gray-50"
                        aria-label="Închide selector material"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="border-b border-gray-100 px-4 py-3">
                      <input
                        type="text"
                        value={tonerMaterialSearch}
                        onChange={(e) => setTonerMaterialSearch(e.target.value)}
                        placeholder="Caută material sau mapă..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="max-h-[55vh] overflow-y-auto px-4 py-3">
                      {materialsByFolder.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-4 text-sm text-gray-500">
                          Nu există materiale pentru filtrul curent.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {materialsByFolder.map(([folder, materials]) => (
                            <div key={folder} className="rounded-lg border border-gray-200">
                              <div className="border-b border-gray-100 bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
                                {folder}
                              </div>
                              <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-2">
                                {materials.map((material) => {
                                  const isSelected = tonerConsumables[tonerPickerIndex]?.materialId === material.id;
                                  return (
                                    <button
                                      key={material.id}
                                      type="button"
                                      onClick={() => selectTonerMaterial(tonerPickerIndex, material.id)}
                                      className={`rounded-lg border px-3 py-2 text-left transition ${
                                        isSelected
                                          ? 'border-violet-400 bg-violet-50 text-violet-900'
                                          : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                                      }`}
                                    >
                                      <div className="text-sm font-medium">{material.name}</div>
                                      <div className="mt-1 text-xs text-gray-500">
                                        Preț: {Number(material.purchasePrice ?? material.salePrice ?? 0).toFixed(2)} MDL
                                        {material.unit ? ` / ${material.unit}` : ''}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-amber-800">Consumabile</div>
                  <button
                    type="button"
                    onClick={addMaintenanceComponent}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adaugă consumabil
                  </button>
                </div>
                <div className="overflow-hidden rounded-lg border border-amber-200 bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="bg-amber-50 text-amber-900">
                      <tr>
                        <th className="px-3 py-2 text-left">Denumire</th>
                        <th className="px-3 py-2 text-left">Preț</th>
                        <th className="px-3 py-2 text-left">Pagini recomandate</th>
                        <th className="px-3 py-2 text-left">Cost / pagină</th>
                        <th className="px-3 py-2 text-left">Acțiune</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceComponents.map((component) => (
                        <MaintenanceComponentRow
                          key={component.id}
                          component={component}
                          onChange={updateMaintenanceComponent}
                          onDelete={deleteMaintenanceComponent}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-cyan-200 bg-white p-3">
                <div className="mb-2 text-sm font-semibold text-cyan-800" dangerouslySetInnerHTML={{ __html: 'Vitez&#259; dup&#259; gramaj' }} />
                <div className="overflow-hidden rounded-lg border border-cyan-100">
                  <table className="min-w-full text-sm">
                    <thead className="bg-cyan-50 text-cyan-900">
                      <tr>
                        <th className="px-3 py-2 text-left">Gramaj min</th>
                        <th className="px-3 py-2 text-left">Gramaj max</th>
                        <th className="px-3 py-2 text-left">Viteză</th>
                        <th className="px-3 py-2 text-left">Cost net / pagină</th>
                      </tr>
                    </thead>
                    <tbody>
                      {speedProfiles.map((profile: { minWeight: number; maxWeight: number; speedPpm: number }, index: number) => (
                        <tr key={`${profile.minWeight}-${profile.maxWeight}-${index}`} className="border-t border-cyan-100">
                          <td className="px-3 py-2"><input type="number" value={profile.minWeight ?? 0} onChange={(e) => updateSpeedProfile(index, 'minWeight', Number(e.target.value) || 0)} className="w-full rounded border border-gray-300 px-2 py-1" /></td>
                          <td className="px-3 py-2"><input type="number" value={profile.maxWeight ?? 0} onChange={(e) => updateSpeedProfile(index, 'maxWeight', Number(e.target.value) || 0)} className="w-full rounded border border-gray-300 px-2 py-1" /></td>
                          <td className="px-3 py-2">
                            <input type="number" value={profile.speedPpm ?? 0} onChange={(e) => updateSpeedProfile(index, 'speedPpm', Number(e.target.value) || 0)} className="w-full rounded border border-gray-300 px-2 py-1" />
                            <div className="mt-1 text-xs text-cyan-700">
                              {digitalProfileCosts[index] ? `~${digitalProfileCosts[index].netCostPerPage.toFixed(4)} MDL/pag.` : ''}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-cyan-900 font-semibold">
                            {digitalProfileCosts[index] ? `${digitalProfileCosts[index].netCostPerPage.toFixed(4)} MDL` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <NumericField name="printMarginsMm" label="Margini neprintabile" suffix="mm" step="0.1" placeholder="5" tooltip="Marginea neprintabilă de pe perimetrul foii." />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField name="maxFormat" render={({ field }) => (
                  <div>
                    <FormLabel>
                      <span className="inline-flex items-center gap-1.5">
                        <span>Format maxim</span>
                        <span title="Formatul maxim al colii sau suportului acceptat de echipament." aria-label="Formatul maxim al colii sau suportului acceptat de echipament." className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-gray-500 cursor-help"><Info className="h-3 w-3" /></span>
                      </span>
                    </FormLabel>
                    <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">— selectează —</option>
                      {['A4', 'A3', 'SRA3', 'SRA2', 'B2', 'B1'].map((f) => (<option key={f} value={f}>{f}</option>))}
                    </select>
                  </div>
                )} />
              </div>

            </div>
          )}

          {/* ===== HOURLY ===== */}
          {['OFFSET', 'EMBROIDERY', 'PLOTTER_CUTTING'].includes(normalizedEquipmentType) && (
            <div className="space-y-4 rounded-xl border border-orange-200 bg-orange-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-all">
              <h3 className="text-sm font-semibold text-orange-800">Parametri Orar (cost per oră)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <NumericField name="costPerHour"         label="Cost mașină"    suffix="lei/h" placeholder="50" tooltip="Costul de funcționare al echipamentului pentru o oră de lucru." />
                <NumericField name="operatorCostPerHour" label="Cost operator"  suffix="lei/h" placeholder="25" tooltip="Tariful orar al operatorului necesar pentru utilizarea echipamentului." />
                <NumericField name="energyConsumptionKw" label="Consum energie" suffix="kW"    placeholder="3.5" tooltip="Consum energetic mediu pe oră, folosit la calculul costului total." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="speed"
                  render={({ field }) => (
                    <div>
                      <FormLabel>
                        <span className="inline-flex items-center gap-1.5">
                          <span>Viteză (opțional)</span>
                          <span
                            title="Descriere operațională liberă a vitezei: mm/s, cicluri/h, bucăți/oră sau alt indicator util operatorilor."
                            aria-label="Descriere operațională liberă a vitezei: mm/s, cicluri/h, bucăți/oră sau alt indicator util operatorilor."
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-gray-500 cursor-help"
                          >
                            <Info className="h-3 w-3" />
                          </span>
                        </span>
                      </FormLabel>
                      <Input {...field} value={field.value ?? ''} placeholder="ex: 1000 mm/s, 200 cicluri/h" />
                    </div>
                  )}
                />
                <NumericField name="maxWidth" label="Lățime max" suffix="mm" step="1" tooltip="Lățimea maximă de lucru admisă pentru această operațiune tehnologică." />
              </div>
            </div>
          )}
          </section>

          <section className={activeTab === 'maintenance' ? 'space-y-5 rounded-2xl border border-gray-200 bg-white p-5' : 'hidden'}>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Maintenance</h3>
                <p className="mt-1 text-sm text-gray-500">Full maintenance history and audit trail.</p>
                {latestMaintenanceDate && (
                  <p className="mt-1 text-sm font-medium text-gray-700">Last Maintenance: {latestMaintenanceDate}</p>
                )}
              </div>
              <button
                type="button"
                onClick={openNewMaintenanceForm}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Maintenance
              </button>
            </div>

            {draftRecord && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={draftRecord.date}
                      onChange={(e) => setDraftRecord({ ...draftRecord, date: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Maintenance Type</label>
                    <select
                      value={draftRecord.type}
                      onChange={(e) => setDraftRecord({ ...draftRecord, type: e.target.value as MachineMaintenanceRecord['type'] })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      {['Preventive', 'Corrective', 'Calibration', 'Repair', 'Part Replacement', 'Inspection'].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                    <input
                      value={draftRecord.description}
                      onChange={(e) => setDraftRecord({ ...draftRecord, description: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Cost</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draftRecord.cost ?? 0}
                      onChange={(e) => setDraftRecord({ ...draftRecord, cost: Number(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Technician</label>
                    <input
                      value={draftRecord.technician ?? ''}
                      onChange={(e) => setDraftRecord({ ...draftRecord, technician: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      rows={3}
                      value={draftRecord.notes ?? ''}
                      onChange={(e) => setDraftRecord({ ...draftRecord, notes: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setDraftRecord(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">Cancel</button>
                  <button type="button" onClick={saveMaintenanceRecord} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">Save Maintenance</button>
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Date</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Description</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Cost</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Technician</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Notes</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {maintenanceHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-gray-500">No maintenance records yet.</td>
                    </tr>
                  ) : (
                    maintenanceHistory.map((record) => (
                      <tr key={record.id} className="align-top">
                        <td className="px-3 py-2">{new Date(record.date).toLocaleDateString('ro-MD')}</td>
                        <td className="px-3 py-2">{record.type}</td>
                        <td className="px-3 py-2">{record.description}</td>
                        <td className="px-3 py-2">{record.cost != null ? `${record.cost.toFixed(2)} €` : '—'}</td>
                        <td className="px-3 py-2">{record.technician || '—'}</td>
                        <td className="px-3 py-2 max-w-xs">{record.notes || '—'}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => openEditMaintenanceForm(record)} className="rounded border border-gray-200 p-1.5 hover:bg-gray-100" aria-label="Edit Maintenance">
                              <Pencil className="h-3.5 w-3.5 text-gray-600" />
                            </button>
                            <button type="button" onClick={() => deleteMaintenanceRecord(record.id)} className="rounded border border-red-200 p-1.5 hover:bg-red-50" aria-label="Delete Maintenance">
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Acțiuni */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                Anulează
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                className="flex-1"
              >
                {machine ? 'Actualizează' : 'Adaugă echipament'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
