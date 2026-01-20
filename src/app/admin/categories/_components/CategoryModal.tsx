'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { IconPicker } from './IconPicker';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<{ success: boolean; error?: string }>;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
  } | null;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  color: string;
  icon: string;
}

export function CategoryModal({ isOpen, onClose, onSave, category }: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    color: '#3B82F6',
    icon: '📦',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        color: category.color || '#3B82F6',
        icon: category.icon || '📦',
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        color: '#3B82F6',
        icon: '📦',
      });
    }
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug === generateSlug(prev.name) || !prev.slug ? generateSlug(name) : prev.slug,
    }));
    setErrors(prev => ({ ...prev, name: '' }));
  };

  const handleSlugChange = (slug: string) => {
    const cleanSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    setFormData(prev => ({ ...prev, slug: cleanSlug }));
    setErrors(prev => ({ ...prev, slug: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (formData.slug.includes(' ')) {
      newErrors.slug = 'Slug cannot contain spaces';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    const result = await onSave(formData);
    setSaving(false);

    if (result.success) {
      onClose();
    } else if (result.error) {
      setErrors({ general: result.error });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {category ? 'Edit Category' : 'Add Category'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Business Cards"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="business-cards"
              />
              {errors.slug && (
                <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly identifier (auto-generated from name)
              </p>
            </div>

            {/* Color Picker */}
            <ColorPicker
              value={formData.color}
              onChange={(color) => setFormData(prev => ({ ...prev, color }))}
            />

            {/* Icon Picker */}
            <IconPicker
              value={formData.icon}
              onChange={(icon) => setFormData(prev => ({ ...prev, icon }))}
            />

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? 'Saving...' : category ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
