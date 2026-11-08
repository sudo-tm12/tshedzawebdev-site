// TshedzaWebDev API (Cloudflare Worker): the only server-side code for the public site.
//   POST /quote/send : verify the estimate, store the lead, email the PDF to client + owner
//   POST /contact    : store the message, email the owner
//   /wall...         : community wall (wall.ts)
// Plus a daily cron for retention (leads 24 months, unpublished wall notes 30 days).
import type { Env } from './env'
import { HttpError, allowedOrigins, corsHeaders, json, nowSql } from './http'
import { handleContact, handleQuote } from './quote'
import { handleWallHeart, handleWallList, handleWallModerate, handleWallPost } from './wall'

async function route(req: Request, env: Env): Promise<Response> {
  const path = new URL(req.url).pathname.replace(/\/+$/, '') || '/'
  // Opened from the owner's email, not from the site, so it sits before the origin check.
  if (path === '/wall/moderate' && (req.method === 'GET' || req.method === 'POST')) return handleWallModerate(req, env)

  const origin = req.headers.get('Origin')
  if (origin && !allowedOrigins(env).includes(origin)) return json(403, { error: 'Origin not allowed' })
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })
  if (req.method === 'GET' && path === '/wall') return handleWallList(env)
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })
  if (path === '/quote/send') return handleQuote(req, env)
  if (path === '/contact') return handleContact(req, env)
  if (path === '/wall/heart') return handleWallHeart(req, env)
  if (path === '/wall') return handleWallPost(req, env)
  return json(404, { error: 'Not found' })
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    let res: Response
    try {
      res = await route(req, env)
    } catch (e) {
      if (e instanceof HttpError) res = json(e.status, { error: e.message })
      else {
        console.error('[api]', e instanceof Error ? `${e.name}: ${e.message}` : e)   // no personal data in logs
        res = json(500, { error: 'Something went wrong. Please try WhatsApp instead.' })
      }
    }
    const headers = new Headers(res.headers)
    for (const [k, v] of Object.entries(corsHeaders(req, env))) headers.set(k, v)
    return new Response(res.body, { status: res.status, headers })
  },

  async scheduled(_event: ScheduledController, env: Env): Promise<void> {
    const ago = (ms: number) => nowSql(new Date(Date.now() - ms))
    await env.DB.batch([
      env.DB.prepare('DELETE FROM leads WHERE created_at < ?').bind(ago(730 * 86400000)),
      env.DB.prepare('DELETE FROM rate_events WHERE created_at < ?').bind(ago(2 * 86400000)),
      env.DB.prepare("DELETE FROM wall_notes WHERE status <> 'approved' AND created_at < ?").bind(ago(30 * 86400000)),
      env.DB.prepare('DELETE FROM outbox WHERE created_at < ?').bind(ago(7 * 86400000)),
    ])
  },
} satisfies ExportedHandler<Env>
