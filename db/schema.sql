-- Carinova: customers table (PostgreSQL / Neon).
--
-- Run it once, in the Neon SQL Editor or with:  psql "$DATABASE_URL" -f db/schema.sql
-- It is safe to run again: it only creates what does not exist yet.
--
-- The website's Worker inserts a row when a visitor confirms the e-mail of their sign-up
-- (worker/signup/store.ts). The admin panel and the customer app will read the same table.

CREATE TABLE IF NOT EXISTS customers (
  -- Customer number: 1, 2, 3… assigned by the database, never reused.
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- The number as people see it: CNV-00001. Five digits at least; it simply grows after CNV-99999.
  code              text GENERATED ALWAYS AS ('CNV-' || lpad(id::text, greatest(5, length(id::text)), '0')) STORED,
  -- Lower case, one account per address.
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
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT customers_code_key UNIQUE (code),
  CONSTRAINT customers_email_key UNIQUE (email),
  CONSTRAINT customers_email_lowercase CHECK (email = lower(email))
);

-- To start the numbering somewhere else (for example, to leave room for customers who already
-- exist), run this once before the first sign-up:
--   ALTER TABLE customers ALTER COLUMN id RESTART WITH 1001;
