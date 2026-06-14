// Генерує PWA-іконки з SVG за допомогою sharp.
// Запуск: node scripts/gen-icons.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const OUT = fileURLToPath(new URL('../public/icons/', import.meta.url));
await mkdir(OUT, { recursive: true });

const TEAL = '#0b7a75';
const LINE = '#eafffb';
const DARK = '#0c1417';

// Логотип-капнограма як SVG-рядок із заданим розміром фону.
function logoSvg(size, { bg, pad }) {
  const inner = size - pad * 2;
  // Координатна сітка хвилі в межах внутрішнього квадрата.
  const w = inner;
  const x = (f) => pad + f * w;
  const y = (f) => pad + f * w;
  const stroke = Math.max(6, Math.round(inner * 0.06));
  const path =
    `M${x(0.06)} ${y(0.64)} H${x(0.3)} ` +
    `C${x(0.37)} ${y(0.64)} ${x(0.38)} ${y(0.26)} ${x(0.45)} ${y(0.26)} ` +
    `H${x(0.53)} ` +
    `C${x(0.6)} ${y(0.26)} ${x(0.61)} ${y(0.64)} ${x(0.68)} ${y(0.64)} ` +
    `H${x(0.94)}`;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      `<rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="${bg}"/>` +
      `<path d="${path}" fill="none" stroke="${LINE}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>` +
      `</svg>`,
  );
}

async function render(name, size, opts) {
  await sharp(logoSvg(size, opts)).png().toFile(join(OUT, name));
  console.log('✓', name, size);
}

// Стандартні іконки (логотип займає майже всю площу).
await render('icon-192.png', 192, { bg: TEAL, pad: 16 });
await render('icon-512.png', 512, { bg: TEAL, pad: 40 });
// Maskable — лого в безпечній зоні (~80%), суцільний фон до країв.
await render('icon-maskable-512.png', 512, { bg: TEAL, pad: 96 });
// Apple також користується 192. Темний варіант не потрібен.
console.log('Done. Icons in public/icons/');
