'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { logger } from '@/lib/logger';
import { X, AlertCircle, Check } from 'lucide-react';
import type { MaterialCategoryTree } from '@/modules/material-categories/types';

interface CategoryModalProps {
  category?: MaterialCategoryTree | null;
  parentId?: string | null;
  onClose: (success: boolean) => void;
}

export default function CategoryModal({ category, parentId, onClose }: CategoryModalProps) {
  const isEditing = !!category;
  
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    active: category?.active ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side only mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  function handleChange(field: keyof typeof formData, value: string | boolean) {
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

// CheckboxField removed — field configuration belongs at the material level, not the category level
