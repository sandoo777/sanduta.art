'use client';

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useCategories } from "@/modules/categories/useCategories";
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CategoryCard } from "./_components/CategoryCard";
import { CategoryModal, CategoryFormData } from "./_components/CategoryModal";
import { Card, CardContent } from "@/components/ui/Card";
import { Category } from '@/types/models';

interface CategoryWithCount extends Category {
  _count: {
    products: number;
  };
}

export default function AdminCategoriesPage() {
  const { confirm, Dialog } = useConfirmDialog();
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (category?: Category) => {
    setEditingCategory(category || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async (data: CategoryFormData) => {
    if (editingCategory) {
      const result = await updateCategory(editingCategory.id, data);
      if (result.success) {
        showToast('Category updated successfully', 'success');
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } else {
      const result = await createCategory(data);
      if (result.success) {
        showToast('Category created successfully', 'success');
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    }
  };

  const handleDelete = async (category: Category) => {
    if (category._count.products > 0) {
      showToast(`Cannot delete "${category.name}" - it has ${category._count.products} associated products`, 'error');
      return;
    }

    await confirm({
      title: 'Șterge categorie',
      message: `Sigur vrei să ștergi categoria "${category.name}"?`,
      variant: 'danger',
      onConfirm: async () => {
        const result = await deleteCategory(category.id);
        if (result.success) {
          showToast('Category deleted successfully', 'success');
        } else {
          showToast(result.error || 'Failed to delete category', 'error');
        }
      }
    });
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Organize your products into categories</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Stats and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search */}
        <div className="md:col-span-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Categories</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{categories.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="p-4">
            <div className="text-sm text-purple-700 font-medium">Total Products</div>
            <div className="text-3xl font-bold text-purple-900 mt-1">
              {categories.reduce((sum, cat) => sum + cat._count.products, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <LoadingState text="Loading categories..." />
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No categories found matching your search' : 'No categories yet'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Category</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => handleOpenModal(category)}
              onDelete={() => handleDelete(category)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        category={editingCategory}
      />
      <Dialog />
    </div>
  );
}
