"use client";

import { useState } from "react";
import { Edit2, Save, X } from "lucide-react";
import { useMaterials } from "@/modules/materials/useMaterials";
import type { MaterialWithDetails } from "@/modules/materials/types";

interface MaterialNotesProps {
  material: MaterialWithDetails;
  onUpdate: () => void;
}

export function MaterialNotes({ material, onUpdate }: MaterialNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(material.notes || "");
  const { updateMaterial, isLoading } = useMaterials();

  const handleSave = async () => {
    const result = await updateMaterial(material.id, { notes });
    if (result) {
      setIsEditing(false);
      onUpdate();
    }
  };

  const handleCancel = () => {
    setNotes(material.notes || "");
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Note</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <Edit2 className="w-4 h-4" />
            <span>Editează</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
              <span>Anulează</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? "Se salvează..." : "Salvează"}</span>
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Adaugă note despre material: furnizori, specificații tehnice, observații etc."
        />
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
          {material.notes ? (
            <p className="text-gray-700 whitespace-pre-wrap">{material.notes}</p>
          ) : (
            <p className="text-gray-500 italic">Nu există note pentru acest material</p>
          )}
        </div>
      )}

      {isEditing && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>Sugestii:</strong> Adaugă informații despre furnizori, specificații
            tehnice, condiții de stocare, sau alte detalii importante.
          </p>
        </div>
      )}
    </div>
  );
}
