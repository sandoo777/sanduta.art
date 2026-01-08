'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface CartItemProjectPreviewProps {
  projectId: string;
  previewImage: string;
  productSlug: string;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
  onEdit?: () => void;
}

export function CartItemProjectPreview({
  projectId,
  previewImage,
  productSlug,
  dimensions,
  onEdit,
}: CartItemProjectPreviewProps) {
  return (
    <div className="rounded-lg border-2 border-slate-200 bg-white p-4">
      <div className="flex items-start gap-4">
        {/* Preview Image */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <Image
            src={previewImage}
            alt="Project preview"
            fill
            className="object-contain"
          />
        </div>

        {/* Project Info */}
        <div className="flex-1">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  <svg
                    className="mr-1 h-3 w-3"
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

              {dimensions && (
                <p className="mt-1 text-sm text-slate-600">
                  {dimensions.width} × {dimensions.height} {dimensions.unit}
                </p>
              )}
            </div>

            {/* Edit Button */}
            <Link
              href={`/editor?projectId=${projectId}&productSlug=${productSlug}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Editează
            </Link>
          </div>

          {/* Project ID */}
          <p className="text-xs text-slate-400">ID: {projectId.slice(0, 8)}...</p>
        </div>
      </div>
    </div>
  );
}
