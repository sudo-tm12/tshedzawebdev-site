'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SITE, whatsappLink } from '@/lib/site'
import { Icon } from './Icon'

// Phones and tablets: the two actions that make money, in thumb reach. It appears once
// the hero (and its own buttons) has scrolled away, and steps aside at the footer and
// on pages that are already the action (the quote flow).

const HIDDEN_ON = ['/quote/']

export function MobileDock() {
  const pathname = usePathname()
  const [pastHero, setPastHero] = useState(false)
  const [atFooter, setAtFooter] = useState(false)

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.75)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const footer = document.querySelector('footer')
    const io = footer ? new IntersectionObserver(([e]) => setAtFooter(!!e?.isIntersecting), { rootMargin: '0px 0px -40px 0px' }) : null
    if (footer && io) io.observe(footer)
    return () => { window.removeEventListener('scroll', onScroll); io?.disconnect() }
  }, [pathname])

  if (HIDDEN_ON.some((p) => pathname.endsWith(p))) return null
  const show = pastHero && !atFooter

  return (
    <div data-show={show} aria-hidden={!show} className="dock fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 lg:hidden">
      <div className="glass mx-auto flex max-w-md items-center gap-2 rounded-full bg-navy-950/80 p-1.5">
        <Link href="/quote/" tabIndex={show ? 0 : -1} className="btn btn-accent h-12 min-h-0 flex-1 text-[0.9375rem]">Get an instant quote <Icon name="arrowRight" size={18} /></Link>
        <a href={whatsappLink('Hi Tshedza, I found you on your website.')} tabIndex={show ? 0 : -1} rel="noopener" aria-label={`WhatsApp ${SITE.phoneDisplay}`}
          className="glass-inset inline-flex h-12 w-12 flex-none items-center justify-center rounded-full text-white"><Icon name="whatsapp" size={22} /></a>
      </div>
    </div>
  )
}
