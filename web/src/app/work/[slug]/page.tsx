import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { notFound } from 'next/navigation'
import { Icon } from '@/components/Icon'
import { BrowserFrame, Checklist, CtaBand, PhoneFrame } from '@/components/ui'
import { WORK, getProject } from '@/data/work'
import { pageMeta } from '@/lib/meta'

export function generateStaticParams() {
  return WORK.map((p) => ({ slug: p.slug }))
}
export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getProject(slug)
  if (!p) return {}
  return pageMeta(`/work/${p.slug}/`, `${p.client}: case study`, p.summary)
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getProject(slug)
  if (!p) notFound()
  const idx = WORK.findIndex((w) => w.slug === p.slug)
  const next = WORK[(idx + 1) % WORK.length]!

  return (
    <>
      <PageHero
        crumbs={[{ href: '/', label: 'Home' }, { href: '/work/', label: 'Work' }, { label: p.client }]}
        eyebrow={`${p.sector}${p.location ? ` · ${p.location}` : ''}`}
        title={p.client}
        lede={p.summary}
        aside={
          <dl className="grid gap-5 rounded-[18px] border border-white/10 bg-white/[0.04] p-6 text-white backdrop-blur">
            <div><dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-teal-500">Services</dt><dd className="mt-1.5">{p.services.join(' · ')}</dd></div>
            <div><dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-teal-500">Status</dt><dd className="mt-1.5">{p.status}</dd></div>
            {p.live ? <div><dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-teal-500">Visit</dt><dd className="mt-1.5"><a href={p.live} className="inline-flex items-center gap-1 underline underline-offset-4" rel="noopener">{p.live.replace('https://', '')} <Icon name="arrowUpRight" size={16} /></a></dd></div> : null}
          </dl>
        }
      />

      {p.desktop ? (
        <section className="container-site pb-16">
          <div className="grid items-end gap-8 lg:grid-cols-12">
            <div className={p.mobile ? 'lg:col-span-9' : 'lg:col-span-12'}>
              <BrowserFrame src={p.desktop.src} alt={p.desktop.alt} width={p.desktop.width} height={p.desktop.height} url={p.live} priority />
            </div>
            {p.mobile ? <div className="mx-auto w-48 lg:col-span-3 lg:w-full lg:max-w-[230px]"><PhoneFrame src={p.mobile.src} alt={p.mobile.alt} width={p.mobile.width} height={p.mobile.height} /></div> : null}
          </div>
        </section>
      ) : (
        <section className="container-site pb-16">
          <div className="on-dark grain flex min-h-[260px] items-end rounded-[var(--radius-lg)] p-8 text-white lg:p-12" style={{ backgroundColor: p.accent }}>
            <p className="max-w-xl text-white/80">Screens from this project are not public. Here is what we did instead.</p>
          </div>
        </section>
      )}

      <section className="section border-t border-line bg-card pt-16">
        <div className="container-site grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">The challenge</p>
            <p className="mt-4 text-[1.375rem] leading-snug tracking-tight">{p.challenge}</p>
          </div>
          <div className="lg:col-span-7">
            <p className="eyebrow">What we did</p>
            <ol className="mt-5 grid gap-5">
              {p.approach.map((a, i) => (
                <li key={a} className="flex gap-5">
                  <span className="font-mono text-[0.8125rem] text-teal-700">0{i + 1}</span>
                  <p className="text-ink-2">{a}</p>
                </li>
              ))}
            </ol>
            <p className="eyebrow mt-12">Delivered</p>
            <Checklist items={p.delivered} className="mt-5" />
          </div>
        </div>
      </section>

      <section className="container-site py-12">
        <Link href={`/work/${next.slug}/`} className="group flex items-center justify-between gap-6 border-y border-line py-8">
          <span>
            <span className="eyebrow">Next project</span>
            <span className="h2 mt-2 block group-hover:text-teal-700">{next.client}</span>
          </span>
          <Icon name="arrowRight" size={28} className="flex-none transition-transform group-hover:translate-x-1" />
        </Link>
      </section>

      <CtaBand />
    </>
  )
}
