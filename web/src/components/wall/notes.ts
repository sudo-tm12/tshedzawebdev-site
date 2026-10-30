// Community wall: shared types, note styles and a tiny localStorage store.
// Notes come from the API (api/lib/wall.php); nothing here is invented content
// except the studio's own pinned welcome note.

export type Kind = 'thanks' | 'encourage' | 'idea' | 'shoutout'
export type Colour = 'sun' | 'mint' | 'sky' | 'rose' | 'lilac'

export interface WallNote {
  id: number
  name: string | null
  place: string | null
  message: string
  kind: Kind
  colour: Colour
  hearts: number
  createdAt: string
  /** Local only: the visitor's own note, waiting for approval. */
  pending?: boolean
  /** Local only: the studio's pinned welcome note. */
  pinned?: boolean
}

export const KINDS: { id: Kind; label: string; emoji: string; placeholder: string; sparks: string[] }[] = [
  { id: 'thanks', label: 'Thank you', emoji: '💛', placeholder: 'Who helped you, and how?', sparks: ['I’m grateful for…', 'Thank you to… for…', 'This community helped me…'] },
  { id: 'encourage', label: 'Encouragement', emoji: '🔥', placeholder: 'Say something to someone just starting out…', sparks: ['To anyone starting today:', 'Keep going, because…', 'I almost gave up, then…'] },
  { id: 'idea', label: 'Idea', emoji: '💡', placeholder: 'A tip, a tool, or something you learned…', sparks: ['Today I learned…', 'One tip for beginners:', 'A tool that saved me hours:'] },
  { id: 'shoutout', label: 'Shout-out', emoji: '📣', placeholder: 'Celebrate a win, yours or someone else’s…', sparks: ['Shout-out to…', 'Small win today:', 'I just launched…'] },
]
export const kindOf = (k: Kind) => KINDS.find((x) => x.id === k) ?? KINDS[1]!

export const COLOURS: { id: Colour; label: string; bg: string; edge: string }[] = [
  { id: 'sun', label: 'Sunshine', bg: '#ffe9a8', edge: '#f2cf63' },
  { id: 'mint', label: 'Mint', bg: '#cdefd9', edge: '#8fd6aa' },
  { id: 'sky', label: 'Sky', bg: '#cfe9f5', edge: '#8ccbe6' },
  { id: 'rose', label: 'Rose', bg: '#fad4d8', edge: '#efa0a9' },
  { id: 'lilac', label: 'Lilac', bg: '#e2d9f7', edge: '#b9a6ea' },
]
export const colourOf = (c: Colour) => COLOURS.find((x) => x.id === c) ?? COLOURS[0]!

export const WELCOME: WallNote = {
  id: -1,
  name: 'Tshedza',
  place: 'TshedzaWebDev',
  message: 'Welcome to the wall. Thank someone, cheer on a beginner or share an idea that helped you. Be kind, keep it real, and leave the next person a little braver than you found them.',
  kind: 'thanks',
  colour: 'sky',
  hearts: 0,
  createdAt: '2026-10-30T00:00:00Z',
  pinned: true,
}

/** A small, stable tilt per note so the wall feels hand-pinned (-2.4°…2.4°). */
export function tiltFor(id: number): number {
  const x = Math.sin(id * 12.9898) * 43758.5453
  return Math.round(((x - Math.floor(x)) * 4.8 - 2.4) * 10) / 10
}

const rtf = typeof Intl !== 'undefined' ? new Intl.RelativeTimeFormat('en-ZA', { numeric: 'auto' }) : null
export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.round((new Date(iso).getTime() - now) / 1000)
  if (!rtf || Number.isNaN(s)) return ''
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]
  for (const [unit, sec] of steps) if (Math.abs(s) >= sec) return rtf.format(Math.round(s / sec), unit)
  return 'just now'
}

// ── localStorage as an external store (hearted ids, the visitor's own pending notes) ──
const listeners = new Set<() => void>()
const cache = new Map<string, { raw: string | null; value: unknown }>()
const memory = new Map<string, unknown>()   // used when localStorage is unavailable (private mode)

export function subscribeLocal(cb: () => void) {
  listeners.add(cb)
  window.addEventListener('storage', cb)
  return () => { listeners.delete(cb); window.removeEventListener('storage', cb) }
}
export function readLocal<T>(key: string, fallback: T): T {
  if (memory.has(key)) return memory.get(key) as T
  let raw: string | null = null
  try { raw = localStorage.getItem(key) } catch { /* private mode */ }
  const hit = cache.get(key)
  if (hit && hit.raw === raw) return hit.value as T
  let value: T = fallback
  try { if (raw) value = JSON.parse(raw) as T } catch { /* corrupt: use fallback */ }
  cache.set(key, { raw, value })
  return value
}
export function writeLocal<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { memory.set(key, value) }
  listeners.forEach((l) => l())
}
