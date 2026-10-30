// Turns raw screenshots (../assets-src/work) into small WebP files for the site.
// Desktop: top 1440×900 of the page → 1200 px wide. Mobile: 390×844 viewport (2× capture).
import sharp from 'sharp'
import { mkdirSync, existsSync } from 'node:fs'

const SRC = '../assets-src/work'
const OUT = 'public/work'
mkdirSync(OUT, { recursive: true })

for (const name of ['blr', 'ewall', 'chavisto']) {
  const d = `${SRC}/${name}-desktop.png`
  if (existsSync(d)) {
    await sharp(d).extract({ left: 0, top: 0, width: 1440, height: 900 }).resize(1200).webp({ quality: 78 }).toFile(`${OUT}/${name}-desktop.webp`)
  }
  const m = `${SRC}/${name}-mobile.png`
  if (existsSync(m) && name !== 'chavisto') {
    await sharp(m).extract({ left: 0, top: 0, width: 780, height: 1688 }).resize(390).webp({ quality: 80 }).toFile(`${OUT}/${name}-mobile.webp`)
  }
}
console.log('images built')
