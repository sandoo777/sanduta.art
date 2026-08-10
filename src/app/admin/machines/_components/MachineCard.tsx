'use client';

import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, DollarSign, Gauge, CalendarClock, StickyNote, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Machine } from '@/modules/machines/types';
import { MACHINE_TYPES, MACHINE_STATUS_CONFIG, EQUIPMENT_TYPE_CONFIG } from '@/modules/machines/types';

interface MachineCardProps {
  machine: Machine;
  onEdit: (machine: Machine) => void;
  onDelete: (id: string) => void;
}

export function MachineCard({ machine, onEdit, onDelete }: MachineCardProps) {
  const { confirm, Dialog } = useConfirmDialog();
  const [showMenu, setShowMenu] = useState(false);

  const typeConfig = MACHINE_TYPES.find((t) => t.value === machine.type);
  const Icon = typeConfig?.icon || MoreVertical;
  const statusCfg = MACHINE_STATUS_CONFIG[machine.status] ?? MACHINE_STATUS_CONFIG.AVAILABLE;
  const etCfg = EQUIPMENT_TYPE_CONFIG[machine.equipmentType ?? 'HOURLY'];

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
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => { onEdit(machine); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" /> Editează
                </button>
                <button
                  onClick={async () => {
                    setShowMenu(false);
                    await confirm({
                    title: 'Șterge echipament',
                      message: 'Ești sigur că vrei să ștergi acest echipament?',
                      variant: 'danger',
                      onConfirm: async () => { onDelete(machine.id); },
                    });
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="h-4 w-4" /> Șterge
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status + EquipmentType */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${etCfg.bg} ${etCfg.color}`}>
          {etCfg.label}
        </span>
      </div>

      {/* Cost & Speed */}
      <div className="space-y-1.5 mb-3">
        {machine.costPerHour != null && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{Number(machine.costPerHour).toFixed(2)} lei/oră</span>
          </div>
        )}
        {machine.speed && (
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{machine.speed}</span>
          </div>
        )}
        {machine.lastMaintenance && (
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Mentenanță: {new Date(machine.lastMaintenance).toLocaleDateString('ro-MD')}
            </span>
          </div>
        )}
      </div>

      {/* Dimensions */}
      {machine.maxWidth && machine.maxHeight && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Dimensiuni maxime</p>
          <p className="text-sm text-gray-900">{machine.maxWidth} × {machine.maxHeight} mm</p>
        </div>
      )}

      {/* Metode tipărire compatibile */}
      {(machine.compatiblePrintMethods?.length ?? machine.compatiblePrintMethodIds.length) > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Layers className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">Metode tipărire</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {machine.compatiblePrintMethods && machine.compatiblePrintMethods.length > 0
              ? machine.compatiblePrintMethods.map((m) => (
                  <span
                    key={m.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                  >
                    {m.name}
                  </span>
                ))
              : (
                  <Badge variant="success" size="sm">
                    {machine.compatiblePrintMethodIds.length} metode
                  </Badge>
                )}
          </div>
        </div>
      )}

      {/* Materiale compatibile */}
      {(machine.compatibleMaterials?.length ?? machine.compatibleMaterialIds.length) > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <DollarSign className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">Materiale compatibile</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {machine.compatibleMaterials && machine.compatibleMaterials.length > 0
              ? machine.compatibleMaterials.map((m) => (
                  <span
                    key={m.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    title={m.unit}
                  >
                    {m.name}
                  </span>
                ))
              : (
                  <Badge variant="primary" size="sm">
                    {machine.compatibleMaterialIds.length} materiale
                  </Badge>
                )}
          </div>
        </div>
      )}

      {/* Notes */}
      {machine.notes && (
        <div className="mt-2 flex items-start gap-1.5">
          <StickyNote className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500 line-clamp-2">{machine.notes}</p>
        </div>
      )}

      {/* Active status footer */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Badge variant={machine.active ? 'success' : 'default'} size="sm">
          {machine.active ? 'Activ' : 'Inactiv'}
        </Badge>
      </div>
      <Dialog />
    </div>
  );
}
