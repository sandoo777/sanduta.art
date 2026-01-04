'use client';
/* eslint-disable react-hooks/refs */

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  Bars3Icon,
  RectangleGroupIcon,
  PhotoIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import type { EditorElement } from '@/modules/editor/editorStore';

interface LayerItemProps {
  element: EditorElement;
  selected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onRename: (name: string) => void;
  index: number;
}

function getDefaultName(element: EditorElement, index: number) {
  const byType: Record<EditorElement['type'], string> = {
    text: 'Text',
    image: 'Imagine',
    shape: 'Formă',
  };
  return `${byType[element.type]} ${index + 1}`;
}

export function LayerItem({
  element,
  selected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onRename,
  index,
}: LayerItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(element.name || '');
  const sortable = useSortable({ id: element.id });

  const fallbackName = useMemo(() => getDefaultName(element, index), [element, index]);
  const displayName = name || element.name || fallbackName;

  useEffect(() => {
    if (element.name !== undefined) {
      setName(element.name);
    }
  }, [element.name]);

  const style: CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  const handleCommitRename = () => {
    const trimmed = name.trim();
    const finalName = trimmed || fallbackName;
    onRename(finalName);
    setName(finalName);
    setIsEditing(false);
  };

  const typeIcon = {
    text: <DocumentTextIcon className="w-4 h-4" />,
    image: <PhotoIcon className="w-4 h-4" />,
    shape: <RectangleGroupIcon className="w-4 h-4" />,
  }[element.type];

  const visible = element.visible !== false;

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      {...sortable.attributes}
      className={`flex items-center gap-2 p-3 border rounded-md bg-white shadow-sm transition-colors ${
        selected ? 'border-[#0066FF] bg-[#0066FF]/10' : 'border-gray-200 hover:border-gray-300'
      } ${sortable.isDragging ? 'opacity-80 shadow-lg' : ''}`}
      onClick={onSelect}
    >
      <button
        className="p-1 rounded hover:bg-gray-100 cursor-grab"
        {...sortable.listeners}
        onClick={(e) => e.stopPropagation()}
        aria-label="Reordonează layer"
      >
        <Bars3Icon className="w-4 h-4 text-gray-500" />
      </button>

      <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
        {typeIcon}
      </div>

      <div className="flex-1 min-w-0" onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}>
        {isEditing ? (
          <input
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={handleCommitRename}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCommitRename();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                setName(element.name || fallbackName);
                setIsEditing(false);
              }
            }}
            className="w-full px-2 py-1 text-sm border border-[#0066FF] rounded focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
          />
        ) : (
          <p className={`text-sm font-medium truncate ${selected ? 'text-gray-900' : 'text-gray-800'}`}>
            {displayName}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="p-1 rounded hover:bg-gray-100"
          aria-label={visible ? 'Ascunde layer' : 'Afișează layer'}
        >
          {visible ? (
            <EyeIcon className="w-4 h-4 text-gray-600" />
          ) : (
            <EyeSlashIcon className="w-4 h-4 text-gray-400" />
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          className="p-1 rounded hover:bg-gray-100"
          aria-label={element.locked ? 'Deblochează layer' : 'Blochează layer'}
        >
          {element.locked ? (
            <LockClosedIcon className="w-4 h-4 text-gray-600" />
          ) : (
            <LockOpenIcon className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}
