'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

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

/** Cycles through words in place (accessible: the full list is read once). */
export function WordSwap({ words, interval = 2400, className, wordClassName }: { words: string[]; interval?: number; className?: string; wordClassName?: string }) {
  const [i, setI] = useState(0)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => setI((v) => (v + 1) % words.length), interval)
    return () => clearInterval(t)
  }, [reduced, words.length, interval])
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
