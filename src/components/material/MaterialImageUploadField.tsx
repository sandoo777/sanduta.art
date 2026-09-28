'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, ImageIcon, Loader2, Expand } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { FormLabel } from '@/components/ui/FormLabel';
import type { MaterialFormData } from '@/lib/validations/admin';

type MaterialImageFieldName = 'thumbnailImage' | 'macroTextureImage';

type MaterialImageUploadFieldProps = {
  fieldName: MaterialImageFieldName;
  label: string;
  helperText?: string;
  required?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  imageAlt: string;
  resizeWidth?: number;
  resizeHeight?: number;
  resizeMode?: 'cover' | 'contain';
  validationHint?: string;
  enableFullscreenZoom?: boolean;
  previewMode?: 'thumbnail' | 'macro';
  fullViewLabel?: string;
};

async function loadImage(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = 'async';

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Failed to load image file'));
      image.src = objectUrl;
    });
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function resizeImageFile(
  file: File,
  targetWidth: number,
  targetHeight: number,
  mode: 'cover' | 'contain'
): Promise<File> {
  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  if (mode === 'cover') {
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const sourceRatio = image.width / image.height;
    const targetRatio = targetWidth / targetHeight;

    let sx = 0;
    let sy = 0;
    let sWidth = image.width;
    let sHeight = image.height;

    if (sourceRatio > targetRatio) {
      sWidth = image.height * targetRatio;
      sx = (image.width - sWidth) / 2;
    } else {
      sHeight = image.width / targetRatio;
      sy = (image.height - sHeight) / 2;
    }

    ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
  } else {
    const widthScale = targetWidth / image.width;
    const heightScale = targetHeight / image.height;
    const scale = Math.min(widthScale, heightScale, 1);

    const outWidth = Math.max(1, Math.round(image.width * scale));
    const outHeight = Math.max(1, Math.round(image.height * scale));

    canvas.width = outWidth;
    canvas.height = outHeight;
    ctx.drawImage(image, 0, 0, outWidth, outHeight);
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/jpeg', 0.9);
  });

  if (!blob) {
    throw new Error('Failed to convert image');
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'material-image';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}

export function MaterialImageUploadField({
  fieldName,
  label,
  helperText,
  required,
  emptyTitle,
  emptyDescription,
  imageAlt,
  resizeWidth,
  resizeHeight,
  resizeMode = 'cover',
  validationHint,
  enableFullscreenZoom,
  previewMode = 'macro',
  fullViewLabel = 'View Full Image',
}: MaterialImageUploadFieldProps) {
  const form = useFormContext<MaterialFormData>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const currentValue = (form.watch(fieldName) ?? '').trim();

  useEffect(() => {
    if (!isZoomOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsZoomOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isZoomOpen]);

  async function handleUpload(file: File) {
    setIsUploading(true);
    try {
      const uploadFile = resizeWidth && resizeHeight
        ? await resizeImageFile(file, resizeWidth, resizeHeight, resizeMode)
        : file;

      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const payload = await response.json() as { url?: string };
      if (!payload.url) {
        throw new Error('Upload missing url');
      }

      form.setValue(fieldName, payload.url, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      form.clearErrors(fieldName);
    } catch {
      form.setError(fieldName, {
        type: 'manual',
        message: 'Nu am putut incarca imaginea. Incearca din nou.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleRemoveImage() {
    form.setValue(fieldName, '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  const isThumbnailPreview = previewMode === 'thumbnail';

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <FormLabel htmlFor={`${fieldName}-upload`}>
            {label}{required ? ' *' : ''}
          </FormLabel>
          {helperText ? <p className="mt-1 text-xs text-gray-500">{helperText}</p> : null}
        </div>
      </div>

      <input
        id={`${fieldName}-upload`}
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleUpload(file);
          }
        }}
      />

      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3">
        {isThumbnailPreview ? (
          <div className="flex items-center gap-4">
            <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {currentValue ? (
                <img
                  src={currentValue}
                  alt={imageAlt}
                  className="max-h-[100px] max-w-[100px] object-contain"
                  onClick={() => enableFullscreenZoom && setIsZoomOpen(true)}
                />
              ) : (
                <ImageIcon className="h-7 w-7 text-gray-400" />
              )}
            </div>

            {!currentValue ? (
              <div className="text-sm text-gray-600">
                <p className="font-medium">{emptyTitle}</p>
                <p className="text-xs text-gray-500">{emptyDescription}</p>
              </div>
            ) : null}
          </div>
        ) : currentValue ? (
          <img
            src={currentValue}
            alt={imageAlt}
            className="max-h-[460px] w-full max-w-[640px] cursor-zoom-in rounded-lg object-contain"
            onClick={() => enableFullscreenZoom && setIsZoomOpen(true)}
          />
        ) : (
          <div className="flex h-56 max-w-[640px] flex-col items-center justify-center gap-2 text-gray-400">
            <ImageIcon className="h-9 w-9" />
            <p className="text-sm font-medium text-gray-600">{emptyTitle}</p>
            <p className="px-4 text-center text-xs text-gray-500">{emptyDescription}</p>
          </div>
        )}
      </div>

      {validationHint ? <p className="text-xs text-gray-500">{validationHint}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {currentValue ? 'Inlocuieste' : 'Incarca imagine'}
        </button>

        {currentValue ? (
          <button
            type="button"
            disabled={isUploading}
            onClick={handleRemoveImage}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Sterge
          </button>
        ) : null}

        {currentValue && enableFullscreenZoom ? (
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-700"
          >
            <Expand className="h-4 w-4" />
            {fullViewLabel}
          </button>
        ) : null}
      </div>

      {form.formState.errors[fieldName] ? (
        <p className="text-sm text-red-600">{form.formState.errors[fieldName]?.message}</p>
      ) : null}

      {isZoomOpen && currentValue ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <img
            src={currentValue}
            alt={`${imageAlt} full screen`}
            className="max-h-[92vh] max-w-[96vw] rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
