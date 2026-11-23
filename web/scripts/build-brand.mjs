// Brand files for the site, from the brand kit (tshedzawebdev-brand repo, kit/marks; copied into
// assets-src/brand/). The icon is "T, the beam, W" (owner's decision, 23 Nov 2026).
//   node scripts/build-brand.mjs   -> public/icon.png, apple-touch-icon.png, favicon.ico, og.png
import sharp from 'sharp'
import { copyFileSync } from 'node:fs'

const SRC = '../assets-src/brand'
copyFileSync(`${SRC}/icon-512.png`, 'public/icon.png')                     // rounded navy tile, 512 px
copyFileSync(`${SRC}/apple-touch-icon-180.png`, 'public/apple-touch-icon.png') // square: iOS rounds it itself
copyFileSync(`${SRC}/favicon.ico`, 'public/favicon.ico')                    // the small cut: 16, 32 and 48 px

// 1200×630 social card: navy, the wordmark (the real file), the line, the address.
const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><radialGradient id="g" cx="85%" cy="10%" r="60%"><stop offset="0" stop-color="#1DA1C2" stop-opacity=".35"/><stop offset="1" stop-color="#1DA1C2" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="630" fill="#0A1B2E"/><rect width="1200" height="630" fill="url(#g)"/>
  <text x="80" y="330" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="600" fill="#fff" letter-spacing="-2">Crafting exceptional</text>
  <text x="80" y="410" font-family="Georgia, serif" font-style="italic" font-size="76" fill="#1DA1C2">web experiences.</text>
  <text x="80" y="560" font-family="Consolas, monospace" font-size="22" fill="#9fb3c8">WEB STUDIO · PRETORIA · TSHEDZAWEBDEV.CO.ZA</text>
</svg>`
const mark = await sharp(`${SRC}/wordmark-on-dark.png`).resize({ width: 430 }).png().toBuffer()
await sharp(Buffer.from(bg)).composite([{ input: mark, left: 58, top: 78 }]).png({ compressionLevel: 9 }).toFile('public/og.png')
console.log('brand assets built')
