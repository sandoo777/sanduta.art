'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEditorStore } from '@/modules/editor/editorStore';

interface ShapeToolProps {
  onClose: () => void;
}

type ShapeType = 'rectangle' | 'circle' | 'triangle';

const shapes: { type: ShapeType; label: string; icon: string }[] = [
  { type: 'rectangle', label: 'Dreptunghi', icon: '⬜' },
  { type: 'circle', label: 'Cerc', icon: '⭕' },
  { type: 'triangle', label: 'Triunghi', icon: '🔺' },
];

export default function ShapeTool({ onClose }: ShapeToolProps) {
  const [selectedShape, setSelectedShape] = useState<ShapeType>('rectangle');
  const [fill, setFill] = useState('#0066FF');
  const [stroke, setStroke] = useState('#000000');
  const [hasStroke, setHasStroke] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [borderRadius, setBorderRadius] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const { addElement, canvasSize } = useEditorStore();

  const handleAddShape = () => {
    const defaultSize = 150;
    
    addElement({
      id: `shape-${Date.now()}`,
      type: 'shape',
      x: (canvasSize.width - defaultSize) / 2,
      y: (canvasSize.height - defaultSize) / 2,
      width: defaultSize,
      height: selectedShape === 'circle' ? defaultSize : defaultSize,
      shape: selectedShape,
      fill,
      stroke: hasStroke ? stroke : undefined,
      strokeWidth: hasStroke ? strokeWidth : undefined,
      borderRadius: selectedShape === 'rectangle' ? borderRadius : 0,
      rotation: 0,
      opacity,
      zIndex: 1,
      visible: true,
      locked: false,
      name: `${shapes.find(s => s.type === selectedShape)?.label} ${Date.now()}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Adaugă Formă</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Shape Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tip Formă
            </label>
            <div className="grid grid-cols-3 gap-2">
              {shapes.map((shape) => (
                <button
                  key={shape.type}
                  onClick={() => setSelectedShape(shape.type)}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${selectedShape === shape.type
                      ? 'border-[#0066FF] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="text-3xl mb-1">{shape.icon}</div>
                  <div className="text-xs text-gray-600">{shape.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fill Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Culoare Fundal
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fill}
                onChange={(e) => setFill(e.target.value)}
                className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={fill}
                onChange={(e) => setFill(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm 
                         focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Stroke */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={hasStroke}
                onChange={(e) => setHasStroke(e.target.checked)}
                className="rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]"
              />
              Bordură
            </label>
            {hasStroke && (
              <div className="space-y-2 ml-6">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={stroke}
                    onChange={(e) => setStroke(e.target.value)}
                    className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={stroke}
                    onChange={(e) => setStroke(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm 
                             focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Grosime: {strokeWidth}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Border Radius (only for rectangle) */}
          {selectedShape === 'rectangle' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rotunjire Colțuri: {borderRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Opacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opacitate: {Math.round(opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Previzualizare
            </label>
            <div className="h-32 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: fill,
                  border: hasStroke ? `${strokeWidth}px solid ${stroke}` : undefined,
                  borderRadius: selectedShape === 'rectangle' 
                    ? `${borderRadius}px` 
                    : selectedShape === 'circle' 
                      ? '50%' 
                      : '0',
                  opacity,
                  clipPath: selectedShape === 'triangle' 
                    ? 'polygon(50% 0%, 0% 100%, 100% 100%)' 
                    : undefined,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                     rounded-lg hover:bg-gray-50 transition-colors"
          >
            Anulează
          </button>
          <button
            onClick={handleAddShape}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0066FF] rounded-lg 
                     hover:bg-[#0052CC] transition-colors"
          >
            Adaugă pe Canvas
          </button>
        </div>
      </div>
    </div>
  );
}
