"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';

export type UploadMeta = { width?: number; height?: number; pages?: number };

interface FileUploadProps {
  onFileSelect: (file: File, meta?: UploadMeta) => void;
  accept?: string[];
  maxSizeMB?: number;
  helperText?: string;
}

const DEFAULT_ACCEPT = ['application/pdf', 'image/png', 'image/jpeg', 'image/tiff', 'image/svg+xml'];

export function FileUpload({ onFileSelect, accept = DEFAULT_ACCEPT, maxSizeMB = 200, helperText }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => inputRef.current?.click();

  const validateSize = (file: File) => {
    const tooBig = file.size > maxSizeMB * 1024 * 1024;
    if (tooBig) {
      setError(`Fișierul depășește limita de ${maxSizeMB}MB.`);
      return false;
    }
    setError(null);
    return true;
  };

  const extractMeta = (file: File, callback: (meta?: UploadMeta) => void) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        callback({ width: img.width, height: img.height });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        callback(undefined);
        URL.revokeObjectURL(url);
      };
      img.src = url;
      return;
    }
    callback(undefined);
  };

  const processFile = (file: File) => {
    if (!validateSize(file)) return;
    extractMeta(file, (meta) => onFileSelect(file, meta));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const acceptAttr = accept.join(',');

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 transition bg-white ${
          dragActive ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200'
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Trage fișierul aici</p>
            <p className="text-sm text-gray-600">PDF, PNG, JPG, TIFF, SVG · până la {maxSizeMB}MB</p>
          </div>
          <button
            type="button"
            onClick={handleOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm"
          >
            Selectează fișier
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptAttr}
          onChange={handleChange}
        />
      </div>
      {helperText && <p className="text-sm text-gray-600">{helperText}</p>}
      {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
    </div>
  );
}
