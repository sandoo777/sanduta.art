"use client";

import {
  ArrowPathIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import type { SavedFile } from "@/modules/account/useSavedFilesLibrary";

interface SavedFileCardProps {
  file: SavedFile;
  onViewVersions: (fileId: string) => void;
  onReuse: (file: SavedFile) => void;
  onDelete: (file: SavedFile) => void;
}

const fallbackPreview =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='160' viewBox='0 0 220 160'%3E%3Crect width='220' height='160' fill='%23f5f5f5'/%3E%3Cpath d='M30 110l34-40 26 30 24-28 46 54H30z' fill='%23d1d5db'/%3E%3Ccircle cx='70' cy='56' r='12' fill='%23e5e7eb'/%3E%3C/svg%3E";

export function SavedFileCard({ file, onViewVersions, onReuse, onDelete }: SavedFileCardProps) {
  const createdAt = new Date(file.createdAt).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const lastUsed = file.lastUsedAt
    ? new Date(file.lastUsedAt).toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/3] bg-gray-50">
        <Image
          src={file.previewUrl || file.thumbnailUrl || fallbackPreview}
          alt={file.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-xs font-semibold text-gray-700 shadow-sm">
          {file.type.toUpperCase()} · {formatBytes(file.size)}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={file.name}>
            {file.name}
          </h3>
          <p className="text-sm text-gray-500">
            {file.versionCount} versiune{file.versionCount === 1 ? "" : "i"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            <div>
              <p className="text-xs text-gray-500">Adăugat</p>
              <p className="font-medium text-gray-900">{createdAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            <div>
              <p className="text-xs text-gray-500">Ultima utilizare</p>
              <p className="font-medium text-gray-900">{lastUsed}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => onViewVersions(file.id)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <EyeIcon className="w-4 h-4" />
            Vezi versiuni
          </button>
          <button
            type="button"
            onClick={() => onReuse(file)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Reutilizează
          </button>
          <button
            type="button"
            onClick={() => onDelete(file)}
            className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
            aria-label="Șterge fișier"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
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
