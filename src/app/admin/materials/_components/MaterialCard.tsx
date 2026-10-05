"use client";

import { Copy, Edit3, MoreVertical, Trash2 } from "lucide-react";
import { useState } from 'react';
import { AuthLink } from '@/components/common/links/AuthLink';
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Material } from "@/modules/materials/types";
import {
  getMaterialCategoryLabel,
  getMaterialCategoryIcon,
  getCategoryIconBg,
  getMaterialPriceDisplay,
  normalizeMaterialForList,
} from './materialListUtils';

interface MaterialCardProps {
  material: Material;
  onEdit: (material: Material) => void;
  onCopy: (material: Material) => void;
  onDelete: (material: Material) => void;
}

export function MaterialCard({ material, onEdit, onCopy, onDelete }: MaterialCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const normalizedMaterial = normalizeMaterialForList(material);

  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardContent className="space-y-2 p-2.5 md:p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-base ${getCategoryIconBg(normalizedMaterial)}`}>
              {getMaterialCategoryIcon(normalizedMaterial)}
            </div>
            <div className="min-w-0">
              <AuthLink href={`/admin/materials/${normalizedMaterial.id}`} className="block truncate text-sm font-semibold text-gray-900 hover:text-blue-700">
                {normalizedMaterial.name}
              </AuthLink>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <Badge variant="default" size="sm">{getMaterialCategoryLabel(normalizedMaterial)}</Badge>
                {normalizedMaterial.sku ? (
                  <span className="truncate text-xs text-gray-500">SKU: {normalizedMaterial.sku}</span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Badge
              variant={normalizedMaterial.active ? 'success' : 'default'}
              size="sm"
              className={normalizedMaterial.active ? '' : 'bg-gray-200 text-gray-700'}
            >
              {normalizedMaterial.active ? 'Activ' : 'Inactiv'}
            </Badge>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((current) => !current)}
                className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Acțiuni material"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu ? (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        onEdit(normalizedMaterial);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="h-4 w-4" /> Editează
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onCopy(normalizedMaterial);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="h-4 w-4" /> Copiază
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(normalizedMaterial);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" /> Șterge
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-1.5">
          <p className="text-[11px] text-gray-500">Preț vânzare</p>
          <p className="text-sm font-semibold text-gray-900">{getMaterialPriceDisplay(normalizedMaterial)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
