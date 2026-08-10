"use client";

import { Edit3, Trash2 } from "lucide-react";
import { AuthLink } from '@/components/common/links/AuthLink';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Material } from "@/modules/materials/types";
import {
  getMaterialCategoryLabel,
  getMaterialCategoryIcon,
  getCategoryIconBg,
  getMaterialPriceDisplay,
  getMaterialWasteDisplay,
  normalizeMaterialForList,
} from './materialListUtils';

interface MaterialCardProps {
  material: Material;
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}

export function MaterialCard({ material, onEdit, onDelete }: MaterialCardProps) {
  const normalizedMaterial = normalizeMaterialForList(material);
  const methods = normalizedMaterial.printMethods ?? [];

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xl ${getCategoryIconBg(normalizedMaterial.category)}`}>
              {getMaterialCategoryIcon(normalizedMaterial.category)}
            </div>
            <div className="min-w-0">
              <AuthLink href={`/admin/materials/${normalizedMaterial.id}`} className="block truncate font-semibold text-gray-900 hover:text-blue-700">
                {normalizedMaterial.name}
              </AuthLink>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="default" size="sm">{getMaterialCategoryLabel(normalizedMaterial.category)}</Badge>
                {normalizedMaterial.sku ? (
                  <span className="truncate text-xs text-gray-500">SKU: {normalizedMaterial.sku}</span>
                ) : null}
              </div>
            </div>
          </div>
          <Badge
            variant={normalizedMaterial.active ? 'success' : 'default'}
            size="sm"
            className={normalizedMaterial.active ? '' : 'bg-gray-200 text-gray-700'}
          >
            {normalizedMaterial.active ? 'Activ' : 'Inactiv'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-xs text-gray-500">Preț vânzare</p>
            <p className="text-sm font-semibold text-gray-900">{getMaterialPriceDisplay(normalizedMaterial)}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-gray-500">Waste</p>
            <p className="text-sm font-semibold text-gray-900">{getMaterialWasteDisplay(normalizedMaterial)}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-3">
          <div>
            <p className="mb-2 text-xs text-gray-500">Metode tipărire compatibile</p>
            <div className="flex flex-wrap gap-2">
              {methods.length > 0 ? methods.slice(0, 3).map((method) => (
                <Badge key={method.id} variant="primary" size="sm" className="max-w-[140px] truncate">
                  {method.name}
                </Badge>
              )) : (
                <Badge variant="default" size="sm">Niciuna</Badge>
              )}
              {methods.length > 3 ? <Badge variant="default" size="sm">+{methods.length - 3}</Badge> : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
          <Button type="button" size="sm" variant="secondary" onClick={() => onEdit(normalizedMaterial)}>
            <Edit3 className="h-4 w-4" /> Edit
          </Button>
          <Button type="button" size="sm" variant="danger" onClick={() => onDelete(normalizedMaterial)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
