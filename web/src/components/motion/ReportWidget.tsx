'use client'

// The free check-up's hero object: an example report presented like a widget.
// When it comes into view (once), the five rings draw in turn, a bright leading dot rides the tip
// of each ring (Apple Watch style), the centre counts up as each ring completes, the list rows
// slide in one by one and the top priority appears last. Time-based (IntersectionObserver +
// CSS transitions), so it runs on every browser. Reduced motion, or no JavaScript: the finished
// report, exactly as the server rendered it.
import { useEffect, useRef, useState } from 'react'
import { CHECKS, STATUS } from '@/data/checkup'
import { Icon } from '../Icon'

type Phase = 'rest' | 'armed' | 'on'

const SIZE = 232
const STROKE = 13
const GAP = 5
const DRAW_MS = 1500
const delay = (i: number) => 150 + i * 140   // ms, outside ring first

export function ReportWidget() {
  const ref = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState<Phase>('rest')
  const [count, setCount] = useState(CHECKS.length)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Only animate if it is not already on screen (then it simply stays finished).
    if (el.getBoundingClientRect().top < window.innerHeight * 0.8) return
    setPhase('armed')
    setCount(0)
    const timers: number[] = []
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return
      io.disconnect()
      // Two frames so the empty state paints before the transitions start.
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase('on')))
      CHECKS.forEach((_, i) => timers.push(window.setTimeout(() => setCount(i + 1), delay(i) + DRAW_MS * 0.8)))
    }, { threshold: 0.35 })
    io.observe(el)
    return () => { io.disconnect(); timers.forEach(clearTimeout) }
  }, [])

  const armed = phase === 'armed'
  const animating = phase !== 'rest'

  return (
    <figure ref={ref} data-phase={phase} className="checkup-widget relative mx-auto w-full max-w-[880px] overflow-hidden rounded-[32px] p-4 sm:rounded-[40px] sm:p-6 md:p-8" aria-label="Example of a website check-up report">
      <span className="checkup-scan" aria-hidden="true" />
      {/* Window bar */}
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[conic-gradient(from_200deg,#1da1c2,#5468ff,#9a7cf0,#20b486,#f2a93b,#1da1c2)] p-[2px]">
          <span className="flex h-full w-full items-center justify-center rounded-full bg-card text-[0.75rem] font-bold text-ink">Y</span>
        </span>
        <span className="min-w-0 truncate font-mono text-[0.8125rem] text-ink-2">yourbusiness.co.za</span>
        <span className="ml-auto flex-none rounded-full bg-line-2 px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-3">Example</span>
      </div>

      <div className="mt-6 grid items-center gap-7 md:mt-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
        {/* Rings */}
        <div className="relative mx-auto aspect-square w-full max-w-[232px]">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full -rotate-90 overflow-visible" aria-hidden="true">
            <defs>
              <filter id="cap-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
            </defs>
            {CHECKS.map((c, i) => {
              const r = SIZE / 2 - STROKE / 2 - i * (STROKE + GAP)
              const len = 2 * Math.PI * r
              const off = len * (1 - c.fill)
              const t = `${DRAW_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay(i)}ms`
              return (
                <g key={c.title}>
                  <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke={c.color} strokeOpacity={0.14} strokeWidth={STROKE} />
                  <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke={c.color} strokeWidth={STROKE} strokeLinecap="round"
                    strokeDasharray={len} style={{ strokeDashoffset: armed ? len : off, opacity: armed ? 0 : 1, transition: animating ? `stroke-dashoffset ${t}, opacity 160ms linear ${delay(i)}ms` : 'none' }} />
                  {/* Leading dot: rides the tip of the ring while it fills, then fades. (The ring itself stays
                      invisible until its turn: a round cap would otherwise show a dot at 12 o’clock.) */}
                  <g style={{ transformOrigin: `${SIZE / 2}px ${SIZE / 2}px`, transform: `rotate(${armed ? 0 : c.fill * 360}deg)`, transition: animating ? `transform ${t}` : 'none' }}>
                    <circle cx={SIZE / 2 + r} cy={SIZE / 2} r={STROKE * 0.42} fill="#fff" filter="url(#cap-glow)"
                      className="ring-cap" style={{ animationDelay: `${delay(i)}ms` }} />
                  </g>
                </g>
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[2.25rem] font-semibold leading-none tracking-[-0.04em] tabular-nums">{count}</span>
            <span className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-3">checks</span>
          </div>
        </div>

        {/* Grouped list, like a settings screen: one container, hairlines between rows */}
        <ul className="divide-y divide-line overflow-hidden rounded-[20px] border border-line bg-card/85 backdrop-blur-sm">
          {CHECKS.map((c, i) => (
            <li key={c.title} className="report-row flex items-center gap-3 px-4 py-3" style={{ transitionDelay: animating ? `${300 + i * 110}ms` : '0ms' }}>
              <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: c.color }} />
              <span className="min-w-0 flex-1">
                <span className="block text-[0.9375rem] font-semibold leading-tight">{c.label}</span>
                <span className="mt-0.5 block truncate text-[0.8125rem] text-ink-3">{c.note}</span>
              </span>
              <span className={`flex-none text-[0.8125rem] font-semibold ${STATUS[c.status].cls}`}>{STATUS[c.status].text}</span>
            </li>
          ))}
        </ul>
      </div>

      <figcaption className="report-priority mt-4 flex items-start gap-3 rounded-[20px] bg-navy-900 p-4 text-white sm:mt-5 sm:items-center sm:p-5" style={{ transitionDelay: animating ? '1500ms' : '0ms' }}>
        <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-teal-500/15 text-teal-500"><Icon name="sparkle" size={17} /></span>
        <span className="text-[0.9375rem] leading-snug text-white/80"><span className="font-semibold text-white">Top priority: speed on phones.</span> Most visitors leave a slow site before it loads.</span>
      </figcaption>
    </figure>
  )
}
