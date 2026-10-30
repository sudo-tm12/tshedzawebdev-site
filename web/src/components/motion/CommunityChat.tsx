import { Icon } from '../Icon'

// The Knowledge Hub group, as it actually runs: real lessons, real tasks and the real
// poll result (members voted AI Automation). No invented member messages.

const MESSAGES: { kind: 'lesson' | 'task' | 'poll' | 'text'; title?: string; body: string; time: string }[] = [
  { kind: 'poll', title: 'Poll: what do you want to learn first?', body: 'AI Automation', time: '09:12' },
  { kind: 'text', body: 'The votes are in. Our first challenge is Automate & Earn: skills local businesses actually pay for.', time: '09:15' },
  { kind: 'lesson', title: 'Lesson 01 · Skills, not schemes', body: 'Find a real business task worth fixing, and spot the scams pretending to be this.', time: '18:00' },
  { kind: 'task', title: 'Your task', body: 'Post the business you picked, its most annoying weekly task, and the hours it costs.', time: '18:01' },
]

export function CommunityChat() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0b141a] shadow-[0_40px_100px_-40px_rgba(37,211,102,0.35)]">
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#202c33] px-4 py-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 font-semibold text-navy-950">KH</span>
        <div className="leading-tight"><p className="font-semibold text-white">Knowledge Hub</p><p className="text-[0.75rem] text-white/55">Community · young builders across SA</p></div>
        <Icon name="users" size={18} className="ml-auto text-white/50" />
      </div>
      <div className="grid gap-2.5 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:14px_14px] p-4">
        {MESSAGES.map((m, i) => (
          <div key={i} className="scroll-in max-w-[88%] rounded-[12px] rounded-tl-[4px] bg-[#202c33] px-3.5 py-2.5 text-[0.875rem] text-white/90" style={{ animationRange: `entry ${10 + i * 14}% cover ${30 + i * 14}%` }}>
            {m.kind === 'poll' ? (
              <>
                <p className="font-semibold">{m.title}</p>
                <div className="mt-2 rounded-[8px] bg-white/5 p-2">
                  <div className="flex items-center justify-between text-[0.8125rem]"><span className="flex items-center gap-2"><Icon name="check" size={14} className="text-[#25d366]" />{m.body}</span><span className="text-white/50">Top choice</span></div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-full rounded-full bg-[#25d366]" /></div>
                </div>
              </>
            ) : m.kind === 'lesson' ? (
              <div className="flex gap-3">
                <span className="inline-flex h-10 w-9 flex-none items-center justify-center rounded-[6px] bg-teal-500/20 text-teal-500"><Icon name="file" size={18} /></span>
                <span><span className="block font-semibold">{m.title}</span><span className="text-white/70">{m.body}</span><span className="mt-1 block font-mono text-[0.6875rem] text-white/40">PDF · 4 pages</span></span>
              </div>
            ) : m.kind === 'task' ? (
              <p><span className="font-semibold text-[#25d366]">✓ {m.title}: </span>{m.body}</p>
            ) : (
              <p>{m.body}</p>
            )}
            <p className="mt-1 text-right text-[0.6875rem] text-white/40">{m.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
