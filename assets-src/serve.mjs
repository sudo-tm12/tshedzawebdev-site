// Tiny static server for previewing builds: node serve.mjs <dir> <port>
// Mirrors static hosting: dir/ → dir/index.html, unknown paths → 404.html with status 404.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'

const [dir, port] = process.argv.slice(2)
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.txt': 'text/plain', '.xml': 'application/xml' }

async function resolveFile(urlPath) {
  let p = normalize(join(dir, decodeURIComponent(urlPath.split('?')[0].split('#')[0])))
  try { if ((await stat(p)).isDirectory()) p = join(p, 'index.html') } catch { if (!extname(p)) p += '.html' }
  return p
}

createServer(async (req, res) => {
  try {
    const p = await resolveFile(req.url)
    const body = await readFile(p)
    res.writeHead(200, { 'content-type': types[extname(p)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    try {
      const body = await readFile(join(dir, '404.html'))
      res.writeHead(404, { 'content-type': types['.html'] })
      res.end(body)
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('not found')
    }
  }
}).listen(Number(port), () => console.log('serving', dir, 'on', port))
