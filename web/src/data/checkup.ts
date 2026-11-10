// The free check-up: the five checks, shared by the home section and its animated report widget.
// The report is an example: no real site, no invented scores.
import type { IconName } from '@/components/Icon'

export type Status = 'good' | 'quick' | 'fix'

export interface Check {
  icon: IconName
  title: string
  label: string
  note: string
  status: Status
  /** How full the example ring is (0-1). */
  fill: number
  color: string
  body: string
  looks: string[]
}

// One colour per check, chosen to sit with the brand teal (no traffic-light rainbow).
export const CHECKS: Check[] = [
  { icon: 'gauge', title: 'Speed', label: 'Speed on phones', note: 'Slow on mobile data', status: 'fix', fill: 0.3, color: '#1da1c2',
    body: 'How fast it loads on mobile data, where most of your visitors are.', looks: ['Load time', 'Image sizes', 'Mobile data'] },
  { icon: 'monitor', title: 'Phones', label: 'Works on phones', note: 'Buttons too small to tap', status: 'quick', fill: 0.62, color: '#5468ff',
    body: 'Whether it is easy to read, tap and use on a small screen.', looks: ['Tap targets', 'Text size', 'Layout'] },
  { icon: 'search', title: 'Google', label: 'Found on Google', note: 'Pages have no proper titles', status: 'fix', fill: 0.38, color: '#9a7cf0',
    body: 'Whether people searching for what you do can actually find you.', looks: ['Page titles', 'Descriptions', 'Search Console'] },
  { icon: 'shield', title: 'Trust', label: 'Feels trustworthy', note: 'Secure, privacy page in place', status: 'good', fill: 0.92, color: '#20b486',
    body: 'The padlock, a privacy page and a first impression that says “we’re open”.', looks: ['HTTPS', 'Privacy page', 'Broken links'] },
  { icon: 'whatsapp', title: 'Contact', label: 'Easy to contact', note: 'No WhatsApp button yet', status: 'quick', fill: 0.56, color: '#f2a93b',
    body: 'How quickly a visitor can call, WhatsApp or book you.', looks: ['WhatsApp', 'Click-to-call', 'Forms'] },
]

export const STATUS: Record<Status, { text: string; cls: string }> = {
  good: { text: 'Good', cls: 'text-success' },
  quick: { text: 'Quick win', cls: 'text-warn' },
  fix: { text: 'Fix first', cls: 'text-danger' },
}
