"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { materialFormSchema, type MaterialFormData } from "@/lib/validations/admin";
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useMaterials } from "@/modules/materials/useMaterials";
import type { Material } from "@/modules/materials/types";

interface MaterialModalProps {
  material?: Material;
  onClose: () => void;
  onSuccess: () => void;
}

export function MaterialModal({ material, onClose, onSuccess }: MaterialModalProps) {
  const { createMaterial, updateMaterial, isLoading } = useMaterials();
  
  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      name: "",
      type: "",
      unit: "",
      quantity: "",
      price: "",
      supplier: "",
    },
  });

  useEffect(() => {
    if (material) {
      form.reset({
        name: material.name,
        type: material.type || "",
        unit: material.unit,
        quantity: material.stock?.toString() || "0",
        price: material.costPerUnit?.toString() || "0",
        supplier: material.supplier || "",
      });
    }
  }, [material, form]);

  const onSubmit = async (data: MaterialFormData) => {
    const success = material
      ? await updateMaterial(material.id, {
          name: data.name,
          type: data.type,
          unit: data.unit,
          stock: parseFloat(data.quantity),
          costPerUnit: parseFloat(data.price),
          supplier: data.supplier,
          sku: material.sku,
          minStock: material.minStock,
          notes: material.notes,
        })
      : await createMaterial({
          name: data.name,
          type: data.type,
          unit: data.unit,
          stock: parseFloat(data.quantity),
          costPerUnit: parseFloat(data.price),
          supplier: data.supplier,
          sku: "",
          minStock: 0,
          notes: "",
        });

    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {material ? "Editează Material" : "Adaugă Material Nou"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <Form form={form} onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <div>
                <FormLabel>
                  Nume Material <span className="text-red-500">*</span>
                </FormLabel>
                <Input {...field} placeholder="ex: Folie PVC" />
                <FormMessage />
              </div>
            )}
          />

          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <div>
                <FormLabel>
                  Tip Material <span className="text-red-500">*</span>
                </FormLabel>
                <Input {...field} placeholder="ex: Folie, Hârtie, Carton" />
                <FormMessage />
              </div>
            )}
          />

          {/* Unit */}
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <div>
                <FormLabel>
                  Unitate de măsură <span className="text-red-500">*</span>
                </FormLabel>
                <select
                  {...field}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selectează unitatea</option>
                  <option value="kg">kg (kilograme)</option>
                  <option value="m">m (metri)</option>
                  <option value="m2">m² (metri pătrați)</option>
                  <option value="ml">ml (mililitri)</option>
                  <option value="l">l (litri)</option>
                  <option value="pcs">pcs (bucăți)</option>
                  <option value="set">set</option>
                  <option value="roll">roll (rulou)</option>
                </select>
                <FormMessage />
              </div>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <div>
                  <FormLabel>Stoc curent</FormLabel>
                  <Input {...field} type="number" step="0.01" placeholder="0" />
                  <FormMessage />
                </div>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <div>
                  <FormLabel>Cost/Unitate (MDL)</FormLabel>
                  <Input {...field} type="number" step="0.01" placeholder="0.00" />
                  <FormMessage />
                </div>
              )}
            />
          </div>

          {/* Supplier */}
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <div>
                <FormLabel>Furnizor (opțional)</FormLabel>
                <Input {...field} placeholder="ex: ABC Materials SRL" />
                <FormMessage />
              </div>
            )}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              disabled={isLoading || form.formState.isSubmitting}
            >
              {isLoading || form.formState.isSubmitting ? "Se salvează..." : material ? "Salvează" : "Creează"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
