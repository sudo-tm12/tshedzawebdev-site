// The quote engine (docs/QUOTE-ENGINE.md §3). Pure and deterministic; the PHP API
// (api/lib/engine.php) implements the same maths and re-verifies every estimate.
import pricebookJson from '../../data/pricebook.json' with { type: 'json' }

export interface Tier {
  id: string
  name: string
  base?: number
  monthlyBase?: number
  includedUnits?: number
  perUnit?: number
  weeks: number
  note: string
}
export interface Addon { id: string; name: string; price?: number; priceRate?: number; per?: string; weeks: number }
export interface Monthly { id: string; name: string; price: number }
export interface ServiceBook {
  id: string
  name: string
  blurb: string
  unit: { name: string; plural: string; min: number; max: number; default: number } | null
  billing?: 'monthly'
  tiers: Tier[]
  addons: Addon[]
  monthly: Monthly[]
  disclaimer?: string
}
export interface Pricebook {
  version: string
  rules: { rangeLow: number; rangeHigh: number; roundTo: number; depositThreshold: number; depositRate: number; rush: { label: string; multiplier: number }; estimateValidDays: number }
  services: ServiceBook[]
}

export const PRICEBOOK = pricebookJson as unknown as Pricebook

export interface Selection {
  service: string
  tier: string
  units: number
  addons: Record<string, number> // addon id → quantity (1 for flat add-ons)
  monthly: string[]
  priority: boolean
}

export interface LineItem { label: string; detail?: string; amount: number }
export interface Estimate {
  lines: LineItem[]
  monthlyLines: LineItem[]
  oneOff: number
  monthly: number
  low: number
  high: number
  deposit: number
  weeks: number
  pricebookVersion: string
}

export class QuoteError extends Error {}

// Round to 6 decimals first so float noise (6500 × 1.15 = 7474.999…) can't flip a
// rounding step; PHP does the same: round(round($n, 6) / $step) * $step.
const roundTo = (n: number, step: number) => Math.round(Number(n.toFixed(6)) / step) * step

export function getService(id: string): ServiceBook {
  const s = PRICEBOOK.services.find((x) => x.id === id)
  if (!s) throw new QuoteError(`Unknown service: ${id}`)
  return s
}

export function defaultSelection(serviceId: string): Selection {
  const s = getService(serviceId)
  const tier = s.tiers[Math.min(1, s.tiers.length - 1)] ?? s.tiers[0]
  return { service: s.id, tier: tier!.id, units: s.unit?.default ?? 1, addons: {}, monthly: [], priority: false }
}

export function computeEstimate(sel: Selection, book: Pricebook = PRICEBOOK): Estimate {
  const service = book.services.find((s) => s.id === sel.service)
  if (!service) throw new QuoteError('Unknown service')
  const tier = service.tiers.find((t) => t.id === sel.tier)
  if (!tier) throw new QuoteError('Unknown tier')
  const r = book.rules

  const units = service.unit ? Math.min(Math.max(Math.round(sel.units), service.unit.min), service.unit.max) : 1
  const lines: LineItem[] = []
  const monthlyLines: LineItem[] = []

  let oneOff = 0
  let weeks = tier.weeks

  if (tier.base !== undefined) {
    lines.push({ label: tier.name, detail: tier.note, amount: tier.base })
    oneOff += tier.base
  }
  const extraUnits = service.unit && tier.includedUnits !== undefined ? Math.max(0, units - tier.includedUnits) : 0
  const extraCost = extraUnits * (tier.perUnit ?? 0)
  if (extraCost > 0 && service.unit) {
    lines.push({ label: `${extraUnits} extra ${extraUnits === 1 ? service.unit.name : service.unit.plural}`, detail: `R${tier.perUnit} each beyond ${tier.includedUnits} included`, amount: extraCost })
    oneOff += extraCost
  }
  const buildCost = (tier.base ?? 0) + extraCost

  for (const addon of service.addons) {
    const qty = sel.addons[addon.id]
    if (!qty || qty <= 0) continue
    let amount = 0
    let detail: string | undefined
    if (addon.priceRate !== undefined) {
      amount = Math.round(buildCost * addon.priceRate)
      detail = `${Math.round(addon.priceRate * 100)}% of build`
    } else if (addon.per) {
      const q = addon.per === service.unit?.name ? units : Math.max(1, Math.round(qty))
      amount = q * (addon.price ?? 0)
      detail = `${q} × R${addon.price}`
    } else {
      amount = addon.price ?? 0
    }
    lines.push({ label: addon.name, detail, amount })
    oneOff += amount
    weeks += addon.weeks
  }

  let monthly = 0
  if (tier.monthlyBase !== undefined) {
    monthlyLines.push({ label: `${tier.name} package`, detail: tier.note, amount: tier.monthlyBase })
    monthly += tier.monthlyBase
  }
  for (const m of service.monthly) {
    if (!sel.monthly.includes(m.id)) continue
    monthlyLines.push({ label: m.name, amount: m.price })
    monthly += m.price
  }

  if (sel.priority && oneOff > 0) {
    const before = oneOff
    oneOff = Math.round(oneOff * r.rush.multiplier)
    lines.push({ label: 'Priority delivery', detail: `+${Math.round((r.rush.multiplier - 1) * 100)}%`, amount: oneOff - before })
  }

  const low = roundTo(oneOff * r.rangeLow, r.roundTo)
  const high = roundTo(oneOff * r.rangeHigh, r.roundTo)
  const deposit = oneOff > r.depositThreshold ? roundTo(low * r.depositRate, r.roundTo) : 0
  const finalWeeks = Math.max(1, Math.ceil(weeks * (sel.priority ? 0.6 : 1)))

  return { lines, monthlyLines, oneOff, monthly, low, high, deposit, weeks: finalWeeks, pricebookVersion: book.version }
}

const ZAR = new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 })
export const rand = (n: number) => `R ${ZAR.format(n)}`
