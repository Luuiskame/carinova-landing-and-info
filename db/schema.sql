-- Carinova: the database of the website and of the back office (PostgreSQL / Neon).
--
-- Reference    warehouses            where packages are received in the United States (Miami; Los Ángeles soon)
--              branches              where packages are picked up in Nicaragua (Managua, Bluefields)
-- Team         staff_roles           what a member of Carinova's team may do ('superuser' for now)
--              staff_users           the team's accounts, the super user included
--              staff_login_codes     the one-time codes the team signs in with
--              staff_sessions        which member of the team is signed in, and until when
--              audit_log             who did what in the back office, and when
-- Customers    customers             one row per customer (the Carinova ID is its `code`)
--              customer_login_codes  the one-time codes customers sign in with
--              customer_sessions     who is signed in, and until when
-- Packages     packages              every package received at a warehouse, and where it is now
--              package_events        its history: one row per change of status
-- Money        invoices              what a customer is charged
--              invoice_items         its lines; most of them charge for a package
--              payments              what was paid towards an invoice; the team confirms or rejects each one
--              invoice_totals        (view) total, paid and balance of each invoice, and whether it is paid
--
-- Every table, column, rule and the statements the back office is expected to use are explained in
-- docs/DATABASE.md; what is left to build on top of them is in docs/BACKEND-HANDOFF.md.
--
-- Run it in the Neon SQL Editor or with:  psql "$DATABASE_URL" -f db/schema.sql
-- It is safe to run again, on an empty database or on one that already has customers: it only
-- creates what does not exist yet, and the only rows it writes are the reference rows below
-- (warehouses, branches, the role), each one only if it is not there.
--
-- Who writes what today: the website's Worker (worker/store.ts) creates customers, their codes and
-- their sessions, and only reads packages, invoices and payments, to show them to their owner in
-- "Mi cuenta". Everything else is written by the back office, which does not exist yet. Plain
-- columns, constraints and one view: no triggers, no functions, nothing specific to one tool. The
-- lists of statuses are CHECK constraints here and constants in src/data/account.ts; a unit test
-- (db/schema.test.ts) fails when the two differ.

-- ───────────────────────────── Reference ─────────────────────────────

CREATE TABLE IF NOT EXISTS warehouses (
  id            smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Three capital letters: 'MIA', 'LAX'. The same code as RECEPTION_POINTS in src/data/carinova.ts.
  code          text NOT NULL,
  -- The city, as people read it.
  name          text NOT NULL,
  -- The address customers write at a store's checkout. Empty while the warehouse is not open.
  phone         text,
  address_line1 text,
  address_line2 text,
  city          text,
  -- Two-letter state: 'FL', 'CA'.
  state         text,
  postal_code   text,
  -- ISO 3166-1 alpha-2.
  country       text NOT NULL DEFAULT 'US',
  -- false: announced but not receiving yet ("Próximamente"). No package can be received there.
  is_active     boolean NOT NULL DEFAULT false,
  -- The order they are listed in.
  sort_order    smallint NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT warehouses_code_key UNIQUE (code),
  CONSTRAINT warehouses_code_format CHECK (code ~ '^[A-Z]{3}$'),
  CONSTRAINT warehouses_active_has_address CHECK (
    NOT is_active
    OR (address_line1 IS NOT NULL AND city IS NOT NULL AND state IS NOT NULL AND postal_code IS NOT NULL)
  )
);

-- The Miami address is the one of MIAMI_ADDRESS in src/data/carinova.ts, which is what the site
-- shows: change both together (db/schema.test.ts compares them).
INSERT INTO warehouses (code, name, phone, address_line1, address_line2, city, state, postal_code, is_active, sort_order)
VALUES
  ('MIA', 'Miami', '786 687 9611', '8611 NW 72ND St', 'Ste G9', 'Miami', 'FL', '33195-2311', true, 1),
  ('LAX', 'Los Ángeles', NULL, NULL, NULL, 'Los Angeles', 'CA', NULL, false, 2)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS branches (
  id         smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- 'managua', 'bluefields': the `id` of the branch in BRANCHES (src/data/carinova.ts), which holds
  -- its address and opening hours.
  code       text NOT NULL,
  name       text NOT NULL,
  is_active  boolean NOT NULL DEFAULT true,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT branches_code_key UNIQUE (code),
  CONSTRAINT branches_code_format CHECK (code ~ '^[a-z][a-z-]*$')
);

INSERT INTO branches (code, name, sort_order)
VALUES ('managua', 'Managua', 1), ('bluefields', 'Bluefields', 2)
ON CONFLICT (code) DO NOTHING;

-- ───────────────────────────── Carinova's team ─────────────────────────────
--
-- The people who work the back office. They are not customers: their accounts, codes and sessions
-- are separate tables, so nothing a customer can do reaches them. Nobody can sign up as staff: the
-- first super user is inserted by hand (docs/DATABASE.md → "The first super user") and every other
-- account is created by a super user.

CREATE TABLE IF NOT EXISTS staff_roles (
  -- What the code checks: 'superuser'. Lower case and underscores.
  code        text PRIMARY KEY,
  -- As the back office shows it.
  name        text NOT NULL,
  description text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT staff_roles_code_format CHECK (code ~ '^[a-z][a-z_]*$')
);

-- One role for now. The super user manages everyone (customers and team), creates accounts and
-- manages and confirms invoices and payments. Assigning other roles comes later: a new role is a
-- new row here, and what it may do is decided by the back office (docs/DATABASE.md → "Roles").
INSERT INTO staff_roles (code, name, description)
VALUES (
  'superuser',
  'Superusuario',
  'Administra a todas las personas: crea cuentas de clientes y del equipo, registra paquetes y gestiona y confirma facturas y pagos.'
)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS staff_users (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Lower case, one account per address. It is also how the person signs in.
  email          text NOT NULL,
  full_name      text NOT NULL,
  role           text NOT NULL REFERENCES staff_roles (code),
  -- false: the account is kept, for the history of what it did, but it can no longer sign in.
  is_active      boolean NOT NULL DEFAULT true,
  -- The super user who created the account. Empty for the first one.
  created_by     integer REFERENCES staff_users (id),
  last_login_at  timestamptz,
  deactivated_at timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT staff_users_email_key UNIQUE (email),
  CONSTRAINT staff_users_email_lowercase CHECK (email = lower(email)),
  CONSTRAINT staff_users_inactive_has_date CHECK (is_active = (deactivated_at IS NULL))
);

-- The same way of signing in as the customers': a one-time code by e-mail, and a session whose token
-- only exists in the browser. Neither the code nor the token is stored: only a hash of each.
CREATE TABLE IF NOT EXISTS staff_login_codes (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  staff_id    integer NOT NULL REFERENCES staff_users (id) ON DELETE CASCADE,
  -- HMAC-SHA-256 of the code, keyed with a secret the database does not have.
  code_hash   text NOT NULL,
  attempts    smallint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  consumed_at timestamptz
);

CREATE INDEX IF NOT EXISTS staff_login_codes_staff_idx ON staff_login_codes (staff_id, created_at DESC);

CREATE TABLE IF NOT EXISTS staff_sessions (
  -- SHA-256 of the session token, in hexadecimal.
  token_hash text PRIMARY KEY,
  staff_id   integer NOT NULL REFERENCES staff_users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS staff_sessions_staff_idx ON staff_sessions (staff_id);
CREATE INDEX IF NOT EXISTS staff_sessions_expires_idx ON staff_sessions (expires_at);

-- Who did what. Every action of the back office that creates, changes or confirms something writes
-- a row here, in the same statement or transaction as the action. Rows are never changed or deleted.
CREATE TABLE IF NOT EXISTS audit_log (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Who. Empty when it was not a member of the team: a payment its customer reported.
  staff_id   integer REFERENCES staff_users (id),
  -- What, as "<thing>.<verb>": 'customer.create', 'payment.confirm', 'invoice.void', 'staff.deactivate'.
  action     text NOT NULL,
  -- The table the action was about, and the row's id (as text: ids are not all the same type).
  entity     text NOT NULL,
  entity_id  text NOT NULL,
  -- Whatever explains the action: the values before and after, a reason. Never a secret.
  details    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON audit_log (entity, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_staff_idx ON audit_log (staff_id, created_at DESC);

-- ───────────────────────────── Customers ─────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  -- Customer number: 1, 2, 3… assigned by the database, never reused.
  id                  integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- The number as people see it, the Carinova ID: CNV-00001. Five digits at least; it simply grows
  -- after CNV-99999.
  code                text GENERATED ALWAYS AS ('CNV-' || lpad(id::text, greatest(5, length(id::text)), '0')) STORED,
  -- Lower case, one account per address. It is also how the customer signs in.
  email               text NOT NULL,
  first_name          text NOT NULL,
  last_name           text NOT NULL,
  -- E.164: "+" and digits, e.g. +50588552956.
  phone               text NOT NULL,
  -- ISO 3166-1 alpha-2: NI or US.
  country             text NOT NULL,
  address_line1       text NOT NULL,
  address_line2       text,
  city                text NOT NULL,
  -- Department (Nicaragua) or state (United States), by name.
  state               text NOT NULL,
  postal_code         text,
  -- When the customer opened the confirmation link. Empty for an account the team created, until the
  -- customer shows the address is theirs. Their first sign-in with a code shows it, but nothing
  -- writes the date then yet: it is part of the back office (docs/BACKEND-HANDOFF.md).
  email_verified_at   timestamptz DEFAULT now(),
  -- When the customer accepted the terms and the privacy policy. Empty until they do, for an account
  -- the team created.
  terms_accepted_at   timestamptz,
  -- Where the account came from: 'web' for the sign-up form, 'staff' when the team created it.
  source              text NOT NULL DEFAULT 'web',
  -- The language the customer signed up in ('es' or 'en'): the one to write to them in.
  locale              text NOT NULL DEFAULT 'es',
  -- 'suspended': the account is kept but cannot sign in, and its open sessions stop working.
  status              text NOT NULL DEFAULT 'active',
  -- A person or a company: there is one Carinova ID for either.
  account_type        text NOT NULL DEFAULT 'personal',
  -- The company's name, for a 'business' account (first_name and last_name are then its contact).
  company_name        text,
  -- The member of the team who created the account, when it was not the sign-up form.
  created_by_staff_id integer REFERENCES staff_users (id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT customers_code_key UNIQUE (code),
  CONSTRAINT customers_email_key UNIQUE (email),
  CONSTRAINT customers_email_lowercase CHECK (email = lower(email)),
  CONSTRAINT customers_locale_known CHECK (locale IN ('es', 'en')),
  CONSTRAINT customers_status_known CHECK (status IN ('active', 'suspended')),
  CONSTRAINT customers_account_type_known CHECK (account_type IN ('personal', 'business')),
  CONSTRAINT customers_business_has_name CHECK (account_type = 'personal' OR company_name IS NOT NULL)
);

-- For a database created before these columns existed: each one, with its check. They do nothing
-- where the column is already there, and the customers already in the table get the defaults
-- ('es', 'active', 'personal').
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'es'
  CONSTRAINT customers_locale_known CHECK (locale IN ('es', 'en'));

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CONSTRAINT customers_status_known CHECK (status IN ('active', 'suspended'));

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'personal'
  CONSTRAINT customers_account_type_known CHECK (account_type IN ('personal', 'business'));

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS company_name text
  CONSTRAINT customers_business_has_name CHECK (account_type = 'personal' OR company_name IS NOT NULL);

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS created_by_staff_id integer REFERENCES staff_users (id);

-- Accounts created by the team start without a confirmed e-mail and without accepted terms.
ALTER TABLE customers ALTER COLUMN email_verified_at DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN terms_accepted_at DROP NOT NULL;

-- To start the numbering somewhere else (for example, to leave room for customers who already
-- exist), run this once before the first sign-up:
--   ALTER TABLE customers ALTER COLUMN id RESTART WITH 1001;

-- ───────────────────────────── Signing in ─────────────────────────────
--
-- Customers have no password. To sign in they ask for a code, which is e-mailed to the address of
-- their account, and type it on the site (worker/auth). Neither the code nor the session token is
-- ever stored: only a hash of each, so a copy of these tables gives nothing to sign in with.

CREATE TABLE IF NOT EXISTS customer_login_codes (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  -- HMAC-SHA-256 of the code, keyed with a secret the database does not have (SIGNUP_TOKEN_SECRET):
  -- six digits could be guessed back from a plain hash.
  code_hash   text NOT NULL,
  -- Guesses made against this code, right or wrong. After a few, it stops working.
  attempts    smallint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- A few minutes after created_at; a newer code for the same customer ends this one at once.
  expires_at  timestamptz NOT NULL,
  -- When it was used to sign in. A code works once.
  consumed_at timestamptz
);

-- The codes of a customer, newest first: the one that works, and how many were sent lately.
CREATE INDEX IF NOT EXISTS customer_login_codes_customer_idx
  ON customer_login_codes (customer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS customer_sessions (
  -- SHA-256 of the session token, in hexadecimal. The token itself only exists in the customer's
  -- browser, in a cookie that scripts cannot read.
  token_hash  text PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- Signing out deletes the row before this; rows past it are deleted the next time someone signs in.
  expires_at  timestamptz NOT NULL
);

-- "Sign this customer out everywhere" (the back office), and the clean-up of expired sessions.
CREATE INDEX IF NOT EXISTS customer_sessions_customer_idx ON customer_sessions (customer_id);
CREATE INDEX IF NOT EXISTS customer_sessions_expires_idx ON customer_sessions (expires_at);

-- ───────────────────────────── Packages ─────────────────────────────
--
-- A row is created when a package is physically received at a warehouse: that moment is where the
-- delivery estimates count from. `status` is where the package is now; `package_events` is how it
-- got there. A change of status is one statement that inserts the event and updates the package
-- (docs/DATABASE.md → "Changing the status of a package"), so the two never disagree.

CREATE TABLE IF NOT EXISTS packages (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- The reference the customer sees: PKG-000001. Six digits at least; it simply grows after that.
  code                text GENERATED ALWAYS AS ('PKG-' || lpad(id::text, greatest(6, length(id::text)), '0')) STORED,
  customer_id         integer NOT NULL REFERENCES customers (id),
  -- Where it was received.
  warehouse_id        smallint NOT NULL REFERENCES warehouses (id),
  -- Where it will be picked up. Empty until it is known, and for home delivery.
  branch_id           smallint REFERENCES branches (id),
  -- What it is, as the team writes it on reception: "Zapatos Nike, caja mediana". The customer reads it.
  description         text NOT NULL,
  -- Where it was bought, when it is known: "Amazon".
  store               text,
  -- Who delivered it to the warehouse and under which number: "UPS", "1Z999AA10123456784".
  carrier             text,
  carrier_tracking    text,
  -- How it travels to Nicaragua: 'air' or 'sea'.
  service             text NOT NULL,
  -- What it is charged by: 'weight' (per pound), 'volume' (per cubic foot, by sea) or 'unit'
  -- (a flat rate per device, by air).
  rate_basis          text NOT NULL DEFAULT 'weight',
  -- As measured at the warehouse. Pounds and inches: what the rates are written in.
  weight_lb           numeric(9, 2),
  length_in           numeric(8, 2),
  width_in            numeric(8, 2),
  height_in           numeric(8, 2),
  -- Boxes or units the row stands for.
  pieces              integer NOT NULL DEFAULT 1,
  declared_value_usd  numeric(12, 2),
  -- 'pickup' at a branch, or 'home' delivery (arranged with the customer; it has its own charge).
  delivery_method     text NOT NULL DEFAULT 'pickup',
  -- Where it is now. In order: received → processing → in_transit → ready → delivered; or it ends
  -- as returned or cancelled.
  status              text NOT NULL DEFAULT 'received',
  -- When each stage was reached. received_at is the reception at the warehouse.
  received_at         timestamptz NOT NULL DEFAULT now(),
  shipped_at          timestamptz,
  ready_at            timestamptz,
  delivered_at        timestamptz,
  -- For the team only: never shown to the customer.
  internal_notes      text,
  created_by_staff_id integer REFERENCES staff_users (id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT packages_code_key UNIQUE (code),
  CONSTRAINT packages_service_known CHECK (service IN ('air', 'sea')),
  CONSTRAINT packages_rate_basis_known CHECK (rate_basis IN ('weight', 'volume', 'unit')),
  CONSTRAINT packages_delivery_method_known CHECK (delivery_method IN ('pickup', 'home')),
  CONSTRAINT packages_status_known CHECK (
    status IN ('received', 'processing', 'in_transit', 'ready', 'delivered', 'returned', 'cancelled')
  ),
  CONSTRAINT packages_measures_positive CHECK (
    (weight_lb IS NULL OR weight_lb > 0)
    AND (length_in IS NULL OR length_in > 0)
    AND (width_in IS NULL OR width_in > 0)
    AND (height_in IS NULL OR height_in > 0)
    AND pieces >= 1
    AND (declared_value_usd IS NULL OR declared_value_usd >= 0)
  )
);

-- The packages of a customer, newest first ("Mi cuenta"), and the back office's lists by status.
CREATE INDEX IF NOT EXISTS packages_customer_idx ON packages (customer_id, received_at DESC);
CREATE INDEX IF NOT EXISTS packages_status_idx ON packages (status, received_at DESC);
-- Finding a package by the number on its label.
CREATE INDEX IF NOT EXISTS packages_carrier_tracking_idx ON packages (carrier_tracking)
  WHERE carrier_tracking IS NOT NULL;

CREATE TABLE IF NOT EXISTS package_events (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  package_id bigint NOT NULL REFERENCES packages (id) ON DELETE CASCADE,
  -- The status the package took with this event.
  status     text NOT NULL,
  -- What the customer reads next to it, when there is something to say: "Retenido en aduana".
  note       text,
  -- Who recorded it.
  staff_id   integer REFERENCES staff_users (id),
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT package_events_status_known CHECK (
    status IN ('received', 'processing', 'in_transit', 'ready', 'delivered', 'returned', 'cancelled')
  )
);

-- The history of a package, in order.
CREATE INDEX IF NOT EXISTS package_events_package_idx ON package_events (package_id, created_at, id);

-- ───────────────────────────── Invoices and payments ─────────────────────────────
--
-- An invoice is what a customer is charged: its lines add up to its total. A payment is money
-- received towards an invoice; it counts only once a member of the team confirms it. Amounts are US
-- dollars.
--
-- The invoice keeps two amounts of its own: its total, fixed when it is issued, and what has been
-- confirmed as paid. They are on the invoice's row so that the database itself can refuse what must
-- never happen, whatever is going on at the same moment: confirmed payments above the total, or a
-- void invoice with money on it (the checks below). Two confirmations at once touch the same row,
-- so one waits for the other and is judged against the amount the first one left. What the customer
-- reads ("paid", "partial"…) is worked out from them by the view invoice_totals.

CREATE TABLE IF NOT EXISTS invoices (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- The number the customer sees: INV-000001.
  number              text GENERATED ALWAYS AS ('INV-' || lpad(id::text, greatest(6, length(id::text)), '0')) STORED,
  customer_id         integer NOT NULL REFERENCES customers (id),
  -- 'draft': being prepared, the customer does not see it. 'issued': the customer owes it.
  -- 'void': issued by mistake or no longer owed; it stays, with its reason.
  status              text NOT NULL DEFAULT 'draft',
  currency            text NOT NULL DEFAULT 'USD',
  -- The sum of its lines, fixed at the moment it is issued. Empty while it is a draft (the view
  -- adds the lines up meanwhile).
  total_usd           numeric(14, 2),
  -- The sum of its confirmed payments. Only "confirm_payment" and "reverse_payment"
  -- (db/queries.sql) change it.
  paid_usd            numeric(14, 2) NOT NULL DEFAULT 0,
  -- For the customer: how to pay, what the invoice is for.
  notes               text,
  issued_at           timestamptz,
  due_at              timestamptz,
  voided_at           timestamptz,
  void_reason         text,
  created_by_staff_id integer NOT NULL REFERENCES staff_users (id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT invoices_number_key UNIQUE (number),
  CONSTRAINT invoices_status_known CHECK (status IN ('draft', 'issued', 'void')),
  CONSTRAINT invoices_currency_usd CHECK (currency = 'USD'),
  CONSTRAINT invoices_issued_has_date CHECK (status = 'draft' OR issued_at IS NOT NULL),
  CONSTRAINT invoices_issued_has_total CHECK ((status = 'draft') = (total_usd IS NULL) AND (total_usd IS NULL OR total_usd > 0)),
  -- Never more confirmed than the invoice is for; nothing confirmed on a draft.
  CONSTRAINT invoices_paid_within_total CHECK (paid_usd >= 0 AND paid_usd <= COALESCE(total_usd, 0)),
  -- An invoice with confirmed money cannot be void, and a void one cannot take money.
  CONSTRAINT invoices_void_is_unpaid CHECK (status <> 'void' OR paid_usd = 0),
  CONSTRAINT invoices_void_has_reason CHECK (
    (status = 'void') = (voided_at IS NOT NULL) AND (status <> 'void' OR void_reason IS NOT NULL)
  )
);

-- The invoices of a customer, newest first.
CREATE INDEX IF NOT EXISTS invoices_customer_idx ON invoices (customer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS invoice_items (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  invoice_id     bigint NOT NULL REFERENCES invoices (id) ON DELETE CASCADE,
  -- The package the line charges for. Empty for a charge that is not about one package.
  package_id     bigint REFERENCES packages (id),
  -- 'shipping' (the freight of a package), 'home_delivery', 'assisted_purchase' (the product
  -- Carinova bought for the customer, or the service), 'storage', 'other', or 'discount'.
  kind           text NOT NULL DEFAULT 'shipping',
  -- What the customer reads: "Envío aéreo, 3 lb × US$6.50".
  description    text NOT NULL,
  quantity       numeric(10, 2) NOT NULL DEFAULT 1,
  -- Negative for a discount, and only for a discount.
  unit_price_usd numeric(12, 2) NOT NULL,
  amount_usd     numeric(14, 2) GENERATED ALWAYS AS (round(quantity * unit_price_usd, 2)) STORED,
  created_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT invoice_items_kind_known CHECK (
    kind IN ('shipping', 'home_delivery', 'assisted_purchase', 'storage', 'other', 'discount')
  ),
  CONSTRAINT invoice_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT invoice_items_discount_is_negative CHECK ((kind = 'discount') = (unit_price_usd < 0))
);

CREATE INDEX IF NOT EXISTS invoice_items_invoice_idx ON invoice_items (invoice_id, id);
-- "Has this package been invoiced?"
CREATE INDEX IF NOT EXISTS invoice_items_package_idx ON invoice_items (package_id) WHERE package_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS payments (
  id                   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  invoice_id           bigint NOT NULL REFERENCES invoices (id),
  amount_usd           numeric(14, 2) NOT NULL,
  -- 'cash', 'bank_transfer', 'card' or 'other'.
  method               text NOT NULL,
  -- The bank's reference or the number of the receipt.
  reference            text,
  -- Where the picture of the receipt is, when there is one: the key of the object in the bucket.
  proof_key            text,
  -- When the money was paid, as reported.
  paid_at              timestamptz NOT NULL DEFAULT now(),
  -- 'pending': recorded, waiting for the team to check it. 'confirmed': it counts towards the
  -- invoice. 'rejected': it does not, and `rejection_reason` says why.
  status               text NOT NULL DEFAULT 'pending',
  -- Who said the payment was made: the 'customer' (from their account) or the 'staff'.
  reported_by          text NOT NULL DEFAULT 'staff',
  -- The member of the team who recorded it, when staff did.
  recorded_by_staff_id integer REFERENCES staff_users (id),
  -- Who confirmed or rejected it, and when.
  reviewed_by_staff_id integer REFERENCES staff_users (id),
  reviewed_at          timestamptz,
  rejection_reason     text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT payments_amount_positive CHECK (amount_usd > 0),
  CONSTRAINT payments_method_known CHECK (method IN ('cash', 'bank_transfer', 'card', 'other')),
  CONSTRAINT payments_status_known CHECK (status IN ('pending', 'confirmed', 'rejected')),
  CONSTRAINT payments_reported_by_known CHECK (reported_by IN ('customer', 'staff')),
  -- A payment is pending until someone reviews it, and reviewed once it is not.
  CONSTRAINT payments_review_complete CHECK (
    (status = 'pending') = (reviewed_at IS NULL) AND (status = 'pending') = (reviewed_by_staff_id IS NULL)
  ),
  CONSTRAINT payments_rejection_has_reason CHECK (status <> 'rejected' OR rejection_reason IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS payments_invoice_idx ON payments (invoice_id, id);
-- The queue of payments waiting to be confirmed, oldest first.
CREATE INDEX IF NOT EXISTS payments_pending_idx ON payments (created_at) WHERE status = 'pending';

-- What each invoice adds up to. For a draft the total is the sum of its lines so far; from the
-- moment it is issued, the total the invoice was issued for. payment_state is what the customer reads:
--   draft      not issued yet (never shown to the customer)
--   void       annulled
--   paid       its confirmed payments cover its total
--   in_review  not covered yet, and a payment is waiting to be confirmed
--   partial    part of it is confirmed and nothing is waiting
--   unpaid     nothing confirmed and nothing waiting
CREATE OR REPLACE VIEW invoice_totals AS
SELECT
  i.id AS invoice_id,
  COALESCE(i.total_usd, t.lines_usd, 0)::numeric(14, 2) AS total_usd,
  i.paid_usd AS paid_usd,
  COALESCE(p.pending_usd, 0)::numeric(14, 2) AS pending_usd,
  (COALESCE(i.total_usd, t.lines_usd, 0) - i.paid_usd)::numeric(14, 2) AS balance_usd,
  CASE
    WHEN i.status = 'draft' THEN 'draft'
    WHEN i.status = 'void' THEN 'void'
    WHEN i.paid_usd >= i.total_usd THEN 'paid'
    WHEN COALESCE(p.pending_usd, 0) > 0 THEN 'in_review'
    WHEN i.paid_usd > 0 THEN 'partial'
    ELSE 'unpaid'
  END AS payment_state
FROM invoices i
LEFT JOIN (
  SELECT invoice_id, sum(amount_usd) AS lines_usd FROM invoice_items GROUP BY invoice_id
) t ON t.invoice_id = i.id
LEFT JOIN (
  SELECT invoice_id, sum(amount_usd) AS pending_usd FROM payments WHERE status = 'pending' GROUP BY invoice_id
) p ON p.invoice_id = i.id;

-- ───────────────────────────── What each table is, inside the database ─────────────────────────────

COMMENT ON TABLE warehouses IS 'Where packages are received in the United States. is_active = false: announced, not receiving yet.';
COMMENT ON TABLE branches IS 'Where packages are picked up in Nicaragua. Addresses and hours live in the website (src/data/carinova.ts).';
COMMENT ON TABLE staff_roles IS 'What a member of the team may do. Only superuser for now.';
COMMENT ON TABLE staff_users IS 'Accounts of Carinova''s team (the back office). Never created by sign-up.';
COMMENT ON TABLE staff_login_codes IS 'One-time sign-in codes of the team: hashes only.';
COMMENT ON TABLE staff_sessions IS 'Open sessions of the team: hashes of the tokens only.';
COMMENT ON TABLE audit_log IS 'Append-only record of what the team did in the back office.';
COMMENT ON TABLE customers IS 'One row per customer. code is the Carinova ID (CNV-00001).';
COMMENT ON TABLE customer_login_codes IS 'One-time sign-in codes of customers: hashes only.';
COMMENT ON TABLE customer_sessions IS 'Open sessions of customers: hashes of the tokens only.';
COMMENT ON TABLE packages IS 'Packages received at a warehouse. status is where each one is now; code is its reference (PKG-000001).';
COMMENT ON TABLE package_events IS 'History of a package: one row per change of status. Written together with packages.status.';
COMMENT ON TABLE invoices IS 'What a customer is charged. number is INV-000001. total_usd is fixed at issue and paid_usd is the sum of confirmed payments. What the customer reads about it is in the view invoice_totals.';
COMMENT ON TABLE invoice_items IS 'Lines of an invoice. amount_usd = quantity × unit_price_usd.';
COMMENT ON TABLE payments IS 'Money received towards an invoice. Counts only when status = confirmed.';
COMMENT ON VIEW invoice_totals IS 'Total, confirmed payments, pending payments, balance and payment_state of each invoice.';
COMMENT ON COLUMN invoices.paid_usd IS 'Sum of the confirmed payments. Changed only together with a payment being confirmed or taken back (db/queries.sql: confirm_payment, reverse_payment).';
