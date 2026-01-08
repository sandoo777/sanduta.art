'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Image from 'next/image';

interface ProductImage {
  url: string;
  alt: string;
}

interface ProductPreviewProps {
  images: ProductImage[];
  currentSelections: {
    material?: string;
    printMethod?: string;
    finishing?: string[];
    dimensions?: { width: number; height: number; unit: string };
  };
}

export function ProductPreview({
  images,
  currentSelections,
}: ProductPreviewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (images.length === 0) {
    return null;
  }

  const activeImage = images[activeImageIndex];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previzualizare</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main image */}
          <div
            className={`relative aspect-square overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-100 ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <Image
              src={activeImage.url}
              alt={activeImage.alt}
              fill
              className={`object-contain transition-transform duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              priority={activeImageIndex === 0}
            />
          </div>

          {/* Thumbnail gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveImageIndex(index);
                    setIsZoomed(false);
                  }}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:border-blue-300 ${
                    activeImageIndex === index
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-slate-200'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Current selections summary */}
          <div className="space-y-2 rounded-lg bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-700">
              Selecțiile tale:
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              {currentSelections.dimensions && (
                <div className="flex justify-between">
                  <span>Dimensiuni:</span>
                  <span className="font-medium text-slate-900">
                    {currentSelections.dimensions.width} ×{' '}
                    {currentSelections.dimensions.height}{' '}
                    {currentSelections.dimensions.unit}
                  </span>
                </div>
              )}
              {currentSelections.material && (
                <div className="flex justify-between">
                  <span>Material:</span>
                  <span className="font-medium text-slate-900">
                    {currentSelections.material}
                  </span>
                </div>
              )}
              {currentSelections.printMethod && (
                <div className="flex justify-between">
                  <span>Metodă imprimare:</span>
                  <span className="font-medium text-slate-900">
                    {currentSelections.printMethod}
                  </span>
                </div>
              )}
              {currentSelections.finishing &&
                currentSelections.finishing.length > 0 && (
                  <div className="flex justify-between">
                    <span>Finisaje:</span>
                    <span className="font-medium text-slate-900">
                      {currentSelections.finishing.join(', ')}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
