// Copies the single source of truth (../pricebook/pricebook.json) into the app
// and the PHP API before every dev/build, so both always price identically.
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const src = resolve(root, 'pricebook/pricebook.json')
for (const dest of [resolve(root, 'web/src/data/pricebook.json'), resolve(root, 'api/data/pricebook.json')]) {
  mkdirSync(dirname(dest), { recursive: true })
  copyFileSync(src, dest)
}
console.log('pricebook synced')
