"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { LoadingState } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobFormSchema, type JobFormData } from "@/lib/validations/admin";
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { fetchOrders, fetchUsers } from '@/lib/api';
import { Order, User } from '@/types/models';
import { EQUIPMENT_TYPE_CONFIG } from '@/modules/machines/types';
import type { CompatibleMachine } from '@/app/api/admin/machines/suggest/route';
import {
  calculateProductionTime,
  calculateProductionCost,
  formatProductionTime,
  formatCurrency,
  getQuantityLabel,
  getQuantityPlaceholder,
  type EquipmentTypeForCalc,
} from '@/lib/production-time';

const PRIORITY_OPTIONS = [
  { value: "LOW",    label: "Scazuta" },
  { value: "NORMAL", label: "Normala" },
  { value: "HIGH",   label: "Ridicata" },
  { value: "URGENT", label: "Urgenta" },
];

interface PrintMethod {
  id: string;
  name: string;
  type: string;
  isOutsourced?: boolean;
  costFurnizorPerM2?: number | null;
  costFurnizorPerUnit?: number | null;
  termenFurnizor?: string | null;
  markup?: number | null;
}
interface Material    { id: string; name: string; unit: string; }
interface OrderProduct {
  id: string;
  name: string;
  saleUnit?: 'M2' | 'UNIT' | null;
  pricePerM2?: number | null;
  pricePerUnit?: number | null;
  pricing?: unknown;
  supplierCost?: number | null;
  markup?: number | null;
  printMethodId?: string | null;
  materialId?: string | null;
  isOutsourced?: boolean;
}
interface MethodConsumable {
  id: string;
  materialId: string;
  costPerSqm: number | null;
  costPerJob: number | null;
  material?: { id: string; name: string; unit: string };
}

interface JobModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  onSubmit:     (data: JobFormData) => Promise<void>;
  initialData?: JobFormData;
  mode?:        "create" | "edit";
}

export default function JobModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
}: JobModalProps) {

  const [orders,       setOrders]       = useState<Order[]>([]);
  const [operators,    setOperators]    = useState<User[]>([]);
  const [printMethods, setPrintMethods] = useState<PrintMethod[]>([]);
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [materials,    setMaterials]    = useState<Material[]>([]);
  const [allMachines,  setAllMachines]  = useState<CompatibleMachine[]>([]);
  const [loadingData,  setLoadingData]  = useState(true);
  const [methodConsumables, setMethodConsumables] = useState<MethodConsumable[]>([]);

  const [suggestedMachines,   setSuggestedMachines]   = useState<CompatibleMachine[]>([]);
  const [suggestMessage,      setSuggestMessage]      = useState<string | undefined>();
  const [loadingSuggest,      setLoadingSuggest]      = useState(false);
  const [loadingMaterials,    setLoadingMaterials]    = useState(false);
  const [materialsMessage,    setMaterialsMessage]    = useState<string | undefined>();

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      name:       "",
      orderId:    "",
      productId:  "",
      status:     "PENDING",
      priority:   "NORMAL",
      assignedTo: "",
      printMethodId: "",
      materialId: "",
      machineId:  "",
      quantity:   undefined,
      bwPages:    undefined,
      deadline:   "",
      notes:      "",
    },
  });

  const { formState: { isSubmitting }, reset } = form;

  const watchedPrintMethodId = useWatch({ control: form.control, name: 'printMethodId' });
  const watchedOrderId = useWatch({ control: form.control, name: 'orderId' });
  const watchedProductId = useWatch({ control: form.control, name: 'productId' });
  const watchedMaterialId = useWatch({ control: form.control, name: 'materialId' });
  const watchedMachineId = useWatch({ control: form.control, name: 'machineId' });
  const watchedQuantity  = useWatch({ control: form.control, name: 'quantity' });
  const watchedBwPages   = useWatch({ control: form.control, name: 'bwPages' });

  const selectedMachine = useMemo(
    () => suggestedMachines.find((m) => m.id === watchedMachineId) ?? null,
    [suggestedMachines, watchedMachineId],
  );

  const selectedPrintMethod = useMemo(
    () => printMethods.find((m) => m.id === watchedPrintMethodId) ?? null,
    [printMethods, watchedPrintMethodId],
  );

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === watchedOrderId) ?? null,
    [orders, watchedOrderId],
  );

  const orderProducts = useMemo(() => {
    const items = (selectedOrder as unknown as { orderItems?: Array<{ product?: OrderProduct | null }> } | null)?.orderItems ?? [];
    const deduped = new Map<string, OrderProduct>();

    for (const item of items) {
      const product = item.product;
      if (product?.id && !deduped.has(product.id)) {
        const pricing = (product.pricing ?? null) as Record<string, unknown> | null;
        const supplierCostRaw = pricing?.supplierCost;
        const markupRaw = pricing?.markup;
        const supplierCost = supplierCostRaw != null && Number.isFinite(Number(supplierCostRaw))
          ? Number(supplierCostRaw)
          : null;
        const markup = markupRaw != null && Number.isFinite(Number(markupRaw))
          ? Number(markupRaw)
          : null;
        deduped.set(product.id, {
          ...product,
          supplierCost,
          markup,
        });
      }
    }

    return Array.from(deduped.values());
  }, [selectedOrder]);

  const selectedProduct = useMemo(
    () => orderProducts.find((product) => product.id === watchedProductId) ?? null,
    [orderProducts, watchedProductId],
  );

  const isOutsourcedMethod = Boolean(selectedPrintMethod?.isOutsourced ?? selectedProduct?.isOutsourced);

  const outsourcePricing = useMemo(() => {
    if (!isOutsourcedMethod || !selectedProduct || !watchedQuantity || Number(watchedQuantity) <= 0) {
      return null;
    }

    const qty = Number(watchedQuantity);
    const supplierPerUnit = Number(selectedProduct.supplierCost ?? 0);
    const supplierCost = supplierPerUnit * qty;
    const markupPercent = Number(selectedProduct.markup ?? selectedPrintMethod?.markup ?? 0);
    const markupValue = supplierCost * (markupPercent / 100);
    const salePrice = supplierCost + markupValue;

    return {
      supplierCost,
      markupPercent,
      markupValue,
      salePrice,
    };
  }, [isOutsourcedMethod, selectedPrintMethod, selectedProduct, watchedQuantity]);

  const estimatedSale = useMemo(() => {
    if (outsourcePricing) {
      return outsourcePricing.salePrice;
    }

    if (!selectedProduct || !watchedQuantity || Number(watchedQuantity) <= 0) {
      return null;
    }

    const qty = Number(watchedQuantity);
    const unitPrice = selectedProduct.saleUnit === 'M2'
      ? Number(selectedProduct.pricePerM2 ?? 0)
      : Number(selectedProduct.pricePerUnit ?? 0);

    if (unitPrice <= 0) {
      return null;
    }

    return qty * unitPrice;
  }, [outsourcePricing, selectedProduct, watchedQuantity]);

  const { estimatedTimeResult, timeCalcError } = useMemo(() => {
    if (!selectedMachine || !watchedQuantity || Number(watchedQuantity) <= 0) {
      return { estimatedTimeResult: null, timeCalcError: '' };
    }
    try {
      const result = calculateProductionTime(
        {
          id:             selectedMachine.id,
          name:           selectedMachine.name,
          equipmentType:  selectedMachine.equipmentType as EquipmentTypeForCalc,
          speedM2PerHour: selectedMachine.speedM2PerHour,
          speedPpm:       selectedMachine.speedPpm,
        },
        { quantity: Number(watchedQuantity) },
      );
      return { estimatedTimeResult: result, timeCalcError: '' };
    } catch (err) {
      return {
        estimatedTimeResult: null,
        timeCalcError: err instanceof Error ? err.message : 'Calcul esuat',
      };
    }
  }, [selectedMachine, watchedQuantity]);

  const { estimatedCostResult, costCalcError } = useMemo(() => {
    if (outsourcePricing) {
      const profit = outsourcePricing.markupValue;

      return {
        estimatedCostResult: {
          estimatedCost: outsourcePricing.supplierCost,
          breakdown: `Outsource: ${outsourcePricing.supplierCost.toFixed(2)} RON (furnizor)${outsourcePricing.markupPercent > 0 ? ` + ${outsourcePricing.markupValue.toFixed(2)} RON markup` : ''}${outsourcePricing.salePrice > 0 ? ` | Pret vanzare: ${outsourcePricing.salePrice.toFixed(2)} RON` : ''}${profit > 0 ? ` | Profit estimat: ${profit.toFixed(2)} RON` : ''}`,
        },
        costCalcError: '',
      };
    }

    if (!selectedMachine || !watchedQuantity || Number(watchedQuantity) <= 0) {
      return { estimatedCostResult: null, costCalcError: '' };
    }
    try {
      const result = calculateProductionCost(
        {
          id:                selectedMachine.id,
          name:              selectedMachine.name,
          equipmentType:     selectedMachine.equipmentType as EquipmentTypeForCalc,
          inkPerM2:          selectedMachine.inkPerM2,
          materialPerM2:     selectedMachine.materialPerM2,
          headAmortPerM2:    selectedMachine.headAmortPerM2,
          printerAmortPerM2: selectedMachine.printerAmortPerM2,
          maintCostPerM2:    selectedMachine.maintCostPerM2,
          costClickColor:    selectedMachine.costClickColor,
          costClickBW:       selectedMachine.costClickBW,
          costPerHour:       selectedMachine.costPerHour,
        },
        {
          quantity: Number(watchedQuantity),
          bwPages: watchedBwPages ? Number(watchedBwPages) : 0,
        },
      );

      // Add indirect consumables cost from print method
      let consumablesCost = 0;
      if (methodConsumables.length > 0) {
        const qty = Number(watchedQuantity);
        methodConsumables.forEach((consumable) => {
          if (consumable.costPerSqm) {
            consumablesCost += consumable.costPerSqm * qty;
          }
          if (consumable.costPerJob) {
            consumablesCost += consumable.costPerJob;
          }
        });
      }

      const totalCost = result.estimatedCost + consumablesCost;
      const breakdownParts = [result.breakdown];
      if (consumablesCost > 0) {
        breakdownParts.push(`Consumabile: ${consumablesCost.toFixed(2)} RON`);
      }

      return {
        estimatedCostResult: {
          estimatedCost: totalCost,
          breakdown: breakdownParts.join(' + '),
        },
        costCalcError: '',
      };
    } catch (err) {
      return {
        estimatedCostResult: null,
        costCalcError: err instanceof Error ? err.message : 'Calcul cost esuat',
      };
    }
  }, [outsourcePricing, selectedMachine, watchedQuantity, watchedBwPages, methodConsumables]);

  const estimatedProfit = useMemo(() => {
    if (!estimatedCostResult) {
      return null;
    }

    const saleValue = estimatedSale ?? Number(selectedOrder?.totalPrice ?? 0);
    if (!saleValue || saleValue <= 0) {
      return null;
    }

    return saleValue - estimatedCostResult.estimatedCost;
  }, [estimatedCostResult, estimatedSale, selectedOrder]);

  const fetchData = useCallback(async () => {
    try {
      setLoadingData(true);
      const [ordersRes, managersRes, operatorsRes, machinesRes, methodsRes, matsRes] =
        await Promise.all([
          fetchOrders(),
          fetchUsers({ role: 'MANAGER' }),
          fetchUsers({ role: 'OPERATOR' }),
          fetch('/api/admin/machines/suggest', { credentials: 'include' })
            .then((r) => r.ok ? r.json() : { machines: [] }),
          fetch('/api/admin/print-methods', { credentials: 'include' })
            .then((r) => r.ok ? r.json() : []),
          fetch('/api/admin/materials', { credentials: 'include' })
            .then((r) => r.ok ? r.json() : []),
        ]);
      if (ordersRes.success && ordersRes.data) {
          const payload = ordersRes.data as unknown;
          const normalizedOrders = Array.isArray(payload)
            ? payload
            : ((payload as { orders?: Order[] })?.orders ?? []);
          setOrders(normalizedOrders as Order[]);
      }
      const uniqueOperators = [...(managersRes.data ?? []), ...(operatorsRes.data ?? [])].filter(
        (user, index, arr) => arr.findIndex((item) => item.id === user.id) === index
      );
      setOperators(uniqueOperators);
      const machines = Array.isArray(machinesRes) ? machinesRes : (machinesRes.machines ?? []);
      setAllMachines(machines);
      setPrintMethods(Array.isArray(methodsRes) ? methodsRes : []);
      const loadedMaterials = Array.isArray(matsRes) ? matsRes : [];
      setAllMaterials(loadedMaterials);
      setMaterials(loadedMaterials);
    } catch (err) {
      console.error("Error fetching job modal data:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      reset(initialData ?? {
        name: "", orderId: "", productId: "", status: "PENDING", priority: "NORMAL",
        assignedTo: "", printMethodId: "", materialId: "", machineId: "", quantity: undefined, bwPages: undefined, deadline: "", notes: "",
      });
    }
  }, [fetchData, initialData, isOpen, reset]);

  useEffect(() => {
    if (!selectedOrder) {
      form.setValue('productId', '');
      return;
    }

    if (!watchedProductId && orderProducts.length > 0) {
      form.setValue('productId', orderProducts[0].id);
    }
  }, [form, orderProducts, selectedOrder, watchedProductId]);

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    form.setValue('printMethodId', selectedProduct.printMethodId || '');
    form.setValue('materialId', selectedProduct.isOutsourced ? '' : (selectedProduct.materialId || ''));
  }, [form, selectedProduct]);

  useEffect(() => {
    if (!watchedPrintMethodId && !watchedMaterialId) {
      setSuggestedMachines(allMachines);
    }
  }, [allMachines, watchedMaterialId, watchedPrintMethodId]);

  useEffect(() => {
    if (isOutsourcedMethod) {
      form.setValue('machineId', '');
      form.setValue('materialId', '');
      form.setValue('bwPages', undefined);
    }
  }, [form, isOutsourcedMethod]);

  useEffect(() => {
    if (!watchedPrintMethodId && !watchedMachineId) {
      setMaterials(allMaterials);
      setMaterialsMessage(undefined);
    }
  }, [allMaterials, watchedMachineId, watchedPrintMethodId]);

  const fetchSuggestedMachines = useCallback(async (methodId: string, matId: string) => {
    if (!methodId && !matId) {
      setSuggestedMachines(allMachines);
      setSuggestMessage(undefined);
      return;
    }
    setLoadingSuggest(true);
    try {
      const params = new URLSearchParams();
      if (methodId) params.set('printMethodId', methodId);
      if (matId)    params.set('materialId',    matId);
      const res = await fetch(`/api/admin/machines/suggest?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json() as { machines: CompatibleMachine[]; message?: string };
        setSuggestedMachines(data.machines);
        setSuggestMessage(data.message);
        if (watchedMachineId && !data.machines.some((machine) => machine.id === watchedMachineId)) {
          form.setValue('machineId', '');
        }
      }
    } catch (err) {
      console.error('Error fetching suggested machines:', err);
    } finally {
      setLoadingSuggest(false);
    }
  }, [allMachines, form, watchedMachineId]);

  const fetchCompatibleMaterials = useCallback(async (methodId: string, machineId: string) => {
    if (!methodId && !machineId) {
      setMaterials(allMaterials);
      setMaterialsMessage(undefined);
      return;
    }

    setLoadingMaterials(true);
    try {
      const params = new URLSearchParams();
      if (methodId) params.set('printMethodId', methodId);
      if (machineId) params.set('equipmentId', machineId);

      const res = await fetch(`/api/admin/materials?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json() as Material[];
        setMaterials(data);

        if (watchedMaterialId && !data.some((material) => material.id === watchedMaterialId)) {
          form.setValue('materialId', '');
        }

        if (data.length === 0) {
          if (methodId && machineId) {
            setMaterialsMessage('Niciun material activ nu este compatibil simultan cu metoda și echipamentul selectate');
          } else if (methodId) {
            setMaterialsMessage('Niciun material activ nu este compatibil cu metoda selectată');
          } else {
            setMaterialsMessage('Niciun material activ nu este compatibil cu echipamentul selectat');
          }
        } else {
          setMaterialsMessage(undefined);
        }
      }
    } catch (err) {
      console.error('Error fetching compatible materials:', err);
    } finally {
      setLoadingMaterials(false);
    }
  }, [allMaterials, form, watchedMaterialId]);

  useEffect(() => {
    if (isOpen) fetchSuggestedMachines(watchedPrintMethodId || '', watchedMaterialId || '');
  }, [isOpen, watchedMaterialId, watchedPrintMethodId, fetchSuggestedMachines]);

  useEffect(() => {
    if (isOpen) fetchCompatibleMaterials(watchedPrintMethodId || '', watchedMachineId || '');
  }, [isOpen, watchedMachineId, watchedPrintMethodId, fetchCompatibleMaterials]);

  // Fetch consumables when printMethod changes
  useEffect(() => {
    const fetchMethodConsumables = async () => {
      if (!watchedPrintMethodId || isOutsourcedMethod) {
        setMethodConsumables([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/admin/print-methods/${watchedPrintMethodId}/consumables`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const data = await res.json() as MethodConsumable[];
          setMethodConsumables(data.filter((c) => c.material?.id));
        }
      } catch (err) {
        console.error('Error fetching method consumables:', err);
      }
    };

    if (isOpen) fetchMethodConsumables();
  }, [isOpen, watchedPrintMethodId, isOutsourcedMethod]);

  const handleFormSubmit = async (data: JobFormData) => {
    await onSubmit(data);
    handleClose();
  };

  const handleClose = () => {
    reset({ name: "", orderId: "", productId: "", status: "PENDING", priority: "NORMAL", assignedTo: "", printMethodId: "", materialId: "", machineId: "", quantity: undefined, bwPages: undefined, deadline: "", notes: "" });
    setSuggestedMachines([]);
    setSuggestMessage(undefined);
    setMaterials(allMaterials);
    setMaterialsMessage(undefined);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "Creare Job Productie" : "Editare Job Productie"}
          </h2>
        </div>

        <Form form={form} onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {loadingData ? (
            <LoadingState size="sm" text="Se incarca datele..." />
          ) : (
            <>
              <FormField
                name="name"
                render={({ field }) => (
                  <div>
                    <FormLabel required>Nume job</FormLabel>
                    <Input {...field} placeholder="ex: Printare 100 bannere" />
                    <FormMessage />
                  </div>
                )}
              />

              <FormField
                name="orderId"
                render={({ field }) => (
                  <div>
                    <FormLabel required>Comanda</FormLabel>
                    <Select
                      {...field}
                      options={[
                        { value: "", label: "Selecteaza o comanda" },
                        ...orders.map((o) => ({
                          value: o.id,
                          label: `${o.customerName} - ${o.totalPrice} RON (${o.status})`,
                        })),
                      ]}
                      fullWidth
                    />
                    <FormMessage />
                  </div>
                )}
              />

              <FormField
                name="productId"
                render={({ field }) => (
                  <div>
                    <FormLabel>Produs din comandă</FormLabel>
                    <Select
                      {...field}
                      options={[
                        { value: '', label: selectedOrder ? 'Selectează produsul' : 'Selectează întâi comanda' },
                        ...orderProducts.map((product) => ({
                          value: product.id,
                          label: product.name,
                        })),
                      ]}
                      fullWidth
                      disabled={!selectedOrder}
                    />
                    {selectedProduct && (
                      <p className="mt-1 text-xs text-blue-600">
                        Metoda/materialul implicite sunt preluate automat din configurația produsului.
                      </p>
                    )}
                    <FormMessage />
                  </div>
                )}
              />

              <FormField
                name="priority"
                render={({ field }) => (
                  <div>
                    <FormLabel>Prioritate</FormLabel>
                    <Select {...field} options={PRIORITY_OPTIONS} fullWidth />
                    <FormMessage />
                  </div>
                )}
              />

              <FormField
                name="deadline"
                render={({ field }) => (
                  <div>
                    <FormLabel>Termen limita</FormLabel>
                    <Input type="date" {...field} />
                    <FormMessage />
                  </div>
                )}
              />

              <FormField
                name="assignedTo"
                render={({ field }) => (
                  <div>
                    <FormLabel>Operator asignat</FormLabel>
                    <Select
                      {...field}
                      options={[
                        { value: "", label: "Neasignat" },
                        ...operators.map((op) => ({
                          value: op.id,
                          label: `${op.name} (${op.role})`,
                        })),
                      ]}
                      fullWidth
                    />
                    <FormMessage />
                  </div>
                )}
              />

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-4">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Compatibilitate productie
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    name="printMethodId"
                    render={({ field }) => (
                      <div>
                        <FormLabel>Metoda tiparire</FormLabel>
                        <Select
                          {...field}
                          options={[
                            { value: "", label: "Fara metoda specifica" },
                            ...printMethods.map((method) => ({
                              value: method.id,
                              label: method.name,
                            })),
                          ]}
                          fullWidth
                        />
                        <FormMessage />
                      </div>
                    )}
                  />

                  {!isOutsourcedMethod && (
                    <FormField
                      name="materialId"
                      render={({ field }) => (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <FormLabel>Material</FormLabel>
                            <div className="flex items-center gap-2">
                              {loadingMaterials && <span className="text-xs text-blue-500">Se actualizeaza...</span>}
                              {!loadingMaterials && materials.length > 0 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                                  {materials.length} compatibil{materials.length !== 1 ? 'e' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          {materialsMessage && materials.length === 0 ? (
                            <div className="w-full px-3 py-3 border border-amber-200 bg-amber-50 rounded-lg text-sm text-amber-700">
                              {materialsMessage}
                            </div>
                          ) : (
                            <Select
                              {...field}
                              options={[
                                { value: "", label: "Fara material specific" },
                                ...materials.map((material) => ({
                                  value: material.id,
                                  label: `${material.name} (${material.unit})`,
                                })),
                              ]}
                              fullWidth
                            />
                          )}
                          <FormMessage />
                        </div>
                      )}
                    />
                  )}
                </div>
              </div>

              {isOutsourcedMethod && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                    Metodă outsource
                  </p>
                  <p className="text-sm text-amber-800">
                    Pentru metode outsource nu se folosesc echipamente/materiale interne.
                  </p>
                  {selectedPrintMethod?.termenFurnizor && (
                    <p className="text-xs text-amber-700">Termen furnizor: {selectedPrintMethod.termenFurnizor}</p>
                  )}
                </div>
              )}

              {!isOutsourcedMethod && <FormField
                name="machineId"
                render={({ field }) => (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <FormLabel>Echipament</FormLabel>
                      {loadingSuggest && <span className="text-xs text-blue-500">Se actualizeaza...</span>}
                      {!loadingSuggest && (watchedPrintMethodId || watchedMaterialId) && (
                        <span className="text-xs text-gray-500">
                          {suggestedMachines.length} compatibil{suggestedMachines.length !== 1 ? 'e' : ''}
                        </span>
                      )}
                    </div>
                    {suggestMessage && suggestedMachines.length === 0 ? (
                      <div className="w-full px-3 py-3 border border-amber-200 bg-amber-50 rounded-lg text-sm text-amber-700">
                        {suggestMessage}
                      </div>
                    ) : (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Fara echipament specific</option>
                        {suggestedMachines.map((m) => {
                          const etCfg = EQUIPMENT_TYPE_CONFIG[m.equipmentType as keyof typeof EQUIPMENT_TYPE_CONFIG];
                          return (
                            <option key={m.id} value={m.id}>
                              {m.name} - {etCfg?.label ?? m.equipmentType} ({m.type})
                            </option>
                          );
                        })}
                      </select>
                    )}
                    <FormMessage />
                  </div>
                )}
              />}

              <FormField
                name="quantity"
                render={({ field }) => (
                  <div>
                    <FormLabel>
                      {selectedMachine
                        ? (selectedMachine.equipmentType === 'DIGITAL' ? 'Pagini color' : getQuantityLabel(selectedMachine.equipmentType))
                        : isOutsourcedMethod ? 'Cantitate outsource' : 'Cantitate (optional)'}
                    </FormLabel>
                    <Input
                      type="number"
                      step="any"
                      min="0.01"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value)}
                      placeholder={selectedMachine ? getQuantityPlaceholder(selectedMachine.equipmentType) : (isOutsourcedMethod ? 'ex: 100' : 'Selecteaza echipamentul mai intai')}
                      disabled={!selectedMachine && !isOutsourcedMethod}
                    />
                    {estimatedTimeResult && (
                      <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                        <span>&#x23F1;</span>
                        <span className="font-semibold">Timp estimat: {formatProductionTime(estimatedTimeResult.estimatedMinutes)}</span>
                        <span className="text-green-600/70 text-xs">({estimatedTimeResult.breakdown})</span>
                      </div>
                    )}
                    {timeCalcError && (
                      <p className="mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">{timeCalcError}</p>
                    )}
                    <FormMessage />
                  </div>
                )}
              />

              {selectedMachine?.equipmentType === 'DIGITAL' && !isOutsourcedMethod && (
                <FormField
                  name="bwPages"
                  render={({ field }) => (
                    <div>
                      <FormLabel>Pagini alb-negru</FormLabel>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value)}
                        placeholder="ex: 200"
                      />
                      <FormMessage />
                    </div>
                  )}
                />
              )}

              {(estimatedCostResult || costCalcError) && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                  estimatedCostResult
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  {estimatedCostResult ? (
                    <>
                      <span>&#x1F4B0;</span>
                      <span className="font-semibold">Cost estimat: {formatCurrency(estimatedCostResult.estimatedCost)}</span>
                      <span className="text-blue-600/70 text-xs">({estimatedCostResult.breakdown})</span>
                    </>
                  ) : (
                    <>
                      <span>&#x26A0;</span>
                      <span>{costCalcError}</span>
                    </>
                  )}
                </div>
              )}

              {estimatedCostResult && !isOutsourcedMethod && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-800">
                    Sinecost: <span className="font-semibold">{formatCurrency(estimatedCostResult.estimatedCost)}</span>
                  </div>
                  <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-800">
                    Pret vanzare: <span className="font-semibold">{estimatedSale ? formatCurrency(estimatedSale) : 'n/a'}</span>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-800">
                    Profit: <span className="font-semibold">{estimatedProfit !== null ? formatCurrency(estimatedProfit) : 'n/a'}</span>
                  </div>
                </div>
              )}

              {outsourcePricing && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-800">
                    Cost furnizor: <span className="font-semibold">{formatCurrency(outsourcePricing.supplierCost)}</span>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                    Markup: <span className="font-semibold">{outsourcePricing.markupPercent.toFixed(2)}% ({formatCurrency(outsourcePricing.markupValue)})</span>
                  </div>
                  <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-800">
                    Pret vanzare: <span className="font-semibold">{formatCurrency(outsourcePricing.salePrice)}</span>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-800">
                    Profit: <span className="font-semibold">{formatCurrency(outsourcePricing.markupValue)}</span>
                  </div>
                </div>
              )}

              {/* Indirect Consumables Info */}
              {methodConsumables.length > 0 && !isOutsourcedMethod && (
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
                    Consumabile indirecte ({methodConsumables.length})
                  </p>
                  <div className="space-y-1">
                    {methodConsumables.map((consumable) => (
                      <div key={consumable.id} className="flex items-center justify-between text-xs text-purple-800">
                        <span>{consumable.material?.name}</span>
                        <span className="font-medium">
                          {consumable.costPerSqm && `${Number(consumable.costPerSqm).toFixed(4)} lei/m²`}
                          {consumable.costPerSqm && consumable.costPerJob && ' + '}
                          {consumable.costPerJob && `${Number(consumable.costPerJob).toFixed(2)} lei/job`}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-purple-600 mt-2">
                    Consumabilele indirecte sunt incluse automat în costul estimat.
                  </p>
                </div>
              )}

              <FormField
                name="notes"
                render={({ field }) => (
                  <div>
                    <FormLabel>Observatii</FormLabel>
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                      placeholder="Detalii suplimentare despre acest job..."
                    />
                    <FormMessage />
                  </div>
                )}
              />
            </>
          )}
        </Form>

        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button type="button" variant="ghost" onClick={handleClose}>Anuleaza</Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || loadingData}
            onClick={() => form.handleSubmit(handleFormSubmit)()}
          >
            {mode === "create" ? "Creeaza job" : "Actualizeaza job"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
