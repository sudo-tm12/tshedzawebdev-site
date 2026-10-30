import { QuoteBuilder } from '@/components/QuoteBuilder'
import { pageMeta } from '@/lib/meta'

export const metadata = pageMeta(
  '/quote/',
  'Instant quote',
  'Get an instant price range in rand for a website, online store, web app, automation, SEO, social media or trading bot. A few taps, no sign-up.',
)

// The quote is the whole page: one question per screen, no scrolling (QuoteBuilder).
export default function QuotePage() {
  return <QuoteBuilder />
}
