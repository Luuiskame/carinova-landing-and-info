# Carinova — website

Website of Carinova, a courier from the United States to Nicaragua (branches in Managua and Bluefields): what it does and costs, a calculator, an online sign-up, a sign-in for customers with their packages and payments, and a form for companies. In Spanish, with an English version under `/en`.

- **Pages:** static, built with **Astro 7 + Tailwind CSS 4** on the [AstroWind](https://github.com/arthelokyo/astrowind) template (MIT).
- **Backend:** a small Cloudflare Worker in `worker/` (eight endpoints under `/api/`), e-mail through Resend, the database in Neon (PostgreSQL). The same database is ready for Carinova's back office (packages, invoices, payments, the team), which is not built yet.
- **Hosting:** Cloudflare Workers.

> Decisions, changelog, pending content and the launch checklist live in **[docs/PROJECT-LOG.md](docs/PROJECT-LOG.md)**. How the site is organised (pages, the home page, calls to action, WhatsApp messages, languages, voseo) is in **[docs/INFORMATION-ARCHITECTURE.md](docs/INFORMATION-ARCHITECTURE.md)**. The database is in **[docs/DATABASE.md](docs/DATABASE.md)**, and what is left to build on it in **[docs/BACKEND-HANDOFF.md](docs/BACKEND-HANDOFF.md)**.

## Run it

Requires Node ≥ 22.22.3 (developed on Node 26).

| Command                        | What it does                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm install --ignore-scripts` | Install dependencies                                                                                                                                          |
| `npm run dev`                  | Dev server at http://localhost:4321, the API included                                                                                                         |
| `npm run build`                | Production build in `dist/`                                                                                                                                   |
| `npm run preview`              | Build, then run the site and the Worker as Cloudflare does (http://localhost:8787)                                                                            |
| `npm run check`                | Type check + ESLint + Prettier                                                                                                                                |
| `npm test`                     | Unit tests: the backend, rates and formulas, WhatsApp messages, the two languages, the database files                                                         |
| `npm run db:check`             | The schema and every statement against a PostgreSQL inside the process (needs `npm install --no-save @electric-sql/pglite` once)                              |
| `npm run db:scratch`           | The same on the real server, in a schema of its own that is dropped at the end; `db:status` says what the database has, `db:apply` runs `db/schema.sql` on it |
| `npm run fix`                  | Auto-fix lint and formatting                                                                                                                                  |
| `npm run deploy`               | Build and upload to Cloudflare (a push to `main` deploys too, if the repo is linked)                                                                          |

## Where to edit things

| What                                                                                                                                                                                  | Where                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WhatsApp number, email, social links, branches and hours, rates, reception points (Miami; Los Ángeles "próximamente"), stores, reviews, the tagline and the promise                   | `src/data/carinova.ts` (and its English wording in `src/data/en/carinova.ts`)                                                                                                                                                               |
| Labels of the calls to action ("Crear cuenta", "Cotizá tu envío", "Ayuda por WhatsApp", "Ingresá", "Mi cuenta", "Rastreá tu paquete")                                                 | `CTA` in `src/data/carinova.ts`                                                                                                                                                                                                             |
| The stores: name, address, link, category, description                                                                                                                                | `STORES` and `STORE_CATEGORIES` in `src/data/carinova.ts`; the carousel and the card of "Compras por vos" on the home page read them                                                                                                        |
| Services and their three axes, the steps of "Cómo comprar", what an account includes, the worked examples                                                                             | `src/data/services.ts` (English: `src/data/en/services.ts`)                                                                                                                                                                                 |
| How prices are worked out and written (per pound, per cubic foot in inches or centimetres, per unit; one basis at a time)                                                             | `src/utils/rates.ts` (tested in `rates.test.ts`)                                                                                                                                                                                            |
| The Miami address customers receive, and the three lists of what cannot be shipped (with the words the search recognises each article by)                                             | `MIAMI_ADDRESS` and `RESTRICTED_ITEMS` in `src/data/carinova.ts`                                                                                                                                                                            |
| Prefilled WhatsApp message of each place, the floating button per page                                                                                                                | `WA_MESSAGES` in `src/data/carinova.ts` and `src/data/en/carinova.ts` (each one must be unique: `src/data/messages.test.ts`)                                                                                                                |
| Sign-up form: countries, departments and states, the examples shown as placeholders; how long a confirmation link lasts                                                               | `src/data/signup.ts`                                                                                                                                                                                                                        |
| Sign-in: digits and minutes of a code, attempts, how many codes can be sent, how long a session lasts. The statuses of packages, invoices and payments, with the words customers read | `src/data/account.ts`                                                                                                                                                                                                                       |
| Companies: the solutions the page lists, the form's options and limits                                                                                                                | `src/data/business.ts`                                                                                                                                                                                                                      |
| Frequently asked questions                                                                                                                                                            | `src/data/faq.ts` (English: `src/data/en/faq.ts`)                                                                                                                                                                                           |
| Terms and privacy policy                                                                                                                                                              | `src/data/legal/` (one file per language)                                                                                                                                                                                                   |
| The English version on or off; the address of each page in each language                                                                                                              | `ENGLISH_ENABLED` in `src/i18n/locales.ts`; `src/i18n/routes.ts`                                                                                                                                                                            |
| Site name, domain, SEO defaults, search indexing, blog on/off                                                                                                                         | `src/config.yaml`                                                                                                                                                                                                                           |
| Header and footer links                                                                                                                                                               | `src/navigation.ts`                                                                                                                                                                                                                         |
| Colours (Carinova's palette) and fonts                                                                                                                                                | `src/components/CustomStyles.astro`, `src/assets/styles/tailwind.css`, `fonts` in `astro.config.ts`                                                                                                                                         |
| Pages (their copy is in the page, in both languages)                                                                                                                                  | `src/pages/` (`index`, `como-comprar`, `servicios`, `cotizador`, `sucursales`, `preguntas-frecuentes`, `articulos-prohibidos`, `mi-cuenta`, `registro`, `registro/confirmar`, `ingresar`, `empresas`, `nosotros`, `terminos`, `privacidad`) |
| Carinova sections (the home page's sections, calculator, rates, services, steps, branches, calls to action, the forms, the sign-in dialog, the customer's account…)                   | `src/components/carinova/`                                                                                                                                                                                                                  |
| The e-mails                                                                                                                                                                           | `worker/signup/emails.ts` (confirmation, welcome, team), `worker/auth/emails.ts` (sign-in code), `worker/business/emails.ts` (company request)                                                                                              |
| What counts as a valid name, phone, postal code, company request…                                                                                                                     | `worker/signup/validate.ts`, `worker/business/validate.ts`                                                                                                                                                                                  |
| Blog posts (once the blog is switched on)                                                                                                                                             | `src/data/post/*.md`                                                                                                                                                                                                                        |
| Favicons, share image and the copy of the logo (the header shows `src/assets/images/carinova-wordmark.webp`)                                                                          | `node scripts/brand-assets.mjs <path-to-logo>` regenerates them                                                                                                                                                                             |

Values marked `TODO` in the data files are placeholders waiting for Carinova's confirmation.

## Languages

Spanish is the default: its pages are at the root and are the ones search engines index for Nicaragua. English is the same pages under `/en`, with translated addresses (`/en/quote`, `/en/how-to-buy`). The two versions of a page name each other with `hreflang`, so the English pages never take the place of the Spanish ones.

`ENGLISH_ENABLED` in `src/i18n/locales.ts` switches the English version. While it is `false` no `/en` page is built, nothing links to one and the site is exactly the Spanish site.

When a text changes, change it in both languages: the page's own copy is side by side in the page (`{ es: {…}, en: {…} }`), and the data has an English file with the same name under `src/data/en/`. The unit tests fail when English is missing something Spanish has. Details: [docs/INFORMATION-ARCHITECTURE.md](docs/INFORMATION-ARCHITECTURE.md) → "Languages".

## Backend

A Cloudflare Worker (`worker/`) deployed with the site. The pages are static files; only requests to `/api/` run the Worker.

| Endpoint                    | What it does                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------- |
| `POST /api/signup`          | Validates the sign-up form and e-mails a confirmation link                             |
| `POST /api/signup/confirm`  | Opens the link's token, creates the customer and signs them in                         |
| `POST /api/login`           | E-mails a one-time code to the customer of an address                                  |
| `POST /api/login/verify`    | Checks the code and signs the customer in                                              |
| `POST /api/logout`          | Ends the session                                                                       |
| `GET /api/account`          | The account of the customer who is signed in                                           |
| `GET /api/account/activity` | Their packages (with the history of each) and their invoices (with lines and payments) |
| `POST /api/business`        | E-mails a company's request to Carinova's owner (`OWNER_EMAIL`)                        |

### Signing up

1. The visitor fills in the form on `/registro`. `POST /api/signup` validates it and e-mails a confirmation link. Nothing is stored: the link carries the form, encrypted.
2. The link opens `/registro/confirmar`; its button calls `POST /api/signup/confirm`, which inserts the customer in the database. The database assigns the customer number, the Carinova ID (`CNV-00001`, `CNV-00002`…). The new customer is signed in on that browser.
3. The page shows the number and the Miami address, and a welcome e-mail repeats them. If `SIGNUP_NOTIFY_TO` is set, Carinova's team gets an e-mail too.

Opening the same link twice, or signing up again with the same e-mail, returns the existing customer (and signs nobody in).

### Signing in

Customers have no password. "Ingresá" in the header opens a dialog on any page (the same form is the page `/ingresar`): they write the e-mail of their account, receive a 6-digit code there and type it; `/mi-cuenta` then shows their Carinova ID, their packages and payments, their address in the United States and their data.

What keeps it safe:

- **The code** lasts 10 minutes, works once and allows 5 guesses; a customer is sent at most 3 codes in 15 minutes and 10 in a day. Asking for a newer code ends the earlier one.
- **The form never says whether an e-mail has an account**: the answer is the same either way, and nothing is sent to an address that has none.
- **The session** is a random 256-bit token in a cookie that scripts cannot read (`HttpOnly`), sent only over HTTPS (`Secure`) and only by this site's own pages (`SameSite=Lax`). Its name starts with `__Host-`, so nothing else on the domain can set it. It lasts 30 days or until "Cerrar sesión".
- **The database never holds a code or a token**, only a hash of each (the code's is keyed with `SIGNUP_TOKEN_SECRET`): a copy of the database cannot be used to sign in.
- **Only the site's own pages can call the API**: it checks `Origin` and `Sec-Fetch-Site` and only takes JSON.
- **Every database operation is one statement**, so two requests at the same moment cannot interleave: two guesses are counted one after the other, and one code opens one session.

The pages are the same static files for visitors and customers. A second cookie, which carries nothing, tells them a session exists, so "Crear cuenta" becomes "Mi cuenta" before the page paints; what a customer can see is always decided by the Worker.

### The account

`/mi-cuenta` is one page: a visitor reads what an account includes; a customer gets their own. Its script asks `GET /api/account` and `GET /api/account/activity`, each answered only for the customer of the session cookie: the statement starts from the session, so nothing in the request can change whose rows come back, and nothing internal (the team's notes, drafts, ids) is selected.

Packages, invoices and payments are written by Carinova's team in the back office, which does not exist yet: until then every account's lists are empty, and the page says so. The tables, the statements the back office is to run and how to build it are in [docs/DATABASE.md](docs/DATABASE.md) and [docs/BACKEND-HANDOFF.md](docs/BACKEND-HANDOFF.md).

### Companies

`/empresas` has a short form. `POST /api/business` validates it and e-mails it to `OWNER_EMAIL`, with the company's address as reply-to. Nothing is stored and the company gets no automatic e-mail.

### Files

| File                          | What it is                                                                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `worker/index.ts`             | The Cloudflare Worker: `/api/*` goes to the API, everything else is the static site                                                      |
| `worker/api.ts`               | The endpoints, and the checks every request goes through                                                                                 |
| `worker/store.ts`             | Customers, sign-in codes and sessions in Neon, and what a customer reads of their packages and invoices (and in memory, for development) |
| `worker/mailer.ts`            | Sending through Resend                                                                                                                   |
| `worker/email-kit.ts`         | What every e-mail is built with                                                                                                          |
| `worker/validation.ts`        | What every form is checked with                                                                                                          |
| `worker/signup/`              | The sign-up: its validation, the encrypted confirmation link, its e-mails                                                                |
| `worker/auth/`                | The sign-in: the codes, the session and its cookies, the code's e-mail                                                                   |
| `worker/business/`            | The form for companies: its validation and the e-mail to the owner                                                                       |
| `worker/dev-plugin.ts`        | Serves the same API inside `npm run dev`                                                                                                 |
| `db/schema.sql`               | The tables: customers and their sign-in; packages; invoices and payments; the team and its audit log                                     |
| `db/queries.sql`              | The statements of the back office (nothing runs them yet)                                                                                |
| `db/check.mjs`, `db/neon.mjs` | The checks of the database, and applying the schema                                                                                      |

### Settings

Locally they go in `.env` (copy `.env.example`; git ignores it). In production they are **secrets** of the Worker: `npx wrangler secret put <NAME>` for each one, `npx wrangler secret bulk .env` to upload every line of your `.env` at once, or Cloudflare dashboard → the Worker → Settings → Variables and Secrets → type "Secret".

| Name                  | Needed for             | Value                                                                                                                                                                        |
| --------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`      | every e-mail           | Resend API key                                                                                                                                                               |
| `EMAIL_FROM`          | every e-mail           | Sender, e.g. `Carinova <casillero@carinovanic.com>`; an address alone is sent as `Carinova <address>`. The domain must be verified in Resend                                 |
| `DATABASE_URL`        | sign-up and sign-in    | Neon connection string as the dashboard gives it with "Connection pooling" on: the host contains `-pooler` and it ends in `/neondb?sslmode=require&channel_binding=require`  |
| `SIGNUP_TOKEN_SECRET` | sign-up and sign-in    | Random text, 32+ characters: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Encrypts the confirmation links and keys the hashes of the codes |
| `OWNER_EMAIL`         | the form for companies | Inbox of Carinova's owner                                                                                                                                                    |
| `SIGNUP_NOTIFY_TO`    | optional               | Inbox that gets an e-mail for every new customer                                                                                                                             |

Create or update the tables with `npm run db:apply`, or by running `db/schema.sql` in the Neon SQL Editor. It is safe to run again, also on a database that already has customers: it only adds what is missing.

While a setting is missing in production, the endpoints that need it answer `503`, the form tells the visitor to write on WhatsApp, and the Worker's log (Cloudflare dashboard → the Worker → Logs) names what is missing.

### Trying it locally

`npm run dev` works with an empty `.env`: confirmation links, sign-in codes and company requests are printed in the terminal instead of sent, and customers and sessions are kept in memory until the server restarts. It says so when it starts ("API in development mode"). Each setting you add to `.env` switches that part to the real service.

`npm run preview` runs the real Worker and needs the real settings in `.env`. A `.dev.vars` file, if there is one, replaces `.env` for it.

With the real settings in `.env`, a sign-up on your machine is a real one: Resend sends the e-mails and the customer is inserted in the database `DATABASE_URL` points to, taking the next customer number. A request from `/empresas` reaches the owner's inbox.

- To test sending without writing to a real inbox, sign up as `delivered@resend.dev` (Resend's test address). The confirmation link then cannot be opened, so use your own address to try the whole flow.
- Remove test customers afterwards in the Neon SQL Editor: `DELETE FROM customers WHERE email = '<address>';` (their codes and sessions go with them). If the table is empty again, `ALTER TABLE customers ALTER COLUMN id RESTART WITH 1;` gives the next customer `CNV-00001`.

## Credits

Built on [AstroWind](https://github.com/arthelokyo/astrowind) by arthelokyo, MIT License (see `LICENSE.md`).
