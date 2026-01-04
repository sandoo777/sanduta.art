'use client';

import { EditorElement } from '@/modules/editor/editorStore';

type UpdateHandler = <K extends keyof EditorElement>(property: K, value: EditorElement[K]) => void;

interface TextPropertiesProps {
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

const FONT_FAMILIES = [
  'Inter',
  'Poppins',
  'Roboto',
  'Montserrat',
  'Open Sans',
  'Lato',
  'Playfair Display',
  'Merriweather',
];

const FONT_WEIGHTS = [
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semibold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra Bold' },
];

export default function TextProperties({ element, onUpdate }: TextPropertiesProps) {
  return (
    <div className="space-y-4">
      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Conținut
        </label>
        <textarea
          value={element.content || ''}
          onChange={(e) => onUpdate('content', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                   focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm resize-none"
          placeholder="Introdu text..."
        />
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font
        </label>
        <select
          value={element.fontFamily || 'Inter'}
          onChange={(e) => onUpdate('fontFamily', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                   focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dimensiune: {element.fontSize || 16}px
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="8"
            max="120"
            value={element.fontSize || 16}
            onChange={(e) => onUpdate('fontSize', parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
          />
          <input
            type="number"
            min="8"
            max="120"
            value={element.fontSize || 16}
            onChange={(e) => onUpdate('fontSize', parseFloat(e.target.value))}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
          />
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Grosime
        </label>
        <select
          value={element.fontWeight || 400}
          onChange={(e) => onUpdate('fontWeight', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                   focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm"
        >
          {FONT_WEIGHTS.map((weight) => (
            <option key={weight.value} value={weight.value}>
              {weight.label} ({weight.value})
            </option>
          ))}
        </select>
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Culoare Text
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={element.color || '#111827'}
              onChange={(e) => onUpdate('color', e.target.value)}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={element.color || '#111827'}
              onChange={(e) => onUpdate('color', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm font-mono"
              placeholder="#000000"
            />
          </div>
          {/* Preset colors */}
          <div className="grid grid-cols-7 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onUpdate('color', color)}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  element.color === color
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

      {/* Text Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aliniere
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['left' as const, 'center' as const, 'right' as const]).map((align) => (
            <button
              key={align}
              onClick={() => onUpdate('textAlign', align)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                (element.textAlign || 'left') === align
                  ? 'bg-[#0066FF] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {align === 'left' && '⬅️'}
              {align === 'center' && '↔️'}
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Înălțime Linie: {(element.lineHeight || 1.5).toFixed(1)}
        </label>
        <input
          type="range"
          min="0.8"
          max="3"
          step="0.1"
          value={element.lineHeight || 1.5}
          onChange={(e) => onUpdate('lineHeight', parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
        />
      </div>

      {/* Letter Spacing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Spațiere Caractere: {(element.letterSpacing || 0).toFixed(1)}px
        </label>
        <input
          type="range"
          min="-5"
          max="20"
          step="0.5"
          value={element.letterSpacing || 0}
          onChange={(e) => onUpdate('letterSpacing', parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
        />
      </div>

      {/* Text Transform */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transformare Text
        </label>
        <select
          value={element.textTransform || 'none'}
          onChange={(e) => {
            onUpdate('textTransform', (e.target.value || 'none') as 'none' | 'uppercase' | 'lowercase' | 'capitalize');
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                   focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm"
        >
          <option value="none">Normal</option>
          <option value="uppercase">MAJUSCULE</option>
          <option value="lowercase">minuscule</option>
          <option value="capitalize">Capitalize Each Word</option>
        </select>
      </div>

      {/* Background Color (optional) */}
      <div>
        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
          <span>Fundal Text</span>
          <input
            type="checkbox"
            checked={!!element.backgroundColor}
            onChange={(e) => onUpdate('backgroundColor', e.target.checked ? '#FACC15' : undefined)}
            className="rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]"
          />
        </label>
        {element.backgroundColor && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={element.backgroundColor}
              onChange={(e) => onUpdate('backgroundColor', e.target.value)}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={element.backgroundColor}
              onChange={(e) => onUpdate('backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm font-mono"
            />
          </div>
        )}
      </div>
    </div>
  );
}
