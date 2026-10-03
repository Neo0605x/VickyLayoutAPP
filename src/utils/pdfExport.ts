/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportPdfOptions {
  fileName?: string;
  onProgress?: (step: string) => void;
}

/**
 * Exports the specified DOM element as an authentic high-resolution A4 PDF.
 */
export async function exportElementToA4Pdf(
  elementId: string,
  options: ExportPdfOptions = {}
): Promise<void> {
  const { fileName = 'A4_Layout_Print.pdf', onProgress } = options;

  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    throw new Error(`Target A4 element #${elementId} not found`);
  }

  onProgress?.('正在擷取高解析排版內容...');

  // Create temporary container styling to ensure exact A4 print rendering during capture
  const originalTransform = targetElement.style.transform;
  const originalTransformOrigin = targetElement.style.transformOrigin;
  targetElement.style.transform = 'none';
  targetElement.style.transformOrigin = 'top left';

  try {
    const canvas = await html2canvas(targetElement, {
      scale: 2.5, // 2.5x resolution for print clarity
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
      windowHeight: 1123,
    });

    onProgress?.('正在建立標準 A4 PDF 檔案...');

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

    onProgress?.('正在儲存 PDF 下載檔案...');
    pdf.save(fileName);
  } finally {
    // Restore on-screen zoom transform
    targetElement.style.transform = originalTransform;
    targetElement.style.transformOrigin = originalTransformOrigin;
  }
}

/**
 * Triggers native system browser printing for A4
 */
export function triggerBrowserPrint(): void {
  window.print();
}
