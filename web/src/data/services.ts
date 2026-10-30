// Service content. Scope comes from VAULT/Brand Bible.md and VAULT/Services/*.md.
// Prices are never written here: they come from pricebook.json via the quote engine.
import type { IconName } from '@/components/Icon'

export interface Service {
  slug: string
  pricebookId: string
  name: string
  short: string
  icon: IconName
  headline: string
  headlineAccent: string
  intro: string
  forWho: string[]
  outcomes: { title: string; body: string }[]
  included: string[]
  process: { title: string; body: string }[]
  faq: { q: string; a: string }[]
  note?: string
}

const PROCESS_BUILD = [
  { title: 'Discovery call', body: 'Twenty minutes on WhatsApp or Meet. We learn your business, your customers and what success looks like.' },
  { title: 'Written quote', body: 'A clear scope, a fixed price in rand and a timeline. No surprises later.' },
  { title: 'Design, then build', body: 'You see the design before code. Then we build it, with check-ins you can actually follow.' },
  { title: 'Launch and hand-over', body: 'We go live, check everything on real phones, and show you how to run it.' },
]

export const SERVICES: Service[] = [
  {
    slug: 'websites',
    pricebookId: 'website',
    name: 'Websites',
    short: 'Fast, mobile-first business websites that turn visitors into enquiries.',
    icon: 'monitor',
    headline: 'A website that works',
    headlineAccent: 'as hard as you do.',
    intro: 'Most of your customers will meet you on a phone, on mobile data, in a hurry. We design for that moment: quick to load, clear about what you do, and one tap away from WhatsApp.',
    forWho: ['Service businesses that live on enquiries', 'Professionals who need to look credible fast', 'Businesses replacing an old, slow or template site'],
    outcomes: [
      { title: 'Loads fast on mobile data', body: 'Lightweight pages, optimised images and no bloat, so people stay long enough to contact you.' },
      { title: 'Clear in five seconds', body: 'What you do, who it is for and how to reach you, before anyone has to scroll.' },
      { title: 'Found on Google', body: 'Clean structure, metadata and a sitemap from day one, so search engines understand you.' },
      { title: 'Yours to run', body: 'You own the domain, the content and the code. We hand over everything.' },
    ],
    included: ['Mobile-first design', 'Contact and WhatsApp click-to-chat', 'On-page SEO foundations', 'Speed optimisation', 'Privacy policy page (POPIA)', 'Launch support'],
    process: PROCESS_BUILD,
    faq: [
      { q: 'How long does a website take?', a: 'A landing page is usually live within a week. A typical five-page business site takes about two weeks once we have your content.' },
      { q: 'Do I need to write the content?', a: 'You know your business best, so we start with your words. If writing is not your thing, add copywriting to the quote and we write it with you.' },
      { q: 'Can I update the site myself?', a: 'Yes. Add a blog/CMS if you want to edit pages yourself, or take the care plan and send us changes on WhatsApp.' },
    ],
  },
  {
    slug: 'ecommerce',
    pricebookId: 'ecommerce',
    name: 'Online stores',
    short: 'Sell online with South African payments, delivery rules and order alerts.',
    icon: 'bag',
    headline: 'An online store',
    headlineAccent: 'built for South African buyers.',
    intro: 'Local payment gateways, courier rules that make sense, and a checkout that works on a budget phone. Your store should make buying easy and admin light.',
    forWho: ['Boutiques and clothing brands', 'Makers and resellers moving off Instagram DMs', 'Businesses adding online orders to a physical shop'],
    outcomes: [
      { title: 'Payments that just work', body: 'PayFast or Yoco, cards and instant EFT, set up and tested with real transactions.' },
      { title: 'Less admin', body: 'Order emails, stock levels and optional WhatsApp alerts, so nothing slips through the cracks.' },
      { title: 'Delivery that makes sense', body: 'Courier and collection options with clear rules by area.' },
      { title: 'Room to grow', body: 'Discounts, product variants and reporting when you need them.' },
    ],
    included: ['Product catalogue + categories', 'Secure local checkout', 'Order confirmation emails', 'Mobile-first store design', 'SEO for product pages', 'Hand-over training'],
    process: PROCESS_BUILD,
    faq: [
      { q: 'Which payment gateways do you use?', a: 'Mostly PayFast and Yoco for South African stores. We will help you choose based on fees and how your customers like to pay.' },
      { q: 'Can you load my products?', a: 'Yes. Add product loading to your quote, and send us the photos, names and prices in a spreadsheet.' },
      { q: 'Do I pay monthly platform fees?', a: 'That depends on the platform we agree on. Your quote spells out every recurring cost before we start.' },
    ],
  },
  {
    slug: 'web-apps',
    pricebookId: 'webapp',
    name: 'Web apps & systems',
    short: 'Custom MERN apps, client portals and dashboards that run your operations.',
    icon: 'layers',
    headline: 'Software shaped',
    headlineAccent: 'around how you actually work.',
    intro: 'When spreadsheets and WhatsApp groups start running the business, it is time for a system. We build focused web apps with real logins, real databases and the one workflow that matters most, then grow from there.',
    forWho: ['Businesses outgrowing spreadsheets', 'Service providers who need a client portal', 'Founders who need a working MVP'],
    outcomes: [
      { title: 'One source of truth', body: 'Your data in one secure place instead of ten spreadsheets.' },
      { title: 'Roles and permissions', body: 'The right people see the right things.' },
      { title: 'Integrations', body: 'Payments, email, WhatsApp and third-party APIs connected properly.' },
      { title: 'Built to last', body: 'Documented, typed code you can hand to any developer later.' },
    ],
    included: ['Product scoping workshop', 'Authentication + roles', 'Database design', 'Admin area', 'Deployment + monitoring', 'Technical documentation'],
    process: PROCESS_BUILD,
    faq: [
      { q: 'What stack do you use?', a: 'Mostly MongoDB/Postgres, Express or Next.js, React and Node, picked for your project rather than habit. You get the code and the documentation.' },
      { q: 'Can you start with a small version?', a: 'That is the recommended path: an MVP with the core workflow, live with real users, then improvements based on what they actually do.' },
    ],
  },
  {
    slug: 'automation',
    pricebookId: 'automation',
    name: 'Automation',
    short: 'Python and AI workflows that take repetitive work off your plate.',
    icon: 'zap',
    headline: 'Hours back,',
    headlineAccent: 'every single week.',
    intro: 'Copying data between systems, chasing documents, building the same report every Monday: if a task follows rules, it can probably run itself. We build reliable automations, with a human check where it matters.',
    forWho: ['Teams drowning in manual admin', 'Businesses that need data from the web', 'Anyone building the same report every week'],
    outcomes: [
      { title: 'Repetitive work, gone', body: 'Forms to spreadsheets to emails, reminders and follow-ups that run on schedule.' },
      { title: 'Data you can use', body: 'Scraping, cleaning and scheduled reporting with Python.' },
      { title: 'AI with a human check', body: 'AI drafting and classification where it saves time, with review steps where accuracy matters.' },
      { title: 'POPIA-aware', body: 'Personal information handled lawfully, and only what the workflow needs.' },
    ],
    included: ['Workflow mapping', 'Build + testing on your real data', 'Error alerts', 'Hand-over documentation', 'Team training'],
    process: PROCESS_BUILD,
    faq: [
      { q: 'What can be automated?', a: 'Anything that follows clear rules: moving data between tools, reminders, document generation, reports and web data collection. If it needs judgment, we add a human approval step.' },
      { q: 'Do you scrape personal data?', a: 'No. We only collect public business information, respect opt-outs, and follow POPIA.' },
    ],
  },
  {
    slug: 'seo-google-ads',
    pricebookId: 'seo',
    name: 'SEO & Google Ads',
    short: 'Get found on Google, then measure exactly what it brings in.',
    icon: 'search',
    headline: 'Be found',
    headlineAccent: 'when people are searching.',
    intro: 'Most buying journeys start with a search. We fix the technical foundations that hold sites back, sharpen how you appear on Google, and run ad campaigns with tracking that shows what each rand returns.',
    forWho: ['Local businesses that need more calls', 'Sites with traffic but no enquiries', 'Owners spending on ads without clear results'],
    outcomes: [
      { title: 'A clear audit', body: 'Prioritised fixes in plain language, not a 90-page export.' },
      { title: 'Technical health', body: 'Speed, structure, schema and Search Console set up properly.' },
      { title: 'Ads that are measured', body: 'Conversion tracking first, then campaigns. Ad spend is paid directly to Google.' },
      { title: 'Local visibility', body: 'Google Business Profile set up and optimised for your area.' },
    ],
    included: ['Keyword + competitor review', 'On-page and technical fixes', 'Conversion tracking', 'Monthly reporting'],
    process: PROCESS_BUILD,
    faq: [
      { q: 'Is ad spend included?', a: 'No. Ad spend is paid directly to Google from your own account. Our fee covers setup and management.' },
      { q: 'How soon will I rank?', a: 'Technical fixes help quickly. Organic rankings usually take months. Anyone who promises page one in a week is guessing.' },
    ],
  },
  {
    slug: 'social-media',
    pricebookId: 'social',
    name: 'Social media',
    short: 'Combined design and management packages, done for you every month.',
    icon: 'megaphone',
    headline: 'Show up consistently',
    headlineAccent: 'without living on your phone.',
    intro: 'A content plan, designed posts and steady management, so your brand looks the same on every platform and you can get back to running the business.',
    forWho: ['Owners with no time to post', 'Brands that look inconsistent across platforms', 'Businesses launching something new'],
    outcomes: [
      { title: 'A monthly plan', body: 'A content calendar agreed upfront, so there are no last-minute scrambles.' },
      { title: 'On-brand design', body: 'Posts and short videos that look like one brand.' },
      { title: 'Community care', body: 'Comments and messages answered in your voice.' },
      { title: 'Honest reporting', body: 'What worked, what did not, and what we change next month.' },
    ],
    included: ['Content calendar', 'Post design', 'Scheduling + publishing', 'Monthly report'],
    process: [
      { title: 'Brand check', body: 'We review your current profiles, audience and goals.' },
      { title: 'Plan', body: 'A month of content ideas for your approval.' },
      { title: 'Create + publish', body: 'Designed, written and scheduled.' },
      { title: 'Review', body: 'Monthly results and adjustments.' },
    ],
    faq: [
      { q: 'Is there a minimum term?', a: 'We agree the term with you in writing before we start. Social media needs a few consistent months to show results, so we will be honest about what to expect.' },
      { q: 'Is ad spend included?', a: 'No. If we run paid campaigns, the ad spend is paid to the platform directly and listed separately in your quote.' },
    ],
  },
  {
    slug: 'trading-bots',
    pricebookId: 'trading',
    name: 'MQL5 trading bots',
    short: 'Expert Advisors and indicators for MetaTrader 5, built from your rules.',
    icon: 'chart',
    headline: 'Your strategy,',
    headlineAccent: 'executed without hesitation.',
    intro: 'If your trading follows clear rules, an Expert Advisor can apply them consistently, 24 hours a day. We turn your written strategy into tested MQL5 code, with proper risk management and a backtest report.',
    forWho: ['Traders with a defined, rules-based strategy', 'Traders who want indicator alerts on their phone', 'Anyone who wants an existing EA optimised'],
    outcomes: [
      { title: 'Rules made exact', body: 'We turn your strategy into precise entry, exit and risk logic.' },
      { title: 'Tested, not hoped', body: 'Backtesting and optimisation reports before anything trades live.' },
      { title: 'Risk built in', body: 'Position sizing, stop logic and daily limits as standard.' },
      { title: 'Alerts', body: 'Optional phone or Telegram alerts for signals and trades.' },
    ],
    included: ['Strategy specification', 'MQL5 build', 'Strategy-tester backtest', 'Source code + set files'],
    process: PROCESS_BUILD,
    faq: [
      { q: 'Will the bot make money?', a: 'We build software that follows your strategy. We do not give financial advice and cannot promise trading results. Past backtests do not guarantee future performance.' },
      { q: 'Do I get the source code?', a: 'Yes. You receive the .mq5 source and compiled files.' },
    ],
    note: 'We build software from your strategy. We do not give financial advice or promise trading results.',
  },
]

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug)
}
