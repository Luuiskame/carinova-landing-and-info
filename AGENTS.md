# Carinova Web — Agent Instructions

This repository is the website of Carinova, a courier from the United States to Nicaragua (Managua and Bluefields), in Spanish with six translations (English, French, Portuguese, Chinese, Russian and Arabic), each under its own prefix. The pages are built on the AstroWind template; the template reference below still applies, and the Carinova rules here take precedence. The backend (sign-up, customer sign-in, the customer's account with its packages and payments, the form for companies) is a small Cloudflare Worker in `worker/` (README → "Backend"). The database also holds what Carinova's back office will use; the back office is not built yet (`docs/DATABASE.md`, `docs/BACKEND-HANDOFF.md`).

## Carinova rules

- **Project log:** `docs/PROJECT-LOG.md` records every decision and change. Update it as part of the same change: a Changelog line for every change, a Decisions row for every decision, and tick Pending items when content arrives.
- **Languages:** Spanish (Nicaragua) is the default and lives at the root; English, French, Portuguese, Chinese, Russian and Arabic are the same pages under `/en`, `/fr`, `/pt`, `/zh`, `/ru` and `/ar`, published by `PUBLISHED_TRANSLATIONS` in `src/i18n/locales.ts`. Everything a visitor reads exists in all seven: when you add or change a text, do it in every language in the same change (`docs/INFORMATION-ARCHITECTURE.md` → "Languages"). `src/i18n/translations.test.ts` fails when a language lacks a text, keeps a sentence of another language, or changes a fact, a link or a placeholder.
  - Spanish uses **voseo** (tenés, abrí, escribinos; subjunctive in its general form: "cuando compres"; never "tú" or "usted" forms). The e-mails and the forms' error messages too. Rules: `docs/INFORMATION-ARCHITECTURE.md` → "Voice". Code, comments and docs are English.
  - A page file renders every language: get the language, the links, the data and the words from `i18n(Astro)` (`const { locale, href, data, ui } = i18n(Astro)`), never from a prop or a hard-coded path. **No sentence is written in a page or a component**: it goes in the dictionaries, `src/i18n/ui/<language>.ts`, one entry per page or component (`const t = ui.branchesPage`), the Spanish file (`es.ts`) defining the shape. Links go through `href('/cotizador')`, with the Spanish path.
  - A sentence with a link or a value inside is an array of parts (`accept: ['Acepto los ', 'Términos y condiciones', …]`) or a function (`see: (city) => …`), written whole in each language. Do not put words, punctuation or spaces around a translated fragment in the markup: the order of the words, the full stop and even the space differ (`LOCALE_INFO[locale].wordGap` is what goes between two pieces a page has to join). Do not lower-case, pluralise or count there either: Russian and Arabic nouns change with the number in several ways, so a sentence says "Campos por corregir: {count}" and a formula "2 × Ноутбук" (`src/utils/rates.ts`).
  - Data: facts and their Spanish wording in `src/data/*.ts`; each translation's wording in the file of the same name under `src/data/<language>/`, built on the Spanish facts (never retype a price, an id or an address there). `content(locale)` (`src/data/content.ts`) picks the language. The legal texts are one Markdown file per language in `src/data/legal/`; what the Worker says (e-mails, error messages) is in `worker/text/<language>.ts`.
  - Scripts carry no text: the component hands them the sentences of the page's language in a `data-*` attribute (`fill()` in `src/utils/template.ts` for placeholders); on the home page, as JSON in the page (`ScriptData.astro`).
  - Arabic is written from right to left (`dir` comes from `LOCALE_INFO`). Use the logical utilities (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`, `text-start`, `border-s`), never `pl-`, `pr-`, `left-`, `right-` or `text-left`; an arrow that points forwards flips by itself when its icon is listed in `tailwind.css`. What is written from left to right in every language keeps its order with `dir="ltr"` on an inline element around it: a formula, the address in the United States, an e-mail address, a phone number, a price with its unit. A field for a name or a free text takes `dir="auto"`. In an Arabic sentence a number is followed by an Arabic word ("5 رطل"), never by Latin letters ("5 lb" is drawn "lb 5"). Arabic and Chinese pages have their own typographic rules in `tailwind.css` (no letter spacing, the device's font, titles that break at punctuation).
  - Not translated: the Miami address ("Aéreo" included), Nicaragua's departments, store names, ids, anchors, the calculator's parameters, "Carinova ID", and the way numbers are written ("US$6.50", "1,728").
  - A new page needs its addresses in `src/i18n/routes.ts` (Spanish and English words; the other languages reuse the English ones under their prefix), its entry in every dictionary and a floating WhatsApp message in every language; the unit tests say so if one is missing.
- **Architecture:** `docs/INFORMATION-ARCHITECTURE.md`. One page per customer question; each piece of content has one owning page and other places only summarise it from the same data. Put new content where its question is answered; do not add a second home for it. On every page but the home page the navigation bar keeps its layout and its options.
- **The home page** is the page Carinova wrote itself (2026-11-18), and it follows Carinova's file exactly in what it shows and in its small behaviours (D-114): its sections, their order, its look, its words and what its buttons do (D-102 to D-123; the home page that came before it was removed). Do not improve on the file there: a difference is a decision, and it goes in the log. The differences that exist are listed in D-116 to D-124. What the site adds so that nothing leaves the screen applies only at the widths where the file itself does not fit (D-124): a new rule of that kind is scoped the same way, by width and by language. It lives in `src/pages/index.astro`, `src/components/landing/`, `src/layouts/LandingLayout.astro` and `src/assets/styles/landing.css`, with its own header, footer, dialog and stylesheet (no Tailwind, no `ClientRouter`); the rules below about the site's header, buttons, colours, dialogs and Tailwind classes describe every other page. What still holds on it: a static page per language, no sentence in a component, facts from `src/data`, and the backend untouched. On this page only, as the file has it: Los Ángeles is a place that receives packages, and "Lo que dicen nuestros clientes" shows the three cards that say a customer's words will go there while `REVIEWS` is empty (they are marked as places kept, not as reviews). With reviews, its cards are the reviews, in the file's card: what a review adds (its source and month, the person's photo or initials, a recommendation or stars, the link to it) is D-125 to D-127. A review is added in `REVIEWS` only; Facebook and Google need no change to the page (`REVIEW_SOURCES`), and a photo is a file in Carinova's R2 bucket (`REVIEW_PHOTOS_URL`), uploaded square and small because the page loads it as it is. The account, signing in, "Mi cuenta", a new shipment and tracking are views of the page's dialog that work on the site's API (`scripts/account.ts`, D-117 to D-119): never simulate an account in the page, never ask for a password, never ask for what the API will not keep, and never look a package up for a visitor. What opens a view is a link to the site's own page (`/registro`, `/mi-cuenta`, `/rastreo`, `/privacidad`), which is where it leads without the script.
  - Words: `src/i18n/ui/landing/<language>.ts`, part of each dictionary as `ui.landing`, under the names Carinova's file gives them. In Spanish, English, French, Portuguese and Chinese a sentence is the file's, word for word; Russian and Arabic are the site's translations. A price, a delivery time or a limit is never typed in a sentence: it comes from `landingFacts()` (`facts.ts`), which also writes a list the way the file writes it in each language. The two lists of the page, the devices and the origins are words of the dictionary (`prohibitedList`, `noAirList`, `devices`, `origins`), not the names of `src/data`. `src/data/landing.test.ts` fails when a store, a category, a kind of article, a notice, a device, an origin or an item of the lists lacks words in a language.
  - Styles: `landing.css` is written into the page, so keep it to what the page needs; what only a dialog needs goes in `landing-dialog.css`, which loads when a dialog opens. Use logical properties (`margin-inline-start`, `inset-inline-end`, `text-align: start`); an icon that points forwards takes the class `is-forward`. A width that holds a count of characters is in `em`, never `ch` (it changes with the font that is showing). Do not preload the font, and keep "Manrope Fallback" matched to Manrope if the font or the weights change (the comment above it says how it was measured).
  - Scripts: `scripts/boot.ts` is what every visitor downloads, so it stays small; anything a visitor may never use (the calculator's arithmetic, the article catalogue, the dialogs, the account's views, the directory of stores) is fetched when it is used (`scripts/lazy.ts`), and whatever opens it is a link that leads somewhere useful without the script. A component hands its script the sentences as JSON in the page (`ScriptData.astro`, read with `pageData()`). A store's logo is a file (`logos.ts`), never text inside the page or a script. Numbers, hours and departments are written by `src/utils/landing.ts` and `scripts/quote-view.ts` as the file writes them in each language (they have unit tests).
  - Speed is the reason it was rebuilt (D-107): about 43 KB of HTML gzipped (36 KB in Brotli) and 3.6 KB of script to start, no layout shift. After a change, measure it against those numbers (first visit, a phone on slow 4G) before saying it did not get slower.
  - After a change, compare it with Carinova's file again (D-115): structure, text in the five languages, pixels by section, and the same actions on both. The comparison is what says the page is still the file.
- **Business data** lives in `src/data/carinova.ts` (contact, social networks, branches, hours, rates, reception points, what cannot be shipped, stores, reviews, call-to-action labels, WhatsApp messages), `src/data/services.ts` (services, steps, account parts, worked examples), `src/data/faq.ts`, `src/data/signup.ts`, `src/data/account.ts` (sign-in numbers; the statuses of packages, invoices and payments) and `src/data/business.ts` (the page and the form for companies). Prices are computed with `src/utils/rates.ts`. Do not hard-code prices, numbers or addresses in pages or components. A social network or the e-mail shows in the footer's carousel once it has an address there, and not before.
- **Not available yet** (the Los Ángeles address): on every page but the home page, say "Próximamente" (`ServiceBadge.astro`, kind `soon`), with no price or date, and keep it visible as an option wherever the address in the United States is shown. The home page names Los Ángeles as Carinova's file does (D-114); in its account view, where an address would be, it says the address is coming. What has a charge that is not published (home delivery) says "Cargo adicional" (kind `extra`), with no amount.
- **Placeholders:** values marked `TODO` are not confirmed by Carinova. Keep `SITE_STATUS.isPreview` true and `metadata.robots` set to noindex in `src/config.yaml` until they are replaced.
- **No invented proof:** reviews, statistics and claims must be real. Reviews appear only on the home page: each one as its source publishes it (the name and every word, emoji included), never translated or corrected, with a link to it on Facebook or Google (D-125); while `REVIEWS` is empty the page shows the file's three places kept for reviews (D-114), never a review nobody wrote. No rating or count of reviews is written by hand: a figure on the site would not follow the source. A store's card says what the store is, not what it offers; the page for companies promises what Carinova has said, nothing more; the article search of the tracker ("¿Puede ingresar?", on `/rastreo`) never says an article is allowed: what is on none of the three lists gets "No aparece en nuestras listas" and WhatsApp. The home page's "Carinova Bot" answers as Carinova's file does: from its catalogue (`src/data/articles.ts`), and a word the catalogue does not know is general merchandise (D-114). The site's lists stay under it as a net: what they name is answered from them, and where the catalogue and a list disagree the stricter answers (D-105, D-120).
- **Calls to action:** the labels are Carinova's and live in `CTA`: "Crear cuenta" (orange button, `/registro`), "Cotizá tu envío" (outlined button, `/cotizador`), WhatsApp help (underlined link, `WhatsAppHelp.astro`); in the header, "Ingresá" (a white button, `btn-light`, that opens the sign-in dialog; it must stay the most visible thing in the bar and, on a phone, sit beside the menu button) and "Rastreá tu paquete" (`/rastreo`). Only the first two are buttons in the body of a page; any other link is a text link. The exceptions are the thing their section is for: the button of the product-link form, the button of a store's card and the tracker's own buttons. Use `CtaGroup.astro` / `ClosingCta.astro`, which read the labels from `CTA`. Every WhatsApp link has its own message in `WA_MESSAGES` (the floating button one per page), so leads can be traced to the place; `src/data/messages.test.ts` fails on a repeated message, in any language.
- **Visitors and customers:** the pages are static and the same for everyone. Whatever depends on being signed in goes in the page twice, marked `data-auth="out"` (visitors) and `data-auth="in"` (customers); CSS shows one (`SessionState.astro`, `tailwind.css`). Wherever "Crear cuenta" appears, a customer gets "Mi cuenta" / "Ir a mi cuenta" (`CTA.account`) instead: `CtaGroup` does it; a button written by hand needs both. Never put a customer's data in a page: `/mi-cuenta` gets it from `GET /api/account` and `GET /api/account/activity` (`AccountPanel.astro`), and `/rastreo` reads the same answer (`PackageLookup.astro`). A package is never looked up by Carinova ID alone: the ID is no secret. The word is "cuenta" ("account") in every button, title and message. "Casillero" appears only where the site says that the address in the United States that comes with the account is what Nicaragua calls one (`/casillero-en-miami`, the title and the description of the home page that search engines read, the first step of `/como-comprar`, two questions): it is there for search engines, not as the product's name.
- **Colours:** Carinova's palette: navy `#06172F`, orange `#FF8A00`, blue `#1164CF`, white (`CustomStyles.astro`; theme colours `navy`, `brand`, `cta`). Orange buttons (`btn-primary`) use navy text, because white on that orange fails contrast; so does the green WhatsApp button (`btn-whatsapp`). Orange as text on a light background is the deeper `secondary` tone. Navy sections use the `.dark` class; colour tokens are `@theme inline` so that works per section.
- **Dialogs:** a native `<dialog class="cn-dialog">`, opened by any element with `data-dialog-open="<its id>"` and closed with `data-cn-dialog-close` (`DialogKit.astro`, in every page). Put the dialog outside any `.dark` section, or it takes that section's colours. A listener on `document` that must act before Astro's `ClientRouter` handles the click has to run in the capture phase.
- **Images and titles:** Use `<Picture>` with `width`, `widths`, `sizes` and `formats={['avif', 'webp']}`, so an original is never what a browser downloads; an image loads eagerly only if it is in the first screen (on the home page none is: the emblem is under the opening). The one exception is the reviewers' photos, which live in Carinova's R2 bucket and are loaded as stored (D-127): they are uploaded at the size they are needed. A section of an inner page is headed by one heading in two parts, a small line with the words people search for and the brand's line. Structured data (`src/utils/schema.ts`) says only what the page says: no ratings, reviews or figures.
- **Astro and spaces:** a line break between text (or `{an expression}`) and a tag is dropped from the output ("Apto / Suite(opcional)"). Write `{' '}` where a space is needed, and check the built page.
- **Backend (`worker/`):** the pages stay static and there is no Astro adapter; `/api/*` is a hand-written Worker (`worker/index.ts`) deployed with the site, and `worker/dev-plugin.ts` serves the same code inside `astro dev`. Keep it that way unless the site needs server-rendered pages. Endpoints and how they are kept safe: README → "Backend".
  - Code under `worker/`, and the files it imports from `src/` (`src/data/carinova.ts`, `content.ts`, `services.ts`, `signup.ts`, `account.ts`, `business.ts`, `src/data/<language>/`, `src/i18n/locales.ts`, `src/i18n/routes.ts`, `src/utils/rates.ts`, `whatsapp.ts`), must run on Workers and on plain Node: relative imports with the `.ts` extension, no `~/` alias, no `astro:*` modules, no Node-only APIs outside `dev-plugin.ts` and the tests.
  - The forms' options and the server's validation both read `src/data/`. Validation rules live in the Worker only (`worker/signup/validate.ts`, `worker/business/validate.ts`); the forms just check for empty fields. Messages come back in the language of the form (`lang`), from `worker/text/<language>.ts`; what Carinova's team receives is always in Spanish.
  - Nothing is stored before the e-mail is confirmed (the link carries the encrypted form). Customers are created only by `POST /api/signup/confirm`; the database assigns the number (`db/schema.sql`).
  - Sign-in is a one-time code by e-mail, never a password. Do not weaken it: the session cookie stays `HttpOnly`, `Secure`, `SameSite=Lax` with the `__Host-` prefix; codes and tokens are stored as hashes only; `POST /api/login` answers the same whether or not the e-mail has an account; every database operation stays a single statement (`worker/store.ts`). What a customer is sent is decided by their session and nothing else: a statement that reads or writes for a customer starts from `customer_sessions`.
  - Secrets (`RESEND_API_KEY`, `EMAIL_FROM`, `DATABASE_URL`, `SIGNUP_TOKEN_SECRET`, `OWNER_EMAIL`, `SIGNUP_NOTIFY_TO`) live in `.env` locally and as Worker secrets in production. Never commit them, print them or put them in `wrangler.jsonc`.
  - Do not log customers' personal data.
  - The developer's `.env` holds the real Resend key, the real database and the owner's real inbox, so against `npm run dev` or `npm run preview` a sign-up sends real e-mail and creates a real customer, and a request from `/empresas` writes to the owner. Automated or browser tests that submit a form must run against the stand-ins: start `astro dev` with `RESEND_API_KEY`, `EMAIL_FROM`, `DATABASE_URL`, `SIGNUP_TOKEN_SECRET` and `OWNER_EMAIL` set to empty in its environment, and check that it prints "API in development mode". Never submit made-up addresses to the real mailer (they bounce and hurt the sender's reputation): for a real send use `delivered@resend.dev`, also as the owner's inbox (a `.dev.vars` file replaces `.env` for `wrangler dev`), then delete the test row and restart the numbering (README → "Trying it locally").
  - The database in `.env` is the production one, and it has real customers: never create, change or delete rows in its tables to test something. Try SQL with `npm run db:check` (a PostgreSQL inside the process) or, for the real server, `npm run db:scratch` (a schema of its own, dropped at the end). `db/schema.sql` must stay safe to run again on a database with customers; `npm run db:apply` runs it.
  - `db/queries.sql` is the contract of the back office: named single statements, each writing its row in `audit_log`. Nothing runs them yet. A change to it, to `db/schema.sql` or to the statements of `worker/store.ts` comes with its case in `db/check.mjs` and its lines in `docs/DATABASE.md` (a unit test compares the two lists). A list of statuses changes in the schema's `CHECK` and in `src/data/account.ts` together. Building the back office: `docs/BACKEND-HANDOFF.md`.
- **Node:** use Node ≥ 22.22.3 and install with `npm install --ignore-scripts`.
- **Verify:** `npm run build`, `npm run check` and `npm test`, then look at the pages at 412 px and 1280 px wide (the site is light-only; there is no dark mode), in Spanish and in a translation of each kind (French or Russian for long words, Chinese, Arabic for right to left), and the header at 1024 px and 1280 px in every language (the wordmark, six links, the language button, "Ingresá", "Rastreá tu paquete" from 1280 px and the orange button must stay on one line, for a visitor and for a customer; the Spanish bar is the reference and must not change). The home page has its own header and its own breakpoints: look at it also at 320, 360 and 390 px and on each side of the widths where its layout changes (380, 384, 640, 960, 1080, 1180 px), with "reduce motion" on, and with the font file blocked (what a visitor sees until Manrope arrives must sit where the final text sits). After a change to texts or routes, build once with `PUBLISHED_TRANSLATIONS` empty too: the result must be the Spanish site and nothing else. For anything that touches routing or the Worker, also run `npm run preview` (the real Cloudflare runtime). For anything that touches SQL, `npm run db:check`, and `npm run db:scratch` when two people acting at once matter.
- **Hosting:** Cloudflare Workers, static assets only (`wrangler.jsonc`; see Hosting notes in the log). `npm run deploy` builds and uploads. To check Cloudflare's routing, headers or 404 handling, run `npx wrangler dev` after a build; `astro preview` does not reproduce them. `.wrangler/` is local state and stays out of git.

# AstroWind template reference

## Project Overview

AstroWind is a free, open-source website template built with **Astro v7** and **Tailwind CSS v4**. It generates a fully static site optimized for performance, SEO, and accessibility.

**Stack:** Astro v7 | Tailwind CSS v4 | TypeScript 5.9 | MDX | Sharp

## Skills

Before implementing a project-specific task (disabling the blog, Open Graph images, base paths, CMS, deployments, header customisation…), check `.agents/skills/` for an existing skill and follow it.

## Quick Reference

| Command           | Purpose                             |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start dev server at localhost:4321  |
| `npm run build`   | Production build to `./dist/`       |
| `npm run preview` | Preview production build locally    |
| `npm run check`   | Run astro check + ESLint + Prettier |
| `npm run fix`     | Auto-fix ESLint + Prettier issues   |

**Node.js requirement:** >= 22.22.3

## Architecture

### Directory Structure

```
src/
  assets/styles/tailwind.css   # Tailwind v4 config (themes, utilities, plugins)
  components/
    common/        # Shared: Image, Metadata, Analytics, ToggleTheme
    ui/            # Primitives: Button, Form, Headline, Timeline, WidgetWrapper
    widgets/       # Page sections: Hero, Features, Bento, Pricing, Comparison, FAQs, Team, Gallery…
    blog/          # Blog: SinglePost, List, Pagination, Tags
    CustomStyles.astro  # CSS variables for colors and fonts
  content.config.ts    # Content Collections schema (Astro 5+ location)
  data/post/           # Blog posts (.md, .mdx)
  layouts/             # Layout.astro, PageLayout.astro, MarkdownLayout.astro
  pages/               # File-based routing
  utils/               # blog.ts, images.ts, permalinks.ts, frontmatter.ts
  config.yaml          # Site configuration (loaded as virtual module)
  navigation.ts        # Navigation structure
  types.d.ts           # TypeScript type definitions
vendor/integration/    # Custom Astro integration for config loading
```

### Path Aliases

Use `~/` to import from `src/`:

```typescript
import Image from '~/components/common/Image.astro';
import { SITE } from 'astrowind:config';
```

### Configuration System

Site config lives in `src/config.yaml` and is loaded as a Vite virtual module `astrowind:config` by the custom integration in `vendor/integration/`. Exports: `SITE`, `I18N`, `METADATA`, `APP_BLOG`, `UI`, `ANALYTICS`.

## Tailwind CSS v4

Configuration is CSS-first in `src/assets/styles/tailwind.css`:

- **Theme tokens:** `@theme { --color-primary: var(--aw-color-primary); ... }`
- **Custom utilities:** `@utility bg-page { ... }`
- **Dark mode:** Class-based via `@variant dark (&:where(.dark, .dark *))`
- **Plugins:** `@plugin "@tailwindcss/typography"`
- **Custom variant:** `@custom-variant intersect (&:not([no-intersect]))`

CSS variables for colors/fonts are defined in `src/components/CustomStyles.astro` with light/dark theme variants.

The Vite plugin `@tailwindcss/vite` is configured in `astro.config.ts` (not as an Astro integration).

### Class Merging

Components use `twMerge` from `tailwind-merge` v3 for conditional class composition.

## Content Collections

Defined in `src/content.config.ts` using Astro's Content Layer API with `glob()` loader. Posts are in `src/data/post/` as `.md` or `.mdx` files.

Post frontmatter: `title` (required), `publishDate`, `updateDate`, `draft`, `excerpt`, `image`, `category`, `tags`, `author`, `metadata`.

## Component Patterns

- Props extend interfaces from `~/types`
- Use `class:list` for conditional classes
- Use `twMerge()` when accepting className overrides
- Use named slots for layout composition
- Widget components accept standardized props (see `~/types`)

## Image Handling

`src/components/common/Image.astro` supports:

- Local images via `astro:assets` (optimized by Sharp)
- Remote images via Unpic CDN
- Allowed domains (for providers Unpic can't detect, processed by Sharp): `cdn.pixabay.com`

Hero images use `loading="eager"` and `fetchpriority="high"`.

## Fonts

Fonts are handled by Astro's native **Fonts API**, configured in `astro.config.ts` under the `fonts` key (provider, family, `cssVariable`) and injected via the `<Font />` component in `src/layouts/Layout.astro`. Astro self-hosts, subsets, preloads, and generates metric-adjusted fallbacks. To change the typeface, edit the `fonts` entry and point `--aw-font-*` in `CustomStyles.astro` at the new `cssVariable`.

## Third-party Scripts (Partytown)

`@astrojs/partytown` is wired as an **opt-in** in `astro.config.ts`, gated behind `const hasExternalScripts = false`. Set it to `true` to offload third-party scripts (e.g. Google Analytics via `analytics.vendors.googleAnalytics.partytown`) to a web worker. It is disabled by default so the base template ships no external scripts.

## Content Security Policy

Astro's native CSP is intentionally **not** enabled in this version: it is incompatible with `<ClientRouter />` view transitions (shipped on by default) and would break the arbitrary third-party scripts a template user typically adds. CSP is deferred to AstroWind v2, where the component model (and optional SSR) make it clean and opt-in.

## Verification Checklist

After changes, always verify:

1. `npm run build` succeeds
2. `npm run check` passes (astro check + ESLint + Prettier)
3. Visual check in browser: homepage, blog, dark mode, mobile menu
4. Structured data describes the site it is on: the `WebSite` / `Organization` block in `src/pages/index.astro` is built only from `config.yaml`; anything you add there must be true for your site
