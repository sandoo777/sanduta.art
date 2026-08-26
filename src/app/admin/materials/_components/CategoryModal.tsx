'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { logger } from '@/lib/logger';
import { X, Info, AlertCircle, Check } from 'lucide-react';
import type { MaterialCategoryTree } from '@/modules/material-categories/types';

interface CategoryModalProps {
  category?: MaterialCategoryTree | null;
  parentId?: string | null;
  onClose: (success: boolean) => void;
}

const fieldTooltips = {
  thickness: 'Câmpul Grosime (mm) va fi obligatoriu în formularul de material',
  density: 'Câmpul Densitate (g/m²) va fi obligatoriu în formularul de material',
  pricePerSqm: 'Câmpul Preț per m² va fi obligatoriu în formularul de material',
  pricePerMeter: 'Câmpul Preț per metru va fi obligatoriu în formularul de material',
  pricePerUnit: 'Câmpul Preț per unitate va fi obligatoriu în formularul de material',
  wastePercent: 'Câmpul Procent waste (%) va fi obligatoriu în formularul de material',
};

export default function CategoryModal({ category, parentId, onClose }: CategoryModalProps) {
  const isEditing = !!category;
  
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    requiresThickness: category?.requiresThickness || false,
    requiresDensity: category?.requiresDensity || false,
    requiresPricePerSqm: category?.requiresPricePerSqm || false,
    requiresPricePerMeter: category?.requiresPricePerMeter || false,
    requiresPricePerUnit: category?.requiresPricePerUnit || false,
    requiresWastePercent: category?.requiresWastePercent || false,
    active: category?.active ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side only mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        ...(parentId && !isEditing && { parentId }),
      };

      const url = isEditing
        ? `/api/admin/material-categories/${category.id}`
        : '/api/admin/material-categories';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save category');
      }

      logger.info('CategoryModal', isEditing ? 'Category updated' : 'Category created');
      onClose(true);
    } catch (err) {
      logger.error('CategoryModal', 'Failed to save category', { error: err });
      setError(err instanceof Error ? err.message : 'Eroare la salvarea categoriei');
    } finally {
      setLoading(false);
    }
  }

  // Only render on client-side to avoid SSR issues with portal
  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <button
            onClick={() => onClose(false)}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Editează Categoria' : 'Adaugă Categorie Nouă'}
          </h2>
          <p className="text-blue-100 mt-1">
            {parentId ? 'Creare subcategorie' : 'Configurare categorie de materiale'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 88px)' }}>
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded flex items-start gap-3 animate-in slide-in-from-top duration-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Section: General Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="w-1 h-6 bg-blue-600 rounded"></div>
                <h3 className="text-lg font-semibold text-gray-900">Informații Generale</h3>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nume Categorie <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="ex: PVC, Hârtie, Textil"
                  required
                  className="transition-shadow focus:shadow-md"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descriere
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descriere opțională pentru categoria de materiale"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow focus:shadow-md resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Section: Required Fields */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="w-1 h-6 bg-green-600 rounded"></div>
                <h3 className="text-lg font-semibold text-gray-900">Câmpuri Necesare</h3>
                <div className="group/info relative ml-auto">
                  <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  <div className="absolute right-0 top-full mt-2 hidden group-hover/info:block z-10 w-72">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2">
                      Selectează câmpurile care vor fi obligatorii în formularul de adăugare a materialelor din această categorie.
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Thickness */}
                <CheckboxField
                  id="thickness"
                  label="Grosime (mm)"
                  checked={formData.requiresThickness}
                  onChange={(checked) => handleChange('requiresThickness', checked)}
                  tooltip={fieldTooltips.thickness}
                  icon="📏"
                />

                {/* Density */}
                <CheckboxField
                  id="density"
                  label="Densitate (g/m²)"
                  checked={formData.requiresDensity}
                  onChange={(checked) => handleChange('requiresDensity', checked)}
                  tooltip={fieldTooltips.density}
                  icon="⚖️"
                />

                {/* Price per sqm */}
                <CheckboxField
                  id="pricePerSqm"
                  label="Preț per m²"
                  checked={formData.requiresPricePerSqm}
                  onChange={(checked) => handleChange('requiresPricePerSqm', checked)}
                  tooltip={fieldTooltips.pricePerSqm}
                  icon="💰"
                  badge="m²"
                  badgeColor="bg-blue-500 text-white"
                />

                {/* Price per meter */}
                <CheckboxField
                  id="pricePerMeter"
                  label="Preț per metru"
                  checked={formData.requiresPricePerMeter}
                  onChange={(checked) => handleChange('requiresPricePerMeter', checked)}
                  tooltip={fieldTooltips.pricePerMeter}
                  icon="📏"
                  badge="metru"
                  badgeColor="bg-violet-500 text-white"
                />

                {/* Price per unit */}
                <CheckboxField
                  id="pricePerUnit"
                  label="Preț per unitate"
                  checked={formData.requiresPricePerUnit}
                  onChange={(checked) => handleChange('requiresPricePerUnit', checked)}
                  tooltip={fieldTooltips.pricePerUnit}
                  icon="📦"
                  badge="buc"
                  badgeColor="bg-green-500 text-white"
                />

                {/* Waste Percent */}
                <CheckboxField
                  id="wastePercent"
                  label="Procent waste (%)"
                  checked={formData.requiresWastePercent}
                  onChange={(checked) => handleChange('requiresWastePercent', checked)}
                  tooltip={fieldTooltips.wastePercent}
                  icon="♻️"
                  badge="waste"
                  badgeColor="bg-orange-500 text-white"
                />
              </div>
            </div>

            {/* Section: Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="w-1 h-6 bg-gray-600 rounded"></div>
                <h3 className="text-lg font-semibold text-gray-900">Status</h3>
              </div>

              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => handleChange('active', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">Categorie activă</span>
                  <p className="text-sm text-gray-500">Categoria va fi disponibilă pentru selectare în formulare</p>
                </div>
                {formData.active && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Activ
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="min-w-[120px]"
            >
              {isEditing ? 'Actualizează' : 'Creează'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// Helper Component: CheckboxField with tooltip
interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tooltip: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
}

function CheckboxField({
  id,
  label,
  checked,
  onChange,
  tooltip,
  icon,
  badge,
  badgeColor,
}: CheckboxFieldProps) {
  return (
    <label
      htmlFor={id}
      className={`
        group/checkbox relative flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer
        transition-all duration-150
        ${checked 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white'}
      `}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 transition-colors"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="font-medium text-gray-900">{label}</span>
          {badge && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="group/tooltip relative">
        <Info className="w-4 h-4 text-gray-400 group-hover/checkbox:text-gray-600 transition-colors" />
        <div className="absolute right-0 top-full mt-2 hidden group-hover/tooltip:block z-20 w-64">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
            {tooltip}
          </div>
        </div>
      </div>
      
      {/* Checkmark indicator */}
      {checked && (
        <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none animate-in fade-in zoom-in-95 duration-150"></div>
      )}
    </label>
  );
}
