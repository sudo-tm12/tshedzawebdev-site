// Checks every internal link and asset in the static build resolves to a real file.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
const OUT = 'out'
const pages = []
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith('.html')) pages.push(p) } }
walk(OUT)
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const resolveUrl = (u) => {
  if (BASE && !u.startsWith(BASE + '/')) return false   // every internal URL must carry the base path
  const path = u.slice(BASE.length).split('#')[0].split('?')[0]
  if (!path) return true
  const p = join(OUT, decodeURIComponent(path))
  return existsSync(p) && (statSync(p).isFile() || existsSync(join(p, 'index.html')))
}
let bad = 0, checked = 0
for (const page of pages) {
  const html = readFileSync(page, 'utf8')
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    checked++
    if (!resolveUrl(m[1])) { bad++; console.log('BROKEN', relative(OUT, page), '→', m[1]) }
  }
}
console.log(`${pages.length} pages, ${checked} internal links/assets checked, ${bad} broken`)
process.exit(bad ? 1 : 0)
