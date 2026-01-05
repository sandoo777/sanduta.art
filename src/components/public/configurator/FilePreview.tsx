"use client";

import Image from 'next/image';
import { useMemo } from 'react';
import type { FileValidationResult, ValidationStatus } from '@/modules/configurator/useFileValidation';

interface FilePreviewProps {
  file?: File;
  previewUrl?: string;
  pages?: number;
  validation?: FileValidationResult;
  overall?: ValidationStatus | 'pending';
  onRemove?: () => void;
  fileLabel?: string;
  fileSizeBytes?: number;
  fileTypeHint?: string;
}

const statusCopy: Record<ValidationStatus, { label: string; className: string }> = {
  ok: { label: 'OK', className: 'bg-green-100 text-green-700' },
  warning: { label: 'Warning', className: 'bg-amber-100 text-amber-700' },
  error: { label: 'Eroare', className: 'bg-red-100 text-red-700' },
};

export function FilePreview({
  file,
  previewUrl,
  pages,
  validation,
  overall = 'pending',
  onRemove,
  fileLabel,
  fileSizeBytes,
  fileTypeHint,
}: FilePreviewProps) {
  const resolvedType = file?.type || fileTypeHint || '';
  const isPdf = useMemo(() => resolvedType.toLowerCase().includes('pdf'), [resolvedType]);

  const displayLabel = useMemo(() => {
    if (file) {
      return `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)}MB`;
    }
    if (fileLabel) {
      const suffix = fileSizeBytes ? ` · ${formatBytes(fileSizeBytes)}` : '';
      return `${fileLabel}${suffix}`;
    }
    return 'Niciun fișier selectat';
  }, [file, fileLabel, fileSizeBytes]);

  const validationItems = useMemo(() => {
    if (!validation) return [];
    return [
      { key: 'resolution', label: 'Rezoluție', status: validation.resolution },
      { key: 'dimensions', label: 'Dimensiuni', status: validation.dimensions },
      { key: 'bleed', label: 'Bleed', status: validation.bleed },
      { key: 'color', label: 'Profil culoare', status: validation.color },
      { key: 'fonts', label: 'Fonturi', status: validation.fonts },
    ];
  }, [validation]);

  const overallBadge = overall === 'pending'
    ? { label: 'Nu este validat', className: 'bg-gray-100 text-gray-600' }
    : statusCopy[overall];

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-900">Previzualizare fișier</p>
          <p className="text-xs text-gray-500 truncate max-w-xs">{displayLabel}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${overallBadge.className}`}>
          {overallBadge.label}
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div className="w-full aspect-video bg-gray-50 border border-dashed border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
          {previewUrl && !isPdf && (
            <Image src={previewUrl} alt="Preview" width={800} height={600} className="object-contain w-full h-full" />
          )}
          {isPdf && (
            <div className="flex flex-col items-center justify-center text-gray-600">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4h6l5 5v9a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 4v4a1 1 0 001 1h4" />
                </svg>
              </div>
              <p className="text-sm font-semibold">PDF detectat</p>
              {pages ? <p className="text-xs text-gray-500">{pages} pagini</p> : <p className="text-xs text-gray-500">Pagini multiple suportate</p>}
            </div>
          )}
          {!previewUrl && !isPdf && (
            <div className="text-center text-gray-500">
              <p className="font-semibold">Încarcă un fișier pentru previzualizare</p>
              <p className="text-xs text-gray-400">Suport: PDF, PNG, JPG, TIFF, SVG</p>
            </div>
          )}
        </div>

        {validationItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {validationItems.map((item) => (
              <div key={item.key} className="flex items-center gap-2 border border-gray-100 rounded-md px-3 py-2 bg-gray-50">
                <span className={`w-2 h-2 rounded-full ${dotClass(item.status)}`} />
                <span className="text-gray-700 font-medium">{item.label}</span>
                <span className={`ml-auto text-[11px] px-2 py-1 rounded-full ${statusCopy[item.status].className}`}>
                  {statusCopy[item.status].label}
                </span>
              </div>
            ))}
          </div>
        )}

        {onRemove && (file || previewUrl) && (
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-red-600 font-semibold hover:text-red-700"
          >
            Șterge fișierul
          </button>
        )}
      </div>
    </div>
  );
}

function dotClass(status: ValidationStatus) {
  if (status === 'ok') return 'bg-green-500';
  if (status === 'warning') return 'bg-amber-500';
  return 'bg-red-500';
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
