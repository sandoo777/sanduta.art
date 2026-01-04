'use client';

import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
}

const AVAILABLE_ICONS = [
  '📦', '🎨', '👕', '☕', '📱', '💻', '📷', '🎮', 
  '📚', '🏠', '🚗', '⚽', '🎵', '🍕', '🎁', '💎',
  '🌟', '🔧', '🎯', '🏆', '📝', '🎪', '🌈', '🔥'
];

const AVAILABLE_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Gray', value: '#6B7280' },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#3B82F6',
    icon: '📦',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (!editingCategory && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, editingCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        color: category.color || '#3B82F6',
        icon: category.icon || '📦',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        color: '#3B82F6',
        icon: '📦',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      color: '#3B82F6',
      icon: '📦',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      
      const method = editingCategory ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save category');
      }

      await fetchCategories();
      handleCloseModal();
      alert(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
    } catch (error: any) {
      console.error('Error saving category:', error);
      alert(error.message || `Failed to ${editingCategory ? 'update' : 'create'} category`);
    }
  };

  const handleDelete = async (category: Category) => {
    if (category._count.products > 0) {
      alert(`Cannot delete "${category.name}" because it has ${category._count.products} associated products`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }

      await fetchCategories();
      alert('Category deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      alert(error.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
            <p className="text-gray-600 mt-1">Organize your products into categories</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            Add New Category
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Categories</div>
            <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <div className="text-sm text-blue-600">Total Products</div>
            <div className="text-2xl font-bold text-blue-900">
              {categories.reduce((sum, cat) => sum + cat._count.products, 0)}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading categories...</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No categories found</p>
            {!searchTerm && (
              <Button onClick={() => handleOpenModal()} className="mt-4">
                Create Your First Category
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <div 
                key={category.id} 
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4"
                style={{ borderLeftColor: category.color || '#3B82F6' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="text-4xl p-3 rounded-lg"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon}
                  </div>
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-gray-200"
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-1 font-mono">
                  /{category.slug}
                </p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    {category._count.products} {category._count.products === 1 ? 'product' : 'products'}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className={`text-sm font-medium ${
                        category._count.products > 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-600 hover:text-red-800'
                      }`}
                      disabled={category._count.products > 0}
                      title={category._count.products > 0 ? 'Cannot delete category with products' : 'Delete category'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Photo Prints"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="photo-prints"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-generated from name, but you can customize it
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {AVAILABLE_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon })}
                          className={`text-2xl p-2 rounded border-2 hover:border-blue-500 transition ${
                            formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {AVAILABLE_COLORS.map((colorOption) => (
                        <button
                          key={colorOption.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: colorOption.value })}
                          className={`flex flex-col items-center p-2 rounded border-2 hover:border-gray-400 transition ${
                            formData.color === colorOption.value ? 'border-gray-600' : 'border-gray-200'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-full mb-1"
                            style={{ backgroundColor: colorOption.value }}
                          />
                          <span className="text-xs text-gray-600">{colorOption.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
                    <div 
                      className="inline-flex items-center space-x-3 px-4 py-2 rounded-lg"
                      style={{ backgroundColor: `${formData.color}20` }}
                    >
                      <span className="text-3xl">{formData.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {formData.name || 'Category Name'}
                        </div>
                        <div className="text-sm text-gray-600 font-mono">
                          /{formData.slug || 'category-slug'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={handleCloseModal}
                      className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCategory ? 'Update Category' : 'Create Category'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
