"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PrintMethod } from "@/modules/print-methods/types";
import { PRINT_METHOD_TYPES } from "@/modules/print-methods/types";
import { useMaterials } from "@/modules/materials/useMaterials";
import type { Material } from "@/modules/materials/types";
import { printMethodFormSchema, type PrintMethodFormData } from "@/lib/validations/admin";
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface PrintMethodFormProps {
  printMethod?: PrintMethod | null;
  onClose: () => void;
  onSave: (data: PrintMethodFormData) => Promise<void>;
}

export function PrintMethodForm({ printMethod, onClose, onSave }: PrintMethodFormProps) {
  const { getMaterials } = useMaterials();
  const [materials, setMaterials] = useState<Material[]>([]);

  const form = useForm<PrintMethodFormData>({
    resolver: zodResolver(printMethodFormSchema),
    defaultValues: {
      name: printMethod?.name || "",
      type: printMethod?.type || "Digital",
      costPerM2: printMethod?.costPerM2 || undefined,
      costPerSheet: printMethod?.costPerSheet || undefined,
      speed: printMethod?.speed || "",
      maxWidth: printMethod?.maxWidth || undefined,
      maxHeight: printMethod?.maxHeight || undefined,
      description: printMethod?.description || "",
      active: printMethod?.active ?? true,
      materialIds: printMethod?.materialIds || [],
    },
  });

  const { formState: { isSubmitting } } = form;

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const data = await getMaterials();
    setMaterials(data);
  };

  const handleFormSubmit = async (data: PrintMethodFormData) => {
    await onSave(data);
    onClose();
  };

  const toggleMaterial = (materialId: string) => {
    const currentIds = form.getValues("materialIds") || [];
    const newIds = currentIds.includes(materialId)
      ? currentIds.filter((id) => id !== materialId)
      : [...currentIds, materialId];
    form.setValue("materialIds", newIds);
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-xl font-bold text-gray-900">
          {printMethod ? "Edit Print Method" : "Add Print Method"}
        </h2>
      </div>

      {/* Form */}
      <Form form={form} onSubmit={handleFormSubmit} className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
        <div className="space-y-4">
          {/* Name */}
          <FormField
              name="name"
              render={({ field }) => (
                <div>
                  <FormLabel required>Nume metodă</FormLabel>
                  <Input
                    {...field}
                    placeholder="ex: Digital Color Print"
                  />
                  <FormMessage />
                </div>
              )}
            />

            {/* Type */}
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

            {/* Costs */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="costPerM2"
                render={({ field }) => (
                  <div>
                    <FormLabel>Cost per m² (lei)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                    <FormMessage />
                  </div>
                )}
              />

              <FormField
                name="costPerSheet"
                render={({ field }) => (
                  <div>
                    <FormLabel>Cost per coală (lei)</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                    <FormMessage />
                  </div>
                )}
              />
            </div>

            {/* Speed */}
            <FormField
              name="speed"
              render={({ field }) => (
                <div>
                  <FormLabel>Viteză producție</FormLabel>
                  <Input
                    {...field}
                    placeholder="ex: 100 m²/oră"
                  />
                  <FormMessage />
                </div>
              )}
            />

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="maxWidth"
                render={({ field }) => (
                  <div>
                    <FormLabel>Lățime maximă (mm)</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      placeholder="ex: 3200"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                    <FormMessage />
                  </div>
                )}
              />

              <FormField
                name="maxHeight"
                render={({ field }) => (
                  <div>
                    <FormLabel>Înălțime maximă (mm)</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      placeholder="ex: 1600"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                    <FormMessage />
                  </div>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              name="description"
              render={({ field }) => (
                <div>
                  <FormLabel>Descriere tehnică</FormLabel>
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detalii tehnice despre metodă..."
                  />
                  <FormMessage />
                </div>
              )}
            />

            {/* Compatible Materials */}
            <FormField
              name="materialIds"
              render={({ field }) => (
                <div>
                  <FormLabel>Materiale compatibile</FormLabel>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                    {materials.map((material) => (
                      <label
                        key={material.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={field.value?.includes(material.id)}
                          onChange={() => toggleMaterial(material.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{material.name}</span>
                        <span className="text-xs text-gray-500">({material.unit})</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Selectate: {field.value?.length || 0}
                  </p>
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
                    Metodă activă
                  </label>
                  <FormMessage />
                </div>
              )}
            />
          </div>
        </Form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
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
          onClick={() => form.handleSubmit(handleFormSubmit)()}
        >
          Salvează
        </Button>
      </div>
    </Modal>
  );
}
