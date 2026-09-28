"use client";

import { Modal } from "@/components/ui/Modal";
import type { Material } from "@/modules/materials/types";
import { MaterialForm } from "./MaterialForm";

interface MaterialModalProps {
  material?: Material;
  mode?: 'create' | 'edit' | 'copy';
  onClose: () => void;
  onSuccess: (material?: Material | null) => void | Promise<void>;
}

export function MaterialModal({ material, mode, onClose, onSuccess }: MaterialModalProps) {
  const isEditMode = mode === 'edit' && Boolean(material?.id);

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <div className="bg-white rounded-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'copy' ? 'Copiază Material' : isEditMode ? 'Editează Material' : 'Adaugă Material Nou'}
          </h2>
        </div>
        <MaterialForm material={material} forceCreate={mode !== 'edit'} onClose={onClose} onSuccess={onSuccess} />
      </div>
    </Modal>
  );
}
