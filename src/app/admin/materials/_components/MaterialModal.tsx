"use client";

import { Modal } from "@/components/ui/Modal";
import type { Material } from "@/modules/materials/types";
import { MaterialForm } from "./MaterialForm";

interface MaterialModalProps {
  material?: Material;
  onClose: () => void;
  onSuccess: () => void;
}

export function MaterialModal({ material, onClose, onSuccess }: MaterialModalProps) {
  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <div className="bg-white rounded-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {material ? "Editează Material" : "Adaugă Material Nou"}
          </h2>
        </div>
        <MaterialForm material={material} onClose={onClose} onSuccess={onSuccess} />
      </div>
    </Modal>
  );
}
