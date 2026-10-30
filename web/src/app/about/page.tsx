import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { Icon } from '@/components/Icon'
import { CtaBand, LiquidField, SectionHeading } from '@/components/ui'
import { pageMeta } from '@/lib/meta'
import { SITE } from '@/lib/site'

export const metadata = pageMeta(
  '/about/',
  'About',
  `TshedzaWebDev is a small Pretoria web studio founded by ${SITE.founder}: data analyst, developer and builder. Honest work, real clients, and a standard we hold ourselves to.`,
)

const VALUES = [
  { title: 'Honest by default', body: 'Real projects, real prices and real timelines. If something is not a good fit, we will say so, even if it costs us the job.' },
  { title: 'Small on purpose', body: 'You work directly with the person building your project. No hand-offs, no account managers, no lost context.' },
  { title: 'Details matter', body: 'Speed, accessibility, security and documentation are not extras. They are how we build.' },
  { title: 'Grateful and grounded', body: 'Our work is shaped by faith and gratitude. We treat every client’s business as if it were our own.' },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={<>A studio built on <span className="accent-serif text-teal-500">care and craft.</span></>}
        lede={`TshedzaWebDev is a web studio in ${SITE.city}, founded by ${SITE.founder}: data analyst, developer and builder. We build websites, online stores, web apps and automations for South African businesses, and we teach others to do the same.`}
        aside={
          <div className="glass float-slow rounded-[28px] p-8 text-white">
            <span className="text-[5.5rem] font-semibold leading-none tracking-[-0.06em]">TD<span className="text-teal-500">.</span></span>
            <p className="accent-serif mt-6 text-[1.75rem] leading-tight">“Crafting exceptional web experiences.”</p>
            <p className="mt-3 text-white/60">{SITE.founder} · Founder</p>
          </div>
        }
      />
      <section className="container-site section grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7 grid gap-5 text-[1.125rem] leading-relaxed text-ink-2">
          <p>Tshedza works as a data analyst, a developer and a builder. That mix shapes how we work: we start with what the numbers and the people actually need, then build the simplest thing that does the job beautifully.</p>
          <p>We are a small studio, and we like it that way. Every project gets a written scope, a fixed price in rand and hand-over documentation. You always own what we build.</p>
        </div>
      </section>

      <section className="section canvas-tint border-t border-line/60">
        <LiquidField blobs={[{ tone: 'teal', top: '10%', left: '60%', size: 520 }, { tone: 'lilac', top: '55%', left: '-8%', size: 460 }]} />
        <div className="container-site">
          <SectionHeading eyebrow="What we believe" title="Four promises we keep." />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <li key={v.title} className="reveal glass-light rounded-[24px] p-7">
                <span className="font-mono text-[0.8125rem] text-teal-700">0{i + 1}</span>
                <h3 className="h3 mt-3">{v.title}</h3>
                <p className="mt-2 text-ink-2">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container-site grid gap-10 lg:grid-cols-2">
          <div className="card rounded-[24px] p-8">
            <Icon name="users" size={26} className="text-teal-700" />
            <h2 className="h3 mt-4">We teach, too</h2>
            <p className="mt-2 text-ink-2">Knowledge Hub is our community for young South Africans learning to build, launch and earn with tech. Tshedza was a speaker at Knowledge Hub Summit 2026.</p>
            <Link href="/learn/" className="link mt-5 inline-block font-medium">About Knowledge Hub</Link>
          </div>
          <div className="card rounded-[24px] p-8">
            <Icon name="code" size={26} className="text-teal-700" />
            <h2 className="h3 mt-4">See the standard</h2>
            <p className="mt-2 text-ink-2">The best way to judge a studio is its work. Every project we show is real client work, shared with permission.</p>
            <Link href="/work/" className="link mt-5 inline-block font-medium">View the work</Link>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  )
}
