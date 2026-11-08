'use client'

import { Children, useEffect, useRef, useState } from 'react'

// Phones: a snapping horizontal row of cards with progress dots (the next card peeks in).
// From `grid` breakpoint up: a normal grid, using the grid classes passed in `className`.
// Children are the list items themselves (<li>, or <Spotlight as="li">).
// The card in view is marked data-rail-on="true" (full strength); its neighbours recede a
// little on phones as a swipe cue (CSS, below each grid breakpoint only).

interface SwipeRailProps {
  children: React.ReactNode
  label: string
  /** Breakpoint where the rail becomes a grid. */
  grid?: 'sm' | 'md' | 'lg'
  /** Grid/layout classes for the breakpoint and up, e.g. "md:grid-cols-3 md:gap-4". */
  className?: string
  /** Card width on phones (CSS length), default 84%. */
  itemWidth?: string
  /** On phones, open the rail on this card (e.g. the recommended package) instead of the first. */
  initial?: number
}

const HIDE_DOTS = { sm: 'sm:hidden', md: 'md:hidden', lg: 'lg:hidden' }

export function SwipeRail({ children, label, grid = 'md', className = '', itemWidth, initial = 0 }: SwipeRailProps) {
  const ref = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(initial)
  const count = Children.count(children)

  const mark = (i: number) => {
    const el = ref.current
    if (!el) return
    Array.from(el.children).forEach((c, k) => { (c as HTMLElement).dataset.railOn = String(k === i) })
  }

  // Phones only (the rail scrolls); from the grid breakpoint up there is nothing to scroll.
  useEffect(() => {
    mark(initial)
    const el = ref.current
    const item = el?.children[initial] as HTMLElement | undefined
    if (!el || !item || initial === 0 || el.scrollWidth <= el.clientWidth) return
    el.scrollTo({ left: item.offsetLeft - el.offsetLeft - 20, behavior: 'instant' as ScrollBehavior })
  }, [initial])

  const onScroll = () => {
    const el = ref.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first) return
    const step = first.offsetWidth + 12
    const i = Math.min(count - 1, Math.round(el.scrollLeft / step))
    setActive(i)
    mark(i)
  }
  const go = (i: number) => {
    const el = ref.current
    const item = el?.children[i] as HTMLElement | undefined
    if (el && item) el.scrollTo({ left: item.offsetLeft - el.offsetLeft - 20, behavior: 'smooth' })
  }

  return (
    <div>
      <ul ref={ref} onScroll={onScroll} aria-label={label} className={`rail rail-grid-${grid} ${className}`}
        style={itemWidth ? ({ '--rail-w': itemWidth } as React.CSSProperties) : undefined}>
        {children}
      </ul>
      {count > 1 ? (
        <div className={`rail-dots ${HIDE_DOTS[grid]}`}>
          {Array.from({ length: count }, (_, i) => (
            <button key={i} type="button" onClick={() => go(i)} aria-label={`Show item ${i + 1} of ${count}`} aria-current={i === active} className="rail-dot" />
          ))}
          <span className="ml-auto font-mono text-[0.6875rem] tabular-nums opacity-60">{active + 1} / {count}</span>
        </div>
      ) : null}
    </div>
  )
}
