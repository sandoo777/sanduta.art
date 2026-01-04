'use client';

import { useRef } from 'react';
import { useEditorStore, EditorElement } from '@/modules/editor/editorStore';
import TransformBox from './TransformBox';

// Snapping utility
const snapToGrid = (value: number, gridSize: number = 10): number => {
  return Math.round(value / gridSize) * gridSize;
};

const snapToValue = (value: number, target: number, threshold: number = 5): number => {
  return Math.abs(value - target) < threshold ? target : value;
};

export default function EditorCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { 
    elements, 
    selectedElementId, 
    selectElement, 
    updateElement, 
    moveElement,
    resizeElement,
    rotateElement,
    zoom,
    canvasSize,
  } = useEditorStore();

  // Handle canvas click (deselect)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectElement(null);
    }
  };

  // Handle element click
  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isMultiSelect = e.shiftKey;
    selectElement(elementId, isMultiSelect);
  };

  // Transform handlers with snapping
  const handleMove = (elementId: string, x: number, y: number) => {
    // Snap to grid
    let snappedX = snapToGrid(x);
    let snappedY = snapToGrid(y);

    // Snap to canvas edges
    snappedX = snapToValue(snappedX, 0, 10);
    snappedY = snapToValue(snappedY, 0, 10);

    const element = elements.find((el: EditorElement) => el.id === elementId);
    if (element) {
      snappedX = snapToValue(snappedX + element.width, canvasSize.width, 10) - element.width;
      snappedY = snapToValue(snappedY + element.height, canvasSize.height, 10) - element.height;

      // Snap to center of canvas
      const centerX = (canvasSize.width - element.width) / 2;
      const centerY = (canvasSize.height - element.height) / 2;
      snappedX = snapToValue(snappedX, centerX, 10);
      snappedY = snapToValue(snappedY, centerY, 10);

      // Snap to other elements
      elements.forEach((otherElement: EditorElement) => {
        if (otherElement.id !== elementId) {
          // Snap to other element's edges
          snappedX = snapToValue(snappedX, otherElement.x, 10);
          snappedY = snapToValue(snappedY, otherElement.y, 10);
          snappedX = snapToValue(snappedX + element.width, otherElement.x + otherElement.width, 10) - element.width;
          snappedY = snapToValue(snappedY + element.height, otherElement.y + otherElement.height, 10) - element.height;

          // Snap to other element's center
          const otherCenterX = otherElement.x + otherElement.width / 2;
          const otherCenterY = otherElement.y + otherElement.height / 2;
          const thisCenterX = snappedX + element.width / 2;
          const thisCenterY = snappedY + element.height / 2;
          
          if (Math.abs(thisCenterX - otherCenterX) < 10) {
            snappedX = otherCenterX - element.width / 2;
          }
          if (Math.abs(thisCenterY - otherCenterY) < 10) {
            snappedY = otherCenterY - element.height / 2;
          }
        }
      });
    }

    moveElement(elementId, snappedX, snappedY);
  };

  const handleResize = (elementId: string, width: number, height: number, x: number, y: number) => {
    updateElement(elementId, { width, height, x, y });
  };

  const handleRotate = (elementId: string, rotation: number) => {
    // Snap to common angles
    let snappedRotation = rotation;
    const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
    for (const angle of snapAngles) {
      if (Math.abs(rotation - angle) < 5) {
        snappedRotation = angle;
        break;
      }
    }
    rotateElement(elementId, snappedRotation % 360);
  };

  const handleTransformEnd = () => {
    // Save to history after transform
    useEditorStore.getState().saveToHistory();
  };

  // Render element content
  const renderElement = (element: typeof elements[0]) => {
    if (!element.visible) return null;

    const commonStyles: React.CSSProperties = {
      position: 'absolute',
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotation || 0}deg)`,
      transformOrigin: 'center center',
      opacity: element.opacity || 1,
      zIndex: element.zIndex || 1,
      pointerEvents: element.locked ? 'none' : 'auto',
    };

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={{
              ...commonStyles,
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.textAlign || 'center',
              fontSize: `${element.fontSize || 16}px`,
              fontFamily: element.fontFamily || 'Inter',
              fontWeight: element.fontWeight || 400,
              color: element.color || '#000000',
              cursor: element.locked ? 'default' : 'move',
              userSelect: 'none',
              wordBreak: 'break-word',
              padding: '8px',
            }}
            onClick={(e) => handleElementClick(element.id, e)}
          >
            {element.content || 'Text'}
          </div>
        );

      case 'image':
        return (
          <div
            key={element.id}
            style={{
              ...commonStyles,
              backgroundImage: element.src ? `url(${element.src})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: element.src ? 'transparent' : '#E5E7EB',
              cursor: element.locked ? 'default' : 'move',
            }}
            onClick={(e) => handleElementClick(element.id, e)}
          >
            {!element.src && (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                Image
              </div>
            )}
          </div>
        );

      case 'shape':
        const shapeStyles: React.CSSProperties = {
          ...commonStyles,
          backgroundColor: element.fill || '#0066FF',
          border: element.stroke ? `${element.strokeWidth || 1}px solid ${element.stroke}` : undefined,
          cursor: element.locked ? 'default' : 'move',
        };

        if (element.shape === 'circle') {
          shapeStyles.borderRadius = '50%';
        } else if (element.shape === 'rectangle') {
          shapeStyles.borderRadius = `${element.borderRadius || 0}px`;
        } else if (element.shape === 'triangle') {
          shapeStyles.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
          shapeStyles.backgroundColor = element.fill || '#0066FF';
        }

        return (
          <div
            key={element.id}
            style={shapeStyles}
            onClick={(e) => handleElementClick(element.id, e)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={canvasRef}
      className="w-full h-full flex items-center justify-center p-8 overflow-auto"
      onClick={handleCanvasClick}
    >
      {/* Canvas Container */}
      <div
        data-canvas-container
        className="relative bg-white shadow-2xl rounded-lg overflow-visible"
        style={{
          width: `${canvasSize.width * zoom}px`,
          height: `${canvasSize.height * zoom}px`,
          minWidth: `${canvasSize.width * zoom}px`,
          minHeight: `${canvasSize.height * zoom}px`,
        }}
      >
        {/* Grid Background (optional) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: `${10 * zoom}px ${10 * zoom}px`,
          }}
        />

        {/* Elements Layer */}
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
          }}
        >
          {/* Render all elements */}
          {elements
            .sort((a: EditorElement, b: EditorElement) => (a.zIndex || 0) - (b.zIndex || 0))
            .map((element: EditorElement) => renderElement(element))}

          {/* Transform Box for selected element */}
          {selectedElementId && (
            (() => {
              const selectedElement = elements.find((el: EditorElement) => el.id === selectedElementId);
              if (!selectedElement) return null;

              return (
                <TransformBox
                  key={selectedElement.id}
                  element={selectedElement}
                  zoom={zoom}
                  onMove={(x, y) => handleMove(selectedElement.id, x, y)}
                  onResize={(width, height, x, y) => handleResize(selectedElement.id, width, height, x, y)}
                  onRotate={(rotation) => handleRotate(selectedElement.id, rotation)}
                  onTransformEnd={handleTransformEnd}
                />
              );
            })()
          )}
        </div>

        {/* Empty State */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
            <div className="text-center">
              <p className="text-lg font-medium">Începe să creezi</p>
              <p className="text-sm mt-1">Alege un tool din sidebar pentru a adăuga elemente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
