'use client';

import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import type { FinishingOperation } from '@/modules/finishing/types';
import { FINISHING_OPERATION_TYPES } from '@/modules/finishing/types';

interface FinishingCardProps {
  operation: FinishingOperation;
  onEdit: (operation: FinishingOperation) => void;
  onDelete: (id: string) => void;
}

export function FinishingCard({ operation, onEdit, onDelete }: FinishingCardProps) {
  const { confirm, Dialog } = useConfirmDialog();
  const [showMenu, setShowMenu] = useState(false);

  const typeConfig = FINISHING_OPERATION_TYPES.find((t) => t.value === operation.type);
  const Icon = typeConfig?.icon || MoreVertical;

  const getCostDisplay = () => {
    const costs: string[] = [];
    if (operation.costFix) costs.push(`${operation.costFix.toFixed(2)} lei (fix)`);
    if (operation.costPerUnit) costs.push(`${operation.costPerUnit.toFixed(2)} lei/buc`);
    if (operation.costPerM2) costs.push(`${operation.costPerM2.toFixed(2)} lei/m²`);
    return costs.length > 0 ? costs.join(', ') : 'Fără cost configurat';
  };

  const getTimeDisplay = () => {
    if (!operation.timeSeconds) return null;
    if (operation.timeSeconds < 60) return `${operation.timeSeconds}s`;
    const minutes = Math.floor(operation.timeSeconds / 60);
    const seconds = operation.timeSeconds % 60;
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow relative">
      <CardContent>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{operation.name}</h3>
            <p className="text-sm text-gray-500">{operation.type}</p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <Button
            onClick={() => setShowMenu(!showMenu)}
            variant="ghost"
            size="sm"
            className="p-1"
          >
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </Button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <Button
                  onClick={() => {
                    onEdit(operation);
                    setShowMenu(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Editează
                </Button>
                <Button
                  onClick={async () => {
                    setShowMenu(false);
                    await confirm({
                      title: 'Șterge operațiune',
                      message: 'Ești sigur că vrei să ștergi această operațiune?',
                      variant: 'danger',
                      onConfirm: async () => {
                        onDelete(operation.id);
                      }
                    });
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Șterge
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cost */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">Cost</p>
        <p className="text-sm font-medium text-gray-900">{getCostDisplay()}</p>
      </div>

      {/* Time */}
      {operation.timeSeconds && (
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{getTimeDisplay()}</span>
        </div>
      )}

      {/* Compatibility */}
      <div className="space-y-2">
        {/* Materials */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Materiale compatibile</p>
          <div className="flex flex-wrap gap-1">
            {operation.compatibleMaterialIds.length > 0 ? (
              <>
                <Badge variant="primary" size="sm">
                  {operation.compatibleMaterialIds.length} materiale
                </Badge>
              </>
            ) : (
              <span className="text-xs text-gray-400">Niciun material</span>
            )}
          </div>
        </div>

        {/* Print Methods */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Metode tipărire compatibile</p>
          <div className="flex flex-wrap gap-1">
            {operation.compatiblePrintMethodIds.length > 0 ? (
              <Badge variant="success" size="sm">
                {operation.compatiblePrintMethodIds.length} metode
              </Badge>
            ) : (
              <span className="text-xs text-gray-400">Nicio metodă</span>
            )}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Badge
          variant={operation.active ? 'success' : 'default'}
          size="sm"
        >
          {operation.active ? 'Activ' : 'Inactiv'}
        </Badge>
        </div>
      </CardContent>
      <Dialog />
    </Card>
  );
}
