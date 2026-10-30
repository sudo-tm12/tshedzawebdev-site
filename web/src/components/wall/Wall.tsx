'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { SITE, whatsappLink } from '@/lib/site'
import { Icon } from '../Icon'
import { useReducedMotion } from '../motion/basics'
import { LiquidField } from '../ui'
import { NoteCard } from './NoteCard'
import { COLOURS, KINDS, WELCOME, readLocal, subscribeLocal, writeLocal, type Colour, type Kind, type WallNote } from './notes'

const MAX = 280
const HEARTS_KEY = 'twd-wall-hearts'
const MINE_KEY = 'twd-wall-mine'
const NO_IDS: number[] = []
const NO_NOTES: WallNote[] = []

// Same rules as the API (lib/wall.php), shown live so nobody is surprised on submit.
function contentProblem(text: string): string | null {
  if (/(https?:\/\/|www\.|\b[\w.-]+\.(com|co\.za|net|org|io|xyz|link)\b)/i.test(text)) return 'Links aren’t allowed on the wall.'
  if (/[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(text)) return 'Please leave out email addresses: the wall is public.'
  if (/(\+?\d[\s-]?){9,}/.test(text)) return 'Please leave out phone numbers: the wall is public.'
  return null
}

type Load = 'loading' | 'ready' | 'offline'
interface Draft { message: string; name: string; place: string; kind: Kind; colour: Colour }
const EMPTY_DRAFT: Draft = { message: '', name: '', place: '', kind: 'encourage', colour: 'sun' }

export function Wall() {
  const [notes, setNotes] = useState<WallNote[]>([])
  const [load, setLoad] = useState<Load>('loading')
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [consent, setConsent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [announce, setAnnounce] = useState('')
  const [celebrate, setCelebrate] = useState(0)
  const [filter, setFilter] = useState<'all' | Kind>('all')
  const [sort, setSort] = useState<'new' | 'loved'>('new')
  const textRef = useRef<HTMLTextAreaElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const hearted = useSyncExternalStore(subscribeLocal, () => readLocal(HEARTS_KEY, NO_IDS), () => NO_IDS)
  const mineAll = useSyncExternalStore(subscribeLocal, () => readLocal(MINE_KEY, NO_NOTES), () => NO_NOTES)

  const fetchNotes = useCallback(() => {
    fetch(`${SITE.apiBase}/wall`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { notes: WallNote[] }) => {
        setNotes(d.notes)
        setLoad('ready')
        // Forget own notes once approved (they are now in the list) or after 30 days.
        const live = new Set(d.notes.map((n) => n.id))
        const cutoff = Date.now() - 30 * 86400000
        const own = readLocal(MINE_KEY, NO_NOTES)
        const keep = own.filter((n) => !live.has(n.id) && new Date(n.createdAt).getTime() > cutoff)
        if (keep.length !== own.length) writeLocal(MINE_KEY, keep)
      })
      .catch(() => setLoad((l) => (l === 'ready' ? l : 'offline')))
  }, [])

  useEffect(() => {
    fetchNotes()
    const onVisible = () => { if (document.visibilityState === 'visible') fetchNotes() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchNotes])

  // The visitor's own notes stay visible to them until approved.
  const mine = useMemo(() => {
    const live = new Set(notes.map((n) => n.id))
    return mineAll.filter((n) => !live.has(n.id))
  }, [mineAll, notes])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: notes.length }
    for (const n of notes) c[n.kind] = (c[n.kind] ?? 0) + 1
    return c
  }, [notes])
  const totalHearts = notes.reduce((s, n) => s + n.hearts, 0)

  const shown = useMemo(() => {
    const list = notes.filter((n) => filter === 'all' || n.kind === filter)
    if (sort === 'loved') list.sort((a, b) => b.hearts - a.hearts || b.id - a.id)
    return [...mine.filter((n) => filter === 'all' || n.kind === filter), ...list]
  }, [notes, mine, filter, sort])
  const showWelcome = filter === 'all' || filter === WELCOME.kind

  const problem = contentProblem(`${draft.message} ${draft.name} ${draft.place}`)
  const left = MAX - draft.message.length
  const kind = KINDS.find((k) => k.id === draft.kind)!

  function focusComposer() {
    document.getElementById('write')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    window.setTimeout(() => textRef.current?.focus({ preventScroll: true }), reduced ? 0 : 450)
  }

  function addSpark(spark: string) {
    const message = (draft.message.trim() ? `${draft.message.trimEnd()}\n${spark} ` : `${spark} `).slice(0, MAX)
    setDraft({ ...draft, message })
    requestAnimationFrame(() => { const t = textRef.current; if (t) { t.focus(); t.setSelectionRange(message.length, message.length) } })
  }

  function onHeart(note: WallNote) {
    const on = !hearted.includes(note.id)
    writeLocal(HEARTS_KEY, on ? [...hearted, note.id] : hearted.filter((id) => id !== note.id))
    setNotes((all) => all.map((n) => (n.id === note.id ? { ...n, hearts: Math.max(0, n.hearts + (on ? 1 : -1)) } : n)))
    fetch(`${SITE.apiBase}/wall/heart`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: note.id, on }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { hearts: number } | null) => { if (d) setNotes((all) => all.map((n) => (n.id === note.id ? { ...n, hearts: d.hearts } : n))) })
      .catch(() => { /* optimistic count stays; it corrects on the next load */ })
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const message = draft.message.trim()
    if (message.length < 3) { setError('Write a few words first.'); textRef.current?.focus(); return }
    if (problem) { setError(problem); return }
    if (!consent) { setError('Please tick the box so we may show your note.'); return }
    setError(null)
    setSending(true)
    try {
      const body = { ...draft, message, name: draft.name.trim(), place: draft.place.trim(), consent, website: String(fd.get('website') ?? '') }
      const res = await fetch(`${SITE.apiBase}/wall`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      const data = (await res.json().catch(() => ({}))) as { id?: number; error?: string }
      if (!res.ok) { setError(data.error ?? 'Your note could not be pinned just now.'); return }
      const pending: WallNote = { id: data.id ?? Date.now(), name: body.name || null, place: body.place || null, message, kind: draft.kind, colour: draft.colour, hearts: 0, createdAt: new Date().toISOString(), pending: true }
      writeLocal(MINE_KEY, [pending, ...mineAll])
      setDraft({ ...EMPTY_DRAFT, name: draft.name, place: draft.place, kind: draft.kind, colour: draft.colour })
      setFilter('all')
      setCelebrate((c) => c + 1)
      setAnnounce('Your note is pinned. It goes public once it has been read and approved.')
      window.setTimeout(() => boardRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }), reduced ? 0 : 900)
    } catch {
      setError('offline')
    } finally {
      setSending(false)
    }
  }

  const previewNote: WallNote = { id: 0, name: draft.name.trim() || null, place: draft.place.trim() || null, message: draft.message, kind: draft.kind, colour: draft.colour, hearts: 0, createdAt: new Date(0).toISOString() }

  return (
    <>
      {/* ── Composer ─────────────────────────────────────────────────────── */}
      <section id="write" className="wall-cork canvas-tint relative scroll-mt-20 border-b border-line">
        <LiquidField blobs={[{ tone: 'sun', top: '-5%', left: '-10%', size: 520 }, { tone: 'teal', top: '35%', left: '70%', size: 520 }, { tone: 'lilac', top: '75%', left: '30%', size: 380 }]} />
        <div className="container-site grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
          <form noValidate onSubmit={onSubmit} className="glass-light relative rounded-[28px] p-6 sm:p-8 lg:col-span-7">
            <p className="eyebrow">Write a note</p>
            <h2 className="mt-3 text-[clamp(1.75rem,2vw+1rem,2.5rem)] font-semibold leading-tight tracking-[-0.03em]">What’s on your mind?</h2>

            <fieldset className="mt-7">
              <legend className="field-label">What kind of note?</legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {KINDS.map((k) => (
                  <label key={k.id} className={`wall-chip ${draft.kind === k.id ? 'is-on' : ''}`}>
                    <input type="radio" name="kind" value={k.id} checked={draft.kind === k.id} onChange={() => setDraft({ ...draft, kind: k.id })} className="sr-only" />
                    <span aria-hidden="true" className="text-[1.125rem]">{k.emoji}</span>{k.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6">
              <label htmlFor="wall-message" className="field-label">Your note</label>
              <div className="relative">
                <textarea
                  ref={textRef}
                  id="wall-message"
                  rows={5}
                  maxLength={MAX}
                  value={draft.message}
                  onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                  placeholder={kind.placeholder}
                  aria-describedby="wall-count wall-hint"
                  aria-invalid={!!problem}
                  className="field min-h-[9rem] resize-none pb-10 text-[1.125rem] leading-relaxed"
                />
                <CharRing left={left} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[0.8125rem] font-medium text-ink-3">Need a spark?</span>
                {kind.sparks.map((s) => (
                  <button key={s} type="button" onClick={() => addSpark(s)} className="rounded-full border border-dashed border-teal-600/50 px-3 py-1 text-[0.8125rem] text-teal-700 transition-colors hover:border-solid hover:bg-teal-100">{s}</button>
                ))}
              </div>
              <p id="wall-hint" aria-live="polite" className={`mt-2 min-h-[1.25rem] text-[0.875rem] ${problem ? 'text-danger' : 'text-ink-3'}`}>{problem ?? 'Up to 280 characters. No links, emails or phone numbers.'}</p>
            </div>

            <fieldset className="mt-4">
              <legend className="field-label">Note colour</legend>
              <div className="mt-1 flex gap-3">
                {COLOURS.map((c) => (
                  <label key={c.id} className="wall-swatch" style={{ '--sw': c.bg, '--sw-edge': c.edge } as React.CSSProperties} data-on={draft.colour === c.id}>
                    <input type="radio" name="colour" value={c.id} checked={draft.colour === c.id} onChange={() => setDraft({ ...draft, colour: c.id })} className="sr-only" />
                    <span className="sr-only">{c.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="wall-name" className="field-label">First name <span className="font-normal text-ink-3">(optional)</span></label>
                <input id="wall-name" maxLength={40} autoComplete="given-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Anonymous" className="field" />
              </div>
              <div>
                <label htmlFor="wall-place" className="field-label">Town or role <span className="font-normal text-ink-3">(optional)</span></label>
                <input id="wall-place" maxLength={40} value={draft.place} onChange={(e) => setDraft({ ...draft, place: e.target.value })} placeholder="e.g. Soshanguve · student" className="field" />
              </div>
            </div>

            <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>

            <label className="mt-6 flex gap-3 text-[0.9375rem] text-ink-2">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 flex-none accent-[var(--color-navy-900)]" />
              <span>I agree that my note, and the name and town I entered, may be shown publicly on this wall. See the <Link href="/privacy/#wall" className="link">Privacy Policy</Link>.</span>
            </label>

            {error ? (
              <div role="alert" className="mt-5 flex gap-3 rounded-[var(--radius-sm)] bg-danger-tint p-4 text-[0.9375rem] text-danger">
                <Icon name="alert" size={18} className="mt-0.5 flex-none" />
                {error === 'offline'
                  ? <p>The wall can’t be reached just now, and your words are still here. Try again in a moment, or <a href={whatsappLink(`Hi Tshedza, a note for the wall: ${draft.message}`)} className="font-semibold underline" rel="noopener">send it on WhatsApp</a>.</p>
                  : <p>{error}</p>}
              </div>
            ) : null}

            <div className="relative mt-7 flex flex-wrap items-center gap-4">
              <button type="submit" className="btn btn-primary glow-border" disabled={sending}>
                {sending ? <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" /> Pinning…</> : <>Pin it to the wall <Icon name="pin" size={18} /></>}
              </button>
              <p className="text-[0.875rem] text-ink-3">Every note is read by a real person before it goes up.</p>
              {celebrate > 0 && !reduced ? <Confetti key={celebrate} seed={celebrate} /> : null}
            </div>
            <p className="sr-only" aria-live="polite">{announce}</p>
          </form>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">Live preview</p>
              <TiltStage disabled={reduced}>
                <NoteCard note={previewNote} preview className="mt-5" />
              </TiltStage>
              <p className="mt-6 text-[0.9375rem] text-ink-2">This is exactly how your note will look on the wall. Change the colour, try a spark, make it yours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The board ────────────────────────────────────────────────────── */}
      <section id="board" className="wall-cork section scroll-mt-20">
        <div ref={boardRef} className="container-site scroll-mt-24">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">The wall</p>
              <h2 className="mt-3 text-[clamp(2rem,3vw+1rem,3.25rem)] font-semibold leading-[1.02] tracking-[-0.035em]">Notes from the <span className="accent-serif text-teal-700">community.</span></h2>
              {load === 'ready' ? (
                <p className="mt-3 text-ink-2"><strong className="tabular-nums text-ink">{notes.length}</strong> note{notes.length === 1 ? '' : 's'} pinned · <strong className="tabular-nums text-ink">{totalHearts}</strong> heart{totalHearts === 1 ? '' : 's'} given</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label="Filter notes" className="flex flex-wrap gap-2">
                {[{ id: 'all' as const, label: 'All', emoji: '✨' }, ...KINDS].map((k) => (
                  <button key={k.id} type="button" aria-pressed={filter === k.id} onClick={() => setFilter(k.id)} className={`wall-chip wall-chip-sm ${filter === k.id ? 'is-on' : ''}`}>
                    <span aria-hidden="true">{k.emoji}</span>{k.label}{load === 'ready' ? <span className="tabular-nums opacity-60">{counts[k.id] ?? 0}</span> : null}
                  </button>
                ))}
              </div>
              <div role="group" aria-label="Sort notes" className="flex rounded-full border border-line bg-card p-1 text-[0.8125rem] font-medium">
                {(['new', 'loved'] as const).map((s) => (
                  <button key={s} type="button" aria-pressed={sort === s} onClick={() => setSort(s)} className={`rounded-full px-3 py-1.5 transition-colors ${sort === s ? 'bg-navy-900 text-white' : 'text-ink-2 hover:text-ink'}`}>{s === 'new' ? 'Newest' : 'Most loved'}</button>
                ))}
              </div>
            </div>
          </div>

          {load === 'offline' ? (
            <div className="mt-8 flex flex-wrap items-center gap-4 rounded-[16px] border border-line bg-card p-5 text-ink-2">
              <Icon name="info" size={20} className="text-teal-700" />
              <p>The wall couldn’t load just now. Your note can still be written.</p>
              <button type="button" onClick={() => { setLoad('loading'); fetchNotes() }} className="btn btn-secondary btn-sm ml-auto"><Icon name="refresh" size={16} /> Try again</button>
            </div>
          ) : null}

          <div className="mt-9 columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
            {showWelcome ? <div className="mb-6 break-inside-avoid pt-3"><NoteCard note={WELCOME} /></div> : null}
            <div className="mb-6 break-inside-avoid pt-3">
              <button type="button" onClick={focusComposer} className="wall-ghost group">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-white transition-transform group-hover:rotate-90"><Icon name="plus" size={22} /></span>
                <span className="mt-4 block text-[1.25rem] font-semibold tracking-tight">Your note here</span>
                <span className="mt-1 block text-[0.9375rem] text-ink-2">{notes.length ? 'Add yours to the wall.' : 'Be one of the first to leave a note.'}</span>
              </button>
            </div>
            {shown.map((n, i) => (
              <div key={`${n.pending ? 'p' : 'n'}${n.id}`} className="mb-6 break-inside-avoid pt-3">
                <NoteCard note={n} index={i} hearted={hearted.includes(n.id)} onHeart={onHeart} />
              </div>
            ))}
            {load === 'loading' ? Array.from({ length: 6 }, (_, i) => (
              <div key={`s${i}`} className="mb-6 break-inside-avoid pt-3"><div className="wall-skeleton" style={{ height: `${150 + ((i * 53) % 90)}px` }} /></div>
            )) : null}
          </div>

          {load === 'ready' && shown.length === 0 && filter !== 'all' ? (
            <p className="mt-2 text-center text-ink-2">No {KINDS.find((k) => k.id === filter)?.label.toLowerCase()} notes yet. <button type="button" onClick={() => { setDraft({ ...draft, kind: filter as Kind }); focusComposer() }} className="link font-medium">Write the first one</button>.</p>
          ) : null}
        </div>
      </section>
    </>
  )
}

/** Characters-left ring in the corner of the textarea. */
function CharRing({ left }: { left: number }) {
  const used = Math.min(1, (MAX - left) / MAX)
  const c = 2 * Math.PI * 10
  const tone = left <= 0 ? '#b42318' : left <= 30 ? '#b45d2c' : '#1da1c2'
  return (
    <span id="wall-count" className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-2 text-[0.8125rem] tabular-nums text-ink-3">
      {left <= 30 ? <span style={{ color: tone }}>{left}</span> : <span className="sr-only">{left} characters left</span>}
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="-rotate-90">
        <circle cx="12" cy="12" r="10" fill="none" stroke="var(--color-line)" strokeWidth="2.5" />
        <circle cx="12" cy="12" r="10" fill="none" stroke={tone} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - used)} style={{ transition: 'stroke-dashoffset 200ms ease, stroke 200ms ease' }} />
      </svg>
    </span>
  )
}

/** Tilts its child in 3D towards the pointer. */
function TiltStage({ children, disabled }: { children: React.ReactNode; disabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || disabled || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 14}deg`)
    el.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 14}deg`)
  }
  const reset = () => { ref.current?.style.setProperty('--rx', '0deg'); ref.current?.style.setProperty('--ry', '0deg') }
  return <div ref={ref} onPointerMove={move} onPointerLeave={reset} className="tilt-stage">{children}</div>
}

/** A one-off burst of paper confetti from the submit button. Deterministic per seed (pure render). */
function Confetti({ seed }: { seed: number }) {
  const colours = ['#1da1c2', '#ffe9a8', '#cdefd9', '#fad4d8', '#e2d9f7', '#0a1b2e']
  const bits = Array.from({ length: 28 }, (_, i) => {
    const r = (k: number) => { const x = Math.sin((seed * 31 + i * 7 + k) * 12.9898) * 43758.5453; return x - Math.floor(x) }
    const angle = -Math.PI / 2 + (r(1) - 0.5) * Math.PI * 1.1
    const dist = 90 + r(2) * 160
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, rot: (r(3) - 0.5) * 720, c: colours[i % colours.length], w: 6 + r(4) * 6, delay: r(5) * 80 }
  })
  return (
    <span className="pointer-events-none absolute left-24 top-1/2" aria-hidden="true">
      {bits.map((b, i) => (
        <span key={i} className="confetti-bit" style={{ '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, '--rot': `${b.rot}deg`, background: b.c, width: b.w, height: b.w * 0.6, animationDelay: `${b.delay}ms` } as React.CSSProperties} />
      ))}
    </span>
  )
}
