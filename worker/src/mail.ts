// Email: always from our own domain, the visitor only ever in Reply-To.
// Production sends through Resend (https://resend.com); MAIL_TRANSPORT = "outbox" stores
// each message (with its attachment) in the outbox table instead, for local testing.
import type { Env } from './env'
import { h, nowSql, oneLine } from './http'

export interface Mail {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  attachment?: { name: string; data: Uint8Array }
}

export function toBase64(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

export async function sendMail(env: Env, m: Mail): Promise<boolean> {
  const subject = oneLine(m.subject)
  const attachment = m.attachment ? { filename: m.attachment.name.replace(/[^A-Za-z0-9._-]/g, ''), content: toBase64(m.attachment.data) } : null
  try {
    if (env.MAIL_TRANSPORT === 'outbox') {
      await env.DB.prepare('INSERT INTO outbox (created_at, to_addr, reply_to, subject, html, text, attachment_name, attachment_b64) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(nowSql(), m.to, m.replyTo ?? null, subject, m.html, m.text, attachment?.filename ?? null, attachment?.content ?? null).run()
      return true
    }
    if (!env.RESEND_API_KEY) { console.error('[mail] RESEND_API_KEY is not set'); return false }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.MAIL_FROM, to: [m.to], subject, html: m.html, text: m.text,
        ...(m.replyTo ? { reply_to: m.replyTo } : {}),
        ...(attachment ? { attachments: [attachment] } : {}),
      }),
    })
    if (!res.ok) console.error('[mail] Resend refused', res.status, (await res.text()).slice(0, 300))
    return res.ok
  } catch (e) {
    console.error('[mail] send failed', e instanceof Error ? e.message : e)
    return false
  }
}

/** A simple, robust HTML email in our brand (tables, inline styles: works in every client). */
export function emailLayout(title: string, inner: string): string {
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#fafaf7;font-family:Segoe UI,Arial,sans-serif;color:#0a1b2e">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">'
    + '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border:1px solid #e4e7ec;border-radius:14px">'
    + '<tr><td style="background:#0a1b2e;border-radius:14px 14px 0 0;padding:20px 28px;color:#fff;font-weight:600;font-size:16px">Tshedza<span style="color:#1da1c2">WebDev</span></td></tr>'
    + `<tr><td style="padding:28px"><h1 style="margin:0 0 12px;font-size:22px;line-height:1.25">${h(title)}</h1>${inner}</td></tr>`
    + '<tr><td style="padding:18px 28px;border-top:1px solid #e4e7ec;color:#5f6b7a;font-size:12px">TshedzaWebDev · Pretoria · info@tshedzawebdev.co.za · WhatsApp 069 951 3836<br>All prices in South African rand</td></tr>'
    + '</table></td></tr></table></body></html>'
}

export const p = (html: string, style = '') => `<p style="margin:0 0 12px;line-height:1.6;${style}">${html}</p>`
