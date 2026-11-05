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
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, images pre-optimised to WebP */}
        <img src={src} alt={alt} width={width} height={height} loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : undefined} className="block h-auto w-full" />
        <span className="screen-glare" aria-hidden="true" />
      </div>
    </figure>
  )
}

/**
 * A phone drawn in CSS around a real mobile screenshot. Give it a tall capture (taller than
 * one 390×844 screen) and its screen scrolls through the real site as the page scrolls.
 */
export function PhoneFrame({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  const screenH = (width * 844) / 390
  const tall = height > screenH * 1.05
  const pan = tall ? `${(-(1 - screenH / height) * 100).toFixed(2)}%` : undefined
  return (
    <figure className="device-phone relative w-full rounded-[30px] p-[6px]">
      <span className="absolute left-1/2 top-[11px] z-10 h-[14px] w-[34%] -translate-x-1/2 rounded-full bg-navy-950" aria-hidden="true" />
      {/* overflow-clip, not hidden: hidden would make this the scroll container for the screen's scroll-driven pan. */}
      {/* The image is absolutely positioned: in normal flow it would stretch this aspect-ratio
          box to its own (tall) height and the phone would become a strip. min-h-0 for the same reason. */}
      <div className="phone-screen relative aspect-[390/844] min-h-0 overflow-clip rounded-[24px] bg-navy-900">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-optimised WebP */}
        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async"
          className={`absolute left-0 top-0 block h-auto w-full ${tall ? 'screen-scroll' : ''}`} style={pan ? ({ '--pan': pan } as React.CSSProperties) : undefined} />
        <span className="screen-glare" aria-hidden="true" />
      </div>
    </figure>
  )
}

/** A real desktop screenshot in a browser, with the phone version standing in front of it. */
export function DeviceDuo({ desktop, phone, url, priority = false, rise = false }: { desktop: { src: string; alt: string; width: number; height: number }; phone?: { src: string; alt: string; width: number; height: number }; url?: string; priority?: boolean; rise?: boolean }) {
  return (
    <div className={`relative ${phone ? 'pb-10 pr-3 sm:pb-12 sm:pr-5' : ''}`}>
      <BrowserFrame src={desktop.src} alt={desktop.alt} width={desktop.width} height={desktop.height} url={url} priority={priority} rise={rise} />
      {phone ? (
        <div className="absolute bottom-0 right-0 w-[34%] max-w-[180px] sm:w-[30%]">
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
