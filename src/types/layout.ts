/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'none';

export type ShadowPreset = 'none' | 'soft' | 'medium' | 'deep' | 'glow';

export interface BaseElement {
  id: string;
  type: 'image' | 'text';
  name: string;
  x: number; // in pixels relative to A4 canvas (794 x 1123)
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees (-180 to 180)
  zIndex: number;
  opacity: number; // 0 to 1
  locked?: boolean;
  hidden?: boolean;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  url: string;
  originalFileName?: string;
  borderStyle: BorderStyle;
  borderWidth: number; // 0 to 24px
  borderColor: string;
  borderRadius: number; // 0 to 60px or 999
  shadow: ShadowPreset;
  aspectRatio?: number;
  objectFit: 'cover' | 'contain' | 'fill';
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number; // 12 to 96px
  fontColor: string;
  fontFamily: string;
  fontWeight: '300' | '400' | '500' | '600' | '700';
  textAlign: 'left' | 'center' | 'right';
  backgroundColor: string; // e.g. 'transparent' or '#ffffff'
  padding: number;
  borderRadius: number;
  lineHeight: number; // e.g. 1.3 to 2.0
}

export type LayoutElement = ImageElement | TextElement;

export type LayoutPresetType =
  | 'random'
  | 'grid'
  | 'magazine'
  | 'polaroid'
  | 'masonry'
  | 'radial'
  | 'alternating';

export interface CanvasSettings {
  width: number; // 794 px (~210mm at 96 DPI)
  height: number; // 1123 px (~297mm at 96 DPI)
  margin: number; // 40 px (~10.5mm)
  backgroundColor: string;
  showGrid: boolean;
  showMargins: boolean;
  snapToGrid: boolean;
  zoom: number; // 0.5 to 2.0
}
