'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { PRICEBOOK, computeEstimate, defaultSelection, rand, type Selection, type ServiceBook } from '@/lib/quote/engine'
import { SITE, whatsappLink } from '@/lib/site'
import { Icon, type IconName } from './Icon'
import { useTweened } from './motion/basics'

// The instant quote as a guided flow: one question per screen, inside one viewport,
// so nobody has to scroll. Tapping a single-choice answer moves on by itself; steps
// that don't apply to a service are skipped. docs/QUOTE-ENGINE.md §5.

const SERVICE_ICONS: Record<string, IconName> = { website: 'monitor', ecommerce: 'bag', webapp: 'layers', automation: 'zap', seo: 'search', social: 'megaphone', trading: 'chart' }
const CONSENT_VERSION = '2026-10-29'
const PRESETS: Record<string, number[]> = { page: [1, 5, 10, 20], product: [10, 30, 100, 500], 'core screen': [5, 8, 15, 30], workflow: [1, 2, 3, 5] }

type StepId = 'service' | 'tier' | 'units' | 'extras' | 'monthly' | 'timing' | 'result' | 'details'
const STEP_IDS: StepId[] = ['service', 'tier', 'units', 'extras', 'monthly', 'timing', 'result', 'details']

function stepsFor(service: ServiceBook | undefined): StepId[] {
  if (!service) return ['service']
  return STEP_IDS.filter((s) =>
    s === 'units' ? !!service.unit
      : s === 'extras' ? service.addons.length > 0
        : s === 'monthly' ? service.monthly.length > 0
          : s === 'timing' ? service.tiers.some((t) => t.base !== undefined)
            : true)
}

// ── URL hash <-> state (no personal data ever goes in the URL) ────────────────
interface FlowState { sel: Selection | null; step: StepId }
function fromHash(hash: string): FlowState {
  const p = new URLSearchParams(hash.replace(/^#/, ''))
  const s = p.get('s')
  if (!s || !PRICEBOOK.services.some((x) => x.id === s)) return { sel: null, step: 'service' }
  const sel = defaultSelection(s)
  const svc = PRICEBOOK.services.find((x) => x.id === s)!
  const t = p.get('t'); if (t && svc.tiers.some((x) => x.id === t)) sel.tier = t
  const u = Number(p.get('u')); if (Number.isFinite(u) && u > 0 && svc.unit) sel.units = Math.min(svc.unit.max, Math.max(svc.unit.min, Math.round(u)))
  for (const a of (p.get('a') ?? '').split(',').filter(Boolean)) if (svc.addons.some((x) => x.id === a)) sel.addons[a] = 1
  sel.monthly = (p.get('m') ?? '').split(',').filter((m) => svc.monthly.some((x) => x.id === m))
  sel.priority = p.get('p') === '1'
  // A link that carries choices but no step (e.g. from the homepage calculator) opens on the result.
  const st = p.get('st') as StepId | null
  const step = st && stepsFor(svc).includes(st) ? st : 'result'
  return { sel, step }
}
function toHash({ sel, step }: FlowState): string {
  if (!sel) return '#'
  const p = new URLSearchParams({ s: sel.service, t: sel.tier, u: String(sel.units) })
  const a = Object.keys(sel.addons).filter((k) => sel.addons[k]); if (a.length) p.set('a', a.join(','))
  if (sel.monthly.length) p.set('m', sel.monthly.join(','))
  if (sel.priority) p.set('p', '1')
  p.set('st', step)
  return '#' + p.toString()
}

// The hash is the single source of truth: shareable, survives refresh, and the
// browser's back button steps back through the questions (pushState per step).
const listeners = new Set<() => void>()
function subscribe(cb: () => void) {
  listeners.add(cb)
  window.addEventListener('hashchange', cb)
  window.addEventListener('popstate', cb)
  return () => { listeners.delete(cb); window.removeEventListener('hashchange', cb); window.removeEventListener('popstate', cb) }
}
const getHash = () => window.location.hash
const getServerHash = () => ''
function writeHash(hash: string, push: boolean) {
  const url = hash === '#' ? window.location.pathname : hash
  // Keep Next.js's own history state on each entry, so its router doesn't treat our
  // entries as foreign and reload the page on Back.
  if (push) history.pushState(history.state, '', url); else history.replaceState(history.state, '', url)
  listeners.forEach((l) => l())
}

type SendState = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; ref: string; emailed: boolean; hash: string } | { kind: 'error'; message: string }

export function QuoteBuilder() {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash)
  const { sel, step } = useMemo(() => fromHash(hash), [hash])
  const service = sel ? PRICEBOOK.services.find((s) => s.id === sel.service) : undefined
  const steps = stepsFor(service)
  const estimate = useMemo(() => (sel ? computeEstimate(sel) : null), [sel])
  const [send, setSend] = useState<SendState>({ kind: 'idle' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const sheetRef = useRef<HTMLDialogElement>(null)
  const firstRender = useRef(true)

  const go = (next: StepId, nextSel: Selection | null = sel) => {
    setDir(STEP_IDS.indexOf(next) >= STEP_IDS.indexOf(step) ? 'fwd' : 'back')
    writeHash(toHash({ sel: nextSel, step: next }), true)
  }
  const edit = (patch: Partial<Selection>) => { if (sel) writeHash(toHash({ sel: { ...sel, ...patch }, step }), false) }
  const nextOf = (from: StepId, order = steps) => order[order.indexOf(from) + 1] ?? 'result'
  const back = () => {
    if (step === 'service') return
    const i = steps.indexOf(step)
    setDir('back')
    if (i <= 1) { writeHash(toHash({ sel, step: 'service' }), true); return }
    writeHash(toHash({ sel, step: steps[i - 1]! }), true)
  }

  const pickService = (id: string) => {
    const s = defaultSelection(id)
    setSend({ kind: 'idle' })
    go(nextOf('service', stepsFor(PRICEBOOK.services.find((x) => x.id === id))), s)
  }
  const pickTier = (id: string) => { if (sel) go(nextOf('tier'), { ...sel, tier: id }) }
  const pickTiming = (priority: boolean) => { if (sel) go('result', { ...sel, priority }) }
  const toggleAddon = (id: string) => {
    if (!sel) return
    const addons = { ...sel.addons }
    if (addons[id]) delete addons[id]; else addons[id] = 1
    edit({ addons })
  }
  const toggleMonthly = (id: string) => { if (sel) edit({ monthly: sel.monthly.includes(id) ? sel.monthly.filter((m) => m !== id) : [...sel.monthly, id] }) }

  // Move focus to the new question so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    headingRef.current?.focus({ preventScroll: true })
  }, [step, send.kind])

  // Keyboard: 1–9 picks an option, Enter continues, Escape/Backspace goes back.
  // Pure DOM (data-q-* hooks), so the listener never needs fresh component state.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select, dialog') || e.metaKey || e.ctrlKey || e.altKey) return
      const n = Number(e.key)
      if (n >= 1 && n <= 9) {
        const btn = document.querySelectorAll<HTMLButtonElement>('[data-q-option]')[n - 1]
        if (btn) { e.preventDefault(); btn.click() }
      } else if (e.key === 'Enter' && !t.closest('button, a')) {
        document.querySelector<HTMLButtonElement>('[data-q-continue]')?.click()
      } else if (e.key === 'Escape' || (e.key === 'Backspace' && !t.closest('button, a'))) {
        const btn = document.querySelector<HTMLButtonElement>('[data-q-back]')
        if (btn && !btn.disabled) { e.preventDefault(); btn.click() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const summaryText = () => {
    if (!sel || !service || !estimate) return ''
    const tier = service.tiers.find((t) => t.id === sel.tier)
    const parts = [`${service.name}: ${tier?.name}`]
    if (service.unit) parts.push(`${sel.units} ${sel.units === 1 ? service.unit.name : service.unit.plural}`)
    const extras = service.addons.filter((a) => sel.addons[a.id]).map((a) => a.name)
    if (extras.length) parts.push(`extras: ${extras.join(', ')}`)
    const range = estimate.oneOff > 0 ? `${rand(estimate.low)} – ${rand(estimate.high)}` : ''
    const monthly = estimate.monthly > 0 ? `${rand(estimate.monthly)}/month` : ''
    return `${parts.join(' · ')}. Estimate: ${[range, monthly].filter(Boolean).join(' + ')}.`
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!sel || !estimate) return
    const form = e.currentTarget
    const fd = new FormData(form)
    const contact = { name: String(fd.get('name') ?? '').trim(), email: String(fd.get('email') ?? '').trim(), phone: String(fd.get('phone') ?? '').trim(), business: '', notes: '' }
    const consent = fd.get('consent') === 'on'
    const next: Record<string, string> = {}
    if (contact.name.length < 2) next.name = 'Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email)) next.email = 'Check this email'
    if (contact.phone && !/^[+\d][\d\s()-]{8,}$/.test(contact.phone)) next.phone = 'Check this number'
    if (!consent) next.consent = 'Please tick this box to continue.'
    setErrors(next)
    if (Object.keys(next).length) { form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus(); return }
    setSend({ kind: 'sending' })
    try {
      const res = await fetch(`${SITE.apiBase}/quote/send`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ selection: sel, estimate: { oneOff: estimate.oneOff, monthly: estimate.monthly, low: estimate.low, high: estimate.high }, contact, consent, consentVersion: CONSENT_VERSION, website: String(fd.get('website') ?? '') }),
      })
      const data = (await res.json().catch(() => ({}))) as { ref?: string; emailed?: boolean; error?: string }
      if (!res.ok || !data.ref) throw new Error(data.error ?? 'send failed')
      setSend({ kind: 'sent', ref: data.ref, emailed: data.emailed !== false, hash: window.location.hash })
    } catch (err) {
      const msg = err instanceof Error && err.message !== 'send failed' && !/fetch/i.test(err.message) ? err.message : 'We couldn’t send it just now. Your choices are safe.'
      setSend({ kind: 'error', message: msg })
    }
  }

  // ── Layout: progress + price on top, one question in the middle ─────────────
  const flowSteps = steps.filter((s) => s !== 'details')
  const position = step === 'details' ? flowSteps.length : flowSteps.indexOf(step) + 1
  const sent = send.kind === 'sent' && send.hash === hash
  const view = sent ? 'sent' : step
  const tier = service?.tiers.find((t) => t.id === sel?.tier)

  return (
    <section className="hero-dark noise -mt-16 pt-16" aria-labelledby="q-title">
      <div className="aurora aurora-1" aria-hidden="true" />
      <div className="aurora aurora-2" aria-hidden="true" />
      <div className="hero-grid opacity-50" aria-hidden="true" />
      <h1 id="q-title" className="sr-only">Instant quote</h1>

      <div className="container-site flex h-[calc(100svh-64px)] min-h-[560px] flex-col">
        {/* Top bar */}
        <div className="flex items-center gap-3 pt-4 sm:gap-5 sm:pt-6">
          <button type="button" data-q-back onClick={back} disabled={step === 'service' || sent} aria-label="Back to the previous question"
            className="glass inline-flex h-10 w-10 flex-none items-center justify-center rounded-full text-white transition-opacity disabled:pointer-events-none disabled:opacity-0">
            <Icon name="arrowRight" size={18} className="rotate-180" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-[0.75rem] text-white/55">
              <span className="font-mono uppercase tracking-[0.12em]">{sent ? 'Done' : step === 'service' ? 'Instant quote' : `Step ${position} of ${flowSteps.length}`}</span>
              <span className="hidden sm:inline">No sign-up · {SITE.vatNote.split(' · ')[0]}</span>
            </div>
            <div className="mt-2 flex gap-1.5" aria-hidden="true">
              {(service ? flowSteps : stepsFor(PRICEBOOK.services[0]).filter((x) => x !== 'details')).map((s, i) => (
                <span key={`${s}${i}`} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <span className="block h-full rounded-full bg-teal-500 transition-[width] duration-500 ease-[var(--ease-out-soft)]" style={{ width: sent || i < position ? '100%' : '0%' }} />
                </span>
              ))}
            </div>
          </div>
          {estimate && step !== 'result' && view !== 'sent' && step !== 'service' ? <PricePill low={estimate.low} high={estimate.high} monthly={estimate.monthly} oneOff={estimate.oneOff} /> : null}
        </div>

        {/* Stage: one question. It scrolls internally only on very short screens. */}
        <div key={`${view}`} className={`flex min-h-0 flex-1 flex-col overflow-y-auto py-4 sm:py-8 ${dir === 'fwd' ? 'q-in-fwd' : 'q-in-back'}`}>
          <div className="my-auto w-full">
            {view === 'service' ? (
              <Question refEl={headingRef} title={<>What are we <span className="accent-serif text-teal-500">building?</span></>} hint="Tap one. You can change anything later.">
                <div role="radiogroup" aria-label="Type of project" className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
                  {PRICEBOOK.services.map((s, i) => {
                    const from = Math.min(...s.tiers.map((t) => t.base ?? t.monthlyBase ?? Infinity))
                    const monthlyOnly = s.tiers.every((t) => t.base === undefined)
                    return (
                      <button key={s.id} type="button" role="radio" aria-checked={sel?.service === s.id} data-q-option onClick={() => pickService(s.id)}
                        className={`q-tile group flex-col p-3 sm:p-5 ${i === 0 ? 'col-span-2 sm:col-span-1' : ''}`}>
                        <span className="flex w-full items-center gap-2.5 sm:items-start sm:justify-between">
                          <span className="glass-inset inline-flex h-8 w-8 flex-none items-center justify-center rounded-[10px] text-teal-500 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 sm:h-10 sm:w-10 sm:rounded-[12px]"><Icon name={SERVICE_ICONS[s.id] ?? 'sparkle'} size={18} /></span>
                          <span className="font-semibold leading-tight sm:hidden">{s.name}</span>
                          <span className="q-key hidden lg:inline-flex">{i + 1}</span>
                        </span>
                        <span className="mt-4 hidden font-semibold leading-tight sm:block sm:text-[1.0625rem]">{s.name}</span>
                        <span className="mt-1 line-clamp-2 hidden text-[0.8125rem] leading-snug text-white/60 sm:block">{s.blurb}</span>
                        <span className="mt-1.5 block font-mono text-[0.75rem] text-teal-500 sm:mt-3">from {rand(from)}{monthlyOnly ? '/mo' : ''}</span>
                      </button>
                    )
                  })}
                </div>
              </Question>
            ) : null}

            {view === 'tier' && sel && service ? (
              <Question refEl={headingRef} title={<>Which <span className="accent-serif text-teal-500">fits best?</span></>} hint={`${service.name} packages. Prices are starting points in rand.`}>
                <div role="radiogroup" aria-label={`${service.name} packages`} className={`grid gap-3 ${service.tiers.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                  {service.tiers.map((t, i) => (
                    <button key={t.id} type="button" role="radio" aria-checked={sel.tier === t.id} data-q-option onClick={() => pickTier(t.id)} className="q-tile flex-row items-center gap-4 p-4 sm:flex-col sm:items-start sm:p-6">
                      <span className="min-w-0 flex-1 sm:w-full">
                        <span className="flex items-center justify-between gap-3"><span className="font-semibold sm:text-[1.125rem]">{t.name}</span><span className="q-key hidden lg:inline-flex">{i + 1}</span></span>
                        <span className="mt-1 block text-[0.8125rem] leading-snug text-white/60 sm:mt-2 sm:text-[0.875rem]">{t.note}</span>
                      </span>
                      <span className="flex-none text-right sm:mt-5 sm:w-full sm:text-left">
                        <span className="block text-[1.125rem] font-semibold tabular-nums sm:text-[1.625rem] sm:tracking-tight">{t.base !== undefined ? rand(t.base) : `${rand(t.monthlyBase!)}`}<span className="text-[0.8125rem] font-normal text-white/55">{t.base !== undefined ? '' : '/mo'}</span></span>
                        <span className="block text-[0.75rem] text-white/50">{t.base !== undefined ? 'from · ' : ''}about {t.weeks} wk</span>
                      </span>
                    </button>
                  ))}
                </div>
              </Question>
            ) : null}

            {view === 'units' && sel && service?.unit && tier ? (
              <Question refEl={headingRef} title={<>How many <span className="accent-serif text-teal-500">{service.unit.plural}?</span></>}
                hint={tier.includedUnits !== undefined ? `${tier.name} includes ${tier.includedUnits}${tier.perUnit ? `, then ${rand(tier.perUnit)} each` : ''}. A rough number is fine.` : 'A rough number is fine.'}>
                <UnitPicker sel={sel} unit={service.unit} included={tier.includedUnits} onChange={(units) => edit({ units })} />
                <Continue onClick={() => go(nextOf('units'))} />
              </Question>
            ) : null}

            {view === 'extras' && sel && service ? (
              <Question refEl={headingRef} title={<>Anything <span className="accent-serif text-teal-500">extra?</span></>} hint="Optional. Tap to add or remove." hintDesktopOnly>
                <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-2.5">
                  {service.addons.map((a, i) => {
                    const price = a.priceRate !== undefined ? `+${Math.round(a.priceRate * 100)}%` : a.per ? `${rand(a.price!)}/${a.per}` : `+${rand(a.price!)}`
                    const on = !!sel.addons[a.id]
                    return (
                      <button key={a.id} type="button" aria-pressed={on} data-q-option onClick={() => toggleAddon(a.id)} className="q-tile min-h-[44px] items-center gap-3 px-3.5 py-2 sm:px-4 sm:py-3">
                        <span className={`inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border transition-colors ${on ? 'border-teal-500 bg-teal-500 text-navy-950' : 'border-white/30'}`}>{on ? <Icon name="check" size={14} /> : null}</span>
                        <span className="min-w-0 flex-1 text-[0.875rem] leading-snug sm:text-[0.9375rem]">{a.name}</span>
                        <span className="flex-none font-mono text-[0.8125rem] text-white/65">{price}</span>
                        <span className="q-key hidden lg:inline-flex">{i + 1}</span>
                      </button>
                    )
                  })}
                </div>
                <Continue onClick={() => go(nextOf('extras'))} label={Object.keys(sel.addons).length ? 'Continue' : 'Skip, no extras'} />
              </Question>
            ) : null}

            {view === 'monthly' && sel && service ? (
              <Question refEl={headingRef} title={<>Want us to <span className="accent-serif text-teal-500">look after it?</span></>} hint="Optional monthly support. Cancel any time.">
                <div className="grid gap-2.5">
                  {service.monthly.map((m, i) => {
                    const on = sel.monthly.includes(m.id)
                    return (
                      <button key={m.id} type="button" aria-pressed={on} data-q-option onClick={() => toggleMonthly(m.id)} className="q-tile items-center gap-3 p-4 sm:p-5">
                        <span className={`inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border transition-colors ${on ? 'border-teal-500 bg-teal-500 text-navy-950' : 'border-white/30'}`}>{on ? <Icon name="check" size={14} /> : null}</span>
                        <span className="min-w-0 flex-1 leading-snug">{m.name}</span>
                        <span className="flex-none font-mono text-[0.875rem] text-teal-500">{rand(m.price)}/mo</span>
                        <span className="q-key hidden lg:inline-flex">{i + 1}</span>
                      </button>
                    )
                  })}
                </div>
                <Continue onClick={() => go(nextOf('monthly'))} label={sel.monthly.length ? 'Continue' : 'No thanks'} />
              </Question>
            ) : null}

            {view === 'timing' && sel ? (
              <Question refEl={headingRef} title={<>When do you <span className="accent-serif text-teal-500">need it?</span></>} hint="Priority moves your project to the front of the queue.">
                <div role="radiogroup" aria-label="Timing" className="grid gap-3 sm:grid-cols-2">
                  {[false, true].map((priority, i) => {
                    const est = computeEstimate({ ...sel, priority })
                    return (
                      <button key={String(priority)} type="button" role="radio" aria-checked={sel.priority === priority} data-q-option onClick={() => pickTiming(priority)} className="q-tile flex-col p-5 sm:p-6">
                        <span className="flex w-full items-center justify-between"><Icon name={priority ? 'zap' : 'calendar'} size={22} className="text-teal-500" /><span className="q-key hidden lg:inline-flex">{i + 1}</span></span>
                        <span className="mt-4 block text-[1.125rem] font-semibold">{priority ? 'Priority' : 'Standard'}</span>
                        <span className="mt-1 block text-[1.75rem] font-semibold tracking-tight">about {est.weeks} week{est.weeks === 1 ? '' : 's'}</span>
                        <span className="mt-1 block text-[0.875rem] text-white/60">{priority ? `+${Math.round((PRICEBOOK.rules.rush.multiplier - 1) * 100)}% on the build price` : 'No extra cost'}</span>
                      </button>
                    )
                  })}
                </div>
              </Question>
            ) : null}

            {view === 'result' && sel && service && estimate && tier ? (
              <Result refEl={headingRef} sel={sel} service={service} tierName={tier.name} estimate={estimate} steps={steps}
                onEdit={(s) => go(s)} onEmail={() => go('details')} onBreakdown={() => sheetRef.current?.showModal()} whatsapp={whatsappLink(`Hi Tshedza, I used your instant quote. ${summaryText()}`)} />
            ) : null}

            {view === 'details' && estimate ? (
              <Question refEl={headingRef} title={<>Where should we <span className="accent-serif text-teal-500">send it?</span></>} hint="We’ll email a PDF of this estimate. No spam, no mailing list.">
                <form noValidate onSubmit={onSubmit} className="grid max-w-2xl gap-3 sm:gap-4">
                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                    <DarkField id="name" label="Your name" autoComplete="name" error={errors.name} />
                    <DarkField id="email" label="Email" type="email" autoComplete="email" error={errors.email} />
                  </div>
                  <DarkField id="phone" label="WhatsApp number" optional type="tel" autoComplete="tel" error={errors.phone} />
                  <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
                  <div>
                    <label className={`flex gap-3 text-[0.875rem] leading-relaxed ${errors.consent ? 'text-[#ff8a80]' : 'text-white/70'}`}>
                      <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 flex-none accent-[#1da1c2]" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'consent-error' : undefined} />
                      <span>I’m happy for TshedzaWebDev to use these details to send this estimate and contact me about it (<Link href="/privacy/" className="text-teal-500 underline underline-offset-2">Privacy Policy</Link>).</span>
                    </label>
                    {errors.consent ? <p id="consent-error" className="sr-only">{errors.consent}</p> : null}
                  </div>
                  {send.kind === 'error' ? (
                    <div role="alert" className="flex gap-3 rounded-[14px] border border-[#ff8a80]/40 bg-[#ff8a80]/10 p-4 text-[0.9375rem] text-white/90">
                      <Icon name="alert" size={18} className="mt-0.5 flex-none text-[#ff8a80]" />
                      <p>{send.message} <a href={whatsappLink(`Hi Tshedza, I used your instant quote. ${summaryText()}`)} className="font-semibold text-teal-500 underline" rel="noopener">Send it on WhatsApp instead</a>.</p>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button type="submit" className="btn btn-accent glow-border h-[52px] px-7" disabled={send.kind === 'sending'}>
                      {send.kind === 'sending' ? <><Spinner /> Sending…</> : <>Email me the PDF <Icon name="arrowRight" size={18} /></>}
                    </button>
                    <span className="hidden text-[0.875rem] text-white/55 sm:inline">{estimate.oneOff > 0 ? `${rand(estimate.low)} – ${rand(estimate.high)}` : ''}{estimate.monthly > 0 ? `${estimate.oneOff > 0 ? ' + ' : ''}${rand(estimate.monthly)}/mo` : ''}</span>
                  </div>
                </form>
              </Question>
            ) : null}

            {view === 'sent' && send.kind === 'sent' ? (
              <div className="mx-auto max-w-xl text-center">
                <span className="q-pop mx-auto inline-flex h-16 w-16 items-center sm:h-20 sm:w-20 justify-center rounded-full bg-teal-500 text-navy-950 shadow-[0_20px_60px_-15px_rgba(29,161,194,0.9)]"><Icon name="check" size={40} /></span>
                <h2 ref={headingRef} tabIndex={-1} className="mt-5 text-[clamp(1.875rem,4vw+1rem,3.25rem)] font-semibold sm:mt-8 leading-[1.02] tracking-[-0.035em] text-white outline-none">
                  {send.emailed ? <>It’s in your <span className="accent-serif text-teal-500">inbox.</span></> : <>We’ve got it. <span className="accent-serif text-teal-500">Thank you.</span></>}
                </h2>
                <p className="mt-4 text-white/70">Estimate <strong className="font-mono text-white">{send.ref}</strong>{send.emailed ? ' is on its way. Check your spam folder if you don’t see it.' : ' is saved. We’ll email it to you shortly.'}</p>
                <ol className="glass mx-auto mt-5 grid max-w-md gap-2.5 rounded-[22px] p-4 sm:mt-8 sm:gap-3 sm:p-5 text-left text-[0.9375rem] text-white/80">
                  {['We read your choices and any questions.', 'We contact you to talk it through.', 'You get a written quote with a fixed price.'].map((t, i) => (
                    <li key={t} className="flex gap-3"><span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-teal-500/20 font-mono text-[0.75rem] text-teal-500">{i + 1}</span>{t}</li>
                  ))}
                </ol>
                <div className="mt-5 flex flex-wrap justify-center gap-3 sm:mt-8">
                  <a href={whatsappLink(`Hi Tshedza, I just sent estimate ${send.ref} from your website.`)} className="btn btn-accent" rel="noopener"><Icon name="whatsapp" size={18} /> Chat on WhatsApp</a>
                  <button type="button" className="btn btn-on-dark" onClick={() => { setSend({ kind: 'idle' }); setDir('back'); writeHash('#', true) }}>Start a new quote</button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer line: keyboard help on desktop, honest small print everywhere. */}
        <div className="hidden items-center justify-between gap-4 border-t border-white/10 py-3 text-[0.75rem] text-white/45 lg:flex">
          <span>An estimate, not a quote. Final price confirmed in writing.</span>
          <span className="hidden items-center gap-1.5 lg:flex"><span className="q-key">1</span>–<span className="q-key">9</span> choose <span className="q-key ml-2">Enter</span> continue <span className="q-key ml-2">Esc</span> back</span>
        </div>
      </div>

      {/* Breakdown: a sheet over the result, so the result screen never scrolls. */}
      <dialog ref={sheetRef} className="q-sheet" aria-labelledby="breakdown-title" onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close() }}>
        {estimate ? (
          <div className="glass rounded-[inherit] bg-navy-900/90 p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 id="breakdown-title" className="text-[1.25rem] font-semibold">The breakdown</h2>
              <button type="button" onClick={() => sheetRef.current?.close()} className="glass-inset inline-flex h-10 w-10 items-center justify-center rounded-full" aria-label="Close the breakdown"><Icon name="close" size={18} /></button>
            </div>
            <ul className="mt-5 grid gap-3 text-[0.9375rem]">
              {estimate.lines.map((l) => (
                <li key={l.label} className="flex justify-between gap-4"><span><span className="text-white/90">{l.label}</span>{l.detail ? <span className="block text-[0.8125rem] text-white/50">{l.detail}</span> : null}</span><span className="font-mono tabular-nums">{rand(l.amount)}</span></li>
              ))}
              {estimate.oneOff > 0 ? <li className="flex justify-between gap-4 border-t border-white/10 pt-3 font-semibold"><span>Build total</span><span className="font-mono tabular-nums">{rand(estimate.oneOff)}</span></li> : null}
              {estimate.monthlyLines.map((l) => (
                <li key={l.label} className="flex justify-between gap-4"><span className="text-white/90">{l.label}</span><span className="font-mono tabular-nums">{rand(l.amount)}/mo</span></li>
              ))}
            </ul>
            {estimate.oneOff > 0 ? <p className="mt-5 text-[0.8125rem] leading-relaxed text-white/55">Your range ({rand(estimate.low)} – {rand(estimate.high)}) allows for details we confirm together. Estimates are valid {PRICEBOOK.rules.estimateValidDays} days. {SITE.vatNote}.</p> : null}
          </div>
        ) : null}
      </dialog>
    </section>
  )
}

// ── Pieces ────────────────────────────────────────────────────────────────────
function Question({ title, hint, hintDesktopOnly = false, children, refEl }: { title: React.ReactNode; hint?: string; hintDesktopOnly?: boolean; children: React.ReactNode; refEl: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <div>
      <h2 ref={refEl} tabIndex={-1} className="text-[clamp(1.75rem,3.4vw+0.75rem,3.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-white outline-none">{title}</h2>
      {hint ? <p className={`mt-1.5 ${hintDesktopOnly ? "max-sm:hidden " : ""}text-[0.875rem] leading-snug text-white/60 sm:mt-3 sm:text-[1.0625rem]`}>{hint}</p> : null}
      <div className="mt-4 sm:mt-8">{children}</div>
    </div>
  )
}

function Continue({ onClick, label = 'Continue' }: { onClick: () => void; label?: string }) {
  return (
    <div className="mt-4 flex items-center gap-4 sm:mt-8">
      <button type="button" data-q-continue onClick={onClick} className="btn btn-accent glow-border h-[52px] px-7">{label} <Icon name="arrowRight" size={18} /></button>
      <span className="hidden items-center gap-1.5 text-[0.8125rem] text-white/45 lg:flex">or press <span className="q-key">Enter ↵</span></span>
    </div>
  )
}

function PricePill({ low, high, monthly, oneOff }: { low: number; high: number; monthly: number; oneOff: number }) {
  const l = useTweened(low)
  const h = useTweened(high)
  const m = useTweened(monthly)
  return (
    <div className="glass flex-none rounded-full px-3.5 py-2 text-right sm:px-5" aria-live="polite">
      <span className="sr-only">Current estimate: </span>
      <span className="block font-mono text-[0.625rem] uppercase tracking-[0.14em] text-teal-500 max-sm:hidden">Live estimate</span>
      <span className="block text-[0.8125rem] font-semibold tabular-nums text-white sm:text-[0.9375rem]">
        {oneOff > 0 ? <>{rand(l)}<span className="max-sm:hidden"> – {rand(h)}</span></> : null}
        {monthly > 0 ? <span className={oneOff > 0 ? 'font-normal text-white/70 max-sm:hidden' : ''}>{oneOff > 0 ? ' + ' : ''}{rand(m)}/mo</span> : null}
      </span>
    </div>
  )
}

function UnitPicker({ sel, unit, included, onChange }: { sel: Selection; unit: NonNullable<ServiceBook['unit']>; included?: number; onChange: (n: number) => void }) {
  const clamp = (n: number) => Math.min(unit.max, Math.max(unit.min, Math.round(n) || unit.min))
  const presets = (PRESETS[unit.name] ?? []).filter((n) => n >= unit.min && n <= unit.max)
  const sliderMax = Math.min(unit.max, Math.max(presets.at(-1) ?? unit.max, sel.units))
  const pct = ((Math.min(sel.units, sliderMax) - unit.min) / Math.max(1, sliderMax - unit.min)) * 100
  return (
    <div className="glass max-w-2xl rounded-[24px] p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={() => onChange(clamp(sel.units - 1))} disabled={sel.units <= unit.min} aria-label={`Fewer ${unit.plural}`} className="glass-inset inline-flex h-12 w-12 flex-none items-center justify-center rounded-full text-white disabled:opacity-30"><Icon name="minus" size={20} /></button>
        <label className="flex flex-1 flex-col items-center">
          <span className="sr-only">Number of {unit.plural}</span>
          <input type="number" inputMode="numeric" min={unit.min} max={unit.max} value={sel.units} onChange={(e) => onChange(clamp(Number(e.target.value)))}
            className="w-full max-w-[220px] bg-transparent text-center text-[clamp(3rem,8vw,4.5rem)] font-semibold leading-none tracking-[-0.04em] text-white tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
          <span className="mt-1 text-[0.875rem] text-white/60">{sel.units === 1 ? unit.name : unit.plural}{included !== undefined ? (sel.units <= included ? ' · included' : ` · ${sel.units - included} extra`) : ''}</span>
        </label>
        <button type="button" onClick={() => onChange(clamp(sel.units + 1))} disabled={sel.units >= unit.max} aria-label={`More ${unit.plural}`} className="glass-inset inline-flex h-12 w-12 flex-none items-center justify-center rounded-full text-white disabled:opacity-30"><Icon name="plus" size={20} /></button>
      </div>
      <input type="range" min={unit.min} max={sliderMax} value={Math.min(sel.units, sliderMax)} onChange={(e) => onChange(clamp(Number(e.target.value)))} aria-label={`Number of ${unit.plural}`}
        className="range-teal mt-6 w-full" style={{ '--pct': `${pct}%` } as React.CSSProperties} />
      {presets.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {presets.map((n) => (
            <button key={n} type="button" onClick={() => onChange(n)} aria-pressed={sel.units === n} className={`rounded-full border px-4 py-1.5 text-[0.875rem] tabular-nums transition-colors ${sel.units === n ? 'border-teal-500 bg-teal-500 text-navy-950' : 'border-white/20 text-white/75 hover:border-white/40 hover:text-white'}`}>{n}</button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function Result({ refEl, sel, service, tierName, estimate, steps, onEdit, onEmail, onBreakdown, whatsapp }: {
  refEl: React.RefObject<HTMLHeadingElement | null>; sel: Selection; service: ServiceBook; tierName: string; estimate: ReturnType<typeof computeEstimate>; steps: StepId[]
  onEdit: (s: StepId) => void; onEmail: () => void; onBreakdown: () => void; whatsapp: string
}) {
  const low = useTweened(estimate.low, 700)
  const high = useTweened(estimate.high, 700)
  const monthly = useTweened(estimate.monthly, 700)
  const extras = service.addons.filter((a) => sel.addons[a.id]).length
  const chips: { step: StepId; label: string }[] = [
    { step: 'service', label: service.name },
    { step: 'tier', label: tierName },
    ...(service.unit && steps.includes('units') ? [{ step: 'units' as StepId, label: `${sel.units} ${sel.units === 1 ? service.unit.name : service.unit.plural}` }] : []),
    ...(steps.includes('extras') ? [{ step: 'extras' as StepId, label: extras ? `${extras} extra${extras === 1 ? '' : 's'}` : 'No extras' }] : []),
    ...(steps.includes('monthly') ? [{ step: 'monthly' as StepId, label: sel.monthly.length ? 'Monthly support' : 'No monthly support' }] : []),
    ...(steps.includes('timing') ? [{ step: 'timing' as StepId, label: sel.priority ? 'Priority' : 'Standard timing' }] : []),
  ]
  return (
    <div className="grid items-center gap-5 sm:gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <p className="eyebrow">Your estimate</p>
        <h2 ref={refEl} tabIndex={-1} className="mt-3 font-semibold leading-[0.95] tracking-[-0.045em] text-white outline-none" aria-live="polite">
          {estimate.oneOff > 0 ? (
            <span className="block whitespace-nowrap text-[clamp(1.875rem,8.2vw,5.5rem)] tabular-nums">{rand(low)}<span className="text-white/35"> – </span>{rand(high)}</span>
          ) : null}
          {estimate.monthly > 0 ? (
            <span className={`block tabular-nums ${estimate.oneOff > 0 ? 'mt-2 text-[clamp(1.25rem,2vw+0.75rem,1.75rem)] font-medium tracking-tight text-white/75' : 'text-[clamp(2.5rem,7vw+0.5rem,5.5rem)]'}`}>
              {estimate.oneOff > 0 ? '+ ' : ''}{rand(monthly)}<span className="text-[0.5em] font-normal text-white/55">/month</span>
            </span>
          ) : null}
        </h2>
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.875rem] sm:mt-6 sm:gap-x-8 sm:text-[0.9375rem]">
          <div><dt className="text-white/50">Timeline</dt><dd className="font-medium text-white">About {estimate.weeks} week{estimate.weeks === 1 ? '' : 's'}</dd></div>
          <div><dt className="text-white/50">Deposit to start</dt><dd className="font-medium tabular-nums text-white">{estimate.deposit ? rand(estimate.deposit) : 'None'}</dd></div>
          <div><dt className="text-white/50">VAT</dt><dd className="font-medium text-white">None added</dd></div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-7 sm:gap-2" aria-label="Your choices: tap one to change it">
          {chips.map((c) => (
            <button key={c.step} type="button" onClick={() => onEdit(c.step)} className="glass group inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.75rem] text-white/85 hover:text-white sm:gap-2 sm:px-3.5 sm:py-1.5 sm:text-[0.8125rem]">
              {c.label}<Icon name="pen" size={12} className="text-white/40 group-hover:text-teal-500" />
            </button>
          ))}
        </div>
        {service.disclaimer ? <p className="mt-5 flex gap-2 text-[0.8125rem] text-[#f7c08a]"><Icon name="info" size={16} className="mt-0.5 flex-none" />{service.disclaimer}</p> : null}
      </div>

      <div className="glass rounded-[22px] p-3 lg:col-span-5 lg:rounded-[28px] lg:p-7">
        <p className="hidden text-[1.0625rem] font-semibold text-white lg:block">Happy with this?</p>
        <p className="mt-1 hidden text-[0.9375rem] text-white/60 lg:block">Keep a copy, or talk it through with the person who’ll build it.</p>
        <div className="grid grid-cols-2 gap-2 lg:mt-5 lg:grid-cols-1 lg:gap-2.5">
          <button type="button" data-q-continue onClick={onEmail} className="btn btn-accent glow-border w-full px-3"><Icon name="download" size={18} /> Email<span className="max-sm:hidden"> me the</span> PDF</button>
          <a href={whatsapp} className="btn btn-on-dark w-full px-3" rel="noopener"><Icon name="whatsapp" size={18} /> <span className="max-sm:hidden">Discuss on </span>WhatsApp</a>
          <button type="button" onClick={onBreakdown} className="col-span-2 mt-1 inline-flex items-center justify-center gap-1.5 text-[0.875rem] font-medium text-teal-500 hover:text-white lg:col-span-1">See the breakdown <Icon name="arrowUpRight" size={14} /></button>
        </div>
        <p className="mt-3 text-center text-[0.75rem] text-white/45 lg:hidden">An estimate, not a quote. Final price confirmed in writing.</p>
      </div>
    </div>
  )
}

function DarkField({ id, label, type = 'text', autoComplete, optional, error }: { id: string; label: string; type?: string; autoComplete?: string; optional?: boolean; error?: string }) {
  return (
    <div>
      {/* The error sits on the label line, so a failed submit never makes the screen taller. */}
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="field-label mb-0 text-white/85">{label} {optional ? <span className="font-normal text-white/45">(optional)</span> : null}</label>
        {error ? <span id={`${id}-error`} className="inline-flex items-center gap-1 text-[0.8125rem] text-[#ff8a80]"><Icon name="alert" size={14} />{error}</span> : null}
      </div>
      <input id={id} name={id} type={type} autoComplete={autoComplete} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className="field field-dark" />
    </div>
  )
}

function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950" aria-hidden="true" />
}
