'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { filterGroupedMaterials, groupMaterialsByCategory } from '@/app/admin/print-methods/_components/materialCompatibilityGrouping';

interface Material {
  id: string;
  name: string;
  unit: string;
  category?: string | { id?: string | null; name?: string | null } | null;
  categoryInfo?: { id?: string | null; name?: string | null } | null;
  categoryId?: string | null;
}

interface MaterialCompatibilitySelectorProps {
  selectedMaterialIds: string[];
  onChange: (ids: string[]) => void;
}

export function MaterialCompatibilitySelector({
  selectedMaterialIds,
  onChange,
}: MaterialCompatibilitySelectorProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/admin/materials', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMaterial = (materialId: string) => {
    if (selectedMaterialIds.includes(materialId)) {
      onChange(selectedMaterialIds.filter((id) => id !== materialId));
    } else {
      onChange([...selectedMaterialIds, materialId]);
    }
  };

  const removeMaterial = (materialId: string) => {
    onChange(selectedMaterialIds.filter((id) => id !== materialId));
  };

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryId]: !Boolean(prev[categoryId]),
    }));
  };

  const groupedMaterials = useMemo(() => {
    return filterGroupedMaterials(groupMaterialsByCategory(materials), searchTerm);
  }, [materials, searchTerm]);

  if (loading) {
    return <div className="text-sm text-gray-500">Se încarcă materialele...</div>;
  }

  const selectedMaterials = materials.filter((m) =>
    selectedMaterialIds.includes(m.id)
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-200 rounded-lg bg-gray-50">
        {selectedMaterials.length === 0 ? (
          <span className="text-sm text-gray-400">Selectează materiale compatibile</span>
        ) : (
          selectedMaterials.map((material) => (
            <Badge
              key={material.id}
              variant="secondary"
              className="gap-1 pr-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              {material.name}
              <button
                type="button"
                onClick={() => removeMaterial(material.id)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Caută categorie sau material..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-500"
          />
        </div>

        <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
          {materials.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Nu există materiale active</p>
          ) : groupedMaterials.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Nu există rezultate pentru căutarea selectată</p>
          ) : (
            groupedMaterials.map((group) => {
              const isCollapsed = Boolean(collapsedCategories[group.categoryId]);

              return (
                <div key={group.categoryId} className="rounded border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={() => toggleCategory(group.categoryId)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    <span>{group.categoryName}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" size="sm">{group.materials.length}</Badge>
                      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-1 border-t border-gray-100 p-2">
                      {group.materials.map((material) => (
                        <label
                          key={material.id}
                          className="flex items-start gap-2 rounded p-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMaterialIds.includes(material.id)}
                            onChange={() => toggleMaterial(material.id)}
                            className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{material.name}</div>
                            <div className="text-xs text-gray-500">{material.unit}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
