# Carinova Web — Information architecture

How the site is organised, why, and where each piece of Carinova's brief lives. Labels visitors see are quoted in Spanish, the site's default language; the English version has the same structure ("Languages"). Decisions are logged in [PROJECT-LOG.md](PROJECT-LOG.md) (D-035 to D-066).

## Principles

1. **One question, one place (MECE).** Each section answers one question a customer asks on the way from "what is this?" to "where do I pick it up?". Sections do not overlap (mutually exclusive) and together cover the whole journey (collectively exhaustive). A piece of content has one owner; other pages show a short summary that links to it, generated from the same data.
2. **One source for every fact.** Business facts live in `src/data/carinova.ts`, the structure of the offer in `src/data/services.ts`, answers in `src/data/faq.ts`. Prices are computed by `src/utils/rates.ts`; no page has a price typed into it, so the calculator, the rate cards, the worked examples, the FAQ and the e-mails cannot disagree. The English wording is built on the same facts.
3. **Customer words first, Carinova's terms second.** Section headings are the customer's question ("¿Cómo lo recibís en Nicaragua?"); Carinova's own term is the tagline above it ("Distribución final"). Jargon becomes plain words ("última milla" → "Entrega a domicilio").
4. **The same calls to action, always in the same order and look** (see "Calls to action").
5. **Honest status.** What is not available yet says "Próximamente" and carries no price or date (Los Ángeles reception, home delivery). Values Carinova has not confirmed are `TODO` in the data and listed in the project log. Nothing is promised that Carinova has not said (the stores' cards say what a store is, not what it offers; the page for companies promises a call, not a discount).
6. **Voseo** in everything a visitor reads in Spanish (see "Voice").
7. **Accessible and light.** WCAG 2.2 AA (contrast, 44 px touch targets, labels, a polite live region for the quote, link context for screen readers). Pages are static files, the same for everyone. JavaScript is shipped only where something has to happen: the calculator, the store cards, the forms (sign-up, sign-in, companies), the confirmation page and the customer's casillero. Without it the pages still read, and the stores are links.
8. **Private by default.** Nothing is stored before an e-mail is confirmed; the forms never say whether an e-mail has an account; a customer's data is only ever sent to that customer's own session (see "Visitors and customers").

## Sitemap

| Section (menu label) | The customer's question                               | Route                                                                                       | Owns                                                                                                                                                                                 |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Inicio               | ¿Qué hacen y qué hago ahora?                          | `/`                                                                                         | The promise and the calls to action; the stores customers buy from. Everything else on it is a summary of a section below, in journey order                                          |
| Cómo comprar         | ¿Cómo funciona?                                       | `/como-comprar`                                                                             | The process (4 steps) and the worked examples by category                                                                                                                            |
| Servicios            | ¿Qué opciones tengo?                                  | `/servicios`                                                                                | The six services on their three axes                                                                                                                                                 |
| Cotizador            | ¿Cuánto cuesta y cuánto tarda?                        | `/cotizador`                                                                                | The calculator, the rates, how each price is worked out                                                                                                                              |
| Sucursales           | ¿Dónde retiro?                                        | `/sucursales`                                                                               | Addresses, opening hours, each branch's WhatsApp, maps, other channels                                                                                                               |
| Ayuda                | ¿Y si tengo otra duda?                                | `/preguntas-frecuentes`, `/articulos-prohibidos`                                            | Questions and answers in six groups; the prohibited items                                                                                                                            |
| Mi cuenta            | ¿Qué recibo al registrarme, cómo me registro y entro? | `/mi-cuenta`, `/registro`, `/registro/confirmar`, `/ingresar`, `/mi-casillero`, `/empresas` | Carinova ID, reception points in the US, pickup branches; the sign-up form and its confirmation; signing in; the customer's own page; what Carinova offers companies, and their form |
| (footer only)        | ¿Quiénes son? ¿Qué condiciones aplican?               | `/nosotros`, `/terminos`, `/privacidad`                                                     | Company story and values; legal drafts                                                                                                                                               |

```
Inicio (/)
├── Cómo comprar (/como-comprar)            pasos · ejemplos por categoría
├── Servicios (/servicios)
│   ├── #transporte    Aéreo · Marítimo
│   ├── #solucion      Encomiendas · Compras asistidas (gratis)
│   └── #distribucion  Retiro en sucursal · Entrega a domicilio (próximamente)
├── Cotizador (/cotizador)                  calculadora · tarifas · cómo calculamos
├── Sucursales (/sucursales)                Managua · Bluefields
├── Ayuda (/preguntas-frecuentes)           cuenta · servicios · tarifas · tiempos · prohibidos · retiro
│   └── Artículos prohibidos (/articulos-prohibidos)
└── Mi cuenta (/mi-cuenta)                  Carinova ID · recepción en EE. UU. · retiro en Nicaragua
    ├── Abrir mi casillero (/registro) → Confirmar (/registro/confirmar)
    ├── Ingresar (/ingresar) → Mi casillero (/mi-casillero)
    └── Empresas (/empresas)
Footer: Nosotros (/nosotros) · Términos (/terminos) · Privacidad (/privacidad)
```

Every page also exists in English under `/en` ("Languages").

### The home page

Hero (promise word for word, the calls to action, the rates at a glance; each rate opens the calculator on that rate; behind it and under the text, the websites customers buy from drift by) → stores (each one opens its card; under them, how to buy without a card) → Cómo comprar (4 steps) → Servicios (3 × 2 matrix) → Mi cuenta (3 parts, and the way in for companies) → [reviews, hidden until there are real ones] → Sucursales (city and hours) → featured questions → closing band. The old "Por qué Carinova" block was removed: each of its six points repeated a section.

The stores are the one thing the home page owns besides the promise: `STORES` in `carinova.ts` feeds the hero's carousel (`StoreMarquee.astro`, decoration, hidden from screen readers), the cards (`Stores.astro`) and the FAQ's answer about stores. A card says what the store is, what people usually buy there and where it is, with one button that opens the store. Names and addresses only: the logos are the stores' trademarks.

### Mutually exclusive: who owns what

| Content                                                 | Owner                | Shown elsewhere as                                                                                                            |
| ------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Prices, transit times, the formulas                     | Cotizador            | Hero card, service facts, examples, FAQ, Empresas: computed from `RATES`                                                      |
| The process                                             | Cómo comprar         | 4 one-line steps on the home page (`PROCESS_STEPS.summary`)                                                                   |
| What each service is                                    | Servicios            | One line per service on the home page (`SERVICES.summary`); the "sin tarjeta" block under the stores quotes compras asistidas |
| Branch addresses, hours, contact                        | Sucursales           | City and hours on the home page, Mi cuenta and Nosotros                                                                       |
| What an account includes                                | Mi cuenta            | Three cards on the home page (`ACCOUNT_PARTS`)                                                                                |
| A customer's own Carinova ID, address and data          | Mi casillero         | The confirmation page and the welcome e-mail, once                                                                            |
| What Carinova offers companies                          | Empresas             | One line on the home page and in Mi cuenta; a FAQ answer                                                                      |
| The stores                                              | Inicio               | The FAQ names the first six                                                                                                   |
| Policies (payment, storage, authorised pickup, customs) | Ayuda (FAQ)          | Legal drafts state them formally                                                                                              |
| What cannot be shipped                                  | Artículos prohibidos | FAQ, confirmation page, welcome e-mail, a link in each store's card (`RESTRICTED_ITEMS`)                                      |

### Collectively exhaustive: the journey

| Stage                       | Where it is answered                                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Discover what Carinova does | Inicio                                                                                                                 |
| Understand how it works     | Cómo comprar                                                                                                           |
| Choose a service            | Servicios                                                                                                              |
| Know the price and the time | Cotizador                                                                                                              |
| Sign up                     | Mi cuenta → Abrir mi casillero; companies: Empresas                                                                    |
| Buy or send                 | Inicio (the stores), Cómo comprar (steps 2 and 3), Servicios (compras asistidas), Artículos prohibidos                 |
| Come back                   | Ingresar → Mi casillero (Carinova ID, Miami address, the customer's data)                                              |
| Follow the package          | Ayuda ("¿Cómo sé dónde está mi paquete?") and WhatsApp with the Carinova ID, from Mi casillero; no tracking system yet |
| Receive it                  | Sucursales; Servicios (entrega a domicilio, próximamente)                                                              |
| Solve a problem             | Ayuda; WhatsApp on every page                                                                                          |
| Trust the company           | Nosotros, Términos, Privacidad (footer); reviews once they exist                                                       |

Inside the sections the same rule holds: the services split on three independent axes, each into two options that do not overlap; the FAQ groups follow the journey; the rates split by how they are charged (per pound, per cubic foot, per unit); the worked examples cover each way of pricing once.

## Services: three axes

Every shipment is one choice on each axis (`SERVICE_AXES` and `SERVICES` in `src/data/services.ts`).

| Axis (tagline)          | Question                        | Options                                                 | What separates them                                              |
| ----------------------- | ------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| Modalidad de transporte | ¿Cómo viaja tu paquete?         | Aéreo · Marítimo                                        | Speed or price                                                   |
| Solución comercial      | ¿Quién lo manda a tu casillero? | Encomiendas · Compras asistidas (gratis)                | The customer or their family send it / Carinova buys it for them |
| Distribución final      | ¿Cómo lo recibís en Nicaragua?  | Retiro en sucursal · Entrega a domicilio (próximamente) | At a branch / at home                                            |

"Encomiendas" covers every package that reaches the casillero, the customer's own online purchases included, so the split with "Compras asistidas" is clean: who places the order.

## Pricing model

From Carinova's brief (`RATES` in `src/data/carinova.ts`); the math is `src/utils/rates.ts`, tested in `rates.test.ts`.

| Rate         | Charged                                                                                                             | Delivery estimate (from reception) |
| ------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Aéreo        | US$6.50 per billable pound                                                                                          | 2 a 4 días                         |
| Marítimo     | US$2.50 per billable pound or US$20 per cubic foot, whichever is more                                               | 15 a 20 días                       |
| Electrónicos | Per unit, air shipping and taxes included: celular US$30, tablet US$40, laptop US$80, Xbox US$85, PlayStation US$85 | 2 a 4 días                         |

- Billable pounds: each started pound counts (2.3 lb → 3 lb), minimum 1 lb. Both `TODO`: confirm.
- Cubic feet = length × width × height in inches ÷ 1,728, rounded to two decimals before multiplying, so the total matches the formula as shown. Brief's example: 48 × 40 × 72 = 138,240 pulg³ ÷ 1,728 = 80 pie³ × US$20 = US$1,600.
- Weight or volume, whichever is more, is the usual rule for consolidated sea cargo ([DHL, LCL rates](https://www.dhl.com/ni-es/home/global-forwarding/centro-educativo-para-el-transporte-de-carga/the-cost-drivers-of-lcl-rates.html)). It is an assumption until Carinova confirms it; it also keeps estimates on the safe side.
- "Las tarifas incluyen seguro e impuestos cuando aplique."
- Home delivery has no price: it is not available yet.

**Calculator address (a contract):** `/cotizador?tarifa=aereo|maritimo|electronicos&lb=…&largo=…&ancho=…&alto=…&celular=…&tablet=…&laptop=…&xbox=…&playstation=…&sucursal=managua|bluefields`. Field names are the parameter names, the same in English (`/en/quote?tarifa=maritimo&largo=48`): they are ids of the data, not text. `quotePath()` in `services.ts` builds these links; the hero's rates, the services, the worked examples and the formula example use them.

## Calls to action

| Level     | Label                                                                                                                   | Looks like                     | Goes to                            |
| --------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------- |
| Primary   | "Abrir mi casillero"; for a customer who is signed in, "Ir a mi casillero" ("Mi casillero" in the header)               | Orange button, navy text       | `/registro`; `/mi-casillero`       |
| Secondary | "Cotizar mi envío"                                                                                                      | Outlined button                | `/cotizador` (or filled in)        |
| Tertiary  | "Ayuda por WhatsApp" (or what the link asks for, e.g. "Pedir una compra asistida", "Enviar mi cotización por WhatsApp") | Underlined link, WhatsApp icon | WhatsApp with this place's message |

Rules:

- Only the first two are buttons. Any other link ("Ver todos los servicios", "Cómo llegar", "Ingresar") is a text link, so the hierarchy reads at a glance. Two exceptions, both in the stores section and both asked for: the WhatsApp **button** of "¿No tenés método de pago, como tarjeta?" (green with navy text: there WhatsApp is how the purchase is made, not help) and the outlined button of a store's card ("Ir a amazon.com": opening the store is what the card is for).
- The buttons of the forms and of the pages a customer acts on ("Enviarme un código", "Ingresar", "Enviar solicitud", "Confirmar y abrir mi casillero") are the page's own action and are orange.
- First person ("mi casillero", "mi envío"): the label says what the visitor gets.
- `CtaGroup.astro` renders them in order, `ClosingCta.astro` closes every page with them, `WhatsAppHelp.astro` is the tertiary link (`variant="button"` for the one exception). Labels come from `CTA` in `carinova.ts`.
- A section leaves out a call to action when it is the page itself (no "Cotizar mi envío" on the calculator) or a distraction (the sign-up page only offers signing in and WhatsApp help; the page for companies does not offer the personal sign-up).
- Where a page has several WhatsApp links, each carries hidden context for screen readers ("Ayuda por WhatsApp (Managua)").

## Visitors and customers

A customer who is signed in already has a casillero, so "Abrir mi casillero" gives way to their casillero everywhere, and "Ingresar" disappears.

- The pages are static files, the same for everyone. Whatever depends on being signed in is in the page twice, marked `data-auth="out"` (visitors) or `data-auth="in"` (customers), and CSS shows one of them (`tailwind.css`). `SessionState.astro` sets `data-session` on `<html>` before the first paint, from a cookie that only says "a session exists".
- That cookie grants nothing. What a customer can see is decided by the Worker, with the session cookie, which the page's scripts cannot read. `/mi-casillero` holds no data of its own: its script asks `GET /api/account`.
- Where it applies: the header button and the phone menu, `CtaGroup` (every hero and closing band), the calculator, the first step of "Cómo comprar", the store card ("Abrí tu casillero para recibirla" / "Ver mi dirección de Miami"), the footer, the sign-up page (which says "Ya tenés un casillero abierto en este navegador") and the confirmation page.
- Signing in (`/ingresar`): the e-mail of the casillero, then a 6-digit code sent to it. No password. The page never says whether an e-mail has a casillero. Confirming a sign-up signs the new customer in. Numbers (digits, minutes, attempts, days) are in `src/data/account.ts`; how it is kept safe is in the README ("Signing in").

## WhatsApp messages

One prefilled message per place (`WA_MESSAGES` in `carinova.ts`, and in English in `en/carinova.ts`), so the team sees what the customer was looking at and which link they used. Customers write them, so they address Carinova as "ustedes". `src/data/messages.test.ts` fails if two places share a message, in either language.

| Place                                                                 | Message key                                                                        |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Floating button, every page                                           | `floating[path]` (by the page's Spanish path), `floatingDefault` (404)             |
| Footer                                                                | `footer`                                                                           |
| Inicio: hero / the button under the stores / questions / closing      | `homeHero` / `storesAssist` / `homeFaq` / `homeClosing`                            |
| Cómo comprar: each example / closing                                  | `example(category)` / `howToClosing`                                               |
| Servicios: each service / closing                                     | `services[id]` / `servicesClosing`                                                 |
| Cotizador: calculator / closing                                       | `quote(shipment, city, total)` or `quoteEmpty` / `quoteClosing`                    |
| Sucursales: each branch / closing                                     | `branch(city)` / `branchesClosing`                                                 |
| Mi cuenta: closing                                                    | `accountClosing`                                                                   |
| Abrir mi casillero: help box / error                                  | `signupAssist` / `signupHelp`                                                      |
| Confirmation: done / error                                            | `customer(code)` (`accountExisting` until the script knows the ID) / `confirmHelp` |
| Ingresar: help box / error                                            | `signinHelp` / `signinError`                                                       |
| Mi casillero: packages / changing the data / error                    | `mailbox(code)` / `mailboxUpdate(code)` / `mailboxError`                           |
| Empresas: help box / error / closing                                  | `accountCompany` / `businessHelp` / `businessClosing`                              |
| Welcome e-mail                                                        | `welcomeEmail(code)`                                                               |
| Preguntas frecuentes / Artículos prohibidos / Nosotros / 404 closings | `faqClosing` / `restricted` / `aboutClosing` / `notFound`                          |

## Languages

Spanish is the default language and lives at the root. English is a translation of the same pages under `/en`, switched by `ENGLISH_ENABLED` in `src/i18n/locales.ts` (D-049, D-050).

- **Search engines.** Each page has one address per language, and each is its own canonical address. The two name each other with `hreflang`, Spanish also as `x-default`; the sitemap lists both. The English pages can be found in English and never take the place of the Spanish ones. With the switch off, no `/en` page is built and no page mentions another language.
- **Addresses** (`src/i18n/routes.ts`) are translated: `/como-comprar` → `/en/how-to-buy`, `/servicios` → `/en/services`, `/cotizador` → `/en/quote`, `/sucursales` → `/en/branches`, `/preguntas-frecuentes` → `/en/faq`, `/articulos-prohibidos` → `/en/prohibited-items`, `/mi-cuenta` → `/en/my-account`, `/registro` → `/en/sign-up`, `/registro/confirmar` → `/en/sign-up/confirm`, `/ingresar` → `/en/sign-in`, `/mi-casillero` → `/en/my-mailbox`, `/empresas` → `/en/business`, `/nosotros` → `/en/about`, `/terminos` → `/en/terms`, `/privacidad` → `/en/privacy`; the home page is `/en`. Anchors and query parameters are not translated (`/en/services#compras-asistidas`, `/en/quote?tarifa=maritimo`).
- **One page file, two languages.** An English address renders the same file in `src/pages` as its Spanish address; the file reads its language from the address (`i18n(Astro)` in `src/i18n`). Code and data keep using the Spanish paths; `href('/cotizador')` gives the address of the language being rendered.
- **Where the words are.** Facts once, in `src/data/carinova.ts`, `services.ts`, `signup.ts`, `faq.ts`; their English wording in `src/data/en/`, built on those facts (`content(locale)`). The copy of a page or a component is in that file, both languages side by side (`const t = { es: {…}, en: {…} }[locale]`). The legal texts are one file per language (`src/data/legal/`). Scripts carry no text: the page hands them its sentences.
- **What is not translated:** the Miami address and how the name is written in it ("Aéreo" is what the warehouse reads), Nicaragua's departments, store names, ids, anchors and the calculator's parameters.
- **Terms.** "Casillero" is "mailbox"; "encomiendas" is "packages"; "compras asistidas" is "assisted purchases"; "retiro en sucursal" is "branch pickup". The calls to action are "Open my mailbox", "Quote my shipment", "Help on WhatsApp".
- **The Worker** answers in the language of the form (`lang`), and the customer's e-mails are in the language they signed up in (`customers.locale`). What Carinova's team receives is always in Spanish and says which language the customer uses.
- **Switching.** The header ("EN" / "ES") and the footer link to the same page in the other language, keeping what the address carries (a filled-in calculator). A page without a translation (the blog, once it is on) leads to the other language's home page.
- **To add a page:** create it in `src/pages`, add its two addresses to `ROUTES`, write its copy in both languages and give it a floating WhatsApp message in both. `src/i18n/routes.test.ts` and `src/data/content.test.ts` fail when one of these is missing.

## Voice: voseo

Carinova speaks to customers with the voseo of Nicaragua and Central America, in its written ("culto") form:

| Form                        | Use                      | Examples                                                                |
| --------------------------- | ------------------------ | ----------------------------------------------------------------------- |
| Present indicative          | voseo                    | tenés, podés, querés, necesitás, preferís, recibís, retirás, sos        |
| Affirmative imperative      | voseo                    | abrí, comprá, cotizá, elegí, revisá, usá, pasá, escribinos, consultanos |
| Imperative + pronoun        | voseo, no written accent | abrilo, registrate, guardalo, usala, intentalo, corregilo, mandanos     |
| Subjunctive (and negatives) | general Spanish forms    | "cuando compres", "para que la retires", "cuando nos escribas"          |
| Pronoun after a preposition | vos                      | "por vos", "para vos"                                                   |

Never "tú" forms (tienes, escríbenos), never "usted". The calls to action stay as infinitives in first person ("Abrir mi casillero"). Messages customers send to Carinova use "ustedes" ("¿Me ayudan?").

In English the voice is the same person: direct, in the second person, short sentences, no slang ("You pay for the product and the shipping"). Messages customers send start with "Hi Carinova 👋".

## Navigation

- **Header:** the six sections in journey order (Cómo comprar, Servicios, Cotizador, Sucursales, Ayuda, Mi cuenta), then the language link ("EN"), "Ingresar" and the "Abrir mi casillero" button. All of it fits on one line from 1024 px (checked at 1024–1536 px, in both languages, for visitors and customers); between 1024 and 1279 px "Ingresar" is its icon. The phone menu lists "Abrir mi casillero" first, then the six sections, with the language link, "Ingresar" and the button in a bar below. For a customer who is signed in, "Abrir mi casillero" is "Mi casillero" and "Ingresar" is gone.
- **Footer:** Servicios (the six services), Clientes (Abrir mi casillero, Ingresar, Mi cuenta, Cómo comprar, Cotizar mi envío, Empresas, Artículos prohibidos), Carinova (Nosotros, Sucursales, Preguntas frecuentes), Contacto (WhatsApp, e-mail once set); Términos, Privacidad and the other language; social links.

## Open points for Carinova

Tracked in the project log ("Pending content"): weight-or-volume rule for sea, rounding of pounds and cubic feet and the minimum weight, volumetric weight by air, how assisted purchases are paid, what companies are offered beyond the public rates, whether the account should store a pickup branch, when Los Ángeles and home delivery start, whether the English version is published and who reads it, and a tracking portal.
