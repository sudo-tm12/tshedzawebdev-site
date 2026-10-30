// Portfolio. Only projects the owner approved on 29 Oct 2026. Facts come from the
// project docs and VAULT client notes. One project is excluded entirely (NDA).
// The Gourmet Chariot company profile is confidential: nothing from it is published.
import { asset } from '@/lib/site'

export interface Shot { src: string; width: number; height: number; alt: string }
export interface Project {
  slug: string
  client: string
  sector: string
  location?: string
  year?: string
  services: string[]
  summary: string
  challenge: string
  approach: string[]
  delivered: string[]
  live?: string
  status: string
  desktop?: Shot
  mobile?: Shot
  accent: string // a typographic card colour when there is no screenshot
}

export const WORK: Project[] = [
  {
    slug: 'blr-tutoring',
    client: 'BLR Tutoring',
    sector: 'Education',
    location: 'Pretoria',
    services: ['Website', 'Owner dashboard', 'Design system'],
    summary: 'A mobile-first site and owner dashboard for a Grade 10–12 Maths and Physical Sciences tutoring practice.',
    challenge: 'Parents decide on a phone, on mobile data, in under a minute. The site had to prove that BLR is real, affordable and worth a WhatsApp, fast.',
    approach: [
      'Wrote the product requirements and design spec before any code: personas, funnel and performance budget.',
      'Designed around a real classroom, a real tutor and a real timetable, with no stock photography.',
      'Built an owner dashboard for students, payments, attendance and leads, so the practice runs from one place.',
    ],
    delivered: ['Marketing website', 'Owner dashboard', 'POPIA privacy page', 'Design system + documentation'],
    live: 'https://blrtutoring.co.za',
    status: 'Live',
    desktop: { src: asset('/work/blr-desktop.webp'), width: 1200, height: 750, alt: 'BLR Tutoring homepage: a large STUDY headline over a classroom chalkboard full of equations' },
    mobile: { src: asset('/work/blr-mobile.webp'), width: 390, height: 844, alt: 'BLR Tutoring homepage on a phone' },
    accent: '#0E2238',
  },
  {
    slug: 'chavistos-travel',
    client: "Chavisto's Travel & Tourism",
    sector: 'Transport & tourism',
    location: 'Gauteng',
    services: ['Website'],
    summary: 'A premium one-page site for executive rides, airport transfers and group travel across Gauteng.',
    challenge: 'Travellers compare transport options quickly. The site needed to feel premium and make booking a trip effortless.',
    approach: [
      'Defined design tokens first so colour, type and spacing stay consistent.',
      'Built a refined navigation and clear booking calls to action, with WhatsApp one tap away.',
      'Kept it accessible: visible focus states and semantic structure throughout.',
    ],
    delivered: ['One-page website', 'Booking and WhatsApp calls to action', 'Design tokens'],
    status: 'Delivered',
    desktop: { src: asset('/work/chavisto-desktop.webp'), width: 1200, height: 750, alt: "Chavisto's Travel homepage: “Experience the magic of premium travel” over a mountain landscape" },
    accent: '#0B3B5C',
  },
  {
    slug: 'e-wall-innovations',
    client: 'E-Wall Innovations',
    sector: 'Technology',
    services: ['Website', 'Motion design'],
    summary: 'An animated company website for a technology business working in IoT, AI and cyber security.',
    challenge: 'A technical company needed to look as advanced as its work, without losing clarity or speed.',
    approach: [
      'Built with Next.js for speed and a clean, component-based structure.',
      'Used purposeful motion to express a forward-looking brand, while keeping the message readable.',
      'Delivered a production build, ready to deploy.',
    ],
    delivered: ['Company website (Next.js)', 'Animated hero + sections', 'Production build'],
    status: 'Delivered',
    desktop: { src: asset('/work/ewall-desktop.webp'), width: 1200, height: 750, alt: 'E-Wall Innovations homepage: “We Are The Change.” on a dark starfield' },
    mobile: { src: asset('/work/ewall-mobile.webp'), width: 390, height: 844, alt: 'E-Wall Innovations homepage on a phone' },
    accent: '#0A1530',
  },
  {
    slug: 'the-gourmet-chariot',
    client: 'The Gourmet Chariot',
    sector: 'Food & catering',
    services: ['Website', 'Social media', 'Service agreement'],
    summary: 'A website and social media set-up for a food truck, backed by a clear service agreement.',
    challenge: 'A mobile food business needed a simple way for customers to find it and book it for events.',
    approach: [
      'Set up a straightforward web presence and social channels.',
      'Agreed scope and terms in writing upfront, so both sides knew exactly what was being delivered.',
    ],
    delivered: ['Website', 'Social media set-up', 'Service agreement'],
    status: 'Completed',
    accent: '#7A2E1F',
  },
  {
    slug: 'the-light-express',
    client: 'The Light Express',
    sector: 'Brand & print',
    services: ['Branding', 'Company profile', 'Poster design'],
    summary: 'Branding, a company profile and promotional poster design.',
    challenge: 'A growing business needed consistent, professional brand material to present itself to clients.',
    approach: [
      'Shaped a consistent visual identity.',
      'Designed a company profile and promotional poster in that identity.',
    ],
    delivered: ['Brand identity', 'Company profile', 'Promotional poster'],
    status: 'Completed',
    accent: '#1E3A57',
  },
]

export function getProject(slug: string): Project | undefined {
  return WORK.find((p) => p.slug === slug)
}
