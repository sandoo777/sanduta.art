"use client";

import { AuthLink } from '@/components/common/links/AuthLink';
import { Package } from "lucide-react";
import type { Material } from "@/modules/materials/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface MaterialCardProps {
  material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
  return (
    <AuthLink href={`/admin/materials/${material.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
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
            {material.stock === 0 ? (
              <Badge variant="default" size="sm" className="bg-black text-white">
                Stoc epuizat
              </Badge>
            ) : material.lowStock ? (
              <Badge variant="danger" size="sm">
                Stoc scăzut
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                OK
              </Badge>
            )}
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
        </CardContent>
      </Card>
    </AuthLink>
  );
}
