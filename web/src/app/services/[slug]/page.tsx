import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { notFound } from 'next/navigation'
import { Icon } from '@/components/Icon'
import { Checklist, CtaBand, SectionHeading } from '@/components/ui'
import { ProcessDiagram, ServiceVisual } from '@/components/visuals'
import { SERVICES, getService } from '@/data/services'
import { WORK } from '@/data/work'
import { pageMeta } from '@/lib/meta'
import { PRICEBOOK, rand } from '@/lib/quote/engine'
import { SITE, whatsappLink } from '@/lib/site'

// Which real projects to show on each service page (explicit, never guessed).
const RELATED: Record<string, string[]> = {
  websites: ['blr-tutoring', 'chavistos-travel', 'e-wall-innovations'],
  'web-apps': ['blr-tutoring'],
  'social-media': ['the-gourmet-chariot'],
}

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }))
}
export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = getService(slug)
  if (!s) return {}
  return pageMeta(`/services/${s.slug}/`, s.name, `${s.short} ${s.name} by ${SITE.name}, ${SITE.city}. Instant quote in rand.`)
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = getService(slug)
  if (!s) notFound()
  const book = PRICEBOOK.services.find((b) => b.id === s.pricebookId)
  const related = (RELATED[s.slug] ?? []).map((slug) => WORK.find((w) => w.slug === slug)).filter((w) => w !== undefined)

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    description: s.short,
    provider: { '@type': 'ProfessionalService', name: SITE.name, url: SITE.url },
    areaServed: 'ZA',
    offers: book?.tiers.map((t) => ({ '@type': 'Offer', name: t.name, priceCurrency: 'ZAR', price: t.base ?? t.monthlyBase, description: t.note })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <PageHero
        crumbs={[{ href: '/', label: 'Home' }, { href: '/services/', label: 'Services' }, { label: s.name }]}
        eyebrow={s.name}
        title={<>{s.headline} <span className="accent-serif text-teal-500">{s.headlineAccent}</span></>}
        lede={s.intro}
        actions={<>
          <Link href={`/quote/#s=${s.pricebookId}`} className="btn btn-accent glow-border">Price my {s.name.toLowerCase()} <Icon name="arrowRight" size={18} /></Link>
          <a href={whatsappLink(`Hi Tshedza, I’m interested in ${s.name.toLowerCase()}.`)} className="btn btn-on-dark" rel="noopener"><Icon name="whatsapp" size={18} /> Ask a question</a>
        </>}
        aside={<ServiceVisual slug={s.slug} />}
      />
      <section className="container-site -mt-8 relative z-10 pb-6">
        <div className="grid gap-6 glass-light rounded-[24px] p-6 md:grid-cols-[auto_1fr] md:items-center md:gap-10 md:p-7">
          <p className="eyebrow">Built for</p>
          <ul className="grid gap-3 sm:grid-cols-3">
            {s.forWho.map((w) => <li key={w} className="flex gap-2.5 text-[0.9375rem]"><Icon name="check" size={18} className="mt-0.5 flex-none text-teal-700" />{w}</li>)}
          </ul>
        </div>
        {s.note ? <p className="mt-4 flex gap-2.5 rounded-[var(--radius-sm)] bg-warn-tint p-4 text-[0.875rem] text-warn"><Icon name="info" size={18} className="mt-0.5 flex-none" />{s.note}</p> : null}
      </section>

      <section className="section border-t border-line bg-card">
        <div className="container-site">
          <SectionHeading eyebrow="What you get" title="What changes for your business." />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {s.outcomes.map((o) => (
              <li key={o.title} className="reveal glass-light rounded-[22px] p-6">
                <h3 className="h3">{o.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-ink-2">{o.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {book ? (
        <section className="section">
          <div className="container-site">
            <SectionHeading eyebrow="Pricing" title={<>Clear starting prices. <span className="accent-serif">No VAT.</span></>} lede="Your exact price depends on scope. The instant quote adds up your options and shows a range in seconds." />
            <ul className="mt-12 grid gap-4 md:grid-cols-3">
              {book.tiers.map((t, i) => (
                <li key={t.id} className={`reveal flex flex-col rounded-[var(--radius-md)] border p-7 ${i === 1 ? 'on-dark border-navy-900 bg-navy-900 text-white' : 'border-line bg-card'}`}>
                  <h3 className="h3">{t.name}</h3>
                  <p className={`mt-2 text-[0.9375rem] ${i === 1 ? 'text-white/70' : 'text-ink-2'}`}>{t.note}</p>
                  <p className="mt-6 font-mono text-[0.75rem] uppercase tracking-[0.12em] opacity-70">From</p>
                  <p className="text-[2rem] font-semibold tracking-tight tabular-nums">{rand((t.base ?? t.monthlyBase)!)}<span className="text-base font-normal opacity-70">{t.monthlyBase !== undefined ? '/month' : ''}</span></p>
                  <Link href={`/quote/#s=${book.id}&t=${t.id}`} className={`btn mt-6 ${i === 1 ? 'btn-accent' : 'btn-secondary'}`}>Price this option</Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[0.875rem] text-ink-3">{SITE.vatNote}. A 50% deposit secures your slot on projects over R3 000.</p>
          </div>
        </section>
      ) : null}

      <section className="section border-t border-line bg-card">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Included" title="The essentials, every time." lede={`Every ${s.name.toLowerCase()} project includes these, whatever the size. Extras are listed separately in your quote.`} />
          </div>
          <div className="lg:col-span-7 lg:pt-10">
            <Checklist items={s.included} className="sm:grid-cols-2" />
          </div>
        </div>
        <div className="container-site mt-16">
          <p className="eyebrow">How it works</p>
          <div className="mt-8"><ProcessDiagram steps={s.process} /></div>
        </div>
      </section>

      {related.length ? (
        <section className="section">
          <div className="container-site">
            <SectionHeading eyebrow="Related work" title="Done for real clients." />
            <ul className="mt-10 grid gap-4 md:grid-cols-2">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link href={`/work/${p.slug}/`} className="card card-hover flex h-full flex-col p-6">
                    <span className="chip chip-neutral self-start">{p.sector}</span>
                    <h3 className="h3 mt-4">{p.client}</h3>
                    <p className="mt-2 text-[0.9375rem] text-ink-2">{p.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="section border-t border-line">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4"><SectionHeading eyebrow="Questions" title={`About ${s.name.toLowerCase()}.`} /></div>
          <div className="divide-y divide-line border-y border-line lg:col-span-8">
            {s.faq.map((f, i) => (
              <details key={f.q} className="group py-5" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[1.0625rem] font-semibold">
                  {f.q}<Icon name="plus" size={20} className="flex-none text-ink-3 transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-3 max-w-2xl text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title={`Ready to talk about your ${s.name.toLowerCase()}?`} />
    </>
  )
}
