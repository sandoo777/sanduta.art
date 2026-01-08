"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { PrintMethod, CreatePrintMethodInput } from "@/modules/print-methods/types";
import { PRINT_METHOD_TYPES } from "@/modules/print-methods/types";
import { useMaterials } from "@/modules/materials/useMaterials";
import type { Material } from "@/modules/materials/types";

interface PrintMethodFormProps {
  printMethod?: PrintMethod | null;
  onClose: () => void;
  onSave: (data: CreatePrintMethodInput) => Promise<void>;
}

export function PrintMethodForm({ printMethod, onClose, onSave }: PrintMethodFormProps) {
  const { getMaterials } = useMaterials();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePrintMethodInput>({
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
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const data = await getMaterials();
    setMaterials(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const toggleMaterial = (materialId: string) => {
    setFormData((prev) => ({
      ...prev,
      materialIds: prev.materialIds?.includes(materialId)
        ? prev.materialIds.filter((id) => id !== materialId)
        : [...(prev.materialIds || []), materialId],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {printMethod ? "Edit Print Method" : "Add Print Method"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume metodă <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ex: Digital Color Print"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tip metodă <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {PRINT_METHOD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Costs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost per m² (lei)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPerM2 || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      costPerM2: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost per coală (lei)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPerSheet || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      costPerSheet: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Speed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Viteză producție
              </label>
              <input
                type="text"
                value={formData.speed || ""}
                onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ex: 100 m²/oră"
              />
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lățime maximă (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxWidth || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxWidth: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: 3200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Înălțime maximă (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxHeight || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxHeight: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: 1600"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descriere tehnică
              </label>
              <textarea
                rows={3}
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detalii tehnice despre metodă..."
              />
            </div>

            {/* Compatible Materials */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materiale compatibile
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                {materials.map((material) => (
                  <label
                    key={material.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.materialIds?.includes(material.id)}
                      onChange={() => toggleMaterial(material.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{material.name}</span>
                    <span className="text-xs text-gray-500">({material.unit})</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selectate: {formData.materialIds?.length || 0}
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Metodă activă
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Anulează
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Se salvează..." : "Salvează"}
          </button>
        </div>
      </div>
    </div>
  );
}
