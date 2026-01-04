'use client';

import { EditorElement } from '@/modules/editor/editorStore';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useRef } from 'react';

type UpdateHandler = <K extends keyof EditorElement>(property: K, value: EditorElement[K]) => void;

interface ImagePropertiesProps {
  element: EditorElement;
  onUpdate: UpdateHandler;
}

export default function ImageProperties({ element, onUpdate }: ImagePropertiesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReplaceImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onUpdate('src', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Previzualizare
        </label>
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
          {element.src ? (
            <img
              src={element.src}
              alt="Preview"
              className="w-full h-full object-contain"
              style={{
                filter: `
                  brightness(${element.brightness || 100}%)
                  contrast(${element.contrast || 100}%)
                  saturate(${element.saturation || 100}%)
                  blur(${element.blur || 0}px)
                `
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <PhotoIcon className="w-16 h-16" />
            </div>
          )}
        </div>
      </div>

      {/* Replace Image Button */}
      <div>
        <button
          onClick={handleReplaceImage}
          className="w-full px-4 py-2 bg-[#0066FF] text-white rounded-lg hover:bg-[#0052CC] 
                   transition-colors font-medium text-sm flex items-center justify-center gap-2"
        >
          <PhotoIcon className="w-5 h-5" />
          Înlocuiește Imaginea
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opacitate: {Math.round((element.opacity || 1) * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={element.opacity || 1}
          onChange={(e) => onUpdate('opacity', parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
        />
      </div>

      {/* Filters Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 text-sm">Filtre</h4>

        {/* Brightness */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Luminozitate: {element.brightness || 100}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={element.brightness || 100}
            onChange={(e) => onUpdate('brightness', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
          />
        </div>

        {/* Contrast */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contrast: {element.contrast || 100}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={element.contrast || 100}
            onChange={(e) => onUpdate('contrast', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
          />
        </div>

        {/* Saturation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Saturație: {element.saturation || 100}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={element.saturation || 100}
            onChange={(e) => onUpdate('saturation', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
          />
        </div>

        {/* Blur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blur: {element.blur || 0}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={element.blur || 0}
            onChange={(e) => onUpdate('blur', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
          />
        </div>

        {/* Reset Filters Button */}
        <button
          onClick={() => {
            onUpdate('brightness', 100);
            onUpdate('contrast', 100);
            onUpdate('saturation', 100);
            onUpdate('blur', 0);
          }}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                   transition-colors font-medium text-sm"
        >
          Resetează Filtrele
        </button>
      </div>

      {/* Object Fit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mod Afișare
        </label>
        <select
          value={element.objectFit || 'cover'}
          onChange={(e) => onUpdate('objectFit', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                   focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm"
        >
          <option value="cover">Cover (acoperă)</option>
          <option value="contain">Contain (încadrează)</option>
          <option value="fill">Fill (umple)</option>
          <option value="none">None (original)</option>
        </select>
      </div>

      {/* Border Radius */}
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
    </div>
  );
}
