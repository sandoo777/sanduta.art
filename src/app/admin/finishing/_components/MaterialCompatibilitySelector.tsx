'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { X } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  type: string;
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
    } catch (_error) {
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
        {materials.map((material) => (
          <label
            key={material.id}
            className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedMaterialIds.includes(material.id)}
              onChange={() => toggleMaterial(material.id)}
              className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {material.name}
              </div>
              <div className="text-xs text-gray-500">{material.type}</div>
            </div>
          </label>
        ))}
      </div>

      {selectedMaterialIds.length === 0 && (
        <p className="text-xs text-red-500">
          * Selectează cel puțin un material compatibil
        </p>
      )}
    </div>
  );
}
