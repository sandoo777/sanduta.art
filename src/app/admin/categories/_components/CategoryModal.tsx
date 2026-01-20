'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { categoryFormSchema, type CategoryFormData } from '@/lib/validations/admin';
import { Form } from '@/components/ui/Form';
import { FormField } from '@/components/ui/FormField';
import { FormLabel } from '@/components/ui/FormLabel';
import { FormMessage } from '@/components/ui/FormMessage';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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

export function CategoryModal({ isOpen, onClose, onSave, category }: CategoryModalProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      color: '#3B82F6',
      icon: '📦',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        color: category.color || '#3B82F6',
        icon: category.icon || '📦',
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        color: '#3B82F6',
        icon: '📦',
      });
    }
  }, [category, isOpen, form]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  };

  const handleNameChange = (name: string) => {
    const currentSlug = form.getValues('slug');
    const previousName = form.getValues('name');
    
    // Auto-generate slug only if slug matches previous auto-generated value or is empty
    if (currentSlug === generateSlug(previousName) || !currentSlug) {
      form.setValue('slug', generateSlug(name));
    }
    
    return name;
  };

  const onSubmit = async (data: CategoryFormData) => {
    const result = await onSave(data);

    if (result.success) {
      onClose();
    } else if (result.error) {
      form.setError('root', { message: result.error });
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
          <Form form={form} onSubmit={onSubmit} className="p-6 space-y-6">
            {/* General Error */}
            {form.formState.errors.root && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{form.formState.errors.root.message}</p>
              </div>
            )}

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <div>
                  <FormLabel>
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      const value = handleNameChange(e.target.value);
                      field.onChange(value);
                    }}
                    placeholder="Business Cards"
                  />
                  <FormMessage />
                </div>
              )}
            />

            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <div>
                  <FormLabel>
                    Slug <span className="text-red-500">*</span>
                  </FormLabel>
                  <Input {...field} placeholder="business-cards" />
                  <FormMessage />
                  <p className="text-xs text-gray-500 mt-1">
                    URL-friendly identifier (auto-generated from name)
                  </p>
                </div>
              )}
            />

            {/* Color Picker */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <ColorPicker value={field.value} onChange={field.onChange} />
              )}
            />

            {/* Icon Picker */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <IconPicker value={field.value} onChange={field.onChange} />
              )}
            />

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}
