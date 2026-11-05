'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SERVICES } from '@/data/services'
import { PRICEBOOK, rand } from '@/lib/quote/engine'
import { whatsappLink } from '@/lib/site'
import { Icon, type IconName } from './Icon'
import { SwipeRail } from './SwipeRail'

// The home page's "pick a package" section. Every number comes from the price book (the
// same one as /quote and the written quotes), and every inclusion from data/services.ts,
// so nothing here can drift from what a client is actually quoted. A package's main
// action opens WhatsApp with the package already named, the shortest path to starting.

const TABS: { label: string; pricebookId: string; slug: string; icon: IconName; pick?: string }[] = [
  { label: 'Websites', pricebookId: 'website', slug: 'websites', icon: 'monitor', pick: 'business' },
  { label: 'Online stores', pricebookId: 'ecommerce', slug: 'ecommerce', icon: 'bag', pick: 'growth-store' },
  { label: 'Automation', pricebookId: 'automation', slug: 'automation', icon: 'zap', pick: 'simple' },
  { label: 'Web apps', pricebookId: 'webapp', slug: 'web-apps', icon: 'layers' },
]

const unitLine = (n: number | undefined, unit?: { name: string; plural: string } | null) =>
  !n || !unit ? null : n === 1 ? `1 ${unit.name}` : n >= 1000 ? `Up to ${n.toLocaleString('en-ZA')} ${unit.plural}` : `Up to ${n} ${unit.plural}`

export function Packages() {
  const [tab, setTab] = useState(0)
  const t = TABS[tab]!
  const book = PRICEBOOK.services.find((s) => s.id === t.pricebookId)!
  const svc = SERVICES.find((s) => s.slug === t.slug)
  const tiers = book.tiers

  return (
    <div>
      <div role="tablist" aria-label="Choose a service" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
        {TABS.map((x, i) => (
          <button key={x.label} type="button" role="tab" id={`pkg-tab-${i}`} aria-selected={tab === i} aria-controls="pkg-panel" onClick={() => setTab(i)}
            className={`inline-flex flex-none items-center gap-2 rounded-full border px-4 py-2.5 text-[0.9375rem] font-medium transition-colors ${tab === i ? 'border-navy-900 bg-navy-900 text-white' : 'border-line bg-card/80 text-ink-2 hover:border-ink-3 hover:text-ink'}`}>
            <Icon name={x.icon} size={16} className={tab === i ? 'text-teal-500' : 'text-ink-3'} />{x.label}
          </button>
        ))}
      </div>

      <div id="pkg-panel" role="tabpanel" aria-labelledby={`pkg-tab-${tab}`} className="mt-6 sm:mt-8">
        <SwipeRail key={t.pricebookId} label={`${t.label} packages`} grid="md" itemWidth="86%" className={`md:gap-4 ${tiers.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {tiers.map((tier, i) => {
            const picked = tier.id === t.pick
            const scope = unitLine(tier.includedUnits, book.unit)
            const extra = tier.perUnit && book.unit ? `Extra ${book.unit.plural} from ${rand(tier.perUnit)} each` : null
            const message = `Hi Tshedza, I’d like to start the ${tier.name} package (${t.label}, from ${rand(tier.base ?? 0)}). Here’s a bit about my business: `
            return (
              <li key={tier.id} className={`rise-in relative flex flex-col rounded-[24px] p-6 sm:p-7 ${picked ? 'on-dark bg-navy-900 text-white shadow-[0_40px_90px_-40px_rgba(10,27,46,0.8)]' : 'glass-light'}`} style={{ animationDelay: `${i * 90}ms` }}>
                {picked ? <span className="absolute -top-3 left-6 rounded-full bg-teal-500 px-3 py-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-navy-950">Recommended</span> : null}
                <p className={`font-mono text-[0.75rem] uppercase tracking-[0.12em] ${picked ? 'text-teal-500' : 'text-teal-700'}`}>{t.label}</p>
                <h3 className="mt-2 text-[1.375rem] font-semibold tracking-tight">{tier.name}</h3>
                <p className="mt-4 flex items-baseline gap-2"><span className={`text-[0.875rem] ${picked ? 'text-white/60' : 'text-ink-3'}`}>from</span><span className="text-[2.25rem] font-semibold leading-none tracking-[-0.03em] tabular-nums">{rand(tier.base ?? 0)}</span></p>
                <p className={`mt-3 text-[0.9375rem] ${picked ? 'text-white/70' : 'text-ink-2'}`}>{tier.note}</p>
                <ul className={`mt-5 grid gap-2.5 border-t pt-5 text-[0.9375rem] ${picked ? 'border-white/10' : 'border-line'}`}>
                  {[scope, `Live in about ${tier.weeks} week${tier.weeks === 1 ? '' : 's'}`, extra].filter(Boolean).map((line) => (
                    <li key={line} className="flex gap-2.5"><Icon name="check" size={18} className={`mt-0.5 flex-none ${picked ? 'text-teal-500' : 'text-teal-700'}`} />{line}</li>
                  ))}
                </ul>
                <div className="mt-auto grid gap-2 pt-7">
                  <a href={whatsappLink(message)} rel="noopener" className={`btn h-[50px] ${picked ? 'btn-accent glow-border' : 'btn-primary'}`}><Icon name="whatsapp" size={18} /> Start with {tier.name}</a>
                  <Link href={`/quote/#s=${book.id}&t=${tier.id}`} className={`btn ${picked ? 'btn-on-dark' : 'btn-secondary'}`}>Customise &amp; get a PDF</Link>
                </div>
              </li>
            )
          })}
        </SwipeRail>

        {svc ? (
          <div className="mt-6 rounded-[20px] border border-line bg-card/70 p-5 sm:mt-8 sm:p-6">
            <p className="text-[0.9375rem] font-semibold">Every {t.label.toLowerCase().replace(/s$/, '')} package includes</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {svc.included.map((x) => <li key={x} className="chip chip-neutral !text-[0.8125rem] !text-ink-2">{x}</li>)}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
