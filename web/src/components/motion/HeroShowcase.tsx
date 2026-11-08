'use client'

import { useRef } from 'react'
import { Icon, type IconName } from '../Icon'
import { useWordControl, useWordIndex } from './basics'

// The phone-sized hero's visual. A phone mock-up inside a phone makes no sense, so on
// phones the interface comes out of the device: the pieces of each build float freely
// on the hero and assemble scene by scene, in step with the headline word (<WordCycle>).
// Tap a tab (or swipe the stage) and the headline follows: tap "Store" and it reads
// "We build online stores". A tap holds that scene for a while before the cycle resumes.

const TABS: { label: string; icon: IconName; summary: string }[] = [
  { label: 'Website', icon: 'monitor', summary: 'Websites: found on Google, quick on mobile data, with online booking and WhatsApp built in.' },
  { label: 'Store', icon: 'bag', summary: 'Online stores: products, a bag, South African payments and an alert for every paid order.' },
  { label: 'Web app', icon: 'layers', summary: 'Web apps: your bookings, payments and invoices on one live dashboard.' },
  { label: 'Automation', icon: 'zap', summary: 'Automations: a new enquiry gets an AI-drafted reply you approve with one tap, any time of day.' },
]

const v = (n: number) => ({ '--i': n }) as React.CSSProperties
const at = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

export function HeroShowcase({ className = '' }: { className?: string }) {
  const word = (useWordIndex() ?? 0) % TABS.length
  const control = useWordControl()
  const start = useRef<{ x: number; y: number } | null>(null)
  const pick = (k: number) => control?.select(k)

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (word + step + TABS.length) % TABS.length
    pick(next)
    e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div className={`mx-auto w-full max-w-[440px] ${className}`}>
      <div role="tablist" aria-label="What we build" onKeyDown={onKeyDown} className="glass grid grid-cols-4 gap-1 rounded-full p-1">
        {TABS.map((t, k) => {
          const on = k === word
          return (
            <button key={t.label} type="button" role="tab" id={`show-tab-${k}`} aria-selected={on} aria-controls="show-panel" tabIndex={on ? 0 : -1} onClick={() => pick(k)}
              className={`relative flex flex-col items-center gap-0.5 rounded-full px-1 pb-2 pt-1.5 text-[0.75rem] font-semibold transition-colors duration-300 ${on ? 'bg-white/[0.13] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]' : 'text-white/55'}`}>
              <Icon name={t.icon} size={15} className={on ? 'text-teal-500' : ''} />
              <span className="leading-none">{t.label}</span>
              {/* The countdown to the next scene; full and still while a picked scene is held. */}
              {on ? (
                control?.running
                  ? <span key={control.lap} className="tab-progress" style={{ animationDuration: `${control.interval}ms` }} />
                  : <span className="tab-progress tab-progress-full" />
              ) : null}
            </button>
          )
        })}
      </div>

      <div id="show-panel" role="tabpanel" aria-labelledby={`show-tab-${word}`}
        onPointerDown={(e) => { start.current = { x: e.clientX, y: e.clientY } }}
        onPointerUp={(e) => {
          const s = start.current; start.current = null
          if (!s) return
          const dx = e.clientX - s.x
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y)) pick(word + (dx < 0 ? 1 : -1))
        }}
        className="showcase-stage relative mt-4 h-[310px] touch-pan-y select-none">
        <p className="sr-only">{TABS[word]!.summary}</p>
        <div key={word} aria-hidden="true" className="build-in absolute inset-0">
          {word === 0 ? <SiteScene /> : word === 1 ? <StoreScene /> : word === 2 ? <AppScene /> : <FlowScene />}
        </div>
      </div>
      <p className="mt-1 text-center text-[0.75rem] text-white/40">Tap or swipe to explore</p>
    </div>
  )
}

/* ── Website: found → fast → booked → messaged ──────────────────────────── */
function SiteScene() {
  return (
    <>
      <div style={v(0)} className="absolute left-0 top-0 z-10 w-[80%]">
        <div className="glass-light float-slow rounded-[18px] p-3 text-ink">
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[0.6875rem] text-ink-3 shadow-[inset_0_0_0_1px_rgba(10,27,46,0.08)]">
            <Icon name="search" size={12} />hair salon near me
          </div>
          <p className="mt-2.5 font-mono text-[0.625rem] text-success">yoursalon.co.za</p>
          <p className="text-[0.9375rem] font-semibold leading-tight text-teal-700">Your Salon · Pretoria</p>
          <p className="mt-0.5 text-[0.6875rem] text-ink-2"><span className="tracking-[0.1em] text-[#e8a33d]">★★★★★</span> · Open now · Book online</p>
        </div>
      </div>

      <div style={v(1)} className="absolute right-0 top-[27%] z-20 w-[42%]">
        <div className="glass float-slower rounded-[18px] p-3 text-center">
          <svg viewBox="0 0 80 46" className="mx-auto w-[78%]" aria-hidden="true">
            <path d="M8 42a32 32 0 0 1 64 0" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="7" strokeLinecap="round" />
            <path d="M8 42a32 32 0 0 1 64 0" fill="none" stroke="#1da1c2" strokeWidth="7" strokeLinecap="round" className="gauge-arc" style={{ '--len': 101, '--to': 12, ...at(500) } as React.CSSProperties} />
          </svg>
          <p className="mt-1 text-[0.6875rem] font-semibold leading-tight text-white">Quick on<br />mobile data</p>
        </div>
      </div>

      <div style={v(2)} className="absolute left-[2%] top-[49%] z-30 w-[56%]">
        <div className="glass-light rounded-[18px] p-3 text-ink">
          <p className="flex items-center justify-between text-[0.6875rem] font-semibold"><span className="flex items-center gap-1"><Icon name="calendar" size={12} className="text-teal-700" />Book</span><span className="font-mono text-[0.5625rem] text-ink-3">Sat 14</span></p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {['09:00', '10:00', '11:30'].map((t, k) => (
              <span key={t} style={k === 1 ? at(900) : undefined} className={`rounded-[8px] py-1.5 text-center font-mono text-[0.625rem] tabular-nums ${k === 1 ? 'slot-pick bg-teal-500 font-semibold text-navy-950' : 'border border-line text-ink-2'}`}>{t}</span>
            ))}
          </div>
          <span style={at(1250)} className="pop mt-2 inline-flex items-center gap-1 rounded-full bg-navy-900 px-2.5 py-1 text-[0.625rem] font-semibold text-white"><Icon name="check" size={11} className="text-teal-500" />Booked · 10:00</span>
        </div>
      </div>

      <div style={v(3)} className="absolute bottom-0 right-[1%] z-40 w-[60%]">
        <div className="float-slow flex items-start gap-2 rounded-[18px] rounded-br-[5px] bg-[#dcf8c6] p-2.5 text-navy-950 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.7)]">
          <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#25d366] text-white"><Icon name="whatsapp" size={13} /></span>
          <p className="text-[0.6875rem] leading-snug">Hi! Do you have a slot on Saturday morning?<span className="mt-0.5 block text-right text-[0.5625rem] text-navy-900/50">09:14 ✓✓</span></p>
        </div>
      </div>
    </>
  )
}

/* ── Store: product → bag → paid order ──────────────────────────────────── */
function StoreScene() {
  return (
    <>
      <div style={v(0)} className="absolute left-[3%] top-0 z-10 w-[52%]">
        <div className="glass-light float-slow rounded-[18px] p-2 text-ink">
          <div className="flex h-[104px] items-end justify-center rounded-[13px] bg-gradient-to-br from-[#e3f4f8] to-[#9fd9e8] pb-3"><span className="h-14 w-12 rounded-t-[40%] rounded-b-[8px] bg-white/80 shadow-[0_10px_18px_-8px_rgba(10,27,46,0.45)]" /></div>
          <div className="flex items-center justify-between px-1 pb-0.5 pt-2">
            <span><span className="block text-[0.6875rem] font-medium text-ink-2">Linen shirt</span><span className="font-mono text-[0.75rem] font-semibold tabular-nums">R 349</span></span>
            <span style={at(800)} className="press inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-navy-950"><Icon name="plus" size={14} /></span>
          </div>
        </div>
      </div>

      <span style={v(1)} className="absolute right-[2%] top-[14%] z-20">
        <span className="pop inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-2 text-[0.6875rem] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,0.8)] ring-1 ring-white/20" style={at(1000)}>
          <Icon name="bag" size={13} className="text-teal-500" />Added to bag
        </span>
      </span>

      <div style={v(2)} className="absolute right-0 top-[57%] z-30 w-[70%]">
        <div className="glass float-slower rounded-[18px] p-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-teal-500 text-navy-950"><Icon name="bag" size={16} /></span>
            <span className="min-w-0">
              <span className="block text-[0.75rem] font-semibold text-white">New order #1042</span>
              <span className="block font-mono text-[0.625rem] text-white/60">R 1 248 · Paid</span>
            </span>
            <span className="ml-auto rounded-full bg-success/30 px-2 py-0.5 text-[0.5625rem] font-semibold text-[#7ce3b6]">Paid</span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[0.625rem] text-white/60"><Icon name="check" size={11} className="text-teal-500" />Courier booked · customer notified</p>
        </div>
      </div>

      <div style={v(3)} className="absolute bottom-0 left-0 z-20 flex w-full flex-wrap gap-1.5">
        {['Card', 'Yoco', 'PayFast', 'SnapScan', 'Instant EFT'].map((m, k) => (
          <span key={m} className={`glass rounded-full px-2.5 py-1 text-[0.625rem] font-semibold text-white/85 ${k === 4 ? 'max-[379px]:hidden' : ''}`}>{m}</span>
        ))}
      </div>
    </>
  )
}

/* ── Web app: the business on one live dashboard ────────────────────────── */
const BARS = [36, 52, 44, 68, 58, 84, 72]

function AppScene() {
  return (
    <>
      <div style={v(0)} className="absolute left-0 top-0 z-10 w-[48%]">
        <div className="glass float-slow rounded-[18px] p-3">
          <p className="text-[0.625rem] text-white/55">Paid this week</p>
          <p className="mt-0.5 font-mono text-[1.0625rem] font-semibold tabular-nums text-white">R 4 800</p>
          <p className="text-[0.625rem] text-teal-500">On track</p>
        </div>
      </div>
      <div style={v(1)} className="absolute right-0 top-[5%] z-10 w-[46%]">
        <div className="glass-light float-slower rounded-[18px] p-3 text-ink">
          <p className="text-[0.625rem] text-ink-3">Bookings today</p>
          <p className="mt-0.5 text-[1.0625rem] font-semibold tabular-nums">8</p>
          <p className="text-[0.625rem] text-teal-700">2 new</p>
        </div>
      </div>
      <div style={v(2)} className="absolute left-[5%] top-[35%] z-20 w-[90%]">
        <div className="glass-light rounded-[18px] p-3 text-ink">
          <p className="flex items-center justify-between text-[0.6875rem] font-semibold">This week<span className="font-mono text-[0.5625rem] font-normal text-ink-3">Mon–Sun</span></p>
          <div className="mt-2 flex h-[58px] items-end gap-1.5">
            {BARS.map((h, k) => <span key={k} className={`bar-grow flex-1 rounded-[4px] ${k === 5 ? 'bg-teal-500' : 'bg-navy-900/15'}`} style={{ height: `${h}%`, animationDelay: `${420 + k * 70}ms` }} />)}
          </div>
        </div>
      </div>
      <div style={v(3)} className="absolute bottom-0 right-0 z-30 w-[70%]">
        <div className="glass float-slow rounded-[16px] p-2.5">
          {[['11:30', 'Colour consult', 'Due', 'bg-[#f7c08a]/25 text-[#f7c08a]'], ['14:00', 'Bridal trial', 'New', 'bg-teal-500/20 text-teal-500']].map(([t, n, s, c]) => (
            <p key={t} className="flex items-center gap-2 py-1 text-[0.6875rem] text-white"><span className="font-mono text-[0.5625rem] text-white/50">{t}</span><span className="flex-1 truncate font-medium">{n}</span><span className={`rounded-full px-1.5 py-0.5 text-[0.5625rem] font-semibold ${c}`}>{s}</span></p>
          ))}
        </div>
      </div>
      <span style={v(4)} className="absolute bottom-[5%] left-0 z-40">
        <span style={at(1300)} className="pop inline-flex items-center gap-1 rounded-full bg-teal-500 px-2.5 py-1.5 text-[0.625rem] font-semibold text-navy-950 shadow-[0_12px_26px_-10px_rgba(29,161,194,0.9)]"><Icon name="check" size={11} />Invoice sent</span>
      </span>
    </>
  )
}

/* ── Automation: a message travels the workflow ─────────────────────────── */
const FLOW: { icon: IconName; title: string; note: string }[] = [
  { icon: 'mail', title: 'New enquiry', note: 'From your website form' },
  { icon: 'sparkle', title: 'AI drafts the reply', note: 'From your FAQ, prices and hours' },
  { icon: 'check', title: 'You approve', note: 'One tap on your phone' },
  { icon: 'whatsapp', title: 'Sent on WhatsApp', note: 'Logged to your sheet' },
]

function FlowScene() {
  return (
    <>
      {/* The rail and a pulse travelling down it, node to node. */}
      <div style={v(0)} className="absolute bottom-[8%] left-[22px] top-[8%] w-[2px] rounded-full bg-white/12">
        <span className="flow-dot absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-teal-500 shadow-[0_0_14px_3px_rgba(29,161,194,0.8)]" />
      </div>
      <ol className="build-in absolute inset-0 flex flex-col justify-between py-1">
        {FLOW.map((f, k) => (
          <li key={f.title} style={v(k + 1)} className={`relative flex items-center gap-3 ${k % 2 ? 'pl-6' : ''}`}>
            <span style={at(500 + k * 600)} className="lit glass relative z-10 inline-flex h-11 w-11 flex-none items-center justify-center rounded-[14px] text-teal-500"><Icon name={f.icon} size={19} /></span>
            <span className="glass-light rounded-[14px] px-3 py-2 text-ink">
              <span className="block text-[0.75rem] font-semibold leading-tight">{f.title}</span>
              <span className="block text-[0.625rem] text-ink-2">{f.note}</span>
            </span>
          </li>
        ))}
      </ol>
      <span style={v(5)} className="absolute right-0 top-0 z-20">
        <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.625rem] font-semibold text-white/85"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-teal-500" />Runs day and night</span>
      </span>
    </>
  )
}
