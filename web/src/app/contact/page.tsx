import Link from 'next/link'
import { ContactForm } from '@/components/ContactForm'
import { Icon } from '@/components/Icon'
import { PageHero } from '@/components/PageHero'
import { LiquidField } from '@/components/ui'
import { pageMeta } from '@/lib/meta'
import { SITE, whatsappLink } from '@/lib/site'

export const metadata = pageMeta(
  '/contact/',
  'Contact',
  `Talk to TshedzaWebDev in ${SITE.city}: WhatsApp ${SITE.phoneDisplay}, email ${SITE.email}, or send a message. You speak to the person who builds your project.`,
)

export default function ContactPage() {
  return (
    <>
      <PageHero compact eyebrow="Contact" title={<>Let’s talk about <span className="accent-serif text-teal-500">your project.</span></>} lede="WhatsApp is the fastest way to reach us. Prefer email or a form? That works too. A real person replies." />
      <section className="canvas-tint">
      <LiquidField blobs={[{ tone: 'teal', top: '0%', left: '65%', size: 560 }, { tone: 'mint', top: '45%', left: '-10%', size: 420 }]} />
      <div className="container-site grid gap-12 pb-24 pt-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ul className="grid gap-3">
            <li>
              <a href={whatsappLink('Hi Tshedza, I found you on your website.')} className="glass-light card-hover flex items-center gap-4 rounded-[20px] p-5" rel="noopener">
                <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-navy-900 text-teal-500"><Icon name="whatsapp" /></span>
                <span><span className="block font-semibold">WhatsApp</span><span className="text-ink-2">{SITE.phoneDisplay}</span></span>
                <Icon name="arrowUpRight" className="ml-auto text-ink-3" />
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="glass-light card-hover flex items-center gap-4 rounded-[20px] p-5">
                <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-navy-900 text-teal-500"><Icon name="mail" /></span>
                <span><span className="block font-semibold">Email</span><span className="text-ink-2">{SITE.email}</span></span>
                <Icon name="arrowUpRight" className="ml-auto text-ink-3" />
              </a>
            </li>
            <li className="glass-light flex items-center gap-4 rounded-[20px] p-5">
              <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-line-2 text-ink-2"><Icon name="pin" /></span>
              <span><span className="block font-semibold">Based in</span><span className="text-ink-2">{SITE.city}, {SITE.region}. Working across South Africa.</span></span>
            </li>
          </ul>
          <p className="mt-8 text-ink-2">Want a price first? <Link href="/quote/" className="link font-medium">Get an instant quote</Link>.</p>
        </div>
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
      </section>
    </>
  )
}
