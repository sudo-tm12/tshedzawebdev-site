// Illustrations of what we deliver, drawn in HTML/CSS + inline SVG (no images, no
// client work): crisp at any size, a few KB each, on-brand. All are decorative:
// each has a short sr-only description and the drawing itself is aria-hidden.
import { computeEstimate, rand } from '@/lib/quote/engine'
import { Icon, type IconName } from './Icon'

// ── Primitives ────────────────────────────────────────────────────────────────
function Bar({ w, className = '' }: { w: string; className?: string }) {
  return <span className={`block h-2 rounded-full bg-line ${className}`} style={{ width: w }} />
}

function Window({ children, url = 'yourbusiness.co.za', className = '' }: { children: React.ReactNode; url?: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[14px] border border-line bg-card shadow-[var(--shadow-lg)] ${className}`}>
      <div className="flex h-8 items-center gap-1.5 border-b border-line bg-line-2/70 px-3">
        <span className="h-2 w-2 rounded-full bg-[#e5e7eb]" /><span className="h-2 w-2 rounded-full bg-[#e5e7eb]" /><span className="h-2 w-2 rounded-full bg-[#e5e7eb]" />
        <span className="ml-2 flex items-center gap-1 rounded-md bg-card px-2 py-0.5 font-mono text-[0.625rem] text-ink-3"><Icon name="shield" size={10} />{url}</span>
      </div>
      {children}
    </div>
  )
}

function Phone({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[26px] border-[6px] border-navy-900 bg-card shadow-[var(--shadow-lg)] ${className}`}>
      <div className="mx-auto mt-1.5 h-3 w-12 rounded-full bg-navy-900" />
      {children}
    </div>
  )
}

function Float({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass-light absolute rounded-[16px] p-3.5 ${className}`}>{children}</div>
}

function Frame({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <figure className={`relative ${className}`}>
      <figcaption className="sr-only">{label}</figcaption>
      <div aria-hidden="true">{children}</div>
    </figure>
  )
}

/** A generic small-business site, drawn: the kind of site we build. */
function MiniSite({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'p-3' : 'p-5'}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded-[5px] bg-navy-900" /><Bar w="44px" className="bg-ink/70" /></span>
        {compact ? <span className="h-1.5 w-4 rounded bg-line" /> : <span className="flex gap-2"><Bar w="26px" /><Bar w="26px" /><Bar w="26px" /><span className="h-4 w-14 rounded-full bg-teal-500" /></span>}
      </div>
      <div className={`grid gap-4 ${compact ? 'mt-4' : 'mt-6 grid-cols-[1.1fr_1fr] items-center'}`}>
        <div>
          <span className="block font-semibold leading-[1.05] tracking-tight text-ink" style={{ fontSize: compact ? '0.8rem' : '1.35rem' }}>Your business,<br /><span className="accent-serif text-teal-700">online.</span></span>
          <div className="mt-2.5 grid gap-1.5"><Bar w="92%" /><Bar w="70%" /></div>
          <div className="mt-3 flex gap-1.5"><span className="h-5 w-16 rounded-full bg-navy-900" /><span className="h-5 w-14 rounded-full border border-line" /></div>
        </div>
        <div className={`rounded-[10px] bg-[linear-gradient(135deg,#0a1b2e,#1e3a57_55%,#1da1c2)] ${compact ? 'h-16' : 'h-28'}`} />
      </div>
      <div className={`mt-4 grid grid-cols-3 gap-2 ${compact ? 'hidden' : ''}`}>
        {[0, 1, 2].map((i) => <div key={i} className="rounded-[8px] border border-line p-2"><span className="block h-3 w-3 rounded bg-teal-100" /><Bar w="70%" className="mt-2" /><Bar w="50%" className="mt-1" /></div>)}
      </div>
    </div>
  )
}

// ── Home hero ─────────────────────────────────────────────────────────────────
export function HeroVisual() {
  const e = computeEstimate({ service: 'website', tier: 'business', units: 5, addons: {}, monthly: [], priority: false })
  return (
    <Frame label="Illustration: a business website on a laptop and phone, an instant price estimate, and a new WhatsApp enquiry arriving." className="mx-auto w-full max-w-[560px] pb-16 pt-10">
      <Window><MiniSite /></Window>
      <Phone className="absolute bottom-0 -right-1 w-[28%] min-w-[112px] sm:-right-6"><MiniSite compact /></Phone>
      <Float className="right-[22%] top-0 w-[200px] sm:right-[18%]">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-teal-700">Instant estimate</p>
        <p className="mt-1 text-[1.0625rem] font-semibold tabular-nums tracking-tight">{rand(e.low)} – {rand(e.high)}</p>
        <p className="mt-0.5 text-[0.75rem] text-ink-3">5-page business site · ~{e.weeks} weeks</p>
      </Float>
      <Float className="bottom-2 -left-1 flex w-[230px] items-start gap-2.5 sm:-left-8">
        <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#25d366]/15 text-[#128c4a]"><Icon name="whatsapp" size={17} /></span>
        <span><span className="block text-[0.8125rem] font-semibold">New enquiry</span><span className="block text-[0.75rem] leading-snug text-ink-2">“Hi! Saw your website. Can I book for Saturday?”</span></span>
      </Float>
    </Frame>
  )
}

// ── Service illustrations ─────────────────────────────────────────────────────
function WebsitesVisual() {
  return (
    <Frame label="Illustration: a fast, mobile-first website on desktop and phone, found on Google." className="mx-auto w-full max-w-[520px] pb-20">
      <Window><MiniSite /></Window>
      <Phone className="absolute -bottom-1 right-2 w-[28%] min-w-[110px]"><MiniSite compact /></Phone>
      <Float className="-bottom-2 -left-1 w-[190px] sm:-left-8">
        <p className="flex items-center gap-1.5 text-[0.75rem] font-semibold"><Icon name="search" size={14} className="text-teal-700" /> Google</p>
        <p className="mt-1.5 text-[0.6875rem] text-success">yourbusiness.co.za</p>
        <p className="text-[0.8125rem] font-semibold leading-tight text-[#1a0dab]">Your Business · Pretoria</p>
        <Bar w="90%" className="mt-1.5" /><Bar w="60%" className="mt-1" />
      </Float>
    </Frame>
  )
}

function EcommerceVisual() {
  const products = ['#0a1b2e', '#1e3a57', '#1da1c2', '#b45d2c', '#13283f', '#7a8696']
  return (
    <Frame label="Illustration: an online store with products, a secure local checkout and an order notification." className="mx-auto w-full max-w-[520px] pb-10">
      <Window url="yourstore.co.za">
        <div className="p-4">
          <div className="flex items-center justify-between"><Bar w="60px" className="bg-ink/70" /><span className="flex items-center gap-1 text-ink-2"><Icon name="bag" size={14} /><span className="rounded-full bg-teal-500 px-1.5 text-[0.625rem] font-semibold text-navy-950">2</span></span></div>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {products.map((c, i) => (
              <div key={c + i} className="rounded-[8px] border border-line p-1.5">
                <div className="h-14 rounded-[6px]" style={{ background: `linear-gradient(160deg, ${c}, ${c}cc)` }} />
                <Bar w="70%" className="mt-1.5" />
                <p className="mt-1 font-mono text-[0.625rem] font-semibold text-ink">R {(249 + i * 120).toLocaleString('en-ZA')}</p>
              </div>
            ))}
          </div>
        </div>
      </Window>
      <Float className="-bottom-2 -left-2 w-[210px] sm:-left-8">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-teal-700">Checkout</p>
        <div className="mt-2 grid gap-1.5 text-[0.75rem]">
          {['Card', 'Instant EFT', 'SnapScan / QR'].map((m, i) => (
            <span key={m} className={`flex items-center justify-between rounded-md border px-2 py-1 ${i === 0 ? 'border-navy-900' : 'border-line'}`}>{m}{i === 0 ? <Icon name="check" size={12} className="text-teal-700" /> : null}</span>
          ))}
        </div>
      </Float>
      <Float className="right-0 top-[38%] flex w-[180px] items-center gap-2.5 sm:-right-6">
        <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-success-tint text-success"><Icon name="check" size={16} /></span>
        <span><span className="block text-[0.8125rem] font-semibold">New order #1042</span><span className="text-[0.75rem] text-ink-3">Paid · courier booked</span></span>
      </Float>
    </Frame>
  )
}

function WebAppsVisual() {
  const bars = [42, 64, 50, 78, 60, 88, 72]
  return (
    <Frame label="Illustration: a custom web app dashboard with navigation, figures, a chart and a table." className="mx-auto w-full max-w-[540px] pb-6">
      <Window url="app.yourbusiness.co.za">
        <div className="grid grid-cols-[88px_1fr]">
          <div className="grid content-start gap-2 bg-navy-900 p-3">
            <span className="mb-2 h-4 w-4 rounded-[5px] bg-teal-500" />
            {['Overview', 'Clients', 'Projects', 'Invoices', 'Reports'].map((l, i) => (
              <span key={l} className={`rounded-md px-2 py-1 text-[0.625rem] ${i === 0 ? 'bg-white/10 text-white' : 'text-white/55'}`}>{l}</span>
            ))}
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {[['Active', '24'], ['This month', 'R 48k'], ['Overdue', '3']].map(([k, v]) => (
                <div key={k} className="rounded-[8px] border border-line p-2"><p className="text-[0.5625rem] uppercase tracking-wider text-ink-3">{k}</p><p className="font-semibold tabular-nums">{v}</p></div>
              ))}
            </div>
            <div className="mt-3 flex h-20 items-end gap-1.5 rounded-[8px] border border-line p-2">
              {bars.map((h, i) => <span key={i} className={`flex-1 rounded-t ${i === 5 ? 'bg-teal-500' : 'bg-navy-900/80'}`} style={{ height: `${h}%` }} />)}
            </div>
            <div className="mt-3 grid gap-1.5">
              {[0, 1, 2].map((i) => <div key={i} className="flex items-center justify-between rounded-md bg-paper px-2 py-1.5"><Bar w="40%" /><span className={`rounded px-1.5 text-[0.5625rem] font-semibold ${i === 2 ? 'bg-warn-tint text-warn' : 'bg-success-tint text-success'}`}>{i === 2 ? 'Due' : 'Paid'}</span></div>)}
            </div>
          </div>
        </div>
      </Window>
    </Frame>
  )
}

function FlowNode({ icon, title, sub, accent = false }: { icon: IconName; title: string; sub: string; accent?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-[12px] border bg-card px-3 py-2.5 shadow-[var(--shadow-sm)] ${accent ? 'border-teal-500' : 'border-line'}`}>
      <span className={`inline-flex h-8 w-8 flex-none items-center justify-center rounded-[8px] ${accent ? 'bg-navy-900 text-teal-500' : 'bg-line-2 text-ink-2'}`}><Icon name={icon} size={16} /></span>
      <span className="min-w-0"><span className="block text-[0.8125rem] font-semibold leading-tight">{title}</span><span className="block text-[0.6875rem] text-ink-3">{sub}</span></span>
    </div>
  )
}

function AutomationVisual() {
  return (
    <Frame label="Diagram: a form submission goes to a spreadsheet, AI drafts a reply, a person approves it, then the customer gets an email and a WhatsApp reminder." className="mx-auto w-full max-w-[520px]">
      <div className="relative rounded-[18px] border border-line bg-[radial-gradient(#e4e7ec_1px,transparent_1px)] bg-[length:16px_16px] p-5">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 520 330" preserveAspectRatio="none">
          <path d="M140 62 C 200 62, 200 62, 262 62" stroke="#1da1c2" strokeWidth="2" fill="none" strokeDasharray="5 5" />
          <path d="M262 92 C 262 130, 140 120, 140 158" stroke="#1da1c2" strokeWidth="2" fill="none" strokeDasharray="5 5" />
          <path d="M140 188 C 200 188, 200 188, 262 188" stroke="#1da1c2" strokeWidth="2" fill="none" strokeDasharray="5 5" />
          <path d="M380 205 C 400 240, 400 250, 390 262" stroke="#0a1b2e" strokeWidth="2" fill="none" />
          <path d="M330 205 C 300 240, 200 240, 150 262" stroke="#0a1b2e" strokeWidth="2" fill="none" />
        </svg>
        <div className="relative grid grid-cols-2 gap-x-8 gap-y-9">
          <FlowNode icon="file" title="Form submitted" sub="New enquiry" />
          <FlowNode icon="layers" title="Saved to sheet" sub="Row 248 added" />
          <FlowNode icon="sparkle" title="AI drafts reply" sub="From your FAQ only" accent />
          <FlowNode icon="check" title="You approve" sub="One tap" />
          <FlowNode icon="whatsapp" title="WhatsApp reminder" sub="Tomorrow, 09:00" />
          <FlowNode icon="mail" title="Email sent" sub="Within minutes" accent />
        </div>
      </div>
    </Frame>
  )
}

function SeoVisual() {
  const pts = [70, 66, 61, 58, 50, 44, 38, 30, 24, 18]
  return (
    <Frame label="Illustration: your business listed at the top of Google search results, with a chart of enquiries growing." className="mx-auto w-full max-w-[520px] pb-8">
      <Window url="google.com/search?q=web+designer+pretoria">
        <div className="grid gap-3 p-4">
          <div className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[0.75rem] text-ink-2"><Icon name="search" size={13} /> plumber near me</div>
          <div className="rounded-[10px] border border-teal-500 bg-teal-100/40 p-3">
            <p className="text-[0.6875rem] text-success">yourbusiness.co.za</p>
            <p className="text-[0.9375rem] font-semibold leading-tight text-[#1a0dab]">Your Business · Plumber in Pretoria</p>
            <p className="mt-0.5 text-[0.6875rem] text-ink-2">★★★★★ · Open now · Call · Directions</p>
          </div>
          {[0, 1].map((i) => <div key={i} className="px-3"><Bar w="40%" className="bg-[#c7d3ff]" /><Bar w="85%" className="mt-1.5" /><Bar w="60%" className="mt-1" /></div>)}
        </div>
      </Window>
      <Float className="-bottom-1 -right-1 w-[220px] sm:-right-6">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-teal-700">Enquiries from Google</p>
        <svg viewBox="0 0 200 70" className="mt-2 h-16 w-full">
          <polyline points={pts.map((y, i) => `${i * 22},${y}`).join(' ')} fill="none" stroke="#1da1c2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={`0,70 ${pts.map((y, i) => `${i * 22},${y}`).join(' ')} 198,70`} fill="rgba(29,161,194,0.12)" stroke="none" />
        </svg>
        <p className="text-[0.6875rem] text-ink-3">Illustrative trend</p>
      </Float>
    </Frame>
  )
}

function SocialVisual() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const plan: Record<number, string> = { 0: '#0a1b2e', 2: '#1da1c2', 3: '#1e3a57', 5: '#b45d2c' }
  return (
    <Frame label="Illustration: a weekly content calendar with designed posts, and a phone showing a published post." className="mx-auto w-full max-w-[520px] pb-8">
      <div className="rounded-[18px] border border-line bg-card p-4 shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between"><p className="text-[0.8125rem] font-semibold">Content plan · this week</p><span className="chip">4 posts</span></div>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {days.map((d, i) => (
            <div key={d} className="text-center">
              <p className="font-mono text-[0.5625rem] text-ink-3">{d}</p>
              <div className="mt-1 aspect-square rounded-[6px] border border-line" style={plan[i] ? { background: `linear-gradient(140deg, ${plan[i]}, ${plan[i]}aa)`, borderColor: 'transparent' } : undefined} />
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-1.5"><Bar w="80%" /><Bar w="55%" /></div>
      </div>
      <Phone className="absolute -bottom-2 -right-1 w-[34%] min-w-[130px] sm:-right-6">
        <div className="p-2">
          <div className="flex items-center gap-1.5"><span className="h-4 w-4 rounded-full bg-navy-900" /><Bar w="40%" /></div>
          <div className="mt-2 aspect-square rounded-[8px] bg-[linear-gradient(140deg,#0a1b2e,#1da1c2)]" />
          <div className="mt-2 flex gap-2 text-ink-2"><Icon name="heart" size={12} /><Icon name="megaphone" size={12} /></div>
          <Bar w="80%" className="mt-1.5" />
        </div>
      </Phone>
    </Frame>
  )
}

function TradingVisual() {
  // A deterministic candle series; markers show where rules fire. Not real market data.
  const candles = [[40, 52, 36, 56], [52, 47, 44, 55], [47, 58, 45, 61], [58, 63, 55, 67], [63, 57, 54, 66], [57, 50, 48, 60], [50, 55, 47, 57], [55, 66, 53, 69], [66, 72, 63, 75], [72, 69, 66, 76], [69, 78, 67, 80], [78, 74, 71, 81]]
  const y = (v: number) => 110 - v
  return (
    <Frame label="Illustration: a price chart with candlesticks, where an Expert Advisor's entry and exit rules trigger. Not real market data." className="mx-auto w-full max-w-[520px] pb-8">
      <div className="rounded-[18px] bg-navy-900 p-4 shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between text-white"><p className="font-mono text-[0.6875rem] text-white/70">EURUSD · H1 · illustration</p><span className="rounded bg-teal-500/20 px-1.5 py-0.5 font-mono text-[0.625rem] text-teal-500">EA running</span></div>
        <svg viewBox="0 0 300 120" className="mt-3 w-full">
          {[30, 60, 90].map((g) => <line key={g} x1="0" x2="300" y1={g} y2={g} stroke="rgba(255,255,255,0.07)" />)}
          {candles.map(([o, c, l, h], i) => {
            const x = 14 + i * 24
            const up = c! >= o!
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={y(h!)} y2={y(l!)} stroke={up ? '#1da1c2' : '#7a8696'} strokeWidth="1.5" />
                <rect x={x - 6} y={y(Math.max(o!, c!))} width="12" height={Math.max(2, Math.abs(c! - o!))} rx="1.5" fill={up ? '#1da1c2' : '#7a8696'} />
              </g>
            )
          })}
          <g><circle cx={14 + 2 * 24} cy={y(42)} r="7" fill="#12805c" /><path d={`M${14 + 2 * 24 - 3} ${y(42) + 1} l3 -3 3 3`} stroke="#fff" strokeWidth="1.5" fill="none" /></g>
          <g><circle cx={14 + 9 * 24} cy={y(80)} r="7" fill="#b45d2c" /><path d={`M${14 + 9 * 24 - 3} ${y(80) - 1} l3 3 3 -3`} stroke="#fff" strokeWidth="1.5" fill="none" /></g>
        </svg>
      </div>
      <Float className="-bottom-1 -left-1 w-[230px] bg-navy-950 sm:-left-6">
        <pre className="font-mono text-[0.625rem] leading-relaxed text-white/85">{`if (fastMA > slowMA && risk <= 1%)
   OpenBuy(lot, stopLoss);
if (trailing.hit) Close();`}</pre>
      </Float>
    </Frame>
  )
}

const SERVICE_VISUALS: Record<string, () => React.ReactNode> = {
  websites: WebsitesVisual,
  ecommerce: EcommerceVisual,
  'web-apps': WebAppsVisual,
  automation: AutomationVisual,
  'seo-google-ads': SeoVisual,
  'social-media': SocialVisual,
  'trading-bots': TradingVisual,
}

export function ServiceVisual({ slug }: { slug: string }) {
  const V = SERVICE_VISUALS[slug]
  return V ? <V /> : null
}

/** The 4-step process as a connected diagram (used on service pages). */
export function ProcessDiagram({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="relative grid gap-6 md:grid-cols-4 md:gap-4">
      <span aria-hidden="true" className="absolute left-[19px] top-10 bottom-10 w-px bg-[repeating-linear-gradient(to_bottom,#1da1c2_0_6px,transparent_6px_12px)] md:left-10 md:right-10 md:top-[19px] md:bottom-auto md:h-px md:w-auto md:bg-[repeating-linear-gradient(to_right,#1da1c2_0_6px,transparent_6px_12px)]" />
      {steps.map((s, i) => (
        <li key={s.title} className="relative flex gap-4 md:flex-col md:gap-0">
          <span className="relative z-10 inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-navy-900 font-mono text-[0.8125rem] text-teal-500 ring-4 ring-card">0{i + 1}</span>
          <div className="md:mt-5">
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-1 text-[0.9375rem] text-ink-2">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
