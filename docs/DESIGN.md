# TshedzaWebDev: design specification

> **v2 decision, 30 Oct 2026 (owner):** v1 was too plain for a company that sells digital craft. It borrowed BLR's "no motion" restraint, which suits a tutoring buyer, not ours. **The benchmark is now Vercel, Linear, Entelect and BBD.** That means a dark cinematic hero, motion and interactivity everywhere it shows craft, bento grids, product-grade UI visuals, marquees, cursor spotlights, and Knowledge Hub as a first-class section. These still apply: honest copy, real work only, no fake stats, performance (CSS/GPU animation, small client components), and `prefers-reduced-motion` honoured. §3.5 below is superseded by §3.6.

**Version:** 1.0 · 29 Oct 2026 · **Sister docs:** `QUOTE-ENGINE.md` · `../pricebook/pricebook.json`
**Lineage:** house standard = `blr-tutoring-service/Design.md` + `quote/docs/DESIGN_SYSTEM.md`; brand = `VAULT/Brand Bible.md`.

> **The 45-second rule.** A Pretoria business owner on an Android phone, on mobile data, decides in 45 seconds that TshedzaWebDev is **real, local, skilled and fairly priced**, then gets a quote or taps WhatsApp.
> **The craft rule.** A developer who builds good websites should open this one and notice the details: the type, the spacing, the states, the speed.

---

## 1. Brand foundation

| The brand IS | The brand IS NOT |
|---|---|
| A Pretoria studio run by a real person | A faceless "global digital agency" |
| Precise, considered, quietly confident | Loud, hype-driven, "🔥 limited time" |
| Honest: real work, real numbers, real prices | Inflated stats, invented testimonials |
| Faith-grounded, humble, warm | Boastful, performative |
| Editorial structure, product polish | Template sections, stock photos |

**Voice:** short sentences, specific nouns, plain verbs. No "world-class", no "empower", no "cutting-edge", no "synergy". Never explain what structure can show.
**Tagline:** *Crafting Exceptional Web Experiences* (Brand Bible).

## 2. Principles
1. **One job per section, one primary CTA per section.**
2. **Trust before delight.** Real screenshots, a real face and a real phone number beat any animation.
3. **Mobile is the canvas.** Designed at 380 px first.
4. **Respect the data plan.** Budget: ≤ 500 KB first view per page, LCP < 2.0 s on 4G, CLS < 0.05, no video backgrounds.
5. **Details are the product.** Every state (hover, focus, loading, error, empty, success) is designed. Nothing is default.
6. **No motion for motion's sake.**

## 3. Tokens (defined once in `src/styles/tokens.css`; Tailwind reads them)

### 3.1 Colour: 60 / 30 / 10
```
/* brand */
--navy-950: #06111F   /* deepest surfaces */
--navy-900: #0A1B2E   /* BRAND navy: dark sections, primary text on light */
--navy-800: #13283F
--navy-700: #1E3A57
--teal-500: #1DA1C2   /* BRAND teal: accent, links, focus */
--teal-600: #1586A3   /* teal hover on dark/teal fills (not for small text on light) */
--teal-700: #0F7590   /* teal TEXT on light: links, small accents (AA on card, paper and teal-100) */
--teal-100: #E3F4F8   /* soft fills, chips */
/* neutrals */
--ink:      #0A1B2E   /* = navy-900, body text */
--ink-2:    #3D4B5C   /* secondary text */
--ink-3:    #5F6B7A   /* captions (Paperlane muted) */
--paper:    #FAFAF7   /* page background, warm off-white */
--card:     #FFFFFF
--line:     #E4E7EC
--line-2:   #EEF0F3
/* signal (never decorative) */
--success:  #12805C   --success-tint: #E6F4EE
--warn:     #B45D2C   --warn-tint:    #FBEFE2
--danger:   #B42318   --danger-tint:  #FDECEA
```
Rules: teal covers ≤ 10% of any screen; it is never body text on navy below 18 px (contrast 5.1:1 at 14 px+ only); success, warn and danger appear only in states. **No gradient text. No new colours without adding them here.**

| Pair | Ratio | Use |
|---|---|---|
| ink / card | 17.37 | body |
| ink-2 / card | 8.90 | secondary |
| ink-3 / card · paper | 5.43 · 5.19 | captions |
| teal-700 / card · paper · teal-100 | 5.29 · 5.06 · 4.68 | links, small accents, chip text |
| teal-500 / card | 3.03 ❌ | **never** text on light; large graphics/borders only |
| white / navy-900 | 17.37 | text on dark |
| teal-500 / navy-900 | 5.73 | accents on dark |
| navy-950 / teal-500 | 6.26 | accent-button label |
| danger · success · warn / card | 6.57 · 4.92 · 4.62 | state text |
*(Computed with the WCAG 2.x formula on 29 Oct 2026.)*

### 3.2 Typography: three families, each with one job
| Token | Family | Job |
|---|---|---|
| `--font-sans` | **Geist** 400–700 | All UI, body and headings |
| `--font-serif` | **Instrument Serif** italic | One editorial accent per section (an `<em>` in a headline, a pull-quote). Never a paragraph. |
| `--font-mono` | **Geist Mono** 400–600 | Eyebrows, labels, prices, quote numbers, data |

All three are verified on Google Fonts (HTTP 200, 29 Oct 2026) and self-hosted at build time via `next/font` (no runtime Google request, `display: swap`, metric-matched fallbacks, so zero CLS).

Scale (fluid, 4 sizes per screen max):
| Role | Size | Weight | LH | Tracking |
|---|---|---|---|---|
| Display | `clamp(2.5rem, 6vw + 1rem, 5.25rem)` | 600 | 1.0 | -0.035em |
| H2 | `clamp(1.75rem, 2.5vw + 1rem, 2.75rem)` | 600 | 1.1 | -0.025em |
| H3 | 1.25rem | 600 | 1.3 | -0.01em |
| Body | 1.0625rem (17 px) | 400 | 1.6 | 0 |
| Small | 0.9375rem | 400 | 1.55 | 0 |
| Eyebrow (mono) | 0.75rem | 500 | 1.4 | 0.12em, uppercase |
Body never below 16 px on mobile. Numbers use `font-variant-numeric: tabular-nums`.

### 3.3 Space, radius, shadow
- **8-point grid:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Section rhythm: 64 px mobile, 112 px desktop.
- **Container:** 1200 px max; gutters 20 px mobile, 32 px desktop.
- **Radii:** sm 8 (chips, inputs), md 14 (cards), lg 24 (big panels), pill 999 (buttons). Never mix radii inside one card.
- **Shadows (navy-tinted, never black):** `--shadow-sm: 0 1px 2px rgba(10,27,46,.06), 0 2px 8px rgba(10,27,46,.04)`; `--shadow-md: 0 8px 28px -12px rgba(10,27,46,.18)`; `--shadow-lg: 0 24px 64px -24px rgba(10,27,46,.28)`. Max 2 levels on a screen.

### 3.4 Icons and imagery
- **Inline SVG icons only**, 1.75 stroke, `currentColor`, 20/24 px. No icon fonts, no Font Awesome, no emoji as icons.
- **Real imagery or none:** project screenshots in device frames (phone and browser chrome drawn in CSS), and the founder's photo. **No stock photography. No illustrations of people at laptops.**
- All images WebP/AVIF with `width`/`height`, `sizes`, `loading="lazy"` below the fold, under 120 KB each.

### 3.5 Motion
Allowed: fade-up 12 px / 500 ms / `cubic-bezier(.2,.7,.2,1)` on first reveal (IntersectionObserver, once); hover lift −2 px + `--shadow-md` (200 ms); accordion height (250 ms); quote-total count-up (≤ 400 ms, the one deliberate "peak"); focus ring transitions.
Forbidden: parallax, 3D, bouncy easing, auto-rotating carousels, animated stat counters, scroll-jacking, video backgrounds. **`prefers-reduced-motion: reduce` turns off all reveal and transition motion.**

### 3.6 Motion v2 (supersedes §3.5)
**Use:** an animated hero background (perspective grid + aurora, GPU transforms only); a rotating hero word; an auto-playing "studio console" demo; marquees; cursor-follow spotlight on cards; animated gradient borders on key CTAs; staggered scroll reveals (CSS scroll-driven); a live-animating price calculator; chat messages animating in; hover lifts and tilts.
**Never:** scroll-jacking, auto-advancing content the user must read to proceed, layout-shifting animation, video backgrounds, any animation when `prefers-reduced-motion: reduce` is set (then everything renders in its final state).

## 4. Components
- **Button:** pill, 48 px tall (44 px minimum touch target), 600 weight. Variants: `primary` (navy-900 bg, white), `accent` (teal-500 bg, navy-950 text; one per page, the quote CTA), `secondary` (card bg, ink, line border), `ghost`, `on-dark`. States: hover, active (scale .98), focus-visible (2 px teal ring, 2 px offset), disabled, loading (spinner + "Working…", width locked).
- **Link:** teal-700, underline offset 3 px, thickness 1 px → 2 px on hover.
- **Card:** card bg, line border, md radius, 24 px padding; interactive cards lift.
- **Chip/badge:** mono 12 px, sm radius, teal-100/teal-700 or line/ink-3.
- **Inputs:** 48 px, paper fill, line border, sm radius; focus = teal border + 3 px teal/15% ring; labels above, always visible; helper and error text below (danger, with icon; `aria-describedby`). Never placeholder-as-label.
- **Choice tiles** (quote builder): big tappable cards with icon, title and one line; selected = navy border + teal check; keyboard = radio group semantics.
- **Stepper** (quote builder): numbered mono steps, the current one in navy, a progress bar with `aria-valuenow`.
- **Accordion:** native `<details>`, first item open.
- **Header:** sticky, 64 px, translucent paper with a backdrop blur only after scroll; wordmark left (text only: there is no icon mark, so do not invent one), nav centre, "Get a quote" accent right; on mobile a full-screen sheet menu (focus-trapped, Esc closes).
- **Footer:** navy-950. Brand block, services, company, contact (WhatsApp, email, Pretoria), legal, "Not VAT registered · All prices in ZAR".
- **Consent banner:** bottom sheet, equal-weight "Accept" / "Reject" buttons, a "Settings" link; nothing tracks until Accept; the choice is remembered for 12 months and can be changed from the footer.

## 5. Accessibility (WCAG 2.2 AA, verified before launch)
One H1 per page, sequential headings; landmarks; a skip link; visible `:focus-visible` everywhere; keyboard-complete flows (quote builder included); `aria-live` for quote totals and form status; labels on every input; alt text on every image (empty alt for decorative ones); colour never carries meaning alone; touch targets ≥ 44 px; reduced motion honoured; the language set to `en-ZA`.

## 6. Anti-patterns (will never appear)
Animated number counters · auto-rotating sliders · stock photos · gradient text · glassmorphism on light backgrounds · "🔥 Limited time" bars · fake reviews or star ratings · a chat bubble covering the content on mobile (Tidio loads only after consent and only on desktop, or behind a WhatsApp-first button) · icon fonts · Tailwind Play CDN · more than one accent CTA per screen.

## 7. Definition of done (per page)
- [ ] Responsive at 375 / 768 / 1280 / 1920; no horizontal scroll
- [ ] Lighthouse ≥ 95 in all four categories on mobile
- [ ] ≤ 500 KB first view; LCP < 2.0 s; CLS < 0.05
- [ ] Zero console errors; zero broken links (checked automatically)
- [ ] `tsc --noEmit` and ESLint clean
- [ ] Every interactive element has hover, focus, active and disabled states; every async action has loading, error and success states
- [ ] Title, description, canonical, OG/Twitter card and JSON-LD present
- [ ] Rendered and visually inspected at every breakpoint before it ships

### 3.7 Liquid glass (added 30 Oct 2026)

- `.glass` is for dark surfaces and `.glass-light` for light ones. The specular sheen follows the pointer when wrapped in `<Spotlight>`.
- `.glass-nav` is the header's floating pill after scroll.
- **Never nest a blurred pane in a blurred pane.** Chrome can't blur through a blurred parent, so inner panes use `.glass-inset`, which keeps the rim and sheen but has no backdrop-filter.
- Glass needs colour behind it. Light sections use `canvas-tint` plus `<LiquidField>`: slowly morphing blobs, which stop under reduced motion. The page background also carries a faint fixed colour wash.
- Browsers without backdrop-filter fall back to near-solid panes, so text stays readable.
- `.btn-on-dark` and `.btn-secondary` are liquid buttons with a light sweep on hover. All buttons lift 1px on hover and press to 0.97.
