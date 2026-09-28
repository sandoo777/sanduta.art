"use client";

import { useMemo } from "react";
import type { Material } from "@/models/material";

type MaterialRow = Material & {
  format?: { name?: string | null; width_mm?: number | null; height_mm?: number | null; category?: string | null };
  formatName?: string | null;
  width_mm?: number | null;
  height_mm?: number | null;
  thickness?: number | null;
  gramaj_g?: number | null;
  weight?: number | null;
};

type Props = {
  materials?: Material[];
  selectedFormatCategory?: string | null;
  onCopy?: (materialId: string) => void;
};

function getMaterialGramajDisplay(material: MaterialRow): string {
  const explicit = material.gramaj_g ?? material.weight ?? material.thickness;
  if (typeof explicit === "number" && Number.isFinite(explicit)) {
    if (explicit > 0 && explicit < 10) {
      return `${(explicit * 1000).toFixed(0)} g`;
    }
    return `${explicit.toFixed(0)} g`;
  }

  const nameMatch = material.name.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|gsm)/i);
  if (nameMatch) {
    return `${Number(nameMatch[1].replace(",", ".")).toFixed(0)} g`;
  }

  return "—";
}

function getMaterialFormatDisplay(material: MaterialRow): string {
  const formatName = material.formatName ?? material.format?.name;
  const width = material.width_mm ?? material.format?.width_mm;
  const height = material.height_mm ?? material.format?.height_mm;

  if (formatName && width && height) {
    return `${formatName} (${width} × ${height} mm)`;
  }

  if (formatName) {
    return formatName;
  }

  if (typeof width === "number" && typeof height === "number") {
    return `${width} × ${height} mm`;
  }

  return "—";
}

export default function MaterialsList({ materials = [], selectedFormatCategory = null, onCopy }: Props) {
  const showCategoryColumn = !selectedFormatCategory;

  const filteredMaterials = useMemo(() => {
    if (!selectedFormatCategory) {
      return materials;
    }

    return materials.filter((material) => {
      const formatCategory = (material as MaterialRow)?.format?.category;
      const fallbackCategory = (material as MaterialRow & { category?: string })?.category;
      const categoryValue = formatCategory ?? fallbackCategory ?? "";
      return categoryValue === selectedFormatCategory;
    });
  }, [materials, selectedFormatCategory]);

  return (
    <div className="overflow-x-auto">
      <table role="table" aria-label="Materials table" className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th>Thumb</th>
            <th>SKU</th>
            <th>Name</th>
            <th>Gramaj</th>
            <th>Format</th>
            <th>Unit</th>
            {showCategoryColumn ? <th>Category</th> : null}
            <th>Purchase</th>
            <th>Sell</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMaterials.map((m) => (
            <tr key={m.id}>
              <td>
                {(m as MaterialRow & { thumbnailUrl?: string | null }).thumbnailUrl ? (
                  <img
                    src={(m as MaterialRow & { thumbnailUrl?: string | null }).thumbnailUrl ?? ''}
                    alt={m.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <span>—</span>
                )}
              </td>
              <td>{m.sku}</td>
              <td>{m.name}</td>
              <td>{getMaterialGramajDisplay(m as MaterialRow)}</td>
              <td>{getMaterialFormatDisplay(m as MaterialRow)}</td>
              <td>{String((m as MaterialRow).unit ?? "—")}</td>
              {showCategoryColumn ? <td>{(m as MaterialRow).category}</td> : null}
              <td>{Number(m.purchasePrice).toFixed(2)}</td>
              <td>{Number(m.sellPrice).toFixed(2)}</td>
              <td>{m.active ? "Activ" : "Inactiv"}</td>
              <td>
                <button aria-label={`Copy ${m.sku}`} onClick={() => onCopy?.(m.id)}>Copy</button>
                <button aria-label={`Edit ${m.sku}`}>Edit</button>
                <button aria-label={`Delete ${m.sku}`}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
