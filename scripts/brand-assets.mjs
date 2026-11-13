// Generates the brand assets from the Carinova logo:
//   src/assets/images/carinova-logo.jpeg   (copy of the source logo, optimized by Astro at build time)
//   src/assets/images/og-default.jpg       (1200×630 social share image: logo centred on the logo's navy)
//   src/assets/favicons/favicon.svg        (orange globe on navy, drawn by hand)
//   src/assets/favicons/favicon.ico        (16/32/48 px, PNG-in-ICO)
//   src/assets/favicons/apple-touch-icon.png (180×180)
//
// Usage: node scripts/brand-assets.mjs <path-to-logo.jpeg>
// Re-run it when Carinova sends the final logo files.

import { copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logoPath = process.argv[2];
if (!logoPath) {
  console.error('Usage: node scripts/brand-assets.mjs <path-to-logo.jpeg>');
  process.exit(1);
}

const NAVY = '#06172F';
const ORANGE = '#FF8A00';

const globe = (stroke) => `
  <g fill="none" stroke="${ORANGE}" stroke-width="${stroke}" stroke-linecap="round">
    <circle cx="32" cy="32" r="19"/>
    <ellipse cx="32" cy="32" rx="8.5" ry="19"/>
    <path d="M13 32h38M16 22.5h32M16 41.5h32"/>
  </g>`;

// Rounded tile for browser tabs; square tile for iOS, which applies its own mask.
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${NAVY}"/>${globe(4)}</svg>\n`;
const squareSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${NAVY}"/>${globe(3.5)}</svg>`;

const out = (p) => path.join(root, p);

// 1. Logo copy
await copyFile(logoPath, out('src/assets/images/carinova-logo.jpeg'));

// 2. Social share image: fill with the logo's own edge colour so the seam is invisible.
const logo = sharp(logoPath);
const { width: lw = 0 } = await logo.metadata();
// stats() reads the pipeline's input, not the extract, so measure a materialized strip.
const edgeStrip = await sharp(logoPath).extract({ left: 0, top: 0, width: lw, height: 8 }).png().toBuffer();
const edge = await sharp(edgeStrip).stats();
const [r, g, b] = edge.channels.map((c) => Math.round(c.mean));
const logoTile = await sharp(logoPath).resize(600, 600).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: { r, g, b } } })
  .composite([{ input: logoTile, left: 300, top: 15 }])
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(out('src/assets/images/og-default.jpg'));

// 3. Favicons
await writeFile(out('src/assets/favicons/favicon.svg'), faviconSvg);
await sharp(Buffer.from(squareSvg), { density: 300 })
  .resize(180, 180)
  .png()
  .toFile(out('src/assets/favicons/apple-touch-icon.png'));

const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((s) => sharp(Buffer.from(faviconSvg), { density: 300 }).resize(s, s).png().toBuffer())
);
// ICO container: 6-byte header, one 16-byte entry per image, then the PNG payloads.
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0);
  e.writeUInt8(s, 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(pngs[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return e;
});
await writeFile(out('src/assets/favicons/favicon.ico'), Buffer.concat([header, ...entries, ...pngs]));

console.log(`Brand assets written (share-image fill rgb(${r} ${g} ${b})).`);
