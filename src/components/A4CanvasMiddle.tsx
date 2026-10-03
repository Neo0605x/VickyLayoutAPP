/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  ImageElement,
  TextElement,
  LayoutElement,
  CanvasSettings,
} from '../types/layout';
import {
  Move,
  RotateCw,
  ChevronUp,
  ChevronDown,
  Layers,
  Trash2,
  Lock,
  Unlock,
} from 'lucide-react';

interface A4CanvasMiddleProps {
  canvas: CanvasSettings;
  images: ImageElement[];
  texts: TextElement[];
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<LayoutElement>) => void;
  onDeleteElement: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
}

export const A4CanvasMiddle: React.FC<A4CanvasMiddleProps> = ({
  canvas,
  images,
  texts,
  selectedId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onBringForward,
  onSendBackward,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
    initialRotation: number;
    centerX: number;
    centerY: number;
  }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialW: 0,
    initialH: 0,
    initialRotation: 0,
    centerX: 0,
    centerY: 0,
  });

  const allElements: LayoutElement[] = [...images, ...texts].sort(
    (a, b) => a.zIndex - b.zIndex
  );

  const selectedElement = allElements.find((el) => el.id === selectedId);

  // Mouse move handler for canvas drag/resize/rotate
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!selectedElement) return;

      const scale = canvas.zoom;

      if (isDragging) {
        const dx = (e.clientX - dragStart.startX) / scale;
        const dy = (e.clientY - dragStart.startY) / scale;

        let nextX = Math.round(dragStart.initialX + dx);
        let nextY = Math.round(dragStart.initialY + dy);

        // Snap to grid if enabled
        if (canvas.snapToGrid) {
          nextX = Math.round(nextX / 10) * 10;
          nextY = Math.round(nextY / 10) * 10;
        }

        // Keep inside canvas bounds loosely
        nextX = Math.max(-50, Math.min(canvas.width - 20, nextX));
        nextY = Math.max(-50, Math.min(canvas.height - 20, nextY));

        onUpdateElement(selectedElement.id, { x: nextX, y: nextY });
      } else if (isResizing) {
        const dx = (e.clientX - dragStart.startX) / scale;
        const dy = (e.clientY - dragStart.startY) / scale;

        const minW = selectedElement.type === 'image' ? 50 : 80;
        const minH = selectedElement.type === 'image' ? 40 : 30;

        let nextW = Math.max(minW, Math.round(dragStart.initialW + dx));
        let nextH = Math.max(minH, Math.round(dragStart.initialH + dy));

        if (canvas.snapToGrid) {
          nextW = Math.round(nextW / 10) * 10;
          nextH = Math.round(nextH / 10) * 10;
        }

        onUpdateElement(selectedElement.id, { width: nextW, height: nextH });
      } else if (isRotating) {
        // Compute angle relative to element center
        const angleRad = Math.atan2(
          e.clientY - dragStart.centerY,
          e.clientX - dragStart.centerX
        );
        let angleDeg = Math.round((angleRad * 180) / Math.PI) - 90;
        if (angleDeg < -180) angleDeg += 360;
        if (angleDeg > 180) angleDeg -= 360;

        // Snap to cardinal angles if close
        if (Math.abs(angleDeg) < 3) angleDeg = 0;
        if (Math.abs(angleDeg - 90) < 3) angleDeg = 90;
        if (Math.abs(angleDeg + 90) < 3) angleDeg = -90;
        if (Math.abs(angleDeg - 180) < 3 || Math.abs(angleDeg + 180) < 3) angleDeg = 180;

        onUpdateElement(selectedElement.id, { rotation: angleDeg });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
    };

    if (isDragging || isResizing || isRotating) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [
    isDragging,
    isResizing,
    isRotating,
    dragStart,
    selectedElement,
    canvas.zoom,
    canvas.snapToGrid,
    canvas.width,
    canvas.height,
    onUpdateElement,
  ]);

  const handleElementPointerDown = (
    e: React.PointerEvent,
    element: LayoutElement
  ) => {
    e.stopPropagation();
    onSelectElement(element.id);

    if (element.locked) return;

    const sheetRect = sheetRef.current?.getBoundingClientRect();
    if (!sheetRect) return;

    const scale = canvas.zoom;
    const elemCenterX = sheetRect.left + (element.x + element.width / 2) * scale;
    const elemCenterY = sheetRect.top + (element.y + element.height / 2) * scale;

    setDragStart({
      startX: e.clientX,
      startY: e.clientY,
      initialX: element.x,
      initialY: element.y,
      initialW: element.width,
      initialH: element.height,
      initialRotation: element.rotation,
      centerX: elemCenterX,
      centerY: elemCenterY,
    });
    setIsDragging(true);
  };

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!selectedElement || selectedElement.locked) return;

    setDragStart({
      startX: e.clientX,
      startY: e.clientY,
      initialX: selectedElement.x,
      initialY: selectedElement.y,
      initialW: selectedElement.width,
      initialH: selectedElement.height,
      initialRotation: selectedElement.rotation,
      centerX: 0,
      centerY: 0,
    });
    setIsResizing(true);
  };

  const handleRotatePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!selectedElement || selectedElement.locked) return;

    const sheetRect = sheetRef.current?.getBoundingClientRect();
    if (!sheetRect) return;

    const scale = canvas.zoom;
    const elemCenterX = sheetRect.left + (selectedElement.x + selectedElement.width / 2) * scale;
    const elemCenterY = sheetRect.top + (selectedElement.y + selectedElement.height / 2) * scale;

    setDragStart({
      startX: e.clientX,
      startY: e.clientY,
      initialX: selectedElement.x,
      initialY: selectedElement.y,
      initialW: selectedElement.width,
      initialH: selectedElement.height,
      initialRotation: selectedElement.rotation,
      centerX: elemCenterX,
      centerY: elemCenterY,
    });
    setIsRotating(true);
  };

  // Helper for drop shadows
  const getShadowClass = (shadow: string) => {
    switch (shadow) {
      case 'soft':
        return 'drop-shadow-sm shadow-md';
      case 'medium':
        return 'shadow-lg shadow-black/25';
      case 'deep':
        return 'shadow-2xl shadow-black/45';
      case 'glow':
        return 'shadow-lg shadow-amber-500/20';
      default:
        return '';
    }
  };

  return (
    <main
      ref={containerRef}
      onClick={() => onSelectElement(null)}
      className="relative flex-1 w-full min-h-[580px] py-10 px-4 flex items-center justify-center overflow-auto canvas-checkerboard select-none"
    >
      {/* Zoom transform container */}
      <div
        style={{
          transform: `scale(${canvas.zoom})`,
          transformOrigin: 'top center',
          transition: isDragging || isResizing || isRotating ? 'none' : 'transform 0.15s ease-out',
        }}
        className="relative my-4"
      >
        {/* A4 Sheet Container */}
        <div
          id="a4-print-sheet"
          ref={sheetRef}
          style={{
            width: `${canvas.width}px`,
            height: `${canvas.height}px`,
            backgroundColor: canvas.backgroundColor,
          }}
          className="relative bg-white text-neutral-900 shadow-2xl rounded-sm overflow-hidden transition-colors"
        >
          {/* Subtle Grid Guidelines (Optional) */}
          {canvas.showGrid && (
            <div
              className="canvas-guide absolute inset-0 pointer-events-none z-0"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          )}

          {/* Printable Margin Safe Area Line (Optional) */}
          {canvas.showMargins && (
            <div
              className="canvas-guide absolute pointer-events-none z-0 border border-dashed border-amber-600/40"
              style={{
                top: `${canvas.margin}px`,
                left: `${canvas.margin}px`,
                right: `${canvas.margin}px`,
                bottom: `${canvas.margin}px`,
              }}
            >
              <span className="absolute -top-4 left-0 text-[10px] font-mono text-amber-700/80 bg-amber-50 px-1 rounded">
                A4 安全列印邊距 (10.5mm)
              </span>
            </div>
          )}

          {/* Render All Elements (Images & Text) */}
          {allElements.map((el) => {
            if (el.hidden) return null;
            const isSelected = el.id === selectedId;

            if (el.type === 'image') {
              const img = el as ImageElement;
              return (
                <div
                  key={img.id}
                  onPointerDown={(e) => handleElementPointerDown(e, img)}
                  style={{
                    position: 'absolute',
                    left: `${img.x}px`,
                    top: `${img.y}px`,
                    width: `${img.width}px`,
                    height: `${img.height}px`,
                    transform: `rotate(${img.rotation}deg)`,
                    transformOrigin: 'center center',
                    zIndex: img.zIndex,
                    opacity: img.opacity,
                    cursor: img.locked ? 'not-allowed' : 'move',
                  }}
                  className={`group transition-shadow ${
                    isSelected ? 'ring-2 ring-amber-500 ring-offset-2' : ''
                  }`}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderStyle: img.borderStyle,
                      borderWidth: `${img.borderWidth}px`,
                      borderColor: img.borderColor,
                      borderRadius: `${img.borderRadius}px`,
                      overflow: 'hidden',
                      backgroundColor: '#f3f4f6',
                    }}
                    className={`w-full h-full relative transition-all ${getShadowClass(img.shadow)}`}
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover pointer-events-none select-none"
                      style={{
                        objectFit: img.objectFit || 'cover',
                      }}
                    />

                    {/* Subtle label overlay on hover when not printing */}
                    <div className="no-print absolute bottom-1 right-1 opacity-0 group-hover:opacity-80 transition-opacity bg-neutral-900/70 text-[10px] text-white px-1.5 py-0.5 rounded backdrop-blur-xs font-mono pointer-events-none">
                      {img.name}
                    </div>
                  </div>
                </div>
              );
            }

            if (el.type === 'text') {
              const txt = el as TextElement;
              return (
                <div
                  key={txt.id}
                  onPointerDown={(e) => handleElementPointerDown(e, txt)}
                  style={{
                    position: 'absolute',
                    left: `${txt.x}px`,
                    top: `${txt.y}px`,
                    width: `${txt.width}px`,
                    minHeight: `${txt.height}px`,
                    transform: `rotate(${txt.rotation}deg)`,
                    transformOrigin: 'center center',
                    zIndex: txt.zIndex,
                    opacity: txt.opacity,
                    cursor: txt.locked ? 'not-allowed' : 'move',
                  }}
                  className={`group transition-shadow ${
                    isSelected ? 'ring-2 ring-amber-500 ring-offset-2' : ''
                  }`}
                >
                  <div
                    style={{
                      fontSize: `${txt.fontSize}px`,
                      color: txt.fontColor,
                      fontFamily: txt.fontFamily,
                      fontWeight: txt.fontWeight,
                      textAlign: txt.textAlign,
                      backgroundColor: txt.backgroundColor || 'transparent',
                      padding: `${txt.padding || 0}px`,
                      borderRadius: `${txt.borderRadius || 0}px`,
                      lineHeight: txt.lineHeight || 1.4,
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                    className="w-full h-full select-none"
                  >
                    {txt.content || '請輸入文字內容...'}
                  </div>
                </div>
              );
            }

            return null;
          })}

          {/* Interactive Bounding Box & Handles for Selected Element */}
          {selectedElement && !selectedElement.hidden && (
            <div
              className="selection-box pointer-events-none no-print"
              style={{
                position: 'absolute',
                left: `${selectedElement.x}px`,
                top: `${selectedElement.y}px`,
                width: `${selectedElement.width}px`,
                height: `${selectedElement.height}px`,
                transform: `rotate(${selectedElement.rotation}deg)`,
                transformOrigin: 'center center',
                zIndex: 9999,
              }}
            >
              {/* Outline Box */}
              <div className="absolute inset-0 border-2 border-amber-500 border-dashed rounded-xs shadow-sm"></div>

              {/* Floating Quick Action Mini-Bar */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-neutral-900 text-neutral-100 text-[11px] px-2 py-1 rounded-md shadow-xl border border-neutral-700/80 flex items-center gap-1.5 pointer-events-auto whitespace-nowrap">
                <span className="font-mono text-amber-400 font-semibold px-1">
                  {selectedElement.name}
                </span>
                <span className="text-neutral-500">|</span>
                <span className="font-mono text-neutral-300">
                  {Math.round(selectedElement.width)}×{Math.round(selectedElement.height)}
                </span>
                {selectedElement.rotation !== 0 && (
                  <span className="font-mono text-amber-400">
                    {selectedElement.rotation}°
                  </span>
                )}

                <div className="w-px h-3 bg-neutral-700 mx-0.5"></div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBringForward(selectedElement.id);
                  }}
                  className="p-1 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded"
                  title="上移一層"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendBackward(selectedElement.id);
                  }}
                  className="p-1 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded"
                  title="下移一層"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateElement(selectedElement.id, { locked: !selectedElement.locked });
                  }}
                  className="p-1 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded"
                  title={selectedElement.locked ? '解鎖' : '鎖定'}
                >
                  {selectedElement.locked ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteElement(selectedElement.id);
                  }}
                  className="p-1 hover:bg-red-950/60 text-red-400 hover:text-red-300 rounded"
                  title="刪除項目"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rotation Handle (Top Center) */}
              {!selectedElement.locked && (
                <div
                  onPointerDown={handleRotatePointerDown}
                  className="rotate-handle absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto hover:scale-125 transition-transform"
                  title="拖曳以旋轉角度"
                >
                  <RotateCw className="w-2.5 h-2.5 text-neutral-950" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-amber-500"></div>
                </div>
              )}

              {/* Bottom-Right Corner Resize Handle */}
              {!selectedElement.locked && (
                <div
                  onPointerDown={handleResizePointerDown}
                  className="resize-handle absolute -bottom-2 -right-2 w-4 h-4 bg-amber-500 border-2 border-white rounded shadow-md cursor-se-resize pointer-events-auto hover:scale-125 transition-transform"
                  title="拖曳以調整尺寸大小"
                />
              )}

              {/* Corner Indicators */}
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-amber-500 rounded-full"></div>
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-amber-500 rounded-full"></div>
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-amber-500 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
