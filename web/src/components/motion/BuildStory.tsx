'use client'

import { useEffect, useRef, useState } from 'react'
import { PRICEBOOK, computeEstimate, rand } from '@/lib/quote/engine'
import { Icon } from '../Icon'
import { useInView } from './basics'

// "How it works": what each of the four steps looks like for the client.
//
// Phones (< lg): one device card per step, with its text directly underneath. Nothing is
// pinned: on a phone a pinned device plus the header and the bottom dock leaves too little
// room, and the text drifts out of sync with the device (tested by scrolling it in 40 px
// steps). Each card plays its step as it scrolls into view; step 3's blueprint wipes to
// the finished design as the card moves up the screen (CSS scroll-driven --wipe).
//
// Desktop (lg+): the device stays pinned (position: sticky, native scrolling) beside the
// steps. The current step is the one whose title you are reading (past ~60% of the
// screen), so the device always matches the text.
//
// The step text is the real content; the devices are illustration (aria-hidden).

interface Step { title: string; body: string }

const LABELS = ['Message', 'Quote', 'Design & build', 'Live']
const URLS = ['wa.me/27699513836', 'tshedzawebdev.co.za/quote', 'design → code', 'yourbusiness.co.za']

// The quote card uses the real price book, the same numbers as /quote.
const web = PRICEBOOK.services.find((s) => s.id === 'website')
const UNITS = web?.unit?.default ?? 5
const EST = computeEstimate({ service: 'website', tier: 'business', units: UNITS, addons: {}, monthly: [], priority: false })
const TIER = web?.tiers.find((t) => t.id === 'business')?.name ?? 'Business website'

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const seq = (n: number) => ({ '--i': n }) as React.CSSProperties

export function BuildStory({ steps }: { steps: Step[] }) {
  return (
    <>
      <ol className="grid gap-12 sm:gap-14 lg:hidden">
        {steps.map((s, k) => <CardStep key={s.title} k={k} step={s} />)}
      </ol>
      <div className="hidden lg:block"><PinnedStory steps={steps} /></div>
    </>
  )
}

/* ── Phones: a card per step ─────────────────────────────────────────────── */

function CardStep({ k, step }: { k: number; step: Step }) {
  const [ref, seen] = useInView<HTMLLIElement>(0.3)
  return (
    <li ref={ref}>
      <Device k={k} className={k === 2 ? 'wipe-scroll' : ''}>
        <div data-on={seen} className="absolute inset-0"><StepScreen k={k} /></div>
      </Device>
      <p className="mt-5 font-mono text-[0.8125rem] tabular-nums text-teal-700">0{k + 1} · {LABELS[k]}</p>
      <h3 className="mt-2 text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] sm:text-[1.75rem]">{step.title}</h3>
      <p className="mt-2 max-w-md text-[1.0625rem] text-ink-2">{step.body}</p>
    </li>
  )
}

/* ── Desktop: pinned device beside the steps ─────────────────────────────── */

function PinnedStory({ steps }: { steps: Step[] }) {
  const listRef = useRef<HTMLOListElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const stage = stageRef.current
      const titles = Array.from(listRef.current?.querySelectorAll('h3') ?? [])
      if (!stage || !titles.length || stage.offsetParent === null) return // hidden below lg
      // The current step is the title nearest the middle of the screen: where you're reading.
      const vh = window.innerHeight
      const centre = (h: Element) => { const r = h.getBoundingClientRect(); return (r.top + r.bottom) / 2 }
      let a = 0, best = Infinity
      titles.forEach((h, k) => { const dist = Math.abs(centre(h) - vh * 0.5); if (dist < best) { best = dist; a = k } })
      setActive(a)
      // Step 3: the blueprint wipes away as its title travels from 75% to 30% of the screen.
      const design = titles[2]
      if (design) stage.style.setProperty('--wipe', String(clamp((vh * 0.75 - centre(design)) / (vh * 0.45))))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])

  return (
    <div className="grid grid-cols-12 gap-x-12">
      <div className="sticky top-28 col-span-6 self-start">
        <Device k={active} stageRef={stageRef} tall>
          {[0, 1, 2, 3].map((k) => (
            <div key={k} data-on={active === k} className={`absolute inset-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-soft)] ${active === k ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}>
              <StepScreen k={k} />
            </div>
          ))}
        </Device>
      </div>
      <ol ref={listRef} className="col-span-5 col-start-8">
        {steps.map((s, k) => (
          <li key={s.title} className={`flex min-h-[58vh] flex-col justify-center border-t border-line py-8 transition-opacity duration-500 first:border-t-0 last:min-h-[48vh] ${k === active ? 'opacity-100' : 'opacity-40'}`}>
            <span className={`font-mono text-[0.8125rem] tabular-nums transition-colors duration-500 ${k === active ? 'text-teal-700' : 'text-ink-3'}`}>0{k + 1} · {LABELS[k]}</span>
            <h3 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.025em]">{s.title}</h3>
            <p className="mt-3 max-w-md text-[1.0625rem] text-ink-2">{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ── Shared pieces ───────────────────────────────────────────────────────── */

function Device({ k, children, className = '', stageRef, tall = false }: { k: number; children: React.ReactNode; className?: string; stageRef?: React.Ref<HTMLDivElement>; tall?: boolean }) {
  return (
    <div ref={stageRef} aria-hidden="true" className={`on-dark overflow-hidden rounded-[22px] border border-white/10 bg-navy-900 text-white shadow-[0_40px_90px_-40px_rgba(10,27,46,0.75)] ${className}`}>
      <div className="flex items-center gap-3 border-b border-white/10 px-3.5 py-2.5">
        <span className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-white/20" /><span className="h-2 w-2 rounded-full bg-white/20" /><span className="h-2 w-2 rounded-full bg-white/20" /></span>
        <span className="min-w-0 flex-1 truncate rounded-full bg-white/[0.06] px-3 py-1 text-center font-mono text-[0.6875rem] text-white/60">{URLS[k]}</span>
        <span className="font-mono text-[0.6875rem] tabular-nums text-teal-500">0{k + 1}/04</span>
      </div>
      <div className={`relative ${tall ? 'h-[380px]' : 'h-[236px] sm:h-[300px]'}`}>{children}</div>
      <div className="flex gap-1 px-3.5 pb-3.5">
        {LABELS.map((l, i) => <span key={l} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= k ? 'bg-teal-500' : 'bg-white/10'}`} />)}
      </div>
    </div>
  )
}

function StepScreen({ k }: { k: number }) {
  if (k === 0) {
    return (
      <div className="seq flex h-full flex-col justify-center gap-2.5 p-4 sm:p-6">
        <Bubble side="them" style={seq(0)}>Hi Tshedza, I need a website for my salon. Can you help?</Bubble>
        <Bubble side="us" style={seq(1)}>Hi! Yes, happily. Start with the instant quote and I’ll follow up with questions.</Bubble>
        <Bubble side="them" style={seq(2)}>Done, answers sent ✓</Bubble>
      </div>
    )
  }
  if (k === 1) {
    return (
      <div className="flex h-full items-center justify-center p-4 sm:p-6">
        <div className="seq w-full max-w-[400px] rounded-[16px] bg-paper p-4 text-ink sm:p-5">
          <div style={seq(0)} className="flex items-center justify-between"><p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-teal-700">Your quote</p><span className="rounded-full bg-success-tint px-2 py-0.5 font-mono text-[0.625rem] text-success">Fixed scope</span></div>
          <div style={seq(1)} className="mt-3 grid gap-1.5 text-[0.8125rem]">
            <div className="flex justify-between"><span className="text-ink-3">Project</span><span className="font-medium">{TIER}</span></div>
            <div className="flex justify-between"><span className="text-ink-3">Size</span><span className="font-medium tabular-nums">{UNITS} pages</span></div>
            <div className="flex justify-between"><span className="text-ink-3">Timeline</span><span className="font-medium">about {EST.weeks} week{EST.weeks === 1 ? '' : 's'}</span></div>
          </div>
          <div style={seq(2)} className="mt-3 border-t border-line pt-3">
            <p className="text-[1.5rem] font-semibold leading-none tracking-tight tabular-nums sm:text-[1.75rem]">{rand(EST.low)} <span className="text-ink-3">–</span> {rand(EST.high)}</p>
            <p className="mt-1.5 text-[0.75rem] text-ink-3">In rand · fixed in writing · a deposit secures your slot</p>
          </div>
        </div>
      </div>
    )
  }
  if (k === 2) {
    return (
      <div className="absolute inset-0 p-3 sm:p-5">
        <div className="relative h-full overflow-hidden rounded-[14px]">
          <MiniDesign />
          <div className="absolute inset-0" style={{ clipPath: 'inset(0 0 0 calc(var(--wipe) * 100%))' }}><MiniWireframe /></div>
          <span className="pointer-events-none absolute inset-y-0 w-[2px] bg-teal-500 shadow-[0_0_18px_4px_rgba(29,161,194,0.75)]" style={{ left: 'calc(var(--wipe) * 100%)', opacity: 'calc(1 - var(--wipe) * var(--wipe) * var(--wipe))' }} />
          <span className="absolute bottom-2 left-2 rounded-full bg-navy-950/80 px-2 py-0.5 font-mono text-[0.625rem] text-white/85">design</span>
          <span className="absolute bottom-2 right-2 rounded-full bg-navy-950/80 px-2 py-0.5 font-mono text-[0.625rem] text-[#9fe3f2]">wireframe</span>
        </div>
      </div>
    )
  }
  return (
    <div className="seq flex h-full flex-col justify-center gap-2 p-4 sm:gap-2.5 sm:p-6">
      {['Tested on real phones', 'Inside its weight budget', 'Accessibility checked', 'SEO, sitemap & privacy page'].map((c, i) => (
        <p key={c} style={seq(i)} className="flex items-center gap-2.5 text-[0.8125rem] text-white/85 sm:text-[0.9375rem]"><span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success/25 text-[#5fd3a3]"><Icon name="check" size={12} /></span>{c}</p>
      ))}
      <div style={seq(4)} className="mt-1 flex items-center justify-between rounded-[12px] border border-teal-500/40 bg-teal-500/10 px-3.5 py-2.5">
        <span className="flex items-center gap-2 text-[0.875rem] font-semibold"><span className="pulse-dot h-2 w-2 rounded-full bg-[#5fd3a3]" />Live</span>
        <span className="font-mono text-[0.75rem] text-white/70">yourbusiness.co.za</span>
      </div>
    </div>
  )
}

function Bubble({ side, style, children }: { side: 'them' | 'us'; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <p style={style} className={`max-w-[85%] rounded-[16px] px-3.5 py-2 text-[0.8125rem] leading-snug sm:text-[0.9375rem] ${side === 'them' ? 'self-start rounded-tl-[5px] bg-white/10 text-white/90' : 'self-end rounded-tr-[5px] bg-teal-500 text-navy-950'}`}>{children}</p>
  )
}

function MiniDesign() {
  return (
    <div className="absolute inset-0 flex flex-col gap-2 bg-paper p-3 text-ink sm:gap-3 sm:p-4">
      <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded-[4px] bg-navy-900" /><span className="h-1.5 w-12 rounded-full bg-ink/70" /></span><span className="h-4 w-14 rounded-full bg-teal-500" /></div>
      <div className="grid flex-1 grid-cols-[1.15fr_1fr] gap-2.5">
        <div className="flex flex-col justify-center">
          <p className="text-[0.95rem] font-semibold leading-[1.05] tracking-tight sm:text-[1.25rem]">Look good,<br /><span className="accent-serif text-teal-700">feel better.</span></p>
          <span className="mt-2 h-1.5 w-[85%] rounded-full bg-line" /><span className="mt-1 h-1.5 w-[60%] rounded-full bg-line" />
          <span className="mt-2.5 h-5 w-20 rounded-full bg-navy-900" />
        </div>
        <div className="rounded-[10px] bg-[linear-gradient(140deg,#0a1b2e,#1e3a57_55%,#1da1c2)]" />
      </div>
      <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <div key={i} className="rounded-[8px] border border-line bg-card p-2"><span className="block h-3 w-3 rounded bg-teal-100" /><span className="mt-1.5 block h-1.5 w-[70%] rounded-full bg-line" /></div>)}</div>
    </div>
  )
}

function MiniWireframe() {
  return (
    <div className="blueprint absolute inset-0 flex flex-col gap-2 p-3 sm:gap-3 sm:p-4">
      <div className="flex items-center justify-between"><span className="wire h-3.5 w-16" /><span className="wire h-4 w-14 rounded-full" /></div>
      <div className="grid flex-1 grid-cols-[1.15fr_1fr] gap-2.5">
        <div className="flex flex-col justify-center gap-1.5"><span className="wire h-4 w-[80%]" /><span className="wire h-4 w-[60%]" /><span className="wire mt-1 h-1.5 w-[85%]" /><span className="wire h-5 w-20 rounded-full" /></div>
        <div className="wire relative"><span className="absolute inset-0 m-auto h-px w-[130%] -rotate-[32deg] bg-[#9fe3f2]/40" /><span className="absolute inset-0 m-auto h-px w-[130%] rotate-[32deg] bg-[#9fe3f2]/40" /></div>
      </div>
      <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <div key={i} className="wire h-9" />)}</div>
    </div>
  )
}
