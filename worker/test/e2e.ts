// End-to-end checks against a running local Worker (`npm run dev`, MAIL_TRANSPORT=outbox).
//   node --experimental-strip-types test/e2e.ts [pdfOutDir]
// Emails (with the PDF) are read back from the local D1 outbox table via wrangler.
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { computeEstimate, defaultSelection, type Selection } from '../../web/src/lib/quote/engine.ts'

const API = process.env.API ?? 'http://127.0.0.1:4730'
const ORIGIN = 'http://localhost:4711'
const pdfDir = process.argv[2]
let pass = 0, fail = 0
const ok = (c: boolean, label: string, extra = '') => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'}  ${label}${extra ? '  · ' + extra : ''}`) }
const post = async (path: string, body: unknown, origin = ORIGIN) => {
  const r = await fetch(API + path, { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(body) })
  return { status: r.status, cors: r.headers.get('access-control-allow-origin'), data: await r.json().catch(() => ({})) as Record<string, unknown> }
}
const quote = (sel: Selection, contact: Record<string, string>, extra: Record<string, unknown> = {}) => {
  const e = computeEstimate(sel)
  return post('/quote/send', { selection: sel, estimate: { oneOff: e.oneOff, monthly: e.monthly, low: e.low, high: e.high }, contact, consent: true, consentVersion: '2026-10-29', website: '', ...extra })
}
const sql = (q: string) => {
  const out = execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'execute', 'tshedzawebdev', '--local', '--json', '--command', q], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return (JSON.parse(out)[0]?.results ?? []) as Record<string, string>[]
}

// ── Instant quote ──
const web: Selection = { ...defaultSelection('website'), tier: 'business', units: 8, addons: { booking: 1, copy: 1 }, monthly: ['care'], priority: false }
let r = await quote(web, { name: 'Thandi Mokoena', email: 'thandi@example.com', phone: '082 123 4567', business: 'Mokoena Hair Studio' })
ok(r.status === 200 && /^EST-\d{4}-\d{4}$/.test(String(r.data.ref)) && r.cors === ORIGIN, 'website quote accepted, ref issued, CORS for our site', `${r.status} ${r.data.ref}`)
const ref1 = String(r.data.ref)
const store: Selection = { ...defaultSelection('ecommerce'), tier: 'growth-store', units: 60, addons: { delivery: 1, whatsapp: 1, 'product-upload': 1 }, monthly: ['care'], priority: true }
r = await quote(store, { name: 'Sipho Ndlovu', email: 'sipho@example.com' })
ok(r.status === 200, 'online-store quote with priority accepted', `${r.status} ${r.data.ref}`)
const ref2 = String(r.data.ref)
r = await quote({ ...defaultSelection('social'), tier: 'tier-2', addons: { setup: 1 } }, { name: 'Lerato Dube', email: 'lerato@example.com', business: 'Dube Events' })
ok(r.status === 200, 'monthly (social media) quote accepted', `${r.status} ${r.data.ref}`)
const ref3 = String(r.data.ref)
const t = computeEstimate(web)
r = await post('/quote/send', { selection: web, estimate: { oneOff: t.oneOff - 1000, monthly: t.monthly, low: t.low - 900, high: t.high }, contact: { name: 'Eve', email: 'eve@example.com' }, consent: true, consentVersion: '2026-10-29' })
ok(r.status === 409, 'tampered price rejected (server recalculates)', String(r.status))
r = await quote(web, { name: 'No Consent', email: 'nc@example.com' }, { consent: false })
ok(r.status === 422, 'quote without consent rejected', String(r.status))
r = await post('/quote/send', {}, 'https://evil.example')
ok(r.status === 403, 'request from another website rejected', String(r.status))

const mails = sql(`SELECT to_addr, reply_to, subject, attachment_name, attachment_b64 FROM outbox WHERE subject LIKE '%${ref1}%' OR subject LIKE '%${ref2}%' OR subject LIKE '%${ref3}%'`)
const client = mails.find((m) => m.to_addr === 'thandi@example.com')
const owner = mails.find((m) => m.to_addr === 'info@tshedzawebdev.co.za' && m.subject.includes(ref1))
ok(!!client && client.reply_to === 'info@tshedzawebdev.co.za' && client.attachment_name === `TshedzaWebDev-estimate-${ref1}.pdf`, 'client emailed with the PDF, replies go to you', client?.subject)
ok(!!owner && owner.reply_to === 'thandi@example.com' && !!owner.attachment_b64, 'you get a copy with the PDF, replies go to the client', owner?.subject)
const pdf = Buffer.from(client?.attachment_b64 ?? '', 'base64')
ok(pdf.subarray(0, 5).toString() === '%PDF-' && pdf.length > 3000, 'the attachment is a real PDF', `${pdf.length} bytes`)
if (pdfDir) {
  mkdirSync(pdfDir, { recursive: true })
  for (const m of mails.filter((x) => x.to_addr !== 'info@tshedzawebdev.co.za')) writeFileSync(`${pdfDir}/${m.attachment_name}`, Buffer.from(m.attachment_b64, 'base64'))
}

// ── Contact form ──
r = await post('/contact', { name: 'Kabelo Molefe', email: 'kabelo@example.com', message: 'Hi, I need a website for my car wash in Mamelodi.', consent: true, website: '' })
ok(r.status === 200, 'contact message accepted', String(r.status))
r = await post('/contact', { name: 'Kabelo', email: 'not-an-email', message: 'Hi, I need a website for my car wash.', consent: true })
ok(r.status === 422, 'contact with a bad email rejected', String(r.data.error))

// ── Community wall ──
const list = async () => (await (await fetch(API + '/wall', { headers: { origin: ORIGIN } })).json()) as { notes: { id: number }[] }
const tag = Math.random().toString(36).slice(2, 7)
r = await post('/wall', { message: `The Automate & Earn lessons helped me land my first client (${tag}).`, name: 'Ayanda', place: 'Soshanguve', kind: 'thanks', colour: 'mint', consent: true, website: '' })
const id = Number(r.data.id)
ok(r.status === 200 && id > 0, 'wall note accepted (pending)', `${r.status} id=${id}`)
ok(!(await list()).notes.some((n) => n.id === id), 'pending note is NOT public yet')
r = await post('/wall', { message: 'visit www.spam.co.za for deals', consent: true })
ok(r.status === 422, 'note with a link rejected', String(r.data.error))
r = await post('/wall', { message: 'call me on 082 123 4567', consent: true })
ok(r.status === 422, 'note with a phone number rejected', String(r.data.error))
const wallMail = sql(`SELECT text FROM outbox WHERE subject LIKE 'Wall note from%' ORDER BY id DESC LIMIT 1`)[0]
const approve = wallMail?.text.match(/Approve: (\S+)/)?.[1]
ok(!!approve && wallMail!.text.includes(tag), 'owner emailed the note with an approve link')
const confirm = await (await fetch(approve!)).text()
ok(/Approve and publish\?/.test(confirm) && !(await list()).notes.some((n) => n.id === id), 'opening the link only shows a confirm page (safe from email scanners)')
const u = new URL(approve!)
const done = await (await fetch(API + '/wall/moderate', { method: 'POST', body: new URLSearchParams({ id: u.searchParams.get('id')!, a: 'approve', t: u.searchParams.get('t')! }) })).text()
ok(/Approved/.test(done) && (await list()).notes.some((n) => n.id === id), 'pressing Approve publishes the note')
const forged = await fetch(API + '/wall/moderate', { method: 'POST', body: new URLSearchParams({ id: String(id), a: 'approve', t: 'forged' }) })
ok(forged.status === 403, 'a forged approve link is refused', String(forged.status))
let hh = await post('/wall/heart', { id, on: true })
ok(hh.data.hearts === 1, 'heart added', JSON.stringify(hh.data))
hh = await post('/wall/heart', { id, on: true })
ok(hh.data.hearts === 1, 'the same visitor cannot double-count', JSON.stringify(hh.data))
hh = await post('/wall/heart', { id, on: false })
ok(hh.data.hearts === 0, 'heart removed', JSON.stringify(hh.data))

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
