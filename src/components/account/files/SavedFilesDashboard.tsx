"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  useSavedFilesLibrary,
  type FileSortOption,
  type SavedFile,
  type SavedFileDetail,
} from "@/modules/account/useSavedFilesLibrary";
import { SavedFileCard } from "./SavedFileCard";
import { FileVersionsModal } from "./FileVersionsModal";
import { DeleteFileModal } from "./DeleteFileModal";
import { ReuseFileModal } from "./ReuseFileModal";

const sortOptions: { value: FileSortOption; label: string }[] = [
  { value: "newest", label: "Cele mai noi" },
  { value: "oldest", label: "Cele mai vechi" },
  { value: "az", label: "Alfabetic (A-Z)" },
  { value: "za", label: "Alfabetic (Z-A)" },
  { value: "type", label: "Tip fișier" },
];

export default function SavedFilesDashboard() {
  const {
    files,
    filters,
    loading,
    error,
    stats,
    detailLoading,
    updateFilters,
    fetchFileDetails,
    deleteFile,
    markFileAsUsed,
  } = useSavedFilesLibrary();

  const [searchValue, setSearchValue] = useState(filters.search);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [versionsModalFile, setVersionsModalFile] = useState<SavedFileDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedFile | null>(null);
  const [reuseTarget, setReuseTarget] = useState<SavedFile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateFilters({ search: searchValue });
    }, 350);
    return () => clearTimeout(handler);
  }, [searchValue, updateFilters]);

  const availableTypes = useMemo(() => {
    const preset = ["pdf", "png", "jpg", "tiff", "svg", "ai", "psd"];
    const dynamic = files
      .map((file) => file.type?.toLowerCase())
      .filter((type): type is string => Boolean(type));
    return ["all", ...Array.from(new Set([...preset, ...dynamic]))];
  }, [files]);

  const handleViewVersions = async (fileId: string) => {
    try {
      const detail = await fetchFileDetails(fileId);
      setVersionsModalFile(detail);
    } catch (err) {
      console.error("Nu am putut încărca versiunile", err);
    }
  };

  const handleDelete = async (file: SavedFile) => {
    setActionLoading(true);
    try {
      await deleteFile(file.id);
    } catch (err) {
      console.error("Nu am putut șterge fișierul", err);
    } finally {
      setActionLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleReuse = async (file: SavedFile) => {
    setActionLoading(true);
    try {
      await markFileAsUsed(file.id);
    } catch (err) {
      console.error("Nu am putut marca fișierul", err);
    } finally {
      setActionLoading(false);
      setReuseTarget(null);
    }
  };

  const emptyState = !loading && files.length === 0;

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          Biblioteca mea de fișiere
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fișiere salvate</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Centralizează toate fișierele aprobate pentru tipar, urmărește versiunile și reutilizează-le rapid în configurator.
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateFilters({ search: "", type: "all", sort: "newest" })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Resetează filtrele
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total fișiere" value={stats.totalCount.toString()} helper="care au trecut verificările" accent="bg-gradient-to-r from-blue-500 to-indigo-500" />
        <StatCard label="Utilizate în ultimele 30 zile" value={stats.recentCount.toString()} helper="sincronizate cu configuratorul" accent="bg-gradient-to-r from-emerald-500 to-teal-500" />
        <StatCard label="Stocare ocupată" value={formatBytes(stats.totalSize)} helper="versiuni originale + preview" accent="bg-gradient-to-r from-violet-500 to-fuchsia-500" />
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Caută după nume, tip sau client"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setSortMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              {sortOptions.find((option) => option.value === filters.sort)?.label}
            </button>
            {sortMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setSortMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        updateFilters({ sort: option.value });
                        setSortMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        filters.sort === option.value
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
            <FunnelIcon className="w-4 h-4" /> Tip fișier
          </div>
          {availableTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => updateFilters({ type })}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                filters.type === type
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {type === "all" ? "Toate" : type.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : emptyState ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <DocumentDuplicateIcon className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Încă nu ai fișiere salvate</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Încarcă un fișier în configurator sau importă un proiect din editor pentru a-l salva automat aici. Biblioteca va reține și versiunile pregătite pentru tipar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {files.map((file) => (
            <SavedFileCard
              key={file.id}
              file={file}
              onViewVersions={handleViewVersions}
              onReuse={(target) => setReuseTarget(target)}
              onDelete={(target) => setDeleteTarget(target)}
            />
          ))}
        </div>
      )}

      <FileVersionsModal
        file={versionsModalFile}
        open={Boolean(versionsModalFile)}
        loading={detailLoading}
        onClose={() => setVersionsModalFile(null)}
      />

      <DeleteFileModal
        file={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={actionLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async (file) => handleDelete(file)}
      />

      <ReuseFileModal
        file={reuseTarget}
        open={Boolean(reuseTarget)}
        loading={actionLoading}
        onClose={() => setReuseTarget(null)}
        onConfirm={async (file) => handleReuse(file)}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  helper: string;
  accent: string;
}

function StatCard({ label, value, helper, accent }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl ${accent} text-white flex items-center justify-center font-semibold text-lg`}>
        {label.charAt(0).toUpperCase() || "#"}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{helper}</p>
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
