/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileDown,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HeaderTopProps {
  compileTime: string;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showMargins: boolean;
  onToggleMargins: () => void;
  onResetLayout: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  isExporting: boolean;
  exportStep: string;
}

export const HeaderTop: React.FC<HeaderTopProps> = ({
  compileTime,
  zoom,
  onZoomChange,
  showGrid,
  onToggleGrid,
  showMargins,
  onToggleMargins,
  onResetLayout,
  onExportPdf,
  onPrint,
  isExporting,
  exportStep,
}) => {
  return (
    <header className="w-full bg-neutral-950/95 text-neutral-100 px-4 md:px-8 py-3.5 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Branding & Version Compile Time */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-950/40">
              <span className="font-serif font-bold text-neutral-950 text-sm">A4</span>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-neutral-100 flex items-center gap-1.5">
                <span>A4 排版設計與 PDF 匯出系統</span>
              </div>
              {/* Compile version timestamp as requested: 上方留有版本編譯時間 */}
              <div className="text-xs text-neutral-400 font-mono tracking-tight flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>版本編譯時間：{compileTime}</span>
              </div>
            </div>
          </div>

          {/* Mobile Export CTA */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onExportPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium text-xs rounded-md shadow-sm transition-colors disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExporting ? '匯出中...' : '匯出 PDF'}</span>
            </button>
          </div>
        </div>

        {/* Center: Canvas Viewport Controls */}
        <div className="hidden lg:flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => onZoomChange(Math.max(0.4, Math.round((zoom - 0.1) * 10) / 10))}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded transition-colors"
            title="縮小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono font-medium text-neutral-200 min-w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(1.8, Math.round((zoom + 0.1) * 10) / 10))}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-neutral-800 mx-1"></div>
          <button
            onClick={() => onZoomChange(0.75)}
            className={`px-2 py-1 rounded transition-colors ${
              Math.abs(zoom - 0.75) < 0.05
                ? 'bg-neutral-800 text-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="適合畫布"
          >
            <Maximize2 className="w-3.5 h-3.5 inline mr-1" />
            全頁
          </button>
          <button
            onClick={() => onZoomChange(1.0)}
            className={`px-2 py-1 rounded transition-colors ${
              Math.abs(zoom - 1.0) < 0.05
                ? 'bg-neutral-800 text-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="100% 原始尺寸"
          >
            1:1
          </button>
          <div className="w-px h-4 bg-neutral-800 mx-1"></div>
          <button
            onClick={onToggleGrid}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
              showGrid
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="切換對齊網格"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            網格
          </button>
          <button
            onClick={onToggleMargins}
            className={`px-2 py-1 rounded transition-colors ${
              showMargins
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="切換 A4 安全列印邊距線"
          >
            列印邊距
          </button>
        </div>

        {/* Right: Actions (Reset, Print, Export PDF) */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={onResetLayout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
            title="重設為初始排版"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">重設版面</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-lg transition-colors font-medium"
            title="以 A4 紙張大小列印"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-300" />
            <span>列印 A4</span>
          </button>

          <button
            onClick={onExportPdf}
            disabled={isExporting}
            className="relative flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold text-xs rounded-lg shadow-md shadow-amber-950/40 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
                <span>{exportStep || '產生 PDF 中...'}</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>匯出 A4 PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
