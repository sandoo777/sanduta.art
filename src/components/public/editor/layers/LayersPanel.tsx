'use client';

import { useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { LayerItem } from './LayerItem';
import { useEditorStore, EditorElement } from '@/modules/editor/editorStore';

function sortElements(elements: EditorElement[]) {
  return [...elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
}

export function LayersPanel() {
  const {
    elements,
    selectedElementId,
    selectElement,
    reorderLayers,
    toggleLayerVisibility,
    toggleLayerLock,
    renameLayer,
  } = useEditorStore();

  const sorted = useMemo(() => sortElements(elements), [elements]);
  const layerIds = useMemo(() => sorted.map((el) => el.id), [sorted]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = layerIds.indexOf(active.id as string);
    const newIndex = layerIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(layerIds, oldIndex, newIndex);
    reorderLayers(newOrder);
  };

  const handleSelect = (element: EditorElement) => {
    if (element.locked) return;
    selectElement(element.id);
  };

  if (sorted.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <p>Niciun layer</p>
        <p className="text-xs text-gray-400 mt-1">Adaugă elemente în canvas</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Layere</h3>
        <span className="text-xs text-gray-500">{sorted.length} elemente</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={layerIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sorted.map((element, index) => (
              <LayerItem
                key={element.id}
                element={element}
                index={index}
                selected={selectedElementId === element.id}
                onSelect={() => handleSelect(element)}
                onToggleVisibility={() => toggleLayerVisibility(element.id)}
                onToggleLock={() => toggleLayerLock(element.id)}
                onRename={(name) => renameLayer(element.id, name)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
