"use client";

import { useState } from "react";
import {
  ArrowPathIcon,
  ClipboardIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { SavedFile } from "@/modules/account/useSavedFilesLibrary";

interface ReuseFileModalProps {
  file: SavedFile | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (file: SavedFile) => Promise<void>;
}

export function ReuseFileModal({ file, open, loading, onClose, onConfirm }: ReuseFileModalProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [confirming, setConfirming] = useState(false);

  if (!open || !file) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.originalUrl);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch (err) {
      console.error("Clipboard error", err);
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 3000);
    }
  };

  const handleConfirm = async () => {
    if (confirming) return;
    setConfirming(true);
    await onConfirm(file);
    setConfirming(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Reutilizare rapidă
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">{file.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {file.type.toUpperCase()} · {formatBytes(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
            aria-label="Închide"
            disabled={loading || confirming}
          >
            <XMarkIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-sm text-blue-900">
              Folosește acest fișier în configuratorul de produse apăsând „Biblioteca de fișiere” în pasul 2. Poți partaja link-ul original colegilor sau îl poți marca drept „utilizat” pentru a urmări ultima activitate.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Link original
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={file.originalUrl}
                readOnly
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 bg-gray-50"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <ClipboardIcon className="w-4 h-4" />
                {copyState === "copied" ? "Copiat" : "Copiază"}
              </button>
            </div>
            {copyState === "error" && (
              <p className="text-xs text-red-500">Nu am putut copia link-ul. Încearcă manual.</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              disabled={loading || confirming}
            >
              Închide
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              disabled={loading || confirming}
            >
              <ArrowPathIcon className="w-4 h-4" />
              {confirming ? "Se actualizează..." : "Marchează ca utilizat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
