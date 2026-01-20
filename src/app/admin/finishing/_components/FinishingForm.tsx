'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { MaterialCompatibilitySelector } from './MaterialCompatibilitySelector';
import { PrintMethodCompatibilitySelector } from './PrintMethodCompatibilitySelector';
import type { FinishingOperation, CreateFinishingOperationInput } from '@/modules/finishing/types';
import { FINISHING_OPERATION_TYPES } from '@/modules/finishing/types';

interface FinishingFormProps {
  operation?: FinishingOperation;
  onSubmit: (data: CreateFinishingOperationInput) => Promise<void>;
  onClose: () => void;
}

export function FinishingForm({ operation, onSubmit, onClose }: FinishingFormProps) {
  const [formData, setFormData] = useState({
    name: operation?.name || '',
    type: operation?.type || 'Tăiere',
    costFix: operation?.costFix?.toString() || '',
    costPerUnit: operation?.costPerUnit?.toString() || '',
    costPerM2: operation?.costPerM2?.toString() || '',
    timeSeconds: operation?.timeSeconds?.toString() || '',
    compatibleMaterialIds: operation?.compatibleMaterialIds || [],
    compatiblePrintMethodIds: operation?.compatiblePrintMethodIds || [],
    description: operation?.description || '',
    active: operation?.active ?? true,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Te rog introdu un nume pentru operațiune');
      return;
    }

    if (formData.compatibleMaterialIds.length === 0) {
      alert('Te rog selectează cel puțin un material compatibil');
      return;
    }

    if (formData.compatiblePrintMethodIds.length === 0) {
      alert('Te rog selectează cel puțin o metodă de tipărire compatibilă');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        type: formData.type,
        costFix: formData.costFix ? parseFloat(formData.costFix) : undefined,
        costPerUnit: formData.costPerUnit ? parseFloat(formData.costPerUnit) : undefined,
        costPerM2: formData.costPerM2 ? parseFloat(formData.costPerM2) : undefined,
        timeSeconds: formData.timeSeconds ? parseInt(formData.timeSeconds) : undefined,
        compatibleMaterialIds: formData.compatibleMaterialIds,
        compatiblePrintMethodIds: formData.compatiblePrintMethodIds,
        description: formData.description.trim() || undefined,
        active: formData.active,
      });
      onClose();
    } catch (_error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {operation ? 'Editează Operațiune' : 'Adaugă Operațiune de Finisare'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume operațiune *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ex: Laminare Mat, Tăiere la dimensiune"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tip operațiune *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {FINISHING_OPERATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Costs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Costuri (completează cel puțin unul)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Cost fix (lei)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costFix}
                  onChange={(e) => setFormData({ ...formData, costFix: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Cost per bucată (lei)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPerUnit}
                  onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Cost per m² (lei)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPerM2}
                  onChange={(e) => setFormData({ ...formData, costPerM2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timp execuție (secunde)
            </label>
            <input
              type="number"
              min="0"
              value={formData.timeSeconds}
              onChange={(e) => setFormData({ ...formData, timeSeconds: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ex: 120 (2 minute)"
            />
          </div>

          {/* Material Compatibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Materiale compatibile *
            </label>
            <MaterialCompatibilitySelector
              selectedMaterialIds={formData.compatibleMaterialIds}
              onChange={(ids) =>
                setFormData({ ...formData, compatibleMaterialIds: ids })
              }
            />
          </div>

          {/* Print Method Compatibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metode tipărire compatibile *
            </label>
            <PrintMethodCompatibilitySelector
              selectedPrintMethodIds={formData.compatiblePrintMethodIds}
              onChange={(ids) =>
                setFormData({ ...formData, compatiblePrintMethodIds: ids })
              }
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descriere tehnică
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Detalii tehnice despre operațiune..."
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Operațiune activă
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Se salvează...' : operation ? 'Actualizează' : 'Adaugă'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
