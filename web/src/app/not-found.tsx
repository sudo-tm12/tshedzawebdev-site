import Link from 'next/link'
import { PageHero } from '@/components/PageHero'
import { Icon } from '@/components/Icon'

export const metadata = { title: 'Page not found', robots: { index: false } }

export default function NotFound() {
  return (
    <PageHero
        eyebrow="404"
        title={<>This page <span className="accent-serif text-teal-500">moved on.</span></>}
        lede="We rebuilt the site, so some old links have changed. Everything you need is one click away."
        actions={<><Link href="/" className="btn btn-accent glow-border">Go home</Link><Link href="/services/" className="btn btn-on-dark">Services</Link><Link href="/quote/" className="btn btn-on-dark">Instant quote <Icon name="arrowRight" size={18} /></Link></>}
      />
  )
}
