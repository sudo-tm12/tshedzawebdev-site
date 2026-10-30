'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { NAV, SITE, whatsappLink } from '@/lib/site'
import { Icon } from './Icon'
import { Logo } from './Logo'

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
  const dark = !scrolled && !open
  const pill = scrolled && !open

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-3 focus:text-white">
        Skip to content
      </a>
      <header className={`sticky top-0 z-50 h-16 transition-colors duration-300 ${dark ? 'border-b border-white/10' : ''} ${open ? 'bg-paper' : ''}`}>
        <div
          className={`mx-auto flex items-center justify-between gap-3 transition-[margin,height,max-width,padding,border-radius,box-shadow,background-color] duration-500 ease-[var(--ease-out-soft)] sm:gap-6 ${
            pill ? 'glass-nav mt-2 h-12 w-[calc(100%-16px)] max-w-[1160px] rounded-full pl-4 pr-1.5 sm:pl-5' : 'h-16 w-full max-w-[1200px] px-5 md:px-8'
          }`}
        >
          <Link href="/" aria-label={`${SITE.name}: home`} className="rounded-lg">
            <Logo inverted={dark} />
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
            <Link href="/contact/" className={`btn btn-sm hidden md:inline-flex ${dark ? 'btn-on-dark' : 'btn-secondary'}`}>Contact</Link>
            <Link href="/quote/" className="btn btn-accent btn-sm px-3.5 sm:px-4">
              Get a quote <Icon name="arrowRight" size={16} className="hidden sm:block" />
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border lg:hidden ${dark ? 'border-white/20 bg-white/10 text-white backdrop-blur' : 'border-line bg-white/80'}`}
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

      <div
        id="mobile-menu"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="fixed inset-0 top-16 z-40 overflow-y-auto bg-paper/85 backdrop-blur-2xl backdrop-saturate-150 lg:hidden"
      >
        <nav aria-label="Mobile" className="container-site flex min-h-full flex-col pb-10 pt-4">
          <ul className="divide-y divide-line border-b border-line">
            {[...NAV, { href: '/contact/', label: 'Contact' }].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between py-4 text-2xl font-semibold tracking-tight"
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                  <Icon name="arrowRight" className="text-ink-3" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto grid gap-3 pt-10">
            <Link href="/quote/" className="btn btn-accent w-full">Get an instant quote</Link>
            <a href={whatsappLink('Hi Tshedza, I found you on your website.')} className="btn btn-primary w-full" rel="noopener">
              <Icon name="whatsapp" /> WhatsApp {SITE.phoneDisplay}
            </a>
          </div>
        </nav>
      </div>
    </>
  )
}
