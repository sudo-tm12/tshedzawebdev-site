// Community wall: anyone can leave a short note; nothing is public until the owner approves it.
//   GET  /wall            : approved notes (newest first)
//   POST /wall            : submit a note (pending), email the owner approve/reject links
//   POST /wall/heart      : add or remove a heart (one per visitor per note)
//   GET  /wall/moderate   : confirmation page from the owner's email link (no change on GET,
//   POST /wall/moderate     so mail scanners that prefetch links cannot approve anything)
import type { Env } from './env'
import { HttpError, cleanText, h, hmacHex, ipHash, json, nowSql, oneLine, rateLimited, readJson, safeEqual } from './http'
import { emailLayout, p, sendMail, type Mail } from './mail'

const KINDS: Record<string, string> = { thanks: 'Thank you', encourage: 'Encouragement', idea: 'Idea', shoutout: 'Shout-out' }
const COLOURS = ['sun', 'mint', 'sky', 'rose', 'lilac']

interface NoteRow { id: number; name: string | null; place: string | null; message: string; kind: string; colour: string; hearts: number; created_at: string; status?: string }

const token = (env: Env, id: number, action: string) => hmacHex(env.WALL_SECRET, `wall|${id}|${action}`)

const publicNote = (r: NoteRow) => ({
  id: r.id, name: r.name || null, place: r.place || null, message: r.message, kind: r.kind, colour: r.colour,
  hearts: r.hearts, createdAt: `${r.created_at.replace(' ', 'T')}Z`,
})

export async function handleWallList(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT id, name, place, message, kind, colour, hearts, created_at FROM wall_notes WHERE status = 'approved' ORDER BY id DESC LIMIT 200").all<NoteRow>()
  return json(200, { notes: results.map(publicNote) }, { 'Cache-Control': 'public, max-age=30' })
}

export async function handleWallPost(req: Request, env: Env): Promise<Response> {
  const body = await readJson(req, 5000)
  if (body.website) return json(200, { ok: true, id: 0 })                             // honeypot
  if (body.consent !== true) throw new HttpError(422, 'Please tick the box so we may show your note.')

  const message = cleanText(body.message, 280)
  const name = oneLine(cleanText(body.name, 40))
  const place = oneLine(cleanText(body.place, 40))
  const kind = typeof body.kind === 'string' && body.kind in KINDS ? body.kind : 'encourage'
  const colour = typeof body.colour === 'string' && COLOURS.includes(body.colour) ? body.colour : 'sun'

  if ([...message].length < 3) throw new HttpError(422, 'Write a few words first.')
  // Keep the wall safe and spam-free: no links, emails or phone numbers on a public page.
  const all = `${message} ${name} ${place}`
  if (/(https?:\/\/|www\.|\b[\w.-]+\.(com|co\.za|net|org|io|xyz|link)\b)/i.test(all)) throw new HttpError(422, 'Links aren’t allowed on the wall. Please remove it and try again.')
  if (/[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(all)) throw new HttpError(422, 'Please leave out email addresses: the wall is public.')
  if (/(\+?\d[\s-]?){9,}/.test(all)) throw new HttpError(422, 'Please leave out phone numbers: the wall is public.')
  const ip = await ipHash(req, env)
  if (await rateLimited(env, ip, 'wall', 3, 3600)) throw new HttpError(429, 'You’ve left a few notes already. Please try again in an hour.')

  const res = await env.DB.prepare("INSERT INTO wall_notes (created_at, name, place, message, kind, colour, status, hearts, ip_hash) VALUES (?, ?, ?, ?, ?, ?, 'pending', 0, ?)")
    .bind(nowSql(), name || null, place || null, message, kind, colour, ip).run()
  const id = Number(res.meta.last_row_id)

  // If this email fails, the cron retries it (retry.ts) until owner_notified is set.
  if (await sendMail(env, await wallNoteMail(env, { id, name: name || null, place: place || null, message, kind }))) {
    await env.DB.prepare('UPDATE wall_notes SET owner_notified = 1 WHERE id = ?').bind(id).run()
  }
  return json(200, { ok: true, id })
}

/** The owner's email for a new note, with signed Approve / Reject links. Also used by the retry cron. */
export async function wallNoteMail(env: Env, n: Pick<NoteRow, 'id' | 'name' | 'place' | 'message' | 'kind'>): Promise<Mail> {
  const base = env.API_PUBLIC_URL.replace(/\/$/, '')
  const link = async (a: string) => `${base}/wall/moderate?id=${n.id}&a=${a}&t=${await token(env, n.id, a)}`
  const [approve, reject] = [await link('approve'), await link('reject')]
  const who = `${n.name || 'Anonymous'}${n.place ? `, ${n.place}` : ''}`
  return {
    to: env.OWNER_EMAIL,
    subject: `Wall note from ${who}`,
    html: emailLayout('New note for the wall',
      p(`${h(KINDS[n.kind] ?? 'Note')} · from ${h(who)}`, 'margin:0 0 8px;color:#5f6b7a')
      + p(h(n.message), 'margin:0 0 20px;font-size:18px;white-space:pre-wrap')
      + `<p style="margin:0"><a href="${h(approve)}" style="display:inline-block;background:#0a1b2e;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">Approve</a> `
      + `&nbsp; <a href="${h(reject)}" style="display:inline-block;color:#b42318;padding:12px 8px;text-decoration:none;font-weight:600">Reject</a></p>`),
    text: `${who} wrote:\n\n${n.message}\n\nApprove: ${approve}\nReject: ${reject}`,
  }
}

export async function handleWallHeart(req: Request, env: Env): Promise<Response> {
  const body = await readJson(req, 500)
  const id = Math.trunc(Number(body.id ?? 0))
  const on = body.on !== false
  const ip = await ipHash(req, env)
  if (await rateLimited(env, ip, 'heart', 120, 3600)) throw new HttpError(429, 'Slow down a little.')
  const note = await env.DB.prepare("SELECT hearts FROM wall_notes WHERE id = ? AND status = 'approved'").bind(id).first<{ hearts: number }>()
  if (!note) throw new HttpError(404, 'Note not found.')
  const has = await env.DB.prepare('SELECT 1 AS x FROM wall_hearts WHERE note_id = ? AND ip_hash = ?').bind(id, ip).first()
  if (on && !has) {
    await env.DB.batch([
      env.DB.prepare('INSERT INTO wall_hearts (note_id, ip_hash, created_at) VALUES (?, ?, ?)').bind(id, ip, nowSql()),
      env.DB.prepare('UPDATE wall_notes SET hearts = hearts + 1 WHERE id = ?').bind(id),
    ])
  } else if (!on && has) {
    await env.DB.batch([
      env.DB.prepare('DELETE FROM wall_hearts WHERE note_id = ? AND ip_hash = ?').bind(id, ip),
      env.DB.prepare('UPDATE wall_notes SET hearts = CASE WHEN hearts > 0 THEN hearts - 1 ELSE 0 END WHERE id = ?').bind(id),
    ])
  }
  const now = await env.DB.prepare('SELECT hearts FROM wall_notes WHERE id = ?').bind(id).first<{ hearts: number }>()
  return json(200, { hearts: now?.hearts ?? 0, on })
}

function page(status: number, title: string, body: string): Response {
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${h(title)}</title>`
    + '<body style="margin:0;background:#fafaf7;font-family:Segoe UI,Arial,sans-serif;color:#0a1b2e"><main style="max-width:520px;margin:48px auto;padding:0 16px">'
    + `<p style="font-weight:600">Tshedza<span style="color:#1da1c2">WebDev</span> · Wall</p>${body}</main>`
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'", 'X-Content-Type-Options': 'nosniff',
    },
  })
}

export async function handleWallModerate(req: Request, env: Env): Promise<Response> {
  const post = req.method === 'POST'
  const src = post ? new URLSearchParams(await req.text()) : new URL(req.url).searchParams
  const id = Math.trunc(Number(src.get('id') ?? 0))
  const a = src.get('a') ?? ''
  const t = src.get('t') ?? ''
  if (!['approve', 'reject'].includes(a) || !safeEqual(await token(env, id, a), t)) return page(403, 'Link not valid', '<h1>This link is not valid.</h1>')
  const n = await env.DB.prepare('SELECT * FROM wall_notes WHERE id = ?').bind(id).first<NoteRow>()
  if (!n) return page(404, 'Not found', '<h1>This note no longer exists.</h1>')

  const card = `<blockquote style="margin:16px 0;padding:20px;background:#fff;border:1px solid #e4e7ec;border-radius:14px;font-size:18px;line-height:1.5;white-space:pre-wrap">${h(n.message)}`
    + `<footer style="margin-top:10px;font-size:14px;color:#5f6b7a">${h(`${n.name || 'Anonymous'}${n.place ? `, ${n.place}` : ''}`)}</footer></blockquote>`
  if (post) {
    await env.DB.prepare('UPDATE wall_notes SET status = ?, approved_at = ? WHERE id = ?').bind(a === 'approve' ? 'approved' : 'rejected', a === 'approve' ? nowSql() : null, id).run()
    return page(200, 'Done', `<h1>${a === 'approve' ? 'Approved. It’s on the wall.' : 'Rejected. It will not be shown.'}</h1>${card}`)
  }
  const label = a === 'approve' ? 'Approve and publish' : 'Reject this note'
  return page(200, label, `<h1>${h(label)}?</h1><p style="color:#5f6b7a">Currently: ${h(n.status ?? '')}</p>${card}`
    + `<form method="post"><input type="hidden" name="id" value="${id}"><input type="hidden" name="a" value="${h(a)}"><input type="hidden" name="t" value="${h(t)}">`
    + `<button style="font:inherit;font-weight:600;padding:12px 20px;border:0;border-radius:10px;cursor:pointer;color:#fff;background:${a === 'approve' ? '#0a1b2e' : '#b42318'}">${h(label)}</button></form>`)
}
