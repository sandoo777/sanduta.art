"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { PrintMethodWithRelations, CreatePrintMethodInput } from "@/modules/print-methods/types";
import { PRINT_METHOD_TYPES } from "@/modules/print-methods/types";
import { useMaterials } from "@/modules/materials/useMaterials";
import { useMachines } from "@/modules/machines/useMachines";
import type { Material } from "@/modules/materials/types";
import type { Machine } from "@/modules/machines/types";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/ui/FormField";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Package, Cpu, Info } from "lucide-react";
import { ConsumablesManager } from "./ConsumablesManager";

// Validation schema
const printMethodFormSchema = z.object({
  name: z.string().min(1, "Numele este obligatoriu").trim(),
  type: z.string().min(1, "Tipul este obligatoriu"),
  isOutsourced: z.boolean().default(false),
  baseCost: z.number().min(0, "Costul de bază trebuie să fie pozitiv").optional().nullable(),
  costPerM2: z.number().min(0, "Costul per m² trebuie să fie pozitiv").optional().nullable(),
  costPerSheet: z.number().min(0, "Costul per coală trebuie să fie pozitiv").optional().nullable(),
  costFurnizorPerM2: z.number().min(0, "Costul furnizor per m² trebuie să fie pozitiv").optional().nullable(),
  costFurnizorPerUnit: z.number().min(0, "Costul furnizor per unitate trebuie să fie pozitiv").optional().nullable(),
  termenFurnizor: z.string().optional().nullable(),
  markup: z.number().min(0, "Markup trebuie să fie pozitiv").optional().nullable(),
  speed: z.string().optional().nullable(),
  colorMode: z.string().optional().nullable(),
  maxWidth: z.number().int().min(0, "Lățimea trebuie să fie pozitivă").optional().nullable(),
  maxHeight: z.number().int().min(0, "Înălțimea trebuie să fie pozitivă").optional().nullable(),
  description: z.string().optional().nullable(),
  active: z.boolean().default(true),
  compatibleMaterialIds: z.array(z.string()).default([]),
  compatibleEquipmentIds: z.array(z.string()).default([]),
});

type PrintMethodFormData = z.output<typeof printMethodFormSchema>;

interface PrintMethodFormProps {
  printMethod?: PrintMethodWithRelations | null;
  onClose: () => void;
  onSave: (data: CreatePrintMethodInput) => Promise<void>;
}

type TabType = 'general' | 'compatibilities' | 'consumables';

function PrintMethodTab({
  id,
  label,
  icon: Icon,
  count,
  activeTab,
  onSelect,
}: {
  id: TabType;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
  activeTab: TabType;
  onSelect: (tab: TabType) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`
        flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition-colors
        ${activeTab === id
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`
          px-1.5 py-0.5 text-xs rounded-full
          ${activeTab === id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
        `}>
          {count}
        </span>
      )}
    </button>
  );
}

export function PrintMethodForm({ printMethod, onClose, onSave }: PrintMethodFormProps) {
  const { getMaterials } = useMaterials();
  const { getMachines } = useMachines();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('general');

  const form = useForm({
    resolver: zodResolver(printMethodFormSchema),
    defaultValues: {
      name: printMethod?.name || "",
      type: printMethod?.type || "Digital",
      isOutsourced: printMethod?.isOutsourced ?? false,
      baseCost: printMethod?.baseCost ?? null,
      costPerM2: printMethod?.costPerM2 ?? null,
      costPerSheet: printMethod?.costPerSheet ?? null,
      costFurnizorPerM2: printMethod?.costFurnizorPerM2 ?? null,
      costFurnizorPerUnit: printMethod?.costFurnizorPerUnit ?? null,
      termenFurnizor: printMethod?.termenFurnizor ?? "",
      markup: printMethod?.markup ?? null,
      speed: printMethod?.speed || "",
      colorMode: printMethod?.colorMode || "",
      maxWidth: printMethod?.maxWidth ?? null,
      maxHeight: printMethod?.maxHeight ?? null,
      description: printMethod?.description || "",
      active: printMethod?.active ?? true,
      compatibleMaterialIds: printMethod?.compatibleMaterials?.map(m => m.id) || [],
      compatibleEquipmentIds: printMethod?.compatibleEquipment?.map(e => e.id) || [],
    },
  }) as UseFormReturn<PrintMethodFormData>;

  const { formState: { isSubmitting } } = form;
  const isOutsourced = useWatch({ control: form.control, name: "isOutsourced" });
  const compatibleMaterialIds = useWatch({ control: form.control, name: "compatibleMaterialIds" });
  const compatibleEquipmentIds = useWatch({ control: form.control, name: "compatibleEquipmentIds" });

  const loadMaterials = useCallback(async () => {
    const data = await getMaterials();
    setMaterials(data.filter((material) => material.active));
  }, [getMaterials]);

  const loadMachines = useCallback(async () => {
    const data = await getMachines();
    setMachines(data.filter((machine) => machine.active));
  }, [getMachines]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      void loadMaterials();
      void loadMachines();
    }, 0);

    return () => {
      clearTimeout(timerId);
    };
  }, [loadMachines, loadMaterials]);

  // Reset form when printMethod changes (for switching between create/edit or between different methods)
  useEffect(() => {
    const timerId = setTimeout(() => {
      form.reset({
        name: printMethod?.name || "",
        type: printMethod?.type || "Digital",
        isOutsourced: printMethod?.isOutsourced ?? false,
        baseCost: printMethod?.baseCost ?? null,
        costPerM2: printMethod?.costPerM2 ?? null,
        costPerSheet: printMethod?.costPerSheet ?? null,
        costFurnizorPerM2: printMethod?.costFurnizorPerM2 ?? null,
        costFurnizorPerUnit: printMethod?.costFurnizorPerUnit ?? null,
        termenFurnizor: printMethod?.termenFurnizor ?? "",
        markup: printMethod?.markup ?? null,
        speed: printMethod?.speed || "",
        colorMode: printMethod?.colorMode || "",
        maxWidth: printMethod?.maxWidth ?? null,
        maxHeight: printMethod?.maxHeight ?? null,
        description: printMethod?.description || "",
        active: printMethod?.active ?? true,
        compatibleMaterialIds: printMethod?.compatibleMaterials?.map((material) => material.id) || [],
        compatibleEquipmentIds: printMethod?.compatibleEquipment?.map((equipment) => equipment.id) || [],
      });
    }, 0);

    return () => {
      clearTimeout(timerId);
    };
  }, [printMethod, form]);

  useEffect(() => {
    if (isOutsourced) {
      const timerId = setTimeout(() => {
        form.setValue("compatibleMaterialIds", []);
        form.setValue("compatibleEquipmentIds", []);

        if (activeTab === 'compatibilities' || activeTab === 'consumables') {
          setActiveTab('general');
        }
      }, 0);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [isOutsourced, activeTab, form]);

  const handleFormSubmit = async (data: PrintMethodFormData) => {
    await onSave(data as CreatePrintMethodInput);
    onClose();
  };

  const submitForm = form.handleSubmit(handleFormSubmit);

  const toggleMaterial = (materialId: string) => {
    const currentIds = form.getValues("compatibleMaterialIds") || [];
    const newIds = currentIds.includes(materialId)
      ? currentIds.filter((id) => id !== materialId)
      : [...currentIds, materialId];
    form.setValue("compatibleMaterialIds", newIds);
  };

  const toggleMachine = (machineId: string) => {
    const currentIds = form.getValues("compatibleEquipmentIds") || [];
    const newIds = currentIds.includes(machineId)
      ? currentIds.filter((id) => id !== machineId)
      : [...currentIds, machineId];
    form.setValue("compatibleEquipmentIds", newIds);
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-xl font-bold text-gray-900">
          {printMethod ? "Editare Metodă de Printare" : "Adăugare Metodă de Printare"}
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 bg-gray-50 border-b">
        <PrintMethodTab id="general" label="General" icon={Info} activeTab={activeTab} onSelect={setActiveTab} />
        {!isOutsourced && (
          <PrintMethodTab 
            id="compatibilities" 
            label="Compatibilități"
            icon={Package}
            count={(compatibleMaterialIds?.length || 0) + (compatibleEquipmentIds?.length || 0)}
            activeTab={activeTab}
            onSelect={setActiveTab}
          />
        )}
        {printMethod && !isOutsourced && (
          <PrintMethodTab 
            id="consumables" 
            label="Consumabile"
            icon={Cpu}
            count={printMethod._count?.consumables || 0}
            activeTab={activeTab}
            onSelect={setActiveTab}
          />
        )}
      </div>

      {/* Form */}
      <Form<PrintMethodFormData> form={form} onSubmit={handleFormSubmit} className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
        
        {/* TAB: General */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            {/* Name */}
            <FormField
              name="name"
              render={({ field }) => (
                <div>
                  <FormLabel required>Nume metodă</FormLabel>
                  <Input
                    {...field}
                    placeholder="ex: UV Printing High Gloss"
                  />
                  <FormMessage />
                </div>
              )}
            />

            {/* Type & Color Mode */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="type"
                render={({ field }) => (
                  <div>
                    <FormLabel required>Tip metodă</FormLabel>
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {PRINT_METHOD_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                    <FormMessage />
                  </div>
                )}
              />

              <FormField
                name="colorMode"
                render={({ field }) => (
                  <div>
                    <FormLabel>Mod culoare</FormLabel>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="ex: CMYK + White"
                    />
                    <FormMessage />
                  </div>
                )}
              />
            </div>

            <FormField
              name="isOutsourced"
              render={({ field }) => (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <input
                    type="checkbox"
                    id="isOutsourced"
                    checked={field.value}
                    onChange={field.onChange}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                  />
                  <label htmlFor="isOutsourced" className="text-sm font-medium text-amber-800">
                    Metodă Outsource
                  </label>
                  <FormMessage />
                </div>
              )}
            />

            {/* Costs */}
            <div>
              <FormLabel className="mb-2 block">{isOutsourced ? 'Costuri Furnizor' : 'Costuri'}</FormLabel>
              {isOutsourced ? (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    name="costFurnizorPerM2"
                    render={({ field }) => (
                      <div>
                        <FormLabel className="text-xs text-gray-600">Cost furnizor per m² (lei)</FormLabel>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value ? parseFloat(e.target.value) : null;
                            field.onChange(val !== null && !isNaN(val) ? val : null);
                          }}
                        />
                        <FormMessage />
                      </div>
                    )}
                  />

                  <FormField
                    name="costFurnizorPerUnit"
                    render={({ field }) => (
                      <div>
                        <FormLabel className="text-xs text-gray-600">Cost furnizor per unitate (lei)</FormLabel>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value ? parseFloat(e.target.value) : null;
                            field.onChange(val !== null && !isNaN(val) ? val : null);
                          }}
                        />
                        <FormMessage />
                      </div>
                    )}
                  />

                  <FormField
                    name="termenFurnizor"
                    render={({ field }) => (
                      <div>
                        <FormLabel className="text-xs text-gray-600">Termen furnizor</FormLabel>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="ex: 3-5 zile lucrătoare"
                        />
                        <FormMessage />
                      </div>
                    )}
                  />

                  <FormField
                    name="markup"
                    render={({ field }) => (
                      <div>
                        <FormLabel className="text-xs text-gray-600">Markup (%)</FormLabel>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="ex: 25"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value ? parseFloat(e.target.value) : null;
                            field.onChange(val !== null && !isNaN(val) ? val : null);
                          }}
                        />
                        <FormMessage />
                      </div>
                    )}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                <FormField
                  name="baseCost"
                  render={({ field }) => (
                    <div>
                      <FormLabel className="text-xs text-gray-600">Cost de bază (lei)</FormLabel>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : null;
                          field.onChange(val !== null && !isNaN(val) ? val : null);
                        }}
                      />
                      <FormMessage />
                    </div>
                  )}
                />

                <FormField
                  name="costPerM2"
                  render={({ field }) => (
                    <div>
                      <FormLabel className="text-xs text-gray-600">Cost per m² (lei)</FormLabel>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : null;
                          field.onChange(val !== null && !isNaN(val) ? val : null);
                        }}
                      />
                      <FormMessage />
                    </div>
                  )}
                />

                <FormField
                  name="costPerSheet"
                  render={({ field }) => (
                    <div>
                      <FormLabel className="text-xs text-gray-600">Cost per coală (lei)</FormLabel>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value ? parseFloat(e.target.value) : null;
                          field.onChange(val !== null && !isNaN(val) ? val : null);
                        }}
                      />
                      <FormMessage />
                    </div>
                  )}
                />
              </div>
              )}
            </div>

            {/* Speed */}
            {!isOutsourced && <FormField
              name="speed"
              render={({ field }) => (
                <div>
                  <FormLabel>Viteză producție</FormLabel>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="ex: 25 m²/oră"
                  />
                  <p className="text-xs text-gray-500 mt-1">Specificați viteza de producție estimată</p>
                  <FormMessage />
                </div>
              )}
            />}

            {/* Dimensions */}
            {!isOutsourced && <div>
              <FormLabel className="mb-2 block">Dimensiuni maxime</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="maxWidth"
                  render={({ field }) => (
                    <div>
                      <FormLabel className="text-xs text-gray-600">Lățime (mm)</FormLabel>
                      <Input
                        type="number"
                        min="0"
                        placeholder="ex: 3200"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value) : null;
                          field.onChange(val !== null && !isNaN(val) ? val : null);
                        }}
                      />
                      <FormMessage />
                    </div>
                  )}
                />

                <FormField
                  name="maxHeight"
                  render={({ field }) => (
                    <div>
                      <FormLabel className="text-xs text-gray-600">Înălțime (mm)</FormLabel>
                      <Input
                        type="number"
                        min="0"
                        placeholder="ex: 2000"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value) : null;
                          field.onChange(val !== null && !isNaN(val) ? val : null);
                        }}
                      />
                      <FormMessage />
                    </div>
                  )}
                />
              </div>
            </div>}

            {/* Description */}
            <FormField
              name="description"
              render={({ field }) => (
                <div>
                  <FormLabel>Descriere tehnică</FormLabel>
                  <textarea
                    {...field}
                    value={field.value || ""}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detalii tehnice despre metodă..."
                  />
                  <FormMessage />
                </div>
              )}
            />

            {/* Active Status */}
            <FormField
              name="active"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={field.value}
                    onChange={field.onChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Metodă activă (disponibilă în producție)
                  </label>
                  <FormMessage />
                </div>
              )}
            />
          </div>
        )}

        {/* TAB: Compatibilities */}
        {activeTab === 'compatibilities' && !isOutsourced && (
          <div className="space-y-6">
            {/* Materials */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <FormLabel className="text-base font-semibold">Materiale compatibile</FormLabel>
                <Badge variant="default">
                  {compatibleMaterialIds?.length || 0} selectate
                </Badge>
              </div>
              <FormField
                name="compatibleMaterialIds"
                render={({ field }) => (
                  <div>
                    <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2 bg-gray-50">
                      {materials.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Nu există materiale active</p>
                      ) : (
                        materials.map((material) => (
                          <label
                            key={material.id}
                            className="flex items-center gap-3 cursor-pointer hover:bg-white p-2.5 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={field.value?.includes(material.id)}
                              onChange={() => toggleMaterial(material.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{material.name}</div>
                              <div className="text-xs text-gray-500">
                                {material.categoryInfo?.name || material.category || 'N/A'} • {material.unit}
                              </div>
                            </div>
                            {material.stock < material.minStock && (
                              <Badge variant="danger" size="sm">Stoc scăzut</Badge>
                            )}
                          </label>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Selectează materialele pe care această metodă le poate procesa
                    </p>
                    <FormMessage />
                  </div>
                )}
              />
            </div>

            {/* Equipment */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <FormLabel className="text-base font-semibold">Echipamente compatibile</FormLabel>
                <Badge variant="default">
                  {compatibleEquipmentIds?.length || 0} selectate
                </Badge>
              </div>
              <FormField
                name="compatibleEquipmentIds"
                render={({ field }) => (
                  <div>
                    <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2 bg-gray-50">
                      {machines.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Nu există echipamente active</p>
                      ) : (
                        machines.map((machine) => (
                          <label
                            key={machine.id}
                            className="flex items-center gap-3 cursor-pointer hover:bg-white p-2.5 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={field.value?.includes(machine.id)}
                              onChange={() => toggleMachine(machine.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{machine.name}</div>
                              <div className="text-xs text-gray-500">
                                {machine.type} • {machine.status}
                              </div>
                            </div>
                            <Badge 
                              variant={
                                machine.status === 'AVAILABLE' ? 'success' :
                                machine.status === 'BUSY' ? 'warning' :
                                'default'
                              }
                              size="sm"
                            >
                              {machine.status === 'AVAILABLE' ? 'Liber' :
                               machine.status === 'BUSY' ? 'Ocupat' :
                               machine.status === 'MAINTENANCE' ? 'Mentenanță' :
                               machine.status}
                            </Badge>
                          </label>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Selectează echipamentele care pot utiliza această metodă
                    </p>
                    <FormMessage />
                  </div>
                )}
              />
            </div>
          </div>
        )}

        {/* TAB: Consumables */}
        {activeTab === 'consumables' && printMethod && !isOutsourced && (
          <ConsumablesManager printMethodId={printMethod.id} />
        )}
      </Form>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
        <div className="text-xs text-gray-500">
          {printMethod ? `ID: ${printMethod.id}` : 'Metodă nouă'}
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Anulează
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            onClick={submitForm}
          >
            {printMethod ? 'Actualizează' : 'Creează'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
