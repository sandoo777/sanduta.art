'use client';

import { useRef, useState } from 'react';
import {
  CursorArrowRaysIcon,
  PhotoIcon,
  Square3Stack3DIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline';
import { useEditorStore } from '@/modules/editor/editorStore';
import ImageTool from './tools/ImageTool';
import ShapeTool from './tools/ShapeTool';
import TemplateLibrary from './templates/TemplateLibrary';

type ToolType = 'text' | 'image' | 'shape' | 'elements' | 'upload' | 'templates' | 'background';

interface Tool {
  id: ToolType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
}

const tools: Tool[] = [
  { id: 'text', icon: CursorArrowRaysIcon, label: 'Text', shortcut: 'T' },
  { id: 'image', icon: PhotoIcon, label: 'Imagini', shortcut: 'I' },
  { id: 'shape', icon: Square3Stack3DIcon, label: 'Forme', shortcut: 'S' },
  { id: 'elements', icon: SparklesIcon, label: 'Elemente', shortcut: 'E' },
  { id: 'upload', icon: ArrowUpTrayIcon, label: 'Upload', shortcut: 'U' },
  { id: 'templates', icon: DocumentDuplicateIcon, label: 'Template-uri', shortcut: 'M' },
  { id: 'background', icon: PaintBrushIcon, label: 'Background', shortcut: 'B' },
];

export default function EditorSidebarLeft() {
  const idRef = useRef(0);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [showImageTool, setShowImageTool] = useState(false);
  const [showShapeTool, setShowShapeTool] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const { addElement, canvasSize, loadTemplate } = useEditorStore();

  const handleToolClick = (toolId: ToolType) => {
    setActiveTool(activeTool === toolId ? null : toolId);
    
    switch (toolId) {
      case 'text':
        handleAddText();
        break;
      case 'image':
        setShowImageTool(true);
        break;
      case 'shape':
        setShowShapeTool(true);
        break;
      case 'templates':
        setShowTemplateLibrary(true);
        break;
      default:
        console.log('Tool selected:', toolId);
    }
  };

  const handleAddText = () => {
    const defaultWidth = 200;
    const defaultHeight = 60;
    idRef.current += 1;
    const nextId = idRef.current;
    
    addElement({
      id: `text-${nextId}`,
      type: 'text',
      x: (canvasSize.width - defaultWidth) / 2,
      y: (canvasSize.height - defaultHeight) / 2,
      width: defaultWidth,
      height: defaultHeight,
      content: 'Text nou',
      fontSize: 32,
      fontFamily: 'Inter',
      fontWeight: 600,
      color: '#111827',
      textAlign: 'center',
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      visible: true,
      locked: false,
      name: `Text ${nextId}`,
    });
  };

  return (
    <div className="h-full flex flex-col py-4">
      {/* Tools List */}
      <div className="flex-1 flex flex-col items-center gap-2 px-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`
                group relative w-14 h-14 rounded-lg flex flex-col items-center justify-center
                transition-all duration-200
                ${isActive 
                  ? 'bg-[#0066FF] text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              title={`${tool.label} ${tool.shortcut ? `(${tool.shortcut})` : ''}`}
            >
              <Icon className="w-6 h-6" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs 
                           rounded opacity-0 group-hover:opacity-100 transition-opacity 
                           pointer-events-none whitespace-nowrap z-50">
                {tool.label}
                {tool.shortcut && (
                  <span className="ml-1 text-gray-400">({tool.shortcut})</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Section - Settings */}
      <div className="pt-4 border-t border-gray-200">
        <div className="px-2">
          <button
            className="w-14 h-14 rounded-lg flex items-center justify-center
                     text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Setări"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tool Modals */}
      {showImageTool && <ImageTool onClose={() => setShowImageTool(false)} />}
      {showShapeTool && <ShapeTool onClose={() => setShowShapeTool(false)} />}
      {showTemplateLibrary && (
        <TemplateLibrary
          onClose={() => setShowTemplateLibrary(false)}
          onSelectTemplate={(template) => {
            loadTemplate(template);
            setShowTemplateLibrary(false);
          }}
        />
      )}
    </div>
  );
}
