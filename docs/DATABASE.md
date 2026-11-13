# Carinova — the database

PostgreSQL on Neon. One database serves the website (sign-up, sign-in, "Mi cuenta") and the back office that Carinova's team will use (customers, packages, invoices, payments). The back office is **not built yet**: this document, `db/schema.sql` and `db/queries.sql` are what it is to be built on. What is left to build is in [BACKEND-HANDOFF.md](BACKEND-HANDOFF.md).

## In one page

| File                  | What it is                                                                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `db/schema.sql`       | The tables, their rules and the reference rows. Safe to run again on a database with customers                                                                        |
| `db/queries.sql`      | 35 named statements: everything the back office does. Each one is a single statement, and the ones that change something write their audit row. Nothing runs them yet |
| `worker/store.ts`     | The statements the website's Worker runs today: sign-up, sign-in, the customer's account and its packages and invoices                                                |
| `src/data/account.ts` | The statuses as the site knows them, with the words customers read (Spanish and English)                                                                              |
| `db/schema.test.ts`   | Unit test (`npm test`): the lists of statuses, the Miami address and the branches are the same in the schema and in the site's data; the schema stays re-runnable     |
| `db/check.mjs`        | `npm run db:check`: the schema, every statement of `db/queries.sql` and the Worker's statements against a real PostgreSQL that lives inside the process               |
| `db/neon.mjs`         | `npm run db:status`, `db:scratch`, `db:apply`: what the real database has, a check on the real server in a throwaway schema, and applying `db/schema.sql`             |

**Who writes what today.** The Worker creates customers, their sign-in codes and their sessions, and it _reads_ packages, invoices and payments to show them to their owner (`GET /api/account/activity`). Nothing writes packages, invoices, payments, team accounts or the audit log yet: those tables are empty until the back office exists.

**The real database** (Neon, the one in `.env` and in production) had `db/schema.sql` applied on 2026-11-13: it has the fifteen tables and the view, the customers that were there, the two warehouses, the two branches and the role. `staff_users` is empty: there is no super user yet (→ [The first super user](#the-first-super-user)).

## Rules that never bend

1. **The database in `.env` is production, with real customers.** Never create, change or delete rows of its tables to try something. To run SQL on the real server use `npm run db:scratch`, which works in a schema of its own and drops it. Everything else is tried in `npm run db:check`, which touches nothing outside its process.
2. **`db/schema.sql` must stay safe to run again**, on an empty database and on one with customers: `CREATE … IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, reference rows with `ON CONFLICT DO NOTHING`, and nothing that drops, deletes or rewrites. The unit test enforces it.
3. **One action, one statement.** It happens whole or not at all, with no transaction to manage (the Neon HTTP driver the Worker uses offers nothing else). An action that changes something writes its `audit_log` row in the same statement.
4. **Codes and session tokens never reach the database**: only their hashes. This holds for the team exactly as for customers.
5. **Money is US dollars, as `numeric`.** Never a float on the way in; on the way out the Worker turns it into a number only to show it.
6. **A status list lives in two places** — a `CHECK` in the schema and a constant in `src/data/account.ts` — and they change together. `npm test` fails when they differ.
7. **Do not log or print customers' personal data**, here or in any tool that reads this database.

## Map

```
warehouses ─────────────┐
branches ───────────────┤
                        ▼
customers ──────────< packages ──< package_events
    │                    ▲
    │                    │ (a line may charge for a package)
    ├──< invoices ──< invoice_items
    │        └─────< payments
    │        └────── invoice_totals   (view: total, paid, pending, balance, payment_state)
    ├──< customer_login_codes
    └──< customer_sessions

staff_roles ──< staff_users ──< staff_login_codes
                     │     └──< staff_sessions
                     └──< audit_log            (and "who did it" columns on customers, packages, invoices, payments)
```

`──<` reads "has many". Customers and the team are separate on purpose: different tables for accounts, codes and sessions, so nothing a customer can do reaches a team account.

## Conventions

- **Ids and codes.** Every table has a numeric `id` the database assigns (identity, never reused). The three things people talk about also have a code built from the id, stored in a generated column and unique: `customers.code` = `CNV-00001` (the Carinova ID), `packages.code` = `PKG-000001`, `invoices.number` = `INV-000001`. The digits are a minimum: after `CNV-99999` comes `CNV-100000`. Statements take and return the codes; ids stay inside. A failed insert can skip a number (PostgreSQL does not give sequence values back), so the numbers have no promise of being consecutive.
- **Time** is `timestamptz`. The Worker answers ISO 8601 in UTC; the pages write it in the reader's language.
- **Text that is optional is `NULL` when absent**, never an empty string: the statements turn `''` into `NULL` on the way in (`NULLIF(btrim(…), '')`), and the Worker turns `NULL` into `''` on the way out.
- **E-mails are stored in lower case** (a `CHECK` on each table), and that is how they are looked up.
- **Units**: pounds and inches for what the warehouse measures (what the rates are written in), US dollars for money.
- **Names**: tables are plural, columns `snake_case`, constraints `<table>_<what>` (`invoices_paid_within_total`), so an error names the rule that refused.
- **Nothing clever**: plain columns, constraints and one view. No triggers, no functions, no extensions, nothing tied to one tool.

## Tables

`PK` primary key · `FK` foreign key · a type followed by `?` can be `NULL`.

### Reference

#### `warehouses` — where packages are received in the United States

| Column                                                                    | Type         | Meaning                                                                                            |
| ------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `id`                                                                      | smallint PK  |                                                                                                    |
| `code`                                                                    | text, unique | Three capital letters: `MIA`, `LAX`. The same code as `RECEPTION_POINTS` in `src/data/carinova.ts` |
| `name`                                                                    | text         | The city, as people read it                                                                        |
| `phone`, `address_line1`, `address_line2`, `city`, `state`, `postal_code` | text?        | The address customers write at a store's checkout. Empty while the warehouse is not open           |
| `country`                                                                 | text         | ISO 3166-1 alpha-2. Default `US`                                                                   |
| `is_active`                                                               | boolean      | `false`: announced, not receiving yet ("Próximamente"). Default `false`                            |
| `sort_order`                                                              | smallint     | The order they are listed in                                                                       |
| `created_at`                                                              | timestamptz  |                                                                                                    |

Rules: `warehouses_code_format` (three capitals); `warehouses_active_has_address` (an open warehouse has line 1, city, state and postal code). Rows: **`MIA`** Miami, open, with the address of `MIAMI_ADDRESS`; **`LAX`** Los Ángeles, closed, no address. `receive_package` refuses a closed warehouse.

To open Los Ángeles: fill its address and set `is_active = true` in one `UPDATE`, add the address to `src/data/carinova.ts` (`RECEPTION_POINTS`, and what `UsAddressCard.astro` shows), and extend the unit test. The site reads its own data, not this table.

#### `branches` — where packages are picked up in Nicaragua

`id` smallint PK · `code` text unique (`managua`, `bluefields`: the `id` of the branch in `BRANCHES`, `src/data/carinova.ts`, which holds its address and hours) · `name` · `is_active` boolean, default `true` · `sort_order` · `created_at`.

### Carinova's team

#### `staff_roles` — what a member of the team may do

`code` text PK (lower case and underscores: `superuser`) · `name` (as the back office shows it) · `description` · `created_at`. One row: **`superuser`**. → [Roles](#roles).

#### `staff_users` — the team's accounts

| Column                     | Type                     | Meaning                                                                             |
| -------------------------- | ------------------------ | ----------------------------------------------------------------------------------- |
| `id`                       | integer PK               |                                                                                     |
| `email`                    | text, unique, lower case | Also how the person signs in                                                        |
| `full_name`                | text                     |                                                                                     |
| `role`                     | text FK → `staff_roles`  |                                                                                     |
| `is_active`                | boolean                  | `false`: kept for the history of what it did, can no longer sign in. Default `true` |
| `created_by`               | integer? FK → itself     | The super user who created the account. Empty for the first one                     |
| `last_login_at`            | timestamptz?             |                                                                                     |
| `deactivated_at`           | timestamptz?             | Set exactly when `is_active` is `false` (`staff_users_inactive_has_date`)           |
| `created_at`, `updated_at` | timestamptz              |                                                                                     |

Nobody signs up as staff. The first super user is inserted by hand; every other account is created by a super user (`create_staff_user`). Accounts are never deleted: they are deactivated.

#### `staff_login_codes`, `staff_sessions` — how the team signs in

The same design as the customers' tables below, with `staff_id` in the place of `customer_id`: a one-time code by e-mail (`code_hash`, `attempts`, `expires_at`, `consumed_at`), then a session (`token_hash` PK, `expires_at`). Deleting a staff row would delete its codes and sessions (`ON DELETE CASCADE`), but staff rows are not deleted.

#### `audit_log` — who did what in the back office

| Column       | Type                        | Meaning                                                                                              |
| ------------ | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `id`         | bigint PK                   |                                                                                                      |
| `staff_id`   | integer? FK → `staff_users` | Who. Empty when it was not a member of the team: a payment its customer reported                     |
| `action`     | text                        | `<thing>.<verb>`: see the list below                                                                 |
| `entity`     | text                        | The table the action was about: `customers`, `packages`, `invoices`, `payments`, `staff_users`       |
| `entity_id`  | text                        | The row's `id`, as text                                                                              |
| `details`    | jsonb                       | What explains the action: the new status, an amount, a reason. Never a secret, never contact details |
| `created_at` | timestamptz                 |                                                                                                      |

Append-only: rows are never changed or deleted. Actions written by `db/queries.sql`: `staff.create`, `staff.role`, `staff.deactivate`, `customer.create`, `customer.status`, `customer.update`, `package.receive`, `package.status`, `package.correct`, `package.measure`, `invoice.create`, `invoice.issue`, `invoice.void`, `payment.record`, `payment.report`, `payment.confirm`, `payment.reject`, `payment.reverse`. Not logged: the first super user (there is nobody to name), the lines of a draft (the record says the total when the invoice is issued), signing in and out, and reading.

### Customers

#### `customers` — one row per customer

| Column                           | Type                        | Meaning                                                                                            |
| -------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| `id`                             | integer PK                  | Customer number: 1, 2, 3…                                                                          |
| `code`                           | text, generated, unique     | The Carinova ID: `CNV-00001`                                                                       |
| `email`                          | text, unique, lower case    | Also how the customer signs in                                                                     |
| `first_name`, `last_name`        | text                        | For a company, its contact person                                                                  |
| `phone`                          | text                        | E.164: `+50588552956`                                                                              |
| `country`                        | text                        | `NI` or `US`                                                                                       |
| `address_line1`, `city`, `state` | text                        | `state` is the department (Nicaragua) or the state (United States), by name                        |
| `address_line2`, `postal_code`   | text?                       |                                                                                                    |
| `email_verified_at`              | timestamptz?                | When the customer opened the confirmation link. Empty for an account the team created (→ hand-off) |
| `terms_accepted_at`              | timestamptz?                | When the customer accepted the terms and the privacy policy. Empty for an account the team created |
| `source`                         | text                        | `web` (the sign-up form) or `staff` (the team created it). Default `web`                           |
| `locale`                         | text                        | `es` or `en`: the language to write to them in. Default `es`                                       |
| `status`                         | text                        | `active` or `suspended`. Default `active`                                                          |
| `account_type`                   | text                        | `personal` or `business`. Default `personal`                                                       |
| `company_name`                   | text?                       | Required for a `business` account (`customers_business_has_name`)                                  |
| `created_by_staff_id`            | integer? FK → `staff_users` | Who created it, when it was not the sign-up form                                                   |
| `created_at`, `updated_at`       | timestamptz                 |                                                                                                    |

A **suspended** customer cannot sign in and their open sessions stop working: the Worker's statements all ask for `status = 'active'`, and `set_customer_status` deletes the sessions. Their packages and invoices stay, and the team keeps working on them.

A customer with packages or invoices cannot be deleted (the foreign keys refuse): suspend the account instead. A test customer with nothing can be deleted; its codes and sessions go with it.

#### `customer_login_codes` — one-time sign-in codes

`id` bigint PK · `customer_id` FK (cascade) · `code_hash` (HMAC-SHA-256 of the code, keyed with `SIGNUP_TOKEN_SECRET`, which the database does not have: six digits could be guessed back from a plain hash) · `attempts` smallint (guesses made against this code) · `created_at` · `expires_at` (minutes later; a newer code ends this one at once) · `consumed_at` (a code works once).

#### `customer_sessions` — who is signed in

`token_hash` text PK (SHA-256 of the session token, hexadecimal; the token only exists in the customer's browser, in a cookie scripts cannot read) · `customer_id` FK (cascade) · `created_at` · `expires_at`.

### Packages

#### `packages` — every package received at a warehouse

A row is created when a package is physically received: that moment is where the delivery estimates count from.

| Column                                   | Type                        | Meaning                                                                                                                                     |
| ---------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                     | bigint PK                   |                                                                                                                                             |
| `code`                                   | text, generated, unique     | The reference the customer sees: `PKG-000001`                                                                                               |
| `customer_id`                            | integer FK → `customers`    |                                                                                                                                             |
| `warehouse_id`                           | smallint FK → `warehouses`  | Where it was received                                                                                                                       |
| `branch_id`                              | smallint? FK → `branches`   | Where it will be picked up. Empty until it is known, and for home delivery                                                                  |
| `description`                            | text                        | What it is, as the team writes it on reception. **The customer reads it**                                                                   |
| `store`                                  | text?                       | Where it was bought, when known: "Amazon"                                                                                                   |
| `carrier`, `carrier_tracking`            | text?                       | Who delivered it to the warehouse and under which number                                                                                    |
| `service`                                | text                        | `air` or `sea`                                                                                                                              |
| `rate_basis`                             | text                        | What it is charged by: `weight` (per pound), `volume` (per cubic foot, by sea) or `unit` (a flat rate per device, by air). Default `weight` |
| `weight_lb`                              | numeric(9,2)?               | Pounds, as weighed                                                                                                                          |
| `length_in`, `width_in`, `height_in`     | numeric(8,2)?               | Inches, as measured                                                                                                                         |
| `pieces`                                 | integer                     | Boxes or units the row stands for. Default 1                                                                                                |
| `declared_value_usd`                     | numeric(12,2)?              |                                                                                                                                             |
| `delivery_method`                        | text                        | `pickup` at a branch or `home` delivery. Default `pickup`                                                                                   |
| `status`                                 | text                        | Where it is now → [The life of a package](#the-life-of-a-package). Default `received`                                                       |
| `received_at`                            | timestamptz                 | The reception at the warehouse                                                                                                              |
| `shipped_at`, `ready_at`, `delivered_at` | timestamptz?                | When each later stage was reached                                                                                                           |
| `internal_notes`                         | text?                       | For the team only. **Never shown to the customer**: no statement of the Worker selects it                                                   |
| `created_by_staff_id`                    | integer? FK → `staff_users` |                                                                                                                                             |
| `created_at`, `updated_at`               | timestamptz                 |                                                                                                                                             |

Rules: the lists above are `CHECK`s (`packages_service_known`, `packages_rate_basis_known`, `packages_delivery_method_known`, `packages_status_known`); `packages_measures_positive` (weights, measures and value above zero when given, at least one piece).

The price is not stored on the package: it is the line of an invoice. The rates are in `src/data/carinova.ts` (`RATES`) and the arithmetic in `src/utils/rates.ts`, which the back office should use to propose a line (→ hand-off).

#### `package_events` — the history of a package

`id` bigint PK · `package_id` FK (cascade) · `status` (the status the package took with this event; same list) · `note` text? (what the customer reads next to it: "Retenido en aduana") · `staff_id` FK? (who recorded it) · `created_at`.

`packages.status` and the newest event always agree, because a change of status is one statement that writes both.

### Invoices and payments

#### `invoices` — what a customer is charged

| Column                             | Type                       | Meaning                                                                                         |
| ---------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------- |
| `id`                               | bigint PK                  |                                                                                                 |
| `number`                           | text, generated, unique    | The number the customer sees: `INV-000001`                                                      |
| `customer_id`                      | integer FK → `customers`   |                                                                                                 |
| `status`                           | text                       | `draft` (being prepared; the customer does not see it), `issued` (the customer owes it), `void` |
| `currency`                         | text                       | Always `USD` (`invoices_currency_usd`)                                                          |
| `total_usd`                        | numeric(14,2)?             | The sum of its lines, **fixed when it is issued**. Empty while it is a draft                    |
| `paid_usd`                         | numeric(14,2)              | The sum of its **confirmed** payments. Only `confirm_payment` and `reverse_payment` change it   |
| `notes`                            | text?                      | For the customer: how to pay, what the invoice is for                                           |
| `issued_at`, `due_at`, `voided_at` | timestamptz?               |                                                                                                 |
| `void_reason`                      | text?                      | Required when void                                                                              |
| `created_by_staff_id`              | integer FK → `staff_users` |                                                                                                 |
| `created_at`, `updated_at`         | timestamptz                |                                                                                                 |

The rules that protect the money are on this row, so the database refuses what must never happen whatever is going on at the same moment:

| Constraint                   | What it refuses                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `invoices_issued_has_total`  | A draft with a total, an issued or void invoice without one, a total of zero or less     |
| `invoices_paid_within_total` | More confirmed than the invoice is for; anything confirmed on a draft; a negative amount |
| `invoices_void_is_unpaid`    | A void invoice with confirmed money on it                                                |
| `invoices_void_has_reason`   | A void invoice without date or reason; a date on one that is not void                    |
| `invoices_issued_has_date`   | An issued or void invoice without `issued_at`                                            |

#### `invoice_items` — the lines of an invoice

`id` bigint PK · `invoice_id` FK (cascade) · `package_id` FK? (the package the line charges for; empty for a charge that is not about one package) · `kind` (`shipping`, `home_delivery`, `assisted_purchase`, `storage`, `other`, `discount`; default `shipping`) · `description` (what the customer reads: "Envío aéreo, 3 lb × US$6.50") · `quantity` numeric(10,2), above zero · `unit_price_usd` numeric(12,2) · `amount_usd` numeric(14,2), generated: `round(quantity × unit_price_usd, 2)` · `created_at`.

A discount is a line of kind `discount` with a negative unit price, and only a discount is negative (`invoice_items_discount_is_negative`). Lines can be added and removed only while the invoice is a draft (the statements see to it; the table itself does not).

#### `payments` — money received towards an invoice

| Column                     | Type                        | Meaning                                                                                 |
| -------------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| `id`                       | bigint PK                   |                                                                                         |
| `invoice_id`               | bigint FK → `invoices`      |                                                                                         |
| `amount_usd`               | numeric(14,2)               | Above zero                                                                              |
| `method`                   | text                        | `cash`, `bank_transfer`, `card` or `other`                                              |
| `reference`                | text?                       | The bank's reference or the number of the receipt. The customer reads it                |
| `proof_key`                | text?                       | Where the picture of the receipt is: the key of the object in a bucket. Not shown as is |
| `paid_at`                  | timestamptz                 | When the money was paid, as reported                                                    |
| `status`                   | text                        | `pending`, `confirmed` or `rejected`. Default `pending`                                 |
| `reported_by`              | text                        | `staff` or `customer`                                                                   |
| `recorded_by_staff_id`     | integer? FK → `staff_users` | The member of the team who recorded it, when staff did                                  |
| `reviewed_by_staff_id`     | integer? FK → `staff_users` | Who confirmed or rejected it                                                            |
| `reviewed_at`              | timestamptz?                |                                                                                         |
| `rejection_reason`         | text?                       | Required when rejected                                                                  |
| `created_at`, `updated_at` | timestamptz                 |                                                                                         |

A payment counts towards its invoice only once it is `confirmed`. `payments_review_complete`: a pending payment has no reviewer and no review date, and any other has both. A payment is never deleted: a mistake is rejected (while pending) or reversed (once confirmed), with its reason.

#### `invoice_totals` (view) — what each invoice adds up to

One row per invoice: `invoice_id`, `total_usd` (for a draft, the sum of its lines so far; from the moment it is issued, the total it was issued for), `paid_usd`, `pending_usd` (payments waiting to be confirmed), `balance_usd` (`total − paid`) and `payment_state`, which is what the customer reads:

| `payment_state` | When                                                      | The customer sees it |
| --------------- | --------------------------------------------------------- | -------------------- |
| `draft`         | Not issued yet                                            | No                   |
| `void`          | Annulled                                                  | Yes                  |
| `paid`          | Its confirmed payments cover its total                    | Yes                  |
| `in_review`     | Not covered yet, and a payment is waiting to be confirmed | Yes                  |
| `partial`       | Part of it is confirmed and nothing is waiting            | Yes                  |
| `unpaid`        | Nothing confirmed and nothing waiting                     | Yes                  |

The words for each state are `INVOICE_STATES` in `src/data/account.ts`.

## Lifecycles

### The life of a package

```
received → processing → in_transit → ready → delivered
    └──────────┴────────────┴──────────┴──→ returned | cancelled
```

| Status       | Meaning                                             | Date it sets   | In "Mi cuenta" it counts as |
| ------------ | --------------------------------------------------- | -------------- | --------------------------- |
| `received`   | Received at the warehouse                           | `received_at`  | At the warehouse            |
| `processing` | Being prepared for the trip                         |                | At the warehouse            |
| `in_transit` | On its way to Nicaragua                             | `shipped_at`   | Shipped                     |
| `ready`      | In Nicaragua: ready to pick up, or out for delivery | `ready_at`     | Shipped                     |
| `delivered`  | The customer has it                                 | `delivered_at` | Delivered                   |
| `returned`   | Sent back                                           |                | —                           |
| `cancelled`  | Entered by mistake, or not to be shipped            |                | —                           |

- **Forward only**: `set_package_status` moves a package along the line (a stage may be skipped, and the dates of the stages it passed are filled in), or out to `returned` / `cancelled` from any stage before delivery. A delivered, returned or cancelled package is finished.
- **A mistake** is put right with `correct_package_status`, which may move in any direction, needs a reason, and leaves an event the customer reads. Nothing is erased from the history; the dates of stages that no longer apply are cleared.
- The note of an event is for the customer. Notes for the team go in `packages.internal_notes`.

### The life of an invoice

```
draft ──issue_invoice──▶ issued ──void_invoice──▶ void
                            │
          payments: pending ──confirm_payment──▶ confirmed ──reverse_payment──▶ rejected
                       └──────reject_payment───▶ rejected
```

1. `create_invoice` starts a draft. `add_invoice_item` / `remove_invoice_item` change its lines.
2. `issue_invoice` fixes the total at the sum of the lines (it needs a line and a total above zero). From here the customer sees it and the lines no longer change. An invoice issued with a mistake is voided and made again.
3. Payments are recorded as `pending` (`record_payment` by the team; `report_payment` by the customer, once the site offers it), for no more than the invoice still owes.
4. `confirm_payment` makes a payment count: the payment turns `confirmed` and the invoice's `paid_usd` grows, in the same statement. `reject_payment` turns a pending payment down with a reason.
5. `reverse_payment` takes back a confirmation made by mistake: the payment ends `rejected` with the reason and `paid_usd` shrinks.
6. `void_invoice` annuls an issued invoice, with a reason, **only while nothing is confirmed on it**.

### Accounts

- **Team**: active ⇄ never back. `deactivate_staff_user` ends an account's access and its sessions; there is no statement to reactivate one (create the decision when it is needed: it is one `UPDATE`).
- **Customers**: `active` ⇄ `suspended` with `set_customer_status`.

## The statements of the back office (`db/queries.sql`)

The file is the contract. Each statement has a name (`-- name: receive_package`, the format of sqlc and yesql), one comment line per parameter in order, and is exactly one statement. Parameters are positional (`$1`, `$2`…), each with a cast, so every driver sends them the same way.

**Who may run it.** `actor` is the `id` of the member of the team who is signed in (from `find_staff_by_session`), never something a form sent. Every statement that changes something checks that the actor is an active member of the team; the ones that manage the team ask for a super user. → [Roles](#roles).

**What comes back.** The row of what was done, or **no row** when the statement could not act: the actor is not allowed, the thing does not exist, or the rule in the statement's comment says no. The back office answers "not found or not allowed" and shows the thing again; it never has to guess which. Two kinds of error exist besides:

- **A value the tables do not accept** — an unknown status or method, an amount of zero, a discount that is not negative — is an error of the database named after the check (`payments_amount_positive`). Validate what a form sends before running a statement, as `worker/signup/validate.ts` does; treat such an error as a bug.
- **`confirm_payment` at the same moment as another action on the same invoice** can fail with `invoices_paid_within_total` (two confirmations that together exceed the total) or `invoices_void_is_unpaid` (the invoice was being voided). Nothing of the statement is kept: the payment is still pending. Treat exactly these two as "no row" and show the invoice again.

| Statement                  | Who        | Does                                                                                             | No row when                                                                          | Audit              |
| -------------------------- | ---------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------ |
| `create_first_superuser`   | by hand    | The first account of the back office                                                             | The team's table is not empty                                                        | —                  |
| `create_staff_user`        | super user | Creates a team account                                                                           | The role does not exist; the e-mail has an account                                   | `staff.create`     |
| `set_staff_role`           | super user | Changes a member's role                                                                          | Same role; no such role; it would leave no active super user                         | `staff.role`       |
| `deactivate_staff_user`    | super user | Ends a member's access and sessions                                                              | Already inactive; it is the last active super user                                   | `staff.deactivate` |
| `list_staff_users`         | —          | The team, active first                                                                           |                                                                                      |                    |
| `issue_staff_login_code`   | anyone     | Keeps a sign-in code for the member with this e-mail; earlier codes stop working                 | Nobody active has that e-mail; too many codes lately. **Answer the same either way** | —                  |
| `redeem_staff_login_code`  | anyone     | Checks a code (every call counts as an attempt) and opens the session                            | Wrong, expired or used code; no attempts left                                        | —                  |
| `find_staff_by_session`    | —          | Who a session belongs to: run it on every request of the back office                             | No such session; expired; the account was deactivated                                |                    |
| `end_staff_session`        | —          | Signs out                                                                                        |                                                                                      | —                  |
| `list_customers`           | —          | Search by Carinova ID, e-mail, name or company; empty search lists everyone                      |                                                                                      |                    |
| `find_customer`            | —          | One customer as the team sees them, with their open packages and what they owe                   | No such customer                                                                     |                    |
| `create_customer_by_staff` | team       | Creates a customer's account (not confirmed, no terms yet); the database assigns the ID          | The e-mail has an account; a business without a company name                         | `customer.create`  |
| `set_customer_status`      | team       | Suspends an account (ending its sessions) or gives it back                                       | No such customer; already in that status                                             | `customer.status`  |
| `update_customer_contact`  | team       | Changes phone and address; `NULL` leaves a field as it is                                        | No such customer                                                                     | `customer.update`  |
| `receive_package`          | team       | The package, its first event and the record, together                                            | No such customer; the warehouse is not open; no such branch                          | `package.receive`  |
| `set_package_status`       | team       | Moves a package forward, with its event                                                          | No such package; it finished; the move goes backwards or nowhere; unknown status     | `package.status`   |
| `correct_package_status`   | team       | Puts a package where it really is, with a reason                                                 | No such package; same status; no reason                                              | `package.correct`  |
| `update_package_measures`  | team       | Weight, measures, pieces, rate basis; `NULL` leaves a value as it is                             | No such package                                                                      | `package.measure`  |
| `list_packages`            | —          | The team's list, by status and by customer (or all), with the owner and whether it was invoiced  |                                                                                      |                    |
| `find_package`             | —          | One package with the team's note, its history (who recorded each step) and its invoices          | No such package                                                                      |                    |
| `create_invoice`           | team       | Starts a draft for a customer                                                                    | No such customer                                                                     | `invoice.create`   |
| `add_invoice_item`         | team       | Adds a line to a draft                                                                           | Not a draft; the package is not that customer's                                      | —                  |
| `remove_invoice_item`      | team       | Takes a line out of a draft                                                                      | Not a draft; no such line                                                            | —                  |
| `issue_invoice`            | team       | Issues a draft and fixes its total                                                               | Not a draft; no lines; total not above zero                                          | `invoice.issue`    |
| `void_invoice`             | team       | Annuls an issued invoice, with a reason                                                          | Not issued; something is confirmed on it; no reason                                  | `invoice.void`     |
| `record_payment`           | team       | Records money received, as pending                                                               | The invoice is not issued; the amount is above its balance                           | `payment.record`   |
| `report_payment`           | customer   | The customer says they paid (by their **session**), as pending                                   | No session; suspended; not their invoice; not issued; above what is left to cover    | `payment.report`   |
| `confirm_payment`          | team       | Makes a pending payment count; returns the invoice's new amounts                                 | Not pending; the invoice is not issued; it would exceed the total                    | `payment.confirm`  |
| `reject_payment`           | team       | Turns a pending payment down, with a reason                                                      | Not pending; no reason                                                               | `payment.reject`   |
| `reverse_payment`          | team       | Takes back a confirmed payment, with a reason; returns the invoice's new amounts                 | Not confirmed; no reason                                                             | `payment.reverse`  |
| `list_pending_payments`    | —          | The queue of payments waiting, oldest first                                                      |                                                                                      |                    |
| `list_invoices`            | —          | The team's list, by `payment_state` and by customer (or all)                                     |                                                                                      |                    |
| `find_invoice`             | —          | One invoice with its amounts, its lines and its payments, with the ids the other statements take | No such invoice                                                                      |                    |
| `find_invoice_drift`       | —          | Health check: invoices whose stored amounts do not match their lines and confirmed payments      | **It must return nothing**                                                           |                    |
| `list_audit_log`           | —          | What was done to one thing, newest first                                                         |                                                                                      |                    |

"team" is any active member; "—" under Who marks a read with no check of its own: **the back office must have found the staff session first** (`find_staff_by_session`) before running anything, reads included. The three `find_…` reads return what only the team may see (the team's notes, the reasons, where a receipt is kept, drafts): they are never to be reached from a customer's session. The customer's own view is `FIND_ACTIVITY` in `worker/store.ts`, which selects none of that.

`report_payment` is the one statement here that is not the team's: it belongs to the website's Worker and waits in this file until "Mi cuenta" offers "I paid this". It finds the customer from the session and joins the invoice to that customer, so a customer can never report a payment on someone else's invoice.

### Using them from code

The Worker's own statements are constants in `worker/store.ts`, run through one function, `Query = (text, params) => Promise<rows>`; `sqlStore(query)` wraps them and `memoryStore()` stands in for development and tests. Build the back office's store the same way:

- Keep `db/queries.sql` the single source. The Worker must run on Workers and on plain Node, so it cannot read a file at run time: put the statements in a module (by hand or generated) and add a unit test that fails when a statement in the module differs from the one of the same name in `db/queries.sql`. `db/check.mjs` shows how to read the file by name.
- With `@neondatabase/serverless`: `const sql = neon(DATABASE_URL); await sql.query(text, params)` returns the rows. `numeric` comes back as text (turn it into a number only to show it), `timestamptz` as a `Date` or a string depending on the driver (`worker/store.ts` → `isoOf`).
- Never build SQL by joining strings with something a person typed. Every value is a parameter.

## The first super user

`staff_users` is empty in the real database, and nothing in the site can create a team account. Once Carinova says who the super user is, run `create_first_superuser` **by hand, once**, in the Neon SQL Editor, with the person's e-mail and name in the place of `$1` and `$2`:

```sql
INSERT INTO staff_users (email, full_name, role)
SELECT lower(btrim('persona@example.com')), btrim('Nombre Apellido'), 'superuser'
WHERE NOT EXISTS (SELECT 1 FROM staff_users)
RETURNING id, email, full_name, role;
```

It returns the new row, and does nothing if the table already has someone. That person then signs in to the back office with a one-time code sent to that address (once the back office exists) and creates everyone else from there. `npm run db:status` says how many active super users there are, without naming them.

If the address was typed wrong and it is still the only row, correct it with one `UPDATE staff_users SET email = lower('…') WHERE id = 1;`.

## Roles

Today there is one role, `superuser`: it manages everyone (customers and team), creates accounts, receives packages, and manages and confirms invoices and payments. Assigning roles is prepared and not offered yet:

- A role is a row of `staff_roles`. To add one, add it to the `INSERT … ON CONFLICT DO NOTHING` of `db/schema.sql` and apply the schema.
- `set_staff_role` already changes a member's role (and refuses to leave the team without an active super user). `create_staff_user` already takes the role.
- **What a role may do is decided by the back office, in one place**: a table in code from role to the statements it may run, checked before running any. The SQL only knows two levels: "an active member of the team" and, for the three statements that manage the team, "a super user". Do not scatter role checks through handlers.

## What the website reads

`GET /api/account/activity` (Worker: `worker/api.ts` → `activity`; statement `FIND_ACTIVITY` in `worker/store.ts`) answers, for the customer whose session cookie the request carries:

```jsonc
{
  "ok": true,
  "packages": [
    {
      "reference": "PKG-000128",
      "description": "Laptop Dell Inspiron 15",
      "store": "Best Buy",
      "carrier": "UPS",
      "carrierTracking": "1Z…",
      "service": "air",
      "status": "received",
      "warehouse": "MIA",
      "branch": "managua",
      "deliveryMethod": "pickup",
      "weightLb": 5.2,
      "pieces": 1,
      "receivedAt": "2026-11-10T15:04:00.000Z",
      "shippedAt": null,
      "readyAt": null,
      "deliveredAt": null,
      "events": [{ "status": "received", "at": "2026-11-10T15:04:00.000Z", "note": "" }],
    },
  ],
  "invoices": [
    {
      "number": "INV-000052",
      "state": "in_review",
      "issuedAt": "…",
      "dueAt": null,
      "total": 45,
      "paid": 0,
      "pending": 22.1,
      "balance": 45,
      "notes": "",
      "items": [{ "description": "Envío aéreo, 5.2 lb × US$6.50", "amount": 33.8, "packageReference": "PKG-000128" }],
      "payments": [
        { "amount": 22.1, "method": "bank_transfer", "status": "pending", "paidAt": "…", "reference": "BAC 884120" },
      ],
    },
  ],
}
```

- Newest first, at most `ACCOUNT_LIST_LIMIT` (50) of each. Drafts are left out. `401 signed_out` without a live session (the cookies are cleared), `503` while the database is not configured.
- Only ever the session's own customer: the statement starts from the session and nothing the request says can change whose rows come back.
- What never leaves the database: `internal_notes`, `proof_key`, `rejection_reason`, `void_reason`, `declared_value_usd`, the measures, any id, anything about the team. If the customer should see one of them, add it to `FIND_ACTIVITY`, to the types above it, to `AccountPanel.astro` and to the check in `db/check.mjs` that reads the answer.
- The page that shows it is `src/components/carinova/AccountPanel.astro`; the words for each status are in `src/data/account.ts`.

## Changing the database

1. Change `db/schema.sql` so that it still runs again safely: a new table as `CREATE TABLE IF NOT EXISTS`; a new column both inside its `CREATE TABLE` (for a new database) and as `ALTER TABLE … ADD COLUMN IF NOT EXISTS` with its default (for the ones that exist); a new reference row with `ON CONFLICT DO NOTHING`. Changing or dropping a constraint or a column on a database with data needs its own statement, written and reviewed for that one case: the file has none of those today, and the unit test will stop you, on purpose.
2. A new status goes in the `CHECK`, in `src/data/account.ts` with its words in both languages, and in the statements and pages that list statuses. `npm test` fails until both sides agree. (A `CHECK` that already exists is not changed by running the schema again: adding a value to one is one of the cases of point 1.)
3. Change or add the statements (`db/queries.sql`, `worker/store.ts`) and say in the comment of each when it returns no row.
4. Add the case to `db/check.mjs` and run the checks below.
5. Apply it to the real database (`npm run db:apply`), and write the change in `docs/PROJECT-LOG.md`.

## Checking a change

| Command              | What it proves                                                                                                                                                                                                                                       | Touches                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `npm test`           | The schema and the site's data agree; the schema is re-runnable; the Worker's endpoints behave (on the in-memory store)                                                                                                                              | Nothing                                |
| `npm run db:check`   | On a real PostgreSQL inside the process: the upgrade of a database that already has a signed-in customer, every table and rule, **every statement of `db/queries.sql`** (it fails if one is never run), and what a customer's account reads          | Nothing                                |
| `npm run db:scratch` | On the real server, over the real driver, in a schema of its own that is dropped at the end: the schema runs twice, and **what two people do at the same moment** (two confirmations, a confirmation and a void, two reversals, the same move twice) | A throwaway schema; real tables not    |
| `npm run db:status`  | What the real database has: tables, row counts, the next customer number, how many active super users, leftover test schemas                                                                                                                         | Reads counts only                      |
| `npm run db:apply`   | Runs `db/schema.sql` on the real tables and fails if any table that was there ends with a different number of rows                                                                                                                                   | The real schema (adds what is missing) |

`db:check` needs PGlite, which is not a dependency of the project: `npm install --no-save @electric-sql/pglite` once (it changes neither `package.json` nor the lock file), or `node db/check.mjs --pglite <folder of a copy>`. On a machine short of memory, `node --liftoff-only db/check.mjs`. It compares the working copy with the schema of the last commit (`--from <ref>` for another one).

`db:scratch`, `db:status` and `db:apply` read `DATABASE_URL` from the environment or from `.env` and never print it.

Last run (2026-11-13): `db:check` 23 groups of checks, 35 statements exercised, on PostgreSQL 18.6; `db:scratch` passed on Neon (PostgreSQL 18.7) with the real tables unchanged.

## Known limits

- **Two super users acting on each other at the same instant.** `deactivate_staff_user` and `set_staff_role` refuse to leave the team without an active super user, each by looking at the others as they were when the statement began. Two super users deactivating each other within the same milliseconds could both go through. It needs two people and a coincidence; the way back is the SQL Editor (`UPDATE staff_users SET is_active = true, deactivated_at = NULL WHERE id = …`).
- **What waits on an invoice can exceed what it owes.** The team may record several pending payments whose sum is above the balance (each one alone cannot be), and two reports by a customer at the same instant can together pass `report_payment`'s cap. It is harmless: only confirmed money counts, and the invoice's own row refuses a confirmation that would exceed the total.
- **US dollars only.** A payment in córdobas is recorded in dollars, with the rate in its reference, until Carinova asks for more.
- **No refunds and no credit notes.** A confirmation made by mistake is reversed; money that was really received and has to be given back is not modelled.
- **An issued invoice does not change.** A mistake means voiding it (while nothing is confirmed on it) and issuing another.
- **Numbers can have gaps** (see Conventions).
- **Accounts the team creates** have no confirmed e-mail and no accepted terms, and nothing fills them in yet (→ hand-off).
- **Nothing is deleted by age.** Expired codes and sessions are swept as people sign in; packages, invoices, payments and the audit log are kept for good. How long to keep a customer's data is a decision for Carinova and its privacy policy.
