// Single source of truth for business facts (VAULT/Brand Bible.md).
// Change contact details here, never inline in pages.

export const SITE = {
  name: 'TshedzaWebDev',
  legalName: 'TshedzaWebDev',
  founder: 'Tshedza Dzivhani',
  tagline: 'Crafting Exceptional Web Experiences',
  url: 'https://tshedzawebdev.co.za',
  locale: 'en-ZA',
  city: 'Pretoria',
  region: 'Gauteng',
  country: 'South Africa',
  email: 'info@tshedzawebdev.co.za',
  phoneDisplay: '069 951 3836',
  phoneIntl: '+27699513836',
  whatsapp: '27699513836',
  apiBase: process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.tshedzawebdev.co.za',
  vatNote: 'Not VAT registered · All prices in South African rand',
  // Business channels only. The personal Facebook/Instagram links from the old
  // site are left out until the owner confirms business accounts .
  social: {
    tiktok: 'https://www.tiktok.com/@tshedza.webdev',
    linkedin: 'https://www.linkedin.com/in/tshedza-dzivhani-97b78831a/',
  },
  knowledgeHub: {
    name: 'Knowledge Hub',
    whatsappCommunity: 'https://wa.me/27699513836?text=' + encodeURIComponent('Hi Tshedza, I’d like to join the Knowledge Hub community.'),
  },
} as const

/** Prefix a public-folder path with the deploy base path (see next.config.ts). */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`

export function whatsappLink(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`
}

export const NAV = [
  { href: '/services/', label: 'Services' },
  { href: '/work/', label: 'Work' },
  { href: '/about/', label: 'About' },
  { href: '/learn/', label: 'Learn' },
  { href: '/wall/', label: 'Wall' },
  { href: '/faq/', label: 'FAQ' },
] as const
