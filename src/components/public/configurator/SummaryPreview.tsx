"use client";

import Image from 'next/image';

interface SummaryPreviewProps {
  fileName?: string;
  previewUrl?: string;
  status?: 'ok' | 'warning' | 'error' | 'pending';
  onUpload?: () => void;
}

const statusMeta = {
  ok: { label: 'OK', className: 'bg-green-100 text-green-700' },
  warning: { label: 'Warning', className: 'bg-amber-100 text-amber-700' },
  error: { label: 'Eroare', className: 'bg-red-100 text-red-700' },
  pending: { label: 'Nevalidat', className: 'bg-gray-100 text-gray-600' },
};

export function SummaryPreview({ fileName, previewUrl, status = 'pending', onUpload }: SummaryPreviewProps) {
  const isPdf = fileName?.toLowerCase().endsWith('.pdf');
  const badge = statusMeta[status];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Previzualizare fișier</h3>
          <p className="text-sm text-gray-600">Verifică fișierul înainte de trimitere în producție.</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${badge.className}`}>{badge.label}</span>
      </div>

      <div className="space-y-3">
        <div className="w-full aspect-video bg-gray-50 border border-dashed border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
          {previewUrl && !isPdf && (
            <Image src={previewUrl} alt="Preview" width={900} height={600} className="object-contain w-full h-full" />
          )}
          {isPdf && (
            <div className="flex flex-col items-center justify-center text-gray-600">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4h6l5 5v9a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 4v4a1 1 0 001 1h4" />
                </svg>
              </div>
              <p className="text-sm font-semibold">{fileName || 'Fisier PDF'}</p>
              <p className="text-xs text-gray-500">Previzualizare PDF</p>
            </div>
          )}
          {!previewUrl && !isPdf && (
            <div className="text-center text-gray-500">
              <p className="font-semibold">Nu există previzualizare încă.</p>
              <p className="text-xs text-gray-400">Încarcă un fișier pentru a vedea preview.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-700">
            <p className="font-semibold text-gray-900">{fileName || 'Fișier neîncărcat'}</p>
            <p className="text-xs text-gray-500">Status: {badge.label}</p>
          </div>
          <button
            type="button"
            onClick={onUpload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm"
          >
            Încarcă alt fișier
          </button>
        </div>
      </div>
    </div>
  );
}
