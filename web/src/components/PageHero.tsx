import Link from 'next/link'

// The cinematic dark hero every inner page opens with (grid floor, aurora, noise).
// Sits under the transparent header (-mt-16), so the page reads as one surface.

interface PageHeroProps {
  eyebrow: string
  title: React.ReactNode
  lede?: React.ReactNode
  crumbs?: { href?: string; label: string }[]
  actions?: React.ReactNode
  aside?: React.ReactNode
  compact?: boolean
  /** Phones hide the aside (usually decoration); set when it carries real information. */
  asideOnMobile?: boolean
  /** Phones: actions become one swipeable line (e.g. many jump links). */
  actionsScroll?: boolean
}

const d = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

export function PageHero({ eyebrow, title, lede, crumbs, actions, aside, compact = false, asideOnMobile = false, actionsScroll = false }: PageHeroProps) {
  return (
    <section className="hero-dark noise on-dark -mt-16 pt-16">
      <div className="aurora aurora-1" aria-hidden="true" />
      <div className="aurora aurora-2" aria-hidden="true" />
      <div className="hero-grid opacity-70" aria-hidden="true" />
      <div className={`hero-exit container-site grid items-center gap-12 ${aside ? 'lg:grid-cols-12' : ''} ${compact ? 'pb-10 pt-6 sm:pb-14 sm:pt-10 lg:pb-20 lg:pt-14' : 'pb-12 pt-6 sm:pb-16 sm:pt-10 lg:pb-28 lg:pt-16'}`}>
        <div className={aside ? 'min-w-0 lg:col-span-7' : 'min-w-0 max-w-3xl'}>
          {crumbs ? (
            <nav aria-label="Breadcrumb" className="enter mb-5 text-[0.8125rem] text-white/55 sm:mb-8 sm:text-[0.875rem]">
              <ol className="flex flex-wrap items-center gap-1.5">
                {crumbs.map((c, i) => (
                  <li key={c.label} className="flex items-center gap-1.5">
                    {i > 0 ? <span aria-hidden="true">/</span> : null}
                    {c.href ? <Link href={c.href} className="hover:text-white">{c.label}</Link> : <span aria-current="page" className="text-white/80">{c.label}</span>}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <p style={d(60)} className="enter glass inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-white/80">
            <span className="pulse-dot h-2 w-2 rounded-full bg-teal-500" />{eyebrow}
          </p>
          <h1 className="mt-5 text-[clamp(2.375rem,5vw+0.75rem,4.75rem)] sm:mt-6 font-semibold leading-[1] tracking-[-0.04em] text-white">
            <span className="line-mask"><span style={d(140)}>{title}</span></span>
          </h1>
          {lede ? <p style={d(320)} className="enter mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-white/70 sm:mt-6 sm:text-[1.1875rem]">{lede}</p> : null}
          {actions ? (
            <div style={d(420)} className={`enter mt-7 flex gap-3 sm:mt-9 sm:flex-wrap ${actionsScroll ? 'no-scrollbar -mx-5 overflow-x-auto px-5 max-sm:gap-2 sm:mx-0 sm:px-0 [&>*]:flex-none' : 'flex-wrap max-sm:[&>.btn]:flex-1'}`}>{actions}</div>
          ) : null}
        </div>
        {aside ? <div style={d(380)} className={`enter min-w-0 lg:col-span-5 ${asideOnMobile ? '' : 'hidden md:block'}`}>{aside}</div> : null}
      </div>
    </section>
  )
}
