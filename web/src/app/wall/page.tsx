import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { PageHero } from '@/components/PageHero'
import { LiquidField } from '@/components/ui'
import { NoteCard } from '@/components/wall/NoteCard'
import { Wall } from '@/components/wall/Wall'
import { KINDS, WELCOME } from '@/components/wall/notes'
import { pageMeta } from '@/lib/meta'
import { SITE } from '@/lib/site'

export const metadata = pageMeta(
  '/wall/',
  'Community wall',
  'Leave a note for the Knowledge Hub and TshedzaWebDev community: a thank you, some encouragement, an idea or a shout-out. Every note is read before it goes up.',
)

const RULES = [
  { icon: 'heart' as const, title: 'Be kind', body: 'Lift people up. Notes that put anyone down will not be published.' },
  { icon: 'shield' as const, title: 'Keep it safe', body: 'No links, emails or phone numbers. The wall is public.' },
  { icon: 'users' as const, title: 'Your name is optional', body: 'Sign with a first name, or post as Anonymous. Both are welcome.' },
  { icon: 'check' as const, title: 'A real person reads every note', body: 'Notes go up once they have been read. Want one removed? Just ask.' },
]

export default function WallPage() {
  return (
    <>
      <PageHero
        eyebrow="Community wall"
        title={<>Leave a note for the <span className="accent-serif text-teal-500">community.</span></>}
        lede="Thank someone who helped you. Cheer on a beginner. Share the tip you wish you had on day one. Short notes, big encouragement, open to everyone."
        actions={
          <>
            <a href="#write" className="btn btn-accent glow-border"><Icon name="pen" size={18} /> Write a note</a>
            <a href="#board" className="btn btn-on-dark">Read the wall</a>
          </>
        }
        aside={
          <div className="relative mx-auto h-[340px] max-w-[380px]" aria-hidden="true">
            <div className="absolute inset-x-6 top-10 h-[260px] rotate-[7deg] rounded-[6px] bg-[#fad4d8] opacity-80 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]" />
            <div className="absolute inset-x-3 top-6 h-[260px] -rotate-[5deg] rounded-[6px] bg-[#cdefd9] opacity-90 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]" />
            <div className="float-slow relative">
              <NoteCard note={WELCOME} preview />
            </div>
            <div className="absolute -bottom-2 -left-3 flex gap-2">
              {KINDS.map((k, i) => (
                <span key={k.id} className="float-slower inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[1.25rem] backdrop-blur" style={{ animationDelay: `${i * 0.4}s` }}>{k.emoji}</span>
              ))}
            </div>
          </div>
        }
      />

      <Wall />

      <section className="section canvas-tint border-t border-line/60">
        <LiquidField blobs={[{ tone: 'lilac', top: '0%', left: '65%', size: 480 }, { tone: 'teal', top: '40%', left: '-10%', size: 420 }]} />
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">House rules</p>
            <h2 className="mt-3 text-[clamp(1.75rem,2vw+1rem,2.5rem)] font-semibold leading-tight tracking-[-0.03em]">A wall worth <span className="accent-serif text-teal-700">reading.</span></h2>
            <p className="mt-4 text-ink-2">The wall belongs to everyone who learns and builds with us, so we keep it warm and safe.</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {RULES.map((r) => (
              <li key={r.title} className="reveal glass-light rounded-[22px] p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700"><Icon name={r.icon} size={20} /></span>
                <h3 className="mt-4 font-semibold">{r.title}</h3>
                <p className="mt-1 text-[0.9375rem] text-ink-2">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section on-dark relative overflow-hidden bg-[linear-gradient(160deg,#06111f_0%,#0a2a3a_60%,#0f7590_130%)] text-white">
        <div className="container-site flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Knowledge Hub</p>
            <h2 className="mt-3 text-[clamp(2rem,3vw+1rem,3.25rem)] font-semibold leading-[1.02] tracking-[-0.035em]">Want more than a note? <span className="accent-serif text-teal-500">Join us.</span></h2>
            <p className="mt-4 text-[1.0625rem] text-white/70">Free challenges, weekly lessons and a community of young South Africans building real skills together.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={SITE.knowledgeHub.whatsappCommunity} className="btn btn-accent" rel="noopener"><Icon name="whatsapp" size={18} /> Join the community</a>
            <Link href="/learn/" className="btn btn-on-dark">About Knowledge Hub</Link>
          </div>
        </div>
      </section>
    </>
  )
}
