'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { EditorElement } from '@/modules/editor/editorStore';

interface TransformBoxProps {
  element: EditorElement;
  zoom: number;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number, x: number, y: number) => void;
  onRotate: (rotation: number) => void;
  onTransformEnd: () => void;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export default function TransformBox({
  element,
  zoom,
  onMove,
  onResize,
  onRotate,
  onTransformEnd,
}: TransformBoxProps) {
  const [isMoving, setIsMoving] = useState(false);
  const [isResizingHandle, setIsResizingHandle] = useState<ResizeHandle | null>(null);
  const [isRotatingHandle, setIsRotatingHandle] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startElementRef = useRef({ x: 0, y: 0, width: 0, height: 0, rotation: 0 });

  const handleResizeMove = useCallback((e: MouseEvent, handle: ResizeHandle) => {
    const deltaX = (e.clientX - startPosRef.current.x) / zoom;
    const deltaY = (e.clientY - startPosRef.current.y) / zoom;
    let newWidth = startElementRef.current.width;
    let newHeight = startElementRef.current.height;
    let newX = startElementRef.current.x;
    let newY = startElementRef.current.y;

    const minSize = 20;
    const maintainAspectRatio = element.type === 'image' && !e.shiftKey;

    switch (handle) {
      case 'se':
        newWidth = Math.max(minSize, startElementRef.current.width + deltaX);
        newHeight = maintainAspectRatio
          ? newWidth * (startElementRef.current.height / startElementRef.current.width)
          : Math.max(minSize, startElementRef.current.height + deltaY);
        break;
      case 'sw':
        newWidth = Math.max(minSize, startElementRef.current.width - deltaX);
        newHeight = maintainAspectRatio
          ? newWidth * (startElementRef.current.height / startElementRef.current.width)
          : Math.max(minSize, startElementRef.current.height + deltaY);
        newX = startElementRef.current.x + (startElementRef.current.width - newWidth);
        break;
      case 'ne':
        newWidth = Math.max(minSize, startElementRef.current.width + deltaX);
        newHeight = maintainAspectRatio
          ? newWidth * (startElementRef.current.height / startElementRef.current.width)
          : Math.max(minSize, startElementRef.current.height - deltaY);
        newY = startElementRef.current.y + (startElementRef.current.height - newHeight);
        break;
      case 'nw':
        newWidth = Math.max(minSize, startElementRef.current.width - deltaX);
        newHeight = maintainAspectRatio
          ? newWidth * (startElementRef.current.height / startElementRef.current.width)
          : Math.max(minSize, startElementRef.current.height - deltaY);
        newX = startElementRef.current.x + (startElementRef.current.width - newWidth);
        newY = startElementRef.current.y + (startElementRef.current.height - newHeight);
        break;
      case 'e':
        newWidth = Math.max(minSize, startElementRef.current.width + deltaX);
        if (maintainAspectRatio) {
          newHeight = newWidth * (startElementRef.current.height / startElementRef.current.width);
          newY = startElementRef.current.y + (startElementRef.current.height - newHeight) / 2;
        }
        break;
      case 'w':
        newWidth = Math.max(minSize, startElementRef.current.width - deltaX);
        newX = startElementRef.current.x + (startElementRef.current.width - newWidth);
        if (maintainAspectRatio) {
          newHeight = newWidth * (startElementRef.current.height / startElementRef.current.width);
          newY = startElementRef.current.y + (startElementRef.current.height - newHeight) / 2;
        }
        break;
      case 's':
        newHeight = Math.max(minSize, startElementRef.current.height + deltaY);
        if (maintainAspectRatio) {
          newWidth = newHeight * (startElementRef.current.width / startElementRef.current.height);
          newX = startElementRef.current.x + (startElementRef.current.width - newWidth) / 2;
        }
        break;
      case 'n':
        newHeight = Math.max(minSize, startElementRef.current.height - deltaY);
        newY = startElementRef.current.y + (startElementRef.current.height - newHeight);
        if (maintainAspectRatio) {
          newWidth = newHeight * (startElementRef.current.width / startElementRef.current.height);
          newX = startElementRef.current.x + (startElementRef.current.width - newWidth) / 2;
        }
        break;
    }

    onResize(newWidth, newHeight, newX, newY);
  }, [element.type, onResize, zoom]);

  const handleRotateMove = useCallback((e: MouseEvent) => {
    const centerX = startElementRef.current.x + startElementRef.current.width / 2;
    const centerY = startElementRef.current.y + startElementRef.current.height / 2;
    const angle = Math.atan2(
      e.clientY / zoom - centerY,
      e.clientX / zoom - centerX
    ) * (180 / Math.PI);
    onRotate(angle + 90);
  }, [onRotate, zoom]);

  // Handle move
  const handleMoveStart = (e: React.MouseEvent) => {
    if (element.locked || e.button !== 0) return;
    e.stopPropagation();
    setIsMoving(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startElementRef.current = {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation || 0,
    };
  };

  const handleResizeStart = (handle: ResizeHandle) => (e: React.MouseEvent) => {
    if (element.locked || e.button !== 0) return;
    e.stopPropagation();
    setIsResizingHandle(handle);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startElementRef.current = {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation || 0,
    };
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    if (element.locked || e.button !== 0) return;
    e.stopPropagation();
    setIsRotatingHandle(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startElementRef.current = {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation || 0,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isMoving) {
        const deltaX = (e.clientX - startPosRef.current.x) / zoom;
        const deltaY = (e.clientY - startPosRef.current.y) / zoom;
        onMove(startElementRef.current.x + deltaX, startElementRef.current.y + deltaY);
      } else if (isResizingHandle) {
        handleResizeMove(e, isResizingHandle);
      } else if (isRotatingHandle) {
        handleRotateMove(e);
      }
    };

    const handleMouseUp = () => {
      if (isMoving || isResizingHandle || isRotatingHandle) {
        onTransformEnd();
        setIsMoving(false);
        setIsResizingHandle(null);
        setIsRotatingHandle(false);
      }
    };

    if (isMoving || isResizingHandle || isRotatingHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleResizeMove, handleRotateMove, isMoving, isResizingHandle, isRotatingHandle, onMove, onTransformEnd, zoom]);

  const handleCursors: Record<ResizeHandle, string> = {
    nw: 'nw-resize',
    n: 'n-resize',
    ne: 'ne-resize',
    e: 'e-resize',
    se: 'se-resize',
    s: 's-resize',
    sw: 'sw-resize',
    w: 'w-resize',
  };

  const handleSize = 8;
  const handleOffset = -4;

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation || 0}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {/* Border */}
      <div className="absolute inset-0 border-2 border-[#0066FF] shadow-lg pointer-events-none" />

      {/* Move Handle (entire box) */}
      {!element.locked && (
        <div
          className="absolute inset-0 cursor-move pointer-events-auto"
          onMouseDown={handleMoveStart}
        />
      )}

      {/* Resize Handles */}
      {!element.locked && (
        <>
          {/* Corner Handles */}
          <div
            className="absolute bg-white border-2 border-[#0066FF] rounded-full pointer-events-auto shadow-md hover:scale-125 transition-transform"
            style={{
              width: `${handleSize}px`,
              height: `${handleSize}px`,
              left: `${handleOffset}px`,
              top: `${handleOffset}px`,
              cursor: handleCursors.nw,
            }}
            onMouseDown={handleResizeStart('nw')}
          />
          <div
            className="absolute bg-white border-2 border-[#0066FF] rounded-full pointer-events-auto shadow-md hover:scale-125 transition-transform"
            style={{
              width: `${handleSize}px`,
              height: `${handleSize}px`,
              right: `${handleOffset}px`,
              top: `${handleOffset}px`,
              cursor: handleCursors.ne,
            }}
            onMouseDown={handleResizeStart('ne')}
          />
          <div
            className="absolute bg-white border-2 border-[#0066FF] rounded-full pointer-events-auto shadow-md hover:scale-125 transition-transform"
            style={{
              width: `${handleSize}px`,
              height: `${handleSize}px`,
              left: `${handleOffset}px`,
              bottom: `${handleOffset}px`,
              cursor: handleCursors.sw,
            }}
            onMouseDown={handleResizeStart('sw')}
          />
          <div
            className="absolute bg-white border-2 border-[#0066FF] rounded-full pointer-events-auto shadow-md hover:scale-125 transition-transform"
            style={{
              width: `${handleSize}px`,
              height: `${handleSize}px`,
              right: `${handleOffset}px`,
              bottom: `${handleOffset}px`,
              cursor: handleCursors.se,
            }}
            onMouseDown={handleResizeStart('se')}
          />

          {/* Edge Handles */}
          <div
            className="absolute bg-white border-2 border-[#0066FF] rounded-full pointer-events-auto shadow-md hover:scale-125 transition-transform"
            style={{
              width: `${handleSize}px`,
              height: `${handleSize}px`,
              left: `50%`,
              top: `${handleOffset}px`,
              transform: 'translateX(-50%)',
              cursor: handleCursors.n,
            }}
            onMouseDown={handleResizeStart('n')}
          />
          <div
            className="absolute bg-white border-2 border-[#0066FF] rounded-full pointer-events-auto shadow-md hover:scale-125 transition-transform"
            style={{
              width: `${handleSize}px`,
              height: `${handleSize}px`,
              right: `${handleOffset}px`,
              top: `50%`,
              transform: 'translateY(-50%)',
              cursor: handleCursors.e,
            }}
            onMouseDown={handleResizeStart('e')}
          />
          <div
            className="absolute bg-white border-2 border-[#0066FF] rounded-full pointer-events-auto shadow-md hover:scale-125 transition-transform"
            style={{
              width: `${handleSize}px`,
              height: `${handleSize}px`,
              left: `50%`,
              bottom: `${handleOffset}px`,
              transform: 'translateX(-50%)',
              cursor: handleCursors.s,
            }}
            onMouseDown={handleResizeStart('s')}
          />
          <div
            className="absolute bg-white border-2 border-[#0066FF] rounded-full pointer-events-auto shadow-md hover:scale-125 transition-transform"
            style={{
              width: `${handleSize}px`,
              height: `${handleSize}px`,
              left: `${handleOffset}px`,
              top: `50%`,
              transform: 'translateY(-50%)',
              cursor: handleCursors.w,
            }}
            onMouseDown={handleResizeStart('w')}
          />

          {/* Rotate Handle */}
          <div
            className="absolute bg-white border-2 border-[#0066FF] rounded-full pointer-events-auto shadow-md hover:scale-125 transition-transform cursor-grab active:cursor-grabbing"
            style={{
              width: `${handleSize}px`,
              height: `${handleSize}px`,
              left: `50%`,
              top: `-24px`,
              transform: 'translateX(-50%)',
            }}
            onMouseDown={handleRotateStart}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0066FF"
              strokeWidth="2"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </div>
          
          {/* Rotate Line */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-[#0066FF] pointer-events-none"
            style={{
              height: '20px',
              top: '-20px',
            }}
          />
        </>
      )}
    </div>
  );
}
