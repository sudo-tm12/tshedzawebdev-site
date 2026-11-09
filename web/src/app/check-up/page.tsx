import Link from 'next/link'
import { CheckupForm } from '@/components/CheckupForm'
import { Icon } from '@/components/Icon'
import { PageHero } from '@/components/PageHero'
import { LiquidField } from '@/components/ui'
import { pageMeta } from '@/lib/meta'
import { whatsappLink } from '@/lib/site'

// Campaign landing page: every ad's call to action points here.
export const metadata = pageMeta(
  '/check-up/',
  'Free website check-up',
  'Send us your website and get a free, honest check-up: speed, phones, Google visibility, trust and whether visitors can easily contact you. No obligation.',
)

const CHECKS: { icon: 'gauge' | 'monitor' | 'search' | 'shield' | 'whatsapp'; title: string; body: string }[] = [
  { icon: 'gauge', title: 'Speed', body: 'How fast it loads, especially on mobile data.' },
  { icon: 'monitor', title: 'Phones', body: 'How it looks and works on the screens most visitors use.' },
  { icon: 'search', title: 'Google', body: 'Whether people searching for what you do can find you.' },
  { icon: 'shield', title: 'Trust', body: 'Security, a working privacy page, and a professional first impression.' },
  { icon: 'whatsapp', title: 'Getting in touch', body: 'How easy it is for a visitor to call, WhatsApp or book you.' },
]

const STEPS = [
  { title: 'Send your link', body: 'Fill in the form. It takes under a minute.' },
  { title: 'We review it', body: 'A real person checks your site properly: no automated spam report.' },
  { title: 'Get your report', body: 'A short, honest summary by email of what works and what to fix first.' },
]

export default function CheckupPage() {
  return (
    <>
      <PageHero
        compact
        eyebrow="Free · No obligation"
        title={<>Is your website <span className="accent-serif text-teal-500">working for you?</span></>}
        lede="Send us your link and we’ll give it a free, honest check-up. You’ll know exactly what’s helping your business, and what’s quietly costing you customers."
      />
      <section className="canvas-tint">
        <LiquidField blobs={[{ tone: 'teal', top: '0%', left: '65%', size: 560 }, { tone: 'mint', top: '45%', left: '-10%', size: 420 }]} />
        <div className="container-site grid gap-12 pb-24 pt-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="h3">What we check</h2>
            <ul className="mt-5 grid gap-3">
              {CHECKS.map((c) => (
                <li key={c.title} className="glass-light flex items-start gap-4 rounded-[20px] p-5">
                  <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-navy-900 text-teal-500"><Icon name={c.icon} /></span>
                  <span><span className="block font-semibold">{c.title}</span><span className="text-ink-2">{c.body}</span></span>
                </li>
              ))}
            </ul>
            <h2 className="h3 mt-10">How it works</h2>
            <ol className="mt-5 grid gap-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-teal-500/15 font-mono text-[0.875rem] font-semibold text-teal-700">{i + 1}</span>
                  <span><span className="block font-semibold">{s.title}</span><span className="text-ink-2">{s.body}</span></span>
                </li>
              ))}
            </ol>
            <p className="mt-10 text-ink-2">
              No website yet? <Link href="/quote/" className="link font-medium">See what one would cost</Link>, or{' '}
              <a href={whatsappLink('Hi Tshedza, I’d like a free website check-up.')} className="link font-medium" rel="noopener">send your link on WhatsApp</a>.
            </p>
          </div>
          <div className="lg:col-span-7">
            <CheckupForm />
          </div>
        </div>
      </section>
    </>
  )
}
