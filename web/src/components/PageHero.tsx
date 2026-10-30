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
}

export function PageHero({ eyebrow, title, lede, crumbs, actions, aside, compact = false }: PageHeroProps) {
  return (
    <section className="hero-dark noise on-dark -mt-16 pt-16">
      <div className="aurora aurora-1" aria-hidden="true" />
      <div className="aurora aurora-2" aria-hidden="true" />
      <div className="hero-grid opacity-70" aria-hidden="true" />
      <div className={`container-site grid items-center gap-12 ${aside ? 'lg:grid-cols-12' : ''} ${compact ? 'pb-14 pt-10 lg:pb-20 lg:pt-14' : 'pb-16 pt-10 lg:pb-28 lg:pt-16'}`}>
        <div className={aside ? 'min-w-0 lg:col-span-7' : 'max-w-3xl'}>
          {crumbs ? (
            <nav aria-label="Breadcrumb" className="mb-8 text-[0.875rem] text-white/55">
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
          <p className="glass inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-white/80">
            <span className="pulse-dot h-2 w-2 rounded-full bg-teal-500" />{eyebrow}
          </p>
          <h1 className="mt-6 text-[clamp(2.5rem,5vw+0.75rem,4.75rem)] font-semibold leading-[1] tracking-[-0.04em] text-white">{title}</h1>
          {lede ? <p className="mt-6 max-w-2xl text-[1.1875rem] leading-relaxed text-white/70">{lede}</p> : null}
          {actions ? <div className="mt-9 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {aside ? <div className="min-w-0 lg:col-span-5">{aside}</div> : null}
      </div>
    </section>
  )
}
