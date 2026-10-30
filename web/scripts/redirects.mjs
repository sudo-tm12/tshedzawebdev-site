// Static redirect stubs for the old site's URLs (GitHub Pages / Cloudflare Pages
// have no server-side redirects). Each stub: canonical + meta refresh + JS + a link.
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const MAP = {
  'custom-websites.html': '/services/websites/',
  'ecommerce-solutions.html': '/services/ecommerce/',
  'faqs.html': '/faq/',
  'project.html': '/work/',
  'sales1.html': '/learn/',
}
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
for (const [from, path] of Object.entries(MAP)) {
  const to = BASE + path
  const html = `<!doctype html><html lang="en-ZA"><head><meta charset="utf-8"><title>Moved</title>
<link rel="canonical" href="https://tshedzawebdev.co.za${path}"><meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${to}"><script>location.replace(${JSON.stringify(to)} + location.hash)</script></head>
<body><p>This page has moved: <a href="${to}">continue to the new page</a>.</p></body></html>`
  const file = `out/${from}`
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}
// Custom domain only for the real-domain build; the sub-folder preview must not claim it.
if (!BASE) writeFileSync('out/CNAME', 'tshedzawebdev.co.za\n')
writeFileSync('out/.nojekyll', '')                    // let GitHub Pages serve the _next folder
console.log(`redirect stubs written${BASE ? ` (base ${BASE})` : ' + CNAME'}`)
