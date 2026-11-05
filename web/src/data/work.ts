// Portfolio. Only projects the owner approved on 29 Oct 2026 (TNB and HomeCo added on 5 Nov 2026). Facts come from the
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
  /** A tall phone capture (390 wide) that scrolls inside the phone frame as you scroll. */
  mobileTall?: Shot
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
    mobileTall: { src: asset('/work/blr-mobile-tall.webp'), width: 390, height: 2800, alt: 'BLR Tutoring on a phone: the STUDY hero, why learners choose BLR, and the Maths and Physical Sciences courses' },
    accent: '#0E2238',
  },
  {
    slug: 'tnb-environmental',
    client: 'TNB Environmental Solutions',
    sector: 'Geotechnical & environmental',
    location: 'Cape Town',
    services: ['Website', 'Company profile'],
    summary: 'A one-page website and company profile for a geotechnical and environmental consultancy in the Western Cape.',
    challenge: 'Developers, mining and finance clients have to trust a consultant with ground risk before they ever pick up the phone. The site had to explain three technical disciplines simply and look as precise as the work itself.',
    approach: [
      'Built the page around the ground itself: soil layers and a depth gauge that move as you scroll.',
      'Turned three disciplines (geotechnical, contamination and environmental authorisation) into one clear set of tabs, with a step-by-step process from first question to sign-off.',
      'Designed the phone layout separately, with call and enquiry buttons always in thumb reach.',
    ],
    delivered: ['One-page website', 'Company profile (PDF and editable Word)', 'Phone quick-contact bar'],
    live: 'https://sudo-tm12.github.io/tnb-environmental/',
    status: 'Delivered',
    desktop: { src: asset('/work/tnb-desktop.webp'), width: 1200, height: 750, alt: 'TNB Environmental Solutions homepage: “Understanding what lies beneath” on deep green, with a borehole log of soil layers' },
    mobile: { src: asset('/work/tnb-mobile.webp'), width: 390, height: 844, alt: 'TNB Environmental Solutions homepage on a phone, with soil layers along the bottom' },
    mobileTall: { src: asset('/work/tnb-mobile-tall.webp'), width: 390, height: 2800, alt: 'TNB Environmental Solutions on a phone: the hero, the soil layers, who they are, and their three disciplines' },
    accent: '#10281A',
  },
  {
    slug: 'homeco-property-services',
    client: 'HomeCo Property Services',
    sector: 'Property care',
    services: ['Website', 'Company profile'],
    summary: 'A website and company profile for a short-term rental turnover service that inspects, cleans and restocks between every stay.',
    challenge: 'Holiday-rental owners juggle cleaners, laundry, stock and booking changes across scattered chats. HomeCo needed to show, not just say, how it keeps a property guest-ready, without inventing stats or prices before launch.',
    approach: [
      'Opened with a sample turnover that ticks through each check until the property is released as ready.',
      'Told the turnover as a scroll story: a clock runs from checkout to check-in while the five steps play.',
      'Let owners tap through the three readiness outcomes to see exactly what they would be told.',
    ],
    delivered: ['One-page website', 'Company profile (PDF and editable Word)', 'Interactive owner-report preview'],
    live: 'https://sudo-tm12.github.io/homeco-property-services/',
    status: 'In review',
    desktop: { src: asset('/work/homeco-desktop.webp'), width: 1200, height: 750, alt: 'HomeCo homepage: “Every guest walks into a home that’s ready”, beside a sample turnover checklist' },
    mobile: { src: asset('/work/homeco-mobile.webp'), width: 390, height: 844, alt: 'HomeCo homepage on a phone' },
    mobileTall: { src: asset('/work/homeco-mobile-tall.webp'), width: 390, height: 2800, alt: 'HomeCo on a phone: the hero, the sample turnover checklist reaching Ready, and the everyday juggle' },
    accent: '#0A2A4A',
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
    live: 'https://ewallinnovations.co.za',
    status: 'Live',
    desktop: { src: asset('/work/ewall-desktop.webp'), width: 1200, height: 750, alt: 'E-Wall Innovations homepage: “We Are The Change.” on a dark starfield' },
    mobile: { src: asset('/work/ewall-mobile.webp'), width: 390, height: 844, alt: 'E-Wall Innovations homepage on a phone' },
    mobileTall: { src: asset('/work/ewall-mobile-tall.webp'), width: 390, height: 2800, alt: 'E-Wall Innovations on a phone: the “We Are The Change” hero and the sections below it' },
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
