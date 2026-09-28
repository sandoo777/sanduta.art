'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { FormLabel } from '@/components/ui/FormLabel';
import type { MaterialFormData } from '@/lib/validations/admin';
import { useMaterialPropertyLists } from '@/modules/settings/useMaterialPropertyLists';
import { MaterialPropertyQuickControls } from '@/components/material/MaterialPropertyQuickControls';

type PropertiesSectionProps = {
  unit: string;
  showThicknessField: boolean;
  showDensityField: boolean;
};

export function PropertiesSection({
  unit,
  showThicknessField,
  showDensityField,
}: PropertiesSectionProps) {
  const form = useFormContext<MaterialFormData>();
  const {
    lists,
    mutating,
    error,
    addValue,
    updateValue,
    deleteValue,
    clearError,
  } = useMaterialPropertyLists(true);

  const selectedFinish = (form.watch('finishType') ?? '').trim();
  const selectedColor = (form.watch('colorName') ?? '').trim();
  const selectedTexture = (form.watch('texture') ?? '').trim();

  const finishOptions = Array.from(new Set([
    ...lists.finishes.filter((item) => item.enabled).map((item) => item.value),
    selectedFinish,
  ].filter(Boolean)));
  const colorOptions = Array.from(new Set([
    ...lists.colors.filter((item) => item.enabled).map((item) => item.value),
    selectedColor,
  ].filter(Boolean)));
  const textureOptions = Array.from(new Set([
    ...lists.textures.filter((item) => item.enabled).map((item) => item.value),
    selectedTexture,
  ].filter(Boolean)));

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">Proprietăți Fizice</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <FormLabel htmlFor="finishType">Finisaj suprafață</FormLabel>
            <select
              id="finishType"
              {...form.register('finishType')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Nespecificat —</option>
              {finishOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <MaterialPropertyQuickControls
              type="finishes"
              label="finisaj"
              items={lists.finishes}
              selectedValue={selectedFinish}
              mutating={mutating}
              error={error}
              addValue={addValue}
              updateValue={updateValue}
              deleteValue={deleteValue}
              clearError={clearError}
              onApplyValue={(value) => form.setValue('finishType', value, { shouldDirty: true, shouldValidate: true })}
            />
            <p className="mt-1 text-xs text-gray-400">Tipul de finisaj vizibil</p>
          </div>

          {showThicknessField && (
            <div>
              <FormLabel htmlFor="thickness">Grosime (mm)</FormLabel>
              <Input
                id="thickness"
                {...form.register('thickness')}
                type="number"
                step="0.01"
                min="0"
                placeholder="ex: 0.08"
              />
              <p className="mt-1 text-xs text-gray-400">
                {unit === 'sheet' ? 'ex: carton 350g ≈ 0.4mm' : unit === 'm2' || unit === 'meter' ? 'ex: vinyl autoadeziv ≈ 0.08' : ''}
              </p>
            </div>
          )}

          {showDensityField && (
            <div>
              <FormLabel htmlFor="density">Densitate (g/m²)</FormLabel>
              <Input
                id="density"
                {...form.register('density')}
                type="number"
                step="0.1"
                min="0"
                placeholder="ex: 80"
              />
              <p className="mt-1 text-xs text-gray-400">
                {unit === 'sheet' ? 'ex: hârtie A4 80g/m²' : unit === 'm2' || unit === 'meter' ? 'ex: banner 440g/m²' : ''}
              </p>
            </div>
          )}

          <div>
            <FormLabel htmlFor="colorName">Culoare</FormLabel>
            <select
              id="colorName"
              {...form.register('colorName')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Nespecificat —</option>
              {colorOptions.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
            <MaterialPropertyQuickControls
              type="colors"
              label="culoare"
              items={lists.colors}
              selectedValue={selectedColor}
              mutating={mutating}
              error={error}
              addValue={addValue}
              updateValue={updateValue}
              deleteValue={deleteValue}
              clearError={clearError}
              onApplyValue={(value) => form.setValue('colorName', value, { shouldDirty: true, shouldValidate: true })}
            />
            <p className="mt-1 text-xs text-gray-400">Culoare principală a materialului</p>
          </div>

          <div>
            <FormLabel htmlFor="texture">Textură</FormLabel>
            <select
              id="texture"
              {...form.register('texture')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Nespecificat —</option>
              {textureOptions.map((texture) => (
                <option key={texture} value={texture}>{texture}</option>
              ))}
            </select>
            <MaterialPropertyQuickControls
              type="textures"
              label="textură"
              items={lists.textures}
              selectedValue={selectedTexture}
              mutating={mutating}
              error={error}
              addValue={addValue}
              updateValue={updateValue}
              deleteValue={deleteValue}
              clearError={clearError}
              onApplyValue={(value) => form.setValue('texture', value, { shouldDirty: true, shouldValidate: true })}
            />
            <p className="mt-1 text-xs text-gray-400">Textură principală a materialului</p>
          </div>
        </div>
      </div>
    </div>
  );
}
