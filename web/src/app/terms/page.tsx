import { PageHero } from '@/components/PageHero'
import { pageMeta } from '@/lib/meta'
import { SITE } from '@/lib/site'

export const metadata = pageMeta('/terms/', 'Terms of use', 'The terms for using the TshedzaWebDev website and instant quote.')

export default function TermsPage() {
  return (
    <>
      <PageHero compact eyebrow="Legal" title="Terms of use" lede="Last updated 30 October 2026." />
      <section className="container-site pb-24 pt-14">
        <div className="prose-legal">
          <h2>Using this website</h2>
          <p>This website is provided by {SITE.name}, {SITE.city}, South Africa. By using it you agree to these terms. If you do not agree, please do not use the site.</p>

          <h2>Estimates are not quotes</h2>
          <p>The instant quote gives an indicative price range based on the options you select. It is not an offer or a binding quote. Every project is confirmed in a written quote with a defined scope, price and timeline, and a written agreement where needed. Estimates are valid for 30 days.</p>
          <p>{SITE.name} is not VAT registered, so no VAT is added to any price. All prices are in South African rand.</p>

          <h2>Our work and content</h2>
          <p>The text, design and code of this website belong to {SITE.name} unless stated otherwise. Client project screenshots are shown with permission and remain the property of their owners. Ownership of work we build for clients is set out in each client’s quote or agreement.</p>

          <h2>Community wall</h2>
          <p>Anyone may leave a note on the community wall. By posting, you confirm the note is your own and give us permission to show it on this website. We read every note before it is published, and we may decline or remove any note at our discretion, including notes that are unkind, misleading, promotional or that share personal details. To have your note removed, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>

          <h2>Trading software</h2>
          <p>MQL5 trading bots and indicators are software built to your instructions. We do not provide financial advice and make no promise about trading results. Past performance and backtests do not guarantee future results.</p>

          <h2>Limitation of liability</h2>
          <p>We work hard to keep this website accurate and available, but we provide it “as is”. To the extent the law allows, we are not liable for loss arising from using the website or relying on an estimate. Nothing here limits rights you have under the Consumer Protection Act.</p>

          <h2>Links</h2>
          <p>Links to other websites are provided for convenience. We are not responsible for their content.</p>

          <h2>Law</h2>
          <p>These terms are governed by the laws of the Republic of South Africa.</p>

          <h2>Contact</h2>
          <p><a href={`mailto:${SITE.email}`}>{SITE.email}</a> · WhatsApp {SITE.phoneDisplay}</p>
        </div>
      </section>
    </>
  )
}
