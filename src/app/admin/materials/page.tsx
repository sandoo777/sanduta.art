"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Folder, FolderOpen, Plus, Search } from 'lucide-react';
import { AuthLink } from '@/components/common/links/AuthLink';
import { Badge } from "@/components/ui/Badge";
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from '@/components/ui/Modal';
import { useMaterials } from "@/modules/materials/useMaterials";
import type { Material } from "@/modules/materials/types";
import { MaterialCard } from "./_components/MaterialCard";
import { MaterialModal } from "./_components/MaterialModal";
import {
  getMaterialCategoryLabel,
  normalizeMaterialForList,
} from './_components/materialListUtils';

interface MaterialListFilters {
  search: string;
  category: 'all' | string; // DB category ID
  status: 'all' | 'active' | 'inactive';
}

function CompatibilityBadges({
  items,
  emptyLabel,
  colorClass,
}: {
  items: Array<{ id: string; name: string }>;
  emptyLabel: string;
  colorClass: string;
}) {
  if (items.length === 0) {
    return <Badge variant="default" size="sm">{emptyLabel}</Badge>;
  }

  const visibleItems = items.slice(0, 3);

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleItems.map((item) => (
        <Badge key={item.id} size="sm" className={`max-w-[140px] truncate ${colorClass}`}>
          {item.name}
        </Badge>
      ))}
      {items.length > visibleItems.length ? (
        <Badge variant="default" size="sm">+{items.length - visibleItems.length}</Badge>
      ) : null}
    </div>
  );
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filters, setFilters] = useState<MaterialListFilters>({
    search: '',
    category: 'all',
    status: 'all',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'copy'>('create');
  const [editingMaterial, setEditingMaterial] = useState<Material | undefined>();
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dbCategories, setDbCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const { getMaterials, deleteMaterial, isLoading, lastError } = useMaterials();

  const fetchMaterials = useCallback(async () => {
    const data = await getMaterials();
    return data.map(normalizeMaterialForList);
  }, [getMaterials]);

  useEffect(() => {
    let active = true;

    void fetchMaterials().then((data) => {
      if (active) setMaterials(data);
    });

    // Load real DB categories
    fetch('/api/admin/material-categories', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: Array<{ id: string; name: string }>) => {
        if (active) setDbCategories(data.filter((c) => c.name));
      })
      .catch(() => { /* non-critical */ });

    return () => { active = false; };
  }, [fetchMaterials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      if (filters.search.trim()) {
        const search = filters.search.toLowerCase();
        const matchesName = material.name.toLowerCase().includes(search);
        const matchesSku = material.sku?.toLowerCase().includes(search);
        if (!matchesName && !matchesSku) {
          return false;
        }
      }

      if (filters.category !== 'all' && material.categoryId !== filters.category) {
        return false;
      }

      if (filters.status === 'active' && !material.active) {
        return false;
      }

      if (filters.status === 'inactive' && material.active) {
        return false;
      }

      return true;
    });
  }, [filters, materials]);

  const categories = useMemo(() => {
    // Show only categories that have at least one material, preserving DB order
    const usedIds = new Set(materials.map((m) => m.categoryId).filter(Boolean));
    return dbCategories
      .filter((c) => usedIds.has(c.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [materials, dbCategories]);

  const groupedMaterials = useMemo(() => {
    const categoryNameById = new Map(dbCategories.map((category) => [category.id, category.name]));
    const grouped = new Map<string, Material[]>();

    filteredMaterials
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((material) => {
        const key = categoryNameById.get(material.categoryId) ?? material.categoryInfo?.name ?? getMaterialCategoryLabel(material) ?? 'Fără mapă';
        const current = grouped.get(key) ?? [];
        current.push(material);
        grouped.set(key, current);
      });

    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [dbCategories, filteredMaterials]);

  useEffect(() => {
    setOpenGroups((current) => {
      const next: Record<string, boolean> = {};
      groupedMaterials.forEach(([groupName]) => {
        next[groupName] = current[groupName] ?? true;
      });
      return next;
    });
  }, [groupedMaterials]);

  const handleModalClose = async () => {
    setIsModalOpen(false);
    setModalMode('create');
    setEditingMaterial(undefined);
    setMaterials(await fetchMaterials());
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingMaterial(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setModalMode('edit');
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleOpenCopy = (material: Material) => {
    setModalMode('copy');
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!materialToDelete) {
      return;
    }

    setIsDeleting(true);
    const success = await deleteMaterial(materialToDelete.id);
    setIsDeleting(false);

    if (success) {
      setMaterialToDelete(null);
      setMaterials(await fetchMaterials());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Materials & Inventory</h1>
            <p className="mt-1 text-gray-600">
              Vizualizează materialele, compatibilitățile și statusurile de activare.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/materials/categories"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-2 text-base font-medium text-gray-700 transition-all duration-200 hover:scale-[1.02] hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
            >
              Categorii Materiale
            </Link>
            <Button onClick={handleOpenCreate} variant="primary">
              <Plus className="h-5 w-5" />
              <span className="hidden md:inline">Add Material</span>
            </Button>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Caută după nume sau SKU..."
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filters.category}
              onChange={(event) => setFilters((current) => ({
                ...current,
                category: event.target.value as MaterialListFilters['category'],
              }))}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toate categoriile</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({
                ...current,
                status: event.target.value as MaterialListFilters['status'],
              }))}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toate statusurile</option>
              <option value="active">Doar active</option>
              <option value="inactive">Doar inactive</option>
            </select>
          </div>

          {(filters.search || filters.category !== 'all' || filters.status !== 'all') && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Filtre active:</span>
              {filters.search ? (
                <Badge variant="primary" size="sm">
                  {filters.search}
                  <button onClick={() => setFilters((current) => ({ ...current, search: '' }))} className="ml-1 hover:text-blue-900">
                    ×
                  </button>
                </Badge>
              ) : null}
              {filters.category !== 'all' ? (
                <Badge variant="primary" size="sm">
                  {dbCategories.find((c) => c.id === filters.category)?.name ?? filters.category}
                  <button onClick={() => setFilters((current) => ({ ...current, category: 'all' }))} className="ml-1 hover:text-blue-900">
                    ×
                  </button>
                </Badge>
              ) : null}
              {filters.status !== 'all' ? (
                <Badge
                  variant={filters.status === 'active' ? 'success' : 'default'}
                  size="sm"
                  className={filters.status === 'inactive' ? 'bg-gray-200 text-gray-700' : ''}
                >
                  {filters.status === 'active' ? 'Activ' : 'Inactiv'}
                  <button onClick={() => setFilters((current) => ({ ...current, status: 'all' }))} className="ml-1">
                    ×
                  </button>
                </Badge>
              ) : null}
              <button
                onClick={() => setFilters({ search: '', category: 'all', status: 'all' })}
                className="text-sm text-gray-600 underline hover:text-gray-900"
              >
                Resetează filtre
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500">Se încarcă...</div>
        ) : groupedMaterials.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500">
            {filters.search || filters.category !== 'all' || filters.status !== 'all'
              ? "Nu s-au găsit materiale"
              : "Nu există materiale"}
          </div>
        ) : (
          groupedMaterials.map(([groupName, groupMaterials]) => {
            const isOpen = openGroups[groupName] ?? true;

            return (
              <Card key={groupName} className="overflow-hidden bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenGroups((current) => ({ ...current, [groupName]: !isOpen }))}
                  className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-3 py-2.5 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2.5">
                    {isOpen ? <FolderOpen className="h-5 w-5 text-amber-600" /> : <Folder className="h-5 w-5 text-amber-600" />}
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{groupName}</div>
                      <div className="text-[11px] text-gray-500">{groupMaterials.length} materiale</div>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen ? (
                  <CardContent className="space-y-3 p-3 md:p-4">
                    {groupMaterials.map((material) => (
                      <MaterialCard
                        key={material.id}
                        material={material}
                        onEdit={handleOpenEdit}
                        onCopy={handleOpenCopy}
                        onDelete={setMaterialToDelete}
                      />
                    ))}
                  </CardContent>
                ) : null}
              </Card>
            );
          })
        )}
      </div>

      {isModalOpen ? (
        <MaterialModal
          mode={modalMode}
          material={editingMaterial}
          onClose={handleModalClose}
          onSuccess={handleModalClose}
        />
      ) : null}

      {materialToDelete ? (
        <Modal isOpen={true} onClose={() => setMaterialToDelete(null)} size="sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Delete material</h2>
            <p className="mt-2 text-sm text-gray-600">
              Ștergi materialul <span className="font-medium text-gray-900">{materialToDelete.name}</span>?{lastError ? ` ${lastError}` : ''}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setMaterialToDelete(null)} disabled={isDeleting}>
                Anulează
              </Button>
              <Button type="button" variant="danger" onClick={handleDelete} loading={isDeleting}>
                Confirmă ștergerea
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
