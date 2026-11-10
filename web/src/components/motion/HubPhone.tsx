import { Icon } from '../Icon'

// The Knowledge Hub group chat, as it actually runs: the real poll result (members voted
// AI Automation), the real first challenge, a real lesson and its task. No invented member messages.
//  - <HubPhone>: desktop (lg+). The chat inside a phone; messages pop in as the phone scrolls into
//    view (CSS view timeline on .hub-phone).
//  - <HubConversation>: phones and tablets. No device inside the device (same rule as the home
//    hero): the group header floats as a glass pill and the bubbles float on the section, each
//    popping in as it scrolls into view (its own view timeline). Both render the same <HubMessages>.

type Variant = 'phone' | 'free'

const bubble = (v: Variant) => (v === 'phone' ? 'hub-msg hub-bubble' : 'hub-float hub-bubble hub-bubble-free')

/** The messages themselves, shared by both layouts. `range` staggers the phone version's pop-in. */
function HubMessages({ variant }: { variant: Variant }) {
  const range = (a: number) => (variant === 'phone' ? { animationRange: `entry ${a}% cover ${a + 20}%` } : undefined)
  return (
    <>
      <span className={`${variant === 'phone' ? 'hub-msg' : 'hub-float'} mx-auto rounded-[8px] bg-[#1f2c34] px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-white/55`} style={range(10)}>Today</span>

      <div className={bubble(variant)} style={range(14)}>
        <p className="font-semibold">Poll: what do you want to learn first?</p>
        <div className="mt-2 rounded-[8px] bg-white/[0.05] p-2">
          <div className="flex items-center justify-between gap-2 text-[0.75rem]"><span className="flex items-center gap-1.5"><Icon name="check" size={13} className="text-[#25d366]" />AI Automation</span><span className="text-white/45">Top choice</span></div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="hub-bar h-full rounded-full bg-[#25d366]" /></div>
        </div>
        <p className="hub-time">09:12</p>
      </div>

      <div className={bubble(variant)} style={range(20)}>
        <p>The votes are in. First challenge: <span className="font-semibold text-white">Automate &amp; Earn</span>, skills local businesses pay for.</p>
        <p className="hub-time">09:15</p>
      </div>

      <div className={bubble(variant)} style={range(26)}>
        <div className="flex gap-2.5 rounded-[8px] bg-white/[0.05] p-2">
          <span className="inline-flex h-11 w-9 flex-none items-center justify-center rounded-[5px] bg-[#e74c3c]/90 font-mono text-[0.5625rem] font-bold text-white">PDF</span>
          <span className="min-w-0"><span className="block truncate font-semibold">Lesson 01 · Skills, not schemes</span><span className="block font-mono text-[0.625rem] text-white/45">4 pages · PDF</span></span>
        </div>
        <p className="mt-1.5">Find a real business task worth fixing.</p>
        <p className="hub-time">18:00</p>
      </div>

      <div className={bubble(variant)} style={range(32)}>
        <p><span className="font-semibold text-[#25d366]">✓ Your task: </span>post the business you picked and its most annoying weekly task.</p>
        <p className="hub-time">18:01</p>
      </div>
    </>
  )
}

/** Group header: in the phone it is the app bar; on phones it floats as a glass pill. */
function HubHeader({ floating }: { floating?: boolean }) {
  return (
    <div className={floating
      ? 'hub-float mx-auto flex w-fit max-w-full items-center gap-2.5 rounded-full border border-white/10 bg-[#1f2c34]/85 py-2 pl-2 pr-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md'
      : 'flex items-center gap-2.5 border-b border-white/[0.06] bg-[#1f2c34] px-3 py-2.5'}>
      {floating ? null : <Icon name="arrowRight" size={18} className="rotate-180 text-[#53bdeb]" />}
      <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[linear-gradient(140deg,#1da1c2,#0f7590)] text-[0.75rem] font-bold text-white">KH</span>
      <span className="min-w-0 text-left leading-tight">
        <span className="block truncate text-[0.9375rem] font-semibold text-white">Knowledge Hub</span>
        <span className="block truncate text-[0.6875rem] text-white/55">Community · young builders across SA</span>
      </span>
      <Icon name="users" size={18} className={`flex-none text-white/60 ${floating ? 'ml-1' : 'ml-auto'}`} />
    </div>
  )
}

export function HubPhone({ className = '' }: { className?: string }) {
  return (
    <div className={`hub-phone relative mx-auto w-[320px] ${className}`}>
      {/* Titanium frame */}
      <div className="hub-frame rounded-[50px] p-[9px]">
        <div className="relative h-[640px] overflow-hidden rounded-[42px] bg-[#0b141a]">
          {/* Status bar + Dynamic Island */}
          <div className="relative flex h-12 items-center justify-between px-7 pt-1 text-[0.8125rem] font-semibold text-white">
            <span className="tabular-nums">9:41</span>
            <span className="absolute left-1/2 top-2.5 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
            <span className="flex items-center gap-1.5" aria-hidden="true">
              <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></svg>
              <svg width="24" height="11" viewBox="0 0 24 11" fill="none"><rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="15" height="7" rx="1.6" fill="currentColor" /><rect x="21.6" y="3.5" width="1.6" height="4" rx="0.8" fill="currentColor" opacity="0.4" /></svg>
            </span>
          </div>
          <HubHeader />
          {/* Messages: newest at the bottom, like the real thing */}
          <div className="hub-wall absolute inset-x-0 bottom-[60px] top-[107px] flex flex-col justify-end gap-2 overflow-hidden px-3 pb-3">
            <HubMessages variant="phone" />
          </div>
          {/* Composer */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-[#1f2c34] px-2.5 pb-4 pt-2">
            <span className="flex h-9 flex-1 items-center rounded-full bg-[#2a3942] px-4 text-[0.8125rem] text-white/45">Message</span>
            <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#25d366]" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#0b141a"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" stroke="#0b141a" strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M12 18v4" stroke="#0b141a" strokeWidth="2" strokeLinecap="round" /></svg>
            </span>
          </div>
          {/* Glass reflection */}
          <span className="pointer-events-none absolute inset-0 rounded-[42px] bg-[linear-gradient(125deg,rgba(255,255,255,0.08)_0%,transparent_32%)]" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

/** Phones and tablets: the conversation out of the device, floating on the section. */
export function HubConversation({ className = '' }: { className?: string }) {
  return (
    <div className={`hub-convo relative mx-auto flex w-full max-w-[400px] flex-col gap-2.5 ${className}`} aria-label="A look inside the Knowledge Hub group">
      <HubHeader floating />
      <div className="mt-2 flex flex-col gap-2.5">
        <HubMessages variant="free" />
      </div>
    </div>
  )
}
