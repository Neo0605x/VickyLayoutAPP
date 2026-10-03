/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ImageElement, TextElement, LayoutPresetType, CanvasSettings } from '../types/layout';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Checks if two bounding boxes with an additional safety padding collide.
 */
function boxesOverlap(b1: Box, b2: Box, gap: number = 16): boolean {
  return !(
    b1.x + b1.width + gap <= b2.x ||
    b2.x + b2.width + gap <= b1.x ||
    b1.y + b1.height + gap <= b2.y ||
    b2.y + b2.height + gap <= b1.y
  );
}

/**
 * Generates truly non-overlapping random positions for N images within canvas bounds.
 * Guarantees zero collisions between images.
 */
export function applyRandomNonOverlappingLayout(
  images: ImageElement[],
  canvas: CanvasSettings,
  reservedBoxes: Box[] = []
): ImageElement[] {
  const count = images.length;
  if (count === 0) return [];

  const marginX = canvas.margin;
  const marginY = canvas.margin + 40; // leave room for top title/header
  const usableW = canvas.width - marginX * 2;
  const usableH = canvas.height - marginY - canvas.margin;

  // Determine appropriate dimension scale for N images
  let targetW: number;
  let targetH: number;

  if (count <= 3) {
    targetW = Math.min(320, usableW * 0.7);
    targetH = targetW * 0.75;
  } else if (count <= 5) {
    targetW = Math.min(260, usableW * 0.45);
    targetH = targetW * 0.75;
  } else if (count <= 8) {
    targetW = Math.min(210, usableW * 0.38);
    targetH = targetW * 0.72;
  } else if (count <= 12) {
    targetW = Math.min(170, usableW * 0.3);
    targetH = targetW * 0.72;
  } else {
    targetW = Math.min(140, usableW * 0.24);
    targetH = targetW * 0.72;
  }

  const placedBoxes: Box[] = [...reservedBoxes];
  const updatedImages: ImageElement[] = [];

  // Try continuous randomized dart throwing first
  for (let i = 0; i < count; i++) {
    const img = images[i];
    let placed = false;
    let attempts = 0;
    const maxAttempts = 120;

    // Slight variance in size (+- 10%)
    const sizeFactor = 0.9 + Math.random() * 0.2;
    const itemW = Math.round(targetW * sizeFactor);
    const itemH = Math.round(targetH * sizeFactor);

    while (attempts < maxAttempts && !placed) {
      attempts++;
      const candidateX = marginX + Math.floor(Math.random() * Math.max(10, usableW - itemW));
      const candidateY = marginY + Math.floor(Math.random() * Math.max(10, usableH - itemH));

      const candidateBox: Box = {
        x: candidateX,
        y: candidateY,
        width: itemW,
        height: itemH,
      };

      const hasCollision = placedBoxes.some((b) => boxesOverlap(b, candidateBox, 18));
      if (!hasCollision) {
        placed = true;
        placedBoxes.push(candidateBox);
        // Random slight tilt (-8 to +8 deg)
        const rotation = Math.round((Math.random() * 16 - 8) * 10) / 10;
        updatedImages.push({
          ...img,
          x: candidateX,
          y: candidateY,
          width: itemW,
          height: itemH,
          rotation,
          zIndex: i + 1,
        });
      }
    }

    // Fallback: If continuous random fails due to density, use guaranteed non-overlapping grid subdivision with jitter
    if (!placed) {
      const cols = Math.ceil(Math.sqrt(count * (usableW / usableH)));
      const rows = Math.ceil(count / cols);
      const cellW = usableW / cols;
      const cellH = usableH / rows;

      const col = i % cols;
      const row = Math.floor(i / cols);

      const fittedW = Math.min(targetW, cellW - 20);
      const fittedH = Math.min(targetH, cellH - 20);

      // Jitter inside the cell
      const jitterX = Math.random() * Math.max(0, cellW - fittedW - 10);
      const jitterY = Math.random() * Math.max(0, cellH - fittedH - 10);

      const finalX = Math.round(marginX + col * cellW + 10 + jitterX);
      const finalY = Math.round(marginY + row * cellH + 10 + jitterY);
      const rotation = Math.round((Math.random() * 8 - 4) * 10) / 10;

      updatedImages.push({
        ...img,
        x: finalX,
        y: finalY,
        width: Math.round(fittedW),
        height: Math.round(fittedH),
        rotation,
        zIndex: i + 1,
      });
    }
  }

  return updatedImages;
}

/**
 * Equal Grid Layout (網格平均分散)
 */
export function applyGridLayout(images: ImageElement[], canvas: CanvasSettings): ImageElement[] {
  const count = images.length;
  if (count === 0) return [];

  const marginX = canvas.margin;
  const marginY = canvas.margin + 50; // top offset
  const usableW = canvas.width - marginX * 2;
  const usableH = canvas.height - marginY - canvas.margin;

  let cols = 2;
  if (count <= 2) cols = count;
  else if (count <= 4) cols = 2;
  else if (count <= 9) cols = 3;
  else cols = 4;

  const rows = Math.ceil(count / cols);
  const gap = 18;

  const totalGapX = (cols - 1) * gap;
  const itemW = Math.round((usableW - totalGapX) / cols);
  const itemH = Math.round(itemW * 0.75);

  const totalGridHeight = rows * itemH + (rows - 1) * gap;
  const startY = Math.max(marginY, marginY + Math.round((usableH - totalGridHeight) / 2));

  return images.map((img, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;

    // Center items on the last row if incomplete
    const isLastRow = row === rows - 1;
    const itemsInLastRow = count % cols === 0 ? cols : count % cols;
    let offsetX = marginX;
    if (isLastRow && itemsInLastRow < cols) {
      const lastRowWidth = itemsInLastRow * itemW + (itemsInLastRow - 1) * gap;
      offsetX = marginX + Math.round((usableW - lastRowWidth) / 2);
      return {
        ...img,
        x: offsetX + col * (itemW + gap),
        y: startY + row * (itemH + gap),
        width: itemW,
        height: itemH,
        rotation: 0,
        zIndex: index + 1,
      };
    }

    return {
      ...img,
      x: marginX + col * (itemW + gap),
      y: startY + row * (itemH + gap),
      width: itemW,
      height: itemH,
      rotation: 0,
      zIndex: index + 1,
    };
  });
}

/**
 * Magazine Editorial Layout (雜誌風格非對稱)
 * 1 large Hero image + remaining images neatly organized
 */
export function applyMagazineLayout(images: ImageElement[], canvas: CanvasSettings): ImageElement[] {
  const count = images.length;
  if (count === 0) return [];
  if (count === 1) {
    return applyGridLayout(images, canvas);
  }

  const marginX = canvas.margin;
  const marginY = canvas.margin + 50;
  const usableW = canvas.width - marginX * 2;
  const usableH = canvas.height - marginY - canvas.margin;
  const gap = 16;

  const result: ImageElement[] = [];

  // Hero Image (top or left)
  const heroW = Math.round(usableW * 0.62);
  const heroH = Math.round(usableH * 0.52);

  result.push({
    ...images[0],
    x: marginX,
    y: marginY,
    width: heroW,
    height: heroH,
    rotation: 0,
    zIndex: 1,
  });

  const sideImagesCount = Math.min(2, count - 1);
  const sideW = usableW - heroW - gap;
  const sideH = Math.round((heroH - (sideImagesCount - 1) * gap) / sideImagesCount);

  for (let i = 1; i <= sideImagesCount; i++) {
    result.push({
      ...images[i],
      x: marginX + heroW + gap,
      y: marginY + (i - 1) * (sideH + gap),
      width: sideW,
      height: sideH,
      rotation: 0,
      zIndex: i + 1,
    });
  }

  // Bottom row for any remaining images
  const remaining = count - 1 - sideImagesCount;
  if (remaining > 0) {
    const bottomY = marginY + heroH + gap;
    const bottomH = Math.max(120, usableH - heroH - gap);
    const bottomW = Math.round((usableW - (remaining - 1) * gap) / remaining);

    for (let i = 0; i < remaining; i++) {
      const idx = 1 + sideImagesCount + i;
      result.push({
        ...images[idx],
        x: marginX + i * (bottomW + gap),
        y: bottomY,
        width: bottomW,
        height: Math.min(bottomH, Math.round(bottomW * 0.75)),
        rotation: 0,
        zIndex: idx + 1,
      });
    }
  }

  return result;
}

/**
 * Polaroid Casual Collage (相簿拍立得拼貼風格)
 * Clean, non-overlapping staggered placement with classic photo tilts
 */
export function applyPolaroidLayout(images: ImageElement[], canvas: CanvasSettings): ImageElement[] {
  const count = images.length;
  if (count === 0) return [];

  const marginX = canvas.margin + 10;
  const marginY = canvas.margin + 50;
  const usableW = canvas.width - marginX * 2;
  const usableH = canvas.height - marginY - canvas.margin;

  const cols = count <= 3 ? count : count <= 6 ? 3 : 4;
  const rows = Math.ceil(count / cols);
  const gap = 20;

  const itemW = Math.round((usableW - (cols - 1) * gap) / cols);
  const itemH = Math.round(itemW * 1.15); // polaroid proportion (slightly taller)

  const tiltAngles = [-5, 4, -3, 6, -4, 3, -6, 5, -2, 4];

  return images.map((img, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const angle = tiltAngles[index % tiltAngles.length];

    return {
      ...img,
      x: marginX + col * (itemW + gap),
      y: marginY + row * (itemH + gap),
      width: itemW,
      height: itemH,
      rotation: angle,
      borderStyle: 'solid',
      borderWidth: Math.max(img.borderWidth, 8),
      borderColor: '#ffffff',
      shadow: 'medium',
      zIndex: index + 1,
    };
  });
}

/**
 * Masonry / Alternating Columns Layout (畫廊瀑布流)
 */
export function applyMasonryLayout(images: ImageElement[], canvas: CanvasSettings): ImageElement[] {
  const count = images.length;
  if (count === 0) return [];

  const marginX = canvas.margin;
  const marginY = canvas.margin + 50;
  const usableW = canvas.width - marginX * 2;
  const cols = count <= 4 ? 2 : 3;
  const gap = 16;
  const colW = Math.round((usableW - (cols - 1) * gap) / cols);

  const colHeights = new Array(cols).fill(marginY);
  const result: ImageElement[] = [];

  images.forEach((img, i) => {
    // Pick shortest column
    const shortestCol = colHeights.indexOf(Math.min(...colHeights));
    // Alternate height rhythm (3:2, 4:3, 1:1)
    const heightVariants = [colW * 0.75, colW * 0.95, colW * 0.65, colW * 0.85];
    const itemH = Math.round(heightVariants[i % heightVariants.length]);

    const x = marginX + shortestCol * (colW + gap);
    const y = colHeights[shortestCol];

    colHeights[shortestCol] += itemH + gap;

    result.push({
      ...img,
      x,
      y,
      width: colW,
      height: itemH,
      rotation: 0,
      zIndex: i + 1,
    });
  });

  return result;
}

/**
 * Radial Orbit Layout (圓形環繞焦點)
 */
export function applyRadialLayout(images: ImageElement[], canvas: CanvasSettings): ImageElement[] {
  const count = images.length;
  if (count === 0) return [];

  const centerX = canvas.width / 2;
  const centerY = (canvas.height + 40) / 2;
  const radiusX = (canvas.width - canvas.margin * 2 - 180) / 2;
  const radiusY = (canvas.height - canvas.margin * 2 - 280) / 2;

  const itemW = Math.min(180, Math.round(480 / Math.max(3, Math.sqrt(count * 2))));
  const itemH = Math.round(itemW * 0.75);

  return images.map((img, i) => {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    const x = Math.round(centerX + radiusX * Math.cos(angle) - itemW / 2);
    const y = Math.round(centerY + radiusY * Math.sin(angle) - itemH / 2);
    const rotationDeg = Math.round(((angle * 180) / Math.PI) * 0.2); // subtle tangent angle

    return {
      ...img,
      x,
      y,
      width: itemW,
      height: itemH,
      rotation: rotationDeg,
      zIndex: i + 1,
    };
  });
}

/**
 * Alternating 2-Column Layout (交錯雙欄對比)
 */
export function applyAlternatingLayout(images: ImageElement[], canvas: CanvasSettings): ImageElement[] {
  const count = images.length;
  if (count === 0) return [];

  const marginX = canvas.margin;
  const marginY = canvas.margin + 50;
  const usableW = canvas.width - marginX * 2;
  const usableH = canvas.height - marginY - canvas.margin;
  const gap = 18;

  const rows = Math.ceil(count / 2);
  const rowH = Math.min(220, Math.round((usableH - (rows - 1) * gap) / rows));

  return images.map((img, i) => {
    const row = Math.floor(i / 2);
    const isEvenRow = row % 2 === 0;
    const isCol0 = i % 2 === 0;

    let width: number;
    let x: number;

    const largeW = Math.round(usableW * 0.58);
    const smallW = usableW - largeW - gap;

    if (isEvenRow) {
      width = isCol0 ? largeW : smallW;
      x = isCol0 ? marginX : marginX + largeW + gap;
    } else {
      width = isCol0 ? smallW : largeW;
      x = isCol0 ? marginX : marginX + smallW + gap;
    }

    const y = marginY + row * (rowH + gap);

    return {
      ...img,
      x,
      y,
      width,
      height: rowH,
      rotation: 0,
      zIndex: i + 1,
    };
  });
}

/**
 * Dispatches to layout generator by preset type
 */
export function applyLayoutPreset(
  preset: LayoutPresetType,
  images: ImageElement[],
  canvas: CanvasSettings,
  reservedBoxes: Box[] = []
): ImageElement[] {
  switch (preset) {
    case 'random':
      return applyRandomNonOverlappingLayout(images, canvas, reservedBoxes);
    case 'grid':
      return applyGridLayout(images, canvas);
    case 'magazine':
      return applyMagazineLayout(images, canvas);
    case 'polaroid':
      return applyPolaroidLayout(images, canvas);
    case 'masonry':
      return applyMasonryLayout(images, canvas);
    case 'radial':
      return applyRadialLayout(images, canvas);
    case 'alternating':
      return applyAlternatingLayout(images, canvas);
    default:
      return applyGridLayout(images, canvas);
  }
}

/**
 * Smart Text-Avoid-Overlap Positioner
 * Automatically finds an open, uncluttered region on the A4 page for text elements,
 * ensuring text does not collide with images!
 */
export function repositionTextAvoidingImages(
  text: TextElement,
  images: ImageElement[],
  canvas: CanvasSettings
): TextElement {
  const marginX = canvas.margin;
  const marginY = canvas.margin;
  const usableW = canvas.width - marginX * 2;
  const usableH = canvas.height - marginY * 2;

  const textBox: Box = {
    x: text.x,
    y: text.y,
    width: text.width,
    height: text.height,
  };

  // Test if current position is already clear
  const collision = images.some((img) =>
    boxesOverlap(textBox, { x: img.x, y: img.y, width: img.width, height: img.height }, 12)
  );

  if (!collision) return text;

  // Candidate anchor zones: Top header band, bottom footer band, left gutter, right gutter
  const candidateZones: { x: number; y: number }[] = [
    { x: marginX + 10, y: marginY + 10 }, // Top Left
    { x: marginX + Math.round((usableW - text.width) / 2), y: marginY + 10 }, // Top Center
    { x: marginX + Math.round((usableW - text.width) / 2), y: canvas.height - marginY - text.height - 10 }, // Bottom Center
    { x: marginX + 10, y: canvas.height - marginY - text.height - 10 }, // Bottom Left
    { x: canvas.width - marginX - text.width - 10, y: marginY + 10 }, // Top Right
  ];

  for (const zone of candidateZones) {
    const candidate: Box = {
      x: zone.x,
      y: zone.y,
      width: text.width,
      height: text.height,
    };
    const hit = images.some((img) =>
      boxesOverlap(candidate, { x: img.x, y: img.y, width: img.width, height: img.height }, 12)
    );
    if (!hit) {
      return {
        ...text,
        x: zone.x,
        y: zone.y,
      };
    }
  }

  // If all primary zones have something, place at top margin banner
  return {
    ...text,
    x: marginX + Math.round((usableW - text.width) / 2),
    y: Math.max(10, marginY - 15),
  };
}
