# Carinova Web — Information architecture

How the site is organised, why, and where each piece of Carinova's material lives. Labels visitors see are quoted in Spanish, the site's default language; the six translations have the same structure ("Languages"). Decisions are logged in [PROJECT-LOG.md](PROJECT-LOG.md) (D-035 to D-101). The database behind the customer's account is in [DATABASE.md](DATABASE.md).

Three sources from Carinova shape the site: the brief of 2026-11-10 (services, rates, what an account includes); the prototype of 2026-11-13 (a one-page design), which set the navigation, the palette, the vocabulary and the pricing rules (D-068 to D-077); and the "Signature" design of 2026-11-14 (another one-page design), which sets the home page's sections, their order and their words (D-086 to D-091).

## Principles

1. **One question, one place (MECE).** Each page answers one question a customer asks on the way from "what is this?" to "where is my package?". Pages do not overlap (mutually exclusive) and together cover the whole journey (collectively exhaustive). A piece of content has one owner; other places show a short summary that links to it, generated from the same data.
2. **One source for every fact.** Business facts live in `src/data/carinova.ts`, the structure of the offer in `src/data/services.ts`, answers in `src/data/faq.ts`, the statuses of packages and payments in `src/data/account.ts`. Prices are computed by `src/utils/rates.ts`; no page has a price typed into it, so the calculator, the rate cards, the worked examples, the FAQ and the e-mails cannot disagree. Every translation's wording is built on the same facts.
3. **Customer words first, Carinova's terms second.** Section headings are the customer's question or what they get ("¿Puede ingresar a Nicaragua?", "Sabé en qué etapa va tu envío"); Carinova's own term is the small label above it ("Seguimiento"). Jargon becomes plain words ("última milla" → "Entrega a domicilio").
4. **The same calls to action, always in the same order and look** (see "Calls to action").
5. **Honest status.** What is not available yet says "Próximamente" and carries no price or date: today, only the Los Ángeles address. What has a charge that is not published says so ("Cargo adicional": home delivery). Values Carinova has not confirmed are `TODO` in the data and listed in the project log. Nothing is promised that Carinova has not said: a store's card says what the store is, the page for companies promises an evaluation, and the article search never answers "allowed".
6. **Voseo** in everything a visitor reads in Spanish (see "Voice").
7. **Accessible and light.** WCAG 2.2 AA (contrast, 44 px touch targets, labels, live regions for the quote and the search, link context for screen readers, dialogs that take and return the focus). Pages are static files, the same for everyone. JavaScript is shipped only where something has to happen: the calculator, the stores' carousel, the tracker and its article search, the dialogs, the forms, the confirmation page, the customer's account and tracking page, the footer's carousel. Without it the pages still read: the stores are a list of links, both parts of the tracker are in view, "Ingresá" leads to the sign-in page, a product link is sent to WhatsApp as it is, and the language menu opens (it is a native `<details>`). Images are few and never served as they were uploaded: the hero's emblem and, once Carinova sends them, the photographs of three cards, each in AVIF or WebP at the size it is shown.
8. **Private by default.** Nothing is stored before an e-mail is confirmed; the forms never say whether an e-mail has an account; a customer's data, packages and payments are only ever sent to that customer's own session (see "Visitors and customers").

## Sitemap

| Page (menu label)                              | The customer's question                 | Route                                                         | Owns                                                                                                                                                                              |
| ---------------------------------------------- | --------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inicio                                         | ¿Qué hacen y qué hago ahora?            | `/`                                                           | The promise and the calls to action; the four solutions; the journey of a package, drawn. Everything else on it is a summary of a page below                                      |
| Servicios                                      | ¿Qué opciones tengo?                    | `/servicios`                                                  | The six services on their three axes                                                                                                                                              |
| Tarifas (the calculator)                       | ¿Cuánto cuesta y cuánto tarda?          | `/cotizador`                                                  | The calculator, the rates, how each price is worked out                                                                                                                           |
| Cómo funciona                                  | ¿Cómo funciona?                         | `/como-comprar`                                               | The process (3 steps) and the worked examples by category                                                                                                                         |
| Compras por vos (header) · Tiendas (footer)    | ¿Dónde puedo comprar? ¿Compran por mí?  | `/#compras`, `/tiendas`                                       | The stores, one by one ("Comprar en SHEIN desde Nicaragua"), and the form of an assisted purchase                                                                                 |
| Casillero en Miami (footer)                    | ¿Qué es un casillero y cuánto cuesta?   | `/casillero-en-miami`                                         | What the address in the United States is, what it includes, what it costs and how it is used                                                                                      |
| Rastreá tu paquete (header) · Rastreo (footer) | ¿Dónde va mi paquete?                   | `/rastreo`                                                    | The tracker; for a customer who is signed in, their packages on the way and the search by reference                                                                               |
| Empresas                                       | ¿Qué hay para mi empresa?               | `/empresas`                                                   | What Carinova evaluates for companies, and their form                                                                                                                             |
| Ayuda                                          | ¿Y si tengo otra duda? ¿Puede ingresar? | `/preguntas-frecuentes`, `/articulos-prohibidos`              | Questions and answers in six groups; the three lists of what cannot be shipped                                                                                                    |
| Mi cuenta ("Crear cuenta", "Ingresá")          | ¿Qué recibo y cómo entro?               | `/mi-cuenta`, `/registro`, `/registro/confirmar`, `/ingresar` | For a visitor: what an account includes. For a customer: their Carinova ID, packages, payments, address in the United States and data. The sign-up, its confirmation, the sign-in |
| Sucursales (footer: "Estamos cerca")           | ¿Dónde retiro?                          | `/sucursales`                                                 | Addresses, opening hours, each branch's WhatsApp, maps                                                                                                                            |
| (footer only)                                  | ¿Quiénes son? ¿Qué condiciones aplican? | `/nosotros`, `/terminos`, `/privacidad`                       | Company story, values and "Formá parte de nuestro equipo"; legal drafts                                                                                                           |

```
Inicio (/)
├── #soluciones      Compras online (#compras: las tiendas) · Compra asistida · Encomiendas · Carinova Business
├── #tarifas         Aéreo · Marítimo
├── #cotizador       la calculadora
├── #como-funciona   3 pasos
├── #rastreo         las etapas de un paquete · el rastreador (#rastrear · #puede-ingresar)
├── #empresas        Carinova Business
├── #sucursales      Managua · Bluefields en el mapa
└── #preguntas       las preguntas destacadas
Servicios (/servicios)
├── #transporte    Aéreo · Marítimo
├── #solucion      Encomiendas · Compras asistidas
└── #distribucion  Retiro en sucursal · Entrega a domicilio (cargo adicional)
Tarifas (/cotizador)                        calculadora · tarifas · cómo calculamos
Cómo funciona (/como-comprar)               3 pasos · ejemplos por categoría
Tiendas (/tiendas)                          cómo comprar · las tiendas por categoría · compra asistida
Casillero en Miami (/casillero-en-miami)    qué es · qué incluye · cuánto cuesta · cómo se usa · preguntas
Rastreo (/rastreo)                          rastrear paquete · ¿puede ingresar? · las etapas
Empresas (/empresas)                        soluciones · solicitud
Ayuda (/preguntas-frecuentes)               cuenta · servicios · tarifas · tiempos · prohibidos · retiro
└── ¿Puede ingresar? (/articulos-prohibidos)
Mi cuenta (/mi-cuenta)                      visitante: qué incluye · cliente: #paquetes · #pagos · #direccion · #datos
├── Crear cuenta (/registro) → Confirmar (/registro/confirmar)
└── Ingresar (/ingresar, o el diálogo de "Ingresá" en cualquier página)
Sucursales (/sucursales)                    Managua · Bluefields
Footer: Nosotros (/nosotros) · Condiciones del servicio (/terminos) · Privacidad (/privacidad)
```

Every page also exists in each translation, under its prefix ("Languages").

### The home page

The sections and their order are the "Signature" design's (`src/pages/index.astro`). Each one is headed by `SectionHeading.astro`: its number, a small line with the words people search for and, under it, the brand's line; the two are one heading (D-097).

| #   | Section (anchor)                 | Component                                           | What it does                                                                                                                                                                                                                                                                                               |
| --- | -------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| —   | Strip above the header           | `TopStrip.astro`                                    | "Conectamos Estados Unidos con Nicaragua" and, from tablets up, the route: Miami · Los Ángeles (próximamente) → Managua · Bluefields                                                                                                                                                                       |
| —   | Hero                             | `HomeHero.astro`                                    | The page's title: "Envíos de Estados Unidos a Nicaragua" (the small line) and "De allá para acá." (the brand's line). The promise, "Crear cuenta" and "Cotizá tu envío", three facts (the two delivery times, the branches) and Carinova's emblem inside the route it covers                               |
| —   | Three facts                      | `ProofStrip.astro`                                  | "Dos formas de enviar", "De Miami a Nicaragua", "A tu manera". Facts, no figures                                                                                                                                                                                                                           |
| 01  | Soluciones (`#soluciones`)       | `Solutions.astro`                                   | "Una solución para cada necesidad.": four cards. Compras online, with the stores as a carousel (`#compras`; each store opens its card); Compra asistida, which opens the product-link form; Encomiendas, a WhatsApp link; Carinova Business, with "Hablemos de tu negocio". Cards 2 to 4 take a photograph |
| 02  | Modalidades (`#tarifas`)         | `ShippingModes.astro`                               | "Dos modalidades. Un destino.": Aéreo and Marítimo with what each is for, its base rate and its delivery estimate; the foot of a card opens the calculator below on that rate, "Ver detalle" leads to the service                                                                                          |
| 03  | Calculadora (`#cotizador`)       | `QuoteCalculator.astro`                             | "Calculá tu envío.": the calculator itself, the same one as on `/cotizador`                                                                                                                                                                                                                                |
| 04  | Cómo funciona (`#como-funciona`) | `HowItWorks.astro`                                  | "Tres pasos, de allá para acá.": the three steps, each with where it leads (the second opens the article search)                                                                                                                                                                                           |
| 05  | Seguimiento (`#rastreo`)         | `TrackingSection.astro`, `PackageStages`, `Tracker` | "Sabé en qué etapa va tu envío.": the five stages of a package, drawn, and the tracker: a card with a switch between "Rastrear paquete" (`#rastrear`: sign in, or write a reference) and "¿Puede ingresar?" (`#puede-ingresar`: the search over the three lists)                                           |
| —   | Empresas (`#empresas`)           | `BusinessBand.astro`                                | "Tu negocio no se detiene. Nosotros tampoco." and the way to the page for companies                                                                                                                                                                                                                        |
| 06  | Sucursales (`#sucursales`)       | `Locations.astro`                                   | "Estamos más cerca.": the branches on a drawn map of Nicaragua and a card for each, with its hours                                                                                                                                                                                                         |
| —   | Reseñas                          | (in the page)                                       | Hidden until there are real reviews                                                                                                                                                                                                                                                                        |
| 07  | Preguntas (`#preguntas`)         | `HomeFaq.astro`                                     | "Preguntas frecuentes.": the featured questions (`featured` in `faq.ts`), one open at a time                                                                                                                                                                                                               |
| —   | Cierre                           | `HomeClosing.astro`                                 | "Así de simple." and the two calls to action                                                                                                                                                                                                                                                               |

The home page owns two things besides the promise. **The four solutions**, as a set: each card leads to the page that owns what it names (the stores, the assisted purchase, the services, the page for companies). **The journey of a package, drawn**: the stages are the ones a customer sees in their account (`PACKAGE_STAGES`). The article search reads the same `RESTRICTED_ITEMS` as `/articulos-prohibidos`, which owns the lists.

### Mutually exclusive: who owns what

| Content                                                 | Owner                           | Shown elsewhere as                                                                                                                                |
| ------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prices, transit times, the formulas                     | Tarifas (`/cotizador`)          | The two cards and the calculator on the home page, service facts, examples, FAQ, Casillero, Empresas: computed from `RATES`                       |
| The process                                             | Cómo funciona                   | Three one-line steps on the home page, on Casillero and on Tiendas (`PROCESS_STEPS.summary`)                                                      |
| What each service is                                    | Servicios                       | One line per service where it is mentioned (`SERVICES.summary`)                                                                                   |
| Branch addresses, hours, contact                        | Sucursales                      | Cities on the home page's map and in the strip above the header; city and hours in Mi cuenta and Nosotros                                         |
| What an account includes                                | Mi cuenta (the visitor's view)  | Casillero en Miami, which explains the address that comes with it (`ACCOUNT_PARTS`)                                                               |
| A customer's own ID, packages, payments, address, data  | Mi cuenta (the customer's view) | The tracking page (the packages on their way, one by its reference); the confirmation page and the welcome e-mail (ID and address), once          |
| The stages of a package                                 | Inicio (drawn)                  | The tracking page, a customer's packages (`PACKAGE_STAGES`)                                                                                       |
| What Carinova offers companies                          | Empresas                        | A card and a band on the home page; a FAQ answer                                                                                                  |
| The stores                                              | Tiendas                         | The carousel of the home page's first card; the FAQ names the first six (`STORES`)                                                                |
| Policies (payment, storage, authorised pickup, customs) | Ayuda (FAQ)                     | Legal drafts state them formally                                                                                                                  |
| What cannot be shipped (three lists)                    | `/articulos-prohibidos`         | The search of the tracker (home page and Rastreo), the FAQ, the confirmation page, the welcome e-mail, step 2 of the process (`RESTRICTED_ITEMS`) |

### Collectively exhaustive: the journey

| Stage                       | Where it is answered                                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Discover what Carinova does | Inicio                                                                                                                           |
| Understand how it works     | Cómo funciona; Casillero en Miami                                                                                                |
| Choose a service            | Servicios                                                                                                                        |
| Know the price and the time | Tarifas (the calculator, also on the home page)                                                                                  |
| Know if it can be shipped   | The tracker's "¿Puede ingresar?" (Inicio, Rastreo), `/articulos-prohibidos`                                                      |
| Sign up                     | Crear cuenta; companies: Empresas                                                                                                |
| Buy or send                 | Tiendas and the first card of the home page; the assisted purchase's form; Cómo funciona (step 2); Servicios (compras asistidas) |
| Come back                   | "Ingresá" in the header (a dialog on any page) or `/ingresar` → Mi cuenta                                                        |
| Follow the package          | Rastreo: the packages on their way and any one by its reference. Mi cuenta → Paquetes: all of them, each with its history        |
| Pay                         | Mi cuenta → Pagos: each invoice with its lines, what was paid and what is owed. Paying itself is arranged with the team          |
| Receive it                  | Sucursales; Servicios (entrega a domicilio, with an extra charge)                                                                |
| Solve a problem             | Ayuda; WhatsApp on every page                                                                                                    |
| Trust the company           | Nosotros, Condiciones, Privacidad (footer); reviews once they exist                                                              |

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

The search (the tracker's "¿Puede ingresar?", on the home page and on `/rastreo`; `src/utils/restricted.ts`) compares whole words of what the visitor types with the words of each item (`match`, without accents or marks; in a language written without spaces, Chinese, the words are looked for inside the text). Every language also understands the Spanish words: visitors mix languages. When an item is on a list it names the list; when a text matches two lists the strictest answers (prohibited, then not yet, then sea only). **It never says an article can be shipped**: what is on no list gets "No aparece en nuestras listas" and a WhatsApp link with the article in the message, because the lists are not the whole of customs law.

## Calls to action

| Level     | Label                                                                                                              | Looks like                     | Goes to                            |
| --------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ---------------------------------- |
| Primary   | "Crear cuenta"; for a customer who is signed in, "Ir a mi cuenta" ("Mi cuenta" in the header)                      | Orange button, navy text       | `/registro`; `/mi-cuenta`          |
| Secondary | "Cotizá tu envío"                                                                                                  | Outlined button                | `/cotizador` (or filled in)        |
| Tertiary  | "Ayuda por WhatsApp" (or what the link asks for: "Pedir una compra asistida", "Enviar mi cotización por WhatsApp") | Underlined link, WhatsApp icon | WhatsApp with this place's message |
| Header    | "Ingresá" · "Rastreá tu paquete" (from 1280 px)                                                                    | White button · outlined button | The sign-in dialog · `/rastreo`    |

Rules:

- The labels come from `CTA` in `carinova.ts`. In the hero "Crear cuenta" is the orange button and "Cotizá tu envío" the outlined one, as everywhere.
- Only the primary and the secondary are buttons in the body of a page; any other link ("Ver sucursales", "Revisar artículo") is a text link, so the hierarchy reads at a glance. Exceptions, each one the thing its section is for: the button of the product-link form ("Preparar solicitud"), the button of a store's card (the store's site), "Hablemos de tu negocio" in the business card and the button of the band for companies, the tracker's own buttons ("Ingresá para ver tus paquetes", "Rastrear") and the navy "Crear cuenta" under the three steps.
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
- Where the two versions apply: the header's buttons and the phone menu, `CtaGroup` (every hero and closing band), the home hero and its closing, the calculator, the steps, the tracker (a visitor is asked to sign in, a customer writes a reference), the store card, the footer, the sign-up page and the confirmation page.
- **`/rastreo`** answers one question for a customer: where a package is. Its script reads the same `GET /api/account/activity` and shows the packages that are on their way, or the one whose reference, digits or carrier's tracking number the customer wrote (`/rastreo?paquete=PKG-000123`). A reference that is not among the customer's own packages finds nothing, and nothing is looked up by Carinova ID alone: the ID is written on labels.
- **Signing in**: "Ingresá" in the header opens a dialog on whatever page the visitor is on (`SigninDialog.astro`; the same form as `/ingresar`, which stays for links and for browsers without scripts): the e-mail of the account, then a 6-digit code sent to it. No password. It never says whether an e-mail has an account. From the dialog a customer lands on their account. Confirming a sign-up signs the new customer in. Numbers (digits, minutes, attempts, days) are in `src/data/account.ts`; how it is kept safe is in the README ("Signing in").

## WhatsApp messages

One prefilled message per place (`WA_MESSAGES` in `carinova.ts`, and in each translation's `carinova.ts`), so the team sees what the customer was looking at and which link they used. Customers write them, so they address Carinova as "ustedes", and each language starts with its own greeting ("Hola Carinova 👋", "Hi Carinova 👋", "Bonjour Carinova 👋"…). `src/data/messages.test.ts` fails if two places share a message, in any language. A page of a translation prefills its messages in that language: whether the team reads them is a question for Carinova (PROJECT-LOG → Pending content).

| Place                                                                      | Message key                                                                                                                           |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Floating button, every page                                                | `floating[path]` (by the page's Spanish path), `floatingDefault` (404)                                                                |
| Footer: its WhatsApp link / WhatsApp among the channels                    | `footer` / `channels`                                                                                                                 |
| Inicio: the calculator                                                     | `homeQuote(shipment, total)` or `homeQuoteEmpty`                                                                                      |
| Inicio: the product link / a store's card / Encomiendas                    | `shopper(link)` / `storeAssist(store)` / `homeFamily`                                                                                 |
| Inicio: the article search                                                 | `itemCheck(item)` or `itemCheckEmpty`                                                                                                 |
| Inicio: a branch's card / home delivery / questions                        | `homeBranch(city)` / `homeDelivery` / `homeFaq`                                                                                       |
| Rastreo: the article search / a package / a reference not found / closing  | `trackItemCheck(item)` or `trackItemCheckEmpty` / `trackPackage(code, reference)` / `trackMissing(code, reference)` / `trackClosing`  |
| Cómo funciona: each example / closing                                      | `example(category)` / `howToClosing`                                                                                                  |
| Servicios: each service / closing                                          | `services[id]` / `servicesClosing`                                                                                                    |
| Casillero en Miami: closing                                                | `lockerClosing`                                                                                                                       |
| Tiendas: the product link / a store's card / closing                       | `storesShopper(link)` / `storePageAssist(store)` / `storesClosing`                                                                    |
| Tarifas: calculator / closing                                              | `quote(shipment, total)` or `quoteEmpty` / `quoteClosing`                                                                             |
| Sucursales: each branch / closing                                          | `branch(city)` / `branchesClosing`                                                                                                    |
| Mi cuenta (visitor): closing                                               | `accountClosing`                                                                                                                      |
| Mi cuenta (customer): packages / a package / an invoice / the data / error | `accountPackages(code)` / `accountPackage(code, reference)` / `accountInvoice(code, number)` / `accountUpdate(code)` / `accountError` |
| Crear cuenta: help box / error                                             | `signupAssist` / `signupHelp`                                                                                                         |
| Confirmation: done / error                                                 | `customer(code)` (`accountExisting` until the script knows the ID) / `confirmHelp`                                                    |
| Ingresar (page and dialog): help box / error                               | `signinHelp` / `signinError`                                                                                                          |
| Empresas: help box / error / closing                                       | `accountCompany` / `businessHelp` / `businessClosing`                                                                                 |
| Welcome e-mail                                                             | `welcomeEmail(code)`                                                                                                                  |
| Preguntas frecuentes / ¿Puede ingresar? / Nosotros / careers / 404         | `faqClosing` / `restricted` / `aboutClosing` / `careers` / `notFound`                                                                 |

## Languages

Spanish is the default language and lives at the root. Six translations are the same pages under their own prefix: English `/en`, French `/fr`, Portuguese `/pt`, Chinese (Simplified) `/zh`, Russian `/ru` and Arabic `/ar`. Which ones are published is `PUBLISHED_TRANSLATIONS` in `src/i18n/locales.ts` (D-092).

- **Search engines.** Each page has one address per language, and each is its own canonical address. The versions of a page name each other with `hreflang`, Spanish also as `x-default`; the sitemap lists them all. A translation can be found in its language and never takes the place of the Spanish page. A language taken out of `PUBLISHED_TRANSLATIONS` has no pages, no links and no `hreflang`; with the list empty the site is exactly the Spanish site.
- **Addresses** (`src/i18n/routes.ts`). Spanish and English have addresses in their own words: `/como-comprar` → `/en/how-to-buy`, `/servicios` → `/en/services`, `/cotizador` → `/en/quote`, `/sucursales` → `/en/branches`, `/rastreo` → `/en/track`, `/casillero-en-miami` → `/en/us-address-in-miami`, `/tiendas` → `/en/stores`, `/preguntas-frecuentes` → `/en/faq`, `/articulos-prohibidos` → `/en/prohibited-items`, `/mi-cuenta` → `/en/my-account`, `/registro` → `/en/sign-up`, `/registro/confirmar` → `/en/sign-up/confirm`, `/ingresar` → `/en/sign-in`, `/empresas` → `/en/business`, `/nosotros` → `/en/about`, `/terminos` → `/en/terms`, `/privacidad` → `/en/privacy`; the home page is `/en`. The other languages reuse the English words under their prefix (`/fr/quote`, `/zh/quote`, `/ar/quote`): an address in Cyrillic, Chinese or Arabic turns into a string of percent signs when it is shared. Anchors and query parameters are not translated (`/en/services#compras-asistidas`, `/fr/quote?tarifa=maritimo`, `/ar#puede-ingresar`). A wrong address under a prefix gets that language's 404 page.
- **One page file, every language.** An address of a translation renders the same file in `src/pages` as its Spanish address; the file reads its language from the address (`i18n(Astro)` in `src/i18n`, which gives `locale`, `href`, `data` and `ui`). Code and data keep using the Spanish paths; `href('/cotizador')` gives the address of the language being rendered.
- **Where the words are.** Facts once, in `src/data/carinova.ts`, `services.ts`, `signup.ts`, `faq.ts`; each translation's wording of them in `src/data/<language>/`, built on those facts (`content(locale)`). What the pages and the components say is in one dictionary per language, `src/i18n/ui/<language>.ts`: an entry per page or component, the Spanish file defining the shape (a dictionary that lacks a text does not compile). What the Worker says is in `worker/text/<language>.ts`. The legal texts are one file per language (`src/data/legal/`). Scripts carry no text: the page hands them its sentences.
- **Sentences are whole.** A sentence with a link or a value inside is an array of parts or a function in the dictionary; a page never puts words, punctuation or spaces around a translated fragment, and never counts or lower-cases one (`LOCALE_INFO[locale].wordGap` is the space, or nothing in Chinese, between two pieces a page has to join).
- **What is not translated:** the Miami address and how the name is written in it ("Aéreo" is what the warehouse reads), Nicaragua's departments, store names, ids, anchors, the calculator's parameters, "Carinova ID", and the way numbers are written: "US$6.50", "1,728", "2.2 lb" in every language (D-101). Cities are written as each language writes them (Arabic and Russian in their own letters; Chinese keeps the Latin names).
- **Right to left.** Arabic pages set `dir="rtl"`; the layout is written with start and end, so it mirrors by itself, and arrows that point forwards flip. What is written from left to right in every language keeps its order inside them (`dir="ltr"`): formulas, the address in the United States, e-mail addresses, phone numbers, a price with its unit. Digits are Western. Arabic pages use the device's own font; Russian loads Inter's Cyrillic letters; Chinese uses the device's font for its characters and Inter for the rest.
- **Terms.** In English "cuenta" is "account", "encomiendas" is "packages", "compras asistidas" is "assisted purchases", "retiro en sucursal" is "branch pickup", "bodega" is "warehouse"; the calls to action are "Create account", "Quote your shipment", "Help on WhatsApp", "Sign in", "Track your package". Each other language has its own in its `carinova.ts` (`CTA`). The address in the United States is "US address" and its equivalents; the Spanish word "casillero" is named once, where the page about it explains it.
- **Who translated.** English with the site; French, Portuguese, Chinese, Russian and Arabic by an AI model on 2026-11-14, checked by the tests and by looking at the pages, not yet read by native speakers (D-100). The legal texts of every translation say that the Spanish text applies.
- **The tests** (`src/i18n/translations.test.ts`, `src/data/messages.test.ts`) fail when a translation has a different shape from the Spanish, changes a fact, a link or a placeholder, keeps more than a few sentences identical to the Spanish or the English ones, is not written in its script (Chinese, Russian, Arabic), has an example of the article search that no list or two lists find, lacks a legal text or a section of one, or repeats a WhatsApp message.
- **The Worker** answers in the language of the form (`lang`), and the customer's e-mails are in the language they signed up in (`customers.locale`). What Carinova's team receives is always in Spanish and says which language the customer uses.
- **Switching.** The header has a menu: a button with the code of the page's language that lists the seven by their own names, each leading to this same page in it, keeping what the address carries (a filled-in calculator). The footer lists them too. A page without a translation (the blog, once it is on) leads to that language's home page.
- **To add a page:** create it in `src/pages`, add its Spanish and English addresses to `ROUTES`, write its entry in every dictionary and give it a floating WhatsApp message in every language. `src/i18n/routes.test.ts`, `src/i18n/translations.test.ts` and `src/data/content.test.ts` fail when one of these is missing.
- **To add a language:** add it to `LOCALES`, `LOCALE_INFO` and `PUBLISHED_TRANSLATIONS`; write its dictionary, its four data files, its Worker texts and its two legal files (TypeScript and the tests list what is missing); add it to `customers_locale_known` in `db/schema.sql` and apply the schema; give `src/utils/rates.ts` its words.

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

**The word is "cuenta".** A customer has a Carinova account ("tu cuenta", "Mi cuenta"), with a Carinova ID and an address in the United States: every button, title and message says so (D-070). "Casillero" is what people in Nicaragua call that address and what they search for, so the site says it where it explains the address (D-096): the page `/casillero-en-miami`, the small first line of the home page's title, the first step and two questions. It is never the name of what Carinova sells.

In the translations the voice is the same person: direct, in the second person, short sentences, no slang ("You pay for the product and the shipping"; French "vous", Portuguese "você", Chinese 您, Russian "вы", Arabic in the singular). Messages customers send start with the greeting of their language ("Hi Carinova 👋").

## Navigation

- **Strip above the header:** what Carinova connects, and the route from tablets up (`TopStrip.astro`).
- **Header:** the wordmark; six links (Servicios, Compras por vos, Tarifas, Cómo funciona, Empresas, Ayuda); the language menu (a button with the code of the page's language, "ES", with a globe from 1280 px; it lists the seven languages by their own names); "Ingresá", a white button with an icon that opens the sign-in dialog (the most visible thing in the bar; on a phone it sits beside the menu button, not inside the menu); "Rastreá tu paquete" (outlined, from 1280 px, to `/rastreo`) and the orange "Crear cuenta". All of it fits on one line from 1024 px in every language, for visitors and customers (checked at 1024, 1100, 1279, 1280 and 1536 px): the bar is drawn for the Spanish labels, and the space on each side of a link gives way when a language's labels are longer (D-095). The phone menu lists "Crear cuenta" and "Rastreá tu paquete" first, then the six links, with the language menu, "Ingresá" and the button in a bar below. For a customer who is signed in, "Crear cuenta" is "Mi cuenta" and "Ingresá" is gone.
- **Footer:** Carinova's channels as a carousel (Instagram, TikTok, WhatsApp; Facebook, YouTube and the e-mail once each has an address); the wordmark, the tagline and the route; three columns: Explorá (Servicios, Tarifas, Cotizador, Casillero en Miami, Tiendas, Compras por vos), Tu Carinova (Cómo funciona, ¿Puede ingresar?, Rastreo, Empresas, Crear cuenta, Ingresá; "Mi cuenta" for a customer), Estamos cerca (Managua y Bluefields, Preguntas frecuentes, WhatsApp, Nosotros, Condiciones del servicio, Privacidad); the seven languages.
- **Floating WhatsApp button** on every page ("Escribinos"), with the page's own message.

## Open points for Carinova

Tracked in the project log ("Pending content"): whether the pricing rules read from the prototype are the ones Carinova applies (one basis at a time, no rounding, no minimum; which basis applies by sea), what an assisted purchase and home delivery cost and where home delivery reaches, how customers pay, what companies are offered, when Los Ángeles opens and its address, the three steps and the words of the new home page, the use of "casillero" for search engines, which translations are published, who reads them and whether the team answers in them, the missing channels and photographs, and who the super user of the back office is.
