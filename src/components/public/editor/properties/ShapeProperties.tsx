'use client';

import { EditorElement } from '@/modules/editor/editorStore';
import { useState } from 'react';

type UpdateHandler = <K extends keyof EditorElement>(property: K, value: EditorElement[K]) => void;

interface ShapePropertiesProps {
  element: EditorElement;
  onUpdate: UpdateHandler;
}

const PRESET_COLORS = [
  '#111827', '#374151', '#6B7280', '#9CA3AF',
  '#0066FF', '#3B82F6', '#60A5FA', '#93C5FD',
  '#DC2626', '#EF4444', '#F87171', '#FCA5A5',
  '#FACC15', '#FDE047', '#FEF08A', '#FEF9C3',
  '#10B981', '#34D399', '#6EE7B7', '#A7F3D0',
  '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE',
  '#FFFFFF', '#F9FAFB', '#F3F4F6', '#000000',
];

export default function ShapeProperties({ element, onUpdate }: ShapePropertiesProps) {
  const [hasShadow, setHasShadow] = useState(!!element.shadow);

  const toggleShadow = (enabled: boolean) => {
    setHasShadow(enabled);
    if (enabled) {
      onUpdate('shadow', {
        offsetX: 0,
        offsetY: 4,
        blur: 8,
        color: 'rgba(0, 0, 0, 0.25)',
      });
    } else {
      onUpdate('shadow', undefined);
    }
  };

  return (
    <div className="space-y-4">
      {/* Shape Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tip Formă
        </label>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
          {(['rectangle' as const, 'circle' as const, 'triangle' as const]).map((shape) => (
            <button
              key={shape}
              onClick={() => onUpdate('shape', shape)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                (element.shape || 'rectangle') === shape
                  ? 'bg-[#0066FF] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {shape === 'rectangle' && '⬜'}
              {shape === 'circle' && '🔵'}
              {shape === 'triangle' && '🔺'}
            </button>
          ))}
        </div>
      </div>

      {/* Fill Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Culoare Umplere
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={element.fill || '#0066FF'}
              onChange={(e) => onUpdate('fill', e.target.value)}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={element.fill || '#0066FF'}
              onChange={(e) => onUpdate('fill', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm font-mono"
              placeholder="#0066FF"
            />
          </div>
          {/* Preset colors */}
          <div className="grid grid-cols-7 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onUpdate('fill', color)}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  element.fill === color
                    ? 'border-[#0066FF] ring-2 ring-[#0066FF] ring-opacity-30'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Border Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 text-sm">Contur</h4>

        {/* Border Toggle */}
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Activează Contur</span>
            <input
              type="checkbox"
              checked={!!element.stroke}
              onChange={(e) => onUpdate('stroke', e.target.checked ? '#111827' : undefined)}
              className="rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]"
            />
          </label>
        </div>

        {element.stroke && (
          <>
            {/* Border Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Culoare Contur
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={element.stroke}
                  onChange={(e) => onUpdate('stroke', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={element.stroke}
                  onChange={(e) => onUpdate('stroke', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm font-mono"
                />
              </div>
            </div>

            {/* Border Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grosime Contur: {element.strokeWidth || 2}px
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={element.strokeWidth || 2}
                onChange={(e) => onUpdate('strokeWidth', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
              />
            </div>

            {/* Border Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stil Contur {/* strokeStyle solid dashed */}
              </label>
              <select
                value={element.strokeStyle || 'solid'}
                onChange={(e) => {
                  onUpdate('strokeStyle', (e.target.value || 'solid') as 'solid' | 'dashed' | 'dotted');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                         focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Border Radius (only for rectangle) */}
      {element.shape === 'rectangle' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colțuri Rotunjite: {element.borderRadius || 0}px
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={element.borderRadius || 0}
            onChange={(e) => onUpdate('borderRadius', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
          />
        </div>
      )}

      {/* Shadow Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 text-sm">Umbră</h4>
          <input
            type="checkbox"
            checked={hasShadow}
            onChange={(e) => toggleShadow(e.target.checked)}
            className="rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]"
          />
        </div>

        {hasShadow && element.shadow && (
          <>
            {/* offsetX offsetY shadow controls */}
            {/* Shadow Offset X */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offset X: {element.shadow?.offsetX || 0}px
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={element.shadow?.offsetX || 0}
                onChange={(e) => {
                  const shadow = element.shadow || { offsetX: 0, offsetY: 0, blur: 0, color: '#000000' };
                  onUpdate('shadow', { 
                    offsetX: parseFloat(e.target.value),
                    offsetY: shadow.offsetY,
                    blur: shadow.blur,
                    color: shadow.color,
                  });
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
              />
            </div>

            {/* Shadow Offset Y */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offset Y: {element.shadow?.offsetY || 0}px
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={element.shadow?.offsetY || 0}
                onChange={(e) => {
                  const shadow = element.shadow || { offsetX: 0, offsetY: 0, blur: 0, color: '#000000' };
                  onUpdate('shadow', { 
                    offsetX: shadow.offsetX,
                    offsetY: parseFloat(e.target.value),
                    blur: shadow.blur,
                    color: shadow.color,
                  });
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
              />
            </div>

            {/* Shadow Blur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blur: {element.shadow?.blur || 0}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={element.shadow?.blur || 0}
                onChange={(e) => {
                  const shadow = element.shadow || { offsetX: 0, offsetY: 0, blur: 0, color: '#000000' };
                  onUpdate('shadow', { 
                    offsetX: shadow.offsetX,
                    offsetY: shadow.offsetY,
                    blur: parseFloat(e.target.value),
                    color: shadow.color,
                  });
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
              />
            </div>

            {/* Shadow Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Culoare Umbră
              </label>
              <input
                type="color"
                value={element.shadow?.color || '#000000'}
                onChange={(e) => {
                  const shadow = element.shadow || { offsetX: 0, offsetY: 0, blur: 0, color: '#000000' };
                  onUpdate('shadow', { 
                    offsetX: shadow.offsetX,
                    offsetY: shadow.offsetY,
                    blur: shadow.blur,
                    color: e.target.value,
                  });
                }}
                className="w-full h-10 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
