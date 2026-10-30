import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { Icon } from '@/components/Icon'
import { CtaBand } from '@/components/ui'
import { ServiceVisual } from '@/components/visuals'
import { SERVICES } from '@/data/services'
import { pageMeta } from '@/lib/meta'
import { fromPrice } from '@/lib/pricing'

export const metadata = pageMeta(
  '/services/',
  'Services',
  'Websites, online stores, web apps, automation, SEO and Google Ads, social media and MQL5 trading bots. Built in Pretoria, priced in rand.',
)

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={<>Everything digital, <span className="accent-serif text-teal-500">done properly.</span></>}
        lede="Pick what you need, or tell us the problem and we will recommend the simplest thing that solves it. Every price is a starting point. Use the instant quote for yours."
        actions={SERVICES.map((s) => (
          <a key={s.slug} href={`#${s.slug}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-[0.875rem] text-white/85 backdrop-blur transition-colors hover:border-teal-500 hover:text-white">
            <Icon name={s.icon} size={16} className="text-teal-500" />{s.name}
          </a>
        ))}
      />

      <div className="pb-8">
        {SERVICES.map((s, i) => (
          <section key={s.slug} id={s.slug} className={`scroll-mt-20 py-16 lg:py-24 ${i % 2 ? 'bg-card' : ''}`} aria-labelledby={`${s.slug}-title`}>
            <div className="container-site grid items-center gap-12 lg:grid-cols-12">
              <div className={`lg:col-span-6 ${i % 2 ? 'lg:order-2' : ''}`}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-navy-900 text-teal-500"><Icon name={s.icon} size={22} /></span>
                <h2 id={`${s.slug}-title`} className="h2 mt-5">{s.name}</h2>
                <p className="lede mt-4">{s.short}</p>
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {s.outcomes.map((o) => (
                    <li key={o.title} className="flex gap-2.5 text-[0.9375rem]"><Icon name="check" size={18} className="mt-0.5 flex-none text-teal-700" />{o.title}</li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href={`/services/${s.slug}/`} className="btn btn-primary">Explore {s.name.toLowerCase()} <Icon name="arrowRight" size={18} /></Link>
                  <span className="font-mono text-[0.8125rem] text-ink-2">{fromPrice(s.pricebookId)}</span>
                </div>
              </div>
              <div className={`lg:col-span-6 ${i % 2 ? 'lg:order-1' : ''}`}>
                <ServiceVisual slug={s.slug} />
              </div>
            </div>
          </section>
        ))}
      </div>
      <CtaBand />
    </>
  )
}
