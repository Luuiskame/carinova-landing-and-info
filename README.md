# Carinova — website

Marketing site for Carinova, a courier from the United States to Nicaragua (branches in Managua and Estelí).
Static site: **Astro 7 + Tailwind CSS 4**, built on the [AstroWind](https://github.com/arthelokyo/astrowind) template (MIT).

> Decisions, changelog, pending content and the launch checklist live in **[docs/PROJECT-LOG.md](docs/PROJECT-LOG.md)**.

## Run it

Requires Node ≥ 22.22.3 (developed on Node 26).

| Command                        | What it does                                                     |
| ------------------------------ | ---------------------------------------------------------------- |
| `npm install --ignore-scripts` | Install dependencies                                             |
| `npm run dev`                  | Dev server at http://localhost:4321                              |
| `npm run build`                | Production build in `dist/`                                      |
| `npm run preview`              | Serve `dist/` locally                                            |
| `npm run check`                | Type check + ESLint + Prettier                                   |
| `npm run fix`                  | Auto-fix lint and formatting                                     |
| `npm run deploy`               | Build and upload to Cloudflare (`npx wrangler login` once first) |

## Where to edit things

| What                                                                              | Where                                                                                              |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| WhatsApp numbers, email, social links, branches and hours, rates, stores, reviews | `src/data/carinova.ts`                                                                             |
| Prefilled WhatsApp message of each button                                         | `WA_MESSAGES` in `src/data/carinova.ts`                                                            |
| Frequently asked questions                                                        | `src/data/faq.ts`                                                                                  |
| Site name, domain, SEO defaults, search indexing, blog on/off                     | `src/config.yaml`                                                                                  |
| Header and footer links                                                           | `src/navigation.ts`                                                                                |
| Colours and fonts                                                                 | `src/components/CustomStyles.astro`, `fonts` in `astro.config.ts`                                  |
| Pages                                                                             | `src/pages/` (`index`, `preguntas-frecuentes`, `nosotros`, `sucursales`, `terminos`, `privacidad`) |
| Carinova sections (hero, calculator, steps, rates, branches, WhatsApp button)     | `src/components/carinova/`                                                                         |
| Blog posts (once the blog is switched on)                                         | `src/data/post/*.md`                                                                               |
| Logo copy, favicons and share image                                               | `node scripts/brand-assets.mjs <path-to-logo>` regenerates them                                    |

Values marked `TODO` in the data files are placeholders waiting for Carinova's confirmation.

## Deploy

Hosted on Cloudflare Workers as static assets (`wrangler.jsonc`). Run `npx wrangler login` once, then `npm run deploy`; the site goes to `https://carinova-web.<your-subdomain>.workers.dev`. Connecting the domain and deploying from GitHub: see Hosting notes in [docs/PROJECT-LOG.md](docs/PROJECT-LOG.md#hosting-notes).

## Credits

Built on [AstroWind](https://github.com/arthelokyo/astrowind) by arthelokyo, MIT License (see `LICENSE.md`).
