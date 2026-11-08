// Branded A4 estimate PDF (docs/QUOTE-ENGINE.md §6), built with pdf-lib (MIT).
// Same design as the original PHP/FPDF template: wordmark header (no icon mark), client and
// project cards, navy investment panel, line items with their workings, next steps, CTA,
// and a footer with page numbers. Layout is written in millimetres from the top-left.
import { PDFDocument, StandardFonts, rgb, setCharacterSpacing, type PDFFont, type PDFPage, type RGB } from 'pdf-lib'
import { rand, type Estimate, type Pricebook, type Selection, type ServiceBook, type Tier } from '../../web/src/lib/quote/engine'

const MM = 72 / 25.4
const PAGE_W = 210, PAGE_H = 297, L = 16, W = 178, CONTENT_BOTTOM = 277

const c = (r: number, g: number, b: number): RGB => rgb(r / 255, g / 255, b / 255)
const NAVY = c(10, 27, 46), TEAL = c(29, 161, 194), TEAL_DARK = c(15, 117, 144), TEAL_TINT = c(227, 244, 248)
const INK2 = c(61, 75, 92), INK3 = c(95, 107, 122), LINE = c(228, 231, 236), MUTED = c(159, 179, 200), BAND = c(242, 247, 249), WHITE = c(255, 255, 255)

// The standard PDF fonts only cover Windows-1252; anything else is simplified or dropped.
const WIN_ANSI_EXTRA = new Set([...'€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ'])
function ansi(s: string): string {
  return [...s.replace(/[  ]/g, ' ')].map((ch) => {
    const code = ch.codePointAt(0)!
    if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WIN_ANSI_EXTRA.has(ch)) return ch
    const base = ch.normalize('NFKD').replace(/[̀-ͯ]/g, '')
    return /^[\x20-\x7e]+$/.test(base) ? base : ''
  }).join('')
}

interface Fonts { regular: PDFFont; bold: PDFFont; italic: PDFFont }
interface TextOpts { size: number; font?: 'regular' | 'bold' | 'italic'; color?: RGB; align?: 'left' | 'right' | 'center'; spacing?: number }

class Canvas {
  page!: PDFPage
  constructor(public doc: PDFDocument, public fonts: Fonts) {}
  addPage() { this.page = this.doc.addPage([PAGE_W * MM, PAGE_H * MM]) }
  /** Text at a baseline (mm from top). For 'right', x is the right edge; for 'center', the middle. */
  text(str: string, x: number, baseline: number, o: TextOpts) {
    const t = ansi(str)
    const font = this.fonts[o.font ?? 'regular']
    const spacing = o.spacing ?? 0
    const width = this.width(t, o.size, o.font) + (spacing ? spacing * (t.length - 1) : 0)
    const left = o.align === 'right' ? x - width : o.align === 'center' ? x - width / 2 : x
    if (spacing) this.page.pushOperators(setCharacterSpacing(spacing * MM))
    this.page.drawText(t, { x: left * MM, y: (PAGE_H - baseline) * MM, size: o.size, font, color: o.color ?? NAVY })
    if (spacing) this.page.pushOperators(setCharacterSpacing(0))
  }
  width(t: string, size: number, font: TextOpts['font'] = 'regular') { return this.fonts[font].widthOfTextAtSize(ansi(t), size) / MM }
  eyebrow(label: string, x: number, baseline: number, color: RGB = TEAL_DARK, align: 'left' | 'right' = 'left') {
    this.text(label.toUpperCase(), x, baseline, { size: 7.5, font: 'bold', color, spacing: 0.32, align })
  }
  rect(x: number, y: number, w: number, h: number, color: RGB) {
    this.page.drawRectangle({ x: x * MM, y: (PAGE_H - y - h) * MM, width: w * MM, height: h * MM, color })
  }
  roundRect(x: number, y: number, w: number, h: number, r: number, o: { fill?: RGB; border?: RGB; borderWidth?: number }) {
    const k = 0.5523 * r
    const P = (n: number) => (n * MM).toFixed(2)
    // SVG path in points, origin at the top-left corner, y pointing down.
    const d = `M ${P(r)} 0 L ${P(w - r)} 0 C ${P(w - r + k)} 0 ${P(w)} ${P(r - k)} ${P(w)} ${P(r)} L ${P(w)} ${P(h - r)} C ${P(w)} ${P(h - r + k)} ${P(w - r + k)} ${P(h)} ${P(w - r)} ${P(h)} `
      + `L ${P(r)} ${P(h)} C ${P(r - k)} ${P(h)} 0 ${P(h - r + k)} 0 ${P(h - r)} L 0 ${P(r)} C 0 ${P(r - k)} ${P(r - k)} 0 ${P(r)} 0 Z`
    this.page.drawSvgPath(d, { x: x * MM, y: (PAGE_H - y) * MM, color: o.fill, borderColor: o.border, borderWidth: o.border ? (o.borderWidth ?? 0.3) * MM : undefined })
  }
  line(x1: number, y1: number, x2: number, y2: number, color: RGB, thickness = 0.2) {
    this.page.drawLine({ start: { x: x1 * MM, y: (PAGE_H - y1) * MM }, end: { x: x2 * MM, y: (PAGE_H - y2) * MM }, thickness: thickness * MM, color })
  }
  circle(cx: number, cy: number, r: number, color: RGB) {
    this.page.drawCircle({ x: cx * MM, y: (PAGE_H - cy) * MM, size: r * MM, color })
  }
  /** Word-wrap to a width (mm); returns the lines. */
  wrap(t: string, size: number, maxWidth: number, font: TextOpts['font'] = 'regular'): string[] {
    const out: string[] = []
    let line = ''
    for (const word of ansi(t).split(/\s+/)) {
      const next = line ? `${line} ${word}` : word
      if (line && this.width(next, size, font) > maxWidth) { out.push(line); line = word } else line = next
    }
    if (line) out.push(line)
    return out
  }
}

export interface PdfContact { name: string; email: string; phone: string; business: string }

const day = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const weeksText = (n: number) => `${n} week${n === 1 ? '' : 's'}`

export async function buildEstimatePdf(ref: string, contact: PdfContact, service: ServiceBook, tier: Tier, est: Estimate, book: Pricebook, sel: Selection, now = new Date()): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(`TshedzaWebDev estimate ${ref}`)
  doc.setAuthor('TshedzaWebDev')
  doc.setCreator('TshedzaWebDev instant quote')
  const cv = new Canvas(doc, {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
  })
  cv.addPage()

  const valid = book.rules.estimateValidDays
  const until = new Date(now.getTime() + valid * 86400000)
  const { oneOff, monthly } = est
  // Monthly packages (e.g. social media) lead with the monthly price; any setup is secondary.
  const monthlyLed = tier.base === undefined && tier.monthlyBase !== undefined
  const range = `${rand(est.low)} – ${rand(est.high)}`

  // ── Header band: the wordmark, then the estimate's reference and dates ──
  cv.rect(0, 0, PAGE_W, 36, NAVY)
  cv.rect(0, 36, PAGE_W, 1.1, TEAL)
  cv.text('Tshedza', L, 17, { size: 17, font: 'bold', color: WHITE })
  cv.text('WebDev', L + cv.width('Tshedza', 17, 'bold'), 17, { size: 17, font: 'bold', color: TEAL })
  cv.text('Crafting Exceptional Web Experiences', L, 23.5, { size: 8.5, color: MUTED })
  cv.eyebrow('Project estimate', 194, 11.5, TEAL, 'right')
  cv.text(ref, 193, 19.3, { size: 16, font: 'bold', color: WHITE, align: 'right' })
  cv.text(`Issued ${day(now)}  ·  Valid until ${day(until)}`, 193, 24.9, { size: 8.5, color: MUTED, align: 'right' })

  // ── Two cards: who it's for, and what it is ──
  let y = 45
  const cw = (W - 5) / 2
  const who = [contact.business, contact.email, contact.phone ? `WhatsApp ${contact.phone}` : ''].filter(Boolean)
  const unit = service.unit
  const units = unit ? Math.max(unit.min, Math.min(unit.max, Math.round(sel.units))) : 0
  const what = [
    unit && units > 0 ? `${units} ${units === 1 ? unit.name : unit.plural}` : '',
    monthlyLed ? 'Billed monthly' : `About ${weeksText(est.weeks)}${sel.priority ? ' (priority delivery)' : ''}`,
    monthlyLed && oneOff > 0 ? `Setup in about ${weeksText(est.weeks)}` : '',
  ].filter(Boolean)
  const ch = 16 + 5 * Math.max(who.length, what.length)
  for (const [x, label, title, lines] of [[L, 'Prepared for', contact.name, who], [L + cw + 5, 'Your project', `${service.name} · ${tier.name}`, what]] as const) {
    cv.roundRect(x, y, cw, ch, 3, { fill: WHITE, border: LINE, borderWidth: 0.3 })
    cv.eyebrow(label, x + 5, y + 7)
    cv.text(title, x + 6, y + 13.2, { size: 11.5, font: 'bold' })
    lines.forEach((t, i) => cv.text(t, x + 6, y + 18.45 + i * 5, { size: 9, color: INK2 }))
  }

  // ── The investment panel ──
  y += ch + 5
  cv.roundRect(L, y, W, 30, 4, { fill: NAVY })
  cv.roundRect(L, y, 2.4, 30, 1.2, { fill: TEAL })
  cv.eyebrow('Estimated investment', L + 8, y + 8, TEAL)
  cv.text(monthlyLed || oneOff === 0 ? `${rand(monthly)} / month` : range, L + 8, y + 18.5, { size: 24, font: 'bold', color: WHITE })
  cv.text(monthlyLed || oneOff === 0 ? 'Billed monthly. Your written quote confirms the package.' : 'A range for now. Your written quote fixes the price.', L + 8, y + 25, { size: 8, color: MUTED })
  const facts: [string, string][] = []
  if (monthlyLed) {
    if (oneOff > 0) facts.push(['Once-off setup', range])
  } else {
    if (oneOff > 0 && monthly > 0) facts.push(['Monthly', `+ ${rand(monthly)} / month`])
    if (oneOff > 0) facts.push(['Deposit to start', est.deposit > 0 ? rand(est.deposit) : 'None needed'])
  }
  facts.forEach(([k, v], i) => {
    cv.eyebrow(k, 150, y + 8 + i * 11.5, MUTED)
    cv.text(v, 150, y + 14 + i * 11.5, { size: 11.5, font: 'bold', color: WHITE })
  })

  // ── Line items with their workings ──
  y += 30 + 6
  const table = (title: string, rows: { label: string; detail?: string; amount: number }[], suffix: string, total: [string, string] | null) => {
    cv.roundRect(L, y, W, 8, 2, { fill: BAND })
    cv.eyebrow(title, L + 4, y + 5.3)
    cv.text('AMOUNT', L + W - 5, y + 5.3, { size: 7.5, font: 'bold', color: TEAL_DARK, align: 'right' })
    y += 9
    for (const row of rows) {
      const detail = (row.detail ?? '').trim()
      const rh = detail ? 10 : 7.5
      if (y + rh > CONTENT_BOTTOM) { cv.addPage(); y = 20 }
      cv.text(row.label, L + 5, y + 4.9, { size: 10 })
      cv.text(`${rand(row.amount)}${suffix}`, L + W - 5, y + 4.9, { size: 10, font: 'bold', align: 'right' })
      if (detail) cv.text(detail, L + 5, y + 8.6, { size: 8, color: INK3 })
      cv.line(L, y + rh, L + W, y + rh, LINE, 0.2)
      y += rh
    }
    if (total) {
      const ty = y + 1
      cv.line(L, ty, L + W, ty, TEAL, 0.5)
      cv.text(total[0], L + 5, ty + 6.1, { size: 10.5, font: 'bold' })
      cv.text(total[1], L + W - 5, ty + 6.1, { size: 10.5, font: 'bold', align: 'right' })
      y = ty + 9
    }
  }
  if (est.lines.length) table('What is included', est.lines, '', oneOff > 0 ? ['Once-off total', rand(oneOff)] : null)
  if (est.monthlyLines.length) {
    y += 4
    table('Monthly', est.monthlyLines, ' / month', monthly > 0 && est.monthlyLines.length > 1 ? ['Monthly total', `${rand(monthly)} / month`] : null)
  }

  // ── What happens next: four numbered steps in two columns ──
  if (y + 40 > CONTENT_BOTTOM) { cv.addPage(); y = 20 }
  const sy = y + 4
  cv.text('What happens next', L, sy + 4, { size: 12, font: 'bold' })
  const steps: [string, string][] = [
    ['A short call', 'On WhatsApp or video, to confirm what you need.'],
    ['A written quote', 'A fixed price, scope and timeline, in writing.'],
    est.deposit > 0 ? ['A 50% deposit', `About ${rand(est.deposit)} secures your slot and starts the work.`] : ['You say go', 'Work starts as soon as you accept the quote.'],
    ['Design, build, launch', 'You approve the design, we build, test and hand everything over.'],
  ]
  steps.forEach(([head, body], i) => {
    const x = L + (i % 2) * (W / 2)
    const yy = sy + 8 + Math.floor(i / 2) * 13
    cv.circle(x + 3.6, yy + 3.2, 3.6, TEAL)
    cv.text(String(i + 1), x + 3.6, yy + 4.15, { size: 9, font: 'bold', color: WHITE, align: 'center' })
    cv.text(head, x + 11, yy + 3.7, { size: 9.5, font: 'bold' })
    cv.wrap(body, 8.5, W / 2 - 14).forEach((t, k) => cv.text(t, x + 11, yy + 8.15 + k * 4.1, { size: 8.5, color: INK2 }))
  })

  // ── Call to action, then the small print ──
  let cy = sy + 8 + 26 + 3
  if (cy + 27 > CONTENT_BOTTOM) { cv.addPage(); cy = 20 }
  cv.roundRect(L, cy, W, 18, 3, { fill: TEAL_TINT })
  cv.text('Ready to go ahead?', L + 6, cy + 7.5, { size: 11, font: 'bold' })
  cv.text('Reply to this email or WhatsApp 069 951 3836. You speak to the person who builds your project.', L + 6, cy + 13, { size: 9, color: INK2 })
  cv.text('Based on the options you selected; not a binding quote. All amounts are in South African rand.', L + 1, cy + 24.8, { size: 7.5, font: 'italic', color: INK3 })

  // ── Footer on every page ──
  const pages = doc.getPages()
  pages.forEach((page, i) => {
    cv.page = page
    cv.line(L, 280, L + W, 280, LINE, 0.2)
    cv.text('Tshedza', L + 1, 285.6, { size: 8, font: 'bold' })
    cv.text('WebDev', L + 1 + cv.width('Tshedza', 8, 'bold'), 285.6, { size: 8, font: 'bold', color: TEAL_DARK })
    cv.text('info@tshedzawebdev.co.za  ·  WhatsApp 069 951 3836  ·  tshedzawebdev.co.za', L + W - 1, 285.6, { size: 8, color: INK2, align: 'right' })
    cv.text('Pretoria, South Africa  ·  Your information is handled in line with POPIA: tshedzawebdev.co.za/privacy', L + 1, 289.7, { size: 7, color: INK3 })
    cv.text(`Page ${i + 1} of ${pages.length}`, L + W - 1, 289.7, { size: 7, color: INK3, align: 'right' })
  })

  return doc.save()
}
