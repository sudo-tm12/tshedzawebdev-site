// Shared request/response helpers: CORS for our own site only, JSON in and out,
// input cleaning, and a salted IP hash (rate limits without storing anyone's IP).
import type { Env } from './env'

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export function allowedOrigins(env: Env): string[] {
  return env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
}

export function corsHeaders(req: Request, env: Env): Record<string, string> {
  const origin = req.headers.get('Origin') ?? ''
  if (!origin || !allowedOrigins(env).includes(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
  }
}

export function json(status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra },
  })
}

export async function readJson(req: Request, maxBytes = 20000): Promise<Record<string, unknown>> {
  if (!(req.headers.get('Content-Type') ?? '').toLowerCase().startsWith('application/json')) throw new HttpError(415, 'JSON required')
  const raw = await req.text()
  if (raw.length > maxBytes) throw new HttpError(413, 'Request too large')
  let data: unknown
  try { data = JSON.parse(raw) } catch { throw new HttpError(400, 'Invalid JSON') }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new HttpError(400, 'Invalid JSON')
  return data as Record<string, unknown>
}

/** Strip control characters (keep tab and line breaks), trim, cap the length. */
export function cleanText(v: unknown, max: number): string {
  const s = typeof v === 'string' ? v : ''
  // eslint-disable-next-line no-control-regex
  return [...s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()].slice(0, max).join('')
}

/** One line only: blocks header injection in email subjects and names. */
export const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim()

export const isEmail = (s: string) => s.length <= 190 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)

export function h(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/** UTC timestamp in the database's format: 2026-11-08 18:30:24. */
export const nowSql = (d = new Date()) => d.toISOString().slice(0, 19).replace('T', ' ')

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')

export async function ipHash(req: Request, env: Env): Promise<string> {
  const ip = req.headers.get('CF-Connecting-IP') ?? '0.0.0.0'
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${env.IP_SALT}|${ip}`)))
}

export async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)))
}

/** Constant-time string comparison (for signed links). */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Sliding-window rate limit per hashed IP and action. */
export async function rateLimited(env: Env, ip: string, action: string, max: number, windowSeconds: number): Promise<boolean> {
  const since = nowSql(new Date(Date.now() - windowSeconds * 1000))
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM rate_events WHERE action = ? AND ip_hash = ? AND created_at > ?').bind(action, ip, since).first<{ n: number }>()
  if ((row?.n ?? 0) >= max) return true
  await env.DB.prepare('INSERT INTO rate_events (action, ip_hash, created_at) VALUES (?, ?, ?)').bind(action, ip, nowSql()).run()
  return false
}
