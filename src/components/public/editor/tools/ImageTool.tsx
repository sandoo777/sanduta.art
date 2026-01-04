'use client';

import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEditorStore } from '@/modules/editor/editorStore';

interface ImageToolProps {
  onClose: () => void;
}

export default function ImageTool({ onClose }: ImageToolProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addElement, canvasSize } = useEditorStore();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vă rugăm selectați o imagine validă');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !preview) return;

    setUploading(true);

    // Load image to get dimensions
    const img = new Image();
    img.onload = () => {
      const maxWidth = canvasSize.width * 0.6;
      const maxHeight = canvasSize.height * 0.6;
      
      let width = img.width;
      let height = img.height;
      
      // Scale down if too large
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      // Add element to canvas
      addElement({
        id: `image-${Date.now()}`,
        type: 'image',
        x: (canvasSize.width - width) / 2,
        y: (canvasSize.height - height) / 2,
        width,
        height,
        src: preview, // In production, upload to server first
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        visible: true,
        locked: false,
        name: selectedFile.name,
      });

      setUploading(false);
      onClose();
    };

    img.src = preview;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Adaugă Imagine</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Upload Area */}
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer 
                       hover:border-[#0066FF] hover:bg-blue-50 transition-all"
            >
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                Click pentru a selecta imagine
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG, WEBP până la 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto max-h-64 object-contain bg-gray-50"
                />
                <button
                  onClick={() => {
                    setPreview('');
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md 
                           hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* File Info */}
              <div className="text-sm text-gray-600">
                <p className="font-medium truncate">{selectedFile?.name}</p>
                <p className="text-xs text-gray-400">
                  {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}
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
            onClick={handleUpload}
            disabled={!preview || uploading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0066FF] rounded-lg 
                     hover:bg-[#0052CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Se încarcă...' : 'Adaugă pe Canvas'}
          </button>
        </div>
      </div>
    </div>
  );
}
