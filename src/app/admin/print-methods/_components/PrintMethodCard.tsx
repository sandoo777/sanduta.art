"use client";

import { useState } from "react";
import { MoreVertical, Edit, Trash2, Activity, Ruler } from "lucide-react";
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import type { PrintMethod } from "@/modules/print-methods/types";
import { PRINT_METHOD_TYPES } from "@/modules/print-methods/types";

interface PrintMethodCardProps {
  printMethod: PrintMethod;
  onEdit: (printMethod: PrintMethod) => void;
  onDelete: (id: string) => void;
}

export function PrintMethodCard({ printMethod, onEdit, onDelete }: PrintMethodCardProps) {
  const { confirm, Dialog } = useConfirmDialog();
  const [showMenu, setShowMenu] = useState(false);

  const typeInfo = PRINT_METHOD_TYPES.find((t) => t.value === printMethod.type) || {
    icon: "⚙️",
    label: printMethod.type,
  };

  const formatCost = () => {
    const costs = [];
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
      className={`
        relative bg-white rounded-lg border-2 p-4 transition-all duration-200
        ${printMethod.active ? "border-gray-200 hover:border-blue-300 hover:shadow-lg" : "border-gray-100 opacity-60"}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{typeInfo.icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{printMethod.name}</h3>
            <span className="text-xs text-gray-500">{typeInfo.label}</span>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <button
                  onClick={() => {
                    onEdit(printMethod);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={async () => {
                    setShowMenu(false);
                    await confirm({
                      title: 'Șterge metodă tipărire',
                      message: 'Sigur vrei să ștergi această metodă de tipărire?',
                      variant: 'danger',
                      onConfirm: async () => {
                        onDelete(printMethod.id);
                      }
                    });
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cost */}
      <div className="mb-3">
        <div className="text-lg font-bold text-blue-600">{formatCost()}</div>
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

        {printMethod.materialIds.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">Compatibil cu {printMethod.materialIds.length} materiale</div>
          </div>
        )}
      </div>

      {/* Status Badge */}
      {!printMethod.active && (
        <div className="absolute top-2 right-2">
          <Badge variant="default" size="sm">
            Inactiv
          </Badge>
        </div>
      )}
      <Dialog />
    </div>
  );
}
