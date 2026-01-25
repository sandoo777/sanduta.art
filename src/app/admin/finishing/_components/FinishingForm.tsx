'use client';

import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCompatibilitySelector } from './MaterialCompatibilitySelector';
import { PrintMethodCompatibilitySelector } from './PrintMethodCompatibilitySelector';
import type { FinishingOperation } from '@/modules/finishing/types';
import { FINISHING_OPERATION_TYPES } from '@/modules/finishing/types';
import { finishingFormSchema, type FinishingFormData } from '@/lib/validations/admin';
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface FinishingFormProps {
  operation?: FinishingOperation;
  onSubmit: (data: FinishingFormData) => Promise<void>;
  onClose: () => void;
}

export function FinishingForm({ operation, onSubmit, onClose }: FinishingFormProps) {
  const form = useForm<FinishingFormData>({
    resolver: zodResolver(finishingFormSchema),
    defaultValues: {
      name: operation?.name || '',
      type: operation?.type || 'Tăiere',
      costFix: operation?.costFix || undefined,
      costPerUnit: operation?.costPerUnit || undefined,
      costPerM2: operation?.costPerM2 || undefined,
      timeSeconds: operation?.timeSeconds || undefined,
      compatibleMaterialIds: operation?.compatibleMaterialIds || [],
      compatiblePrintMethodIds: operation?.compatiblePrintMethodIds || [],
      description: operation?.description || '',
      active: operation?.active ?? true,
    },
  });

  const { formState: { isSubmitting } } = form;

  const handleFormSubmit = async (data: FinishingFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {operation ? 'Editează Operațiune' : 'Adaugă Operațiune de Finisare'}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <Form form={form} onSubmit={handleFormSubmit} className="p-6 space-y-6">
          {/* Name & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="name"
              render={({ field }) => (
                <div>
                  <FormLabel required>Nume operațiune</FormLabel>
                  <Input
                    {...field}
                    placeholder="ex: Laminare Mat, Tăiere la dimensiune"
                  />
                  <FormMessage />
                </div>
              )}
            />

            <FormField
              name="type"
              render={({ field }) => (
                <div>
                  <FormLabel required>Tip operațiune</FormLabel>
                  <Select
                    {...field}
                    options={FINISHING_OPERATION_TYPES}
                    fullWidth={true}
                  />
                  <FormMessage />
                </div>
              )}
            />
          </div>

          {/* Costs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Costuri (completează cel puțin unul)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                name="costFix"
                render={({ field }) => (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Cost fix (lei)</label>
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
                name="costPerUnit"
                render={({ field }) => (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Cost per bucată (lei)</label>
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
                name="costPerM2"
                render={({ field }) => (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Cost per m² (lei)</label>
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
          </div>

          {/* Time */}
          <FormField
            name="timeSeconds"
            render={({ field }) => (
              <div>
                <FormLabel>Timp execuție (secunde)</FormLabel>
                <Input
                  type="number"
                  min="0"
                  placeholder="ex: 120 (2 minute)"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
                <FormMessage />
              </div>
            )}
          />

          {/* Material Compatibility */}
          <FormField
            name="compatibleMaterialIds"
            render={({ field }) => (
              <div>
                <FormLabel required>Materiale compatibile</FormLabel>
                <MaterialCompatibilitySelector
                  selectedMaterialIds={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </div>
            )}
          />

          {/* Print Method Compatibility */}
          <FormField
            name="compatiblePrintMethodIds"
            render={({ field }) => (
              <div>
                <FormLabel required>Metode tipărire compatibile</FormLabel>
                <PrintMethodCompatibilitySelector
                  selectedPrintMethodIds={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </div>
            )}
          />

          {/* Description */}
          <FormField
            name="description"
            render={({ field }) => (
              <div>
                <FormLabel>Descriere tehnică</FormLabel>
                <textarea
                  {...field}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Detalii tehnice despre operațiune..."
                />
                <FormMessage />
              </div>
            )}
          />

          {/* Active Toggle */}
          <FormField
            name="active"
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Operațiune activă
                </label>
                <FormMessage />
              </div>
            )}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Anulează
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="flex-1"
            >
              {operation ? 'Actualizează' : 'Adaugă'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
