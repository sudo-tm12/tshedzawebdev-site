'use client'

// Free website check-up request (campaign landing page /check-up/).
// Sent through the same /contact endpoint as the contact form, so it lands in the owner's inbox
// (and is retried if email fails). The request is prefixed so it's easy to spot and filter.
import Link from 'next/link'
import { useState } from 'react'
import { SITE, whatsappLink } from '@/lib/site'
import { Icon } from './Icon'

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error' }

const CONCERNS = [
  'Not sure, please check everything',
  'It’s slow or looks dated',
  'It doesn’t work well on phones',
  'People can’t find us on Google',
  'Visitors don’t contact us',
]

export function CheckupForm() {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const url = String(fd.get('site') ?? '').trim()
    const concern = String(fd.get('concern') ?? '').trim()
    const notes = String(fd.get('notes') ?? '').trim()
    const data = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      message: ['FREE WEBSITE CHECK-UP REQUEST', `Website: ${url}`, `Main concern: ${concern}`, notes ? `Notes: ${notes}` : ''].filter(Boolean).join('\n'),
      consent: fd.get('consent') === 'on',
      website: String(fd.get('website') ?? ''),
    }
    const next: Record<string, string> = {}
    if (data.name.length < 2) next.name = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) next.email = 'Please enter a valid email address.'
    if (!/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(url)) next.site = 'Please enter your website address, for example yourbusiness.co.za.'
    if (!data.consent) next.consent = 'We need your consent to review your site and email you.'
    setErrors(next)
    if (Object.keys(next).length) { form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus(); return }

    setState({ kind: 'sending' })
    try {
      const res = await fetch(`${SITE.apiBase}/contact`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) throw new Error(String(res.status))
      setState({ kind: 'sent' })
      form.reset()
    } catch {
      setState({ kind: 'error' })
    }
  }

  if (state.kind === 'sent') {
    return (
      <div role="status" className="glass-light flex flex-col items-start gap-4 rounded-[28px] p-8">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success-tint text-success"><Icon name="check" size={24} /></span>
        <h2 className="h3">Got it. Your check-up is booked.</h2>
        <p className="text-ink-2">We’ll look at your site and email you a short, honest report with what to fix first. Questions in the meantime? WhatsApp us on {SITE.phoneDisplay}.</p>
        <button type="button" className="btn btn-secondary" onClick={() => setState({ kind: 'idle' })}>Check another site</button>
      </div>
    )
  }

  const field = (id: string, label: string, opts: { type?: string; autoComplete?: string; optional?: boolean; placeholder?: string; inputMode?: 'url' | 'email' | 'tel' } = {}) => (
    <div>
      <label htmlFor={id} className="field-label">{label} {opts.optional ? <span className="font-normal text-ink-3">(optional)</span> : null}</label>
      <input id={id} name={id} type={opts.type ?? 'text'} inputMode={opts.inputMode} placeholder={opts.placeholder} autoComplete={opts.autoComplete} aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `${id}-err` : undefined} className="field" />
      {errors[id] ? <p id={`${id}-err`} className="mt-2 flex items-center gap-1.5 text-[0.875rem] text-danger"><Icon name="alert" size={16} />{errors[id]}</p> : null}
    </div>
  )

  return (
    <form noValidate onSubmit={onSubmit} className="glass-light relative grid gap-5 rounded-[28px] p-6 sm:p-8">
      {field('site', 'Your website', { inputMode: 'url', autoComplete: 'url', placeholder: 'yourbusiness.co.za' })}
      <div className="grid gap-5 sm:grid-cols-2">
        {field('name', 'Your name', { autoComplete: 'name' })}
        {field('email', 'Email (for your report)', { type: 'email', autoComplete: 'email' })}
      </div>
      {field('phone', 'WhatsApp number', { type: 'tel', autoComplete: 'tel', optional: true, inputMode: 'tel' })}
      <div>
        <label htmlFor="concern" className="field-label">What worries you most?</label>
        <select id="concern" name="concern" className="field" defaultValue={CONCERNS[0]}>
          {CONCERNS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="notes" className="field-label">Anything else? <span className="font-normal text-ink-3">(optional)</span></label>
        <textarea id="notes" name="notes" rows={3} maxLength={1500} className="field" />
      </div>
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div>
        <label className="flex gap-3 text-[0.9375rem] text-ink-2">
          <input type="checkbox" name="consent" className="mt-1 h-5 w-5 flex-none accent-[var(--color-navy-900)]" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'consent-err' : undefined} />
          <span>I consent to TshedzaWebDev reviewing my website and using my details to send me the report, in line with the <Link href="/privacy/" className="link">Privacy Policy</Link>.</span>
        </label>
        {errors.consent ? <p id="consent-err" className="mt-2 flex items-center gap-1.5 text-[0.875rem] text-danger"><Icon name="alert" size={16} />{errors.consent}</p> : null}
      </div>
      {state.kind === 'error' ? (
        <div role="alert" className="flex gap-3 rounded-[var(--radius-sm)] bg-danger-tint p-4 text-[0.9375rem] text-danger">
          <Icon name="alert" size={18} className="mt-0.5 flex-none" />
          <p>Your request could not be sent just now, and nothing was lost. Please try again, or <a href={whatsappLink('Hi Tshedza, I’d like a free website check-up.')} className="font-semibold underline" rel="noopener">send your link on WhatsApp</a>.</p>
        </div>
      ) : null}
      <button type="submit" className="btn btn-primary justify-self-start" disabled={state.kind === 'sending'}>
        {state.kind === 'sending' ? <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" /> Sending…</> : <>Book my free check-up <Icon name="arrowRight" size={18} /></>}
      </button>
    </form>
  )
}
