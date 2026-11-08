// Email retries (runs from the cron every 15 minutes).
// When an email fails (Resend down, the domain not verified yet, ...) the site tells the visitor
// "we'll email it to you shortly". This keeps that promise: anything that didn't go out is sent
// again, for up to 3 days. Rows younger than 5 minutes are left to the request that created them.
import { PRICEBOOK, computeEstimate, type Selection } from '../../web/src/lib/quote/engine'
import type { Env } from './env'
import { nowSql } from './http'
import { sendMail } from './mail'
import { buildEstimatePdf } from './pdf'
import { contactMail, estimateMails } from './quote'
import { wallNoteMail } from './wall'

const WINDOW_MS = 3 * 86400000
const SETTLE_MS = 5 * 60000
const BATCH = 10

interface LeadRow {
  ref: string; kind: 'estimate' | 'contact'; created_at: string; name: string; email: string
  phone: string | null; business: string | null; message: string | null; selection_json: string | null
  one_off: number | null; monthly: number | null; low: number | null; high: number | null
  consent_version: string; email_client_sent: number; email_owner_sent: number
}

export async function retryEmails(env: Env): Promise<void> {
  const from = nowSql(new Date(Date.now() - WINDOW_MS))
  const to = nowSql(new Date(Date.now() - SETTLE_MS))

  const { results: leads } = await env.DB.prepare(`SELECT ref, kind, created_at, name, email, phone, business, message, selection_json,
      one_off, monthly, low, high, consent_version, email_client_sent, email_owner_sent
    FROM leads
    WHERE ((kind = 'estimate' AND (email_client_sent = 0 OR email_owner_sent = 0)) OR (kind = 'contact' AND email_owner_sent = 0))
      AND created_at BETWEEN ? AND ?
    ORDER BY id LIMIT ${BATCH}`).bind(from, to).all<LeadRow>()
  for (const row of leads) {
    try {
      if (row.kind === 'contact') await retryContact(env, row)
      else await retryEstimate(env, row)
    } catch (e) {
      console.error('[retry]', row.ref, e instanceof Error ? e.message : e)
    }
  }

  const { results: notes } = await env.DB.prepare(`SELECT id, name, place, message, kind FROM wall_notes
    WHERE status = 'pending' AND owner_notified = 0 AND created_at BETWEEN ? AND ?
    ORDER BY id LIMIT ${BATCH}`).bind(from, to).all<{ id: number; name: string | null; place: string | null; message: string; kind: string }>()
  for (const n of notes) {
    if (await sendMail(env, await wallNoteMail(env, n))) await env.DB.prepare('UPDATE wall_notes SET owner_notified = 1 WHERE id = ?').bind(n.id).run()
  }
  if (leads.length || notes.length) console.log(`[retry] tried ${leads.length} lead(s), ${notes.length} wall note(s)`)
}

async function retryContact(env: Env, row: LeadRow): Promise<void> {
  const sent = await sendMail(env, contactMail(env, { name: row.name, email: row.email, phone: row.phone ?? '', notes: row.message ?? '' }))
  if (sent) await env.DB.prepare('UPDATE leads SET email_owner_sent = 1 WHERE ref = ?').bind(row.ref).run()
}

async function retryEstimate(env: Env, row: LeadRow): Promise<void> {
  const sel = JSON.parse(row.selection_json ?? '{}') as Selection
  const est = computeEstimate(sel)
  // Never email numbers other than the ones the visitor saw: if prices changed since, give up
  // (-1) and leave it to a personal follow-up (the lead is still in the database).
  if (est.oneOff !== row.one_off || est.monthly !== row.monthly || est.low !== row.low || est.high !== row.high) {
    console.error('[retry]', row.ref, 'prices changed since the request; not re-sending')
    await env.DB.prepare('UPDATE leads SET email_client_sent = CASE WHEN email_client_sent = 0 THEN -1 ELSE email_client_sent END, email_owner_sent = CASE WHEN email_owner_sent = 0 THEN -1 ELSE email_owner_sent END WHERE ref = ?').bind(row.ref).run()
    return
  }
  const service = PRICEBOOK.services.find((s) => s.id === sel.service)!
  const tier = service.tiers.find((t) => t.id === sel.tier)!
  const contact = { name: row.name, email: row.email, phone: row.phone ?? '', business: row.business ?? '', notes: row.message ?? '' }
  // Dated as of the original request, so "valid until" matches what the visitor was promised.
  const created = new Date(`${row.created_at.replace(' ', 'T')}Z`)
  const pdf = await buildEstimatePdf(row.ref, contact, service, tier, est, PRICEBOOK, sel, created)
  const mails = estimateMails(env, { ref: row.ref, contact, service, tier, est, stamp: row.created_at, consentVersion: row.consent_version, pdf })
  const [client, owner] = await Promise.all([
    row.email_client_sent ? true : sendMail(env, mails.client),
    row.email_owner_sent ? true : sendMail(env, mails.owner),
  ])
  await env.DB.prepare('UPDATE leads SET email_client_sent = ?, email_owner_sent = ? WHERE ref = ?')
    .bind(row.email_client_sent || (client ? 1 : 0), row.email_owner_sent || (owner ? 1 : 0), row.ref).run()
}
