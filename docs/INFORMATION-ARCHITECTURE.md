# Carinova Web — Information architecture

How the site is organised, why, and where each piece of Carinova's material lives. Labels visitors see are quoted in Spanish, the site's default language; the English version has the same structure ("Languages"). Decisions are logged in [PROJECT-LOG.md](PROJECT-LOG.md) (D-035 to D-084). The database behind the customer's account is in [DATABASE.md](DATABASE.md).

Two sources from Carinova shape the site: the brief of 2026-11-10 (services, rates, what an account includes) and the prototype of 2026-11-13 (a one-page design), which sets the home page's sections, their order and wording, the navigation, the footer, the palette and the vocabulary (D-068 to D-077).

## Principles

1. **One question, one place (MECE).** Each page answers one question a customer asks on the way from "what is this?" to "where is my package?". Pages do not overlap (mutually exclusive) and together cover the whole journey (collectively exhaustive). A piece of content has one owner; other places show a short summary that links to it, generated from the same data.
2. **One source for every fact.** Business facts live in `src/data/carinova.ts`, the structure of the offer in `src/data/services.ts`, answers in `src/data/faq.ts`, the statuses of packages and payments in `src/data/account.ts`. Prices are computed by `src/utils/rates.ts`; no page has a price typed into it, so the calculator, the rate cards, the worked examples, the FAQ and the e-mails cannot disagree. The English wording is built on the same facts.
3. **Customer words first, Carinova's terms second.** Section headings are the customer's question or what they get ("¿Puede ingresar a Nicaragua?", "Sabé en qué etapa va tu envío"); Carinova's own term is the small label above it ("Seguimiento"). Jargon becomes plain words ("última milla" → "Entrega a domicilio").
4. **The same calls to action, always in the same order and look** (see "Calls to action").
5. **Honest status.** What is not available yet says "Próximamente" and carries no price or date: today, only the Los Ángeles address. What has a charge that is not published says so ("Cargo adicional": home delivery). Values Carinova has not confirmed are `TODO` in the data and listed in the project log. Nothing is promised that Carinova has not said: a store's card says what the store is, the page for companies promises an evaluation, and the article search never answers "allowed".
6. **Voseo** in everything a visitor reads in Spanish (see "Voice").
7. **Accessible and light.** WCAG 2.2 AA (contrast, 44 px touch targets, labels, live regions for the quote and the search, link context for screen readers, dialogs that take and return the focus). Pages are static files, the same for everyone. JavaScript is shipped only where something has to happen: the calculator, the stores, the article search, the dialogs, the forms, the confirmation page and the customer's account. Without it the pages still read: the stores are links, "Ingresá" leads to the sign-in page, a product link is sent to WhatsApp as it is.
8. **Private by default.** Nothing is stored before an e-mail is confirmed; the forms never say whether an e-mail has an account; a customer's data, packages and payments are only ever sent to that customer's own session (see "Visitors and customers").

## Sitemap

| Page (menu label)                     | The customer's question                       | Route                                                         | Owns                                                                                                                                                                              |
| ------------------------------------- | --------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inicio                                | ¿Qué hacen y qué hago ahora?                  | `/`                                                           | The promise and the calls to action; "Compras por vos" (the stores and the request by link); the article search. Everything else on it is a summary of a page below               |
| Servicios                             | ¿Qué opciones tengo?                          | `/servicios`                                                  | The six services on their three axes                                                                                                                                              |
| Tarifas (the calculator)              | ¿Cuánto cuesta y cuánto tarda?                | `/cotizador`                                                  | The calculator, the rates, how each price is worked out                                                                                                                           |
| Cómo funciona                         | ¿Cómo funciona?                               | `/como-comprar`                                               | The process (5 steps) and the worked examples by category                                                                                                                         |
| Empresas                              | ¿Qué hay para mi empresa?                     | `/empresas`                                                   | What Carinova evaluates for companies, and their form                                                                                                                             |
| Ayuda                                 | ¿Y si tengo otra duda? ¿Puede ingresar?       | `/preguntas-frecuentes`, `/articulos-prohibidos`              | Questions and answers in six groups; the three lists of what cannot be shipped                                                                                                    |
| Mi cuenta ("Crear cuenta", "Ingresá") | ¿Qué recibo, cómo entro, dónde va mi paquete? | `/mi-cuenta`, `/registro`, `/registro/confirmar`, `/ingresar` | For a visitor: what an account includes. For a customer: their Carinova ID, packages, payments, address in the United States and data. The sign-up, its confirmation, the sign-in |
| Sucursales (footer: "Estamos cerca")  | ¿Dónde retiro?                                | `/sucursales`                                                 | Addresses, opening hours, each branch's WhatsApp, maps, other channels                                                                                                            |
| (footer only)                         | ¿Quiénes son? ¿Qué condiciones aplican?       | `/nosotros`, `/terminos`, `/privacidad`                       | Company story and values; legal drafts                                                                                                                                            |

```
Inicio (/)
├── #tarifas         Aéreo · Marítimo, cada uno abre su detalle
├── #cotizador       la calculadora
├── #compras         Compras por vos: pegá el enlace · las tiendas
├── #como-funciona   5 pasos
├── #verificador     ¿Puede ingresar a Nicaragua? (buscador + las tres listas)
├── #empresas        Carinova para negocios
├── #rastreo         las etapas de un paquete · ingresar
├── #cobertura       Managua · Bluefields · entrega a domicilio
└── #preguntas       diez preguntas
Servicios (/servicios)
├── #transporte    Aéreo · Marítimo
├── #solucion      Encomiendas · Compras asistidas
└── #distribucion  Retiro en sucursal · Entrega a domicilio (cargo adicional)
Tarifas (/cotizador)                        calculadora · tarifas · cómo calculamos
Cómo funciona (/como-comprar)               pasos · ejemplos por categoría
Empresas (/empresas)                        soluciones · solicitud
Ayuda (/preguntas-frecuentes)               cuenta · servicios · tarifas · tiempos · prohibidos · retiro
└── ¿Puede ingresar? (/articulos-prohibidos)
Mi cuenta (/mi-cuenta)                      visitante: qué incluye · cliente: #paquetes · #pagos · #direccion · #datos
├── Crear cuenta (/registro) → Confirmar (/registro/confirmar)
└── Ingresar (/ingresar, o el diálogo de "Ingresá" en cualquier página)
Sucursales (/sucursales)                    Managua · Bluefields
Footer: Nosotros (/nosotros) · Condiciones del servicio (/terminos) · Privacidad (/privacidad)
```

Every page also exists in English under `/en` ("Languages").

### The home page

The sections and their order are the prototype's (`src/pages/index.astro`):

| #   | Section (anchor)                  | Component               | What it does                                                                                                                                                                                                      |
| --- | --------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| —   | Strip above the header            | `TopStrip.astro`        | "Conectamos Estados Unidos con Nicaragua" and, from tablets up, the route: Miami · Los Ángeles (próximamente) → Managua · Bluefields                                                                              |
| 1   | Hero                              | `HomeHero.astro`        | "Carinova · Envíos que unen", "De Estados Unidos hasta vos.", the promise, "Cotizá tu envío" and "Crear cuenta"                                                                                                   |
| 2   | Modalidades (`#tarifas`)          | `ShippingModes.astro`   | Aéreo ("Más rápido") and Marítimo ("Más económico") with price and time; each opens a dialog with its detail and a link to the calculator on that rate                                                            |
| 3   | Calculadora (`#cotizador`)        | `QuoteCalculator.astro` | The calculator itself, the same one as on `/cotizador`                                                                                                                                                            |
| 4   | Compras por vos (`#compras`)      | `PersonalShopper.astro` | Paste a product's link and it becomes the request on WhatsApp; the twelve stores as a carousel with categories; each store opens its card (what it is, "Ir al sitio de la tienda", "Pedir que compremos por vos") |
| 5   | Cómo funciona (`#como-funciona`)  | `HowItWorks.astro`      | The five steps, one line each                                                                                                                                                                                     |
| 6   | ¿Puede ingresar? (`#verificador`) | `ItemChecker.astro`     | A search over the three lists of what cannot be shipped, and the lists                                                                                                                                            |
| 7   | Empresas (`#empresas`)            | `BusinessBand.astro`    | One line for companies and the way to their page                                                                                                                                                                  |
| 8   | Seguimiento (`#rastreo`)          | `TrackingBand.astro`    | The stages of a package and the way in: sign in (a visitor) or "Ver mis paquetes" (a customer)                                                                                                                    |
| 9   | Cobertura (`#cobertura`)          | `Coverage.astro`        | The branches on a map of Nicaragua, and home delivery                                                                                                                                                             |
| —   | Reseñas                           | (in the page)           | Hidden until there are real reviews                                                                                                                                                                               |
| 10  | Preguntas (`#preguntas`)          | `HomeFaq.astro`         | The prototype's ten questions (`featured` in `faq.ts`)                                                                                                                                                            |
| 11  | Cierre                            | `HomeClosing.astro`     | "Formá parte de nuestro equipo" and the final call: "¿Qué esperás para enviar?"                                                                                                                                   |

The home page owns two things besides the promise. **The stores**: `STORES` in `carinova.ts` feeds the carousel, the card and the FAQ's answer about stores; names and addresses only (the logos are the stores' trademarks). **The article search**: it reads the same `RESTRICTED_ITEMS` as `/articulos-prohibidos`, which owns the lists.

### Mutually exclusive: who owns what

| Content                                                 | Owner                           | Shown elsewhere as                                                                                                          |
| ------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Prices, transit times, the formulas                     | Tarifas (`/cotizador`)          | The two cards and the calculator on the home page, service facts, examples, FAQ, Empresas: computed from `RATES`            |
| The process                                             | Cómo funciona                   | Five one-line steps on the home page (`PROCESS_STEPS.summary`)                                                              |
| What each service is                                    | Servicios                       | One line per service where it is mentioned (`SERVICES.summary`)                                                             |
| Branch addresses, hours, contact                        | Sucursales                      | Cities on the home page's map and in the strip above the header; city and hours in Mi cuenta and Nosotros                   |
| What an account includes                                | Mi cuenta (the visitor's view)  | The tracking section of the home page (`ACCOUNT_PARTS`, `PACKAGE_STAGES`)                                                   |
| A customer's own ID, packages, payments, address, data  | Mi cuenta (the customer's view) | The confirmation page and the welcome e-mail (ID and address), once                                                         |
| What Carinova offers companies                          | Empresas                        | One band on the home page; a FAQ answer                                                                                     |
| The stores                                              | Inicio                          | The FAQ names the first six                                                                                                 |
| Policies (payment, storage, authorised pickup, customs) | Ayuda (FAQ)                     | Legal drafts state them formally                                                                                            |
| What cannot be shipped (three lists)                    | `/articulos-prohibidos`         | The search on the home page, the FAQ, the confirmation page, the welcome e-mail, step 3 of the process (`RESTRICTED_ITEMS`) |

### Collectively exhaustive: the journey

| Stage                       | Where it is answered                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Discover what Carinova does | Inicio                                                                                                                   |
| Understand how it works     | Cómo funciona                                                                                                            |
| Choose a service            | Servicios                                                                                                                |
| Know the price and the time | Tarifas (the calculator, also on the home page)                                                                          |
| Know if it can be shipped   | Inicio (the search), `/articulos-prohibidos`                                                                             |
| Sign up                     | Crear cuenta; companies: Empresas                                                                                        |
| Buy or send                 | Inicio (the stores, "Compras por vos"), Cómo funciona (steps 3 and 4), Servicios (compras asistidas)                     |
| Come back                   | "Ingresá" in the header (a dialog on any page) or `/ingresar` → Mi cuenta                                                |
| Follow the package          | Mi cuenta → Paquetes: at the warehouse, shipped, delivered, each with its history. WhatsApp with the package's reference |
| Pay                         | Mi cuenta → Pagos: each invoice with its lines, what was paid and what is owed. Paying itself is arranged with the team  |
| Receive it                  | Sucursales; Servicios (entrega a domicilio, with an extra charge)                                                        |
| Solve a problem             | Ayuda; WhatsApp on every page                                                                                            |
| Trust the company           | Nosotros, Condiciones, Privacidad (footer); reviews once they exist                                                      |

Inside the pages the same rule holds: the services split on three independent axes, each into two options that do not overlap; the FAQ groups follow the journey; the rates split by how they are charged (per pound, per cubic foot, per unit); what cannot be shipped splits into three lists with no item on two of them; the worked examples cover each way of pricing once.

## Services: three axes

Every shipment is one choice on each axis (`SERVICE_AXES` and `SERVICES` in `src/data/services.ts`).

| Axis (label)            | Question                       | Options                                                    | What separates them                                              |
| ----------------------- | ------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| Modalidad de transporte | ¿Cómo viaja tu paquete?        | Aéreo · Marítimo                                           | Speed or price                                                   |
| Solución comercial      | ¿Quién hace la compra?         | Encomiendas · Compras asistidas                            | The customer or their family send it / Carinova buys it for them |
| Distribución final      | ¿Cómo lo recibís en Nicaragua? | Retiro en sucursal · Entrega a domicilio (cargo adicional) | At a branch / at home                                            |

"Encomiendas" covers every package that reaches Carinova's warehouse in the customer's name, their own online purchases included, so the split with "Compras asistidas" is clean: who places the order. What an assisted purchase costs is not published (the prototype does not say it is free, and the site no longer does: D-076).

## Pricing model

From Carinova (`RATES` in `src/data/carinova.ts`); the math is `src/utils/rates.ts`, tested in `rates.test.ts`.

| Rate         | Charged                                                                                    | Delivery estimate (from physical reception) |
| ------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------- |
| Aéreo        | US$6.50 per pound                                                                          | 3 a 4 días                                  |
| Marítimo     | US$2.50 per pound, **or** US$20 per cubic foot                                             | 15 a 20 días                                |
| Electrónicos | Per unit, by air: celular US$30, tablet US$40, laptop US$80, Xbox US$85, PlayStation US$85 | 3 a 4 días                                  |

- **One basis at a time.** A quote is by weight, by volume (sea) or per unit (a device): they are not added and not compared ("Elegí una sola base de cálculo"). Which one applies to a shipment is confirmed on reception.
- **Exact arithmetic**: pounds × price, with no rounding up to whole pounds and no minimum; packages × pounds each. Cubic feet = length × width × height ÷ 1,728 in inches, or ÷ 28,316.85 in centimetres; × pieces. Carinova's example: 48 × 40 × 72 = 138,240 pulg³ ÷ 1,728 = 80 pie³ × US$20 = US$1,600.
- The calculator's result is an estimate, and says so: the final amount depends on the weight, the measures, the contents and any additional charges checked on reception. It does not include the price of the products or home delivery.
- The notes under the rates (`RATES.notes`) are the prototype's: times count from physical reception and can vary; rates contemplate insurance and taxes when they apply to the shipment.

**Calculator address (a contract):** `/cotizador?tarifa=aereo|maritimo&base=peso|volumen|<device>&lb=…&paquetes=…&largo=…&ancho=…&alto=…&unidad=cm|pulg&bultos=…&unidades=…`. Field names are the parameter names, the same in English (`/en/quote?tarifa=maritimo&lb=18`): they are ids of the data, not text. The home page takes the same parameters (`/?tarifa=maritimo#cotizador`). Addresses from before the change still open (`?tarifa=electronicos&celular=1`). `quotePath()` in `services.ts` builds these links; the rate cards, the services, the worked examples and the formula example use them.

## What cannot be shipped

Three lists, as Carinova gave them (`RESTRICTED_ITEMS` in `carinova.ts`, in the order of `RESTRICTED_ORDER`):

| List                                        | Means                                        | Items                                                                                                                                                   |
| ------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No autorizados para traer aún               | Carinova is not authorised to bring them yet | Carros, motos, maquinaria pesada                                                                                                                        |
| Prohibidos para recepción y transporte      | Not received and not transported             | Armas, municiones y sus accesorios; tabaco, cigarrillos y derivados; cigarrillos electrónicos; accesorios para aeronaves; transmisores de radio; drones |
| No ingresan por aéreo, pero sí por marítimo | They cannot fly: they come by sea            | Productos inflamables, baterías de litio sueltas, body spray, perfumes, aerosoles                                                                       |

The search on the home page compares whole words of what the visitor types with the words of each item (`match`, without accents; the English page also understands the Spanish words). When an item is on a list it names the list; when a text matches two lists the strictest answers (prohibited, then not yet, then sea only). **It never says an article can be shipped**: what is on no list gets "No aparece en nuestras listas" and a WhatsApp link with the article in the message, because the lists are not the whole of customs law.

## Calls to action

| Level     | Label                                                                                                              | Looks like                     | Goes to                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------- |
| Primary   | "Crear cuenta"; for a customer who is signed in, "Ir a mi cuenta" ("Mi cuenta" in the header)                      | Orange button, navy text       | `/registro`; `/mi-cuenta`                                                 |
| Secondary | "Cotizá tu envío"                                                                                                  | Outlined button                | `/cotizador` (or filled in)                                               |
| Tertiary  | "Ayuda por WhatsApp" (or what the link asks for: "Pedir una compra asistida", "Enviar mi cotización por WhatsApp") | Underlined link, WhatsApp icon | WhatsApp with this place's message                                        |
| Header    | "Ingresá" · "Rastreá tu paquete" (from 1280 px)                                                                    | Text link · outlined button    | The sign-in dialog · `/#rastreo`, or `/mi-cuenta#paquetes` for a customer |

Rules:

- The labels come from `CTA` in `carinova.ts` and are the prototype's words. In the hero the order is the prototype's: "Cotizá tu envío" first (orange), "Crear cuenta" second (outlined).
- Only the primary and the secondary are buttons in the body of a page; any other link ("Ver sucursales", "Revisar artículo") is a text link, so the hierarchy reads at a glance. Exceptions, each one the thing its section is for: the button of the product-link form ("Preparar solicitud"), the two buttons of a store's card (the store's site, the assisted purchase), the buttons that open a rate's detail, and the final band's button on orange (navy).
- The buttons of the forms and of the pages a customer acts on ("Enviarme un código", "Ingresar", "Enviar solicitud", "Confirmar y crear mi cuenta") are the page's own action and are orange.
- `CtaGroup.astro` renders them in order, `ClosingCta.astro` closes every inner page with them, `WhatsAppHelp.astro` is the tertiary link.
- A section leaves out a call to action when it is the page itself (no "Cotizá tu envío" on the calculator) or a distraction (the sign-up page only offers signing in and WhatsApp help; the page for companies does not offer the personal sign-up).
- Where a page has several WhatsApp links, each carries hidden context for screen readers ("Ayuda por WhatsApp (Managua)").

## Visitors and customers

A customer who is signed in already has an account, so "Crear cuenta" gives way to their account everywhere, and "Ingresá" disappears.

- The pages are static files, the same for everyone. Whatever depends on being signed in is in the page twice, marked `data-auth="out"` (visitors) or `data-auth="in"` (customers), and CSS shows one of them (`tailwind.css`). `SessionState.astro` sets `data-session` on `<html>` before the first paint, from a cookie that only says "a session exists".
- That cookie grants nothing. What a customer can see is decided by the Worker, with the session cookie, which the page's scripts cannot read.
- **`/mi-cuenta` is one page with two views.** A visitor reads what an account includes (Carinova ID, the address in the United States with Los Ángeles as "Próximamente", packages, payments) and the ways in. A customer gets their account (`AccountPanel.astro`): it asks the Worker for `GET /api/account` and `GET /api/account/activity` and fills four sections: **Paquetes** (Todos / En bodega / Enviados / Entregados; each package with its reference, status, facts and history), **Pagos** (each invoice with its lines, payments, what was paid and what is owed), **Dirección** (the Miami address with their name as the warehouse reads it; Los Ángeles as an option that says "Próximamente"), **Datos**. The page holds no customer data of its own.
- Packages, invoices and payments are written by Carinova's team in the back office, which is not built yet: until then those lists are empty and say so ([BACKEND-HANDOFF.md](BACKEND-HANDOFF.md)).
- Where the two versions apply: the header's links and buttons and the phone menu, `CtaGroup` (every hero and closing band), the home hero, the calculator, the steps, the tracking section, the store card, the footer, the sign-up page and the confirmation page.
- **Signing in**: "Ingresá" in the header opens a dialog on whatever page the visitor is on (`SigninDialog.astro`; the same form as `/ingresar`, which stays for links and for browsers without scripts): the e-mail of the account, then a 6-digit code sent to it. No password. It never says whether an e-mail has an account. From the dialog a customer lands on their account. Confirming a sign-up signs the new customer in. Numbers (digits, minutes, attempts, days) are in `src/data/account.ts`; how it is kept safe is in the README ("Signing in").

## WhatsApp messages

One prefilled message per place (`WA_MESSAGES` in `carinova.ts`, and in English in `en/carinova.ts`), so the team sees what the customer was looking at and which link they used. Customers write them, so they address Carinova as "ustedes". `src/data/messages.test.ts` fails if two places share a message, in either language.

| Place                                                                      | Message key                                                                                                                           |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Floating button, every page                                                | `floating[path]` (by the page's Spanish path), `floatingDefault` (404)                                                                |
| Footer                                                                     | `footer`                                                                                                                              |
| Inicio: the calculator                                                     | `homeQuote(shipment, total)` or `homeQuoteEmpty`                                                                                      |
| Inicio: the product link / a store's card                                  | `shopper(link)` / `storeAssist(store)`                                                                                                |
| Inicio: the article search                                                 | `itemCheck(item)` or `itemCheckEmpty`                                                                                                 |
| Inicio: home delivery / questions / careers                                | `homeDelivery` / `homeFaq` / `careers`                                                                                                |
| Cómo funciona: each example / closing                                      | `example(category)` / `howToClosing`                                                                                                  |
| Servicios: each service / closing                                          | `services[id]` / `servicesClosing`                                                                                                    |
| Tarifas: calculator / closing                                              | `quote(shipment, total)` or `quoteEmpty` / `quoteClosing`                                                                             |
| Sucursales: each branch / closing                                          | `branch(city)` / `branchesClosing`                                                                                                    |
| Mi cuenta (visitor): closing                                               | `accountClosing`                                                                                                                      |
| Mi cuenta (customer): packages / a package / an invoice / the data / error | `accountPackages(code)` / `accountPackage(code, reference)` / `accountInvoice(code, number)` / `accountUpdate(code)` / `accountError` |
| Crear cuenta: help box / error                                             | `signupAssist` / `signupHelp`                                                                                                         |
| Confirmation: done / error                                                 | `customer(code)` (`accountExisting` until the script knows the ID) / `confirmHelp`                                                    |
| Ingresar (page and dialog): help box / error                               | `signinHelp` / `signinError`                                                                                                          |
| Empresas: help box / error / closing                                       | `accountCompany` / `businessHelp` / `businessClosing`                                                                                 |
| Welcome e-mail                                                             | `welcomeEmail(code)`                                                                                                                  |
| Preguntas frecuentes / ¿Puede ingresar? / Nosotros / 404 closings          | `faqClosing` / `restricted` / `aboutClosing` / `notFound`                                                                             |

## Languages

Spanish is the default language and lives at the root. English is a translation of the same pages under `/en`, switched by `ENGLISH_ENABLED` in `src/i18n/locales.ts` (D-049, D-050).

- **Search engines.** Each page has one address per language, and each is its own canonical address. The two name each other with `hreflang`, Spanish also as `x-default`; the sitemap lists both. The English pages can be found in English and never take the place of the Spanish ones. With the switch off, no `/en` page is built and no page links to another language.
- **Addresses** (`src/i18n/routes.ts`) are translated: `/como-comprar` → `/en/how-to-buy`, `/servicios` → `/en/services`, `/cotizador` → `/en/quote`, `/sucursales` → `/en/branches`, `/preguntas-frecuentes` → `/en/faq`, `/articulos-prohibidos` → `/en/prohibited-items`, `/mi-cuenta` → `/en/my-account`, `/registro` → `/en/sign-up`, `/registro/confirmar` → `/en/sign-up/confirm`, `/ingresar` → `/en/sign-in`, `/empresas` → `/en/business`, `/nosotros` → `/en/about`, `/terminos` → `/en/terms`, `/privacidad` → `/en/privacy`; the home page is `/en`. Anchors and query parameters are not translated (`/en/services#compras-asistidas`, `/en/quote?tarifa=maritimo`, `/en#verificador`).
- **One page file, two languages.** An English address renders the same file in `src/pages` as its Spanish address; the file reads its language from the address (`i18n(Astro)` in `src/i18n`). Code and data keep using the Spanish paths; `href('/cotizador')` gives the address of the language being rendered.
- **Where the words are.** Facts once, in `src/data/carinova.ts`, `services.ts`, `signup.ts`, `faq.ts`; their English wording in `src/data/en/`, built on those facts (`content(locale)`). The statuses of packages, invoices and payments carry both languages in `src/data/account.ts`. The copy of a page or a component is in that file, both languages side by side (`const t = { es: {…}, en: {…} }[locale]`). The legal texts are one file per language (`src/data/legal/`). Scripts carry no text: the page hands them its sentences.
- **What is not translated:** the Miami address and how the name is written in it ("Aéreo" is what the warehouse reads), Nicaragua's departments, store names, ids, anchors and the calculator's parameters.
- **Terms.** "Cuenta" is "account"; "encomiendas" is "packages"; "compras asistidas" is "assisted purchases"; "retiro en sucursal" is "branch pickup"; "bodega" is "warehouse". The calls to action are "Create account", "Quote your shipment", "Help on WhatsApp", "Sign in", "Track your package".
- **The Worker** answers in the language of the form (`lang`), and the customer's e-mails are in the language they signed up in (`customers.locale`). What Carinova's team receives is always in Spanish and says which language the customer uses.
- **Switching.** The header ("EN" / "ES") and the footer link to the same page in the other language, keeping what the address carries (a filled-in calculator). A page without a translation (the blog, once it is on) leads to the other language's home page.
- **To add a page:** create it in `src/pages`, add its two addresses to `ROUTES`, write its copy in both languages and give it a floating WhatsApp message in both. `src/i18n/routes.test.ts` and `src/data/content.test.ts` fail when one of these is missing.

## Voice: voseo

Carinova speaks to customers with the voseo of Nicaragua and Central America, in its written ("culto") form:

| Form                        | Use                      | Examples                                                               |
| --------------------------- | ------------------------ | ---------------------------------------------------------------------- |
| Present indicative          | voseo                    | tenés, podés, querés, necesitás, preferís, recibís, retirás, sos       |
| Affirmative imperative      | voseo                    | cotizá, ingresá, rastreá, elegí, revisá, pegá, escribinos, consultanos |
| Imperative + pronoun        | voseo, no written accent | registrate, guardalo, usala, intentalo, corregilo, mandanos, envialo   |
| Subjunctive (and negatives) | general Spanish forms    | "cuando compres", "para que la retires", "cuando nos escribas"         |
| Pronoun after a preposition | vos                      | "por vos", "hasta vos"                                                 |

Never "tú" forms (tienes, escríbenos), never "usted". The calls to action speak to the customer, as the prototype does ("Cotizá tu envío", "Rastreá tu paquete", "Ingresá"); "Crear cuenta" and the buttons of the forms ("Ingresar") are infinitives. Messages customers send to Carinova use "ustedes" ("¿Me ayudan?").

**The word is "cuenta".** The prototype never says "casillero", and since D-070 neither does the site: a customer has a Carinova account ("tu cuenta", "Mi cuenta"), with a Carinova ID and an address in the United States.

In English the voice is the same person: direct, in the second person, short sentences, no slang ("You pay for the product and the shipping"). Messages customers send start with "Hi Carinova 👋".

## Navigation

- **Strip above the header:** what Carinova connects, and the route from tablets up (`TopStrip.astro`).
- **Header:** the wordmark; six links in the prototype's order (Servicios, Compras por vos, Tarifas, Cómo funciona, Empresas, Ayuda); the language link ("EN"); "Ingresá", a white button with an icon that opens the sign-in dialog (the most visible thing in the bar; on a phone it sits beside the menu button, not inside the menu); "Rastreá tu paquete" (outlined, from 1280 px) and the orange "Crear cuenta". All of it fits on one line from 1024 px (checked at 1024, 1100, 1279, 1280 and 1536 px, in both languages, for visitors and customers); between 1024 and 1279 px the language link is only "EN". The phone menu lists "Crear cuenta" and "Rastreá tu paquete" first, then the six links, with the language link, "Ingresá" and the button in a bar below. For a customer who is signed in, "Crear cuenta" is "Mi cuenta", "Rastreá tu paquete" leads to their packages and "Ingresá" is gone.
- **Footer:** the wordmark, the tagline and the route; three columns: Explorá (Servicios, Tarifas, Cotizador, Compras por vos), Tu Carinova (Cómo funciona, ¿Puede ingresar?, Rastreo, Empresas, Crear cuenta, Ingresá; "Mi cuenta" for a customer), Estamos cerca (Managua y Bluefields, Preguntas frecuentes, WhatsApp, e-mail once set, Nosotros, Condiciones del servicio, Privacidad); the other language; social links.
- **Floating WhatsApp button** on every page ("Escribinos"), with the page's own message.

## Open points for Carinova

Tracked in the project log ("Pending content"): whether the pricing rules read from the prototype are the ones Carinova applies (one basis at a time, no rounding, no minimum; which basis applies by sea), what an assisted purchase and home delivery cost and where home delivery reaches, how customers pay, what companies are offered, when Los Ángeles opens and its address, whether the English version is published and who reads it, and who the super user of the back office is.
