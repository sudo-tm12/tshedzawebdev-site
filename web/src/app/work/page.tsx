import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { Icon } from '@/components/Icon'
import { BrowserFrame, CtaBand } from '@/components/ui'
import { WORK } from '@/data/work'
import { pageMeta } from '@/lib/meta'

export const metadata = pageMeta(
  '/work/',
  'Work',
  'Real client projects by TshedzaWebDev: websites, dashboards, branding and more for South African businesses, shown with permission.',
)

export default function WorkPage() {
  const withShots = WORK.filter((w) => w.desktop)
  const textOnly = WORK.filter((w) => !w.desktop)
  return (
    <>
      <PageHero
        eyebrow="Work"
        title={<>Real projects for <span className="accent-serif text-teal-500">real businesses.</span></>}
        lede="Every project here is client work, shown with permission. Where we cannot show a screen, we tell you what we did instead of faking it."
        actions={<><Link href="/quote/" className="btn btn-accent glow-border">Start your project <Icon name="arrowRight" size={18} /></Link><Link href="/services/" className="btn btn-on-dark">Our services</Link></>}
      />

      <section className="container-site pb-16">
        <ul className="grid gap-14 md:grid-cols-2 md:gap-x-10">
          {withShots.map((p, i) => (
            <li key={p.slug} className={`reveal ${i === 0 ? 'md:col-span-2' : ''}`}>
              <Link href={`/work/${p.slug}/`} className="group block">
                <BrowserFrame src={p.desktop!.src} alt={p.desktop!.alt} width={p.desktop!.width} height={p.desktop!.height} url={p.live} priority={i === 0} />
                <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="h3 group-hover:text-teal-700">{p.client}</h2>
                    <p className="mt-1.5 max-w-xl text-ink-2">{p.summary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="chip chip-neutral">{p.sector}</span>
                    <span className={`chip ${p.status === 'Live' ? 'bg-success-tint text-success' : 'chip-neutral'}`}>{p.status === 'Live' ? '● Live' : p.status}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-site pb-20 lg:pb-28">
        <ul className="grid gap-4 md:grid-cols-2">
          {textOnly.map((p) => (
            <li key={p.slug} className="reveal">
              <Link href={`/work/${p.slug}/`} className="on-dark group flex h-full flex-col justify-between gap-10 rounded-[var(--radius-md)] p-8 text-white transition-transform hover:-translate-y-0.5" style={{ backgroundColor: p.accent }}>
                <div>
                  <span className="eyebrow">{p.sector}</span>
                  <h2 className="h2 mt-3">{p.client}</h2>
                  <p className="mt-3 max-w-md text-white/75">{p.summary}</p>
                </div>
                <span className="inline-flex items-center gap-2 font-medium text-white">Read the case study <Icon name="arrowRight" size={18} className="transition-transform group-hover:translate-x-1" /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand title="Your project could be next." />
    </>
  )
}
