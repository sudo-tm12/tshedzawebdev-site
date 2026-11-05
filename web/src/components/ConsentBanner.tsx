'use client'

import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'

// POPIA consent: PostHog (analytics) and Tidio (chat) load ONLY after "Accept".
// The choice is stored for 12 months and can be changed from the footer
// ("Cookie settings" dispatches `twd:consent-open`).

const KEY = 'twd-consent-v1'
const TWELVE_MONTHS = 365 * 24 * 60 * 60 * 1000
const POSTHOG_KEY = 'phc_g6tzfRRUqJcmX4cSLjydDxrq8xl2cH89Jk7rfQlGtiO'
const TIDIO_SRC = 'https://code.tidio.co/scafzapm9nbgaesocj1sic4a6fgdnsnf.js'

type Choice = 'accepted' | 'rejected'
interface Stored { choice: Choice; at: number }
type Status = 'unset' | Choice | 'reopened' | 'server'

// ── A tiny external store over localStorage + a "reopened" flag ──────────────
let reopened = false
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

function read(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as Stored
    return Date.now() - v.at < TWELVE_MONTHS ? v : null
  } catch { return null }
}
function getStatus(): Status {
  if (reopened) return 'reopened'
  return read()?.choice ?? 'unset'
}
function subscribe(cb: () => void) {
  listeners.add(cb)
  const onOpen = () => { reopened = true; notify() }
  window.addEventListener('twd:consent-open', onOpen)
  window.addEventListener('storage', cb)
  return () => { listeners.delete(cb); window.removeEventListener('twd:consent-open', onOpen); window.removeEventListener('storage', cb) }
}

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) return
  const s = document.createElement('script')
  s.src = src; s.async = true; s.id = id
  document.head.appendChild(s)
}

function startTracking() {
  // PostHog: profiles only for identified users.
  const w = window as unknown as { posthog?: { init: (k: string, o: object) => void } }
  if (!document.getElementById('ph-lib')) {
    loadScript('https://us-assets.i.posthog.com/static/array.js', 'ph-lib')
    const wait = setInterval(() => {
      if (w.posthog && typeof w.posthog.init === 'function') {
        clearInterval(wait)
        w.posthog.init(POSTHOG_KEY, { api_host: 'https://us.i.posthog.com', person_profiles: 'identified_only', capture_pageview: true })
      }
    }, 200)
    setTimeout(() => clearInterval(wait), 15000)
  }
  // Tidio chat: desktop only. On phones the WhatsApp button is the chat.
  if (window.matchMedia('(min-width: 1024px)').matches) loadScript(TIDIO_SRC, 'tidio')
}

export function ConsentBanner() {
  const status = useSyncExternalStore(subscribe, getStatus, () => 'server' as Status)

  useEffect(() => {
    if (status === 'accepted') startTracking()
  }, [status])

  const decide = (choice: Choice) => {
    try { localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() } satisfies Stored)) } catch { /* private mode */ }
    reopened = false
    notify()
    // A rejection after an earlier accept takes full effect on the next page load.
  }

  if (status !== 'unset' && status !== 'reopened') return null
  // Compact on phones (it shouldn't hide the page), and it slides in after the landing
  // animation (first visit only) instead of covering it. Nothing tracks until Accept.
  return (
    <div role="region" aria-label="Cookie consent"
      className={`glass-light fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-[440px] rounded-[20px] p-3.5 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:p-5 ${status === 'unset' ? 'consent-in' : ''}`}>
      <p className="text-[0.8125rem] leading-snug text-ink-2 sm:text-[0.9375rem] sm:leading-relaxed">
        <strong className="text-ink">Your privacy, your choice.</strong> Analytics<span className="max-sm:hidden"> (and a chat widget on larger screens)</span> only load if you accept. <Link href="/privacy/#cookies" className="link">How we use data</Link>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
        <button type="button" className="btn btn-secondary min-h-[44px] sm:min-h-[48px]" onClick={() => decide('rejected')}>Reject</button>
        <button type="button" className="btn btn-primary min-h-[44px] sm:min-h-[48px]" onClick={() => decide('accepted')}>Accept</button>
      </div>
    </div>
  )
}
