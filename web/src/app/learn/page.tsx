import { Icon } from '@/components/Icon'
import { PageHero } from '@/components/PageHero'
import { CommunityChat } from '@/components/motion/CommunityChat'
import { Checklist, LiquidField } from '@/components/ui'
import { pageMeta } from '@/lib/meta'
import { PRICEBOOK_COACHING } from '@/lib/coaching'
import { rand } from '@/lib/quote/engine'
import { SITE, whatsappLink } from '@/lib/site'

export const metadata = pageMeta(
  '/learn/',
  'Learn',
  'Knowledge Hub: a free community for young South Africans learning to build, launch and earn with tech, plus AI Agency Builder coaching from R500 a month.',
)

export default function LearnPage() {
  return (
    <>
      <PageHero
        eyebrow="Knowledge Hub · Learn"
        title={<>Learn to build, launch <span className="accent-serif text-teal-500">and earn.</span></>}
        lede="TshedzaWebDev builds. Knowledge Hub teaches. We share what we learn on real client work so more young South Africans can go from zero to launch-ready."
        actions={<><a href={SITE.knowledgeHub.whatsappCommunity} className="btn btn-accent glow-border" rel="noopener"><Icon name="whatsapp" size={18} /> Join the community</a><a href="#coaching" className="btn btn-on-dark">Coaching</a></>}
        aside={<CommunityChat />}
      />

      <section className="canvas-tint pt-14">
      <LiquidField blobs={[{ tone: 'teal', top: '5%', left: '55%', size: 560 }, { tone: 'sun', top: '50%', left: '-10%', size: 420 }]} />
      <div className="container-site grid gap-6 pb-20 lg:grid-cols-12 lg:pb-28">
        <div className="on-dark grain flex flex-col rounded-[28px] bg-navy-900 p-8 text-white shadow-[var(--shadow-lg)] lg:col-span-7 lg:p-10">
          <span className="chip self-start bg-teal-500/15 text-teal-500">Free</span>
          <h2 className="h2 mt-5">Knowledge Hub community</h2>
          <p className="lede mt-4">A WhatsApp community for learning tech skills that pay: short lessons, practical challenges, and people who will help you finish.</p>
          <Checklist className="mt-7 text-white/85" items={[
            'Build & Launch Challenge: from an empty laptop to a live website',
            'Automate & Earn Challenge: WhatsApp-first automation that local businesses pay for',
            'Lessons designed for phones and mobile data',
            'Real tasks, shared and reviewed in the group',
          ]} />
          <a href={SITE.knowledgeHub.whatsappCommunity} className="btn btn-accent mt-9 self-start" rel="noopener"><Icon name="whatsapp" size={18} /> Ask to join on WhatsApp</a>
        </div>

        <div id="coaching" className="glass-light flex scroll-mt-24 flex-col rounded-[28px] p-8 lg:col-span-5 lg:p-10">
          <span className="chip chip-neutral self-start">Coaching</span>
          <h2 className="h2 mt-5">AI Agency Builder</h2>
          <p className="mt-4 text-ink-2">Monthly coaching for people building an AI-augmented service business: finding clients, pricing, delivering and growing, with a mentor who does it for a living.</p>
          <ul className="mt-7 divide-y divide-line border-y border-line">
            {PRICEBOOK_COACHING.tiers.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3.5">
                <span className="font-medium">{t.name}</span>
                <span className="font-mono tabular-nums text-ink-2">{rand(t.monthly)}/month</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[0.875rem] text-ink-3">Tier details are shared on enquiry. The first cohort is forming now.</p>
          <a href={whatsappLink('Hi Tshedza, I’m interested in the AI Agency Builder coaching.')} className="btn btn-primary mt-8 self-start" rel="noopener">Enquire about coaching</a>
        </div>
      </div>
      </section>
    </>
  )
}
