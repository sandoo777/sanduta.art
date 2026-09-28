'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

interface FormatRecord {
  id: string;
  category: string;
  width_mm: number;
  height_mm: number | null;
  name: string;
}

interface FormatCategoryOption {
  id: string;
  code: string;
  name: string;
  enabled: boolean;
  usageCount: number;
}

type CategoryDialogMode = 'add' | 'edit' | null;

const emptyForm = {
  name: '',
  category: '',
  width_mm: '210',
  height_mm: '297',
};

function normalizeCategoryOption(option: Partial<FormatCategoryOption> | null | undefined): FormatCategoryOption | null {
  const code = typeof option?.code === 'string' ? option.code.trim().toUpperCase() : '';
  const id = typeof option?.id === 'string' ? option.id : '';

  if (!id || !code) {
    return null;
  }

  return {
    id,
    code,
    name: typeof option?.name === 'string' && option.name.trim() ? option.name.trim() : code,
    enabled: option?.enabled === false ? false : true,
    usageCount: typeof option?.usageCount === 'number' ? option.usageCount : 0,
  };
}

function buildAutoName(width: string, height: string) {
  const widthValue = Number(width);
  if (!Number.isFinite(widthValue) || widthValue <= 0) return '';

  const heightValue = Number(height);
  if (Number.isFinite(heightValue) && heightValue > 0) {
    return `${widthValue}x${heightValue} mm`;
  }

  return `${widthValue} mm`;
}

export default function FormatsPage() {
  const [formats, setFormats] = useState<FormatRecord[]>([]);
  const [categories, setCategories] = useState<FormatCategoryOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [userEditedName, setUserEditedName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFormatCategory, setSelectedFormatCategory] = useState<string | null>(null);

  const [categoryDialogMode, setCategoryDialogMode] = useState<CategoryDialogMode>(null);
  const [categoryEditingId, setCategoryEditingId] = useState<string | null>(null);
  const [categoryCodeDraft, setCategoryCodeDraft] = useState('');
  const [categoryNameDraft, setCategoryNameDraft] = useState('');
  const [categoryEnabledDraft, setCategoryEnabledDraft] = useState(true);
  const [categoryActionError, setCategoryActionError] = useState<string | null>(null);

  const categoryCountMap = useMemo(() => {
    const map = new Map<string, number>();
    formats.forEach((format) => {
      const key = String(format.category || '').toUpperCase();
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [formats]);

  const visibleFilterCategories = useMemo(() => {
    return categories.filter((item) => item.enabled || (categoryCountMap.get(item.code) ?? 0) > 0);
  }, [categories, categoryCountMap]);

  const filteredFormats = selectedFormatCategory
    ? formats.filter((format) => format.category === selectedFormatCategory)
    : formats;

  async function loadFormats() {
    const response = await fetch('/api/admin/formats', { credentials: 'include' });
    const data = await response.json();
    setFormats(Array.isArray(data) ? data : []);
  }

  async function loadCategories() {
    const response = await fetch('/api/admin/formats_categories', { credentials: 'include' });
    const data = await response.json();

    const normalized = Array.isArray(data)
      ? data
          .map((item) => normalizeCategoryOption(item as Partial<FormatCategoryOption>))
          .filter((item): item is FormatCategoryOption => item !== null)
      : [];

    setCategories(normalized);

    if (!form.category && normalized.length > 0) {
      const firstEnabled = normalized.find((item) => item.enabled) ?? normalized[0];
      setForm((current) => ({ ...current, category: firstEnabled.code }));
    }
  }

  useEffect(() => {
    void loadFormats();
    void loadCategories();
  }, []);

  function openCreate() {
    const firstEnabled = categories.find((item) => item.enabled);

    setEditingId(null);
    setUserEditedName(false);
    setForm({
      ...emptyForm,
      category: firstEnabled?.code ?? '',
    });
    setIsModalOpen(true);
  }

  function openEdit(format: FormatRecord) {
    setEditingId(format.id);
    setUserEditedName(false);
    setForm({
      name: format.name,
      category: format.category,
      width_mm: String(format.width_mm),
      height_mm: format.height_mm == null ? '' : String(format.height_mm),
    });
    setIsModalOpen(true);
  }

  const widthValue = Number(form.width_mm);
  const heightValue = Number(form.height_mm);
  const widthError = form.width_mm.trim() !== '' && (!Number.isFinite(widthValue) || widthValue <= 0)
    ? 'Width must be greater than 0.'
    : '';
  const heightError = form.height_mm.trim() !== '' && (!Number.isFinite(heightValue) || heightValue <= 0)
    ? 'Height must be greater than 0.'
    : '';

  useEffect(() => {
    if (userEditedName) return;
    const autoName = buildAutoName(form.width_mm, form.height_mm);
    if (!autoName) return;
    setForm((current) => ({ ...current, name: autoName }));
  }, [form.width_mm, form.height_mm, userEditedName]);

  async function handleSubmit() {
    if (!form.category) {
      alert('Please select a category');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        width_mm: Number(form.width_mm),
        height_mm: form.height_mm.trim() ? Number(form.height_mm) : null,
      };

      const url = editingId ? `/api/admin/formats/${editingId}` : '/api/admin/formats';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to save format');
      }

      setIsModalOpen(false);
      setUserEditedName(false);
      setForm(emptyForm);
      await Promise.all([loadFormats(), loadCategories()]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save format');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Delete this format?');
    if (!confirmed) return;

    const response = await fetch(`/api/admin/formats/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (response.ok) {
      await Promise.all([loadFormats(), loadCategories()]);
    } else {
      const payload = await response.json().catch(() => null);
      alert(payload?.error || 'Delete failed');
    }
  }

  function openCategoryAdd() {
    setCategoryDialogMode('add');
    setCategoryEditingId(null);
    setCategoryCodeDraft('');
    setCategoryNameDraft('');
    setCategoryEnabledDraft(true);
    setCategoryActionError(null);
  }

  function openCategoryEdit(category: FormatCategoryOption) {
    setCategoryDialogMode('edit');
    setCategoryEditingId(category.id);
    setCategoryCodeDraft(category.code);
    setCategoryNameDraft(category.name);
    setCategoryEnabledDraft(category.enabled);
    setCategoryActionError(null);
  }

  async function handleCategorySave() {
    const code = categoryCodeDraft.trim().toUpperCase();
    const name = categoryNameDraft.trim();

    if (!code || !name) {
      setCategoryActionError('Code and name are required.');
      return;
    }

    const body = {
      code,
      name,
      enabled: categoryEnabledDraft,
    };

    const request = categoryDialogMode === 'add'
      ? fetch('/api/admin/formats_categories', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      : fetch('/api/admin/formats_categories', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: categoryEditingId, ...body }),
        });

    const response = await request;
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setCategoryActionError(payload?.error || 'Failed to save category');
      return;
    }

    setCategoryDialogMode(null);
    await Promise.all([loadCategories(), loadFormats()]);
  }

  async function handleCategoryDelete(category: FormatCategoryOption) {
    const confirmed = window.confirm(`Delete category ${category.code}?`);
    if (!confirmed) return;

    const response = await fetch('/api/admin/formats_categories', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: category.id }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      alert(payload?.error || 'Failed to delete category');
      return;
    }

    if (selectedFormatCategory === category.code) {
      setSelectedFormatCategory(null);
    }

    await Promise.all([loadCategories(), loadFormats()]);
  }

  async function handleCategoryToggle(category: FormatCategoryOption) {
    const response = await fetch('/api/admin/formats_categories', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: category.id, enabled: !category.enabled }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      alert(payload?.error || 'Failed to update category');
      return;
    }

    await Promise.all([loadCategories(), loadFormats()]);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Formate</h1>
          <p className="text-gray-600">Formate și categorii configurabile din baza de date.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>Create format</Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Format Categories</h2>
            <Button variant="secondary" size="sm" onClick={openCategoryAdd}>+ Add Category</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Usage</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-gray-500">No categories configured.</td>
                  </tr>
                ) : categories.map((category) => (
                  <tr key={category.id} className="border-t border-gray-200 bg-white">
                    <td className="px-3 py-2 font-semibold">{category.code}</td>
                    <td className="px-3 py-2">{category.name}</td>
                    <td className="px-3 py-2">{category.enabled ? 'Active' : 'Disabled'}</td>
                    <td className="px-3 py-2">{category.usageCount}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openCategoryEdit(category)}>
                          Edit
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => void handleCategoryToggle(category)}>
                          {category.enabled ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => void handleCategoryDelete(category)}
                          disabled={category.usageCount > 0}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-500">Delete is blocked when usage is greater than 0. Disable can be used instead.</p>
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-wrap gap-3">
        {visibleFilterCategories.map((category) => {
          const isActive = selectedFormatCategory === category.code;
          const count = categoryCountMap.get(category.code) ?? 0;

          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={isActive}
              aria-label={`Filter by ${category.code}`}
              onClick={() => setSelectedFormatCategory((current) => (current === category.code ? null : category.code))}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.code} ({count})
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFormats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {formats.length === 0 ? 'No formats yet.' : 'No formats match the selected filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredFormats.map((format) => (
                    <tr key={format.id} className="border-t border-gray-200">
                      <td className="px-4 py-3 font-semibold">{format.name}</td>
                      <td className="px-4 py-3">{format.category}</td>
                      <td className="px-4 py-3">
                        {format.height_mm == null
                          ? `${format.width_mm} mm`
                          : `${format.width_mm} × ${format.height_mm} mm`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" onClick={() => openEdit(format)}>
                            Edit
                          </Button>
                          <Button variant="danger" onClick={() => void handleDelete(format.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit format' : 'Create format'}</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border px-2 py-1 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit();
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
                <label className="text-sm font-medium text-gray-700 flex-1 min-w-[120px]">
                  Category
                  <select
                    value={form.category}
                    aria-label="Format category"
                    onChange={(event) => {
                      const nextCategory = event.target.value;
                      setForm((current) => ({
                        ...current,
                        category: nextCategory,
                      }));
                    }}
                    className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">— Select category —</option>
                    {categories
                      .filter((category) => category.enabled || category.code === form.category)
                      .map((category) => (
                        <option key={category.id} value={category.code}>{category.name} ({category.code})</option>
                      ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-gray-700 flex-1 min-w-[120px]">
                  Width (mm)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.width_mm}
                    aria-label="Format width in millimeters"
                    aria-invalid={Boolean(widthError)}
                    onChange={(event) => setForm((current) => ({ ...current, width_mm: event.target.value }))}
                    className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  {widthError && <span className="mt-1 block text-xs text-red-600">{widthError}</span>}
                </label>

                <label className="text-sm font-medium text-gray-700 flex-1 min-w-[120px]">
                  Height (mm)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.height_mm}
                    aria-label="Format height in millimeters"
                    aria-invalid={Boolean(heightError)}
                    onChange={(event) => setForm((current) => ({ ...current, height_mm: event.target.value }))}
                    className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  {heightError && <span className="mt-1 block text-xs text-red-600">{heightError}</span>}
                </label>
              </div>

              <label className="block text-sm font-medium text-gray-700">
                Name
                <input
                  value={form.name}
                  aria-label="Format name"
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setForm((current) => ({ ...current, name: nextValue }));
                    if (nextValue.trim() === '') {
                      setUserEditedName(false);
                      return;
                    }
                    setUserEditedName(true);
                  }}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <p className="text-xs text-gray-500">
                {userEditedName ? 'Nume modificat manual — auto-fill oprit.' : 'Numele se completează automat din dimensiuni.'}
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={isSaving}>
                  {editingId ? 'Save' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal isOpen={categoryDialogMode !== null} onClose={() => setCategoryDialogMode(null)} size="sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">{categoryDialogMode === 'add' ? 'Add format category' : 'Edit format category'}</h3>

          <div className="mt-4 space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Code
              <input
                value={categoryCodeDraft}
                onChange={(event) => setCategoryCodeDraft(event.target.value.toUpperCase())}
                placeholder="TEXTILE"
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Name
              <input
                value={categoryNameDraft}
                onChange={(event) => setCategoryNameDraft(event.target.value)}
                placeholder="Textile"
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={categoryEnabledDraft}
                onChange={(event) => setCategoryEnabledDraft(event.target.checked)}
                className="h-4 w-4 rounded"
              />
              Active
            </label>

            {categoryActionError && <p className="text-sm text-red-600">{categoryActionError}</p>}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCategoryDialogMode(null)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={() => void handleCategorySave()}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
