'use client';

import { Button } from '@/components/ui/Button';
import { generateEditorUrl, type EditorUrlParams } from '@/lib/editor/generateEditorUrl';
import { useRouter } from 'next/navigation';

interface OpenEditorButtonProps {
  productId: string;
  dimensions?: {
    width: number;
    height: number;
    unit: 'mm' | 'cm' | 'm';
  };
  materialId?: string;
  printMethodId?: string;
  finishingIds?: string[];
  templateId?: string;
  projectId?: string;
  disabled?: boolean;
  onOpen?: () => void;
}

export function OpenEditorButton({
  productId,
  dimensions,
  materialId,
  printMethodId,
  finishingIds,
  templateId,
  projectId,
  disabled,
  onOpen,
}: OpenEditorButtonProps) {
  const router = useRouter();

  // Check if required fields are present
  const canOpenEditor = dimensions && materialId && printMethodId;

  const handleOpenEditor = () => {
    if (!canOpenEditor) {
      return;
    }

    // Call onOpen callback if provided
    onOpen?.();

    // Generate editor URL with parameters
    const editorParams: EditorUrlParams = {
      productId,
      dimensions: dimensions!,
      bleed: 3, // Default bleed 3mm
      materialId,
      printMethodId,
      finishingIds,
      templateId,
      projectId,
    };

    const editorUrl = generateEditorUrl(editorParams);

    // Navigate to editor
    router.push(editorUrl);
  };

  return (
    <div className="space-y-3">
      {/* Editor button */}
      <Button
        onClick={handleOpenEditor}
        disabled={disabled || !canOpenEditor}
        className="w-full"
        size="lg"
        variant="primary"
      >
        <svg
          className="mr-2 h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        {projectId ? 'Continuă editarea' : 'Deschide Editorul'}
      </Button>

      {/* Requirements message */}
      {!canOpenEditor && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <div className="font-medium">Completează următoarele pentru a deschide editorul:</div>
              <ul className="mt-1 list-inside list-disc space-y-1">
                {!dimensions && <li>Selectează dimensiunile</li>}
                {!materialId && <li>Selectează materialul</li>}
                {!printMethodId && <li>Selectează metoda de imprimare</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      {canOpenEditor && (
        <p className="text-center text-xs text-slate-500">
          Creează sau editează macheta produsului în editor
        </p>
      )}
    </div>
  );
}
