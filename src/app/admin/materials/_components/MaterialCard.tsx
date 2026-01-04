"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import type { Material } from "@/modules/materials/types";

interface MaterialCardProps {
  material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
  const getStockBadge = () => {
    if (material.stock === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white">
          Stoc epuizat
        </span>
      );
    }
    if (material.lowStock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Stoc scăzut
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        OK
      </span>
    );
  };

  return (
    <Link href={`/admin/materials/${material.id}`}>
      <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{material.name}</h3>
              {material.sku && (
                <p className="text-sm text-gray-500">SKU: {material.sku}</p>
              )}
            </div>
          </div>
          {getStockBadge()}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Stoc</p>
            <div className="flex items-center gap-1">
              <span
                className={`text-lg font-bold ${
                  material.stock === 0
                    ? "text-black"
                    : material.lowStock
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {material.stock}
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{material.minStock}</span>
              <span className="text-sm text-gray-500 ml-1">{material.unit}</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Cost/Unitate</p>
            <p className="text-lg font-bold text-gray-900">
              {Number(material.costPerUnit).toFixed(2)} MDL
            </p>
          </div>
        </div>

        {material.totalConsumption !== undefined && material.totalConsumption > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Consum total: <span className="font-medium">{material.totalConsumption} {material.unit}</span>
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
