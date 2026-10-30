import { PageHero } from '@/components/PageHero'
import { pageMeta } from '@/lib/meta'
import { SITE } from '@/lib/site'

export const metadata = pageMeta('/privacy/', 'Privacy policy (POPIA)', 'How TshedzaWebDev collects, uses and protects personal information under the Protection of Personal Information Act (POPIA).')

const UPDATED = '30 October 2026'

export default function PrivacyPage() {
  return (
    <>
      <PageHero compact eyebrow="Legal" title="Privacy policy" lede={`How we handle your personal information, in plain language. Last updated ${UPDATED}.`} />
      <section className="container-site pb-24 pt-14">
        <div className="prose-legal">
          <p><strong>{SITE.name}</strong> (“we”, “us”) is the responsible party for personal information collected on {SITE.url.replace('https://', '')}. We process personal information in line with the Protection of Personal Information Act 4 of 2013 (POPIA). Questions or requests: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>

          <h2 id="what">What we collect, and why</h2>
          <table>
            <thead><tr><th>When</th><th>What</th><th>Why</th></tr></thead>
            <tbody>
              <tr><td>Instant quote (“email me this estimate”)</td><td>Name, email, optional WhatsApp number, business name and notes, your project selections, and the date and wording of your consent</td><td>To prepare and email your estimate, and to contact you about it</td></tr>
              <tr><td>Contact form</td><td>Name, email, optional WhatsApp number and your message</td><td>To reply to you</td></tr>
              <tr><td>WhatsApp or email you send us</td><td>What you choose to share</td><td>To respond and, if you become a client, to deliver your project</td></tr>
              <tr id="wall"><td>Community wall note</td><td>Your note, and the first name and town or role you choose to add (both optional), plus the date</td><td>To show your note publicly on the wall, after we have read it</td></tr>
              <tr><td>Analytics and chat (only if you accept)</td><td>Pages visited, device and browser information, and chat messages you send</td><td>To understand which pages help people, and to answer questions</td></tr>
            </tbody>
          </table>
          <p>We only collect what we need. We never sell personal information, and we never add you to marketing lists without your separate, explicit consent.</p>

          <h2 id="cookies">Cookies, analytics and chat</h2>
          <p>The site works without any tracking. When you first visit, we ask for your choice. <strong>Nothing loads until you choose “Accept”.</strong> If you accept:</p>
          <ul>
            <li><strong>PostHog</strong> (analytics) records page views and how the site is used, so we can improve it. PostHog stores data on servers in the United States.</li>
            <li><strong>Tidio</strong> (live chat) loads on larger screens so you can message us from the page.</li>
          </ul>
          <p>Your choice is saved in your browser for 12 months. Change it at any time with <strong>“Cookie settings”</strong> in the footer. If you reject, we store only your choice itself.</p>

          <h2 id="sharing">Who processes it for us</h2>
          <p>We use trusted operators who process information on our instructions: our web host (for the website, forms and email), PostHog (analytics, with consent) and Tidio (chat, with consent). Where an operator stores information outside South Africa, we rely on your consent and on the operator’s data-protection commitments, as POPIA section 72 allows.</p>

          <h2 id="retention">How long we keep it</h2>
          <ul>
            <li>Estimate and contact enquiries: <strong>24 months</strong>, then deleted, unless you become a client.</li>
            <li>Client records (quotes, invoices, project communication): as long as tax and accounting law requires.</li>
            <li>Community wall notes: published notes stay on the wall until you ask us to remove them. Notes we do not publish are deleted after 30 days. Hearts are counted against a scrambled code, never your IP address.</li>
            <li>Analytics data: according to PostHog’s retention settings for our account.</li>
          </ul>

          <h2 id="security">How we protect it</h2>
          <p>Forms are sent over encrypted connections (HTTPS), stored with restricted access, and protected against spam and abuse. We do not put personal information in web addresses or analytics events.</p>

          <h2 id="rights">Your rights</h2>
          <p>You may ask us what personal information we hold about you, ask us to correct or delete it, object to processing, or withdraw consent at any time. Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and we will respond within a reasonable time.</p>
          <p>If you are not satisfied, you may complain to the Information Regulator (South Africa): <a href="https://inforegulator.org.za" rel="noopener">inforegulator.org.za</a>.</p>

          <h2 id="changes">Changes</h2>
          <p>If we change how we handle personal information, we will update this page and the date above.</p>
        </div>
      </section>
    </>
  )
}
