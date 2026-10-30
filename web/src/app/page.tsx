import Link from 'next/link'
import { Icon, type IconName } from '@/components/Icon'
import { CommunityChat } from '@/components/motion/CommunityChat'
import { MiniQuote } from '@/components/motion/MiniQuote'
import { StudioConsole } from '@/components/motion/StudioConsole'
import { Spotlight, WordSwap } from '@/components/motion/basics'
import { BrowserFrame, LiquidField } from '@/components/ui'
import { WallTeaser } from '@/components/wall/WallTeaser'
import { PRICEBOOK_COACHING } from '@/lib/coaching'
import { rand } from '@/lib/quote/engine'
import { ProcessDiagram, ServiceVisual } from '@/components/visuals'
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

const STANDARDS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'gauge', title: 'Fast on mobile data', body: 'Every page has a weight budget and is tested on real phones.' },
  { icon: 'shield', title: 'Secure & POPIA-aware', body: 'Protected forms, written privacy pages, consent before tracking.' },
  { icon: 'users', title: 'Accessible', body: 'Contrast, keyboard and screen-reader support, built in.' },
  { icon: 'file', title: 'Documented & yours', body: 'Written scope, hand-over notes, and you own everything.' },
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

const H2 = 'text-[clamp(2rem,3.4vw+1rem,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em]'

export default function HomePage() {
  const featured = WORK.filter((w) => w.desktop)
  const svc = (slug: string) => SERVICES.find((s) => s.slug === slug)!

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero-dark noise -mt-16 pt-16">
        <div className="aurora aurora-1" aria-hidden="true" />
        <div className="aurora aurora-2" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="container-site grid items-center gap-14 pb-16 pt-14 lg:min-h-[calc(100svh-64px)] lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-10">
          <div className="lg:col-span-6">
            <p className="glass inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 font-mono text-[0.75rem] tracking-[0.08em] text-white/80">
              <span className="pulse-dot h-2 w-2 rounded-full bg-teal-500" /> WEB STUDIO · PRETORIA, SOUTH AFRICA
            </p>
            <h1 className="mt-7 text-[clamp(2.75rem,6.4vw+0.5rem,5.75rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
              We build <WordSwap words={['websites', 'online stores', 'web apps', 'automations']} wordClassName="text-gradient" />
              <br />that grow your <span className="accent-serif text-teal-500">business.</span>
            </h1>
            <p className="mt-7 max-w-xl text-[1.1875rem] leading-relaxed text-white/70">
              {SITE.tagline}: designed for the phone in your customer’s hand, engineered to load fast, and priced honestly in rand.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/quote/" className="btn btn-accent glow-border h-[52px] px-7 text-[1rem]">Get an instant quote <Icon name="arrowRight" size={18} /></Link>
              <Link href="/work/" className="btn btn-on-dark h-[52px] px-7 text-[1rem]">See our work</Link>
            </div>
            <dl className="glass mt-12 grid max-w-lg grid-cols-3 gap-6 rounded-[20px] px-6 py-5">
              {[['7', 'services, one studio'], ['R0', 'VAT, ever'], ['100%', 'yours to own']].map(([k, v]) => (
                <div key={v}><dt className="sr-only">{v}</dt><dd><span className="block text-[1.75rem] font-semibold tracking-tight">{k}</span><span className="text-[0.8125rem] text-white/55">{v}</span></dd></div>
              ))}
            </dl>
          </div>
          <div className="min-w-0 lg:col-span-6">
            <StudioConsole />
          </div>
        </div>

        {/* Tech marquee */}
        <div className="border-t border-white/10 py-7">
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
        <div className="container-site flex flex-col gap-4 py-8 md:flex-row md:items-center md:gap-12">
          <p className="eyebrow flex-none">Trusted by</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-[1rem] font-semibold tracking-tight text-ink/70 md:gap-x-10 md:text-[1.125rem]">
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
            <Link href="/services/" className="btn btn-secondary flex-none">All services <Icon name="arrowRight" size={16} /></Link>
          </div>
          <ul className="mt-14 grid auto-rows-[minmax(240px,auto)] gap-4 md:grid-cols-4">
            {BENTO.map(({ slug, span, visual }) => {
              const s = svc(slug)
              return (
                <Spotlight as="li" key={slug} className={`reveal glass-light group overflow-hidden rounded-[24px] ${span}`}>
                  <Link href={`/services/${slug}/`} className="flex h-full flex-col p-7">
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-navy-900 text-teal-500 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"><Icon name={s.icon} size={24} /></span>
                      <span className="font-mono text-[0.75rem] text-ink-3">{fromPrice(s.pricebookId)}</span>
                    </div>
                    <h3 className="mt-6 text-[1.5rem] font-semibold tracking-tight">{s.name}</h3>
                    <p className="mt-2 max-w-md text-ink-2">{s.short}</p>
                    {visual ? <div className="mt-8 flex flex-1 items-end"><ServiceVisual slug={slug} /></div> : null}
                    {slug === 'automation' ? <MiniFlow /> : null}
                    {slug === 'trading-bots' ? <MiniCandles /> : null}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[0.9375rem] font-medium text-teal-700">Explore <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" /></span>
                  </Link>
                </Spotlight>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ── Live price ───────────────────────────────────────────────────── */}
      <section className="section canvas-tint border-y border-line/60">
        <LiquidField blobs={[{ tone: 'teal', top: '20%', left: '55%', size: 560 }, { tone: 'sun', top: '-20%', left: '5%', size: 380 }]} />
        <div className="container-site grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">Instant pricing</p>
            <h2 className={`mt-4 ${H2}`}>Know your price <span className="accent-serif text-teal-700">in seconds.</span></h2>
            <p className="lede mt-5">No “contact us for pricing”. Pick what you are building, drag the size, and see an honest range in rand. The full quote adds extras and emails you a PDF.</p>
            <ul className="mt-7 grid gap-2.5 text-[0.9375rem] text-ink-2">
              {['Same price book as our written quotes', 'No VAT added, ever', '50% deposit only on projects over R3 000'].map((t) => <li key={t} className="flex gap-2.5"><Icon name="check" size={18} className="mt-0.5 text-teal-700" />{t}</li>)}
            </ul>
          </div>
          <div className="lg:col-span-7"><MiniQuote /></div>
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
              <p className="mt-5 text-[1.125rem] text-white/65">Client work, shown with permission. No templates, no stock mock-ups.</p>
            </div>
            <Link href="/work/" className="btn btn-on-dark flex-none">All projects <Icon name="arrowRight" size={16} /></Link>
          </div>
          <ul className="mt-14 grid gap-6 md:grid-cols-2">
            {featured.map((p, i) => (
              <li key={p.slug} className={`reveal ${i === 0 ? 'md:col-span-2' : ''}`}>
                <Link href={`/work/${p.slug}/`} className="glass group block rounded-[24px] p-3 transition-colors hover:border-teal-500/50">
                  <div className="overflow-hidden rounded-[16px]">
                    <div className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.025]">
                      <BrowserFrame src={p.desktop!.src} alt={p.desktop!.alt} width={p.desktop!.width} height={p.desktop!.height} url={p.live} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-6 px-3 pb-2 pt-5">
                    <div>
                      <h3 className="text-[1.25rem] font-semibold">{p.client}</h3>
                      <p className="mt-1 text-[0.9375rem] text-white/60">{p.summary}</p>
                    </div>
                    <span className="glass-inset inline-flex h-11 w-11 flex-none items-center justify-center rounded-full transition-colors group-hover:border-teal-500 group-hover:bg-teal-500 group-hover:text-navy-950"><Icon name="arrowUpRight" size={18} /></span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Learn (Knowledge Hub + coaching) ─────────────────────────────── */}
      <section id="learn" className="section on-dark relative scroll-mt-16 overflow-hidden bg-[linear-gradient(160deg,#06111f_0%,#0a2a3a_60%,#0f7590_130%)] text-white">
        <div className="aurora aurora-1 opacity-60" aria-hidden="true" />
        <div className="aurora aurora-2" aria-hidden="true" />
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">Learn · Knowledge Hub</p>
              <h2 className="mt-4 text-[clamp(2.5rem,5vw+1rem,4.75rem)] font-semibold leading-[0.96] tracking-[-0.045em]">Learn. Build. <span className="accent-serif text-teal-500">Earn.</span></h2>
              <p className="mt-6 max-w-xl text-[1.125rem] leading-relaxed text-white/70">TshedzaWebDev builds. Knowledge Hub teaches. A free community where young South Africans learn the skills we use on real client work, from zero to launch-ready.</p>
            </div>
            <Link href="/learn/" className="btn btn-on-dark flex-none">Everything on Learn <Icon name="arrowRight" size={16} /></Link>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-12">
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {[
                { t: 'Build & Launch Challenge', d: 'From an empty laptop to your own live website.', n: '9 lessons', icon: 'monitor' as IconName },
                { t: 'Automate & Earn Challenge', d: 'WhatsApp-first automation local businesses actually pay for.', n: '12 lessons', icon: 'zap' as IconName },
              ].map((c) => (
                <Spotlight key={c.t} className="glass reveal flex flex-col rounded-[24px] p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="glass-inset inline-flex h-12 w-12 flex-none items-center justify-center rounded-[14px] text-teal-500"><Icon name={c.icon} size={22} /></span>
                    <span className="rounded-full bg-teal-500/15 px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-teal-500">Free · {c.n}</span>
                  </div>
                  <h3 className="mt-6 text-[1.375rem] font-semibold tracking-tight">{c.t}</h3>
                  <p className="mt-2 text-white/65">{c.d}</p>
                </Spotlight>
              ))}
              <Spotlight className="glass reveal flex flex-col gap-6 rounded-[24px] p-7 sm:col-span-2 md:flex-row md:items-center">
                <div className="flex-1">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-white/75">Coaching</span>
                  <h3 className="mt-4 text-[1.375rem] font-semibold tracking-tight">AI Agency Builder</h3>
                  <p className="mt-2 text-white/65">Monthly coaching to find clients, price, deliver and grow an AI-augmented service business.</p>
                </div>
                <ul className="grid flex-none gap-2 md:w-[240px]">
                  {PRICEBOOK_COACHING.tiers.map((t) => (
                    <li key={t.id} className="glass-inset flex items-center justify-between rounded-[14px] px-4 py-2.5 text-[0.9375rem]">
                      <span>{t.name}</span><span className="font-mono tabular-nums text-teal-500">{rand(t.monthly)}/mo</span>
                    </li>
                  ))}
                </ul>
              </Spotlight>
              <div className="flex flex-wrap gap-3 pt-2 sm:col-span-2">
                <a href={SITE.knowledgeHub.whatsappCommunity} className="btn btn-accent glow-border" rel="noopener"><Icon name="whatsapp" size={18} /> Join the community</a>
                <Link href="/learn/#coaching" className="btn btn-on-dark">Coaching details</Link>
              </div>
            </div>
            <div className="relative lg:col-span-5">
              <div className="glass rounded-[30px] p-3"><CommunityChat /></div>
              <span className="glass float-slow absolute -top-5 left-6 hidden rounded-full px-4 py-2 text-[0.8125rem] font-medium text-white/85 sm:inline-flex">Made for phones &amp; mobile data</span>
              <span className="glass float-slower absolute -bottom-5 right-6 hidden rounded-full px-4 py-2 text-[0.8125rem] font-medium text-white/85 sm:inline-flex">Real tasks, reviewed together</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community wall ───────────────────────────────────────────────── */}
      <section id="wall" className="section canvas-tint wall-cork scroll-mt-16">
        <LiquidField blobs={[{ tone: 'sun', top: '-10%', left: '60%', size: 520 }, { tone: 'lilac', top: '50%', left: '-10%', size: 480 }, { tone: 'teal', top: '70%', left: '75%', size: 400 }]} />
        <div className="container-site"><WallTeaser /></div>
      </section>

      {/* ── Standards + process ──────────────────────────────────────────── */}
      <section className="section canvas-tint">
        <LiquidField blobs={[{ tone: 'teal', top: '30%', left: '-12%', size: 500 }, { tone: 'mint', top: '65%', left: '70%', size: 460 }]} />
        <div className="container-site">
          <div className="max-w-2xl">
            <p className="eyebrow">Our standard</p>
            <h2 className={`mt-4 ${H2}`}>The details most people <span className="accent-serif text-teal-700">never see</span>, done properly.</h2>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STANDARDS.map((s) => (
              <Spotlight as="li" key={s.title} className="reveal glass-light rounded-[24px] p-7">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 text-teal-700"><Icon name={s.icon} size={22} /></span>
                <h3 className="mt-5 text-[1.125rem] font-semibold">{s.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-ink-2">{s.body}</p>
              </Spotlight>
            ))}
          </ul>
          <div className="glass-light mt-20 rounded-[28px] p-8 lg:p-12">
            <p className="eyebrow">How it works</p>
            <h3 className="mt-3 text-[1.75rem] font-semibold tracking-tight">From first message to live, in four steps.</h3>
            <div className="mt-10"><ProcessDiagram steps={STEPS} /></div>
          </div>
        </div>
      </section>

      {/* ── Founder + final CTA ──────────────────────────────────────────── */}
      <section className="container-site pb-24">
        <div className="hero-dark noise relative overflow-hidden rounded-[28px] px-7 py-16 sm:px-14 lg:py-24">
          <div className="aurora aurora-1" aria-hidden="true" />
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="eyebrow">Who you will work with</p>
              <blockquote className="mt-5"><p className="accent-serif text-[clamp(1.75rem,2.8vw+1rem,3rem)] leading-[1.12]">“I build every project as if my name is on it, because it is.”</p></blockquote>
              <p className="mt-6 max-w-2xl text-white/70">{SITE.founder}, founder. A small studio by design: you speak to the person who writes your code. Grateful for every client, and determined to earn that trust in the details.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/quote/" className="btn btn-accent glow-border h-[52px] px-7">Start with an instant quote <Icon name="arrowRight" size={18} /></Link>
                <a href={whatsappLink('Hi Tshedza, I found you on your website and would like to chat about a project.')} className="btn btn-on-dark h-[52px] px-7" rel="noopener"><Icon name="whatsapp" size={18} /> Chat on WhatsApp</a>
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
      </section>
    </>
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
