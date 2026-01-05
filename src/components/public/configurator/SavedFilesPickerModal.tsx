"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import {
  useSavedFilesLibrary,
  type SavedFile,
} from "@/modules/account/useSavedFilesLibrary";

interface SavedFilesPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (file: SavedFile) => void;
}

const fallbackPreview =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='160' viewBox='0 0 220 160'%3E%3Crect width='220' height='160' rx='18' fill='%23EEF2FF'/%3E%3Cpath d='M30 110l34-40 26 30 24-28 46 54H30z' fill='%23CBD5F5'/%3E%3Ccircle cx='70' cy='56' r='12' fill='%23E0E7FF'/%3E%3C/svg%3E";

export function SavedFilesPickerModal({ open, onClose, onSelect }: SavedFilesPickerModalProps) {
  const { files, loading, error, filters, updateFilters, markFileAsUsed } =
    useSavedFilesLibrary();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (!open) return;
    const handler = setTimeout(() => {
      updateFilters({ search: searchValue });
    }, 300);
    return () => clearTimeout(handler);
  }, [open, searchValue, updateFilters]);

  const combinedError = useMemo(() => localError || error, [localError, error]);

  if (!open) {
    return null;
  }

  const handleSelect = async (file: SavedFile) => {
    setSelectingId(file.id);
    setLocalError(null);
    try {
      await markFileAsUsed(file.id);
      onSelect(file);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Nu am putut reutiliza fișierul."
      );
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        <header className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Biblioteca personală
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              Alege un fișier salvat
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Selectează un fișier deja validat pentru a continua instant, fără reupload.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
            aria-label="Închide biblioteca"
            disabled={selectingId !== null}
          >
            <XMarkIcon className="w-5 h-5 text-gray-700" />
          </button>
        </header>

        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Caută după nume, tip sau client"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm"
              />
            </div>
            <Link
              href="/dashboard/files"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
              Gestionează biblioteca
            </Link>
          </div>

          {combinedError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 text-sm px-4 py-3">
              {combinedError}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <DocumentDuplicateIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Nu ai fișiere salvate încă
              </h3>
              <p className="text-sm text-gray-600 max-w-xl mx-auto">
                Încarcă un fișier din configurator sau salvează un proiect din editor pentru a-l vedea aici.
              </p>
              <Link
                href="/dashboard/files"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                onClick={onClose}
              >
                Deschide biblioteca completă
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[60vh] overflow-y-auto pr-1">
              {files.map((file) => (
                <article
                  key={file.id}
                  className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col gap-3"
                >
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-50">
                    <Image
                      src={file.previewUrl || file.thumbnailUrl || fallbackPreview}
                      alt={file.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-gray-800 shadow">
                      {file.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={file.name}>
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatBytes(file.size)} · {file.versionCount} versiune{file.versionCount === 1 ? "" : "i"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Ultima utilizare: {file.lastUsedAt ? formatRelativeDate(file.lastUsedAt) : "—"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelect(file)}
                    className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-70"
                    disabled={selectingId === file.id}
                  >
                    {selectingId === file.id ? "Se aplică..." : "Folosește fișierul"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
