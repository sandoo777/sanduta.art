'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormLabel } from '@/components/ui/FormLabel';
import type { EquipmentConsumable } from '@/modules/machines/types';

interface Material {
  id: string;
  name: string;
  unit: string;
  consumptionType: string;
  stock: number;
  pricePerUnit?: number;
}

interface EquipmentConsumablesProps {
  machineId: string | null; // null for new machines
  initialConsumables?: EquipmentConsumable[];
}

interface ConsumableFormData {
  id?: string;
  materialId: string;
  consumptionPerSqm: number | null;
  consumptionPerUnit: number | null;
  consumptionPerJob: number | null;
  unit: string;
  notes: string;
  isNew?: boolean;
}

export function EquipmentConsumables({ machineId, initialConsumables = [] }: EquipmentConsumablesProps) {
  const [consumables, setConsumables] = useState<EquipmentConsumable[]>(initialConsumables);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ConsumableFormData>({
    materialId: '',
    consumptionPerSqm: null,
    consumptionPerUnit: null,
    consumptionPerJob: null,
    unit: 'ml',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/materials?active=true');
      if (response.ok) {
        const allMaterials = await response.json();
        // Filter only DIRECT consumption type materials
        const directMaterials = allMaterials.filter((m: Material) => m.consumptionType === 'DIRECT');
        setMaterials(directMaterials);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  }, []);

  const fetchConsumables = useCallback(async () => {
    if (!machineId) return;
    
    try {
      const response = await fetch(`/api/admin/machines/${machineId}/consumables`);
      if (response.ok) {
        const data = await response.json();
        setConsumables(data);
      }
    } catch (err) {
      console.error('Error fetching consumables:', err);
    }
  }, [machineId]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      void fetchMaterials();
      if (machineId) {
        void fetchConsumables();
      }
    }, 0);

    return () => {
      clearTimeout(timerId);
    };
  }, [fetchConsumables, fetchMaterials, machineId]);

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setFormData({
      materialId: '',
      consumptionPerSqm: null,
      consumptionPerUnit: null,
      consumptionPerJob: null,
      unit: 'ml',
      notes: '',
      isNew: true,
    });
    setError(null);
  };

  const handleEdit = (consumable: EquipmentConsumable) => {
    setEditingId(consumable.id);
    setIsAddingNew(false);
    setFormData({
      id: consumable.id,
      materialId: consumable.materialId,
      consumptionPerSqm: consumable.consumptionPerSqm,
      consumptionPerUnit: consumable.consumptionPerUnit,
      consumptionPerJob: consumable.consumptionPerJob,
      unit: consumable.unit,
      notes: consumable.notes || '',
    });
    setError(null);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({
      materialId: '',
      consumptionPerSqm: null,
      consumptionPerUnit: null,
      consumptionPerJob: null,
      unit: 'ml',
      notes: '',
    });
    setError(null);
  };

  const handleSave = async () => {
    if (!machineId) {
      setError('Salvează mai întâi echipamentul pentru a adăuga consumabile');
      return;
    }

    if (!formData.materialId) {
      setError('Selectează un material');
      return;
    }

    // Validate at least one consumption field is filled
    if (!formData.consumptionPerSqm && !formData.consumptionPerUnit && !formData.consumptionPerJob) {
      setError('Completează cel puțin un câmp de consum');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isAddingNew) {
        // POST new consumable
        const response = await fetch(`/api/admin/machines/${machineId}/consumables`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            materialId: formData.materialId,
            consumptionPerSqm: formData.consumptionPerSqm,
            consumptionPerUnit: formData.consumptionPerUnit,
            consumptionPerJob: formData.consumptionPerJob,
            unit: formData.unit,
            notes: formData.notes || null,
            active: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create consumable');
        }

        await fetchConsumables();
        handleCancel();
      } else if (editingId) {
        // PATCH existing consumable
        const response = await fetch(`/api/admin/machines/${machineId}/consumables/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consumptionPerSqm: formData.consumptionPerSqm,
            consumptionPerUnit: formData.consumptionPerUnit,
            consumptionPerJob: formData.consumptionPerJob,
            unit: formData.unit,
            notes: formData.notes || null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update consumable');
        }

        await fetchConsumables();
        handleCancel();
      }
    } catch (_err) {
      setError(err instanceof Error ? err.message : 'Eroare la salvare');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (consumableId: string) => {
    if (!machineId) return;
    if (!confirm('Sigur vrei să ștergi acest consumabil?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/machines/${machineId}/consumables/${consumableId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete consumable');
      }

      await fetchConsumables();
    } catch (_err) {
      setError('Eroare la ștergere');
    } finally {
      setIsLoading(false);
    }
  };

  const getMaterialName = (materialId: string) => {
    const material = materials.find((m) => m.id === materialId);
    return material ? `${material.name} (${material.unit})` : 'Material necunoscut';
  };

  return (
    <section className="space-y-5 rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
      <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Consumabile Utilaj
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Vopsele, pulberi, soluții consumate automat de acest echipament
          </p>
        </div>
        {!isAddingNew && !editingId && (
          <Button
            type="button"
            variant="primary"
            onClick={handleAddNew}
            disabled={!machineId}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adaugă
          </Button>
        )}
      </div>

      {!machineId && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
          Salvează mai întâi echipamentul pentru a putea adăuga consumabile.
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAddingNew || editingId) && (
        <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-blue-900">
            {isAddingNew ? 'Consumabil nou' : 'Editează consumabil'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel required>Material (vopsea, pulbere, soluție)</FormLabel>
              <select
                value={formData.materialId}
                onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                disabled={!isAddingNew}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Selectează material...</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.unit}) - Stoc: {m.stock}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FormLabel>Unitate măsură consum</FormLabel>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="Volum">
                  <option value="liter">Litri (l)</option>
                  <option value="ml">Mililitri (ml)</option>
                </optgroup>
                <optgroup label="Greutate">
                  <option value="kg">Kilograme (kg)</option>
                  <option value="gram">Grame (g)</option>
                </optgroup>
                <optgroup label="Unități">
                  <option value="unit">Unități (buc)</option>
                  <option value="pcs">Piese (pcs)</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FormLabel>Consum per m² (Large Format)</FormLabel>
              <Input
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0000"
                value={formData.consumptionPerSqm ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consumptionPerSqm: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
              />
              <p className="mt-1 text-xs text-gray-500">
                Câte {formData.unit} se consumă per m² tipărit
              </p>
            </div>

            <div>
              <FormLabel>Consum per unitate (Digital)</FormLabel>
              <Input
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0000"
                value={formData.consumptionPerUnit ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consumptionPerUnit: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
              />
              <p className="mt-1 text-xs text-gray-500">
                Câte {formData.unit} se consumă per click/pagină
              </p>
            </div>

            <div>
              <FormLabel>Consum per job (fix)</FormLabel>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.consumptionPerJob ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consumptionPerJob: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
              />
              <p className="mt-1 text-xs text-gray-500">
                Câte {formData.unit} se consumă per job (indiferent de cantitate)
              </p>
            </div>
          </div>

          <div>
            <FormLabel>Observații</FormLabel>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Detalii despre consum, frecvență înlocuire, etc."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Anulează
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSave}
              loading={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Salvează
            </Button>
          </div>
        </div>
      )}

      {/* Consumables List */}
      {consumables.length === 0 && !isAddingNew && machineId && (
        <div className="text-center py-8 text-gray-500">
          <p>Nu sunt consumabile configurate pentru acest echipament</p>
        </div>
      )}

      {consumables.length > 0 && (
        <div className="space-y-3">
          {consumables.map((consumable) => (
            <div
              key={consumable.id}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {consumable.material?.name || getMaterialName(consumable.materialId)}
                  </h4>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    {consumable.consumptionPerSqm && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Per m²:</span>
                        <span className="font-medium text-purple-700">
                          {consumable.consumptionPerSqm} {consumable.unit}
                        </span>
                      </div>
                    )}
                    {consumable.consumptionPerUnit && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Per unitate:</span>
                        <span className="font-medium text-blue-700">
                          {consumable.consumptionPerUnit} {consumable.unit}
                        </span>
                      </div>
                    )}
                    {consumable.consumptionPerJob && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Per job:</span>
                        <span className="font-medium text-orange-700">
                          {consumable.consumptionPerJob} {consumable.unit}
                        </span>
                      </div>
                    )}
                  </div>
                  {consumable.notes && (
                    <p className="mt-2 text-sm text-gray-600">{consumable.notes}</p>
                  )}
                  {consumable.material && (
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>Stoc curent: {consumable.material.stock} {consumable.material.unit}</span>
                      {consumable.material.pricePerUnit && (
                        <span>Preț: {consumable.material.pricePerUnit} MDL/{consumable.material.unit}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleEdit(consumable)}
                    disabled={isLoading || isAddingNew || !!editingId}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Editează
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleDelete(consumable.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
