# Carinova Web — Agent Instructions

This repository is the website of Carinova, a courier from the United States to Nicaragua (Managua and Bluefields), in Spanish with an English version under `/en`. The pages are built on the AstroWind template; the template reference below still applies, and the Carinova rules here take precedence. The backend (sign-up, customer sign-in, the form for companies) is a small Cloudflare Worker in `worker/` (README → "Backend").

## Carinova rules

- **Project log:** `docs/PROJECT-LOG.md` records every decision and change. Update it as part of the same change: a Changelog line for every change, a Decisions row for every decision, and tick Pending items when content arrives.
- **Languages:** Spanish (Nicaragua) is the default and lives at the root; English is the same pages under `/en`, switched by `ENGLISH_ENABLED` in `src/i18n/locales.ts`. Everything a visitor reads exists in both: when you add or change a text, do it in both languages in the same change (`docs/INFORMATION-ARCHITECTURE.md` → "Languages").
  - Spanish uses **voseo** (tenés, abrí, escribinos; subjunctive in its general form: "cuando compres"; never "tú" or "usted" forms). The e-mails and the forms' error messages too. Rules: `docs/INFORMATION-ARCHITECTURE.md` → "Voice". Code, comments and docs are English.
  - A page file renders both languages: get the language, the links and the data from `i18n(Astro)` (`src/i18n`), never from a prop or a hard-coded path. Write a page's or component's own copy in that file, both languages side by side (`const t = { es: {…}, en: {…} }[locale]`). Links go through `href('/cotizador')`, with the Spanish path.
  - Data: facts and their Spanish wording in `src/data/*.ts`; the English wording in the file of the same name under `src/data/en/`, built on the Spanish facts (never retype a price, an id or an address there). `content(locale)` (`src/data/content.ts`) picks the language.
  - Scripts carry no text: the component hands them the sentences of the page's language in a `data-*` attribute (`fill()` in `src/utils/template.ts` for placeholders).
  - Not translated: the Miami address ("Aéreo" included), Nicaragua's departments, store names, ids, anchors, the calculator's parameters.
  - A new page needs its two addresses in `src/i18n/routes.ts` and a floating WhatsApp message in both languages; the unit tests say so if they are missing.
- **Architecture:** `docs/INFORMATION-ARCHITECTURE.md`. Six sections plus Inicio, one per customer question; each piece of content has one owning page and other pages only summarise it from the same data. Put new content where its question is answered; do not add a second home for it.
- **Business data** lives in `src/data/carinova.ts` (contact, branches, hours, rates, reception points, stores, reviews, call-to-action labels, WhatsApp messages), `src/data/services.ts` (services, steps, account parts, worked examples), `src/data/faq.ts`, `src/data/signup.ts`, `src/data/account.ts` (sign-in numbers) and `src/data/business.ts` (the form for companies). Prices are computed with `src/utils/rates.ts`. Do not hard-code prices, numbers or addresses in pages or components.
- **Not available yet** (Los Ángeles reception, home delivery): say "Próximamente" (`ServiceBadge.astro`), with no price or date.
- **Placeholders:** values marked `TODO` are not confirmed by Carinova. Keep `SITE_STATUS.isPreview` true and `metadata.robots` set to noindex in `src/config.yaml` until they are replaced.
- **No invented proof:** reviews, statistics and claims must be real. The reviews section hides itself while `REVIEWS` is empty. A store's card says what the store is, not what it offers; the page for companies promises what Carinova has said, nothing more.
- **Calls to action:** three, in this order and look: "Abrir mi casillero" (orange button, `/registro`), "Cotizar mi envío" (outlined button, `/cotizador`), WhatsApp help (underlined link, `WhatsAppHelp.astro`). Only those two are buttons; any other link is a text link. Two exceptions, both in `Stores.astro` and both asked for: the WhatsApp button of "¿No tenés método de pago, como tarjeta?" and the "Ir a <tienda>" button of a store's card. Use `CtaGroup.astro` / `ClosingCta.astro`, which read the labels from `CTA`. Every WhatsApp link has its own message in `WA_MESSAGES` (the floating button one per page), so leads can be traced to the place; `src/data/messages.test.ts` fails on a repeated message, in either language.
- **Visitors and customers:** the pages are static and the same for everyone. Whatever depends on being signed in goes in the page twice, marked `data-auth="out"` (visitors) and `data-auth="in"` (customers); CSS shows one (`SessionState.astro`, `tailwind.css`). Wherever "Abrir mi casillero" appears, a customer gets "Mi casillero" / "Ir a mi casillero" (`CTA.mailbox`) instead: `CtaGroup` does it; a button written by hand needs both. Never put a customer's data in a page: `/mi-casillero` gets it from `GET /api/account`.
- **Colours:** orange buttons (`btn-primary`, `cta` tokens) use navy text, because white on the logo orange fails contrast; so does the green WhatsApp button (`btn-whatsapp`). Navy sections use the `.dark` class; colour tokens are `@theme inline` so that works per section.
- **Astro and spaces:** a line break between text (or `{an expression}`) and a tag is dropped from the output ("Apto / Suite(opcional)"). Write `{' '}` where a space is needed, and check the built page.
- **Backend (`worker/`):** the pages stay static and there is no Astro adapter; `/api/*` is a hand-written Worker (`worker/index.ts`) deployed with the site, and `worker/dev-plugin.ts` serves the same code inside `astro dev`. Keep it that way unless the site needs server-rendered pages. Endpoints and how they are kept safe: README → "Backend".
  - Code under `worker/`, and the files it imports from `src/` (`src/data/carinova.ts`, `content.ts`, `services.ts`, `signup.ts`, `account.ts`, `business.ts`, `src/data/en/`, `src/i18n/locales.ts`, `src/i18n/routes.ts`, `src/utils/rates.ts`, `whatsapp.ts`), must run on Workers and on plain Node: relative imports with the `.ts` extension, no `~/` alias, no `astro:*` modules, no Node-only APIs outside `dev-plugin.ts` and the tests.
  - The forms' options and the server's validation both read `src/data/`. Validation rules live in the Worker only (`worker/signup/validate.ts`, `worker/business/validate.ts`); the forms just check for empty fields. Messages come back in the language of the form (`lang`).
  - Nothing is stored before the e-mail is confirmed (the link carries the encrypted form). Customers are created only by `POST /api/signup/confirm`; the database assigns the number (`db/schema.sql`).
  - Sign-in is a one-time code by e-mail, never a password. Do not weaken it: the session cookie stays `HttpOnly`, `Secure`, `SameSite=Lax` with the `__Host-` prefix; codes and tokens are stored as hashes only; `POST /api/login` answers the same whether or not the e-mail has an account; every database operation stays a single statement (`worker/store.ts`).
  - Secrets (`RESEND_API_KEY`, `EMAIL_FROM`, `DATABASE_URL`, `SIGNUP_TOKEN_SECRET`, `OWNER_EMAIL`, `SIGNUP_NOTIFY_TO`) live in `.env` locally and as Worker secrets in production. Never commit them, print them or put them in `wrangler.jsonc`.
  - Do not log customers' personal data.
  - The developer's `.env` holds the real Resend key, the real database and the owner's real inbox, so against `npm run dev` or `npm run preview` a sign-up sends real e-mail and creates a real customer, and a request from `/empresas` writes to the owner. Automated or browser tests that submit a form must run against the stand-ins: start `astro dev` with `RESEND_API_KEY`, `EMAIL_FROM`, `DATABASE_URL`, `SIGNUP_TOKEN_SECRET` and `OWNER_EMAIL` set to empty in its environment, and check that it prints "API in development mode". Never submit made-up addresses to the real mailer (they bounce and hurt the sender's reputation): for a real send use `delivered@resend.dev`, also as the owner's inbox (a `.dev.vars` file replaces `.env` for `wrangler dev`), then delete the test row and restart the numbering (README → "Trying it locally").
  - The database in `.env` is the production one, and it has real customers: never create, change or delete rows in its tables to test something. To run SQL against the real server, make a schema of your own, create the tables in it from `db/schema.sql`, and drop it afterwards. `db/schema.sql` must stay safe to run again on a database with customers.
- **Node:** use Node ≥ 22.22.3 and install with `npm install --ignore-scripts`.
- **Verify:** `npm run build`, `npm run check` and `npm test`, then look at the pages at 412 px and 1280 px wide (the site is light-only; there is no dark mode), in both languages, and the header at 1024 px (six links, the language link, "Ingresar" and the button must stay on one line). After a change to texts or routes, build once with `ENGLISH_ENABLED` off too: the result must be the Spanish site and nothing else. For anything that touches routing or the Worker, also run `npm run preview` (the real Cloudflare runtime).
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
