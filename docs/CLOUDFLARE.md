# Moving off the hosting provider: GitHub + Cloudflare

**Decision (8 Nov 2026, owner):** host everything on GitHub and Cloudflare and cancel the cPanel hosting.

| Part | Before | After |
|---|---|---|
| Code | GitHub | GitHub (unchanged) |
| Website | GitHub Pages preview / cPanel | **Cloudflare Pages**, deployed by `.github/workflows/cloudflare.yml` |
| API (quotes, PDFs, contact, wall) | PHP on cPanel (never deployed) | **Cloudflare Worker** `worker/` + **D1** database |
| Emails the site sends | cPanel `mail()` | **Resend** (free tier), sending as info@tshedzawebdev.co.za |
| DNS | Hosting provider (`ns3/ns5.za-dns.com`) | **Cloudflare** |
| Mailbox info@tshedzawebdev.co.za | cPanel | **Cloudflare Email Routing** → the owner's inbox (see step 5) |
| Domain registration | Hosting provider | Stays with a `.co.za` registrar (Cloudflare can't register `.co.za`). Keep it as a domain-only product. |

The order matters: nothing visitors use goes down at any point.

## 1. Back up the old hosting (owner, before anything is cancelled)
- In cPanel → Backup, download a **full backup**: files, databases, email.
- Export every mailbox you want to keep (for example through Gmail's "Import mail" over IMAP, or a mail client).
- Keep the backup somewhere other than the hosting account.

## 2. Connect Cloudflare (owner + Claude)
1. Run `npx wrangler login` in `worker/` and approve it in the browser.
2. Create the database, then put its id in `worker/wrangler.toml`:
   - `npx wrangler d1 create tshedzawebdev`
   - `npm run db:remote`
3. Set the API's secrets:
   - `npx wrangler secret put IP_SALT` and `npx wrangler secret put WALL_SECRET` (random 64 characters each)
   - `npx wrangler secret put RESEND_API_KEY` (from resend.com, step 4)
4. Create the website project: `npx wrangler pages project create tshedzawebdev --production-branch main`.
5. In GitHub → Settings → Secrets and variables → Actions:
   - **Secrets:** `CLOUDFLARE_API_TOKEN` (a token with Workers Scripts, D1, Cloudflare Pages and Workers Routes: Edit) and `CLOUDFLARE_ACCOUNT_ID`.
   - **Variable:** `CLOUDFLARE_READY = true`.
   From then on, every push deploys the site and the API to Cloudflare, and the GitHub Pages preview stops.

## 3. Move DNS to Cloudflare (owner)
1. In Cloudflare: **Add a site** → `tshedzawebdev.co.za` → Free plan. It imports the existing records.
2. Check the imported records against the list below, then copy Cloudflare's two nameservers.
3. At the registrar, replace `ns3/ns5.za-dns.com` with Cloudflare's nameservers. The switch takes a few hours, up to 48.

At this point the old records still point at the old server, so the website and email keep working while DNS moves.

Records as of 8 Nov 2026 (public lookup):

| Record | Value |
|---|---|
| Apex `A` and `www` | 164.160.91.57 (old server) |
| `mail`, `webmail`, `cpanel` `A` | 164.160.91.57 |
| `MX` | 0 `mail.tshedzawebdev.co.za` |
| `TXT` (SPF) | `v=spf1 +a +mx +ip4:164.160.91.57 include:spf.zamailgate.com ~all` |

## 4. Switch the website and API (Claude, once the zone is active)
1. **Website:** in Pages → Custom domains, add `tshedzawebdev.co.za` and `www.tshedzawebdev.co.za`. Cloudflare replaces the old `A` records.
2. **API:** in `worker/wrangler.toml`, uncomment the `routes` line for `api.tshedzawebdev.co.za` and push. Wrangler creates the DNS record.
3. **Sending email:** in resend.com, add the domain and create the DKIM, SPF and return-path records it asks for, in Cloudflare.
4. **Privacy Policy:** update the "Who processes it for us" list: Cloudflare (hosting, API and database), Resend (email delivery), PostHog and Tidio (with consent).

## 5. Switch email (owner chooses, Claude sets up)
- **Inbound:** Cloudflare Email Routing forwards `info@tshedzawebdev.co.za` to an inbox you already use. It's free.
- **Replying as info@:** in Gmail → "Send mail as", use Resend's SMTP (`smtp.resend.com`).
- **Before the switch:** replace the old `MX` and the old SPF with Cloudflare's, only after the mailbox export in step 1 is done.

## 6. Cancel the hosting (owner, after a week of everything working)
- Check: site, quote PDF, contact form, wall approval email, inbound mail, and replies from info@.
- Then cancel the hosting plan and keep the domain registration.
- **Delete `api/` (the PHP API) from the repo.** It's superseded by `worker/`.

## Local development
- **Site:** `cd web && npm run dev`.
- **API:**
  1. `cd worker && npm run db:local`, then `npm run dev`. This serves `http://127.0.0.1:4730`; emails go to the local `outbox` table.
  2. `node --experimental-strip-types test/e2e.ts` runs the 22 end-to-end checks.
- **Pointing the site at the local API:** start the site with `NEXT_PUBLIC_API_BASE=http://127.0.0.1:4730`.
