'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { OpenEditorButton } from '../OpenEditorButton';
import { UploadDesignButton } from '../UploadDesignButton';

interface ProjectSectionProps {
  projectId?: string;
  previewImage?: string;
  productId: string;
  dimensions?: {
    width: number;
    height: number;
    unit: 'mm' | 'cm' | 'm';
  };
  materialId?: string;
  printMethodId?: string;
  finishingIds?: string[];
  errors?: string[];
  onClearProject?: () => void;
}

export function ProjectSection({
  projectId,
  previewImage,
  productId,
  dimensions,
  materialId,
  printMethodId,
  finishingIds,
  errors = [],
  onClearProject,
}: ProjectSectionProps) {
  const hasProject = projectId && previewImage;

  const handleUpload = (file: File) => {
    // TODO: реализовать загрузку файла на сервер и обновление projectId/previewImage
    // Например, вызвать API /api/projects/upload, получить projectId и preview, вызвать onSetProject
    alert(`Fișierul ${file.name} a fost selectat pentru upload (mock)`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Machetă grafică</CardTitle>
      </CardHeader>
      <CardContent>
        {hasProject ? (
          /* Project exists - show preview */
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-green-200 bg-slate-50">
              <Image
                src={previewImage}
                alt="Project preview"
                fill
                className="object-contain"
              />
              <div className="absolute right-2 top-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                  <svg
                    className="mr-1 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Machetă finalizată
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <OpenEditorButton
                productId={productId}
                dimensions={dimensions}
                materialId={materialId}
                printMethodId={printMethodId}
                finishingIds={finishingIds}
                projectId={projectId}
                errors={errors}
              />
              {onClearProject && (
                <Button
                  variant="outline"
                  onClick={onClearProject}
                  className="w-full"
                >
                  Șterge macheta
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* No project - show editor button + upload */
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <svg
                className="mx-auto mb-3 h-12 w-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <h3 className="mb-1 text-sm font-semibold text-slate-900">
                Nicio machetă creată
              </h3>
              <p className="text-sm text-slate-600">
                Deschide editorul pentru a crea macheta produsului sau încarcă fișierul tău pregătit pentru tipar.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <OpenEditorButton
                productId={productId}
                dimensions={dimensions}
                materialId={materialId}
                printMethodId={printMethodId}
                finishingIds={finishingIds}
                errors={errors}
              />
              <UploadDesignButton onUpload={handleUpload} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
