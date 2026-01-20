'use client';

import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCompatibilitySelector } from '../../finishing/_components/MaterialCompatibilitySelector';
import { PrintMethodCompatibilitySelector } from '../../finishing/_components/PrintMethodCompatibilitySelector';
import type { Machine } from '@/modules/machines/types';
import { MACHINE_TYPES } from '@/modules/machines/types';
import { machineFormSchema, type MachineFormData } from '@/lib/validations/admin';
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface MachineFormProps {
  machine?: Machine;
  onSubmit: (data: MachineFormData) => Promise<void>;
  onClose: () => void;
}

export function MachineForm({ machine, onSubmit, onClose }: MachineFormProps) {
  const form = useForm<MachineFormData>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: {
      name: machine?.name || '',
      type: machine?.type || 'Digital Printer',
      costPerHour: machine?.costPerHour || undefined,
      speed: machine?.speed || '',
      maxWidth: machine?.maxWidth || undefined,
      maxHeight: machine?.maxHeight || undefined,
      compatibleMaterialIds: machine?.compatibleMaterialIds || [],
      compatiblePrintMethodIds: machine?.compatiblePrintMethodIds || [],
      description: machine?.description || '',
      active: machine?.active ?? true,
    },
  });

  const { formState: { isSubmitting } } = form;

  const handleFormSubmit = async (data: MachineFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {machine ? 'Editează Echipament' : 'Adaugă Echipament'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <Form form={form} onSubmit={handleFormSubmit} className="p-6 space-y-6">
          {/* Name & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="name"
              render={({ field }) => (
                <div>
                  <FormLabel required>Nume echipament</FormLabel>
                  <Input
                    {...field}
                    placeholder="ex: Xerox Versant 180, Mimaki UCJV300"
                  />
                  <FormMessage />
                </div>
              )}
            />

            <FormField
              name="type"
              render={({ field }) => (
                <div>
                  <FormLabel required>Tip echipament</FormLabel>
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {MACHINE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <FormMessage />
                </div>
              )}
            />
          </div>

          {/* Cost & Speed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="costPerHour"
              render={({ field }) => (
                <div>
                  <FormLabel>Cost orar (lei/oră)</FormLabel>
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
              name="speed"
              render={({ field }) => (
                <div>
                  <FormLabel>Viteză producție</FormLabel>
                  <Input
                    {...field}
                    placeholder="ex: 100 ppm, 50 m²/oră"
                  />
                  <FormMessage />
                </div>
              )}
            />
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Detalii tehnice despre echipament..."
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
                  Echipament activ
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
              {machine ? 'Actualizează' : 'Adaugă'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
