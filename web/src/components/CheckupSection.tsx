// Home page: the free website check-up. Designed phone-first, one idea per block:
//   1. the offer (centred headline, one sentence, one button)
//   2. the hero object: an example report as a widget, five "activity rings" that draw in on scroll
//   3. what we check, as swipeable highlight tiles
//   4. how it works, three steps
//   5. the close (button again, or send the link on WhatsApp)
// The report is an example and says so: no real site, no invented scores.
import Link from 'next/link'
import { whatsappLink } from '@/lib/site'
import { Icon, type IconName } from './Icon'
import { SwipeRail } from './SwipeRail'
import { LiquidField } from './ui'

type Status = 'good' | 'quick' | 'fix'

interface Check {
  icon: IconName
  title: string
  label: string
  note: string
  status: Status
  /** How full the example ring is (0-1). */
  fill: number
  color: string
  body: string
  looks: string[]
}

// One colour per check, chosen to sit with the brand teal (no traffic-light rainbow).
const CHECKS: Check[] = [
  { icon: 'gauge', title: 'Speed', label: 'Speed on phones', note: 'Slow on mobile data', status: 'fix', fill: 0.3, color: '#1da1c2',
    body: 'How fast it loads on mobile data, where most of your visitors are.', looks: ['Load time', 'Image sizes', 'Mobile data'] },
  { icon: 'monitor', title: 'Phones', label: 'Works on phones', note: 'Buttons too small to tap', status: 'quick', fill: 0.62, color: '#5468ff',
    body: 'Whether it is easy to read, tap and use on a small screen.', looks: ['Tap targets', 'Text size', 'Layout'] },
  { icon: 'search', title: 'Google', label: 'Found on Google', note: 'Pages have no proper titles', status: 'fix', fill: 0.38, color: '#9a7cf0',
    body: 'Whether people searching for what you do can actually find you.', looks: ['Page titles', 'Descriptions', 'Search Console'] },
  { icon: 'shield', title: 'Trust', label: 'Feels trustworthy', note: 'Secure, privacy page in place', status: 'good', fill: 0.92, color: '#20b486',
    body: 'The padlock, a privacy page and a first impression that says “we’re open”.', looks: ['HTTPS', 'Privacy page', 'Broken links'] },
  { icon: 'whatsapp', title: 'Contact', label: 'Easy to contact', note: 'No WhatsApp button yet', status: 'quick', fill: 0.56, color: '#f2a93b',
    body: 'How quickly a visitor can call, WhatsApp or book you.', looks: ['WhatsApp', 'Click-to-call', 'Forms'] },
]

const STATUS: Record<Status, { text: string; cls: string }> = {
  good: { text: 'Good', cls: 'text-success' },
  quick: { text: 'Quick win', cls: 'text-warn' },
  fix: { text: 'Fix first', cls: 'text-danger' },
}

const STEPS = [
  { title: 'Send your link', body: 'Your website and how to reach you. Under a minute.' },
  { title: 'We review it', body: 'A real person checks it properly, on a real phone.' },
  { title: 'Get your report', body: 'A short, honest email: what works, what to fix first.' },
]

/** Five concentric rings, outside in. They draw on scroll (CSS view timeline); static elsewhere. */
function Rings() {
  const size = 232
  const stroke = 13
  const gap = 5
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[232px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90" aria-hidden="true">
        {CHECKS.map((c, i) => {
          const r = size / 2 - stroke / 2 - i * (stroke + gap)
          const len = 2 * Math.PI * r
          const off = len * (1 - c.fill)
          return (
            <g key={c.title}>
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.color} strokeOpacity={0.14} strokeWidth={stroke} />
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.color} strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={len} strokeDashoffset={off} className="ring-draw"
                style={{ '--c': len, '--off': off, animationRange: `entry ${15 + i * 6}% cover ${42 + i * 6}%` } as React.CSSProperties} />
            </g>
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[2.25rem] font-semibold leading-none tracking-[-0.04em] tabular-nums">5</span>
        <span className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-3">checks</span>
      </div>
    </div>
  )
}

/** The hero object: an example report, presented like a widget. */
function ReportWidget() {
  return (
    <figure className="checkup-widget rings relative mx-auto w-full max-w-[880px] overflow-hidden rounded-[32px] p-4 sm:rounded-[40px] sm:p-6 md:p-8" aria-label="Example of a website check-up report">
      <span className="checkup-scan" aria-hidden="true" />
      {/* Window bar */}
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[conic-gradient(from_200deg,#1da1c2,#5468ff,#9a7cf0,#20b486,#f2a93b,#1da1c2)] p-[2px]">
          <span className="flex h-full w-full items-center justify-center rounded-full bg-card text-[0.75rem] font-bold text-ink">Y</span>
        </span>
        <span className="min-w-0 truncate font-mono text-[0.8125rem] text-ink-2">yourbusiness.co.za</span>
        <span className="ml-auto flex-none rounded-full bg-line-2 px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-3">Example</span>
      </div>

      <div className="mt-6 grid items-center gap-7 md:mt-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
        <Rings />
        {/* Grouped list, like a settings screen: one container, hairlines between rows */}
        <ul className="divide-y divide-line overflow-hidden rounded-[20px] border border-line bg-card/85 backdrop-blur-sm">
          {CHECKS.map((c) => (
            <li key={c.title} className="flex items-center gap-3 px-4 py-3">
              <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: c.color }} />
              <span className="min-w-0 flex-1">
                <span className="block text-[0.9375rem] font-semibold leading-tight">{c.label}</span>
                <span className="mt-0.5 block truncate text-[0.8125rem] text-ink-3">{c.note}</span>
              </span>
              <span className={`flex-none text-[0.8125rem] font-semibold ${STATUS[c.status].cls}`}>{STATUS[c.status].text}</span>
            </li>
          ))}
        </ul>
      </div>

      <figcaption className="mt-4 flex items-start gap-3 rounded-[20px] bg-navy-900 p-4 text-white sm:mt-5 sm:items-center sm:p-5">
        <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-teal-500/15 text-teal-500"><Icon name="sparkle" size={17} /></span>
        <span className="text-[0.9375rem] leading-snug text-white/80"><span className="font-semibold text-white">Top priority: speed on phones.</span> Most visitors leave a slow site before it loads.</span>
      </figcaption>
    </figure>
  )
}

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
