import type { Metadata } from 'next'
import { SITE } from './site'

// Every page gets its own title, description, canonical URL and social card.
export function pageMeta(path: string, title: string, description: string): Metadata {
  const url = `${SITE.url}${path}`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url, siteName: SITE.name, locale: 'en_ZA', type: 'website', images: [{ url: '/og.png', width: 1200, height: 630, alt: `${SITE.name}: ${SITE.tagline}` }] },
    twitter: { card: 'summary_large_image', title, description },
  }
}
