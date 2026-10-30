import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { Icon } from '@/components/Icon'
import { CtaBand } from '@/components/ui'
import { pageMeta } from '@/lib/meta'
import { SITE } from '@/lib/site'

export const metadata = pageMeta(
  '/faq/',
  'FAQ',
  'Straight answers about pricing, deposits, VAT, timelines, ownership, hosting and how we work at TshedzaWebDev.',
)

const GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: 'Pricing & payment',
    items: [
      { q: 'How much does a website cost?', a: 'A landing page starts from R2 500 and a five-page business site from R4 500. Online stores start from R4 500. The instant quote gives you a range based on exactly what you need.' },
      { q: 'Do you charge VAT?', a: 'No. TshedzaWebDev is not VAT registered, so we never add VAT. The price on your quote is the price you pay.' },
      { q: 'Do I need to pay a deposit?', a: 'Yes, for projects over R3 000 a 50% deposit secures your slot and starts the work. The balance is due on hand-over, as agreed in your quote.' },
      { q: 'Is the instant quote the final price?', a: 'It is an honest estimate range. After a short chat about your project we send a written quote with a fixed price.' },
    ],
  },
  {
    title: 'Process & timelines',
    items: [
      { q: 'How long does a project take?', a: 'A landing page is usually live within a week, and a typical business site in about two weeks once we have your content. The instant quote shows an estimated timeline for your selection.' },
      { q: 'What do you need from me?', a: 'Your logo (or we can make one), the words and photos you want to use, and access to your domain if you have one. We send a simple checklist after you accept the quote.' },
      { q: 'How do we communicate?', a: 'Mostly WhatsApp and email, with video calls when a conversation is easier. You always talk to the person building your project.' },
    ],
  },
  {
    title: 'Ownership & support',
    items: [
      { q: 'Do I own my website?', a: 'Yes. Your domain, content and code belong to you. We hand over all access and documentation at launch.' },
      { q: 'Do you help after launch?', a: 'Yes. Optional monthly care plans cover updates, backups and small edits. You can also simply ask for changes when you need them.' },
      { q: 'Can you take over or fix my existing website?', a: 'Often, yes. Send us the link on WhatsApp and we will tell you honestly whether it is worth fixing or rebuilding.' },
    ],
  },
  {
    title: 'Privacy & trust',
    items: [
      { q: 'How do you handle personal information?', a: 'In line with POPIA. Forms only collect what is needed, and we explain everything in our Privacy Policy, including the analytics and chat tools that run only if you accept them.' },
      { q: 'Where are you based?', a: `${SITE.city}, ${SITE.region}. We work with businesses across South Africa.` },
    ],
  },
]

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GROUPS.flatMap((g) => g.items).map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero compact eyebrow="FAQ" title={<>Straight <span className="accent-serif text-teal-500">answers.</span></>} lede="If your question is not here, ask us on WhatsApp. A real person replies." />
      <section className="container-site grid gap-14 pb-20 lg:pb-28">
        {GROUPS.map((g) => (
          <div key={g.title} className="grid gap-6 lg:grid-cols-12">
            <h2 className="eyebrow lg:col-span-4 lg:pt-6">{g.title}</h2>
            <div className="divide-y divide-line border-y border-line lg:col-span-8">
              {g.items.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[1.0625rem] font-semibold">
                    {f.q}<Icon name="plus" size={20} className="flex-none text-ink-3 transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 max-w-2xl text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
        <p className="text-ink-2">Ready for a number? <Link href="/quote/" className="link font-medium">Try the instant quote</Link>.</p>
      </section>
      <CtaBand />
    </>
  )
}
