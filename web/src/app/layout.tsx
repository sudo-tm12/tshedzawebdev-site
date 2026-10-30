import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { ConsentBanner } from '@/components/ConsentBanner'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { SITE, asset } from '@/lib/site'
import './globals.css'

// Self-hosted at build time (no runtime Google request), metric-matched fallbacks.
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap', weight: ['400', '500', '600'] })
const instrument = Instrument_Serif({ subsets: ['latin'], variable: '--font-instrument', display: 'swap', weight: '400', style: ['normal', 'italic'] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: web design & development in ${SITE.city}`, template: `%s · ${SITE.name}` },
  description: 'A Pretoria web studio building fast, mobile-first websites, online stores, web apps and automations for South African businesses. Get an instant quote in rand.',
  applicationName: SITE.name,
  authors: [{ name: SITE.founder }],
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    siteName: SITE.name,
    url: SITE.url,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: `${SITE.name}: ${SITE.tagline}` }],
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: asset('/icon.png'), apple: asset('/apple-touch-icon.png') },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#0A1B2E',
  width: 'device-width',
  initialScale: 1,
}

const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: SITE.name,
  slogan: SITE.tagline,
  url: SITE.url,
  logo: `${SITE.url}/icon.png`,
  image: `${SITE.url}/og.png`,
  email: SITE.email,
  telephone: SITE.phoneIntl,
  founder: { '@type': 'Person', name: SITE.founder },
  address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: 'ZA' },
  areaServed: { '@type': 'Country', name: 'South Africa' },
  currenciesAccepted: 'ZAR',
  sameAs: Object.values(SITE.social),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" data-scroll-behavior="smooth" className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`}>
      <head>
        {/* A reload starts at the top (on the hero) instead of where you last were; the
            Back/Forward buttons keep restoring your place. Runs before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: "try{var n=performance.getEntriesByType('navigation')[0];if(n&&n.type==='reload'){history.scrollRestoration='manual';addEventListener('load',function(){scrollTo(0,0);setTimeout(function(){history.scrollRestoration='auto'},0)})}}catch(e){}" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }} />
      </head>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <ConsentBanner />
      </body>
    </html>
  )
}
