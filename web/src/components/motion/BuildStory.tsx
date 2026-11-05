'use client'

import { useEffect, useRef, useState } from 'react'
import { PRICEBOOK, computeEstimate, rand } from '@/lib/quote/engine'
import { Icon } from '../Icon'

// "How it works" as a scroll story. A device stays pinned (position: sticky, native
// scrolling, nothing hijacked) while the four steps scroll past; it shows what that
// step looks like for the client. In step 3 a blueprint wipes away to the finished
// design as you scroll (--wipe, set on the element so React doesn't re-render per frame).
// The step text is the real content; the device is illustration (aria-hidden).

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
  const listRef = useRef<HTMLOListElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const items = Array.from(listRef.current?.children ?? []) as HTMLElement[]
      const stage = stageRef.current
      if (!items.length || !stage) return
      const vh = window.innerHeight
      const sr = stage.getBoundingClientRect()
      // Phones: the device is pinned at the top, so a step is "current" once it is
      // well below the device. Desktop: just past the middle of the screen.
      const line = window.innerWidth < 1024 ? Math.min(vh * 0.8, sr.bottom + (vh - sr.bottom) * 0.36) : vh * 0.56
      let a = 0
      items.forEach((el, k) => { if (el.getBoundingClientRect().top < line) a = k })
      setActive(a)
      const design = items[2]
      if (design) {
        const r = design.getBoundingClientRect()
        stage.style.setProperty('--wipe', String(clamp((line - r.top) / Math.max(1, r.height * 0.8))))
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])

  return (
    <div className="grid gap-x-12 lg:grid-cols-12">
      {/* The pinned device */}
      <div className="sticky top-14 z-10 -mx-5 bg-[linear-gradient(var(--color-paper)_90%,transparent)] px-5 pb-6 pt-4 md:-mx-8 md:px-8 lg:top-28 lg:col-span-6 lg:mx-0 lg:self-start lg:bg-none lg:px-0 lg:pb-0 lg:pt-0">
        <div ref={stageRef} aria-hidden="true" className="on-dark overflow-hidden rounded-[22px] border border-white/10 bg-navy-900 text-white shadow-[0_40px_90px_-40px_rgba(10,27,46,0.75)] [--wipe:0]">
          <div className="flex items-center gap-3 border-b border-white/10 px-3.5 py-2.5">
            <span className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-white/20" /><span className="h-2 w-2 rounded-full bg-white/20" /><span className="h-2 w-2 rounded-full bg-white/20" /></span>
            <span className="min-w-0 flex-1 truncate rounded-full bg-white/[0.06] px-3 py-1 text-center font-mono text-[0.6875rem] text-white/60 transition-all duration-500">{URLS[active]}</span>
            <span className="font-mono text-[0.6875rem] tabular-nums text-teal-500">0{active + 1}/04</span>
          </div>

          <div className="relative h-[232px] sm:h-[300px] lg:h-[380px]">
            {/* 1 · The first message */}
            <Layer on={active === 0}>
              <div className="seq flex h-full flex-col justify-center gap-2.5 p-4 sm:p-6">
                <Bubble side="them" style={seq(0)}>Hi Tshedza, I need a website for my salon. Can you help?</Bubble>
                <Bubble side="us" style={seq(1)}>Hi! Yes, happily. Start with the instant quote and I’ll follow up with questions.</Bubble>
                <Bubble side="them" style={seq(2)}>Done, answers sent ✓</Bubble>
              </div>
            </Layer>

            {/* 2 · A clear quote (real price book numbers) */}
            <Layer on={active === 1}>
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
                    <p className="mt-1.5 text-[0.75rem] text-ink-3">In rand · no VAT · a deposit secures your slot</p>
                  </div>
                </div>
              </div>
            </Layer>

            {/* 3 · Blueprint → finished design, wiped by scroll */}
            <Layer on={active === 2}>
              <div className="absolute inset-0 p-3 sm:p-5">
                <div className="relative h-full overflow-hidden rounded-[14px]">
                  <MiniDesign />
                  <div className="absolute inset-0" style={{ clipPath: 'inset(0 0 0 calc(var(--wipe) * 100%))' }}><MiniWireframe /></div>
                  <span className="pointer-events-none absolute inset-y-0 w-[2px] bg-teal-500 shadow-[0_0_18px_4px_rgba(29,161,194,0.75)]" style={{ left: 'calc(var(--wipe) * 100%)', opacity: 'calc(1 - var(--wipe) * var(--wipe) * var(--wipe))' }} />
                  <span className="absolute bottom-2 left-2 rounded-full bg-navy-950/80 px-2 py-0.5 font-mono text-[0.625rem] text-white/85">design</span>
                  <span className="absolute bottom-2 right-2 rounded-full bg-navy-950/80 px-2 py-0.5 font-mono text-[0.625rem] text-[#9fe3f2]">wireframe</span>
                </div>
              </div>
            </Layer>

            {/* 4 · Launch */}
            <Layer on={active === 3}>
              <div className="seq flex h-full flex-col justify-center gap-2 p-4 sm:gap-2.5 sm:p-6">
                {['Tested on real phones', 'Inside its weight budget', 'Accessibility checked', 'SEO, sitemap & privacy page'].map((c, k) => (
                  <p key={c} style={seq(k)} className="flex items-center gap-2.5 text-[0.8125rem] text-white/85 sm:text-[0.9375rem]"><span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success/25 text-[#5fd3a3]"><Icon name="check" size={12} /></span>{c}</p>
                ))}
                <div style={seq(4)} className="mt-1 flex items-center justify-between rounded-[12px] border border-teal-500/40 bg-teal-500/10 px-3.5 py-2.5">
                  <span className="flex items-center gap-2 text-[0.875rem] font-semibold"><span className="pulse-dot h-2 w-2 rounded-full bg-[#5fd3a3]" />Live</span>
                  <span className="font-mono text-[0.75rem] text-white/70">yourbusiness.co.za</span>
                </div>
              </div>
            </Layer>
          </div>

          <div className="flex gap-1 px-3.5 pb-3.5">
            {LABELS.map((l, k) => <span key={l} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${k <= active ? 'bg-teal-500' : 'bg-white/10'}`} />)}
          </div>
        </div>
      </div>

      {/* The steps (real content) */}
      <ol ref={listRef} className="lg:col-span-5 lg:col-start-8">
        {steps.map((s, k) => (
          <li key={s.title} className={`flex min-h-[44svh] flex-col border-t border-line pb-10 pt-7 transition-opacity duration-500 first:border-t-0 lg:min-h-[64vh] lg:justify-center lg:py-8 ${k === active ? 'opacity-100' : 'opacity-40'}`}>
            <span className={`font-mono text-[0.8125rem] tabular-nums transition-colors duration-500 ${k === active ? 'text-teal-700' : 'text-ink-3'}`}>0{k + 1} · {LABELS[k]}</span>
            <h3 className="mt-3 text-[1.625rem] font-semibold leading-tight tracking-[-0.025em] sm:text-[2rem]">{s.title}</h3>
            <p className="mt-3 max-w-md text-[1.0625rem] text-ink-2">{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Layer({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div data-on={on} className={`absolute inset-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-soft)] ${on ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}>
      {children}
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
      <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((k) => <div key={k} className="rounded-[8px] border border-line bg-card p-2"><span className="block h-3 w-3 rounded bg-teal-100" /><span className="mt-1.5 block h-1.5 w-[70%] rounded-full bg-line" /></div>)}</div>
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
      <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((k) => <div key={k} className="wire h-9" />)}</div>
    </div>
  )
}
