"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useMaterials } from "@/modules/materials/useMaterials";
import type { Material, CreateMaterialInput, UpdateMaterialInput } from "@/modules/materials/types";

interface MaterialModalProps {
  material?: Material;
  onClose: () => void;
  onSuccess: () => void;
}

export function MaterialModal({ material, onClose, onSuccess }: MaterialModalProps) {
  const { createMaterial, updateMaterial, isLoading } = useMaterials();
  const [formData, setFormData] = useState<CreateMaterialInput | UpdateMaterialInput>({
    name: material?.name || "",
    sku: material?.sku || "",
    unit: material?.unit || "",
    stock: material?.stock || 0,
    minStock: material?.minStock || 0,
    costPerUnit: material?.costPerUnit || 0,
    notes: material?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Numele este obligatoriu";
    }

    if (!formData.unit || formData.unit.trim() === "") {
      newErrors.unit = "Unitatea este obligatorie";
    }

    if (formData.stock !== undefined && formData.stock < 0) {
      newErrors.stock = "Stocul trebuie să fie >= 0";
    }

    if (formData.minStock !== undefined && formData.minStock < 0) {
      newErrors.minStock = "Stocul minim trebuie să fie >= 0";
    }

    if (formData.costPerUnit !== undefined && formData.costPerUnit < 0) {
      newErrors.costPerUnit = "Costul trebuie să fie >= 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const success = material
      ? await updateMaterial(material.id, formData)
      : await createMaterial(formData as CreateMaterialInput);

    if (success) {
      onSuccess();
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nume Material <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="ex: Folie PVC"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU (opțional)
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => handleChange("sku", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ex: PVC-001"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unitate de măsură <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.unit ? "border-red-500" : "border-gray-300"
              }`}
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
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stoc curent
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.stock}
                onChange={(e) => handleChange("stock", parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.stock ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
              )}
            </div>

            {/* Min Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stoc minim
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.minStock}
                onChange={(e) => handleChange("minStock", parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.minStock ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.minStock && (
                <p className="mt-1 text-sm text-red-600">{errors.minStock}</p>
              )}
            </div>

            {/* Cost Per Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost/Unitate (MDL)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.costPerUnit}
                onChange={(e) => handleChange("costPerUnit", parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.costPerUnit ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.costPerUnit && (
                <p className="mt-1 text-sm text-red-600">{errors.costPerUnit}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Adaugă note despre material..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Se salvează..." : material ? "Salvează" : "Creează"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
