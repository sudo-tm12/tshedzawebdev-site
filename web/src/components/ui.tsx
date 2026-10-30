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
      <Tag className={`${Tag === 'h1' ? 'display' : 'h2'} mt-4`}>{title}</Tag>
      {lede ? <p className="lede mt-5">{lede}</p> : null}
    </div>
  )
}

/** Browser chrome drawn in CSS around a real screenshot. */
export function BrowserFrame({ src, alt, width, height, url, priority = false }: { src: string; alt: string; width: number; height: number; url?: string; priority?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-[var(--radius-md)] border border-line bg-card shadow-[var(--shadow-md)]">
      <div className="flex h-9 items-center gap-1.5 border-b border-line bg-line-2/70 px-3.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e5e7eb]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e5e7eb]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e5e7eb]" />
        {url ? <span className="ml-3 truncate rounded-md bg-card px-2.5 py-0.5 font-mono text-[0.6875rem] text-ink-3">{url.replace(/^https?:\/\//, '')}</span> : null}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, images pre-optimised to WebP */}
      <img src={src} alt={alt} width={width} height={height} loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : undefined} className="block h-auto w-full" />
    </figure>
  )
}

/** A phone frame drawn in CSS around a real mobile screenshot. */
export function PhoneFrame({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  return (
    <figure className="relative w-full overflow-hidden rounded-[30px] border-[7px] border-navy-900 bg-navy-900 shadow-[var(--shadow-lg)]">
      <span className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-navy-900" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" className="block h-auto w-full rounded-[23px]" />
    </figure>
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
