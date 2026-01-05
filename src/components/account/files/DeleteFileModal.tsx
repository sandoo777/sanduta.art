"use client";

import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { SavedFile } from "@/modules/account/useSavedFilesLibrary";

interface DeleteFileModalProps {
  file: SavedFile | null;
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (file: SavedFile) => Promise<void>;
}

export function DeleteFileModal({ file, open, loading, onCancel, onConfirm }: DeleteFileModalProps) {
  if (!open || !file) {
    return null;
  }

  const handleConfirm = async () => {
    await onConfirm(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Ștergere fișier</p>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{file.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Această acțiune este permanentă și va elimina toate versiunile asociate.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
            aria-label="Închide"
            disabled={loading}
          >
            <XMarkIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <TrashIcon className="w-5 h-5 text-red-500" />
            <p>
              Fișierul va fi eliminat din toate comenzile unde este reutilizat. Asigură-te că nu mai este necesar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Anulează
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Se șterge..." : "Șterge fișierul"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
