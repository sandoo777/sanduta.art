"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { FileUpload, type UploadMeta } from './FileUpload';
import { FilePreview } from './FilePreview';
import { DesignEntry } from './DesignEntry';
import { SavedFilesPickerModal } from './SavedFilesPickerModal';
import type { SavedFile } from '@/modules/account/useSavedFilesLibrary';
import { useFileValidation, type FileValidationResult, type ValidationStatus, type ProductSpecs } from '@/modules/configurator/useFileValidation';

export type FileStatusState = {
  overall: ValidationStatus | 'pending';
  result?: FileValidationResult;
  message?: string;
  file?: File;
};

interface Step2UploadDesignProps {
  productName?: string;
  onStatusChange?: (status: FileStatusState) => void;
  onContinue?: () => void;
}

const defaultSpecs: ProductSpecs = {
  minWidth: 1800,
  minHeight: 1800,
  bleedRequired: true,
  aspectTolerance: 0.1,
};

export function Step2UploadDesign({ productName, onStatusChange, onContinue }: Step2UploadDesignProps) {
  const validator = useFileValidation();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'upload' | 'design'>('upload');
  const [file, setFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [pages, setPages] = useState<number | undefined>();
  const [validation, setValidation] = useState<FileValidationResult | undefined>();
  const [status, setStatus] = useState<FileStatusState>({ overall: 'pending' });
  const [designReady, setDesignReady] = useState(false);
  const [fromEditor, setFromEditor] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [libraryFile, setLibraryFile] = useState<SavedFile | null>(null);

  // Preia payload din editor dacă query fromEditor=true
  useEffect(() => {
    const fromEditorFlag = searchParams.get('fromEditor') === 'true';
    if (!fromEditorFlag) return;

    const raw = typeof window !== 'undefined' ? sessionStorage.getItem('editorDesignPayload') : null;
    if (!raw) return;

    try {
      const payload = JSON.parse(raw) as {
        fileUrl: string;
        previewUrl: string;
        projectId: string;
        projectName: string;
        width: number;
        height: number;
        bleed: number;
      };

      setFromEditor(true);
      setActiveTab('upload');
      setPreviewUrl(payload.previewUrl);
      setValidation({ resolution: 'ok', bleed: 'ok', dimensions: 'ok', color: 'ok', fonts: 'ok' });
      const nextStatus: FileStatusState = {
        overall: 'ok',
        message: 'Designul tău a fost importat automat din editor.',
      };
      setStatus(nextStatus);
      onStatusChange?.(nextStatus);
    } catch (_error) {
      console.error('Cannot parse editorDesignPayload', error);
    }
     
  }, [searchParams, onStatusChange]);

  const handleFileSelect = (selected: File, meta?: UploadMeta) => {
    setFile(selected);
    setDesignReady(false);
    setLibraryFile(null);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setPages(meta?.pages);

    const result = validator.validateFile(selected, defaultSpecs, {
      width: meta?.width,
      height: meta?.height,
    });
    const overall = validator.overallStatus(result);
    const nextStatus: FileStatusState = {
      overall,
      result,
      file: selected,
      message:
        overall === 'ok'
          ? 'Fișier validat: pregătit pentru tipar.'
          : overall === 'warning'
          ? 'Fișier cu atenționări. Verifică profil culoare și bleed.'
          : 'Fișier invalid. Te rugăm să corectezi problemele. ',
    };
    setValidation(result);
    setStatus(nextStatus);
  };

  const handleRemoveFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(undefined);
    setPreviewUrl(undefined);
    setValidation(undefined);
    setLibraryFile(null);
    setFromEditor(false);
    setDesignReady(false);
    setPages(undefined);
    setStatus({ overall: 'pending', message: 'Niciun fișier selectat.' });
  };

  const handleSelectFromLibrary = (savedFile: SavedFile) => {
    setLibraryFile(savedFile);
    setLibraryModalOpen(false);
    setFromEditor(false);
    setFile(undefined);
    setDesignReady(false);
    setPages(undefined);
    setPreviewUrl(savedFile.previewUrl || savedFile.thumbnailUrl || savedFile.originalUrl);
    setValidation(undefined);
    const nextStatus: FileStatusState = {
      overall: 'ok',
      message: 'Fișier selectat din biblioteca ta. Pregătit pentru pasul următor.',
    };
    setStatus(nextStatus);
  };

  const handleSelectTemplate = (templateId: string) => {
    setDesignReady(true);
    setStatus({ overall: 'ok', message: `Template selectat (${templateId}). Editorul va fi deschis.` });
  };

  const handleOpenEditor = () => {
    setDesignReady(true);
    setStatus({ overall: 'ok', message: 'Editorul de design va fi deschis pentru creare fișier.' });
  };

  const canContinue = useMemo(() => {
    if (libraryFile) return true;
    if (fromEditor) return true;
    if (activeTab === 'design') return designReady;
    if (!file) return false;
    return status.overall !== 'error' && status.overall !== 'pending';
  }, [activeTab, designReady, file, status.overall, fromEditor, libraryFile]);

  return (
    <div className="space-y-6">
      <div className="flex items-center overflow-x-auto gap-2 pb-2">
        {['upload', 'design'].map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab as 'upload' | 'design')}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold whitespace-nowrap transition ${
                isActive ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              {tab === 'upload' ? 'Încarcă fișier' : 'Creează design'}
            </button>
          );
        })}
      </div>

      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
          <div className="space-y-4">
            {fromEditor ? (
              <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Fișier generat în editor</p>
                    <p className="text-sm text-gray-600">Designul tău a fost importat automat din editor.</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Auto-import</span>
                </div>
                <div className="text-sm text-gray-600">Validări: rezoluție OK · bleed OK · culori CMYK · fonturi OK</div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Încarcă fișierul</p>
                    <p className="text-sm text-gray-600">Acceptăm PDF, PNG, JPG, TIFF, SVG · până la 200MB</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Pasul 2</span>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Ai mai folosit un fișier aprobat? Deschide biblioteca și reutilizează-l instant.
                  </p>
                  <button
                    type="button"
                    onClick={() => setLibraryModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    Biblioteca de fișiere
                  </button>
                </div>
                {libraryFile && (
                  <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-blue-900 truncate" title={libraryFile.name}>
                        {libraryFile.name}
                      </p>
                      <p className="text-xs text-blue-800">
                        {libraryFile.type.toUpperCase()} · {formatBytes(libraryFile.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-xs font-semibold text-blue-900 hover:underline"
                    >
                      Schimbă fișierul
                    </button>
                  </div>
                )}
                <FileUpload
                  onFileSelect={handleFileSelect}
                  helperText="Asigură-te că fișierul are bleed și este în CMYK. Dacă nu, primești un warning."
                />
              </div>
            )}

            {validation && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-900 mb-3">Validări automate</p>
                <ValidationList result={validation} />
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-gray-600">
                {status.message || 'Alege un fișier pentru a continua.'}
              </div>
              <button
                type="button"
                disabled={!canContinue}
                onClick={onContinue}
                className={`px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm transition ${
                  canContinue ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continuă la pasul 3
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <FilePreview
            file={file}
            previewUrl={previewUrl}
            pages={pages}
            validation={validation}
            overall={status.overall}
            onRemove={file || previewUrl ? handleRemoveFile : undefined}
            fileLabel={libraryFile ? libraryFile.name : fromEditor ? 'Design importat din editor' : undefined}
            fileSizeBytes={libraryFile?.size}
            fileTypeHint={libraryFile?.type}
          />
        </div>
      )}

      {activeTab === 'design' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-lg font-semibold text-gray-900 mb-2">Creează designul pentru {productName || 'produs'}</p>
            <p className="text-sm text-gray-600">
              Intră în editorul nostru online sau pornește rapid de la un template recomandat.
            </p>
          </div>
          <DesignEntry onSelectTemplate={handleSelectTemplate} onOpenEditor={handleOpenEditor} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-600">Selectează un template sau deschide editorul pentru a continua.</div>
            <button
              type="button"
              disabled={!designReady}
              onClick={onContinue}
              className={`px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm transition ${
                designReady ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continuă la pasul 3
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <SavedFilesPickerModal
        open={libraryModalOpen}
        onClose={() => setLibraryModalOpen(false)}
        onSelect={handleSelectFromLibrary}
      />
    </div>
  );
}

function ValidationList({ result }: { result: FileValidationResult }) {
  const items = [
    { label: 'Rezoluție minimă', status: result.resolution, helper: 'Minim 1800x1800 px' },
    { label: 'Dimensiuni corecte', status: result.dimensions, helper: 'Respectă formatul și raportul' },
    { label: 'Bleed detectat', status: result.bleed, helper: 'Bleed 3mm recomandat' },
    { label: 'Profil culoare', status: result.color, helper: 'CMYK recomandat pentru tipar' },
    { label: 'Fonturi embed', status: result.fonts, helper: 'Evita fonturile lipsă' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
          <span className={`mt-1 w-2 h-2 rounded-full ${dotClass(item.status)}`} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{item.label}</p>
            <p className="text-xs text-gray-600">{item.helper}</p>
          </div>
          <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${badgeClass(item.status)}`}>
            {labelFor(item.status)}
          </span>
        </div>
      ))}
    </div>
  );
}

function labelFor(status: ValidationStatus) {
  if (status === 'ok') return 'OK';
  if (status === 'warning') return 'Warning';
  return 'Eroare';
}

function badgeClass(status: ValidationStatus) {
  if (status === 'ok') return 'bg-green-100 text-green-700';
  if (status === 'warning') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
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
