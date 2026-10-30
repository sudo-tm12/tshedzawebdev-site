import type { MetadataRoute } from 'next'
import { SERVICES } from '@/data/services'
import { WORK } from '@/data/work'
import { SITE } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const paths = ['/', '/services/', '/work/', '/quote/', '/about/', '/learn/', '/wall/', '/faq/', '/contact/', '/privacy/', '/terms/',
    ...SERVICES.map((s) => `/services/${s.slug}/`), ...WORK.map((w) => `/work/${w.slug}/`)]
  return paths.map((p) => ({ url: `${SITE.url}${p}`, lastModified: now, changeFrequency: 'monthly', priority: p === '/' ? 1 : p === '/quote/' ? 0.9 : 0.7 }))
}
