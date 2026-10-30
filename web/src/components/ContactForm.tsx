'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SITE, whatsappLink } from '@/lib/site'
import { Icon } from './Icon'

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error' }

export function ContactForm() {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const data = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      message: String(fd.get('message') ?? '').trim(),
      consent: fd.get('consent') === 'on',
      website: String(fd.get('website') ?? ''),
    }
    const next: Record<string, string> = {}
    if (data.name.length < 2) next.name = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) next.email = 'Please enter a valid email address.'
    if (data.message.length < 10) next.message = 'Tell us a little more (at least 10 characters).'
    if (!data.consent) next.consent = 'We need your consent to reply to you.'
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
        <h2 className="h3">Message received. Thank you.</h2>
        <p className="text-ink-2">We will reply by email soon. If it is urgent, WhatsApp is the fastest way to reach us.</p>
        <button type="button" className="btn btn-secondary" onClick={() => setState({ kind: 'idle' })}>Send another message</button>
      </div>
    )
  }

  const field = (id: string, label: string, opts: { type?: string; autoComplete?: string; optional?: boolean } = {}) => (
    <div>
      <label htmlFor={id} className="field-label">{label} {opts.optional ? <span className="font-normal text-ink-3">(optional)</span> : null}</label>
      <input id={id} name={id} type={opts.type ?? 'text'} autoComplete={opts.autoComplete} aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `${id}-err` : undefined} className="field" />
      {errors[id] ? <p id={`${id}-err`} className="mt-2 flex items-center gap-1.5 text-[0.875rem] text-danger"><Icon name="alert" size={16} />{errors[id]}</p> : null}
    </div>
  )

  return (
    <form noValidate onSubmit={onSubmit} className="glass-light relative grid gap-5 rounded-[28px] p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {field('name', 'Your name', { autoComplete: 'name' })}
        {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
      </div>
      {field('phone', 'WhatsApp number', { type: 'tel', autoComplete: 'tel', optional: true })}
      <div>
        <label htmlFor="message" className="field-label">How can we help?</label>
        <textarea id="message" name="message" rows={5} maxLength={3000} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-err' : undefined} className="field" />
        {errors.message ? <p id="message-err" className="mt-2 flex items-center gap-1.5 text-[0.875rem] text-danger"><Icon name="alert" size={16} />{errors.message}</p> : null}
      </div>
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div>
        <label className="flex gap-3 text-[0.9375rem] text-ink-2">
          <input type="checkbox" name="consent" className="mt-1 h-5 w-5 flex-none accent-[var(--color-navy-900)]" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'consent-err' : undefined} />
          <span>I consent to TshedzaWebDev using my details to reply to this message, in line with the <Link href="/privacy/" className="link">Privacy Policy</Link>.</span>
        </label>
        {errors.consent ? <p id="consent-err" className="mt-2 flex items-center gap-1.5 text-[0.875rem] text-danger"><Icon name="alert" size={16} />{errors.consent}</p> : null}
      </div>
      {state.kind === 'error' ? (
        <div role="alert" className="flex gap-3 rounded-[var(--radius-sm)] bg-danger-tint p-4 text-[0.9375rem] text-danger">
          <Icon name="alert" size={18} className="mt-0.5 flex-none" />
          <p>Your message could not be sent just now, and nothing was lost. Please try again, or <a href={whatsappLink('Hi Tshedza, I tried your contact form.')} className="font-semibold underline" rel="noopener">message us on WhatsApp</a>.</p>
        </div>
      ) : null}
      <button type="submit" className="btn btn-primary justify-self-start" disabled={state.kind === 'sending'}>
        {state.kind === 'sending' ? <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" /> Sending…</> : <>Send message <Icon name="arrowRight" size={18} /></>}
      </button>
    </form>
  )
}
