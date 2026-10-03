/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  ImageElement,
  TextElement,
  LayoutPresetType,
  BorderStyle,
  ShadowPreset,
  CanvasSettings,
  LayoutElement,
} from '../types/layout';
import {
  Sliders,
  Type,
  Layers,
  Image as ImageIcon,
  Sparkles,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Copy,
  Check,
  FileDown,
  Printer,
  Compass,
} from 'lucide-react';

interface ControlDeckBottomProps {
  imageCount: number;
  onImageCountChange: (count: number) => void;
  layoutPreset: LayoutPresetType;
  onLayoutPresetChange: (preset: LayoutPresetType) => void;
  onReRollRandom: () => void;
  images: ImageElement[];
  texts: TextElement[];
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<LayoutElement>) => void;
  onBatchUploadImages: (files: FileList) => void;
  onLoadSampleImages: () => void;
  onApplyStyleToAllImages: (sourceImg: ImageElement) => void;
  onAddTextElement: () => void;
  onDeleteElement: (id: string) => void;
  onReorderLayers: (newOrder: LayoutElement[]) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onAutoAvoidTextOverlap: (textId: string) => void;
  canvas: CanvasSettings;
  onUpdateCanvas: (updates: Partial<CanvasSettings>) => void;
  onExportPdf: () => void;
  onPrint: () => void;
  isExporting: boolean;
}

export const ControlDeckBottom: React.FC<ControlDeckBottomProps> = ({
  imageCount,
  onImageCountChange,
  layoutPreset,
  onLayoutPresetChange,
  onReRollRandom,
  images,
  texts,
  selectedId,
  onSelectElement,
  onUpdateElement,
  onBatchUploadImages,
  onLoadSampleImages,
  onApplyStyleToAllImages,
  onAddTextElement,
  onDeleteElement,
  onReorderLayers,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onAutoAvoidTextOverlap,
  canvas,
  onUpdateCanvas,
  onExportPdf,
  onPrint,
  isExporting,
}) => {
  const [activeTab, setActiveTab] = useState<'layout' | 'images' | 'text' | 'layers' | 'canvas'>('layout');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);

  // Selected image or default to first image
  const selectedImage = images.find((img) => img.id === selectedId) || images[0];
  const selectedText = texts.find((txt) => txt.id === selectedId) || texts[0];

  // Drag and drop layer reordering state
  const [draggedLayerIndex, setDraggedLayerIndex] = useState<number | null>(null);

  const allElements: LayoutElement[] = [...images, ...texts].sort((a, b) => b.zIndex - a.zIndex);

  const handleApplyToAll = () => {
    if (!selectedImage) return;
    onApplyStyleToAllImages(selectedImage);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onBatchUploadImages(e.target.files);
      e.target.value = '';
    }
  };

  const handleSingleImageReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedImage || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdateElement(selectedImage.id, {
          url: event.target.result as string,
          name: file.name.substring(0, 14),
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Color preset swatches
  const colorPresets = [
    { name: '純白', color: '#ffffff' },
    { name: '曜石黑', color: '#111827' },
    { name: '香檳金', color: '#d97706' },
    { name: '經典灰', color: '#9ca3af' },
    { name: '藏青藍', color: '#1e3a8a' },
    { name: '深酒紅', color: '#881337' },
    { name: '赤陶暖棕', color: '#9a3412' },
    { name: '橄欖綠', color: '#3f6212' },
  ];

  return (
    <footer className="bottom-control-deck w-full bg-neutral-950 border-t border-neutral-800 text-neutral-100 z-40 select-none">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUploadChange}
        className="hidden"
      />
      <input
        ref={singleFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleSingleImageReplace}
        className="hidden"
      />

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 border-b border-neutral-800/80 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-1 py-2">
          <button
            onClick={() => setActiveTab('layout')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'layout'
                ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>版型與張數設定</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-700/50 text-neutral-300">
              {images.length} 張
            </span>
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'images'
                ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>圖片細部參數 (外框/角度)</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'text'
                ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>文字輸入與排版</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-700/50 text-neutral-300">
              {texts.length} 組
            </span>
          </button>

          <button
            onClick={() => setActiveTab('layers')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'layers'
                ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>圖層層級堆疊順序</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-700/50 text-neutral-300">
              {allElements.length}
            </span>
          </button>
        </div>

        {/* Quick Quick Export PDF Trigger */}
        <div className="hidden sm:flex items-center gap-2 py-2">
          <button
            onClick={onExportPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isExporting ? '匯出中...' : '匯出 A4 PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Panels Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
        {/* TAB 1: 版型與張數設定 (Layout & Image Count) */}
        {activeTab === 'layout' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Image Count & Batch Upload */}
            <div className="lg:col-span-4 bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>圖片張數設定</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    設定頁面上欲排列的照片總數 (1 ~ 20 張)
                  </p>
                </div>
              </div>

              {/* Number Stepper */}
              <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg">
                <button
                  onClick={() => onImageCountChange(Math.max(1, imageCount - 1))}
                  className="w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold text-sm flex items-center justify-center transition-colors"
                  title="減少 1 張"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <span className="text-xl font-bold font-mono text-amber-400">{imageCount}</span>
                  <span className="text-xs text-neutral-400 ml-1.5">張圖片</span>
                </div>
                <button
                  onClick={() => onImageCountChange(Math.min(20, imageCount + 1))}
                  className="w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold text-sm flex items-center justify-center transition-colors"
                  title="增加 1 張"
                >
                  +
                </button>
              </div>

              {/* Preset Count Chips */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span>常用數量：</span>
                {[3, 5, 7, 9, 12].map((num) => (
                  <button
                    key={num}
                    onClick={() => onImageCountChange(num)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      imageCount === num
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    {num} 張
                  </button>
                ))}
              </div>

              {/* Upload Actions */}
              <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-medium rounded-lg border border-neutral-700/80 transition-colors"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>批次上傳電腦圖片 (支援多選)</span>
                </button>

                <button
                  onClick={onLoadSampleImages}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 text-xs rounded-lg border border-neutral-800 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>重新填入高解析範例照片</span>
                </button>
              </div>
            </div>

            {/* Right: Layout Preset Selection */}
            <div className="lg:col-span-8 bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>排版版型選擇 (內建常見版型)</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    選擇預設風格排版，或選隨機排版（保證照片彼此完全不覆蓋）
                  </p>
                </div>

                {/* Preset Dropdown Select */}
                <div className="flex items-center gap-2">
                  <select
                    value={layoutPreset}
                    onChange={(e) => onLayoutPresetChange(e.target.value as LayoutPresetType)}
                    className="bg-neutral-950 border border-neutral-700 text-amber-300 font-medium text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="random">🎲 隨機排列 (保證不重疊)</option>
                    <option value="grid">📐 網格平均分散 (Equal Grid)</option>
                    <option value="polaroid">📷 相簿拍立得拼貼 (Polaroid Casual)</option>
                    <option value="magazine">📰 雜誌封面焦點 (Magazine Hero)</option>
                    <option value="masonry">🏛️ 畫廊瀑布流 (Masonry Columns)</option>
                    <option value="radial">🪐 圓形環繞焦點 (Radial Orbit)</option>
                    <option value="alternating">⚖️ 交錯雙欄對比 (Alternating)</option>
                  </select>

                  {/* Re-roll random button */}
                  {layoutPreset === 'random' && (
                    <button
                      onClick={onReRollRandom}
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-lg transition-colors active:scale-95"
                      title="每次點擊都真正隨機排版，保證不相互覆蓋"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>重新隨機排版</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Preset Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  {
                    id: 'random',
                    title: '隨機排列 (不覆蓋)',
                    desc: '智慧計算零重疊散佈',
                    icon: '🎲',
                  },
                  {
                    id: 'grid',
                    title: '網格平均分散',
                    desc: '整齊等寬等高矩陣',
                    icon: '📐',
                  },
                  {
                    id: 'polaroid',
                    title: '拍立得拼貼',
                    desc: '手作質感微傾角拍立得',
                    icon: '📷',
                  },
                  {
                    id: 'magazine',
                    title: '雜誌風格焦點',
                    desc: '大首圖 + 側邊馬賽克',
                    icon: '📰',
                  },
                  {
                    id: 'masonry',
                    title: '畫廊瀑布流',
                    desc: '非對稱節奏高低落差',
                    icon: '🏛️',
                  },
                  {
                    id: 'radial',
                    title: '圓形環繞焦點',
                    desc: '繞核心橢圓散發',
                    icon: '🪐',
                  },
                  {
                    id: 'alternating',
                    title: '交錯雙欄對比',
                    desc: '左大右小律動切分',
                    icon: '⚖️',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onLayoutPresetChange(item.id as LayoutPresetType);
                      if (item.id === 'random') {
                        onReRollRandom();
                      }
                    }}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      layoutPreset === item.id
                        ? 'bg-amber-500/10 border-amber-500 text-neutral-100 shadow-md ring-1 ring-amber-500'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-lg mb-1">{item.icon}</div>
                    <div className="text-xs font-semibold text-neutral-200">{item.title}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 圖片細部參數 (Per-Image Parameters) */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            {/* Image Selector Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs text-neutral-400 whitespace-nowrap">選取欲調整圖片：</span>
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => onSelectElement(img.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all ${
                    selectedImage?.id === img.id
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-5 h-5 rounded object-cover"
                  />
                  <span>第 {idx + 1} 張 ({img.name})</span>
                </button>
              ))}
            </div>

            {selectedImage ? (
              <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-xl space-y-6">
                {/* Header of Active Image */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.name}
                      className="w-12 h-12 rounded-lg object-cover border border-neutral-700 shadow"
                    />
                    <div>
                      <div className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                        <span>當前調整：{selectedImage.name}</span>
                        <span className="text-xs font-mono font-normal text-amber-400">
                          {selectedImage.width} × {selectedImage.height} px
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        X: {selectedImage.x}px · Y: {selectedImage.y}px · 旋轉角度: {selectedImage.rotation}°
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => singleFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors"
                    >
                      替換這張照片
                    </button>
                    <button
                      onClick={handleApplyToAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-lg transition-colors"
                      title="將此外框顏色、寬度、圓角與陰影風格複製給全部圖片"
                    >
                      {copiedNotification ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>已套用到全部 {images.length} 張圖片！</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>套用外框樣式至全部圖片</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Grid of Sliders & Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Parameter Group 1: 外框 (Border Size, Style & Color) */}
                  <div className="space-y-3 bg-neutral-950 p-3.5 rounded-lg border border-neutral-800/80">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      外框樣式與大小 (Border)
                    </label>

                    {/* Border Style Buttons */}
                    <div className="grid grid-cols-5 gap-1 text-[11px]">
                      {(['solid', 'dashed', 'dotted', 'double', 'none'] as BorderStyle[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => onUpdateElement(selectedImage.id, { borderStyle: st })}
                          className={`py-1 rounded text-center capitalize transition-colors ${
                            selectedImage.borderStyle === st
                              ? 'bg-amber-500 text-neutral-950 font-bold'
                              : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          {st === 'solid'
                            ? '實線'
                            : st === 'dashed'
                            ? '虛線'
                            : st === 'dotted'
                            ? '點線'
                            : st === 'double'
                            ? '雙線'
                            : '無'}
                        </button>
                      ))}
                    </div>

                    {/* Border Width Slider */}
                    <div>
                      <div className="flex justify-between text-xs text-neutral-400 mb-1">
                        <span>外框粗細</span>
                        <span className="font-mono text-amber-400">{selectedImage.borderWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        value={selectedImage.borderWidth}
                        onChange={(e) =>
                          onUpdateElement(selectedImage.id, { borderWidth: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Border Color */}
                    <div>
                      <div className="flex justify-between text-xs text-neutral-400 mb-1">
                        <span>外框顏色</span>
                        <span className="font-mono text-neutral-300">{selectedImage.borderColor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedImage.borderColor}
                          onChange={(e) =>
                            onUpdateElement(selectedImage.id, { borderColor: e.target.value })
                          }
                          className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer"
                        />
                        <div className="flex items-center gap-1 flex-wrap">
                          {colorPresets.map((p) => (
                            <button
                              key={p.color}
                              onClick={() =>
                                onUpdateElement(selectedImage.id, { borderColor: p.color })
                              }
                              style={{ backgroundColor: p.color }}
                              className={`w-5 h-5 rounded-full border transition-transform ${
                                selectedImage.borderColor.toLowerCase() === p.color.toLowerCase()
                                  ? 'scale-115 border-amber-400 ring-2 ring-amber-400/50'
                                  : 'border-neutral-600 hover:scale-110'
                              }`}
                              title={p.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parameter Group 2: 旋轉角度 (Rotation & Tilt) */}
                  <div className="space-y-3 bg-neutral-950 p-3.5 rounded-lg border border-neutral-800/80">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      旋轉角度 (Rotation Angle)
                    </label>

                    <div>
                      <div className="flex justify-between text-xs text-neutral-400 mb-1">
                        <span>傾斜度數 (-180° ~ 180°)</span>
                        <span className="font-mono text-amber-400 font-bold">
                          {selectedImage.rotation}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedImage.rotation}
                        onChange={(e) =>
                          onUpdateElement(selectedImage.id, { rotation: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Quick Rotation Buttons */}
                    <div className="grid grid-cols-5 gap-1 text-[11px]">
                      {[-15, -5, 0, 5, 15].map((deg) => (
                        <button
                          key={deg}
                          onClick={() => onUpdateElement(selectedImage.id, { rotation: deg })}
                          className={`py-1 rounded text-center font-mono transition-colors ${
                            selectedImage.rotation === deg
                              ? 'bg-amber-500 text-neutral-950 font-bold'
                              : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          {deg > 0 ? `+${deg}°` : `${deg}°`}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-[11px] pt-1 border-t border-neutral-800">
                      {[0, 90, 180, -90].map((deg) => (
                        <button
                          key={deg}
                          onClick={() => onUpdateElement(selectedImage.id, { rotation: deg })}
                          className="py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-center font-mono"
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Parameter Group 3: 圓角與陰影 (Corner Radius & Shadow) */}
                  <div className="space-y-3 bg-neutral-950 p-3.5 rounded-lg border border-neutral-800/80">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      圓角與陰影質感 (Corners & Shadow)
                    </label>

                    {/* Border Radius */}
                    <div>
                      <div className="flex justify-between text-xs text-neutral-400 mb-1">
                        <span>圓角半徑</span>
                        <span className="font-mono text-amber-400">{selectedImage.borderRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="60"
                        value={selectedImage.borderRadius}
                        onChange={(e) =>
                          onUpdateElement(selectedImage.id, { borderRadius: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Shadow Preset Buttons */}
                    <div>
                      <span className="text-xs text-neutral-400 block mb-1">陰影深度</span>
                      <div className="grid grid-cols-5 gap-1 text-[11px]">
                        {(['none', 'soft', 'medium', 'deep', 'glow'] as ShadowPreset[]).map((sh) => (
                          <button
                            key={sh}
                            onClick={() => onUpdateElement(selectedImage.id, { shadow: sh })}
                            className={`py-1 rounded text-center transition-colors ${
                              selectedImage.shadow === sh
                                ? 'bg-amber-500 text-neutral-950 font-bold'
                                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            {sh === 'none'
                              ? '無'
                              : sh === 'soft'
                              ? '柔和'
                              : sh === 'medium'
                              ? '深邃'
                              : sh === 'deep'
                              ? '立體'
                              : '氛圍'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Opacity */}
                    <div>
                      <div className="flex justify-between text-xs text-neutral-400 mb-1">
                        <span>透明度 (Opacity)</span>
                        <span className="font-mono text-amber-400">
                          {Math.round(selectedImage.opacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={selectedImage.opacity}
                        onChange={(e) =>
                          onUpdateElement(selectedImage.id, { opacity: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Parameter Group 4: 尺寸與座標 (Size & Position) */}
                  <div className="space-y-3 bg-neutral-950 p-3.5 rounded-lg border border-neutral-800/80">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      尺寸與位置座標 (W / H / X / Y)
                    </label>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-neutral-400 block mb-1">寬度 (W)</span>
                        <input
                          type="number"
                          value={selectedImage.width}
                          onChange={(e) =>
                            onUpdateElement(selectedImage.id, { width: Math.max(40, Number(e.target.value)) })
                          }
                          className="w-full bg-neutral-900 border border-neutral-700 px-2 py-1 rounded text-neutral-100 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-neutral-400 block mb-1">高度 (H)</span>
                        <input
                          type="number"
                          value={selectedImage.height}
                          onChange={(e) =>
                            onUpdateElement(selectedImage.id, { height: Math.max(40, Number(e.target.value)) })
                          }
                          className="w-full bg-neutral-900 border border-neutral-700 px-2 py-1 rounded text-neutral-100 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-neutral-400 block mb-1">座標 X (水平)</span>
                        <input
                          type="number"
                          value={selectedImage.x}
                          onChange={(e) =>
                            onUpdateElement(selectedImage.id, { x: Number(e.target.value) })
                          }
                          className="w-full bg-neutral-900 border border-neutral-700 px-2 py-1 rounded text-neutral-100 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-neutral-400 block mb-1">座標 Y (垂直)</span>
                        <input
                          type="number"
                          value={selectedImage.y}
                          onChange={(e) =>
                            onUpdateElement(selectedImage.id, { y: Number(e.target.value) })
                          }
                          className="w-full bg-neutral-900 border border-neutral-700 px-2 py-1 rounded text-neutral-100 font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Object Fit mode */}
                    <div className="pt-1">
                      <span className="text-xs text-neutral-400 block mb-1">圖片縮放填滿方式</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => onUpdateElement(selectedImage.id, { objectFit: 'cover' })}
                          className={`py-1 rounded text-center transition-colors ${
                            selectedImage.objectFit === 'cover'
                              ? 'bg-neutral-800 text-amber-300 font-semibold'
                              : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          填滿裁切 (Cover)
                        </button>
                        <button
                          onClick={() => onUpdateElement(selectedImage.id, { objectFit: 'contain' })}
                          className={`py-1 rounded text-center transition-colors ${
                            selectedImage.objectFit === 'contain'
                              ? 'bg-neutral-800 text-amber-300 font-semibold'
                              : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          完整縮放 (Contain)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-500 bg-neutral-900/50 rounded-xl">
                請在畫布或上方選取一張欲調整的圖片
              </div>
            )}
          </div>
        )}

        {/* TAB 3: 文字輸入區域與排版調整 (Text Typography) */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-amber-400" />
                  <span>文字排版與輸入設定 (Text Input & Typography)</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  自訂標題、副標題、文章段落，支援字型、大小、顏色、透明度，並可一鍵智慧避讓圖片
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onAddTextElement}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>新增文字方塊</span>
                </button>
              </div>
            </div>

            {/* Text Elements Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {texts.map((txt, idx) => (
                <button
                  key={txt.id}
                  onClick={() => onSelectElement(txt.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all ${
                    selectedText?.id === txt.id
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>{txt.name || `文字區塊 #${idx + 1}`}</span>
                </button>
              ))}
            </div>

            {selectedText ? (
              <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-xl space-y-5">
                {/* Main Text Content Input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      文字內容 (Text Content)
                    </label>
                    <button
                      onClick={() => onAutoAvoidTextOverlap(selectedText.id)}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      title="智慧排版避讓：自動將文字方塊移到不與照片重疊的空白區域"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>文字智慧避開圖片 (不覆蓋)</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={selectedText.content}
                    onChange={(e) =>
                      onUpdateElement(selectedText.id, { content: e.target.value })
                    }
                    placeholder="請在此輸入要顯示在 A4 版面上的文字內容..."
                    className="w-full bg-neutral-950 border border-neutral-700 p-3 rounded-lg text-sm text-neutral-100 outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Typography Controls Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Font Family & Weight */}
                  <div className="space-y-3 bg-neutral-950 p-3.5 rounded-lg border border-neutral-800/80">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      字型與字重 (Font Style)
                    </label>

                    <div>
                      <span className="text-xs text-neutral-400 block mb-1">字型選擇</span>
                      <select
                        value={selectedText.fontFamily}
                        onChange={(e) =>
                          onUpdateElement(selectedText.id, { fontFamily: e.target.value })
                        }
                        className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded px-2.5 py-1.5 outline-none focus:border-amber-500"
                      >
                        <option value="'Plus Jakarta Sans', sans-serif">都會現代無襯線 (Jakarta)</option>
                        <option value="'Noto Serif TC', serif">人文典雅思源宋體 (Noto Serif)</option>
                        <option value="'Noto Sans TC', sans-serif">簡潔清晰思源黑體 (Noto Sans)</option>
                        <option value="'Cinzel', serif">古典莊嚴襯線 (Cinzel)</option>
                        <option value="'JetBrains Mono', monospace">科技精準等寬 (Mono)</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-xs text-neutral-400 block mb-1">字體粗細 (Weight)</span>
                      <div className="grid grid-cols-5 gap-1 text-[11px]">
                        {[
                          { label: '細', val: '300' },
                          { label: '常規', val: '400' },
                          { label: '中等', val: '500' },
                          { label: '半粗', val: '600' },
                          { label: '粗體', val: '700' },
                        ].map((w) => (
                          <button
                            key={w.val}
                            onClick={() =>
                              onUpdateElement(selectedText.id, { fontWeight: w.val as any })
                            }
                            className={`py-1 rounded text-center transition-colors ${
                              selectedText.fontWeight === w.val
                                ? 'bg-amber-500 text-neutral-950 font-bold'
                                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            {w.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Font Size & Alignment */}
                  <div className="space-y-3 bg-neutral-950 p-3.5 rounded-lg border border-neutral-800/80">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      字體大小與對齊 (Size & Align)
                    </label>

                    <div>
                      <div className="flex justify-between text-xs text-neutral-400 mb-1">
                        <span>字體大小 (Font Size)</span>
                        <span className="font-mono text-amber-400 font-bold">
                          {selectedText.fontSize}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={selectedText.fontSize}
                        onChange={(e) =>
                          onUpdateElement(selectedText.id, { fontSize: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Text Align */}
                    <div>
                      <span className="text-xs text-neutral-400 block mb-1">對齊方式</span>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        {[
                          { label: '置左', val: 'left' },
                          { label: '置中', val: 'center' },
                          { label: '置右', val: 'right' },
                        ].map((al) => (
                          <button
                            key={al.val}
                            onClick={() =>
                              onUpdateElement(selectedText.id, { textAlign: al.val as any })
                            }
                            className={`py-1 rounded text-center transition-colors ${
                              selectedText.textAlign === al.val
                                ? 'bg-amber-500 text-neutral-950 font-bold'
                                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            {al.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Text Color & Opacity */}
                  <div className="space-y-3 bg-neutral-950 p-3.5 rounded-lg border border-neutral-800/80">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      文字顏色與透明度 (Color & Opacity)
                    </label>

                    <div>
                      <div className="flex justify-between text-xs text-neutral-400 mb-1">
                        <span>文字色彩</span>
                        <span className="font-mono text-neutral-300">{selectedText.fontColor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedText.fontColor}
                          onChange={(e) =>
                            onUpdateElement(selectedText.id, { fontColor: e.target.value })
                          }
                          className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer"
                        />
                        <div className="flex items-center gap-1 flex-wrap">
                          {colorPresets.map((p) => (
                            <button
                              key={p.color}
                              onClick={() =>
                                onUpdateElement(selectedText.id, { fontColor: p.color })
                              }
                              style={{ backgroundColor: p.color }}
                              className={`w-5 h-5 rounded-full border transition-transform ${
                                selectedText.fontColor.toLowerCase() === p.color.toLowerCase()
                                  ? 'scale-115 border-amber-400 ring-2 ring-amber-400/50'
                                  : 'border-neutral-600 hover:scale-110'
                              }`}
                              title={p.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-neutral-400 mb-1">
                        <span>透明度 (Opacity)</span>
                        <span className="font-mono text-amber-400">
                          {Math.round(selectedText.opacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={selectedText.opacity}
                        onChange={(e) =>
                          onUpdateElement(selectedText.id, { opacity: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Background & Padding */}
                  <div className="space-y-3 bg-neutral-950 p-3.5 rounded-lg border border-neutral-800/80">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      底色框與寬高 (Backdrop & Box)
                    </label>

                    <div>
                      <span className="text-xs text-neutral-400 block mb-1">背景框底色</span>
                      <div className="grid grid-cols-4 gap-1 text-[11px]">
                        {[
                          { label: '透明', color: 'transparent' },
                          { label: '白底', color: '#ffffff' },
                          { label: '暖白', color: '#fefce8' },
                          { label: '墨黑', color: '#0f172a' },
                        ].map((b) => (
                          <button
                            key={b.label}
                            onClick={() =>
                              onUpdateElement(selectedText.id, { backgroundColor: b.color })
                            }
                            className={`py-1 rounded text-center transition-colors ${
                              selectedText.backgroundColor === b.color
                                ? 'bg-amber-500 text-neutral-950 font-bold'
                                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-neutral-400 block mb-1">內距 (Padding)</span>
                        <input
                          type="number"
                          value={selectedText.padding}
                          onChange={(e) =>
                            onUpdateElement(selectedText.id, { padding: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full bg-neutral-900 border border-neutral-700 px-2 py-1 rounded text-neutral-100 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-neutral-400 block mb-1">外框圓角</span>
                        <input
                          type="number"
                          value={selectedText.borderRadius}
                          onChange={(e) =>
                            onUpdateElement(selectedText.id, { borderRadius: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full bg-neutral-900 border border-neutral-700 px-2 py-1 rounded text-neutral-100 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 4: 圖層層級與堆疊順序 (Layers & Z-Index) */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>圖層層級堆疊順序 (Layer Hierarchy & Stacking Order)</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  上方的項目會覆蓋在下方的項目之上。可透過箭頭按鈕或拖拽調整順序。
                </p>
              </div>
            </div>

            {/* Layer List with Drag/Drop Reorder & Actions */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl divide-y divide-neutral-800/80 overflow-hidden">
              {allElements.map((el, index) => {
                const isSelected = el.id === selectedId;

                return (
                  <div
                    key={el.id}
                    draggable
                    onDragStart={() => setDraggedLayerIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedLayerIndex === null || draggedLayerIndex === index) return;
                      const reordered = [...allElements];
                      const [moved] = reordered.splice(draggedLayerIndex, 1);
                      reordered.splice(index, 0, moved);

                      // Re-assign zIndexes (highest at top)
                      const total = reordered.length;
                      const updated = reordered.map((item, i) => ({
                        ...item,
                        zIndex: total - i,
                      }));
                      onReorderLayers(updated);
                      setDraggedLayerIndex(null);
                    }}
                    onClick={() => onSelectElement(el.id)}
                    className={`flex items-center justify-between p-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-l-4 border-l-amber-500'
                        : 'hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-neutral-500 w-5">
                        #{allElements.length - index}
                      </span>

                      {el.type === 'image' ? (
                        <div className="flex items-center gap-2.5">
                          <img
                            src={(el as ImageElement).url}
                            alt={el.name}
                            className="w-8 h-8 rounded object-cover border border-neutral-700"
                          />
                          <div>
                            <div className="text-xs font-semibold text-neutral-200">{el.name}</div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              圖片 · {el.width}×{el.height}px · 旋轉 {el.rotation}°
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-amber-400">
                            <Type className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-neutral-200">
                              {el.name} ({(el as TextElement).content.substring(0, 16)}...)
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              文字 · {(el as TextElement).fontSize}px · {(el as TextElement).fontWeight}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Layer Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBringToFront(el.id);
                        }}
                        className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 rounded transition-colors"
                        title="移至最上層"
                      >
                        <ChevronsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBringForward(el.id);
                        }}
                        className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors"
                        title="上移一層"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendBackward(el.id);
                        }}
                        className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors"
                        title="下移一層"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendToBack(el.id);
                        }}
                        className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 rounded transition-colors"
                        title="移至最底層"
                      >
                        <ChevronsDown className="w-4 h-4" />
                      </button>

                      <div className="w-px h-4 bg-neutral-800 mx-1"></div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateElement(el.id, { locked: !el.locked });
                        }}
                        className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 rounded transition-colors"
                        title={el.locked ? '解鎖項目' : '鎖定項目'}
                      >
                        {el.locked ? (
                          <Lock className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateElement(el.id, { hidden: !el.hidden });
                        }}
                        className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 rounded transition-colors"
                        title={el.hidden ? '顯示項目' : '隱藏項目'}
                      >
                        {el.hidden ? (
                          <EyeOff className="w-4 h-4 text-neutral-500" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteElement(el.id);
                        }}
                        className="p-1.5 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 rounded transition-colors"
                        title="刪除項目"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};
