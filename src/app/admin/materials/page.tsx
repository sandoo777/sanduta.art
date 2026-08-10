"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { AuthLink } from '@/components/common/links/AuthLink';
import { Badge } from "@/components/ui/Badge";
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from '@/components/ui/Modal';
import { Table } from "@/components/ui/Table";
import { useMaterials } from "@/modules/materials/useMaterials";
import type { Material, MaterialCategory } from "@/modules/materials/types";
import { MaterialCard } from "./_components/MaterialCard";
import { MaterialModal } from "./_components/MaterialModal";
import {
  getMaterialCategoryLabel,
  getMaterialWasteDisplay,
  getMaterialCategoryIcon,
  normalizeMaterialForList,
} from './_components/materialListUtils';

interface MaterialListFilters {
  search: string;
  category: 'all' | MaterialCategory;
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
  const [editingMaterial, setEditingMaterial] = useState<Material | undefined>();
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { getMaterials, deleteMaterial, isLoading, lastError } = useMaterials();

  const fetchMaterials = useCallback(async () => {
    const data = await getMaterials();
    return data.map(normalizeMaterialForList);
  }, [getMaterials]);

  useEffect(() => {
    let active = true;

    void fetchMaterials().then((data) => {
      if (active) {
        setMaterials(data);
      }
    });

    return () => {
      active = false;
    };
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

      if (filters.category !== 'all' && material.category !== filters.category) {
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
    return Array.from(new Set(materials.map((material) => material.category))).sort();
  }, [materials]);

  const handleModalClose = async () => {
    setIsModalOpen(false);
    setEditingMaterial(undefined);
    setMaterials(await fetchMaterials());
  };

  const handleOpenCreate = () => {
    setEditingMaterial(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
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
              {categories.map((category) => (
                <option key={category} value={category}>
                  {getMaterialCategoryLabel(category)}
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
                  {getMaterialCategoryLabel(filters.category)}
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

      <div className="hidden md:block">
        <Table
          columns={[
            {
              key: 'name',
              label: 'Nume material',
              sortable: true,
              width: '20%',
              render: (material) => (
                <div className="min-w-0">
                  <AuthLink href={`/admin/materials/${material.id}`} className="block truncate font-medium text-gray-900 hover:text-blue-700">
                    {material.name}
                  </AuthLink>
                  <div className="truncate text-xs text-gray-500">{material.sku || 'Fără SKU'}</div>
                </div>
              ),
            },
            {
              key: 'category',
              label: 'Categorie',
              sortable: true,
              accessor: (material) => getMaterialCategoryLabel(material.category),
              width: '10%',
              render: (material) => (
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{getMaterialCategoryIcon(material.category)}</span>
                  <Badge variant="default" size="sm">{getMaterialCategoryLabel(material.category)}</Badge>
                </div>
              ),
            },
            {
              key: 'purchasePrice',
              label: 'Preț achiziție',
              sortable: true,
              accessor: (material) => material.purchasePrice ?? -1,
              width: '12%',
              render: (material) => (
                <span className="font-medium text-gray-700">
                  {material.purchasePrice != null 
                    ? `${material.purchasePrice.toFixed(2)} MDL / ${material.unit}`
                    : 'N/A'}
                </span>
              ),
            },
            {
              key: 'salePrice',
              label: 'Preț vânzare',
              sortable: true,
              accessor: (material) => material.salePrice ?? -1,
              width: '12%',
              render: (material) => (
                <span className="font-medium text-green-700">
                  {material.salePrice != null 
                    ? `${material.salePrice.toFixed(2)} MDL / ${material.unit}`
                    : 'N/A'}
                </span>
              ),
            },
            {
              key: 'wastePercent',
              label: 'Waste %',
              sortable: true,
              width: '8%',
              render: (material) => <span className="text-gray-700">{getMaterialWasteDisplay(material)}</span>,
            },
            {
              key: 'printMethods',
              label: 'Metode compatibile',
              width: '20%',
              render: (material) => (
                <CompatibilityBadges
                  items={material.printMethods ?? []}
                  emptyLabel="Niciuna"
                  colorClass="bg-blue-100 text-blue-800"
                />
              ),
            },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              accessor: (material) => (material.active ? 1 : 0),
              width: '8%',
              render: (material) => (
                <Badge
                  variant={material.active ? 'success' : 'default'}
                  size="sm"
                  className={material.active ? '' : 'bg-gray-200 text-gray-700'}
                >
                  {material.active ? 'Activ' : 'Inactiv'}
                </Badge>
              ),
            },
            {
              key: 'actions',
              label: 'Acțiuni',
              width: '14%',
              render: (material) => (
                <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                  <Button type="button" size="sm" variant="secondary" onClick={() => handleOpenEdit(material)}>
                    <Edit3 className="h-4 w-4" /> Edit
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => setMaterialToDelete(material)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredMaterials}
          rowKey="id"
          loading={isLoading}
          emptyMessage={
            filters.search || filters.category !== 'all' || filters.status !== 'all'
              ? "Nu s-au găsit materiale cu filtrele selectate"
              : "Nu există materiale. Creează primul material."
          }
          clientSideSort={true}
          compact={true}
          stickyHeader={true}
          maxHeight="68vh"
          className="rounded-lg bg-white shadow-sm"
          tableClassName="table-fixed"
          ariaLabel="Lista materialelor din admin"
        />
      </div>

      <div className="space-y-4 md:hidden">
        {isLoading ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500">Se încarcă...</div>
        ) : filteredMaterials.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500">
            {filters.search || filters.category !== 'all' || filters.status !== 'all'
              ? "Nu s-au găsit materiale"
              : "Nu există materiale"}
          </div>
        ) : (
          filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onEdit={handleOpenEdit}
              onDelete={setMaterialToDelete}
            />
          ))
        )}
      </div>

      {isModalOpen ? (
        <MaterialModal material={editingMaterial} onClose={handleModalClose} onSuccess={handleModalClose} />
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
