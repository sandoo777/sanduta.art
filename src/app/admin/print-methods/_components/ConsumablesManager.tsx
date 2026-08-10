"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { usePrintMethods } from "@/modules/print-methods/usePrintMethods";
import { useMaterials } from "@/modules/materials/useMaterials";
import type { PrintMethodConsumable } from "@/modules/print-methods/types";
import type { Material } from "@/modules/materials/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { FormLabel } from "@/components/ui/FormLabel";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

interface ConsumablesManagerProps {
  printMethodId: string;
}

export function ConsumablesManager({ printMethodId }: ConsumablesManagerProps) {
  const { getConsumables, createConsumable, updateConsumable, deleteConsumable } = usePrintMethods();
  const { getMaterials } = useMaterials();
  const { confirm, Dialog } = useConfirmDialog();
  
  const [consumables, setConsumables] = useState<PrintMethodConsumable[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<{
    materialId: string;
    costPerSqm: string;
    costPerJob: string;
    notes: string;
    active: boolean;
  }>({
    materialId: "",
    costPerSqm: "",
    costPerJob: "",
    notes: "",
    active: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [consumablesData, materialsData] = await Promise.all([
        getConsumables(printMethodId),
        getMaterials(),
      ]);
      setConsumables(consumablesData);
      // Filter to only consumable materials (liquids, inks, etc.)
      setMaterials(materialsData.filter(m => m.active));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [getConsumables, getMaterials, printMethodId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormData({
      materialId: "",
      costPerSqm: "",
      costPerJob: "",
      notes: "",
      active: true,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (consumable: PrintMethodConsumable) => {
    setEditingId(consumable.id);
    setIsAdding(false);
    setFormData({
      materialId: consumable.materialId,
      costPerSqm: consumable.costPerSqm?.toString() || "",
      costPerJob: consumable.costPerJob?.toString() || "",
      notes: consumable.notes || "",
      active: consumable.active,
    });
  };

  const handleSave = async () => {
    // Validation
    if (!formData.materialId) {
      toast.error("Selectează un material");
      return;
    }

    if (!formData.costPerSqm && !formData.costPerJob) {
      toast.error("Completează cel puțin un câmp de cost");
      return;
    }

    const data = {
      materialId: formData.materialId,
      costPerSqm: formData.costPerSqm ? parseFloat(formData.costPerSqm) : undefined,
      costPerJob: formData.costPerJob ? parseFloat(formData.costPerJob) : undefined,
      notes: formData.notes || undefined,
      active: formData.active,
    };

    if (editingId) {
      // Update existing
      const result = await updateConsumable(printMethodId, editingId, data);
      if (result) {
        await loadData();
        resetForm();
      }
    } else {
      // Create new
      const result = await createConsumable(printMethodId, data);
      if (result) {
        await loadData();
        resetForm();
      }
    }
  };

  const handleDelete = async (consumableId: string) => {
    await confirm({
      title: "Șterge consumabil",
      message: "Sigur vrei să ștergi acest consumabil?",
      variant: "danger",
      onConfirm: async () => {
        const success = await deleteConsumable(printMethodId, consumableId);
        if (success) {
          await loadData();
        }
      },
    });
  };

  // Filter materials already used
  const availableMaterials = materials.filter(m =>
    isAdding ? !consumables.some(c => c.materialId === m.id) : true
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Consumabile Indirecte</h3>
          <p className="text-xs text-gray-500 mt-1">
            Materiale consumabile folosite în procesul de printare (vopsele, soluții, etc.)
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAdd}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adaugă
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-blue-900">
              {editingId ? "Editare consumabil" : "Consumabil nou"}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Anulează
            </button>
          </div>

          {/* Material Selector */}
          <div>
            <FormLabel>Material</FormLabel>
            <select
              value={formData.materialId}
              onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
              disabled={!!editingId}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Selectează material...</option>
              {availableMaterials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name} ({material.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Costs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FormLabel className="text-xs">Cost per m² (lei)</FormLabel>
              <Input
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.00"
                value={formData.costPerSqm}
                onChange={(e) => setFormData({ ...formData, costPerSqm: e.target.value })}
              />
            </div>
            <div>
              <FormLabel className="text-xs">Cost per job (lei)</FormLabel>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.costPerJob}
                onChange={(e) => setFormData({ ...formData, costPerJob: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <FormLabel className="text-xs">Notițe</FormLabel>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detalii despre consumabil..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="consumableActive"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="consumableActive" className="text-sm text-gray-700">
              Consumabil activ
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
            >
              Anulează
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
            >
              {editingId ? "Actualizează" : "Adaugă"}
            </Button>
          </div>
        </div>
      )}

      {/* Warning if no costs at all */}
      {consumables.length === 0 && !isAdding && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Niciun consumabil definit</p>
            <p className="text-xs mt-1">
              Adaugă consumabile indirecte dacă această metodă folosește materiale suplimentare (vopsele, soluții de curățare, etc.)
            </p>
          </div>
        </div>
      )}

      {/* Consumables List */}
      {consumables.length > 0 && (
        <div className="space-y-2">
          {consumables.map((consumable) => (
            <div
              key={consumable.id}
              className={`
                border rounded-lg p-3 transition-all
                ${consumable.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}
                ${editingId === consumable.id ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-gray-900">
                      {consumable.material?.name}
                    </h4>
                    {!consumable.active && (
                      <Badge variant="default" size="sm">Inactiv</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    {consumable.costPerSqm && (
                      <span className="font-medium text-blue-600">
                        {Number(consumable.costPerSqm).toFixed(4)} lei/m²
                      </span>
                    )}
                    {consumable.costPerJob && (
                      <span className="font-medium text-green-600">
                        {Number(consumable.costPerJob).toFixed(2)} lei/job
                      </span>
                    )}
                    <span className="text-gray-400">•</span>
                    <span>{consumable.material?.unit}</span>
                    {consumable.material?.stock !== undefined && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>Stoc: {consumable.material.stock}</span>
                      </>
                    )}
                  </div>

                  {consumable.notes && (
                    <p className="text-xs text-gray-500 mt-1">{consumable.notes}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(consumable)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Editează"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(consumable.id)}
                    className="p-1.5 hover:bg-red-50 rounded transition-colors"
                    title="Șterge"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="text-sm text-gray-500">Se încarcă...</div>
        </div>
      )}

      <Dialog />
    </div>
  );
}
