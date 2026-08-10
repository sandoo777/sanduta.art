'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { logger } from '@/lib/logger';
import { Home, Folder, AlertTriangle, Trash2, X } from 'lucide-react';
import CategoryTreeView from '../_components/CategoryTreeView';
import CategoryModal from '../_components/CategoryModal';
import type { MaterialCategoryTree } from '@/modules/material-categories/types';

interface DeleteConfirmation {
  categoryId: string;
  categoryName: string;
  childrenCount: number;
  materialsCount: number;
}

export default function MaterialCategoriesPage() {
  const [categories, setCategories] = useState<MaterialCategoryTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MaterialCategoryTree | null>(null);
  const [parentForNew, setParentForNew] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/material-categories/tree');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      logger.error('MaterialCategories', 'Failed to fetch categories', { error });
      alert('Eroare la încărcarea categoriilor');
    } finally {
      setLoading(false);
    }
  }

  function handleAddCategory(parentId?: string) {
    setEditingCategory(null);
    setParentForNew(parentId || null);
    setIsModalOpen(true);
  }

  function handleEditCategory(category: MaterialCategoryTree) {
    setEditingCategory(category);
    setParentForNew(null);
    setIsModalOpen(true);
  }

  function handleDeleteCategory(categoryId: string) {
    // Find category in tree to get counts
    const findCategory = (cats: MaterialCategoryTree[]): MaterialCategoryTree | null => {
      for (const cat of cats) {
        if (cat.id === categoryId) return cat;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };

    const category = findCategory(categories);
    if (!category) return;

    setDeleteConfirmation({
      categoryId,
      categoryName: category.name,
      childrenCount: category._count?.children || 0,
      materialsCount: category._count?.materials || 0,
    });
  }

  async function confirmDelete() {
    if (!deleteConfirmation) return;

    try {
      const response = await fetch(`/api/admin/material-categories/${deleteConfirmation.categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }

      logger.info('MaterialCategories', 'Category deleted', { categoryId: deleteConfirmation.categoryId });
      setDeleteConfirmation(null);
      await fetchCategories();
    } catch (error) {
      logger.error('MaterialCategories', 'Failed to delete category', { error });
      alert(error instanceof Error ? error.message : 'Eroare la ștergerea categoriei');
    }
  }

  function handleModalClose(success: boolean) {
    setIsModalOpen(false);
    setEditingCategory(null);
    setParentForNew(null);
    
    if (success) {
      fetchCategories();
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Se încarcă categoriile...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-600">
        <Home className="w-4 h-4" />
        <span>Admin</span>
        <span>/</span>
        <span>Materiale</span>
        <span>/</span>
        <Folder className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Categorii</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorii Materiale</h1>
          <p className="text-gray-600 mt-1">Gestionează categoriile de materiale cu subcategorii nelimitate</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => handleAddCategory()}
          className="shadow-lg hover:shadow-xl transition-shadow"
        >
          + Adaugă Categorie
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-blue-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Categorii</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {countAllCategories(categories)}
            </p>
          </div>
        </Card>
        <Card className="border-l-4 border-green-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Categorii Active</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {countActiveCategories(categories)}
            </p>
          </div>
        </Card>
        <Card className="border-l-4 border-amber-500">
          <div className="p-4">
            <p className="text-sm text-gray-600">Nivele Adâncime</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {getMaxDepth(categories)}
            </p>
          </div>
        </Card>
      </div>

      {/* Tree View */}
      <Card className="shadow-sm">
        <div className="p-6">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Folder className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">Nu există categorii create</p>
              <p className="text-gray-400 text-sm mt-1">Creează prima categorie pentru a organiza materialele</p>
              <Button variant="primary" onClick={() => handleAddCategory()} className="mt-6">
                + Creează prima categorie
              </Button>
            </div>
          ) : (
            <CategoryTreeView
              categories={categories}
              onAddSubcategory={handleAddCategory}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          )}
        </div>
      </Card>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          parentId={parentForNew}
          onClose={handleModalClose}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-red-50 border-b border-red-100 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Confirmare Ștergere</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Această acțiune nu poate fi anulată
                  </p>
                </div>
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Sigur doriți să ștergeți categoria <span className="font-semibold">&quot;{deleteConfirmation.categoryName}&quot;</span>?
              </p>

              {/* Warning badges */}
              {(deleteConfirmation.childrenCount > 0 || deleteConfirmation.materialsCount > 0) && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-sm font-semibold text-red-800 mb-2">⚠️ Atenție:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {deleteConfirmation.childrenCount > 0 && (
                      <li>
                        • Categoria are <span className="font-semibold">{deleteConfirmation.childrenCount}</span> subcategorii
                      </li>
                    )}
                    {deleteConfirmation.materialsCount > 0 && (
                      <li>
                        • Categoria are <span className="font-semibold">{deleteConfirmation.materialsCount}</span> materiale asociate
                      </li>
                    )}
                  </ul>
                  <p className="text-sm text-red-700 mt-2 font-medium">
                    Nu puteți șterge această categorie până când nu mutați sau ștergeți elementele asociate.
                  </p>
                </div>
              )}

              {deleteConfirmation.childrenCount === 0 && deleteConfirmation.materialsCount === 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                  <p className="text-sm text-amber-800">
                    Această categorie va fi ștearsă permanent din sistem.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirmation(null)}
              >
                Anulează
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                disabled={deleteConfirmation.childrenCount > 0 || deleteConfirmation.materialsCount > 0}
                className="min-w-[100px]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Șterge
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function countAllCategories(cats: MaterialCategoryTree[]): number {
  let count = cats.length;
  for (const cat of cats) {
    if (cat.children) {
      count += countAllCategories(cat.children);
    }
  }
  return count;
}

function countActiveCategories(cats: MaterialCategoryTree[]): number {
  let count = cats.filter(c => c.active).length;
  for (const cat of cats) {
    if (cat.children) {
      count += countActiveCategories(cat.children);
    }
  }
  return count;
}

function getMaxDepth(cats: MaterialCategoryTree[], currentDepth = 1): number {
  if (cats.length === 0) return 0;
  let maxDepth = currentDepth;
  for (const cat of cats) {
    if (cat.children && cat.children.length > 0) {
      const depth = getMaxDepth(cat.children, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  }
  return maxDepth;
}
