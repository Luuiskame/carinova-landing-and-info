-- Carinova: the database of the website (PostgreSQL / Neon).
--
--   customers             one row per customer, created when a sign-up is confirmed
--   customer_login_codes  the one-time codes customers sign in with
--   customer_sessions     who is signed in, and until when
--
-- Run it in the Neon SQL Editor or with:  psql "$DATABASE_URL" -f db/schema.sql
-- It is safe to run again, on an empty database or on one that already has customers: it only
-- creates what does not exist yet and never touches a row.
--
-- The website's Worker is the only writer today (worker/store.ts). The admin panel and the customer
-- app will read the same tables: plain columns and constraints, nothing specific to one tool. Staff
-- accounts for the admin panel get tables of their own (staff_*); nothing here is shared with them.

-- ───────────────────────────── Customers ─────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  -- Customer number: 1, 2, 3… assigned by the database, never reused.
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- The number as people see it, the Carinova ID: CNV-00001. Five digits at least; it simply grows
  -- after CNV-99999.
  code              text GENERATED ALWAYS AS ('CNV-' || lpad(id::text, greatest(5, length(id::text)), '0')) STORED,
  -- Lower case, one account per address. It is also how the customer signs in.
  email             text NOT NULL,
  first_name        text NOT NULL,
  last_name         text NOT NULL,
  -- E.164: "+" and digits, e.g. +50588552956.
  phone             text NOT NULL,
  -- ISO 3166-1 alpha-2: NI or US.
  country           text NOT NULL,
  address_line1     text NOT NULL,
  address_line2     text,
  city              text NOT NULL,
  -- Department (Nicaragua) or state (United States), by name.
  state             text NOT NULL,
  postal_code       text,
  -- When the customer opened the confirmation link.
  email_verified_at timestamptz NOT NULL DEFAULT now(),
  -- When the customer ticked the terms and privacy box on the form.
  terms_accepted_at timestamptz NOT NULL,
  -- Where the account came from: 'web' for the sign-up form.
  source            text NOT NULL DEFAULT 'web',
  -- The language the customer signed up in ('es' or 'en'): the one to write to them in.
  locale            text NOT NULL DEFAULT 'es',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT customers_code_key UNIQUE (code),
  CONSTRAINT customers_email_key UNIQUE (email),
  CONSTRAINT customers_email_lowercase CHECK (email = lower(email)),
  CONSTRAINT customers_locale_known CHECK (locale IN ('es', 'en'))
);

-- For a database created before the site had a second language: the column, with its check. Does
-- nothing where the column already exists.
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'es'
  CONSTRAINT customers_locale_known CHECK (locale IN ('es', 'en'));

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

-- "Sign this customer out everywhere" (the admin panel), and the clean-up of expired sessions.
CREATE INDEX IF NOT EXISTS customer_sessions_customer_idx ON customer_sessions (customer_id);
CREATE INDEX IF NOT EXISTS customer_sessions_expires_idx ON customer_sessions (expires_at);
