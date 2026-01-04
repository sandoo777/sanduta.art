'use client';

import { useEditorStore, EditorElement } from '@/modules/editor/editorStore';
import TextProperties from './TextProperties';
import ImageProperties from './ImageProperties';
import ShapeProperties from './ShapeProperties';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

type UpdateHandler = <K extends keyof EditorElement>(property: K, value: EditorElement[K]) => void;

export default function PropertiesPanel() {
  const { elements, selectedElementId, updateElement } = useEditorStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['general', 'specific'])
  );

  const selectedElement = elements.find((el: EditorElement) => el.id === selectedElementId);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  if (!selectedElement) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Selectează un element
        </h3>
        <p className="text-sm text-gray-600">
          Click pe un element din canvas pentru a vedea și edita proprietățile
        </p>
      </div>
    );
  }

  const handleUpdateProperty: UpdateHandler = (property, value) => {
    updateElement(selectedElementId!, { [property]: value });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <h3 className="font-semibold text-gray-900">Proprietăți</h3>
        <p className="text-xs text-gray-600 mt-1">
          {selectedElement.type === 'text' && '📝 Element Text'}
          {selectedElement.type === 'image' && '🖼️ Element Imagine'}
          {selectedElement.type === 'shape' && '⬜ Element Formă'}
        </p>
      </div>

      {/* General Properties - Common for all elements */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('general')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">General</span>
          {expandedSections.has('general') ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
        
        {expandedSections.has('general') && (
          <div className="p-4 space-y-4 bg-gray-50">
            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poziție
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">X</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => handleUpdateProperty('x', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                             focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Y</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => handleUpdateProperty('y', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                             focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensiuni
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Lățime</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.width)}
                    onChange={(e) => handleUpdateProperty('width', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                             focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Înălțime</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.height)}
                    onChange={(e) => handleUpdateProperty('height', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                             focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rotație: {selectedElement.rotation || 0}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedElement.rotation || 0}
                onChange={(e) => handleUpdateProperty('rotation', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                         accent-[#0066FF]"
              />
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opacitate: {Math.round((selectedElement.opacity || 1) * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedElement.opacity || 1}
                onChange={(e) => handleUpdateProperty('opacity', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                         accent-[#0066FF]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Specific Properties - Based on element type */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('specific')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">
            {selectedElement.type === 'text' && 'Proprietăți Text'}
            {selectedElement.type === 'image' && 'Proprietăți Imagine'}
            {selectedElement.type === 'shape' && 'Proprietăți Formă'}
          </span>
          {expandedSections.has('specific') ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
        
        {expandedSections.has('specific') && (
          <div className="p-4 bg-gray-50">
            {selectedElement.type === 'text' && (
              <TextProperties element={selectedElement} onUpdate={handleUpdateProperty} />
            )}
            {selectedElement.type === 'image' && (
              <ImageProperties element={selectedElement} onUpdate={handleUpdateProperty} />
            )}
            {selectedElement.type === 'shape' && (
              <ShapeProperties element={selectedElement} onUpdate={handleUpdateProperty} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
