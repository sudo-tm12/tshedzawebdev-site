'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PRICEBOOK, computeEstimate, rand } from '@/lib/quote/engine'
import { Icon } from '../Icon'
import { useTweened } from './basics'

// The homepage's live price calculator: tap a service, drag the size, watch the price.
// Uses the same engine and price book as /quote (prices are never hard-coded here).

const OPTIONS = [
  { label: 'Website', service: 'website', tier: 'business' },
  { label: 'Online store', service: 'ecommerce', tier: 'growth-store' },
  { label: 'Web app', service: 'webapp', tier: 'mvp' },
  { label: 'Automation', service: 'automation', tier: 'simple' },
] as const

export function MiniQuote() {
  const [opt, setOpt] = useState(0)
  const o = OPTIONS[opt]!
  const svc = PRICEBOOK.services.find((s) => s.id === o.service)!
  const unit = svc.unit!
  const [units, setUnits] = useState<Record<string, number>>({})
  const value = units[o.service] ?? unit.default
  const e = computeEstimate({ service: o.service, tier: o.tier, units: value, addons: {}, monthly: [], priority: false })
  const low = useTweened(e.low)
  const high = useTweened(e.high)
  const pct = ((value - unit.min) / (Math.min(unit.max, unit.default * 4) - unit.min)) * 100
  const max = Math.min(unit.max, unit.default * 4)

  return (
    <div className="on-dark rounded-[22px] border border-white/10 bg-navy-900 p-6 text-white shadow-[0_40px_100px_-40px_rgba(29,161,194,0.5)] sm:p-8">
      <div role="radiogroup" aria-label="What are you building?" className="flex flex-wrap gap-2">
        {OPTIONS.map((x, i) => (
          <button key={x.label} type="button" role="radio" aria-checked={opt === i} onClick={() => setOpt(i)}
            className={`rounded-full border px-4 py-2 text-[0.875rem] font-medium transition-colors ${opt === i ? 'border-teal-500 bg-teal-500 text-navy-950' : 'border-white/15 text-white/75 hover:border-white/40 hover:text-white'}`}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between">
          <label htmlFor="mini-units" className="text-[0.9375rem] text-white/75">How many {unit.plural}?</label>
          <span className="font-mono text-[1.125rem] font-semibold tabular-nums">{value}</span>
        </div>
        <input id="mini-units" type="range" min={unit.min} max={max} value={value}
          onChange={(ev) => setUnits((u) => ({ ...u, [o.service]: Number(ev.target.value) }))}
          className="range-teal mt-3 w-full" style={{ ['--pct' as string]: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-white/10 pt-6">
        <div aria-live="polite">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-teal-500">Estimated price</p>
          <p className="mt-1 text-[clamp(1.875rem,3vw+1rem,2.75rem)] font-semibold leading-none tracking-tight tabular-nums">{rand(low)} <span className="text-white/40">–</span> {rand(high)}</p>
          <p className="mt-2 text-[0.875rem] text-white/60">{svc.tiers.find((t) => t.id === o.tier)?.name} · about {e.weeks} week{e.weeks === 1 ? '' : 's'} · no VAT</p>
        </div>
        <Link href={`/quote/#s=${o.service}&t=${o.tier}&u=${value}`} className="btn btn-accent glow-border">Get my full quote <Icon name="arrowRight" size={18} /></Link>
      </div>
    </div>
  )
}
