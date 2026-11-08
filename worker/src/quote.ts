// POST /quote/send and POST /contact.
// The estimate is recomputed with the same engine the website uses (web/src/lib/quote),
// so a tampered price can never be emailed: any mismatch returns 409.
import { PRICEBOOK, QuoteError, computeEstimate, rand, type Selection } from '../../web/src/lib/quote/engine'
import type { Env } from './env'
import { HttpError, cleanText, h, ipHash, isEmail, json, nowSql, oneLine, rateLimited, readJson } from './http'
import { emailLayout, p, sendMail } from './mail'
import { buildEstimatePdf } from './pdf'

const CONSENT_VERSIONS = ['2026-10-29']

interface Contact { name: string; email: string; phone: string; business: string; notes: string }

function validateContact(c: Record<string, unknown>, needsMessage: boolean): Contact {
  const out: Contact = {
    name: oneLine(cleanText(c.name, 120)),
    email: oneLine(cleanText(c.email, 190)),
    phone: oneLine(cleanText(c.phone, 40)),
    business: oneLine(cleanText(c.business, 160)),
    notes: cleanText(c.notes ?? c.message, 3000),
  }
  if ([...out.name].length < 2) throw new HttpError(422, 'Please enter your name.')
  if (!isEmail(out.email)) throw new HttpError(422, 'Please enter a valid email address.')
  if (out.phone && !/^[+\d][\d\s()-]{8,}$/.test(out.phone)) throw new HttpError(422, 'Please check the phone number.')
  if (needsMessage && [...out.notes].length < 10) throw new HttpError(422, 'Please tell us a little more.')
  return out
}

function readSelection(s: Record<string, unknown>): Selection {
  const addons: Record<string, number> = {}
  if (s.addons && typeof s.addons === 'object' && !Array.isArray(s.addons)) {
    for (const [k, v] of Object.entries(s.addons as Record<string, unknown>)) if (typeof v === 'number' && Number.isFinite(v)) addons[k] = v
  }
  return {
    service: String(s.service ?? ''),
    tier: String(s.tier ?? ''),
    units: typeof s.units === 'number' && Number.isFinite(s.units) ? s.units : 1,
    addons,
    monthly: Array.isArray(s.monthly) ? s.monthly.filter((m): m is string => typeof m === 'string') : [],
    priority: s.priority === true,
  }
}

export async function handleQuote(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const body = await readJson(req)
  if (body.website) return json(200, { ref: 'EST-0' })                                 // honeypot: pretend success
  if (body.consent !== true || !CONSENT_VERSIONS.includes(String(body.consentVersion))) throw new HttpError(422, 'Consent is required.')
  const ip = await ipHash(req, env)
  if (await rateLimited(env, ip, 'quote', 5, 3600)) throw new HttpError(429, 'Too many requests. Please try again later or WhatsApp us.')

  const contact = validateContact((body.contact ?? {}) as Record<string, unknown>, false)
  const sel = readSelection((body.selection ?? {}) as Record<string, unknown>)
  let est
  try { est = computeEstimate(sel) } catch (e) { if (e instanceof QuoteError) throw new HttpError(422, 'Unknown selection.'); throw e }

  // The browser's numbers must match the server's own calculation exactly.
  const claimed = (body.estimate ?? {}) as Record<string, unknown>
  for (const k of ['oneOff', 'monthly', 'low', 'high'] as const) {
    if (Number(claimed[k]) !== est[k]) throw new HttpError(409, 'Prices have been updated. Please refresh the page and try again.')
  }

  const service = PRICEBOOK.services.find((s) => s.id === sel.service)!
  const tier = service.tiers.find((t) => t.id === sel.tier)!
  const now = new Date()
  const stamp = nowSql(now)
  // The yearly reference (EST-2026-0001) is assigned inside the same INSERT: one round trip.
  const prefix = `EST-${now.getUTCFullYear()}-`
  const row = await env.DB.prepare(`INSERT INTO leads (ref, kind, created_at, name, email, phone, business, message, service_id, selection_json, one_off, monthly, low, high, deposit, weeks, pricebook_version, consent_at, consent_version, ip_hash)
    VALUES (?1 || printf('%04d', (SELECT COALESCE(MAX(CAST(substr(ref, length(?1) + 1) AS INTEGER)), 0) + 1 FROM leads WHERE ref LIKE ?1 || '%')),
      'estimate', ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)
    RETURNING ref`)
    .bind(prefix, stamp, contact.name, contact.email, contact.phone || null, contact.business || null, contact.notes || null, sel.service, JSON.stringify(sel),
      est.oneOff, est.monthly, est.low, est.high, est.deposit, est.weeks, est.pricebookVersion, stamp, String(body.consentVersion), ip).first<{ ref: string }>()
  const ref = row!.ref

  const pdf = await buildEstimatePdf(ref, contact, service, tier, est, PRICEBOOK, sel, now)
  const attachment = { name: `TshedzaWebDev-estimate-${ref}.pdf`, data: pdf }
  const range = est.oneOff > 0 ? `${rand(est.low)} – ${rand(est.high)}` : ''
  const monthly = est.monthly > 0 ? `${rand(est.monthly)}/month` : ''
  const headline = [range, monthly].filter(Boolean).join(' + ')
  const weeks = `${est.weeks} week${est.weeks === 1 ? '' : 's'}`

  const clientMail = sendMail(env, {
    to: contact.email,
    subject: `Your TshedzaWebDev estimate ${ref}`,
    html: emailLayout(`Your estimate ${ref}`,
      p(`Hi ${h(contact.name)},`)
      + p(`Thank you for using our instant quote. Your estimate for <strong>${h(`${service.name}: ${tier.name}`)}</strong> is <strong>${h(headline)}</strong>, with an estimated timeline of about ${weeks}.`)
      + p('The full breakdown is attached as a PDF. We will be in touch to talk it through. Or reply to this email or WhatsApp us on 069 951 3836 any time.')
      + p('Grateful for the chance to help,<br>Tshedza · TshedzaWebDev', 'margin:0')),
    text: `Hi ${contact.name},\n\nYour estimate ${ref} for ${service.name}: ${tier.name} is ${headline}, about ${weeks}.\nThe full breakdown is attached.\n\nGrateful for the chance to help,\nTshedza · TshedzaWebDev\nWhatsApp 069 951 3836`,
    replyTo: env.OWNER_EMAIL,
    attachment,
  })
  const ownerHtml = emailLayout(`New estimate ${ref}`,
    p(`<strong>${h(contact.name)}</strong>${contact.business ? ` · ${h(contact.business)}` : ''}<br>${h(contact.email)}${contact.phone ? ` · ${h(contact.phone)}` : ''}`)
    + p(`${h(`${service.name}: ${tier.name}`)}<br><strong>${h(headline)}</strong> · deposit ${h(rand(est.deposit))} · ${est.weeks} wk`)
    + (contact.notes ? p(h(contact.notes), 'white-space:pre-wrap') : '')
    + p(`Consent recorded ${h(stamp)} UTC (v${h(String(body.consentVersion))}). PDF attached.`, 'color:#5f6b7a;font-size:12px;margin:0'))
  const ownerMail = sendMail(env, {
    to: env.OWNER_EMAIL,
    subject: `New estimate ${ref}: ${contact.name} (${service.name})`,
    html: ownerHtml,
    text: `${contact.name}${contact.business ? ` · ${contact.business}` : ''}\n${contact.email} ${contact.phone}\n\n${service.name}: ${tier.name}\n${headline} · deposit ${rand(est.deposit)} · ${est.weeks} wk`,
    replyTo: contact.email,
    attachment,
  })
  // Both emails go out together; the bookkeeping update runs after the response.
  const [sentClient, sentOwner] = await Promise.all([clientMail, ownerMail])
  ctx.waitUntil(env.DB.prepare('UPDATE leads SET email_client_sent = ?, email_owner_sent = ? WHERE ref = ?').bind(sentClient ? 1 : 0, sentOwner ? 1 : 0, ref).run())
  if (!sentClient) console.error(`[api] client email failed for ${ref}`)
  return json(200, { ref, emailed: sentClient })
}

export async function handleContact(req: Request, env: Env): Promise<Response> {
  const body = await readJson(req)
  if (body.website) return json(200, { ok: true })                                    // honeypot
  if (body.consent !== true) throw new HttpError(422, 'Consent is required.')
  const ip = await ipHash(req, env)
  if (await rateLimited(env, ip, 'contact', 10, 86400)) throw new HttpError(429, 'Too many messages today. Please WhatsApp us instead.')
  const c = validateContact(body, true)
  const stamp = nowSql()
  const ref = `MSG-${stamp.replace(/\D/g, '')}-${crypto.getRandomValues(new Uint8Array(2)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '')}`
  await env.DB.prepare("INSERT INTO leads (ref, kind, created_at, name, email, phone, message, consent_at, consent_version, ip_hash) VALUES (?, 'contact', ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(ref, stamp, c.name, c.email, c.phone || null, c.notes, stamp, CONSENT_VERSIONS[0], ip).run()
  const sent = await sendMail(env, {
    to: env.OWNER_EMAIL,
    subject: `Website message from ${c.name}`,
    html: emailLayout('New website message', p(`<strong>${h(c.name)}</strong><br>${h(c.email)}${c.phone ? ` · ${h(c.phone)}` : ''}`) + p(h(c.notes), 'white-space:pre-wrap;margin:0')),
    text: `${c.name} <${c.email}> ${c.phone}\n\n${c.notes}`,
    replyTo: c.email,
  })
  await env.DB.prepare('UPDATE leads SET email_owner_sent = ? WHERE ref = ?').bind(sent ? 1 : 0, ref).run()
  return json(200, { ok: true })
}
