'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SITE } from '@/lib/site'
import { Icon } from '../Icon'
import { NoteCard } from './NoteCard'
import { KINDS, WELCOME, type WallNote } from './notes'

// Homepage window onto the community wall: real, approved notes drifting past in
// two rows. With only a few notes it shows them still, next to an invitation.

export function WallTeaser() {
  const [notes, setNotes] = useState<WallNote[] | null>(null)

  useEffect(() => {
    let live = true
    fetch(`${SITE.apiBase}/wall`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { notes: WallNote[] }) => { if (live) setNotes(d.notes) })
      .catch(() => { if (live) setNotes([]) })
    return () => { live = false }
  }, [])

  const list = notes ?? []
  const hearts = list.reduce((s, n) => s + n.hearts, 0)
  const all = [WELCOME, ...list.slice(0, 16)]
  const flowing = all.length >= 5

  return (
    <div className="grid items-center gap-12 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <p className="eyebrow">Community wall</p>
        <h2 className="mt-4 text-[clamp(2rem,3.4vw+1rem,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em]">Say something <span className="accent-serif text-teal-700">kind.</span></h2>
        <p className="lede mt-5">Thank someone who helped you, cheer on a beginner, or share the tip you wish you had on day one. Open to everyone, read by a real person before it goes up.</p>
        <div className="glass-light mt-7 inline-flex items-center gap-4 rounded-full px-5 py-2.5 text-[0.9375rem] text-ink-2">
          <span className="pulse-dot h-2 w-2 rounded-full bg-teal-500" />
          {notes ? <span><strong className="tabular-nums text-ink">{list.length}</strong> notes · <strong className="tabular-nums text-ink">{hearts}</strong> hearts</span> : <span>Loading the wall…</span>}
        </div>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Kinds of note">
          {KINDS.map((k) => <li key={k.id} className="glass-light inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.875rem] font-medium text-ink-2"><span aria-hidden="true">{k.emoji}</span>{k.label}</li>)}
        </ul>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/wall/#write" className="btn btn-primary glow-border"><Icon name="pen" size={18} /> Leave a note</Link>
          <Link href="/wall/#board" className="btn btn-secondary">Read the wall <Icon name="arrowRight" size={16} /></Link>
        </div>
      </div>

      <div className="min-w-0 lg:col-span-7">
        <div className="glass-light relative overflow-hidden rounded-[28px] py-8">
          {flowing ? (
            <>
              <ul className="sr-only">{all.slice(0, 5).map((n) => <li key={n.id}>{n.message} ({n.name ?? 'Anonymous'})</li>)}</ul>
              {[0, 1].map((row) => {
                const items = all.filter((_, i) => i % 2 === row)
                const track = items.length < 5 ? [...items, ...items] : items
                return (
                  <div key={row} className={`marquee marquee-slow ${row ? 'marquee-reverse mt-6' : ''}`} aria-hidden="true">
                    {[0, 1].map((k) => (
                      <div key={k} className="marquee-track items-start gap-6 pr-6 pt-3">
                        {track.map((n, i) => <div key={`${n.id}-${i}`} className="w-[260px] flex-none"><NoteCard note={n} /></div>)}
                      </div>
                    ))}
                  </div>
                )
              })}
            </>
          ) : (
            <div className="grid gap-6 px-6 pt-3 sm:grid-cols-2 sm:px-8">
              {all.map((n) => <NoteCard key={n.id} note={n} />)}
              <Link href="/wall/#write" className="wall-ghost group">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-white transition-transform group-hover:rotate-90"><Icon name="plus" size={22} /></span>
                <span className="mt-4 block text-[1.25rem] font-semibold tracking-tight">Your note here</span>
                <span className="mt-1 block text-[0.9375rem] text-ink-2">Be one of the first on the wall.</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
