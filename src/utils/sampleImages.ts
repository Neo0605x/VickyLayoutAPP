/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Imported local generated high-res images
import archImg from '../assets/images/a4_arch_sample_1790993704845.jpg';
import natureImg from '../assets/images/a4_nature_sample_1790993716584.jpg';
import cafeImg from '../assets/images/a4_cafe_sample_1790993728173.jpg';
import botanicImg from '../assets/images/a4_botanic_sample_1790993738136.jpg';

export const SAMPLE_PRESET_IMAGES: { url: string; title: string }[] = [
  { url: archImg, title: '建築空間構圖' },
  { url: natureImg, title: '晨霧雲嶺風光' },
  { url: cafeImg, title: '靜謐午後讀書' },
  { url: botanicImg, title: '露珠葉影植栽' },
  // Procedural elegant SVG photography / graphic art tiles for remaining slots
  {
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2d3748" />
            <stop offset="50%" stop-color="#1a202c" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#fbbf24" />
            <stop offset="100%" stop-color="#d97706" />
          </linearGradient>
        </defs>
        <rect width="600" height="450" fill="url(#g1)" />
        <circle cx="300" cy="225" r="130" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.6" />
        <circle cx="300" cy="225" r="90" fill="none" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.4" />
        <polygon points="300,140 370,270 230,270" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.8" />
        <text x="300" y="380" fill="#f8fafc" font-size="20" font-family="'Plus Jakarta Sans', sans-serif" letter-spacing="4" text-anchor="middle">GEOMETRIC ESSENCE</text>
        <text x="300" y="405" fill="#94a3b8" font-size="12" font-family="sans-serif" letter-spacing="2" text-anchor="middle">A4 MINIMALIST STUDY</text>
      </svg>
    `)}`,
    title: '幾何美學構圖'
  },
  {
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
        <defs>
          <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fef3c7" />
            <stop offset="60%" stop-color="#fde68a" />
            <stop offset="100%" stop-color="#f59e0b" />
          </linearGradient>
        </defs>
        <rect width="600" height="450" fill="url(#sky)" />
        <circle cx="300" cy="180" r="70" fill="#ea580c" opacity="0.85" />
        <path d="M0,450 L140,280 L280,450 Z" fill="#78350f" opacity="0.7" />
        <path d="M190,450 L350,230 L510,450 Z" fill="#451a03" opacity="0.9" />
        <path d="M400,450 L520,320 L600,450 Z" fill="#78350f" opacity="0.6" />
        <text x="300" y="420" fill="#fffbeb" font-size="16" font-family="'Noto Serif TC', serif" letter-spacing="3" text-anchor="middle">落日峰影 · 暖陽餘暉</text>
      </svg>
    `)}`,
    title: '夕陽山岳剪影'
  },
  {
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
        <defs>
          <linearGradient id="ocean" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
        </defs>
        <rect width="600" height="450" fill="url(#ocean)" />
        <path d="M0,280 Q150,220 300,280 T600,280 L600,450 L0,450 Z" fill="#0369a1" opacity="0.5" />
        <path d="M0,330 Q150,280 300,330 T600,330 L600,450 L0,450 Z" fill="#0284c7" opacity="0.4" />
        <path d="M0,380 Q150,340 300,380 T600,380 L600,450 L0,450 Z" fill="#38bdf8" opacity="0.3" />
        <circle cx="450" cy="120" r="40" fill="#bae6fd" opacity="0.8" />
        <text x="300" y="220" fill="#f0f9ff" font-size="22" font-family="'Cinzel', serif" letter-spacing="5" text-anchor="middle">OCEAN HORIZON</text>
        <text x="300" y="245" fill="#7dd3fc" font-size="12" font-family="sans-serif" letter-spacing="2" text-anchor="middle">COASTAL SERENITY</text>
      </svg>
    `)}`,
    title: '蔚藍海岸微瀾'
  },
  {
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
        <rect width="600" height="450" fill="#18181b" />
        <rect x="40" y="40" width="520" height="370" fill="none" stroke="#e4e4e7" stroke-width="1" />
        <line x1="40" y1="40" x2="560" y2="410" stroke="#71717a" stroke-width="0.7" stroke-dasharray="4,4" />
        <line x1="40" y1="410" x2="560" y2="40" stroke="#71717a" stroke-width="0.7" stroke-dasharray="4,4" />
        <circle cx="300" cy="225" r="60" fill="#e11d48" opacity="0.9" />
        <text x="300" y="232" fill="#ffffff" font-size="14" font-weight="bold" font-family="'JetBrains Mono', monospace" text-anchor="middle">DESIGN 08</text>
        <text x="300" y="340" fill="#a1a1aa" font-size="12" font-family="sans-serif" letter-spacing="3" text-anchor="middle">EXHIBITION POSTER</text>
      </svg>
    `)}`,
    title: '前衛當代藝術'
  }
];

export function getSampleImage(index: number): { url: string; title: string } {
  const item = SAMPLE_PRESET_IMAGES[index % SAMPLE_PRESET_IMAGES.length];
  return {
    url: item.url,
    title: `${item.title} #${index + 1}`
  };
}
