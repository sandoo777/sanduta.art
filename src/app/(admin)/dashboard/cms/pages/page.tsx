/**
 * Pages Management - CRUD pagini statice
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useCms, type Page, type CreatePageInput, type PageStatus } from '@/modules/cms/useCms';

export default function CmsPagesPage() {
  const cms = useCms();
  const [pages, setPages] = useState<Page[]>([]);
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | 'ALL'>('ALL');
  const [showDialog, setShowDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const loadPages = useCallback(async () => {
    const data = await cms.fetchPages();
    setPages(data);
  }, [cms]);

  const filterPages = useCallback(() => {
    let filtered = pages;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredPages(filtered);
  }, [pages, searchTerm, statusFilter]);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

  useEffect(() => {
    filterPages();
  }, [pages, searchTerm, statusFilter, filterPages]);

  const handleCreate = () => {
    setEditingPage(null);
    setShowDialog(true);
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setShowDialog(true);
  };

  const handleDelete = async (page: Page) => {
    if (!confirm(`Ștergi pagina "${page.title}"?`)) return;
    
    const success = await cms.deletePage(page.id);
    if (success) {
      await loadPages();
    }
  };

  const handlePreview = (page: Page) => {
    window.open(`/${page.slug}`, '_blank');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Pages Management
          </h1>
          <p className="text-sm text-gray-600">
            Gestionează pagini statice, landing pages și conținut custom
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Pagină Nouă
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Caută după titlu sau slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PageStatus | 'ALL')}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Toate statusurile</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Total Pagini</div>
          <div className="text-2xl font-bold text-gray-900">{pages.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Publicate</div>
          <div className="text-2xl font-bold text-green-600">
            {pages.filter(p => p.status === 'PUBLISHED').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Draft</div>
          <div className="text-2xl font-bold text-yellow-600">
            {pages.filter(p => p.status === 'DRAFT').length}
          </div>
        </Card>
      </div>

      {/* Pages List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Titlu & Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SEO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ultima Actualizare
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded">
                        <FileText className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{page.title}</div>
                        <div className="text-sm text-gray-500">/{page.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge value={page.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {page.seoTitle && (
                        <div className="text-xs text-green-600">✓ SEO Title</div>
                      )}
                      {page.seoDescription && (
                        <div className="text-xs text-green-600">✓ SEO Description</div>
                      )}
                      {!page.seoTitle && !page.seoDescription && (
                        <div className="text-xs text-gray-400">— No SEO</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(page.updatedAt).toLocaleDateString('ro-RO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePreview(page)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(page)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Editează"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Șterge"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Nicio pagină nu corespunde filtrelor'
                : 'Nicio pagină încă'}
            </p>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <PageDialog
          page={editingPage}
          onClose={() => setShowDialog(false)}
          onSuccess={() => {
            setShowDialog(false);
            loadPages();
          }}
        />
      )}
    </div>
  );
}

function PageDialog({
  page,
  onClose,
  onSuccess,
}: {
  page: Page | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const cms = useCms();
  const [formData, setFormData] = useState<CreatePageInput>({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    status: page?.status || 'DRAFT',
    seoTitle: page?.seoTitle || '',
    seoDescription: page?.seoDescription || '',
    seoKeywords: page?.seoKeywords || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = page
      ? await cms.updatePage(page.id, formData)
      : await cms.createPage(formData);

    if (result) {
      onSuccess();
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData({ ...formData, slug });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {page ? 'Editează Pagină' : 'Pagină Nouă'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titlu *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  placeholder="despre-noi"
                />
                <Button type="button" onClick={generateSlug} variant="secondary">
                  Auto
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">URL: /{formData.slug}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conținut *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Conținut HTML sau text. TODO: Rich Text Editor
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PageStatus })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* SEO */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <Input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder={formData.title}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Opțional. Default: titlu pagină
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descriere scurtă pentru motoarele de căutare (150-160 caractere)"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="ghost" onClick={onClose}>
                Anulează
              </Button>
              <Button type="submit" loading={cms.loading}>
                {page ? 'Actualizează' : 'Creează'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
