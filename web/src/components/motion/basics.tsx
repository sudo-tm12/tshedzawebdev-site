'use client'

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react'

const motionQuery = '(prefers-reduced-motion: reduce)'
function subscribeMotion(cb: () => void) {
  const m = window.matchMedia(motionQuery)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
/** True when the visitor asked for reduced motion (SSR: false). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false)
}

// A shared word index, so other pieces (the hero phone) change in step with <WordSwap>.
const WordIndex = createContext<number | null>(null)
/** The current index from the nearest <WordCycle>, or null outside one. */
export function useWordIndex(): number | null {
  return useContext(WordIndex)
}

/**
 * Drives a word index for everything inside it. It only ticks while `watch` (a CSS
 * selector) is on screen and the tab is visible, so an off-screen hero costs nothing.
 */
export function WordCycle({ count, interval = 3200, startDelay = 1400, watch, children }: { count: number; interval?: number; startDelay?: number; watch: string; children: React.ReactNode }) {
  const [i, setI] = useState(0)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced || count < 2) return
    const target = document.querySelector(watch)
    let visible = true
    let t: ReturnType<typeof setInterval> | undefined
    const run = () => {
      clearInterval(t)
      if (visible && document.visibilityState === 'visible') t = setInterval(() => setI((v) => (v + 1) % count), interval)
    }
    const io = target && 'IntersectionObserver' in window
      ? new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; run() }, { threshold: 0.15 })
      : null
    if (target && io) io.observe(target)
    const onVis = () => run()
    document.addEventListener('visibilitychange', onVis)
    // Let the landing choreography finish before the first change.
    const start = setTimeout(run, startDelay)
    return () => { clearTimeout(start); clearInterval(t); io?.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [reduced, count, interval, startDelay, watch])
  return <WordIndex.Provider value={i}>{children}</WordIndex.Provider>
}

/** Cycles through words in place (accessible: the full list is read once). Inside a <WordCycle> it follows that index. */
export function WordSwap({ words, interval = 2400, className, wordClassName }: { words: string[]; interval?: number; className?: string; wordClassName?: string }) {
  const shared = useWordIndex()
  const [own, setOwn] = useState(0)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced || shared !== null) return
    const t = setInterval(() => setOwn((v) => (v + 1) % words.length), interval)
    return () => clearInterval(t)
  }, [reduced, shared, words.length, interval])
  const i = (shared ?? own) % words.length
  return (
    <span className={className}>
      <span className="sr-only">{words.join(', ')}</span>
      <span className="word-swap" aria-hidden="true">
        {words.map((w, k) => <span key={w} data-on={k === i} className={wordClassName}>{w}</span>)}
      </span>
    </span>
  )
}

/** Sets --mx/--my on the element so .spotlight / .spotlight-border glows follow the cursor. */
export function Spotlight({ as: Tag = 'div', className, children, ...rest }: { as?: 'div' | 'li' | 'article'; className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null)
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <Tag ref={ref as never} onPointerMove={onMove} className={`spotlight spotlight-border ${className ?? ''}`} {...rest}>
      {children}
    </Tag>
  )
}

/** Animates a number towards `value` (eased), for live prices. */
export function useTweened(value: number, ms = 450): number {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) { from.current = value; return }
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(Math.round(a + (value - a) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
      else from.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, ms, reduced])
  return reduced ? value : shown
}

/** True once the element has scrolled into view (stays true). Visible-by-default for no-JS. */
export function useInView<T extends HTMLElement>(threshold = 0.25): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen]
}
