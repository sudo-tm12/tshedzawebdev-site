// Brand files. There is no icon mark: the browser/home-screen icon is the owner's
// existing favicon (assets-src/brand/favicon.png, from the live site), and the
// social card is type only.
import sharp from 'sharp'
import { rmSync } from 'node:fs'

const FAVICON = '../assets-src/brand/favicon.png'
await sharp(FAVICON).resize(512, 512, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#ffffff' }).png().toFile('public/icon.png')
await sharp(FAVICON).resize(180, 180, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#ffffff' }).png().toFile('public/apple-touch-icon.png')
rmSync('public/icon.svg', { force: true })   // the old invented "T" mark

// 1200×630 social card: navy, wordmark, tagline. Fonts: system fallbacks are fine at this size.
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><radialGradient id="g" cx="85%" cy="10%" r="60%"><stop offset="0" stop-color="#1DA1C2" stop-opacity=".35"/><stop offset="1" stop-color="#1DA1C2" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="630" fill="#0A1B2E"/><rect width="1200" height="630" fill="url(#g)"/>
  <text x="80" y="140" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="600" fill="#fff" letter-spacing="-1">Tshedza<tspan fill="#1DA1C2">WebDev</tspan></text>
  <text x="80" y="330" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="600" fill="#fff" letter-spacing="-2">Crafting exceptional</text>
  <text x="80" y="410" font-family="Georgia, serif" font-style="italic" font-size="76" fill="#1DA1C2">web experiences.</text>
  <text x="80" y="560" font-family="Consolas, monospace" font-size="22" fill="#9fb3c8">WEB STUDIO · PRETORIA · TSHEDZAWEBDEV.CO.ZA</text>
</svg>`
await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile('public/og.png')
console.log('brand assets built')
