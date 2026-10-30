'use client'

import { useState } from 'react'
import { colourOf, kindOf, tiltFor, timeAgo, type WallNote } from './notes'

interface NoteCardProps {
  note: WallNote
  hearted?: boolean
  onHeart?: (note: WallNote) => void
  /** Index on the board, for the staggered entrance. */
  index?: number
  /** Live preview in the composer: no heart button, no entrance animation. */
  preview?: boolean
  className?: string
}

export function NoteCard({ note, hearted = false, onHeart, index = 0, preview = false, className = '' }: NoteCardProps) {
  const [burst, setBurst] = useState(0)
  const kind = kindOf(note.kind)
  const colour = colourOf(note.colour)
  const short = note.message.length <= 90
  const who = note.name || 'Anonymous'
  const style = {
    '--tilt': `${preview ? 0 : tiltFor(note.id)}deg`,
    '--note-bg': colour.bg,
    '--note-edge': colour.edge,
    animationDelay: preview ? undefined : `${Math.min(index, 12) * 45}ms`,
  } as React.CSSProperties

  return (
    <article className={`wall-note ${preview ? '' : 'wall-note-in'} ${note.pinned ? 'wall-note-pinned' : ''} ${className}`} style={style}>
      <span className="wall-pin" aria-hidden="true" />
      <header className="flex items-center justify-between gap-3 text-[0.75rem] font-medium text-navy-900/65">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/55 px-2.5 py-1">
          <span aria-hidden="true">{kind.emoji}</span>{kind.label}
        </span>
        {note.pinned ? <span className="font-mono uppercase tracking-[0.1em]">Pinned</span> : preview ? <span>Preview</span> : <time dateTime={note.createdAt} className="whitespace-nowrap">{timeAgo(note.createdAt)}</time>}
      </header>

      <p className={`mt-4 whitespace-pre-line break-words text-navy-950 ${short ? 'accent-serif text-[1.5rem] leading-[1.2]' : 'text-[1.0625rem] leading-relaxed'}`}>
        {note.message || <span className="text-navy-900/40">Your words will appear here…</span>}
      </p>

      <footer className="mt-5 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-navy-900 text-[0.875rem] font-semibold text-white" aria-hidden="true">
          {who.trim().charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-semibold text-navy-950">{who}</span>
          {note.place ? <span className="block truncate text-[0.8125rem] text-navy-900/60">{note.place}</span> : null}
        </span>
        {onHeart && !note.pending ? (
          <button
            type="button"
            onClick={() => { setBurst((b) => b + 1); onHeart(note) }}
            aria-pressed={hearted}
            aria-label={`${hearted ? 'Remove your heart from' : 'Send a heart to'} ${who}’s note. ${note.hearts} heart${note.hearts === 1 ? '' : 's'}.`}
            className={`wall-heart ml-auto ${hearted ? 'is-on' : ''}`}
          >
            <span className="relative inline-flex">
              <svg key={burst} viewBox="0 0 24 24" width="18" height="18" className={burst ? 'heart-pop' : ''} aria-hidden="true">
                <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.6 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.8 1.3-1.7 2.9-2.8 4.9-2.8 3.5 0 5.7 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
              </svg>
              {burst && hearted ? <span key={`b${burst}`} className="heart-float" aria-hidden="true">+1</span> : null}
            </span>
            <span className="tabular-nums">{note.hearts}</span>
          </button>
        ) : !preview && !note.pinned && !note.pending ? (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/55 px-3 py-1.5 text-[0.8125rem] font-semibold text-navy-900/70">
            <span aria-hidden="true" className="text-[#d0364c]">♥</span><span className="tabular-nums">{note.hearts}</span><span className="sr-only">hearts</span>
          </span>
        ) : null}
      </footer>

      {note.pending ? (
        <p className="mt-4 flex items-center gap-2 rounded-[10px] bg-white/60 px-3 py-2 text-[0.8125rem] text-navy-900/75">
          <span className="pulse-dot h-2 w-2 flex-none rounded-full bg-teal-500" />Only you can see this until it’s been read and approved.
        </p>
      ) : null}
    </article>
  )
}
