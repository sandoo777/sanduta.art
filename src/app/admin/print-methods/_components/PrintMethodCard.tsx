"use client";

import { Edit2, Trash2, Activity, Ruler, Package, Cpu } from "lucide-react";
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import type { PrintMethodWithRelations } from "@/modules/print-methods/types";
import { PRINT_METHOD_TYPES } from "@/modules/print-methods/types";

interface PrintMethodCardProps {
  printMethod: PrintMethodWithRelations;
  onEdit: (printMethod: PrintMethodWithRelations) => void;
  onDelete: (id: string) => void;
}

export function PrintMethodCard({ printMethod, onEdit, onDelete }: PrintMethodCardProps) {
  const { confirm, Dialog } = useConfirmDialog();

  const typeInfo = PRINT_METHOD_TYPES.find((t) => t.value === printMethod.type) || {
    icon: "⚙️",
    label: printMethod.type,
  };

  const formatCost = () => {
    if (printMethod.isOutsourced) {
      const costs = [];
      if (printMethod.costFurnizorPerM2) {
        costs.push(`Furnizor: ${Number(printMethod.costFurnizorPerM2).toFixed(2)} lei/m²`);
      }
      if (printMethod.costFurnizorPerUnit) {
        costs.push(`Furnizor: ${Number(printMethod.costFurnizorPerUnit).toFixed(2)} lei/unit`);
      }
      if (printMethod.markup) {
        costs.push(`Markup: ${Number(printMethod.markup).toFixed(2)}%`);
      }
      return costs.length > 0 ? costs.join(" • ") : "Outsource (cost furnizor nespecificat)";
    }

    const costs = [];
    if (printMethod.baseCost) {
      costs.push(`Bază: ${Number(printMethod.baseCost).toFixed(2)} lei`);
    }
    if (printMethod.costPerM2) {
      costs.push(`${Number(printMethod.costPerM2).toFixed(2)} lei/m²`);
    }
    if (printMethod.costPerSheet) {
      costs.push(`${Number(printMethod.costPerSheet).toFixed(2)} lei/coală`);
    }
    return costs.length > 0 ? costs.join(" • ") : "Cost nespecificat";
  };

  const formatDimensions = () => {
    if (printMethod.maxWidth && printMethod.maxHeight) {
      return `Max: ${printMethod.maxWidth} × ${printMethod.maxHeight} mm`;
    }
    return null;
  };

  return (
    <div
      onClick={() => onEdit(printMethod)}
      className={`
        relative bg-white rounded-lg border-2 p-4 transition-all duration-200 cursor-pointer
        ${printMethod.active ? "border-gray-200 hover:border-blue-300 hover:shadow-lg" : "border-gray-100 opacity-60"}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{typeInfo.icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900 pr-10">{printMethod.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{typeInfo.label}</span>
              {printMethod.colorMode && (
                <>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{printMethod.colorMode}</span>
                </>
              )}
            </div>
            <div className="mt-1">
              {printMethod.isOutsourced ? (
                <Badge variant="warning" size="sm">
                  Outsource
                </Badge>
              ) : printMethod.active ? (
                <Badge variant="success" size="sm">
                  Activ
                </Badge>
              ) : (
                <Badge variant="default" size="sm">
                  Inactiv
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cost */}
      <div className="mb-3">
        <div className="text-sm font-semibold text-blue-600">{formatCost()}</div>
        {printMethod.isOutsourced && printMethod.termenFurnizor && (
          <div className="text-xs text-amber-700 mt-1">Termen furnizor: {printMethod.termenFurnizor}</div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm text-gray-600">
        {printMethod.speed && (
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <span>{printMethod.speed}</span>
          </div>
        )}

        {formatDimensions() && (
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-gray-400" />
            <span>{formatDimensions()}</span>
          </div>
        )}
      </div>

      {/* Compatibilities & Consumables */}
      {!printMethod.isOutsourced && (
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
        {/* Materials */}
        <div className="flex items-center gap-1.5 text-xs">
          <Package className="w-3.5 h-3.5 text-green-600" />
          <span className="text-gray-700 font-medium">
            {printMethod._count?.compatibleMaterials || 0}
          </span>
          <span className="text-gray-500">materiale</span>
        </div>

        {/* Equipment */}
        <div className="flex items-center gap-1.5 text-xs">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-gray-700 font-medium">
            {printMethod._count?.compatibleEquipment || 0}
          </span>
          <span className="text-gray-500">echipamente</span>
        </div>

        {/* Consumables */}
        {(printMethod._count?.consumables || 0) > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-gray-700 font-medium">
              {printMethod._count?.consumables}
            </span>
            <span className="text-gray-500">consumabile</span>
          </div>
        )}
      </div>
      )}

      {/* Actions */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onEdit(printMethod)}
          className="p-1.5 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 opacity-80 hover:opacity-100 transition-colors transition-opacity cursor-pointer"
          aria-label="Edit print method"
          title="Edit"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={async () => {
            await confirm({
              title: 'Dezactivează metodă tipărire',
              message: 'Ești sigur că vrei să dezactivezi această metodă de printare?',
              variant: 'danger',
              onConfirm: async () => {
                onDelete(printMethod.id);
              },
            });
          }}
          className="p-1.5 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 opacity-80 hover:opacity-100 transition-colors transition-opacity cursor-pointer"
          aria-label="Delete print method"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      
      <Dialog />
    </div>
  );
}
