# Instant quote engine: specification

**Page:** `/quote` (the site's primary conversion tool) · **Status:** spec v1, 29 Oct 2026
**Pattern:** our own quote-calculator method (a source-of-truth price book, server-verified maths, a PDF artefact, POPIA-grade lead capture). No client content is reused.
**Price data:** `pricebook/pricebook.json` (the single source of truth; draft until the owner approves).

## 1. Goal
A visitor who found us on Google gets an **honest ZAR estimate in under 60 seconds**, sees what drives the price, and receives a **branded PDF estimate** by email. We receive a qualified lead with everything needed to send a formal TWD quote. A visitor who doesn't want to give details still gets the on-screen estimate (no hard gate).

## 2. Flow (one page, five steps, progressive)
1. **What are we building?** Choice tiles: Website · Online store · Web app / system · Automation · SEO & Google Ads · Social media · MQL5 trading bot.
2. **Scope:** a tier (choice tiles with a one-line note) and a size stepper (pages / products / screens / workflows, using the service's `unit`, with min/max enforced).
3. **Extras:** add-on checkboxes (per-unit add-ons show their quantity live), monthly options and a priority-delivery toggle.
4. **Your estimate:** a range **R low – R high**, the line items, monthly costs, estimated timeline in weeks, and the deposit due to start. "What affects the final price" in plain language. Two actions: **Email me this estimate (PDF)** or **Chat on WhatsApp** (pre-filled message with the estimate reference).
5. **Details** (only for the PDF): name, email, WhatsApp number (optional), business name (optional), notes, and a POPIA consent checkbox (unticked) that reads *"I consent to TshedzaWebDev processing my personal information to prepare this estimate and contact me about it, in line with the Privacy Policy."*

The URL hash keeps the selections (no PII), so back/refresh never loses work and an estimate can be shared.
States: every step validates inline. Step 4 has a skeleton while recomputing. The send action has loading, error (retryable, no data loss) and success states. Totals change in an `aria-live="polite"` region.

## 3. Calculation (identical in TS and PHP; all integers in rand)
```
oneOff   = tier.base
         + max(0, units − tier.includedUnits) × tier.perUnit
         + Σ addon.price × (addon.per ? qty : 1)
         + Σ addon.priceRate × (tier.base + extra units)        // e.g. second language +25%
if priority: oneOff = oneOff × rules.rush.multiplier
monthly  = (tier.monthlyBase ?? 0) + Σ selected monthly items
low      = roundTo(oneOff × rangeLow, 50);  high = roundTo(oneOff × rangeHigh, 50)
deposit  = oneOff > depositThreshold ? roundTo(low × depositRate, 50) : 0
weeks    = max(1, ceil((tier.weeks + Σ addon.weeks) × (priority ? 0.6 : 1)))
```
Rounding: to the nearest R50. Display: `R 6 500` (en-ZA, no cents). **No VAT, ever** (the footer note on every PDF and page).

**Acceptance examples (pinned in tests):**
| Selection | One-off | Range | Deposit | Weeks |
|---|---|---|---|---|
| Website · Business site · 5 pages, nothing else | R 4 500 | R 4 050 – R 5 200 | R 2 050 | 2 |
| Website · Business site · 8 pages + booking + care | R 7 850 + R 350/mo | R 7 050 – R 9 050 | R 3 550 | 3 |
| Online store · Growth store · 60 products | R 6 500 | R 5 850 – R 7 500 | R 2 950 | 3 |
| Website · Landing page, priority | R 3 000 | R 2 700 – R 3 450 | R 0 (≤ R 3 000 threshold) | 1 |

## 4. Architecture
- **Front end** (static Next.js): `lib/quote/engine.ts` (a pure function), `lib/quote/schema.ts` (Zod) and `pricebook.json` imported at build. Results are instant with no network call.
- **API** (`api.tshedzawebdev.co.za`, PHP 8.1 on cPanel):
  - `POST /quote/send`
    - validates the payload, **recomputes the estimate from its own copy of `pricebook.json`**, and rejects mismatches
    - stores the lead in MySQL
    - generates a PDF (FPDF)
    - emails the client (PDF attached) and the owner (lead alert)
    - returns `{ ref: "EST-2026-0001" }`
  - `POST /contact`: the general contact form (same protections).
- **Protections:**
  - honeypot field
  - per-IP rate limits (5 sends/hour, 20 contacts/day)
  - an origin allow-list (CORS for the site domain only)
  - strict JSON schema
  - generic error messages
  - no PII in logs
  - prepared statements
  - SMTP send from `info@tshedzawebdev.co.za` (SPF/DKIM-aligned); the visitor only ever goes in Reply-To

## 5. Lead record (MySQL `leads`)
`id, ref, created_at, name, email, phone, business, notes, service_id, selection_json, one_off, monthly, low, high, deposit, weeks, pricebook_version, consent_at, consent_text_version, ip_hash, email_client_sent, email_owner_sent`
Retention: 24 months, then purged (documented in the Privacy Policy). Data-subject requests go to info@tshedzawebdev.co.za.

## 6. PDF estimate (A4, our brand)
Header: logo, "Project estimate", ref, date, valid for 30 days. Client block. A line-item table (description · qty · amount). Range box. Monthly items. Timeline. Deposit and payment terms ("50% deposit for projects over R3 000 · Not VAT registered · Banking details on the formal quote"). "What happens next" (a discovery call → a formal quote → the deposit → kickoff). Footer: contact, address region (Pretoria), POPIA line.

## 7. Done when
- [ ] The engine's TS and PHP outputs match for every acceptance example and 500 random selections (a parity test)
- [ ] Mismatched or tampered payloads are rejected by the API
- [ ] Keyboard-complete; screen-reader announces totals; works at 375 px with one thumb
- [ ] Every state is designed; no dead ends; the WhatsApp fallback always works, even if the API is down
- [ ] Consent is never pre-ticked; consent text version stored
- [ ] The PDF is rendered and visually checked; emails land in the inbox (not spam) from a real test
