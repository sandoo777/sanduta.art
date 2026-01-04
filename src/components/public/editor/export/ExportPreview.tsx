'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '@heroicons/react/24/outline';
import { ExportOptions } from '@/modules/editor/export/exportTypes';

interface ExportPreviewProps {
  canvasWidth: number;
  canvasHeight: number;
  options: ExportOptions;
}

export default function ExportPreview({
  canvasWidth,
  canvasHeight,
  options,
}: ExportPreviewProps) {
  const [zoom, setZoom] = useState(1);

  // Calculăm dimensiunile cu bleed
  const bleedMm = options.format === 'print-ready' ? options.bleed : 0;
  const bleedPx = (bleedMm * 96) / 25.4;
  const totalWidth = canvasWidth + bleedPx * 2;
  const totalHeight = canvasHeight + bleedPx * 2;

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.3));
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4 space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-gray-700">Previzualizare export</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Zoom out"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-xs text-gray-600 min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            title="Zoom in"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="bg-white rounded border border-gray-300 overflow-auto" style={{ maxHeight: '300px' }}>
        <div className="p-8 flex items-center justify-center min-h-[250px]">
          <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
            {/* Canvas area with bleed */}
            <div
              className="relative bg-white shadow-lg"
              style={{
                width: `${totalWidth}px`,
                height: `${totalHeight}px`,
              }}
            >
              {/* Bleed area (if any) */}
              {bleedPx > 0 && (
                <div
                  className="absolute inset-0 border-2 border-dashed border-red-400 pointer-events-none"
                  style={{
                    borderWidth: `${bleedPx}px`,
                  }}
                />
              )}

              {/* Main canvas area */}
              <div
                className="absolute bg-blue-50 border-2 border-blue-500"
                style={{
                  top: `${bleedPx}px`,
                  left: `${bleedPx}px`,
                  width: `${canvasWidth}px`,
                  height: `${canvasHeight}px`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                  <div className="text-center">
                    <div className="font-medium">Zona de design</div>
                    <div>{canvasWidth} × {canvasHeight} px</div>
                  </div>
                </div>
              </div>

              {/* Crop marks (if enabled) */}
              {options.format === 'print-ready' && options.cropMarks && (
                <>
                  {/* Top-left */}
                  <div className="absolute" style={{ top: `${bleedPx}px`, left: `${bleedPx - 5}px` }}>
                    <div className="w-3 h-px bg-black" />
                  </div>
                  <div className="absolute" style={{ top: `${bleedPx - 5}px`, left: `${bleedPx}px` }}>
                    <div className="w-px h-3 bg-black" />
                  </div>

                  {/* Top-right */}
                  <div className="absolute" style={{ top: `${bleedPx}px`, right: `${bleedPx - 5}px` }}>
                    <div className="w-3 h-px bg-black" />
                  </div>
                  <div className="absolute" style={{ top: `${bleedPx - 5}px`, right: `${bleedPx}px` }}>
                    <div className="w-px h-3 bg-black" />
                  </div>

                  {/* Bottom-left */}
                  <div className="absolute" style={{ bottom: `${bleedPx}px`, left: `${bleedPx - 5}px` }}>
                    <div className="w-3 h-px bg-black" />
                  </div>
                  <div className="absolute" style={{ bottom: `${bleedPx - 5}px`, left: `${bleedPx}px` }}>
                    <div className="w-px h-3 bg-black" />
                  </div>

                  {/* Bottom-right */}
                  <div className="absolute" style={{ bottom: `${bleedPx}px`, right: `${bleedPx - 5}px` }}>
                    <div className="w-3 h-px bg-black" />
                  </div>
                  <div className="absolute" style={{ bottom: `${bleedPx - 5}px`, right: `${bleedPx}px` }}>
                    <div className="w-px h-3 bg-black" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-50 border border-blue-500 rounded" />
          <span>Zonă design</span>
        </div>
        {bleedPx > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-dashed border-red-400 rounded" />
            <span>Bleed ({bleedMm}mm)</span>
          </div>
        )}
        {options.cropMarks && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-px bg-black" />
            <span>Crop marks</span>
          </div>
        )}
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-blue-50 rounded p-2">
          <div className="text-gray-600">Dimensiune design</div>
          <div className="font-medium">{canvasWidth} × {canvasHeight} px</div>
        </div>
        <div className="bg-blue-50 rounded p-2">
          <div className="text-gray-600">Dimensiune finală</div>
          <div className="font-medium">{Math.round(totalWidth)} × {Math.round(totalHeight)} px</div>
        </div>
      </div>
    </div>
  );
}
