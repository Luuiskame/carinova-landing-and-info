# Back office — hand-off

For whoever builds Carinova's back office next, person or AI model. The database it stands on is finished, checked and applied; the back office itself — the screens and the endpoints Carinova's team will use — does not exist yet. This page says what is there, what to build, in what order, and how to know it works.

Read first, in this order: `AGENTS.md` (the rules of the repository), [DATABASE.md](DATABASE.md) (every table, rule and statement), README → "Backend" (how the website's Worker works and is kept safe). Decisions and their reasons are in [PROJECT-LOG.md](PROJECT-LOG.md).

## Where things stand

**Built and working**

- The website: static pages (Astro), in Spanish with English under `/en`.
- The Worker (`worker/`), eight endpoints under `/api/`: sign-up with e-mail confirmation, passwordless sign-in for customers (a one-time code by e-mail, then a session cookie), the customer's account, a form for companies.
- **"Mi cuenta"** (`/mi-cuenta`, `src/components/carinova/AccountPanel.astro`): a signed-in customer sees their packages (at the warehouse, shipped, delivered; each with its history) and their invoices and payments. It reads `GET /api/account/activity`. **It is empty for every customer today**, because nothing writes packages or invoices yet.
- The database (`db/schema.sql`): fifteen tables and a view, applied to the real Neon database on 2026-11-13.
- The contract of the back office (`db/queries.sql`): 35 named statements, each checked against a real PostgreSQL, including what happens when two people act at the same moment.
- The checks: `npm test`, `npm run db:check`, `npm run db:scratch` (DATABASE.md → "Checking a change").

**Not built**

- Any way for the team to sign in, and any screen or endpoint for the team.
- The first super user (the table is empty; Carinova has not said who it is).
- Everything that writes packages, invoices and payments.
- The customer's "I paid this" (the statement `report_payment` is ready; no endpoint or button uses it).
- Storing a picture of a receipt, e-mails about a package or an invoice, anything scheduled.

## Decisions already made

These were decided with their reasons; do not reopen them without the owner of the project.

| Decision                                                                                                            | Why                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| The team signs in like customers do: a one-time code by e-mail, never a password                                    | No passwords to leak or reset; the same code paths, already tested                                                       |
| Team accounts live in their own tables (`staff_users`, `staff_login_codes`, `staff_sessions`)                       | Nothing a customer can do reaches a team account; a session of one kind is never accepted as the other                   |
| Nobody signs up as staff. The first super user is inserted by hand; a super user creates the rest                   | The back office is closed by construction                                                                                |
| One role for now, `superuser`. Roles are rows; what a role may do will be decided in one place in the back office   | The owner asked for role assignment later, not now                                                                       |
| One action is one SQL statement, and it writes its own audit row                                                    | It happens whole or not at all; the Neon HTTP driver has no interactive transactions; the history cannot be skipped      |
| An invoice's total and paid amount are stored on its row, guarded by `CHECK`s                                       | Two confirmations at the same moment could otherwise overpay an invoice; the row makes the second one wait and be judged |
| A statement that cannot act returns no row; it does not raise                                                       | One answer for "not found or not allowed", nothing to guess, nothing leaked                                              |
| Packages move forward only; a mistake is a correction with a reason, never an edit of the history                   | The customer reads the history                                                                                           |
| Payments are never deleted; an invoice with confirmed money cannot be voided                                        | The record of money stays whole                                                                                          |
| The pages stay static and the same for everyone; whatever belongs to one person comes from the API after signing in | No server-rendered pages, no personal data in HTML, cheap hosting                                                        |
| The Worker's code runs on Cloudflare Workers and on plain Node                                                      | The dev server and the unit tests run the very same code                                                                 |

## Decisions that are open

Ask the owner of the project; each has a default that is safe to start with.

| Question                                                                      | Default to start with                                                                                                                 |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Who is the super user (e-mail and name)?                                      | **Blocks the first sign-in.** DATABASE.md → "The first super user"                                                                    |
| Where does the back office live?                                              | In this repository and this Worker: pages under `/admin/`, endpoints under `/api/admin/` (see "The shape", below)                     |
| In which language is the back office?                                         | Spanish only. It is a tool for the team, not a page for visitors: the rule "everything in both languages" is about what visitors read |
| How does a customer pay, and what do they see about it?                       | Nothing is promised on the site today. The team records payments; the invoice's `notes` say how to pay                                |
| May customers report a payment from their account?                            | Not until the owner says so. The statement is ready (`report_payment`)                                                                |
| Is the price of a package's line worked out, or typed?                        | Proposed from the rates (`src/utils/rates.ts`, `RATES`), editable before the invoice is issued                                        |
| Does the customer get an e-mail when a package moves or an invoice is issued? | No e-mails at first; "Mi cuenta" shows it. Add them when asked, with `worker/email-kit.ts`                                            |
| What may each role do, once there is more than `superuser`?                   | Everything stays with `superuser` until the owner names the roles                                                                     |
| How long is a customer's data kept?                                           | For good, until the privacy policy says otherwise                                                                                     |

## The shape

A recommendation, built on how the site already works:

- **Pages** under `/admin/` (Spanish `src/pages/admin/…`), static like the rest, with `noindex` and left out of the sitemap (`PRIVATE_PAGES` in `astro.config.ts` does this for the confirmation page). They contain no data: a custom element fetches JSON and fills `<template>`s, exactly as `AccountPanel.astro` does for "Mi cuenta". Without a staff session the page shows only the sign-in.
- **Endpoints** under `/api/admin/`, in the same Worker. Add them to `ROUTES` in `worker/api.ts`, so they pass through the checks every request already gets (only this site's own pages may call the API; JSON only; a size limit; errors answered as `503` without detail). The router matches whole paths: keep it, and send the reference of the thing in the JSON body (`{ "reference": "PKG-000128", "status": "in_transit" }`) rather than in the path.
- **A session of its own**: a second cookie, never the customers' one (`worker/auth/session.ts` is the model). `HttpOnly`, `Secure`, the `__Host-` prefix, and `SameSite=Strict` (nobody arrives at the back office from a link in an e-mail, so the stricter setting costs nothing). Shorter than the customers' 30 days: one day is the value the checks use.
- **Every handler under `/api/admin/` starts the same way**: read the staff cookie, hash the token, run `find_staff_by_session`, and answer `401` without it. Write that once, as a wrapper around the handler, and make it the only way to register an admin route. The `id` it returns is the `actor` of every statement. Never take an actor, a role or a customer from the request.
- **A store for the back office** next to `worker/store.ts`: one function per statement of `db/queries.sql`, over the same `Query` function. DATABASE.md → "Using them from code".
- Optional and worth it: put `/admin/*` and `/api/admin/*` behind Cloudflare Access as a second lock. The first lock is still the session.

Endpoints, one per statement (the names are a suggestion):

| Endpoint                                   | Statement                                     |
| ------------------------------------------ | --------------------------------------------- |
| `POST /api/admin/login`                    | `issue_staff_login_code`, then the e-mail     |
| `POST /api/admin/login/verify`             | `redeem_staff_login_code`, then the cookie    |
| `POST /api/admin/logout`                   | `end_staff_session`                           |
| `GET /api/admin/me`                        | `find_staff_by_session`                       |
| `GET /api/admin/customers`                 | `list_customers`                              |
| `GET /api/admin/customer`                  | `find_customer`                               |
| `POST /api/admin/customers`                | `create_customer_by_staff`                    |
| `POST /api/admin/customers/status`         | `set_customer_status`                         |
| `POST /api/admin/customers/contact`        | `update_customer_contact`                     |
| `GET /api/admin/packages`                  | `list_packages`                               |
| `GET /api/admin/package`                   | `find_package`                                |
| `POST /api/admin/packages`                 | `receive_package`                             |
| `POST /api/admin/packages/status`          | `set_package_status`                          |
| `POST /api/admin/packages/correct`         | `correct_package_status`                      |
| `POST /api/admin/packages/measures`        | `update_package_measures`                     |
| `GET /api/admin/invoices`                  | `list_invoices`                               |
| `GET /api/admin/invoice`                   | `find_invoice`                                |
| `POST /api/admin/invoices`                 | `create_invoice`                              |
| `POST /api/admin/invoices/items`           | `add_invoice_item`                            |
| `POST /api/admin/invoices/items/remove`    | `remove_invoice_item`                         |
| `POST /api/admin/invoices/issue`           | `issue_invoice`                               |
| `POST /api/admin/invoices/void`            | `void_invoice`                                |
| `POST /api/admin/payments`                 | `record_payment`                              |
| `GET /api/admin/payments/pending`          | `list_pending_payments`                       |
| `POST /api/admin/payments/confirm`         | `confirm_payment`                             |
| `POST /api/admin/payments/reject`          | `reject_payment`                              |
| `POST /api/admin/payments/reverse`         | `reverse_payment`                             |
| `GET /api/admin/staff`                     | `list_staff_users`                            |
| `POST /api/admin/staff`                    | `create_staff_user`                           |
| `POST /api/admin/staff/deactivate`         | `deactivate_staff_user`                       |
| `POST /api/admin/staff/role`               | `set_staff_role` (when there are roles)       |
| `GET /api/admin/audit`                     | `list_audit_log`                              |
| `GET /api/admin/health`                    | `find_invoice_drift`                          |
| `POST /api/account/payments` (the website) | `report_payment`, with the customer's session |

`GET` endpoints take their filters in the query string; validate them like a body.

## What to build, in order

Each step is usable on its own and has a way to know it is done.

### 1. The first super user and the team's sign-in

- Ask for the super user's e-mail and name; insert them by hand (DATABASE.md → "The first super user").
- `POST /api/admin/login` and `/verify`, with the numbers of the customers' sign-in (`src/data/account.ts`: digits, minutes, attempts, codes per quarter of an hour and per day) or stricter ones. Hash the code and the token exactly as `worker/auth/code.ts` and `worker/auth/session.ts` do. The e-mail of the code: copy `worker/auth/emails.ts`.
- `POST /api/admin/login` **answers the same** whether or not the address belongs to the team, and sends nothing to an address that does not.
- The sign-in page under `/admin/`.

Done when: the super user signs in with a code; a wrong code is counted and the sixth guess fails even if right; a customer's session cookie opens nothing under `/api/admin/`; a deactivated member's next request is answered `401`.

### 2. Customers

List and search, one customer (`find_customer`, with their packages and invoices from the lists filtered by customer), create an account, suspend and give back, change contact details.

- Validate a new customer with the rules of the sign-up (`worker/signup/validate.ts`: names, phone to E.164, country, department or state from `src/data/signup.ts`).
- **An account the team creates has no confirmed e-mail and no accepted terms** (`email_verified_at` and `terms_accepted_at` are empty). Decide with the owner what the customer does the first time they sign in: at least, show the terms and record the acceptance, and record the e-mail as confirmed (signing in with a code proves the address is theirs). That needs one small statement in `worker/store.ts` and a step in the sign-in; neither exists.
- Tell the customer their Carinova ID: send the welcome e-mail (`worker/signup/emails.ts`) or say it is the team's job.

Done when: an account created by the team gets the next `CNV-` number, can sign in on the site with a code, and a suspended one cannot, and is signed out where it was signed in.

### 3. Packages

Receive a package (the form is `receive_package`'s parameters), the list by status, one package with its history, move it forward, correct a mistake, complete its measures.

- The description and the note of an event are read by the customer; the internal note is not. Say so on the form.
- Offer only the moves that can happen: forward along the line, or out to returned / cancelled. A backwards move is a correction and asks for a reason.
- Los Ángeles is in the list of warehouses, closed: show it disabled, as the site does.

Done when: a package received in the back office appears in that customer's "Mi cuenta" under "En bodega", moves to "Enviados" and "Entregados" as its status changes, and shows its history with the notes.

### 4. Invoices and payments

A draft with its lines, issuing it, recording a payment, the queue of payments to confirm, confirming, rejecting, reversing, voiding.

- Propose a line from the package: its service, rate basis, weight or measures and the rates (`src/utils/rates.ts`: `quoteByWeight`, `quoteByVolume`, `quoteUnits`; prices in `RATES`, `src/data/carinova.ts`). The description is what the customer reads: write it as the calculator writes a quote ("Envío aéreo, 3 lb × US$6.50").
- Home delivery has its own charge (`kind = 'home_delivery'`); its price is not published: the team types it.
- Send amounts as text with two decimals (`"22.10"`), never as a float.
- `confirm_payment` can fail with the check `invoices_paid_within_total` or `invoices_void_is_unpaid` when someone else acted on the same invoice at the same moment. Catch exactly those two, treat them as "no row", and show the invoice again (DATABASE.md → "The statements of the back office").
- Show `find_invoice_drift` somewhere the super user sees it. It must be empty.

Done when: an issued invoice appears in the customer's "Mi cuenta" with its lines; a recorded payment shows it "en revisión"; confirming it shows it paid, or partially paid with the balance; two people confirming at once never take an invoice above its total (`npm run db:scratch` proves the database's part).

### 5. The customer's side of a payment (if the owner wants it)

`POST /api/account/payments` with `report_payment`, a form in "Mi cuenta" (both languages, voseo in Spanish), and a place for the picture of the receipt: an R2 bucket bound to the Worker, private, with the object's key in `payments.proof_key` and the picture served only through an endpoint that checks who is asking (the invoice's customer, or the team). Limit the size and the type of the upload. Nothing of this exists.

### 6. The team

List the team, create a member, deactivate one. Roles when the owner names them: a row in `staff_roles`, a table in code from role to the statements it may run, checked in the wrapper of step 1.

### 7. Keeping watch

A Cron Trigger that runs `find_invoice_drift` and e-mails the super user if it returns anything; a screen for `list_audit_log` on each customer, package, invoice and payment.

## Rules while building

From `AGENTS.md`, the ones that matter most here:

- **The database in `.env` is production.** Try SQL with `npm run db:check` (in the process) or `npm run db:scratch` (the real server, a schema of its own). Never write test rows in the real tables; never run the dev server against the real settings to "try" a form.
- **Secrets** (`DATABASE_URL`, `RESEND_API_KEY`, `SIGNUP_TOKEN_SECRET`…) are never committed, printed or logged. Read their names, not their values.
- **Do not log personal data**: no e-mails, names, phones or addresses in `console`, in errors or in `audit_log.details`.
- **Do not weaken the sign-in**: cookies stay `HttpOnly`, `Secure`, `__Host-`; hashes only in the database; the same answer whether or not an e-mail has an account; one statement per operation.
- **Worker code runs on Workers and on plain Node**: relative imports with the `.ts` extension, no `~/` alias, no `astro:*`, no Node-only API outside `dev-plugin.ts`, the tests and the tools under `db/`.
- **Validation lives in the Worker**, never only in the page. Every identifier that reaches a statement is a parameter.
- **`docs/PROJECT-LOG.md`** gets a Changelog line for every change and a Decisions row for every decision, in the same change.
- **Commit and deploy only when the owner asks.**

## Things that will save you time

- `memoryStore()` in `worker/store.ts` stands in for the database in development and in the unit tests. It does not know the rules of packages, invoices and payments, and should not learn them twice: test the back office's statements against a real PostgreSQL (`db/check.mjs` has everything needed), and keep the in-memory store for what it does today.
- `numeric` comes back from the driver as text and `bigint` as text or number depending on the driver; inside a `json_agg` both are JSON numbers. `worker/store.ts` → `numberOf`, `isoOf`, `jsonOf` handle it.
- The pages use Astro's `ClientRouter`: a click handler on `document` has to listen in the capture phase or the router takes the click first (`DialogKit.astro`). A custom element is connected again after each navigation; clean up in `disconnectedCallback`.
- Scripts carry no sentences: the component hands them the texts in a `data-*` attribute (`AccountPanel.astro`, `fill()` in `src/utils/template.ts`).
- `npm run preview` (the real Cloudflare runtime) is the only place where cookies with `__Host-`, the Worker's routing and the bindings behave as in production. Try every endpoint there once, with a `.dev.vars` that points at nothing real.
- On Windows with Git Bash, an argument that is only `/` or starts with `/` is rewritten into a Windows path. Pass whole URLs to scripts.

## Acceptance

Before calling the back office done:

1. `npm run build`, `npm run check` and `npm test` pass; `npm run db:check` and `npm run db:scratch` pass, with a case for every statement that was added or changed.
2. Without a staff session, every `/api/admin/` endpoint answers `401` and every `/admin/` page shows only the sign-in. With a customer's session, the same.
3. A customer never receives another customer's rows, the team's notes, a reason for a rejection that was written for the team, or the key of a receipt. `db/check.mjs` has the assertions for today's answer; extend them with every field you add.
4. Every action that changes something has its row in `audit_log`, with who did it.
5. `find_invoice_drift` returns nothing after a day of use.
6. The site still works with the back office's settings missing: the public pages, the sign-up and "Mi cuenta" do not depend on it.
7. `docs/DATABASE.md`, this file, README → "Backend" and `docs/PROJECT-LOG.md` say what is now true.
