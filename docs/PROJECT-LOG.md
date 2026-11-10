# Carinova Web — Project Log

Living record of what was decided and what changed. Newest entries first.
**Rule: every change to the site gets a line in the Changelog, and every decision gets a row in Decisions.**

## Snapshot

|                 |                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------- |
| Status          | v1 built and verified locally with placeholder content; not deployed                      |
| Stack           | Astro 7.3 (static output) · AstroWind template (MIT, commit `14e1a69`) · Tailwind CSS 4   |
| Node            | 26.x locally (Astro 7 needs ≥ 22.12; AstroWind needs ≥ 22.22.3); `.nvmrc` says 22         |
| Pages           | `/`, `/preguntas-frecuentes`, `/nosotros`, `/sucursales`, `/terminos`, `/privacidad`, 404 |
| Hosting         | Cloudflare Workers, static assets only; `npm run deploy` (see Hosting notes)              |
| Domain          | Not bought yet; `src/config.yaml` uses the placeholder `https://carinova.example`         |
| Search indexing | Off (`noindex`) and a "vista previa" banner on every page until the content is real       |

## Decisions

| ID    | Date       | Decision                                                                                                                                                                | Why                                                                                                                                                                                                                                                                                                                                    |
| ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-001 | 2026-11-08 | Astro 7, static output, no backend                                                                                                                                      | Ships no JS by default; competitors load 11.9 MB (Compras Express) and the site only needs marketing pages.                                                                                                                                                                                                                            |
| D-002 | 2026-11-08 | AstroWind template (`arthelokyo/astrowind`, MIT)                                                                                                                        | Already has the sections a courier landing page needs (FAQs, steps, pricing, CTA, testimonials) plus a finished blog; 98–99 mobile Lighthouse in the wild.                                                                                                                                                                             |
| D-003 | 2026-11-08 | WhatsApp-first conversion, one prefilled message per button                                                                                                             | That's how customers in Nicaragua contact couriers; the message text tells the team which button/page produced the lead.                                                                                                                                                                                                               |
| D-004 | 2026-11-08 | Vercel ruled out                                                                                                                                                        | Hobby plan is non-commercial only; would need Pro (~$20/mo).                                                                                                                                                                                                                                                                           |
| D-005 | 2026-11-09 | Template cloned with `git clone` (not `create-astro`) at commit `14e1a69` (2026-09-12)                                                                                  | `create-astro` could not resolve the template; the clone is the same files.                                                                                                                                                                                                                                                            |
| D-006 | 2026-11-09 | Dependencies installed with `npm install --ignore-scripts`                                                                                                              | Safer install (no package lifecycle scripts run); build and checks work without them.                                                                                                                                                                                                                                                  |
| D-007 | 2026-11-09 | Spanish only (`lang="es"`, `og:locale es_NI`), Spanish URLs                                                                                                             | Customers in Nicaragua and Nicaraguans in the US. English version is an open question.                                                                                                                                                                                                                                                 |
| D-008 | 2026-11-09 | Preview mode: `noindex` + visible "vista previa" banner                                                                                                                 | Placeholder prices/addresses must not be indexed or mistaken for real ones. Two switches to flip at launch.                                                                                                                                                                                                                            |
| D-009 | 2026-11-09 | Brand system: orange `#FA7005` buttons with navy text, blue `#053A86` for icons/links, navy `#011028` sections; Montserrat headings + Inter text                        | Colours sampled from the logo. White text on that orange is 2.9:1 (fails WCAG); navy on orange is 6.7:1. Montserrat is close to the logo wordmark. Fonts self-hosted via Astro's Fonts API.                                                                                                                                            |
| D-010 | 2026-11-09 | All business data in `src/data/carinova.ts` and `src/data/faq.ts`                                                                                                       | One place to edit prices, branches and messages; pages never disagree with each other.                                                                                                                                                                                                                                                 |
| D-011 | 2026-11-09 | Blog built but switched off (`apps.blog.isEnabled: false`); posts at `/blog/<slug>`, `/categoria/…`, `/etiqueta/…`                                                      | Turn it on once there are ~3 posts; a draft example post is in `src/data/post/`.                                                                                                                                                                                                                                                       |
| D-012 | 2026-11-09 | Store strip shows names, not logos                                                                                                                                      | The open icon set has no Amazon/Shein/Temu/Walmart/Best Buy logos, and store logos are trademarks. Real logo files can replace the names later.                                                                                                                                                                                        |
| D-013 | 2026-11-09 | Link prefetch on hover/touch instead of on viewport                                                                                                                     | Saves data for visitors on prepaid mobile plans.                                                                                                                                                                                                                                                                                       |
| D-014 | 2026-11-09 | Reviews section hidden until there are real reviews; no statistics                                                                                                      | No invented social proof.                                                                                                                                                                                                                                                                                                              |
| D-015 | 2026-11-09 | Removed Docker/nginx, Vercel, Decap CMS, StackBlitz/CodeSandbox files and the demo pages/posts; kept `netlify.toml` and `wrangler.jsonc`                                | Less to maintain; either host works without changes.                                                                                                                                                                                                                                                                                   |
| D-016 | 2026-11-09 | `.gitattributes` forces LF line endings                                                                                                                                 | Windows git (`core.autocrlf=true`) checked files out as CRLF and Prettier failed on all of them.                                                                                                                                                                                                                                       |
| D-017 | 2026-11-09 | Template changes: colour tokens are `@theme inline`; dark header is solid; open mobile menu is a full-screen overlay                                                    | Needed for navy sections inside a light page and for a bar above the header. Re-apply if the template is ever updated.                                                                                                                                                                                                                 |
| D-018 | 2026-11-09 | Host on Cloudflare Workers, serving `dist/` as static assets with no Worker script and no adapter; Wrangler is a dev dependency and `npm run deploy` builds and uploads | Chosen by the developer: domain, DNS and hosting in one Cloudflare account; requests to static assets are free and unlimited; closest edge to Nicaragua (see Hosting notes). Workers rather than Pages because the repo already had `wrangler.jsonc` and Cloudflare is merging Pages into Workers. `netlify.toml` stays as a fallback. |
| D-019 | 2026-11-09 | `assets.html_handling: "drop-trailing-slash"` in `wrangler.jsonc`                                                                                                       | Astro writes `nosotros/index.html`, but links, canonical URLs and the sitemap use `/nosotros`. Cloudflare's default (`auto-trailing-slash`) 307-redirected every page to `/nosotros/` in `wrangler dev`; now `/nosotros` is served directly and the slash forms redirect to it.                                                        |

## Changelog

### 2026-11-09 — Cloudflare deploy setup

- Added `wrangler` 4.159 as a dev dependency (installed with `--ignore-scripts`; it adds no `npm audit` findings) and a `deploy` script: `npm run build && wrangler deploy`.
- `wrangler.jsonc`: `html_handling: "drop-trailing-slash"` (D-019).
- `.wrangler/` (Wrangler's local state and temporary bundles) ignored in `.gitignore` and ESLint; otherwise `npm run check` lints it after a `wrangler dev`.
- Verified with `wrangler dev` (local Cloudflare runtime): every page returns 200 at its no-slash URL; `/x/` and `/x/index.html` 307 to `/x`; unknown URLs get the Spanish 404 page with status 404; `/_astro/*` gets `max-age=31536000, immutable` from `public/_headers`, HTML gets `max-age=0, must-revalidate`; the `_headers` file itself is not served. `wrangler deploy --dry-run`, `npm run build` and `npm run check` pass.
- Not deployed yet: the first deploy needs the developer's `wrangler login`.

### 2026-11-09 — v1 build (placeholder content)

- Scaffolded AstroWind; the untouched template built (39 pages, ~11 s).
- Removed the template demo (pages, posts, images, Docker/nginx, Vercel, Decap CMS, sandbox configs) and the template author's Google verification ID and X handle.
- Branding: colour tokens, Montserrat + Inter (self-hosted), "Carin◉va" wordmark component, favicons (SVG/ICO/Apple) and a 1200×630 share image generated from the logo by `scripts/brand-assets.mjs`.
- Navy header and footer, preview banner, floating WhatsApp button (switches to a branch menu when the branches have different numbers).
- Home page: hero + **quote calculator** (service, weight, pickup branch → estimate and a WhatsApp message containing the quote), store strip, 4-step "Cómo funciona", rate cards, "Por qué Carinova", branches, featured FAQ, closing call to action.
- Pages: `/preguntas-frecuentes` (14 questions in 5 topics, one FAQPage JSON-LD), `/nosotros` (story + values, drafts), `/sucursales` (LocalBusiness JSON-LD once the preview is off), `/terminos` and `/privacidad` (Spanish drafts), Spanish 404.
- Config: Spanish, light theme only, blog off, `noindex` during the preview, Organization/WebSite structured data.
- Fixed: navy sections rendered navy text (tokens resolved on `:root`) → `@theme inline`; mobile menu overlapping the logo below the preview banner; floating button covering the menu and the footer text; heading order on `/sucursales`.
- Verified: `npm run build` (7 pages, ~2 s), `npm run check` (0 errors), calculator tested in headless Chrome (rounding, minimum weight, service/branch switch, empty weight), screenshots at 412 px and 1280 px.
- Lighthouse mobile (local build): Performance 99, Accessibility 100, Best Practices 100 on every page; SEO 66 only because of the intentional `noindex`. Home: 153 KB, 8 requests, LCP 2.1 s, TBT 0 ms, CLS 0. For comparison, Compras Express: Performance 63, 11.9 MB, 106 requests, LCP 6.9 s.
- Created this log.

## Pending content from Carinova (blocks launch)

Every placeholder is marked `TODO` in `src/data/carinova.ts`, `src/data/faq.ts` and the pages (search for `TODO`).

- [ ] Services offered (online-shopping mailbox air/sea? family parcels from the US? Managua ⇄ Estelí shipping?). The copy currently assumes a Miami mailbox with air and sea service.
- [ ] Rates: price per lb (air/sea), minimum weight, rounding rule (now: each started pound bills as a full pound), volumetric weight divisor, storage fees
- [ ] Delivery times (air/sea)
- [ ] WhatsApp number(s), phone, email; per branch if they differ (the floating button then becomes a branch menu automatically)
- [ ] Branch addresses, references ("de la rotonda X, 2 c. al lago"), opening hours, Google Maps links
- [ ] Social media links (Facebook, Instagram, TikTok…)
- [ ] Policies used in the FAQ and terms: is opening a mailbox free? payment moment and methods, notifications, third-party pickup, storage period/fees, liability/insurance, prohibited-items list
- [ ] Real story and values for `/nosotros` (current text is a draft based on the logo symbols)
- [ ] Real customer reviews (Google)
- [ ] Logo as SVG or transparent PNG + horizontal (wordmark-only) version
- [ ] Final domain
- [ ] Legal texts (terms, privacy) reviewed and approved by Carinova

## Launch checklist

- [ ] All `TODO` values replaced; legal drafts approved (remove the "Borrador" notes and the `[bracketed]` gaps)
- [ ] Final domain in `src/config.yaml` → `site.site`
- [ ] `src/config.yaml` → `metadata.robots.index: true` and `follow: true`
- [ ] `src/data/carinova.ts` → `SITE_STATUS.isPreview = false` (hides the banner, enables the branches' LocalBusiness data)
- [ ] Official logo files → `node scripts/brand-assets.mjs <logo>`; update `src/components/Logo.astro` if a wordmark SVG arrives
- [ ] Every WhatsApp button tested on a phone
- [ ] Google Business Profile for each branch, linked from the branch `mapsUrl`
- [ ] Domain added to the Worker as a Custom Domain, `www` redirected to it (see Hosting notes); redeploy with `npm run deploy`
- [ ] Submit `sitemap-index.xml` in Google Search Console

## Hosting notes

Cloudflare Workers, serving `dist/` as static assets with no Worker script (D-018).

- **Deploy from this machine:** `npx wrangler login` once (opens the browser), then `npm run deploy`. The site goes to `https://carinova-web.<subdomain>.workers.dev`; if the account has no `workers.dev` subdomain yet, Wrangler asks for one. If the login can see more than one Cloudflare account, Wrangler asks which one (or set `account_id` in `wrangler.jsonc`).
- **Check Cloudflare behaviour locally:** `npm run build`, then `npx wrangler dev`. It serves `dist/` with production's routing, headers and 404 handling; `astro preview` does not.
- **Deploy from GitHub (Workers Builds), once the repo is on GitHub:** Workers & Pages → `carinova-web` → Settings → Builds → Connect. Build command `npm run build`, deploy command `npx wrangler deploy`. The Worker name must match `name` in `wrangler.jsonc` (`carinova-web`) or the build fails. Node comes from `.nvmrc`. Pushes to `main` go live; other branches get preview URLs.
- **Domain:** Cloudflare Registrar does not sell `.ni` or `.com.ni`: those are bought from NIC.ni, then the domain is added to Cloudflare and its nameservers changed. A `.com` can be bought directly in the Cloudflare account. A Cloudflare Registrar domain can be moved to another Cloudflare account later (both accounts confirm; only the registration moves, DNS is rebuilt).
- **Connecting the domain:** Worker → Settings → Domains & Routes → Add → Custom Domain, or `"routes": [{ "pattern": "<domain>", "custom_domain": true }]` in `wrangler.jsonc`. Cloudflare creates the DNS record and certificate. A Custom Domain matches one hostname only: for `www`, add a proxied `AAAA www 100::` record and a Redirect Rule from the "Redirect from WWW to root" template.

Comparison that led to D-018 (`netlify.toml` still works if plans change; build command `npm run build`, output `dist/`):

- **Netlify**: the simplest first deploy (connect the repo, or drag the `dist/` folder onto the dashboard). Free plan is credit-metered: 300 credits/month; 15 per production deploy, 20 per GB, 2 per 10,000 requests. At ~153 KB and 8 requests per first visit, that's about 5 credits per 1,000 home visits, so the free plan covers tens of thousands of visits a month.
- **Cloudflare**: domain, DNS and hosting in one account; requests to static assets are free and unlimited; nearest edge measured at ~35 ms from our connection vs ~90–110 ms for Vercel/Netlify.
- Visitors are in Nicaragua and the US: both providers serve the US well; Cloudflare is closer to Nicaragua.

## Open questions

- Who should own the domain and the Cloudflare account: Carinova or the developer? (Decides which account the domain is bought in; it can be moved later.)
- Courier software with a customer portal / tracking? (Link it from a `/rastreo` page; never embed it on the home page.)
- Miami warehouse address and a sales-tax exemption form to offer customers?
- English version for US-based customers, or Spanish only?
- Will they run Meta/TikTok ads? (Decides whether a pixel is needed; load it after the first interaction.)
