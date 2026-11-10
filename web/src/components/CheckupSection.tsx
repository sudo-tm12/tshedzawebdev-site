// Home page: the free website check-up. Designed phone-first, one idea per block:
//   1. the offer (centred headline, one sentence, one button)
//   2. the hero object: an example report as a widget, five "activity rings" that draw in on scroll
//   3. what we check, as swipeable highlight tiles
//   4. how it works, three steps
//   5. the close (button again, or send the link on WhatsApp)
// The report is an example and says so: no real site, no invented scores.
import Link from 'next/link'
import { whatsappLink } from '@/lib/site'
import { CHECKS } from '@/data/checkup'
import { Icon } from './Icon'
import { ReportWidget } from './motion/ReportWidget'
import { SwipeRail } from './SwipeRail'
import { LiquidField } from './ui'

const STEPS = [
  { title: 'Send your link', body: 'Your website and how to reach you. Under a minute.' },
  { title: 'We review it', body: 'A real person checks it properly, on a real phone.' },
  { title: 'Get your report', body: 'A short, honest email: what works, what to fix first.' },
]

export function CheckupSection({ headingClass }: { headingClass: string }) {
  return (
    <section id="check-up" aria-labelledby="checkup-h" className="section canvas-tint relative scroll-mt-16 overflow-x-clip">
      <LiquidField blobs={[{ tone: 'teal', top: '4%', left: '55%', size: 560 }, { tone: 'lilac', top: '38%', left: '-18%', size: 460 }, { tone: 'mint', top: '72%', left: '60%', size: 420 }]} />
      <div className="container-site">
        {/* 1. The offer */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Free website check-up</p>
          <h2 id="checkup-h" className={`mt-4 ${headingClass}`}>Already have a website?<br /><span className="accent-serif text-teal-700">We’ll check it free.</span></h2>
          <p className="lede mx-auto mt-5 max-w-[34ch] sm:max-w-xl">A real person reviews your site and tells you, in plain words, what’s working and what to fix first.</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <Link href="/check-up/" className="btn btn-accent h-[52px] px-7 max-sm:w-full max-sm:max-w-[340px]">Get my free check-up <Icon name="arrowRight" size={18} /></Link>
            <a href="#checkup-steps" className="group inline-flex items-center gap-1 text-[1rem] font-medium text-teal-700">How it works <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-0.5" /></a>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-[0.8125rem] text-ink-3"><Icon name="clock" size={14} />Takes under a minute<span aria-hidden="true">·</span>No obligation</p>
        </div>

        {/* 2. The hero object */}
        <div className="mt-12 sm:mt-16"><ReportWidget /></div>

        {/* 3. What we check */}
        <div className="mt-20 sm:mt-28">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-[clamp(1.75rem,2.4vw+1rem,2.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]">What we check.</h3>
            <p className="mt-3 text-[1.0625rem] text-ink-2">Five things your customers notice in the first few seconds.</p>
          </div>
          <div className="mt-8 sm:mt-10">
            <SwipeRail label="What we check" grid="lg" itemWidth="78%" className="lg:grid-cols-5 lg:gap-4">
              {CHECKS.map((c) => (
                <li key={c.title} className="check-tile relative flex min-h-[320px] flex-col overflow-hidden rounded-[28px] border border-white/60 p-6 sm:min-h-[340px]"
                  style={{ '--tint': c.color } as React.CSSProperties}>
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] bg-card shadow-[0_10px_30px_-10px_rgba(10,27,46,0.25)]" style={{ color: c.color }}><Icon name={c.icon} size={26} /></span>
                  <h4 className="mt-12 text-[1.75rem] font-semibold leading-none tracking-[-0.035em]">{c.title}</h4>
                  <p className="mt-3 text-[0.9375rem] leading-snug text-ink-2">{c.body}</p>
                  <ul className="mt-auto flex flex-wrap gap-1.5 pt-5" aria-label={`What we look at for ${c.title.toLowerCase()}`}>
                    {c.looks.map((l) => <li key={l} className="check-tag rounded-full px-2.5 py-1 font-mono text-[0.6875rem]">{l}</li>)}
                  </ul>
                </li>
              ))}
            </SwipeRail>
          </div>
        </div>

        {/* 4. How it works */}
        <div id="checkup-steps" className="mt-20 scroll-mt-24 sm:mt-28">
          <h3 className="text-center text-[clamp(1.75rem,2.4vw+1rem,2.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]">How it works.</h3>
          <ol className="steps mx-auto mt-10 grid max-w-[420px] gap-0 md:max-w-none md:grid-cols-3 md:gap-8">
            {STEPS.map((s, i) => (
              <li key={s.title} className="step relative flex gap-5 pb-9 last:pb-0 md:flex-col md:items-center md:gap-0 md:pb-0 md:text-center">
                <span className="step-num relative z-[1] inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-navy-900 font-mono text-[0.9375rem] font-semibold text-white ring-[6px] ring-paper">{i + 1}</span>
                <span className="md:mt-5">
                  <span className="block text-[1.125rem] font-semibold tracking-tight">{s.title}</span>
                  <span className="mt-1 block text-[0.9375rem] leading-snug text-ink-2 md:mx-auto md:max-w-[26ch]">{s.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* 5. The close */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center sm:mt-20">
          <Link href="/check-up/" className="btn btn-accent h-[52px] px-7 max-sm:w-full max-sm:max-w-[340px]">Get my free check-up <Icon name="arrowRight" size={18} /></Link>
          <a href={whatsappLink('Hi Tshedza, I’d like a free website check-up. My website is: ')} rel="noopener" className="group inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink-2 hover:text-ink">
            <Icon name="whatsapp" size={16} className="text-success" />Prefer WhatsApp? Send us your link <Icon name="arrowRight" size={14} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  )
}
