'use client'

import { useEffect, useState } from 'react'
import { Icon } from '../Icon'
import { useReducedMotion, useWordIndex } from './basics'

// The hero's phone: its screen builds whatever the headline word says (website, online
// store, web app, automation), in step with <WordSwap> through <WordCycle>. Each screen
// remounts on change so its build-in animation replays. Decorative: the words are
// already announced by the headline, so the whole phone is aria-hidden.

const i = (n: number) => ({ '--i': n }) as React.CSSProperties
const d = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

export function HeroPhone({ className = '' }: { className?: string }) {
  const word = useWordIndex() ?? 0
  return (
    <div aria-hidden="true" className={`relative w-[244px] select-none ${className}`}>
      <div className="relative aspect-[9/18.6] rounded-[40px] bg-[linear-gradient(145deg,#2a4766,#0a1b2e_40%,#13283f)] p-[7px] shadow-[0_50px_90px_-30px_rgba(29,161,194,0.55),0_30px_60px_-30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.25)]">
        <div className="relative h-full overflow-hidden rounded-[33px] bg-paper text-ink">
          {/* Status bar + island */}
          <div className="absolute inset-x-0 top-0 z-20 flex h-8 items-center justify-between px-5 text-[0.625rem] font-semibold">
            <span>9:41</span>
            <span className="flex items-end gap-[2px]"><span className="h-1.5 w-[3px] rounded-[1px] bg-ink" /><span className="h-2 w-[3px] rounded-[1px] bg-ink" /><span className="h-2.5 w-[3px] rounded-[1px] bg-ink" /><span className="ml-1 h-2.5 w-5 rounded-[3px] border border-ink/70 p-[1.5px]"><span className="block h-full w-3/4 rounded-[1.5px] bg-ink" /></span></span>
          </div>
          <span className="absolute left-1/2 top-2 z-30 h-[18px] w-[70px] -translate-x-1/2 rounded-full bg-navy-950" />
          <Screen key={word} word={word} />
        </div>
      </div>
      {/* Phones get two floating notes around the device; on desktop the console sits beside it. */}
      <span className="glass float-slow absolute -left-12 top-[4%] z-10 inline-flex items-center gap-2 rounded-full bg-navy-950/60 px-3 py-1.5 text-[0.75rem] font-medium text-white/90 lg:hidden"><Icon name="gauge" size={14} className="text-teal-500" />Fast on mobile data</span>
      <span className="glass float-slower absolute -bottom-4 -right-10 z-10 inline-flex items-center gap-2 rounded-full bg-navy-950/60 px-3 py-1.5 text-[0.75rem] font-medium text-white/90 lg:hidden"><Icon name="check" size={14} className="text-teal-500" />Priced in rand</span>
    </div>
  )
}

function Screen({ word }: { word: number }) {
  if (word === 1) return <StoreScreen />
  if (word === 2) return <AppScreen />
  if (word === 3) return <ChatScreen />
  return <SiteScreen />
}

function SiteScreen() {
  return (
    <div className="build-in flex h-full flex-col gap-2.5 px-3 pb-3 pt-10">
      <div style={i(0)} className="flex items-center justify-between">
        <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded-[5px] bg-navy-900" /><span className="h-2 w-14 rounded-full bg-ink/75" /></span>
        <span className="grid gap-[3px]"><span className="h-[2px] w-4 rounded bg-ink" /><span className="h-[2px] w-4 rounded bg-ink" /></span>
      </div>
      <div style={i(1)} className="relative flex h-[150px] flex-col justify-end overflow-hidden rounded-[16px] bg-[linear-gradient(150deg,#0a1b2e,#1e3a57_55%,#1da1c2)] p-3.5 text-white">
        <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-teal-500/40 blur-xl" />
        <p className="relative text-[1.05rem] font-semibold leading-[1.05] tracking-tight">Your business,<br /><span className="accent-serif text-[1.2rem] text-[#9fe3f2]">online.</span></p>
        <div className="relative mt-2.5 flex gap-1.5"><span className="rounded-full bg-teal-500 px-2.5 py-1 text-[0.5625rem] font-semibold text-navy-950">Book now</span><span className="rounded-full border border-white/40 px-2.5 py-1 text-[0.5625rem] font-semibold">Call us</span></div>
      </div>
      <div style={i(2)} className="grid grid-cols-3 gap-1.5">
        {['scissors', 'calendar', 'map'].map((n) => (
          <div key={n} className="rounded-[10px] border border-line bg-card p-2"><span className="block h-4 w-4 rounded-[5px] bg-teal-100" /><span className="mt-2 block h-1.5 w-[80%] rounded-full bg-line" /><span className="mt-1 block h-1.5 w-[50%] rounded-full bg-line" /></div>
        ))}
      </div>
      <div style={i(3)} className="flex items-center gap-2 rounded-[12px] border border-line bg-card px-2.5 py-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success-tint text-success"><Icon name="clock" size={12} /></span>
        <span className="text-[0.625rem] font-medium text-ink-2">Open today · 08:00–17:00</span>
      </div>
      <div style={i(4)} className="flex-1 rounded-[12px] bg-[repeating-linear-gradient(135deg,#eef0f3_0_6px,#e4e7ec_6px_12px)]" />
      <span style={d(1100)} className="pop absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-teal-500 shadow-[0_10px_20px_-8px_rgba(10,27,46,0.6)]"><Icon name="whatsapp" size={18} /></span>
    </div>
  )
}

const PRODUCTS = [
  { name: 'Linen shirt', price: 'R 349', bg: 'from-[#e3f4f8] to-[#bfe6ef]', shape: 'rounded-t-[40%] rounded-b-[6px]' },
  { name: 'Leather tote', price: 'R 899', bg: 'from-[#f6efe2] to-[#ead9bd]', shape: 'rounded-[8px]' },
  { name: 'Candle set', price: 'R 189', bg: 'from-[#eef0f3] to-[#d9dee6]', shape: 'rounded-full' },
  { name: 'Sneakers', price: 'R 1 150', bg: 'from-[#e6f4ee] to-[#c4e6d6]', shape: 'rounded-[40%_40%_10px_10px]' },
]

function StoreScreen() {
  return (
    <div className="build-in relative flex h-full flex-col gap-2.5 px-3 pb-3 pt-10">
      <div style={i(0)} className="flex items-center justify-between">
        <span className="text-[0.9rem] font-semibold tracking-tight">Shop</span>
        <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-white">
          <Icon name="bag" size={13} />
          <span style={d(1250)} className="pop absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[0.5rem] font-bold text-navy-950">1</span>
        </span>
      </div>
      <div style={i(1)} className="flex gap-1.5 text-[0.5625rem] font-semibold">
        <span className="rounded-full bg-navy-900 px-2.5 py-1 text-white">All</span><span className="rounded-full border border-line px-2.5 py-1 text-ink-2">New in</span><span className="rounded-full border border-line px-2.5 py-1 text-ink-2">Sale</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PRODUCTS.map((p, k) => (
          <div key={p.name} style={i(2 + k)} className="rounded-[12px] border border-line bg-card p-1.5">
            <div className={`flex h-[78px] items-end justify-center rounded-[9px] bg-gradient-to-br ${p.bg} pb-2`}><span className={`h-10 w-10 bg-white/70 shadow-[0_6px_12px_-6px_rgba(10,27,46,0.4)] ${p.shape}`} /></div>
            <p className="mt-1.5 px-0.5 text-[0.5625rem] font-medium text-ink-2">{p.name}</p>
            <div className="flex items-center justify-between px-0.5 pb-0.5">
              <span className="font-mono text-[0.625rem] font-semibold tabular-nums">{p.price}</span>
              <span style={k === 0 ? d(1050) : undefined} className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${k === 0 ? 'press bg-teal-500 text-navy-950' : 'bg-line-2 text-ink-2'}`}><Icon name="plus" size={10} /></span>
            </div>
          </div>
        ))}
      </div>
      <div style={i(6)} className="mt-auto flex items-center justify-between rounded-[12px] bg-navy-900 px-3 py-2.5 text-white">
        <span className="text-[0.625rem] font-semibold">Checkout</span>
        <span className="font-mono text-[0.5625rem] text-white/70">Card · Yoco · PayFast</span>
      </div>
      <span style={d(1300)} className="pop absolute inset-x-6 bottom-[58px] inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[0.5625rem] font-semibold text-white shadow-lg"><Icon name="check" size={10} className="text-teal-500" />Added to bag</span>
    </div>
  )
}

const BARS = [38, 55, 44, 70, 62, 84, 76]

function AppScreen() {
  return (
    <div className="build-in flex h-full flex-col gap-2.5 px-3 pb-3 pt-10">
      <div style={i(0)} className="flex items-center justify-between">
        <div><p className="font-mono text-[0.5rem] uppercase tracking-[0.12em] text-ink-3">Dashboard</p><p className="text-[0.9rem] font-semibold tracking-tight">Bookings</p></div>
        <span className="h-7 w-7 rounded-full bg-[linear-gradient(135deg,#1da1c2,#0a1b2e)]" />
      </div>
      <div style={i(1)} className="grid grid-cols-2 gap-2">
        <div className="rounded-[12px] bg-navy-900 p-2.5 text-white"><p className="text-[0.5rem] text-white/60">Today</p><p className="mt-0.5 text-[1.05rem] font-semibold tabular-nums">8</p><p className="text-[0.5rem] text-teal-500">2 new</p></div>
        <div className="rounded-[12px] border border-line bg-card p-2.5"><p className="text-[0.5rem] text-ink-3">Paid this week</p><p className="mt-0.5 font-mono text-[0.85rem] font-semibold tabular-nums">R 4 800</p><p className="text-[0.5rem] text-success">On track</p></div>
      </div>
      <div style={i(2)} className="rounded-[12px] border border-line bg-card p-2.5">
        <p className="text-[0.5625rem] font-medium text-ink-2">This week</p>
        <div className="mt-2 flex h-16 items-end gap-1.5">
          {BARS.map((h, k) => <span key={k} className={`bar-grow flex-1 rounded-[3px] ${k === BARS.length - 2 ? 'bg-teal-500' : 'bg-navy-900/15'}`} style={{ height: `${h}%`, animationDelay: `${350 + k * 70}ms` }} />)}
        </div>
      </div>
      {[['09:00', 'Hair & blow-dry', 'Paid', 'bg-success-tint text-success'], ['11:30', 'Colour consult', 'Due', 'bg-warn-tint text-warn'], ['14:00', 'Bridal trial', 'New', 'bg-teal-100 text-teal-700']].map(([t, n, s, c], k) => (
        <div key={t} style={i(3 + k)} className="flex items-center gap-2 rounded-[10px] border border-line bg-card px-2.5 py-2">
          <span className="font-mono text-[0.5625rem] tabular-nums text-ink-3">{t}</span>
          <span className="flex-1 truncate text-[0.625rem] font-medium">{n}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[0.5rem] font-semibold ${c}`}>{s}</span>
        </div>
      ))}
    </div>
  )
}

const CHAT: { from: 'them' | 'bot'; text: string }[] = [
  { from: 'them', text: 'Hi! Are you open on Saturday?' },
  { from: 'bot', text: 'Yes, 08:00 to 13:00. Shall I book you a slot?' },
  { from: 'them', text: 'Yes please, 10:00' },
  { from: 'bot', text: 'Booked ✓ See you Saturday at 10:00.' },
]

function ChatScreen() {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(1)
  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => setShown((n) => (n >= CHAT.length ? n : n + 1)), 720)
    return () => clearInterval(t)
  }, [reduced])
  const count = reduced ? CHAT.length : shown
  const typing = count < CHAT.length && CHAT[count]?.from === 'bot'
  return (
    <div className="flex h-full flex-col bg-[#eef3f6]">
      <div className="flex items-center gap-2 border-b border-line bg-card px-3 pb-2.5 pt-10">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-[0.5625rem] font-bold text-teal-500">YB</span>
        <div><p className="text-[0.6875rem] font-semibold leading-tight">Your Business</p><p className="text-[0.5rem] text-success">online · replies instantly</p></div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {CHAT.slice(0, count).map((m, k) => (
          <p key={k} className={`rise-in max-w-[82%] rounded-[12px] px-2.5 py-1.5 text-[0.625rem] leading-snug shadow-[0_1px_1px_rgba(10,27,46,0.06)] ${m.from === 'them' ? 'self-start rounded-tl-[4px] bg-card' : 'self-end rounded-tr-[4px] bg-teal-100 text-navy-900'}`}>{m.text}</p>
        ))}
        {typing ? <span className="typing self-end inline-flex gap-1 rounded-[12px] rounded-tr-[4px] bg-teal-100 px-2.5 py-2">{[0, 1, 2].map((k) => <span key={k} className="h-1.5 w-1.5 rounded-full bg-teal-700" />)}</span> : null}
        <span className={`mt-auto inline-flex items-center gap-1.5 self-center rounded-full bg-navy-900 px-2.5 py-1 text-[0.5rem] font-semibold text-white transition-opacity duration-500 ${count >= CHAT.length ? 'opacity-100' : 'opacity-0'}`}><Icon name="zap" size={10} className="text-teal-500" />Answered automatically, 24/7</span>
      </div>
    </div>
  )
}
