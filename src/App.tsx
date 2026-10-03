/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ImageElement,
  TextElement,
  LayoutElement,
  LayoutPresetType,
  CanvasSettings,
} from './types/layout';
import { HeaderTop } from './components/HeaderTop';
import { A4CanvasMiddle } from './components/A4CanvasMiddle';
import { ControlDeckBottom } from './components/ControlDeckBottom';
import {
  applyLayoutPreset,
  applyRandomNonOverlappingLayout,
  repositionTextAvoidingImages,
} from './utils/layoutAlgorithms';
import { getSampleImage } from './utils/sampleImages';
import { exportElementToA4Pdf, triggerBrowserPrint } from './utils/pdfExport';

// Fixed compilation timestamp as requested in user specification
const COMPILE_TIMESTAMP = '2026-10-03 10:14:30 (Build v2.4.1)';

const INITIAL_CANVAS_SETTINGS: CanvasSettings = {
  width: 794, // Standard A4 width in px at 96 DPI (~210mm)
  height: 1123, // Standard A4 height in px at 96 DPI (~297mm)
  margin: 38, // Safe print margin
  backgroundColor: '#ffffff',
  showGrid: false,
  showMargins: true,
  snapToGrid: false,
  zoom: 0.8, // Comfortable default zoom for desktop
};

export default function App() {
  const [canvas, setCanvas] = useState<CanvasSettings>(INITIAL_CANVAS_SETTINGS);
  const [imageCount, setImageCount] = useState<number>(7);
  const [layoutPreset, setLayoutPreset] = useState<LayoutPresetType>('random');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportStep, setExportStep] = useState<string>('');

  // Initial Texts
  const [texts, setTexts] = useState<TextElement[]>([
    {
      id: 'txt-title',
      type: 'text',
      name: '主標題 (Title)',
      content: 'A4 ARCHITECTURAL STUDY',
      fontSize: 28,
      fontColor: '#0f172a',
      fontFamily: "'Cinzel', serif",
      fontWeight: '700',
      textAlign: 'center',
      backgroundColor: 'transparent',
      padding: 6,
      borderRadius: 4,
      lineHeight: 1.2,
      x: 147,
      y: 42,
      width: 500,
      height: 48,
      rotation: 0,
      zIndex: 10,
      opacity: 1,
    },
    {
      id: 'txt-sub',
      type: 'text',
      name: '副標題 / 備註',
      content: 'AUTUMN CURATED SELECTION · NO-OVERLAP COMPOSITION · ISSUE 07',
      fontSize: 12,
      fontColor: '#64748b',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: '600',
      textAlign: 'center',
      backgroundColor: 'transparent',
      padding: 4,
      borderRadius: 4,
      lineHeight: 1.4,
      x: 147,
      y: 92,
      width: 500,
      height: 28,
      rotation: 0,
      zIndex: 11,
      opacity: 0.9,
    },
  ]);

  // Generate initial images (7 images)
  const generateInitialImages = useCallback((count: number): ImageElement[] => {
    const list: ImageElement[] = [];
    for (let i = 0; i < count; i++) {
      const sample = getSampleImage(i);
      list.push({
        id: `img-${Date.now()}-${i}`,
        type: 'image',
        name: `照片 #${i + 1}`,
        url: sample.url,
        x: 0,
        y: 0,
        width: 180,
        height: 135,
        rotation: 0,
        zIndex: i + 1,
        opacity: 1,
        borderStyle: 'solid',
        borderWidth: 6,
        borderColor: '#ffffff',
        borderRadius: 4,
        shadow: 'medium',
        objectFit: 'cover',
      });
    }
    return list;
  }, []);

  const [images, setImages] = useState<ImageElement[]>(() => {
    const initialList = generateInitialImages(7);
    return applyRandomNonOverlappingLayout(initialList, INITIAL_CANVAS_SETTINGS, [
      { x: 147, y: 40, width: 500, height: 85 }, // reserve space for header title
    ]);
  });

  // Calculate layout whenever preset changes or image count changes
  const applyCurrentLayout = useCallback(
    (preset: LayoutPresetType, currentImages: ImageElement[]) => {
      const titleBox = { x: 147, y: 40, width: 500, height: 85 };
      const updated = applyLayoutPreset(preset, currentImages, canvas, [titleBox]);
      setImages(updated);
    },
    [canvas]
  );

  // Handle image count change (e.g. 7)
  const handleImageCountChange = (newCount: number) => {
    setImageCount(newCount);
    let nextImages = [...images];

    if (newCount > images.length) {
      // Add new images
      for (let i = images.length; i < newCount; i++) {
        const sample = getSampleImage(i);
        nextImages.push({
          id: `img-${Date.now()}-${i}`,
          type: 'image',
          name: `照片 #${i + 1}`,
          url: sample.url,
          x: 0,
          y: 0,
          width: 180,
          height: 135,
          rotation: 0,
          zIndex: i + 1,
          opacity: 1,
          borderStyle: images[0]?.borderStyle || 'solid',
          borderWidth: images[0]?.borderWidth ?? 6,
          borderColor: images[0]?.borderColor || '#ffffff',
          borderRadius: images[0]?.borderRadius ?? 4,
          shadow: images[0]?.shadow || 'medium',
          objectFit: 'cover',
        });
      }
    } else if (newCount < images.length) {
      // Trim
      nextImages = nextImages.slice(0, newCount);
    }

    applyCurrentLayout(layoutPreset, nextImages);
  };

  // Re-roll random non-overlapping placement
  const handleReRollRandom = () => {
    const titleBox = { x: 147, y: 40, width: 500, height: 85 };
    const updated = applyRandomNonOverlappingLayout(images, canvas, [titleBox]);
    setImages(updated);
  };

  // Handle Preset change
  const handleLayoutPresetChange = (preset: LayoutPresetType) => {
    setLayoutPreset(preset);
    applyCurrentLayout(preset, images);
  };

  // Batch upload images from user's computer
  const handleBatchUploadImages = (files: FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setImageCount(fileArray.length);

    const promises = fileArray.map((file, idx) => {
      return new Promise<ImageElement>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: `img-user-${Date.now()}-${idx}`,
            type: 'image',
            name: file.name.replace(/\.[^/.]+$/, '').substring(0, 12),
            url: (e.target?.result as string) || getSampleImage(idx).url,
            x: 0,
            y: 0,
            width: 190,
            height: 140,
            rotation: 0,
            zIndex: idx + 1,
            opacity: 1,
            borderStyle: 'solid',
            borderWidth: 6,
            borderColor: '#ffffff',
            borderRadius: 4,
            shadow: 'medium',
            objectFit: 'cover',
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((newImages) => {
      const titleBox = { x: 147, y: 40, width: 500, height: 85 };
      const positioned = applyLayoutPreset(layoutPreset, newImages, canvas, [titleBox]);
      setImages(positioned);
      if (positioned.length > 0) {
        setSelectedId(positioned[0].id);
      }
    });
  };

  // Reload preset sample photography
  const handleLoadSampleImages = () => {
    const sampleList = generateInitialImages(imageCount);
    const titleBox = { x: 147, y: 40, width: 500, height: 85 };
    const positioned = applyLayoutPreset(layoutPreset, sampleList, canvas, [titleBox]);
    setImages(positioned);
  };

  // Update specific element
  const handleUpdateElement = (id: string, updates: Partial<LayoutElement>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? ({ ...img, ...updates } as ImageElement) : img))
    );
    setTexts((prev) =>
      prev.map((txt) => (txt.id === id ? ({ ...txt, ...updates } as TextElement) : txt))
    );
  };

  // Delete element
  const handleDeleteElement = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setTexts((prev) => prev.filter((txt) => txt.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Copy styling to all N images
  const handleApplyStyleToAllImages = (sourceImg: ImageElement) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        borderStyle: sourceImg.borderStyle,
        borderWidth: sourceImg.borderWidth,
        borderColor: sourceImg.borderColor,
        borderRadius: sourceImg.borderRadius,
        shadow: sourceImg.shadow,
        opacity: sourceImg.opacity,
        objectFit: sourceImg.objectFit,
      }))
    );
  };

  // Add new text element
  const handleAddTextElement = () => {
    const newId = `txt-${Date.now()}`;
    const newText: TextElement = {
      id: newId,
      type: 'text',
      name: `自訂文字 #${texts.length + 1}`,
      content: '請在此輸入文字敘述...',
      fontSize: 16,
      fontColor: '#1e293b',
      fontFamily: "'Noto Sans TC', sans-serif",
      fontWeight: '400',
      textAlign: 'left',
      backgroundColor: '#ffffff',
      padding: 8,
      borderRadius: 4,
      lineHeight: 1.5,
      x: 100,
      y: 500,
      width: 280,
      height: 60,
      rotation: 0,
      zIndex: images.length + texts.length + 1,
      opacity: 1,
    };

    // Auto place text without collision
    const placed = repositionTextAvoidingImages(newText, images, canvas);
    setTexts((prev) => [...prev, placed]);
    setSelectedId(newId);
  };

  // Auto avoid overlap between text and images
  const handleAutoAvoidTextOverlap = (textId: string) => {
    setTexts((prev) =>
      prev.map((txt) => {
        if (txt.id !== textId) return txt;
        return repositionTextAvoidingImages(txt, images, canvas);
      })
    );
  };

  // Layer Reordering
  const handleReorderLayers = (newOrder: LayoutElement[]) => {
    const newImages: ImageElement[] = [];
    const newTexts: TextElement[] = [];

    newOrder.forEach((item) => {
      if (item.type === 'image') newImages.push(item as ImageElement);
      else if (item.type === 'text') newTexts.push(item as TextElement);
    });

    setImages(newImages);
    setTexts(newTexts);
  };

  const handleBringForward = (id: string) => {
    const all = [...images, ...texts].sort((a, b) => a.zIndex - b.zIndex);
    const idx = all.findIndex((item) => item.id === id);
    if (idx < all.length - 1) {
      const temp = all[idx].zIndex;
      all[idx].zIndex = all[idx + 1].zIndex;
      all[idx + 1].zIndex = temp;
      handleReorderLayers(all);
    }
  };

  const handleSendBackward = (id: string) => {
    const all = [...images, ...texts].sort((a, b) => a.zIndex - b.zIndex);
    const idx = all.findIndex((item) => item.id === id);
    if (idx > 0) {
      const temp = all[idx].zIndex;
      all[idx].zIndex = all[idx - 1].zIndex;
      all[idx - 1].zIndex = temp;
      handleReorderLayers(all);
    }
  };

  const handleBringToFront = (id: string) => {
    const all = [...images, ...texts].sort((a, b) => a.zIndex - b.zIndex);
    const maxZ = Math.max(...all.map((item) => item.zIndex), 0);
    handleUpdateElement(id, { zIndex: maxZ + 1 });
  };

  const handleSendToBack = (id: string) => {
    const all = [...images, ...texts].sort((a, b) => a.zIndex - b.zIndex);
    const minZ = Math.min(...all.map((item) => item.zIndex), 1);
    handleUpdateElement(id, { zIndex: Math.max(0, minZ - 1) });
  };

  // Export to PDF
  const handleExportPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setSelectedId(null); // Deselect on-screen handles during export
    try {
      await exportElementToA4Pdf('a4-print-sheet', {
        fileName: `A4_Layout_${new Date().toISOString().slice(0, 10)}.pdf`,
        onProgress: (step) => setExportStep(step),
      });
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
      setExportStep('');
    }
  };

  // Reset Layout
  const handleResetLayout = () => {
    const sampleList = generateInitialImages(7);
    setImageCount(7);
    setLayoutPreset('random');
    const titleBox = { x: 147, y: 40, width: 500, height: 85 };
    const positioned = applyRandomNonOverlappingLayout(sampleList, INITIAL_CANVAS_SETTINGS, [titleBox]);
    setImages(positioned);
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* 1. 上方區塊 (Top Area) */}
      <HeaderTop
        compileTime={COMPILE_TIMESTAMP}
        zoom={canvas.zoom}
        onZoomChange={(zoom) => setCanvas((prev) => ({ ...prev, zoom }))}
        showGrid={canvas.showGrid}
        onToggleGrid={() => setCanvas((prev) => ({ ...prev, showGrid: !prev.showGrid }))}
        showMargins={canvas.showMargins}
        onToggleMargins={() => setCanvas((prev) => ({ ...prev, showMargins: !prev.showMargins }))}
        onResetLayout={handleResetLayout}
        onExportPdf={handleExportPdf}
        onPrint={triggerBrowserPrint}
        isExporting={isExporting}
        exportStep={exportStep}
      />

      {/* 上方與中間之間的水平分割線 (Horizontal line separator) */}
      <hr className="w-full border-0 h-px bg-neutral-800 my-0 shadow-sm" />

      {/* 2. 中間主內容區域 (Middle Area - A4 WYSIWYG Canvas) */}
      <A4CanvasMiddle
        canvas={canvas}
        images={images}
        texts={texts}
        selectedId={selectedId}
        onSelectElement={setSelectedId}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
      />

      {/* 中間與下方之間的水平分割線 (Horizontal line separator) */}
      <hr className="w-full border-0 h-px bg-neutral-800 my-0 shadow-sm" />

      {/* 3. 下方控制與參數設定區域 (Bottom Area - Control Deck) */}
      <ControlDeckBottom
        imageCount={imageCount}
        onImageCountChange={handleImageCountChange}
        layoutPreset={layoutPreset}
        onLayoutPresetChange={handleLayoutPresetChange}
        onReRollRandom={handleReRollRandom}
        images={images}
        texts={texts}
        selectedId={selectedId}
        onSelectElement={setSelectedId}
        onUpdateElement={handleUpdateElement}
        onBatchUploadImages={handleBatchUploadImages}
        onLoadSampleImages={handleLoadSampleImages}
        onApplyStyleToAllImages={handleApplyStyleToAllImages}
        onAddTextElement={handleAddTextElement}
        onDeleteElement={handleDeleteElement}
        onReorderLayers={handleReorderLayers}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onAutoAvoidTextOverlap={handleAutoAvoidTextOverlap}
        canvas={canvas}
        onUpdateCanvas={(updates) => setCanvas((prev) => ({ ...prev, ...updates }))}
        onExportPdf={handleExportPdf}
        onPrint={triggerBrowserPrint}
        isExporting={isExporting}
      />
    </div>
  );
}
