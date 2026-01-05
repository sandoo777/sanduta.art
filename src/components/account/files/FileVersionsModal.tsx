"use client";

import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import type { SavedFileDetail } from "@/modules/account/useSavedFilesLibrary";

interface FileVersionsModalProps {
  file: SavedFileDetail | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
}

export function FileVersionsModal({ file, open, loading, onClose }: FileVersionsModalProps) {
  if (!open || !file) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200">
        <header className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Biblioteca fișiere
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">{file.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {file.type.toUpperCase()} · {formatBytes(file.size)} · {file.versionCount} versiune{file.versionCount === 1 ? "" : "i"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
            aria-label="Închide"
          >
            <XMarkIcon className="w-5 h-5 text-gray-700" />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {file.versions.map((version) => (
                <li key={version.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-gray-900 capitalize">
                      {labelForVariant(version.variant)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {version.format.toUpperCase()} · {formatBytes(version.size)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Generat pe {formatDate(version.createdAt)}
                    </p>
                    {version.metadata && (
                      <pre className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100 overflow-x-auto">
                        {JSON.stringify(version.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                  <a
                    href={version.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Descarcă
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function labelForVariant(variant: string) {
  const normalized = variant.toLowerCase();
  if (normalized.includes("print")) return "Print ready";
  if (normalized.includes("preview")) return "Previzualizare";
  if (normalized.includes("editor")) return "Export editor";
  if (normalized.includes("original")) return "Original";
  return variant;
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

function formatDate(date: string) {
  return new Date(date).toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
