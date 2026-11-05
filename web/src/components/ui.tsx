// Shared presentational pieces. Server components; no client JS.
import Link from 'next/link'
import { whatsappLink } from '@/lib/site'
import { Icon } from './Icon'

interface SectionHeadingProps {
  eyebrow: string
  title: React.ReactNode
  lede?: React.ReactNode
  align?: 'left' | 'center'
  as?: 'h1' | 'h2'
}

export function SectionHeading({ eyebrow, title, lede, align = 'left', as: Tag = 'h2' }: SectionHeadingProps) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="eyebrow">{eyebrow}</p>
      <Tag className={`${Tag === 'h1' ? 'display' : 'h2 reveal-h'} mt-4`}>{title}</Tag>
      {lede ? <p className="lede mt-5">{lede}</p> : null}
    </div>
  )
}

/** Browser chrome drawn in CSS around a real screenshot. */
export function BrowserFrame({ src, alt, width, height, url, priority = false, rise = false }: { src: string; alt: string; width: number; height: number; url?: string; priority?: boolean; /** Tilt up into place as it scrolls in (md and up). */ rise?: boolean }) {
  return (
    <figure className={`device-browser overflow-hidden rounded-[var(--radius-md)] border border-line bg-card ${rise ? 'device-rise' : ''}`}>
      <div className="flex h-9 items-center gap-1.5 border-b border-line bg-[linear-gradient(#f6f7f9,#eceff3)] px-3.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff6159]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c941]/80" />
        {url ? <span className="ml-3 truncate rounded-md bg-card px-2.5 py-0.5 font-mono text-[0.6875rem] text-ink-3 shadow-[inset_0_1px_1px_rgba(10,27,46,0.08)]">{url.replace(/^https?:\/\//, '')}</span> : null}
      </div>
      <div className="relative">
        {/* max-w-full: a 1200 px image must never widen its grid column past the screen (it did, on phones). */}
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, images pre-optimised to WebP */}
        <img src={src} alt={alt} width={width} height={height} loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : undefined} className="block h-auto w-full max-w-full" />
        <span className="screen-glare" aria-hidden="true" />
      </div>
    </figure>
  )
}

/*
 * The phone. Its outline is an SVG path in a 430×884 box (a modern 6.1" phone: 19.5:9 screen
 * with a 20 px bezel and 56 px corner radius), so the shape is exact at every size. The
 * screenshot sits in the screen area (390×844, the capture size), clipped by the screen path;
 * the SVG draws the bezel, rim highlight, dynamic island and side buttons on top.
 */
const PHONE = { w: 430, h: 884, bezel: 20, r: 56 } // screen = 390 × 844 at (20, 20)
const screenRadius = PHONE.r - PHONE.bezel // 36

/**
 * A phone around a real mobile screenshot. With a tall capture (taller than one 390×844
 * screen) the screen scrolls through the real site as the page scrolls; a single screen
 * stays put. The screenshot must be 390 wide (or the same 390:844 shape).
 */
export function PhoneFrame({ src, alt, width, height, className = '' }: { src: string; alt: string; width: number; height: number; className?: string }) {
  const screenH = (width * 844) / 390
  const tall = height > screenH * 1.05
  const pan = tall ? `${(-(1 - screenH / height) * 100).toFixed(2)}%` : undefined
  const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`
  return (
    <figure className={`device-phone relative ${className}`} style={{ aspectRatio: `${PHONE.w} / ${PHONE.h}` }}>
      {/* Screen: positioned by the same numbers the SVG uses, so it always sits inside the bezel. */}
      {/* overflow-clip (not hidden) so this never becomes the scroll container for the scroll-driven pan. */}
      <div className="phone-screen absolute overflow-clip bg-navy-950" style={{ left: pct(PHONE.bezel, PHONE.w), top: pct(PHONE.bezel, PHONE.h), width: pct(390, PHONE.w), height: pct(844, PHONE.h), borderRadius: `${(screenRadius / 390) * 100}% / ${(screenRadius / 844) * 100}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-optimised WebP */}
        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async"
          className={`absolute left-0 top-0 block h-auto w-full ${tall ? 'screen-scroll' : ''}`} style={pan ? ({ '--pan': pan } as React.CSSProperties) : undefined} />
      </div>
      {/* Body, rim, island, buttons and glare, drawn over the screen (the screen area is cut out). */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${PHONE.w} ${PHONE.h}`} aria-hidden="true">
        <defs>
          <linearGradient id="ph-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a5a7c" /><stop offset="0.35" stopColor="#13283f" /><stop offset="1" stopColor="#1c3a57" /></linearGradient>
          <linearGradient id="ph-rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.55" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.08" /><stop offset="1" stopColor="#fff" stopOpacity="0.25" /></linearGradient>
          <linearGradient id="ph-glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.18" /><stop offset="0.3" stopColor="#fff" stopOpacity="0.05" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <mask id="ph-cut"><rect width={PHONE.w} height={PHONE.h} fill="#fff" /><rect x={PHONE.bezel} y={PHONE.bezel} width="390" height="844" rx={screenRadius} fill="#000" /></mask>
        </defs>
        {/* side buttons sit just outside the body */}
        <rect x="-3" y="150" width="4" height="34" rx="2" fill="#1c3a57" />
        <rect x="-3" y="208" width="4" height="64" rx="2" fill="#1c3a57" />
        <rect x="-3" y="286" width="4" height="64" rx="2" fill="#1c3a57" />
        <rect x={PHONE.w - 1} y="230" width="4" height="98" rx="2" fill="#1c3a57" />
        {/* body with the screen cut out */}
        <rect width={PHONE.w} height={PHONE.h} rx={PHONE.r} fill="url(#ph-body)" mask="url(#ph-cut)" />
        <rect x="1" y="1" width={PHONE.w - 2} height={PHONE.h - 2} rx={PHONE.r - 1} fill="none" stroke="url(#ph-rim)" strokeWidth="1.5" />
        <rect x={PHONE.bezel - 1} y={PHONE.bezel - 1} width="392" height="846" rx={screenRadius + 1} fill="none" stroke="#000" strokeOpacity="0.6" strokeWidth="2" />
        {/* dynamic island */}
        <rect x="150" y="34" width="130" height="36" rx="18" fill="#06111f" />
        <circle cx="258" cy="52" r="6" fill="#0f1f33" /><circle cx="258" cy="52" r="2.5" fill="#1e3a57" />
        {/* glare across the glass */}
        <rect x={PHONE.bezel} y={PHONE.bezel} width="390" height="844" rx={screenRadius} fill="url(#ph-glare)" />
      </svg>
    </figure>
  )
}

/** A real desktop screenshot in a browser, with the phone version standing in front of it. */
export function DeviceDuo({ desktop, phone, url, priority = false, rise = false }: { desktop: { src: string; alt: string; width: number; height: number }; phone?: { src: string; alt: string; width: number; height: number }; url?: string; priority?: boolean; rise?: boolean }) {
  return (
    <div className={`relative ${phone ? 'pb-[14%] pr-[6%]' : ''}`}>
      <BrowserFrame src={desktop.src} alt={desktop.alt} width={desktop.width} height={desktop.height} url={url} priority={priority} rise={rise} />
      {phone ? (
        <div className="absolute bottom-0 right-0 w-[36%] max-w-[210px] drop-shadow-[0_24px_28px_rgba(6,17,31,0.45)]">
          <PhoneFrame src={phone.src} alt={phone.alt} width={phone.width} height={phone.height} />
        </div>
      ) : null}
    </div>
  )
}

export function CtaBand({ title = 'Tell us what you are building.', body = 'Get a ballpark price in a minute, or talk it through on WhatsApp. No pressure, no jargon.' }: { title?: string; body?: string }) {
  return (
    <section className="container-site pb-20 lg:pb-28">
      <div className="on-dark grain relative overflow-hidden rounded-[var(--radius-lg)] bg-navy-900 px-6 py-14 text-white sm:px-12 lg:py-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <p className="eyebrow">Next step</p>
          <h2 className="h2 mt-4">{title}</h2>
          <p className="lede mt-4">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/quote/" className="btn btn-accent">Get an instant quote <Icon name="arrowRight" size={18} /></Link>
            <a href={whatsappLink('Hi Tshedza, I found you on your website and would like to chat about a project.')} className="btn btn-on-dark" rel="noopener">
              <Icon name="whatsapp" size={18} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Checklist({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={`grid gap-3 ${className ?? ''}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-teal-100 text-teal-700"><Icon name="check" size={14} /></span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[0.875rem] text-ink-3">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? <Link href={item.href} className="hover:text-ink">{item.label}</Link> : <span aria-current="page" className="text-ink-2">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Slowly morphing colour blobs behind light glass panels. Decorative, behind content. */
export function LiquidField({ blobs }: { blobs: { tone: 'teal' | 'lilac' | 'sun' | 'mint'; top: string; left: string; size?: number }[] }) {
  return (
    <div className="liquid-field" aria-hidden="true">
      {blobs.map((b, i) => (
        <span key={i} className={`blob blob-${b.tone}`} style={{ top: b.top, left: b.left, width: b.size, height: b.size }} />
      ))}
    </div>
  )
}
