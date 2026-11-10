# Carinova — website

Marketing site for Carinova, a courier from the United States to Nicaragua (branches in Managua and Bluefields), with an online sign-up that opens a customer's mailbox ("casillero").

- **Pages:** static, built with **Astro 7 + Tailwind CSS 4** on the [AstroWind](https://github.com/arthelokyo/astrowind) template (MIT).
- **Sign-up backend:** a small Cloudflare Worker in `worker/` (two endpoints), e-mail through Resend, customers in Neon (PostgreSQL).
- **Hosting:** Cloudflare Workers.

> Decisions, changelog, pending content and the launch checklist live in **[docs/PROJECT-LOG.md](docs/PROJECT-LOG.md)**.

## Run it

Requires Node ≥ 22.22.3 (developed on Node 26).

| Command                        | What it does                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `npm install --ignore-scripts` | Install dependencies                                                                 |
| `npm run dev`                  | Dev server at http://localhost:4321, sign-up API included                            |
| `npm run build`                | Production build in `dist/`                                                          |
| `npm run preview`              | Build, then run the site and the Worker as Cloudflare does (http://localhost:8787)   |
| `npm run check`                | Type check + ESLint + Prettier                                                       |
| `npm test`                     | Unit tests of the sign-up backend                                                    |
| `npm run fix`                  | Auto-fix lint and formatting                                                         |
| `npm run deploy`               | Build and upload to Cloudflare (a push to `main` deploys too, if the repo is linked) |

## Where to edit things

| What                                                                                                                    | Where                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| WhatsApp number, email, social links, branches and hours, rates, stores, reviews                                        | `src/data/carinova.ts`                                                                                                                    |
| The Miami address customers receive, and the prohibited items                                                           | `MIAMI_ADDRESS` and `RESTRICTED_ITEMS` in `src/data/carinova.ts`                                                                          |
| Prefilled WhatsApp message of each button                                                                               | `WA_MESSAGES` in `src/data/carinova.ts`                                                                                                   |
| Sign-up form: countries, departments and states, the examples shown as placeholders; how long a confirmation link lasts | `src/data/signup.ts`                                                                                                                      |
| Frequently asked questions                                                                                              | `src/data/faq.ts`                                                                                                                         |
| Site name, domain, SEO defaults, search indexing, blog on/off                                                           | `src/config.yaml`                                                                                                                         |
| Header and footer links                                                                                                 | `src/navigation.ts`                                                                                                                       |
| Colours and fonts                                                                                                       | `src/components/CustomStyles.astro`, `fonts` in `astro.config.ts`                                                                         |
| Pages                                                                                                                   | `src/pages/` (`index`, `registro`, `registro/confirmar`, `articulos-prohibidos`, `preguntas-frecuentes`, `nosotros`, `sucursales`, legal) |
| Carinova sections (hero, calculator, steps, rates, branches, sign-up form…)                                             | `src/components/carinova/`                                                                                                                |
| The e-mails customers receive                                                                                           | `worker/signup/emails.ts`                                                                                                                 |
| Sign-up rules (what counts as a valid name, phone, postal code…)                                                        | `worker/signup/validate.ts`                                                                                                               |
| Blog posts (once the blog is switched on)                                                                               | `src/data/post/*.md`                                                                                                                      |
| Logo copy, favicons and share image                                                                                     | `node scripts/brand-assets.mjs <path-to-logo>` regenerates them                                                                           |

Values marked `TODO` in the data files are placeholders waiting for Carinova's confirmation.

## Sign-up backend

How a customer gets a mailbox:

1. They fill in the form on `/registro`. `POST /api/signup` validates it and e-mails a confirmation link. Nothing is stored: the link carries the form, encrypted.
2. The link opens `/registro/confirmar`; its button calls `POST /api/signup/confirm`, which inserts the customer in the database. The database assigns the customer number (`CNV-00001`, `CNV-00002`…).
3. The page shows the number and the Miami address, and a welcome e-mail repeats them. If `SIGNUP_NOTIFY_TO` is set, Carinova's team gets an e-mail too.

Opening the same link twice, or signing up again with the same e-mail, returns the existing customer.

| File                        | What it is                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `worker/index.ts`           | The Cloudflare Worker: `/api/*` goes to the API, everything else is the static site |
| `worker/api.ts`             | The two endpoints                                                                   |
| `worker/signup/validate.ts` | Validation and normalisation of the form                                            |
| `worker/signup/token.ts`    | The encrypted confirmation link                                                     |
| `worker/signup/emails.ts`   | The e-mails (HTML and plain text)                                                   |
| `worker/signup/mailer.ts`   | Sending through Resend                                                              |
| `worker/signup/store.ts`    | Saving the customer in Neon                                                         |
| `worker/dev-plugin.ts`      | Serves the same API inside `npm run dev`                                            |
| `db/schema.sql`             | The `customers` table                                                               |

### Settings

Locally they go in `.env` (copy `.env.example`; git ignores it). In production they are **secrets** of the Worker: `npx wrangler secret put <NAME>` for each one, `npx wrangler secret bulk .env` to upload every line of your `.env` at once, or Cloudflare dashboard → the Worker → Settings → Variables and Secrets → type "Secret".

| Name                  | Required | Value                                                                                                                                                                       |
| --------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`      | yes      | Resend API key                                                                                                                                                              |
| `EMAIL_FROM`          | yes      | Sender, e.g. `Carinova <casillero@carinovanic.com>`; an address alone is sent as `Carinova <address>`. The domain must be verified in Resend                                |
| `DATABASE_URL`        | yes      | Neon connection string as the dashboard gives it with "Connection pooling" on: the host contains `-pooler` and it ends in `/neondb?sslmode=require&channel_binding=require` |
| `SIGNUP_TOKEN_SECRET` | yes      | Random text, 32+ characters: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`                                                                  |
| `SIGNUP_NOTIFY_TO`    | no       | Inbox that gets an e-mail for every new customer                                                                                                                            |

Create the table once by running `db/schema.sql` in the Neon SQL Editor.

While a required setting is missing in production, the API answers `503`, the form tells the visitor to write on WhatsApp, and the Worker's log (Cloudflare dashboard → the Worker → Logs) names what is missing.

### Trying it locally

`npm run dev` works with an empty `.env`: confirmation links and e-mails are printed in the terminal instead of sent, and customers are kept in memory until the server restarts. Each setting you add to `.env` switches that part to the real service.

`npm run preview` runs the real Worker and needs the real settings in `.env`.

With the real settings in `.env`, a sign-up on your machine is a real one: Resend sends the e-mails and the customer is inserted in the database `DATABASE_URL` points to, taking the next customer number.

- To test sending without writing to a real inbox, sign up as `delivered@resend.dev` (Resend's test address). The confirmation link then cannot be opened, so use your own address to try the whole flow.
- Remove test customers afterwards in the Neon SQL Editor: `DELETE FROM customers WHERE email = '<address>';`. If the table is empty again, `ALTER TABLE customers ALTER COLUMN id RESTART WITH 1;` gives the next customer `CNV-00001`.

## Credits

Built on [AstroWind](https://github.com/arthelokyo/astrowind) by arthelokyo, MIT License (see `LICENSE.md`).
