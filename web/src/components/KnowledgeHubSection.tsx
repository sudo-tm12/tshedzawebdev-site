// Home page: Knowledge Hub. Phone-first, one idea per block:
//   1. the promise (Learn. Build. Earn.) and the one action: join free on WhatsApp
//   2. the hero object: the real group chat (in a phone on desktop; floating free on phones)
//   3. three ways to start, as a quiet typographic line-up
//   4. three quiet facts
// From lg up the opener and the phone sit side by side.
import Link from 'next/link'
import { PRICEBOOK_COACHING } from '@/lib/coaching'
import { rand } from '@/lib/quote/engine'
import { SITE } from '@/lib/site'
import { Icon, type IconName } from './Icon'
import { HubConversation, HubPhone } from './motion/HubPhone'

const COACHING_FROM = Math.min(...PRICEBOOK_COACHING.tiers.map((t) => t.monthly))

const PATHS: { icon: IconName; tag: string; title: string; body: string; href: string; cta: string; tone: 'teal' | 'mint' | 'gold' }[] = [
  { icon: 'monitor', tag: 'Free · 9 lessons', title: 'Build & Launch Challenge', body: 'From an empty laptop to your own live website.', href: '/learn/', cta: 'Start free', tone: 'teal' },
  { icon: 'zap', tag: 'Free · 12 lessons', title: 'Automate & Earn Challenge', body: 'WhatsApp-first automation that local businesses pay for.', href: '/learn/', cta: 'Start free', tone: 'mint' },
  { icon: 'users', tag: `Coaching · from ${rand(COACHING_FROM)}/month`, title: 'AI Agency Builder', body: 'Find clients, price, deliver and grow a service business.', href: '/learn/#coaching', cta: 'See coaching', tone: 'gold' },
]

const FACTS: { icon: IconName; text: string }[] = [
  { icon: 'heart', text: 'Free to join' },
  { icon: 'monitor', text: 'Made for phones & mobile data' },
  { icon: 'check', text: 'Real tasks, reviewed together' },
]

export function KnowledgeHubSection() {
  return (
    <section id="learn" aria-labelledby="learn-h" className="section on-dark relative scroll-mt-16 overflow-x-clip bg-[linear-gradient(170deg,#06111f_0%,#0a2233_55%,#0c3a4c_100%)] text-white">
      <div className="aurora aurora-1 opacity-50" aria-hidden="true" />
      <div className="aurora aurora-2 opacity-70" aria-hidden="true" />
      <div className="container-site relative">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* 1. The promise */}
          <div className="mx-auto max-w-2xl text-center lg:col-span-6 lg:mx-0 lg:text-left">
            <p className="eyebrow">Knowledge Hub</p>
            <h2 id="learn-h" className="mt-4 text-[clamp(3rem,6vw+1rem,5.25rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
              Learn.<br className="sm:hidden" /> Build.<br /><span className="accent-serif text-teal-500">Earn.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[34ch] text-[1.0625rem] leading-relaxed text-white/70 sm:max-w-xl sm:text-[1.125rem] lg:mx-0">
              A free community where young South Africans learn the skills we use on real client work, from zero to launch-ready.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 lg:justify-start">
              <a href={SITE.knowledgeHub.whatsappCommunity} className="btn btn-accent glow-border h-[52px] px-7 max-sm:w-full max-sm:max-w-[340px]" rel="noopener"><Icon name="whatsapp" size={18} /> Join free on WhatsApp</a>
              <Link href="/learn/" className="group inline-flex items-center gap-1 text-[1rem] font-medium text-teal-500">See the programmes <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-0.5" /></Link>
            </div>
            <ul className="mx-auto mt-10 hidden max-w-md gap-3 lg:mx-0 lg:grid">
              {FACTS.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-[0.9375rem] text-white/70">
                  <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-teal-500"><Icon name={f.icon} size={15} /></span>{f.text}
                </li>
              ))}
            </ul>
          </div>

          {/* 2. The hero object */}
          <div className="relative lg:col-span-6">
            <div className="hub-glow" aria-hidden="true" />
            {/* Desktop: the chat in a phone. Phones: no device inside the device, the conversation floats free. */}
            <HubPhone className="hidden lg:block" />
            <HubConversation className="lg:hidden" />
            <div className="mt-8 flex flex-wrap justify-center gap-2 lg:hidden">
              {FACTS.map((f) => (
                <span key={f.text} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[0.8125rem] text-white/75"><Icon name={f.icon} size={13} className="text-teal-500" />{f.text}</span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Three ways to start: a quiet, typographic line-up. The phone stays the hero, so no
            heavy cards here: hairlines between rows (phones) or columns (md and up). */}
        <div className="mt-20 border-t border-white/10 pt-12 sm:mt-28 sm:pt-16">
          <div className="flex flex-col items-center gap-3 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <h3 className="text-[clamp(1.75rem,2.4vw+1rem,2.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]">Three ways to start.</h3>
            <Link href="/learn/" className="group inline-flex items-center gap-1 text-[1rem] font-medium text-teal-500">Everything on Learn <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-0.5" /></Link>
          </div>
          <ul className="mt-6 divide-y divide-white/10 md:mt-12 md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
            {PATHS.map((p) => (
              <li key={p.title} className={`path-${p.tone} md:px-8 md:first:pl-0 md:last:pr-0`}>
                <Link href={p.href} className="group flex items-start gap-4 py-6 md:flex-col md:gap-0 md:py-1">
                  <span className="path-ico inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-white/10 bg-white/[0.06]"><Icon name={p.icon} size={20} /></span>
                  <span className="min-w-0 md:mt-6">
                    <span className="path-tag block font-mono text-[0.6875rem] uppercase tracking-[0.12em]">{p.tag}</span>
                    <span className="mt-1.5 block text-[1.25rem] font-semibold leading-snug tracking-[-0.025em] md:text-[1.375rem]">{p.title}</span>
                    <span className="mt-1 block text-[0.9375rem] leading-snug text-white/60">{p.body}</span>
                    <span className="path-cta mt-3 inline-flex items-center gap-1 text-[0.9375rem] font-medium md:mt-4">{p.cta} <Icon name="arrowRight" size={15} className="transition-transform group-hover:translate-x-1" /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
