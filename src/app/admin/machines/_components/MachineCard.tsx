'use client';

import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, DollarSign, Gauge } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Machine } from '@/modules/machines/types';
import { MACHINE_TYPES } from '@/modules/machines/types';

interface MachineCardProps {
  machine: Machine;
  onEdit: (machine: Machine) => void;
  onDelete: (id: string) => void;
}

export function MachineCard({ machine, onEdit, onDelete }: MachineCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const typeConfig = MACHINE_TYPES.find((t) => t.value === machine.type);
  const Icon = typeConfig?.icon || MoreVertical;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{machine.name}</h3>
            <p className="text-sm text-gray-500">{machine.type}</p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    onEdit(machine);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Editează
                </button>
                <button
                  onClick={() => {
                    if (confirm('Ești sigur că vrei să ștergi acest echipament?')) {
                      onDelete(machine.id);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Șterge
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cost & Speed */}
      <div className="space-y-2 mb-3">
        {machine.costPerHour && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {machine.costPerHour.toFixed(2)} lei/oră
            </span>
          </div>
        )}
        {machine.speed && (
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{machine.speed}</span>
          </div>
        )}
      </div>

      {/* Dimensions */}
      {machine.maxWidth && machine.maxHeight && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Dimensiuni maxime</p>
          <p className="text-sm text-gray-900">
            {machine.maxWidth} x {machine.maxHeight} mm
          </p>
        </div>
      )}

      {/* Compatibility */}
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500 mb-1">Compatibilități</p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="default" className="text-xs bg-blue-50 text-blue-700">
              {machine.compatibleMaterialIds.length} materiale
            </Badge>
            <Badge variant="default" className="text-xs bg-green-50 text-green-700">
              {machine.compatiblePrintMethodIds.length} metode
            </Badge>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Badge
          variant={machine.active ? 'success' : 'default'}
          className={machine.active ? 'bg-green-500' : 'bg-gray-400'}
        >
          {machine.active ? 'Activ' : 'Inactiv'}
        </Badge>
      </div>
    </div>
  );
}
