# tshedzawebdev.co.za: rebuild

The public website for TshedzaWebDev, rebuilt to the house standard (`docs/DESIGN.md`). It replaces the 2024–25 site.

**Preview:** https://sudo-tm12.github.io/tshedzawebdev-site/ (GitHub Pages, deployed by `.github/workflows/pages.yml` on every push to `main`).

| Folder | What it is |
|---|---|
| `web/` | The site: Next.js 16 static export, TypeScript (strict), Tailwind 4. Builds to `web/out/` (plain files). |
| `api/` | The only server code: PHP 8.1 API for the instant quote (server-verified estimate, PDF, email) and the contact form. Deploys to `api.tshedzawebdev.co.za` on cPanel. |
| `pricebook/pricebook.json` | **The single source of truth for prices.** It is synced into `web/` and `api/` on every build. Currently a **draft**, awaiting approval. |
| `docs/` | `DESIGN.md` (design system), `QUOTE-ENGINE.md` (quote spec). |
| `FINDINGS.md`, `audit-frontend.md`, `REBUILD_PLAN.md` | Private, local only (git-ignored): the audit of the old site and the rebuild plan. |
| `public_html/` | Read-only copy of the OLD live site (reference only; contains live credentials, so it is never deployed or committed). |
| `assets-src/`, `qa/` | Raw screenshots and QA captures. |

## Commands (run in `web/`)
```bash
npm run dev        # local dev server
npm run build      # static build → web/out (also writes redirect stubs + CNAME, then checks every link)
# GitHub Pages preview build (served from a sub-folder; no CNAME):
# NEXT_PUBLIC_BASE_PATH=/tshedzawebdev-site npm run build
npm test           # quote-engine acceptance tests (TypeScript)
npm run parity     # proves the PHP engine == the TypeScript engine on 500 random quotes (uses ../.tools/php81)
npm run typecheck && npm run lint
```

## Quality gates (as of 29 Oct 2026)
- 26 pages + 5 redirect stubs; **0 broken links** (1 260 checked); TypeScript and ESLint clean
- Quote engine: 8/8 acceptance tests; **TS ↔ PHP parity 500/500**
- API: 13/13 behaviour cases. Covered: tampered price → 409; missing consent → 422; honeypot; bad origin → 403; rate limit → 429; real CRLF header injection neutralised.
- Real-browser end-to-end quote flow: validation errors → submit → `EST-2026-0004` stored, PDF emailed (outbox)
- No horizontal scroll at 390 px on any page; 0 console errors; CLS 0
- Weight: ~200 KB JS+CSS gzipped for the whole site (old homepage: 11.5 MB)

## Before launch (owner)
1. **Approve `pricebook/pricebook.json`** (every number is a draft anchored on real quotes).
2. **Give the API its own new database and user.** Do not reuse the old site's database user.
3. Decide what happens to the old client portal (`login.php` etc.). Once the domain points to the new static host, those PHP pages stop being reachable at `tshedzawebdev.co.za`. Options: move them to `portal.tshedzawebdev.co.za` on cPanel, or retire them until the Knowledge Hub platform replaces them.

## Deploy (outline)
1. **API** (cPanel):
   - create the subdomain `api.tshedzawebdev.co.za` with its document root at `…/api/public`
   - create a new MySQL DB and user, then run `api/schema.sql`
   - upload `api/` and copy `config.example.php` to `config.php` with real values, kept outside `public/`
   - test with a real send to your own inbox
2. **Site**:
   - **Now:** GitHub Pages preview, built and deployed automatically on every push to `main` (`.github/workflows/pages.yml`)
   - **Going live:** clear `BASE_PATH` in the workflow (the build then writes `CNAME` for tshedzawebdev.co.za) and point DNS at GitHub Pages, or use **Cloudflare Pages**, which is free, allows commercial use and is already your DNS provider
3. **DNS** (Cloudflare):
   - point the apex and `www` at the static host
   - keep `api` (and `mail`, and the MX/SPF/DKIM records) pointing at the cPanel server, so email keeps working

## Community wall (`/wall/`)

- Visitors post short notes (280 characters; name and town optional). Notes are **pending** until approved.
- Each new note emails `owner_email` with **Approve** / **Reject** links. The link opens a confirm page and nothing changes until you press the button, so email scanners can't approve anything by accident.
- The API blocks links, email addresses and phone numbers, and allows 3 notes per visitor per hour. Hearts are one per visitor per note.
- Unpublished notes are deleted after 30 days. Published notes stay until removed: set `status = 'rejected'` in phpMyAdmin.
- **Setup:** run the `wall_notes` / `wall_hearts` part of `api/schema.sql`. Add `api_public_url` and a new random `wall_secret` to `api/config.php`, as in `config.example.php`.
