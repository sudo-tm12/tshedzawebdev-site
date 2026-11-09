// The free check-up, shown as the thing you get: a short report on your site. Used on the home
// page next to the offer. It is clearly labelled as an example (no real site, no invented scores).
import { Icon, type IconName } from './Icon'

type Status = 'good' | 'quick' | 'fix'

const ROWS: { icon: IconName; label: string; note: string; status: Status }[] = [
  { icon: 'gauge', label: 'Speed on phones', note: 'Slow on mobile data', status: 'fix' },
  { icon: 'monitor', label: 'Works on phones', note: 'Buttons too small to tap', status: 'quick' },
  { icon: 'search', label: 'Found on Google', note: 'Pages have no proper titles', status: 'fix' },
  { icon: 'shield', label: 'Feels trustworthy', note: 'Secure, privacy page in place', status: 'good' },
  { icon: 'whatsapp', label: 'Easy to contact', note: 'No WhatsApp button yet', status: 'quick' },
]

const CHIP: Record<Status, { text: string; cls: string }> = {
  good: { text: 'Good', cls: 'bg-success-tint text-success' },
  quick: { text: 'Quick win', cls: 'bg-warn-tint text-warn' },
  fix: { text: 'Fix first', cls: 'bg-danger-tint text-danger' },
}

export function CheckupReport({ className = '' }: { className?: string }) {
  return (
    <figure className={`checkup-card glass-light relative overflow-hidden rounded-[28px] p-4 sm:p-6 ${className}`} aria-label="Example of a website check-up report">
      {/* A slow scan line passes over the report (off for reduced motion). */}
      <span className="checkup-scan" aria-hidden="true" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 font-mono text-[0.75rem] text-ink-2 sm:text-[0.8125rem]">
          <Icon name="shield" size={14} className="flex-none text-success" />
          <span className="truncate">yourbusiness.co.za</span>
        </div>
        <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-success-tint px-2.5 py-1 text-[0.75rem] font-semibold text-success">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-success" />Report ready
        </span>
      </div>

      <p className="mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">Example report</p>
      <ul className="stagger mt-3 grid gap-2">
        {ROWS.map((r) => (
          <li key={r.label} className="reveal flex items-center gap-3 rounded-[16px] border border-line/80 bg-card/80 p-3 sm:gap-4 sm:p-3.5">
            <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-[12px] bg-navy-900 text-teal-500"><Icon name={r.icon} size={19} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.9375rem] font-semibold leading-tight">{r.label}</span>
              <span className="mt-0.5 block truncate text-[0.8125rem] text-ink-3">{r.note}</span>
            </span>
            <span className={`flex-none rounded-full px-2.5 py-1 text-[0.75rem] font-semibold ${CHIP[r.status].cls}`}>{CHIP[r.status].text}</span>
          </li>
        ))}
      </ul>

      <figcaption className="mt-4 flex items-start gap-3 rounded-[16px] bg-navy-900 p-4 text-white">
        <Icon name="sparkle" size={18} className="mt-0.5 flex-none text-teal-500" />
        <span className="text-[0.875rem] leading-snug text-white/80"><span className="font-semibold text-white">Top priority:</span> speed on phones. Most visitors leave a slow site before it loads.</span>
      </figcaption>
    </figure>
  )
}
