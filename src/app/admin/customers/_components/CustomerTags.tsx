"use client";

import { useState } from "react";
import { useCustomers, type CustomerTag } from "@/modules/customers/useCustomers";

interface CustomerTagsProps {
  customerId: number;
  tags: CustomerTag[];
  onUpdate: () => void;
}

// Predefined colors for tags
const PRESET_COLORS = [
  { name: "Roșu", value: "#EF4444" },
  { name: "Portocaliu", value: "#F97316" },
  { name: "Galben", value: "#EAB308" },
  { name: "Verde", value: "#22C55E" },
  { name: "Albastru", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Violet", value: "#A855F7" },
  { name: "Roz", value: "#EC4899" },
  { name: "Gri", value: "#6B7280" },
];

export default function CustomerTags({
  customerId,
  tags,
  onUpdate,
}: CustomerTagsProps) {
  const { addTag, deleteTag, loading } = useCustomers();
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);

  // Handle add tag
  const handleAddTag = async () => {
    if (!newLabel.trim()) return;

    try {
      await addTag(customerId, newLabel.trim(), selectedColor);
      setNewLabel("");
      setSelectedColor(PRESET_COLORS[0].value);
      setIsAdding(false);
      onUpdate();
    } catch (err) {
      console.error("Error adding tag:", err);
      alert("Eroare la adăugarea tag-ului");
    }
  };

  // Handle delete tag
  const handleDeleteTag = async (tagId: number) => {
    if (!confirm("Sigur vrei să ștergi acest tag?")) return;

    try {
      await deleteTag(customerId, tagId);
      onUpdate();
    } catch (err) {
      console.error("Error deleting tag:", err);
      alert("Eroare la ștergerea tag-ului");
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Tag Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adaugă Tag
        </button>
      )}

      {/* Add Tag Form */}
      {isAdding && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          {/* Label Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etichetă
            </label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="ex: VIP, B2B, Premium..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Culoare
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-10 h-10 rounded-lg transition-transform hover:scale-110 ${
                    selectedColor === color.value
                      ? "ring-2 ring-offset-2 ring-gray-900 scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {newLabel && (
            <div className="pt-2">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: selectedColor }}
              >
                {newLabel}
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewLabel("");
                setSelectedColor(PRESET_COLORS[0].value);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              Anulează
            </button>
            <button
              onClick={handleAddTag}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading || !newLabel.trim()}
            >
              {loading ? "Se salvează..." : "Adaugă Tag"}
            </button>
          </div>
        </div>
      )}

      {/* Tags List */}
      {tags.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <p className="text-lg font-medium">Nu există tag-uri</p>
          <p className="text-sm">Adaugă primul tag pentru acest client</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-sm hover:shadow-md transition-shadow group"
              style={{ backgroundColor: tag.color }}
            >
              <span>{tag.label}</span>
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                disabled={loading}
                title="Șterge tag"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
