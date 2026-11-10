import Link from 'next/link'
import { Icon, type IconName } from '@/components/Icon'
import { CheckupSection } from '@/components/CheckupSection'
import { KnowledgeHubSection } from '@/components/KnowledgeHubSection'
import { BuildStory } from '@/components/motion/BuildStory'
import { HeroPhone } from '@/components/motion/HeroPhone'
import { HeroShowcase } from '@/components/motion/HeroShowcase'
import { Packages } from '@/components/Packages'
import { StudioConsole } from '@/components/motion/StudioConsole'
import { Spotlight, WordCycle, WordSwap } from '@/components/motion/basics'
import { SwipeRail } from '@/components/SwipeRail'
import { DeviceDuo, LiquidField } from '@/components/ui'
import { WallTeaser } from '@/components/wall/WallTeaser'
import { ServiceVisual } from '@/components/visuals'
import { SERVICES } from '@/data/services'
import { WORK } from '@/data/work'
import { pageMeta } from '@/lib/meta'
import { fromPrice } from '@/lib/pricing'
import { SITE, whatsappLink } from '@/lib/site'

export const metadata = pageMeta(
  '/',
  `${SITE.name}: websites, apps & automation in ${SITE.city}`,
  'A Pretoria studio building fast, beautiful websites, online stores, web apps and automations for South African businesses. Get an instant price in rand.',
)

const STACK = ['Next.js', 'React', 'TypeScript', 'Node.js', 'MongoDB', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'Python', 'n8n', 'Google Apps Script', 'WhatsApp Business', 'PayFast', 'Yoco', 'Google Ads', 'MQL5', 'Vercel', 'Cloudflare']

const HERO_WORDS = ['websites', 'online stores', 'web apps', 'automations']
const d = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

const STANDARDS: { art: 'speed' | 'secure' | 'access' | 'docs'; title: string; body: string }[] = [
  { art: 'speed', title: 'Fast on mobile data', body: 'Every page has a weight budget and is tested on real phones.' },
  { art: 'secure', title: 'Secure & POPIA-aware', body: 'Protected forms, written privacy pages, consent before tracking.' },
  { art: 'access', title: 'Accessible', body: 'Contrast, keyboard and screen-reader support, built in.' },
  { art: 'docs', title: 'Documented & yours', body: 'Written scope, hand-over notes, and you own everything.' },
]

// The hero's trust strip. Words, not numbers: real local clients (named in "Trusted by"),
// the full range of services, and ownership of everything we build.
const TRUST: { icon: IconName; title: string; body: string }[] = [
  { icon: 'users', title: 'Trusted in SA', body: 'By local businesses' },
  { icon: 'layers', title: 'Full service', body: 'Sites to automation' },
  { icon: 'shield', title: '100% yours', body: 'Code, domain, content' },
]

// Payment terms exactly as the FAQ and written quotes promise them (nothing invented).
const PAY: { icon: IconName; title: string; body: string }[] = [
  { icon: 'file', title: 'A fixed price in writing', body: 'After a short chat you get a written quote with the scope, price and timeline. Nothing to pay until you accept it.' },
  { icon: 'calendar', title: '50% to start', body: 'On projects over R3 000, a deposit secures your slot and the work begins.' },
  { icon: 'check', title: 'The rest at hand-over', body: 'You approve the design before any code. The balance is due when your site is handed over.' },
]

const STEPS = [
  { title: 'Tell us about it', body: 'Instant quote or a WhatsApp. We reply with questions, not a script.' },
  { title: 'A clear quote', body: 'Fixed scope, a price in rand and a timeline. A deposit secures your slot.' },
  { title: 'Design, then build', body: 'You approve the design before code, and watch progress as we go.' },
  { title: 'Launch & look after', body: 'Live, tested on real devices, handed over. Care plans keep it healthy.' },
]

const BENTO: { slug: string; span: string; visual?: boolean }[] = [
  { slug: 'websites', span: 'md:col-span-2 md:row-span-2', visual: true },
  { slug: 'automation', span: 'md:col-span-2' },
  { slug: 'ecommerce', span: '' },
  { slug: 'web-apps', span: '' },
  { slug: 'seo-google-ads', span: '' },
  { slug: 'social-media', span: '' },
  { slug: 'trading-bots', span: 'md:col-span-2' },
]

const H2 = 'reveal-h text-[clamp(2rem,3.4vw+1rem,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em]'

export default function HomePage() {
  const featured = WORK.filter((w) => w.desktop)
  const svc = (slug: string) => SERVICES.find((s) => s.slug === slug)!

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section id="hero" className="hero-dark noise -mt-16 pt-16">
        <div className="aurora aurora-1" aria-hidden="true" />
        <div className="aurora aurora-2" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        {/* Landing: the grid powers on, the headline rises line by line, then the visual
            builds whatever the rotating word says. Desktop: console + phone mock-up.
            Phones: no device inside a device; the interface floats free (HeroShowcase),
            and its tabs drive the headline word. Order on phones: text → showcase → facts. */}
        <WordCycle count={HERO_WORDS.length} watch="#hero">
          <div className="hero-exit container-site grid items-center pb-12 pt-8 sm:pb-16 sm:pt-14 lg:min-h-[calc(100svh-64px)] lg:grid-cols-12 lg:gap-x-10 lg:pb-24 lg:pt-10">
            <div className="max-lg:contents lg:col-span-6">
              {/* No eyebrow chip: the headline opens the page, so the showcase sits higher on landing. */}
              <h1 className="text-[clamp(2.625rem,6.4vw+0.5rem,5.75rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
                <span className="line-mask"><span style={d(170)}>We build <WordSwap words={HERO_WORDS} wordClassName="text-gradient" /></span></span>
                <span className="line-mask"><span style={d(290)}>that grow your <span className="accent-serif text-teal-500">business.</span></span></span>
              </h1>
              <p style={d(460)} className="enter mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-white/70 sm:mt-7 sm:text-[1.1875rem]">
                {SITE.tagline}<span className="max-sm:hidden">: designed for the phone in your customer’s hand, engineered to load fast, and priced honestly in rand</span><span className="sm:hidden">. Built for phones, priced honestly in rand</span>.
              </p>
              <div style={d(560)} className="enter mt-7 grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-[1fr_auto] sm:mt-9 sm:flex sm:flex-wrap sm:gap-3">
                <Link href="/quote/" className="btn btn-accent glow-border h-[52px] px-5 text-[1rem] sm:px-7">Get an instant quote <Icon name="arrowRight" size={18} /></Link>
                <Link href="/work/" className="btn btn-on-dark h-[52px] px-5 text-[1rem] sm:px-7"><span className="max-sm:hidden">See our </span><span className="sm:hidden">Our </span>work</Link>
              </div>
              {/* Trust, not a scoreboard: three equal points, no headline numbers to compare. */}
              <ul style={d(700)} aria-label="Why work with us" className="enter glass trust-strip mt-10 grid max-w-xl grid-cols-3 rounded-[22px] max-lg:order-2 lg:mt-12">
                {TRUST.map((t) => (
                  <li key={t.title} className="flex flex-col items-start gap-2.5 px-2.5 py-4 min-[380px]:px-3.5 sm:px-5 sm:py-5 [&+li]:border-l [&+li]:border-white/10">
                    <span className="trust-icon"><Icon name={t.icon} size={17} /></span>
                    <span>
                      <span className="block text-balance text-[0.875rem] font-semibold leading-tight tracking-[-0.01em] text-white sm:text-[1rem]">{t.title}</span>
                      <span className="mt-1 block text-[0.6875rem] leading-snug text-white/55 sm:text-[0.8125rem]">{t.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={d(420)} className="enter relative min-w-0 max-lg:order-1 max-lg:mt-10 lg:col-span-6">
              <div className="hidden lg:block lg:pr-16"><StudioConsole /></div>
              <HeroPhone className="hidden lg:absolute lg:-bottom-24 lg:-right-4 lg:block lg:origin-bottom-right lg:scale-[0.72]" />
              <HeroShowcase className="lg:hidden" />
            </div>
          </div>
        </WordCycle>

        {/* Tech marquee */}
        <div className="border-t border-white/10 py-5 sm:py-7">
          <p className="sr-only">Technologies we work with: {STACK.join(', ')}</p>
          <div className="marquee" aria-hidden="true">
            {[0, 1].map((k) => (
              <div key={k} className="marquee-track">
                {STACK.map((t) => <span key={t} className="whitespace-nowrap font-mono text-[0.875rem] tracking-wide text-white/45">{t}</span>)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clients ──────────────────────────────────────────────────────── */}
      <section aria-label="Clients" className="border-b border-line bg-card">
        <div className="container-site flex flex-col gap-3 py-6 sm:py-8 md:flex-row md:items-center md:gap-12">
          <p className="eyebrow flex-none">Trusted by</p>
          <ul className="no-scrollbar -mx-5 flex gap-x-7 overflow-x-auto whitespace-nowrap px-5 text-[1rem] font-semibold tracking-tight text-ink/70 md:mx-0 md:flex-wrap md:gap-x-10 md:gap-y-2 md:overflow-visible md:px-0 md:text-[1.125rem]">
            {WORK.map((w) => <li key={w.slug}>{w.client}</li>)}
          </ul>
        </div>
      </section>

      {/* ── Services bento ───────────────────────────────────────────────── */}
      <section className="section canvas-tint">
        <LiquidField blobs={[{ tone: 'teal', top: '8%', left: '-8%' }, { tone: 'lilac', top: '45%', left: '70%', size: 520 }, { tone: 'mint', top: '75%', left: '20%', size: 380 }]} />
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">What we do</p>
              <h2 className={`mt-4 ${H2}`}>One studio for the whole <span className="accent-serif text-teal-700">digital side</span> of your business.</h2>
            </div>
            <Link href="/services/" className="btn btn-secondary flex-none max-md:hidden">All services <Icon name="arrowRight" size={16} /></Link>
          </div>
          <SwipeRail label="Our services" grid="md" className="stagger mt-8 md:mt-14 md:auto-rows-[minmax(240px,auto)] md:grid-cols-4 md:gap-4">
            {BENTO.map(({ slug, span, visual }) => {
              const s = svc(slug)
              return (
                <Spotlight as="li" key={slug} className={`reveal glass-light group overflow-hidden rounded-[24px] ${span}`}>
                  <Link href={`/services/${slug}/`} className="flex h-full flex-col p-6 md:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-navy-900 text-teal-500 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"><Icon name={s.icon} size={24} /></span>
                      <span className="font-mono text-[0.75rem] text-ink-3">{fromPrice(s.pricebookId)}</span>
                    </div>
                    <h3 className="mt-5 text-[1.375rem] font-semibold tracking-tight md:mt-6 md:text-[1.5rem]">{s.name}</h3>
                    <p className="mt-2 max-w-md text-ink-2">{s.short}</p>
                    {visual ? <div className="mt-8 hidden flex-1 items-end md:flex"><ServiceVisual slug={slug} /></div> : null}
                    {slug === 'automation' ? <div className="max-md:hidden"><MiniFlow /></div> : null}
                    {slug === 'trading-bots' ? <div className="max-md:hidden"><MiniCandles /></div> : null}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[0.9375rem] font-medium text-teal-700">Explore <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" /></span>
                  </Link>
                </Spotlight>
              )
            })}
          </SwipeRail>
          <Link href="/services/" className="btn btn-secondary mt-6 w-full md:hidden">All services <Icon name="arrowRight" size={16} /></Link>
        </div>
      </section>

      {/* ── Work ─────────────────────────────────────────────────────────── */}
      <section className="section on-dark relative overflow-hidden bg-navy-950 text-white">
        <div className="aurora aurora-1 opacity-30" aria-hidden="true" />
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">Selected work</p>
              <h2 className={`mt-4 ${H2}`}>Real businesses. <span className="accent-serif text-teal-500">Real screens.</span></h2>
              <p className="mt-4 text-[1.0625rem] text-white/65 sm:mt-5 sm:text-[1.125rem]">Client work, shown with permission. No templates, no stock mock-ups.</p>
            </div>
            <Link href="/work/" className="btn btn-on-dark flex-none max-md:hidden">All projects <Icon name="arrowRight" size={16} /></Link>
          </div>
          <SwipeRail label="Selected projects" grid="md" itemWidth="86%" className="mt-8 md:mt-14 md:grid-cols-2 md:gap-6">
            {featured.map((p, i) => (
              <li key={p.slug} className={`reveal ${i === 0 ? 'md:col-span-2' : ''}`}>
                <Link href={`/work/${p.slug}/`} className="device-rise glass group block h-full rounded-[24px] p-2.5 transition-colors hover:border-teal-500/50 md:p-3">
                  <div className="transition-transform duration-700 ease-[var(--ease-out-soft)] md:group-hover:scale-[1.02]">
                    <DeviceDuo desktop={p.desktop!} phone={p.mobileTall ?? p.mobile} url={p.live} />
                  </div>
                  <div className="flex items-center justify-between gap-4 px-2 pb-1.5 pt-4 md:gap-6 md:px-3 md:pb-2 md:pt-5">
                    <div className="min-w-0">
                      <h3 className="text-[1.125rem] font-semibold md:text-[1.25rem]">{p.client}</h3>
                      <p className="mt-1 line-clamp-2 text-[0.875rem] text-white/60 md:line-clamp-none md:text-[0.9375rem]">{p.summary}</p>
                    </div>
                    <span className="glass-inset inline-flex h-11 w-11 flex-none items-center justify-center rounded-full transition-colors group-hover:border-teal-500 group-hover:bg-teal-500 group-hover:text-navy-950"><Icon name="arrowUpRight" size={18} /></span>
                  </div>
                </Link>
              </li>
            ))}
          </SwipeRail>
          <Link href="/work/" className="btn btn-on-dark mt-6 w-full md:hidden">All projects <Icon name="arrowRight" size={16} /></Link>
        </div>
      </section>

      {/* ── Free check-up: for visitors who already have a website (CheckupSection) ── */}
      <CheckupSection headingClass="reveal-h text-[clamp(2.375rem,4vw+1.25rem,4rem)] font-semibold leading-[1.02] tracking-[-0.04em]" />

      {/* ── How it works: a scroll story ─────────────────────────────────── */}
      {/* overflow-x-clip, not hidden: a hidden overflow would break the pinned device. */}
      <section aria-labelledby="how-h" className="section overflow-x-clip border-t border-line/60 bg-paper">
        <div className="container-site">
          <div className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 id="how-h" className={`mt-4 ${H2}`}>From first message to <span className="accent-serif text-teal-700">live</span>, in four steps.</h2>
          </div>
          <div className="mt-8 sm:mt-12"><BuildStory steps={STEPS} /></div>
        </div>
      </section>

      {/* ── Packages: real prices, then exactly how paying works ─────────── */}
      {/* Proof first (the work above), then the offer. Clear prices and the payment
          terms answer "what does it cost, what am I committing to?" before anyone asks. */}
      <section id="packages" aria-labelledby="packages-h" className="section canvas-tint scroll-mt-16 border-b border-line/60">
        <LiquidField blobs={[{ tone: 'teal', top: '10%', left: '60%', size: 560 }, { tone: 'sun', top: '-15%', left: '0%', size: 380 }, { tone: 'mint', top: '70%', left: '15%', size: 420 }]} />
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">Packages &amp; pricing</p>
              <h2 id="packages-h" className={`mt-4 ${H2}`}>Clear packages. <span className="accent-serif text-teal-700">Real prices.</span></h2>
              <p className="lede mt-4 sm:mt-5">Straight from our price book, the same numbers we put in writing. Pick one and message us, or build a custom quote with extras.</p>
            </div>
            <Link href="/quote/" className="btn btn-secondary flex-none max-md:hidden">Build a custom quote <Icon name="arrowRight" size={16} /></Link>
          </div>
          <div className="mt-8 sm:mt-12"><Packages /></div>

          <div className="mt-14 sm:mt-20">
            <p className="eyebrow">No surprises</p>
            <h3 className="mt-3 text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] sm:text-[2rem]">How paying works</h3>
            <ol className="stagger mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
              {PAY.map((s, i) => (
                <Spotlight as="li" key={s.title} className="reveal glass-light flex gap-4 rounded-[20px] p-5 sm:flex-col sm:gap-0 sm:rounded-[24px] sm:p-7">
                  <span className="relative inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-navy-900 text-teal-500">
                    <Icon name={s.icon} size={20} />
                    <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 font-mono text-[0.625rem] font-semibold text-navy-950">{i + 1}</span>
                  </span>
                  <div className="sm:mt-5">
                    <h4 className="text-[1.0625rem] font-semibold leading-snug sm:text-[1.125rem]">{s.title}</h4>
                    <p className="mt-1.5 text-[0.9375rem] leading-snug text-ink-2 sm:mt-2 sm:leading-normal">{s.body}</p>
                  </div>
                </Spotlight>
              ))}
            </ol>
            <p className="mt-5 flex items-start gap-2.5 text-[0.9375rem] text-ink-2 sm:mt-6"><Icon name="shield" size={18} className="mt-0.5 flex-none text-teal-700" />You own your domain, content and code. Every login and the documentation are handed over at launch.</p>
            <Link href="/quote/" className="btn btn-secondary mt-6 w-full md:hidden">Build a custom quote <Icon name="arrowRight" size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ── Standards ────────────────────────────────────────────────────── */}
      <section className="section canvas-tint">
        <LiquidField blobs={[{ tone: 'teal', top: '30%', left: '-12%', size: 500 }, { tone: 'mint', top: '65%', left: '70%', size: 460 }]} />
        <div className="container-site">
          <div className="max-w-2xl">
            <p className="eyebrow">Our standard</p>
            <h2 className={`mt-4 ${H2}`}>The details most people <span className="accent-serif text-teal-700">never see</span>, done properly.</h2>
          </div>
          <ul className="stagger mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-4">
            {STANDARDS.map((s) => (
              <Spotlight as="li" key={s.title} className="reveal glass-light rounded-[20px] p-4 sm:rounded-[24px] sm:p-7">
                <StandardArt kind={s.art} />
                <h3 className="mt-3 text-[0.9375rem] font-semibold leading-snug sm:mt-5 sm:text-[1.125rem]">{s.title}</h3>
                <p className="mt-1.5 text-[0.8125rem] leading-snug text-ink-2 sm:mt-2 sm:text-[0.9375rem] sm:leading-normal">{s.body}</p>
              </Spotlight>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Founder + final CTA ──────────────────────────────────────────── */}
      <section className="container-site pb-16 sm:pb-24">
        <div className="hero-dark noise relative overflow-hidden rounded-[24px] px-6 py-12 sm:rounded-[28px] sm:px-14 sm:py-16 lg:py-24">
          <div className="aurora aurora-1" aria-hidden="true" />
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="eyebrow">Who you will work with</p>
              <blockquote className="mt-4 sm:mt-5"><p className="quote-in accent-serif text-[clamp(1.875rem,2.8vw+1rem,3rem)] leading-[1.1]">“I build every project as if my name is on it, because it is.”</p></blockquote>
              <p className="mt-6 max-w-2xl text-white/70">{SITE.founder}, founder. A small studio by design: you speak to the person who writes your code. Grateful for every client, and determined to earn that trust in the details.</p>
              <div className="mt-8 flex flex-wrap gap-3 sm:mt-9">
                <Link href="/quote/" className="btn btn-accent glow-border h-[52px] px-7 max-sm:w-full">Start with an instant quote <Icon name="arrowRight" size={18} /></Link>
                <a href={whatsappLink('Hi Tshedza, I found you on your website and would like to chat about a project.')} className="btn btn-on-dark h-[52px] px-7 max-sm:w-full" rel="noopener"><Icon name="whatsapp" size={18} /> Chat on WhatsApp</a>
              </div>
            </div>
            <div className="hidden lg:col-span-4 lg:block">
              <div className="glass float-slow ml-auto flex aspect-square max-w-[300px] flex-col justify-end rounded-[28px] p-8">
                <span className="text-[6rem] font-semibold leading-none tracking-[-0.06em]">TD<span className="text-teal-500">.</span></span>
                <p className="mt-3 text-white/60">Data analyst · Developer · Builder</p>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* ── Learn (Knowledge Hub + coaching) ─────────────────────────────── */}
      <KnowledgeHubSection />

      {/* ── Community wall ───────────────────────────────────────────────── */}
      <section id="wall" className="section canvas-tint wall-cork scroll-mt-16">
        <LiquidField blobs={[{ tone: 'sun', top: '-10%', left: '60%', size: 520 }, { tone: 'lilac', top: '50%', left: '-10%', size: 480 }, { tone: 'teal', top: '70%', left: '75%', size: 400 }]} />
        <div className="container-site"><WallTeaser /></div>
      </section>


    </>
  )
}

/** Tiny scroll-played visuals for "Our standard" (their final frame is also the static one). */
function StandardArt({ kind }: { kind: 'speed' | 'secure' | 'access' | 'docs' }) {
  return (
    <span aria-hidden="true" className="inline-flex h-11 w-[60px] items-center justify-center rounded-[12px] bg-teal-100 text-teal-700 sm:h-12 sm:w-16">
      <svg width="44" height="32" viewBox="0 0 56 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {kind === 'speed' ? (
          <>
            <path d="M8 30a20 20 0 0 1 40 0" strokeOpacity="0.3" />
            <path d="M8 30a20 20 0 0 1 11-17.9" stroke="#b45d2c" strokeOpacity="0.55" />
            <path d="M40 13.6A20 20 0 0 1 48 30" stroke="#12805c" />
            <line className="art art-needle" x1="28" y1="30" x2="28" y2="14" stroke="#0a1b2e" strokeWidth="2.6" />
            <circle cx="28" cy="30" r="3" fill="#0a1b2e" stroke="none" />
          </>
        ) : kind === 'secure' ? (
          <>
            <path d="M28 4l15 6v9c0 8.5-6.3 14.6-15 17-8.7-2.4-15-8.5-15-17v-9z" strokeOpacity="0.45" />
            <path className="art art-draw" d="M21 20l5 5 9.5-10" stroke="#0a1b2e" strokeWidth="2.6" />
          </>
        ) : kind === 'access' ? (
          <>
            <rect x="4" y="15" width="12" height="10" rx="5" fill="currentColor" fillOpacity="0.25" stroke="none" />
            <rect x="23" y="15" width="12" height="10" rx="5" fill="currentColor" fillOpacity="0.25" stroke="none" />
            <rect x="42" y="15" width="12" height="10" rx="5" fill="currentColor" fillOpacity="0.25" stroke="none" />
            <rect className="art art-focus" x="1.5" y="12.5" width="17" height="15" rx="7.5" stroke="#0a1b2e" strokeWidth="2" />
          </>
        ) : (
          <>
            <path d="M17 4h16l8 8v24H17z" strokeOpacity="0.45" />
            <rect className="art art-line" x="22" y="16" width="14" height="2.4" rx="1.2" fill="#0a1b2e" stroke="none" />
            <rect className="art art-line" x="22" y="22" width="14" height="2.4" rx="1.2" fill="#0a1b2e" stroke="none" />
            <rect className="art art-line" x="22" y="28" width="9" height="2.4" rx="1.2" fill="#0a1b2e" stroke="none" />
          </>
        )}
      </svg>
    </span>
  )
}

function MiniFlow() {
  const nodes: { i: IconName; t: string }[] = [{ i: 'file', t: 'Form' }, { i: 'layers', t: 'Sheet' }, { i: 'sparkle', t: 'AI draft' }, { i: 'whatsapp', t: 'Reply' }]
  return (
    <div className="mt-6 flex items-center gap-1.5" aria-hidden="true">
      {nodes.map((n, i) => (
        <span key={n.t} className="contents">
          {i ? <span className="h-px flex-1 bg-[repeating-linear-gradient(90deg,#1da1c2_0_5px,transparent_5px_10px)]" /> : null}
          <span className="flex flex-col items-center gap-1.5"><span className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] border ${i === 2 ? 'border-teal-500 bg-navy-900 text-teal-500' : 'border-line bg-paper text-ink-2'}`}><Icon name={n.i} size={18} /></span><span className="font-mono text-[0.6875rem] text-ink-3">{n.t}</span></span>
        </span>
      ))}
    </div>
  )
}

function MiniCandles() {
  const c = [30, 42, 36, 50, 46, 58, 54, 66, 62, 74, 70, 82]
  return (
    <div className="mt-6 flex h-16 items-end gap-1.5" aria-hidden="true">
      {c.map((h, i) => <span key={i} className={`flex-1 rounded-sm ${i % 3 === 2 ? 'bg-ink-3/40' : 'bg-teal-500/80'}`} style={{ height: `${h}%` }} />)}
    </div>
  )
}
