'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormLabel } from '@/components/ui/FormLabel';
import { materialFormSchema, type MaterialFormData } from '@/lib/validations/admin';
import { useMaterials } from '@/modules/materials/useMaterials';
import type { Material } from '@/modules/materials/types';
import type { MaterialCategoryTree } from '@/modules/material-categories/types';
import { Plus } from 'lucide-react';
import CategoryTreeSelector from './CategoryTreeSelector';
import CategoryModal from './CategoryModal';

interface MaterialFormProps {
  material?: Material;
  onClose: () => void;
  onSuccess: () => void;
}

export function MaterialForm({ material, onClose, onSuccess }: MaterialFormProps) {
  const { createMaterial, updateMaterial, isLoading, lastError } = useMaterials();
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategoryTree | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isQuickCategoryModalOpen, setIsQuickCategoryModalOpen] = useState(false);
  const [categorySelectorKey, setCategorySelectorKey] = useState(0); // For forcing re-fetch

  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      name: material?.name ?? '',
      categoryId: material?.categoryId ?? '',
      consumptionType: material?.consumptionType ?? 'AREA_BASED',
      active: material?.active ?? true,
      sku: material?.sku ?? '',
      unit: material?.unit ?? 'pcs',
      stock: material?.stock?.toString() ?? '0',
      minStock: material?.minStock?.toString() ?? '0',
      pricePerSqm: material?.pricePerSqm?.toString() ?? '',
      pricePerMeter: material?.pricePerMeter?.toString() ?? '',
      pricePerUnit: material?.pricePerUnit?.toString() ?? '',
      thickness: material?.thickness?.toString() ?? '',
      density: material?.density?.toString() ?? '',
      wastePercent: material?.wastePercent?.toString() ?? '',
      notes: material?.notes ?? '',
      compatibleMethods: [],
      compatibleEquipment: [],
    },
  });

  const consumptionType = form.watch('consumptionType');

  function handleCategoryChange(categoryId: string, category: MaterialCategoryTree | null) {
    setSelectedCategory(category);
    form.setValue('categoryId', categoryId);
    
    // Clear fields that are not required by the new category
    if (category) {
      if (!category.requiresThickness) form.setValue('thickness', '');
      if (!category.requiresDensity) form.setValue('density', '');
      if (!category.requiresPricePerSqm) form.setValue('pricePerSqm', '');
      if (!category.requiresPricePerMeter) form.setValue('pricePerMeter', '');
      if (!category.requiresPricePerUnit) form.setValue('pricePerUnit', '');
      if (!category.requiresWastePercent) form.setValue('wastePercent', '');
    }
  }

  function handleQuickCategorySuccess(success: boolean) {
    setIsQuickCategoryModalOpen(false);
    if (success) {
      // Force CategoryTreeSelector to re-fetch categories
      setCategorySelectorKey(prev => prev + 1);
    }
  }

  const onSubmit = async (data: MaterialFormData) => {
    setSubmitError(null);

    const payload = {
      name: data.name.trim(),
      categoryId: data.categoryId,
      consumptionType: data.consumptionType,
      active: data.active,
      sku: data.sku.trim() || undefined,
      unit: data.unit,
      stock: Number(data.stock),
      minStock: Number(data.minStock),
      thickness: data.thickness ? Number(data.thickness) : null,
      density: data.density ? Number(data.density) : null,
      pricePerSqm: data.pricePerSqm ? Number(data.pricePerSqm) : null,
      pricePerMeter: data.pricePerMeter ? Number(data.pricePerMeter) : null,
      pricePerUnit: data.pricePerUnit ? Number(data.pricePerUnit) : null,
      wastePercent: data.wastePercent ? Number(data.wastePercent) : 0,
      notes: data.notes.trim() || undefined,
      compatibleMethods: [],
      compatibleEquipment: [],
      costPerUnit: Number(data.pricePerUnit || data.pricePerMeter || data.pricePerSqm || 0),
    };

    const response = material
      ? await updateMaterial(material.id, payload)
      : await createMaterial(payload);

    if (!response) {
      setSubmitError(lastError ?? 'Nu am putut salva materialul');
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      {/* General Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 border-b pb-2">
          General
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel>Nume material *</FormLabel>
            <Input {...form.register('name')} placeholder="ex: PVC Frontlit 510g" />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <FormLabel>Categorie *</FormLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <CategoryTreeSelector
                  key={categorySelectorKey}
                  value={form.watch('categoryId')}
                  onChange={handleCategoryChange}
                  error={form.formState.errors.categoryId?.message}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsQuickCategoryModalOpen(true)}
                className="flex-shrink-0 h-[42px] w-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-colors group"
                title="Adaugă categorie nouă"
              >
                <Plus className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              {...form.register('active')}
              className="h-4 w-4 rounded"
            />
            <div>
              <div className="text-sm font-medium">Activ</div>
              <div className="text-xs text-gray-500">Disponibil</div>
            </div>
          </label>

          <div>
            <FormLabel>SKU</FormLabel>
            <Input {...form.register('sku')} placeholder="MAT-001" />
          </div>

          <div>
            <FormLabel>Tip Consum *</FormLabel>
            <select
              {...form.register('consumptionType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="AREA_BASED">Bazat pe Arie (m²)</option>
              <option value="DIRECT">Consum Direct (vopsea, consumabile)</option>
            </select>
            {form.formState.errors.consumptionType && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.consumptionType.message}</p>
            )}
          </div>

          <div>
            <FormLabel>Unitate *</FormLabel>
            <select
              {...form.register('unit')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <optgroup label="Volum (pentru lichide)">
                <option value="liter">Litru (L)</option>
                <option value="ml">Mililitru (ml)</option>
              </optgroup>
              <optgroup label="Greutate">
                <option value="kg">Kilogram (kg)</option>
                <option value="gram">Gram (g)</option>
              </optgroup>
              <optgroup label="Suprafață">
                <option value="m2">Metru pătrat (m²)</option>
                <option value="meter">Metru (m)</option>
              </optgroup>
              <optgroup label="Unități">
                <option value="pcs">Bucăți (buc)</option>
                <option value="unit">Unitate</option>
              </optgroup>
            </select>
            {form.formState.errors.unit && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.unit.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Fields Based on Category */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 border-b pb-2">
          Proprietăți Material
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedCategory?.requiresThickness && (
            <div>
              <FormLabel>Grosime (mm) *</FormLabel>
              <Input {...form.register('thickness')} type="number" step="0.01" />
            </div>
          )}

          {selectedCategory?.requiresDensity && (
            <div>
              <FormLabel>Densitate (g/m²) *</FormLabel>
              <Input {...form.register('density')} type="number" step="0.01" />
            </div>
          )}

          {/* Always show price fields */}
          <div>
            <FormLabel>Preț per m² (MDL)</FormLabel>
            <Input {...form.register('pricePerSqm')} type="number" step="0.01" />
          </div>

          <div>
            <FormLabel>Preț per metru (MDL)</FormLabel>
            <Input {...form.register('pricePerMeter')} type="number" step="0.01" />
          </div>

          <div>
            <FormLabel>Preț per unitate (MDL) {consumptionType === 'DIRECT' ? '*' : ''}</FormLabel>
            <Input {...form.register('pricePerUnit')} type="number" step="0.01" />
          </div>

          {selectedCategory?.requiresWastePercent && (
            <div>
              <FormLabel>Procent waste (%) *</FormLabel>
              <Input {...form.register('wastePercent')} type="number" step="0.1" min="0" max="100" />
            </div>
          )}
        </div>
      </div>

      {/* Stock Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 border-b pb-2">
          Stoc
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel>Stoc actual *</FormLabel>
            <Input {...form.register('stock')} type="number" step="0.01" />
          </div>

          <div>
            <FormLabel>Stoc minim *</FormLabel>
            <Input {...form.register('minStock')} type="number" step="0.01" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <FormLabel>Note</FormLabel>
        <textarea
          {...form.register('notes')}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          placeholder="Note suplimentare..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onClose}>
          Anulează
        </Button>
        <Button type="submit" variant="primary" loading={isLoading}>
          {material ? 'Actualizează' : 'Creează'}
        </Button>
      </div>

      {/* Quick Category Modal */}
      {isQuickCategoryModalOpen && (
        <CategoryModal
          category={null}
          parentId={null}
          onClose={handleQuickCategorySuccess}
        />
      )}
    </form>
  );
}
