'use client'

import Link from 'next/link'
import { SITE, whatsappLink } from '@/lib/site'
import { SERVICES } from '@/data/services'
import { Icon } from './Icon'
import { Logo } from './Logo'

const GROUPS: { title: string; links: [string, string][] }[] = [
  { title: 'Services', links: SERVICES.map((s) => [`/services/${s.slug}/`, s.name]) },
  { title: 'Studio', links: [['/work/', 'Work'], ['/about/', 'About'], ['/learn/', 'Learn'], ['/wall/', 'Community wall'], ['/quote/', 'Instant quote'], ['/faq/', 'FAQ'], ['/contact/', 'Contact']] },
]

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="on-dark bg-navy-950 text-white/80">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 sm:gap-12 sm:py-16 lg:grid-cols-12 lg:py-20">
        <div className="max-sm:order-first lg:col-span-4">
          <Logo inverted />
          <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-white/65">
            {SITE.tagline}. A web studio in {SITE.city}, building websites, stores, apps and automations for South African businesses.
          </p>
          <div className="mt-6 flex gap-2">
            <a href={SITE.social.linkedin} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:text-white" aria-label="TshedzaWebDev on LinkedIn" rel="noopener">
              <Icon name="linkedin" size={18} />
            </a>
            <a href={SITE.social.tiktok} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:text-white" aria-label="TshedzaWebDev on TikTok" rel="noopener">
              <Icon name="tiktok" size={18} />
            </a>
          </div>
        </div>

        {/* Phones: the two long lists fold away; tap to open. */}
        <div className="divide-y divide-white/10 border-y border-white/10 sm:hidden">
          {GROUPS.map((g) => (
            <details key={g.title} className="foot-acc">
              <summary className="flex cursor-pointer items-center justify-between py-4 text-[1rem] font-semibold text-white">
                {g.title}<Icon name="plus" size={18} className="foot-acc-icon text-white/50 transition-transform" />
              </summary>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-3 pb-5 text-[0.9375rem]">
                {g.links.map(([href, label]) => <li key={href}><Link href={href} className="text-white/75">{label}</Link></li>)}
              </ul>
            </details>
          ))}
        </div>

        {GROUPS.map((g, i) => (
          <nav key={g.title} aria-label={g.title} className={`hidden sm:block ${i === 0 ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
            <h2 className="eyebrow">{g.title === 'Services' ? 'Services' : 'Studio'}</h2>
            <ul className="mt-4 grid gap-2.5 text-[0.9375rem]">
              {g.links.map(([href, label]) => <li key={href}><Link href={href} className="text-white/75 transition-colors hover:text-white">{label}</Link></li>)}
            </ul>
          </nav>
        ))}

        <div className="max-sm:order-first max-sm:-mt-4 lg:col-span-3">
          <h2 className="eyebrow max-sm:sr-only">Talk to us</h2>
          <ul className="mt-4 grid gap-3 text-[0.9375rem]">
            <li><a href={whatsappLink('Hi Tshedza, I found you on your website.')} className="inline-flex items-center gap-2.5 text-white/85 hover:text-white" rel="noopener"><Icon name="whatsapp" size={18} className="text-teal-500" /> WhatsApp {SITE.phoneDisplay}</a></li>
            <li><a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2.5 text-white/85 hover:text-white"><Icon name="mail" size={18} className="text-teal-500" /> {SITE.email}</a></li>
            <li className="inline-flex items-center gap-2.5 text-white/70"><Icon name="pin" size={18} className="text-teal-500" /> {SITE.city}, {SITE.country}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-6 text-[0.8125rem] text-white/55 md:flex-row md:items-center md:justify-between">
          <p>© {year} {SITE.legalName} · {SITE.vatNote}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><Link href="/privacy/" className="hover:text-white">Privacy (POPIA)</Link></li>
            <li><Link href="/terms/" className="hover:text-white">Terms</Link></li>
            <li><button type="button" className="hover:text-white" onClick={() => window.dispatchEvent(new Event('twd:consent-open'))}>Cookie settings</button></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
