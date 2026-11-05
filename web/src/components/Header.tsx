'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { SERVICES } from '@/data/services'
import { NAV, SITE, whatsappLink } from '@/lib/site'
import { Icon } from './Icon'
import { Logo } from './Logo'

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [overDark, setOverDark] = useState(true)
  const [open, setOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // After scroll the header floats as a pill that matches whatever is under it: dark glass
  // over dark sections, light glass over light ones. One probe per frame, at most.
  useEffect(() => {
    let raf = 0
    const probe = () => {
      raf = 0
      if (window.innerWidth < 1024) return // phones: the pill never changes, so there is nothing to probe
      setScrolled(window.scrollY > 8)
      // Only page content counts (not overlays, banners or the dev-tools badge).
      const under = document.elementsFromPoint(window.innerWidth / 2, 36).find((el) => el.closest('main, footer, #mobile-menu'))
      setOverDark(!!under?.closest('.on-dark, .hero-dark, footer, #mobile-menu'))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(probe) }
    probe()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [pathname])

  // Close the menu when the route changes (derived during render, no effect).
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) { setLastPath(pathname); setOpen(false) }

  // Mobile sheet: lock scroll, trap focus, Esc closes, focus returns to the toggle.
  useEffect(() => {
    if (!open) return
    const sheet = sheetRef.current
    const toggle = toggleRef.current
    document.body.style.overflow = 'hidden'
    const focusables = () => Array.from(sheet?.querySelectorAll<HTMLElement>('a, button') ?? [])
    focusables()[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key !== 'Tab') return
      const items = focusables()
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      toggle?.focus()
    }
  }, [open])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href)
  // Every page opens with a dark hero: the header is transparent with light text until scroll,
  // then it floats as a liquid-glass pill. The header box itself stays 64px so nothing jumps.
  // With the phone menu open the header joins the dark sheet below it.
  const pill = scrolled && !open
  const dark = !scrolled || open || overDark

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-3 focus:text-white">
        Skip to content
      </a>
      {/* Phones and tablets: ONE header, a dark glass pill, identical before and after scroll
          and over every section (no transitions, no colour switching). Desktop (lg+): a
          transparent bar over the hero that becomes a pill matching the section under it. */}
      {/* flow-root: stops the pill's top margin collapsing out of the header, which made the
          pill jump 8px up the moment the sticky header engaged. */}
      <header className={`sticky top-0 z-50 flow-root h-16 ${!scrolled && !open ? 'lg:border-b lg:border-white/10' : ''} ${open ? 'bg-navy-950' : ''}`}>
        <div
          className={`nav-shell mx-auto mt-2 flex h-12 w-[calc(100%-16px)] max-w-[1160px] items-center justify-between gap-3 rounded-full pl-4 pr-1.5 sm:gap-6 sm:pl-5 lg:transition-[margin,height,max-width,padding,border-radius,box-shadow,background-color] lg:duration-500 lg:ease-[var(--ease-out-soft)] ${
            pill ? `${overDark ? 'glass-nav-dark' : 'glass-nav'} lg:mt-2 lg:h-12 lg:w-[calc(100%-16px)] lg:max-w-[1160px] lg:rounded-full lg:pl-5 lg:pr-1.5` : 'lg:mt-0 lg:h-16 lg:w-full lg:max-w-[1200px] lg:rounded-none lg:pl-8 lg:pr-8'
          }`}
        >
          <Link href="/" aria-label={`${SITE.name}: home`} className="rounded-lg">
            <Logo inverted className="lg:hidden" />
            <Logo inverted={dark} className="max-lg:hidden" />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`rounded-full px-3.5 py-2 text-[0.9375rem] transition-colors ${
                      dark ? (isActive(item.href) ? 'bg-white/10 text-white' : 'text-white/75 hover:text-white') : isActive(item.href) ? 'bg-navy-900/[0.06] font-medium text-ink' : 'text-ink-2 hover:bg-navy-900/[0.04] hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/contact/" className="btn btn-sm btn-on-dark hidden md:inline-flex lg:hidden">Contact</Link>
            <Link href="/contact/" className={`btn btn-sm hidden lg:inline-flex ${dark ? 'btn-on-dark' : 'btn-secondary'}`}>Contact</Link>
            <Link href="/quote/" className="btn btn-accent btn-sm px-3.5 max-md:hidden sm:px-4">
              Get a quote <Icon name="arrowRight" size={16} className="hidden sm:block" />
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <Icon name={open ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
      </header>

      {/* Phone menu: a dark sheet that continues the header. Big tap targets, services one tap
          away, and the two money actions pinned to the bottom of the screen. */}
      <div
        id="mobile-menu"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="on-dark fixed inset-0 top-16 z-40 isolate overflow-y-auto bg-navy-950 text-white lg:hidden"
      >
        <div className="aurora aurora-1 opacity-40" aria-hidden="true" />
        <nav aria-label="Mobile" className="container-site relative flex min-h-full flex-col pb-[max(24px,env(safe-area-inset-bottom))] pt-3">
          <ul className="menu-rise">
            {[...NAV, { href: '/contact/', label: 'Contact' }].map((item, i) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`flex items-baseline gap-4 border-b border-white/10 py-3.5 text-[1.875rem] font-semibold tracking-[-0.03em] ${isActive(item.href) ? 'text-teal-500' : 'text-white'}`}>
                  <span className="w-6 font-mono text-[0.75rem] font-normal tracking-normal text-white/40">0{i + 1}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-8">Services</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {SERVICES.map((sv) => (
              <li key={sv.slug}>
                <Link href={`/services/${sv.slug}/`} className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.875rem] text-white/85">
                  <Icon name={sv.icon} size={15} className="text-teal-500" />{sv.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto grid gap-2.5 pt-10">
            <Link href="/quote/" className="btn btn-accent glow-border h-[52px] w-full">Get an instant quote <Icon name="arrowRight" size={18} /></Link>
            <div className="grid grid-cols-2 gap-2.5">
              <a href={whatsappLink('Hi Tshedza, I found you on your website.')} className="btn btn-on-dark w-full" rel="noopener"><Icon name="whatsapp" size={18} /> WhatsApp</a>
              <a href={`tel:${SITE.phoneIntl}`} className="btn btn-on-dark w-full"><Icon name="phone" size={18} /> Call</a>
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}
