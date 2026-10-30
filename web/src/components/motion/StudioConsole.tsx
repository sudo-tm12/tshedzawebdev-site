'use client'

import { useEffect, useState } from 'react'
import { Icon } from '../Icon'
import { useReducedMotion } from './basics'

// The hero demo: how a project goes from code → design → launch, played on a loop.
// Fixed height (no layout shift); visitors can click a stage; pauses on hover/focus;
// with reduced motion it shows each stage complete and never auto-advances.

const CODE = `export default function Home() {
  return (
    <Hero
      title="Your business, online."
      cta={{ label: 'Book now', href: '/book' }}
    />
    <Services items={services} />
    <WhatsAppButton number="+27…" />
  )
}`

const CHECKS = [
  'Mobile-first layout, tested on real phones',
  'Every page inside its weight budget',
  'Accessibility: contrast, keyboard, labels',
  'SEO: metadata, sitemap, structured data',
  'POPIA privacy page and consent',
  'Live on yourbusiness.co.za',
]

const STAGES = [
  { id: 'build', label: 'Build', icon: 'code' },
  { id: 'design', label: 'Design', icon: 'pen' },
  { id: 'launch', label: 'Launch', icon: 'zap' },
] as const

export function StudioConsole() {
  const reduced = useReducedMotion()
  const [stage, setStage] = useState(0)
  const [typed, setTyped] = useState(0)
  const [paused, setPaused] = useState(false)

  // Auto-advance stages.
  useEffect(() => {
    if (reduced || paused) return
    const t = setTimeout(() => setStage((s) => (s + 1) % STAGES.length), stage === 0 ? 6200 : 5000)
    return () => clearTimeout(t)
  }, [stage, reduced, paused])

  // Typewriter for the code stage.
  useEffect(() => {
    if (stage !== 0 || reduced) return
    const t = setInterval(() => setTyped((n) => (n >= CODE.length ? n : n + 3)), 28)
    return () => { clearInterval(t); setTyped(0) }
  }, [stage, reduced])

  const shownCode = reduced ? CODE : CODE.slice(0, typed)

  return (
    <div
      className="relative w-full min-w-0 overflow-hidden rounded-[18px] border border-white/10 bg-navy-900/70 shadow-[0_40px_120px_-40px_rgba(29,161,194,0.45)] backdrop-blur-xl"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true"><span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" /></div>
        <div role="tablist" aria-label="How we build" className="flex gap-1 rounded-full bg-white/5 p-1">
          {STAGES.map((s, i) => (
            <button key={s.id} role="tab" type="button" aria-selected={stage === i} onClick={() => setStage(i)}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] font-medium sm:px-3 transition-colors ${stage === i ? 'bg-white text-navy-950' : 'text-white/60 hover:text-white'}`}>
              <Icon name={s.icon} size={13} />{s.label}
            </button>
          ))}
        </div>
        <span className="hidden font-mono text-[0.6875rem] text-white/40 sm:inline">studio.tshedzawebdev</span>
      </div>

      <div role="tabpanel" aria-live="off" className="relative h-[330px] sm:h-[360px]">
        {/* Build: code typing */}
        {stage === 0 ? (
          <pre className="h-full overflow-hidden whitespace-pre-wrap break-words p-4 font-mono text-[0.72rem] leading-relaxed text-white/85 sm:p-5 sm:text-[0.8125rem]">
            <code>{colourise(shownCode)}{!reduced ? <span className="caret ml-0.5" /> : null}</code>
          </pre>
        ) : null}

        {/* Design: the site assembles */}
        {stage === 1 ? (
          <div className="h-full p-5">
            <div className="h-full overflow-hidden rounded-[12px] bg-paper p-4 text-ink">
              <div className="rise-in flex items-center justify-between" style={{ animationDelay: '0ms' }}>
                <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded-[5px] bg-navy-900" /><span className="h-2 w-12 rounded-full bg-ink/70" /></span>
                <span className="flex gap-2"><span className="h-2 w-8 rounded-full bg-line" /><span className="h-2 w-8 rounded-full bg-line" /><span className="h-5 w-16 rounded-full bg-teal-500" /></span>
              </div>
              <div className="mt-5 grid grid-cols-[1.1fr_1fr] items-center gap-4">
                <div className="rise-in" style={{ animationDelay: '250ms' }}>
                  <p className="text-[1.35rem] font-semibold leading-[1.05] tracking-tight">Your business,<br /><span className="accent-serif text-teal-700">online.</span></p>
                  <div className="mt-3 grid gap-1.5"><span className="h-2 w-[90%] rounded-full bg-line" /><span className="h-2 w-[65%] rounded-full bg-line" /></div>
                  <div className="mt-3 flex gap-1.5"><span className="h-6 w-20 rounded-full bg-navy-900" /><span className="h-6 w-16 rounded-full border border-line" /></div>
                </div>
                <div className="rise-in h-28 rounded-[10px] bg-[linear-gradient(135deg,#0a1b2e,#1e3a57_55%,#1da1c2)]" style={{ animationDelay: '500ms' }} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rise-in rounded-[8px] border border-line bg-card p-2.5" style={{ animationDelay: `${750 + i * 150}ms` }}>
                    <span className="block h-3.5 w-3.5 rounded bg-teal-100" /><span className="mt-2 block h-2 w-[70%] rounded-full bg-line" /><span className="mt-1 block h-2 w-[45%] rounded-full bg-line" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Launch: checks tick through, then live */}
        {stage === 2 ? (
          <div className="flex h-full flex-col p-5">
            <p className="font-mono text-[0.75rem] text-white/50">$ pre-launch checks</p>
            <ul className="mt-3 grid gap-2.5">
              {CHECKS.map((c, i) => (
                <li key={c} className="rise-in flex items-center gap-3 text-[0.875rem] text-white/85" style={{ animationDelay: `${i * 380}ms` }}>
                  <span className={`inline-flex h-5 w-5 flex-none items-center justify-center rounded-full ${i === CHECKS.length - 1 ? 'pulse-dot bg-teal-500 text-navy-950' : 'bg-success/25 text-[#5fd3a3]'}`}><Icon name="check" size={12} /></span>
                  {c}
                </li>
              ))}
            </ul>
            <div className="rise-in mt-auto flex items-center justify-between rounded-[12px] border border-teal-500/40 bg-teal-500/10 px-4 py-3" style={{ animationDelay: `${CHECKS.length * 380}ms` }}>
              <span className="flex items-center gap-2 text-[0.875rem] font-semibold"><span className="h-2 w-2 rounded-full bg-[#5fd3a3]" /> Live</span>
              <span className="font-mono text-[0.75rem] text-white/70">yourbusiness.co.za</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Stage progress */}
      <div className="flex gap-1 px-4 pb-4" aria-hidden="true">
        {STAGES.map((s, i) => <span key={s.id} className={`h-1 flex-1 rounded-full ${i <= stage ? 'bg-teal-500' : 'bg-white/10'}`} />)}
      </div>
    </div>
  )
}

/** Tiny syntax colouring for the demo code (keywords, strings, components). */
function colourise(code: string): React.ReactNode[] {
  return code.split(/('[^']*'?|"[^"]*"?|<\/?[A-Z][A-Za-z]*|\b(?:export|default|function|return)\b)/g).map((part, i) => {
    if (!part) return null
    if (/^['"]/.test(part)) return <span key={i} className="text-[#9fe3f2]">{part}</span>
    if (/^<\/?[A-Z]/.test(part)) return <span key={i} className="text-teal-500">{part}</span>
    if (/^(export|default|function|return)$/.test(part)) return <span key={i} className="text-[#c4a7ff]">{part}</span>
    return <span key={i}>{part}</span>
  })
}
