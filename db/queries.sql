-- Carinova: the statements the back office is expected to use (PostgreSQL / Neon).
--
-- The website's Worker has its own statements (worker/store.ts): sign-up, sign-in and what a customer
-- sees in "Mi cuenta". This file is the other half: what Carinova's team does (and one statement of
-- the customer's, report_payment, kept here until the website uses it). Nothing runs it yet: it is
-- the contract for whoever builds the back office (docs/BACKEND-HANDOFF.md), written and checked
-- against a real PostgreSQL together with db/schema.sql: `node db/check.mjs` runs every statement
-- of this file (docs/DATABASE.md → "Checking a change").
--
-- How to read it
--   -- name: receive_package      the name to call the statement by (the format of sqlc and yesql)
--   -- $1 actor                   one line per parameter, in order
--   Each statement is ONE statement: it happens whole or not at all, with no transaction to manage,
--   which is also all the Neon HTTP driver offers. Where an action changes something and has to be
--   on record, the same statement writes the row of audit_log (the lines of a draft are not: the
--   record of an invoice starts when it is created and says its total when it is issued).
--   A value the tables do not accept (an unknown status or method, an amount of zero, a discount
--   that is not negative) is an error of the database, named after the check that refused it:
--   validate what a form sends before running a statement, as the website's Worker does.
--   A statement that could not act returns no row: the actor is not an active member of the team,
--   the thing does not exist, or the rule in its comment says no. The back office answers "not
--   found or not allowed" then; it never needs to guess which.
--   Two people acting at the same moment: every rule is written on the row it protects (a package's
--   status, an invoice's status and amounts, a payment's status), so the second statement waits for
--   the first and is judged against what the first one left. The one case that ends in an error
--   instead of "no row" is named where it can happen (confirm_payment).
--
-- Rules that are not in the SQL
--   Who may do what. `actor` only has to be an active member of the team; which role may run which
--   statement is for the back office to decide in one place (docs/DATABASE.md → "Roles"). The
--   statements that manage the team itself are the exception: they ask for a super user.
--   Money is US dollars, as numeric: never a float on the way in or out.

-- ═════════════════════════════ The team ═════════════════════════════

-- name: create_first_superuser
-- The first account of the back office: it works once, while the team's table is empty. Run it by
-- hand (docs/DATABASE.md → "The first super user"); every other account is created by a super user.
-- $1 email
-- $2 full name
INSERT INTO staff_users (email, full_name, role)
SELECT lower(btrim($1::text)), btrim($2::text), 'superuser'
WHERE NOT EXISTS (SELECT 1 FROM staff_users)
RETURNING id, email, full_name, role;

-- name: create_staff_user
-- A super user creates an account for a member of the team. No row: the actor is not an active
-- super user, the role does not exist or the e-mail already has an account.
-- $1 actor (staff_users.id)
-- $2 email
-- $3 full name
-- $4 role (staff_roles.code)
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active AND role = 'superuser'
), created AS (
  INSERT INTO staff_users (email, full_name, role, created_by)
  SELECT lower(btrim($2::text)), btrim($3::text), r.code, actor.id
  FROM actor JOIN staff_roles r ON r.code = $4::text
  ON CONFLICT (email) DO NOTHING
  RETURNING id, email, full_name, role
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'staff.create', 'staff_users', id::text, jsonb_build_object('email', email, 'role', role)
  FROM created
)
SELECT id, email, full_name, role FROM created;

-- name: set_staff_role
-- A super user changes the role of a member of the team ("assign roles": for when there is more than
-- one). The last active super user cannot be given another role: someone must be able to manage
-- the team.
-- $1 actor
-- $2 staff id
-- $3 role
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active AND role = 'superuser'
), changed AS (
  UPDATE staff_users s
  SET role = r.code, updated_at = now()
  FROM actor, staff_roles r
  WHERE s.id = $2::int
    AND r.code = $3::text
    AND s.role <> r.code
    AND (
      r.code = 'superuser'
      OR s.role <> 'superuser'
      OR EXISTS (SELECT 1 FROM staff_users o WHERE o.is_active AND o.role = 'superuser' AND o.id <> s.id)
    )
  RETURNING s.id, s.email, s.role
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'staff.role', 'staff_users', id::text, jsonb_build_object('role', role) FROM changed
)
SELECT id, email, role FROM changed;

-- name: deactivate_staff_user
-- A super user ends the access of a member of the team: the account stays, for the history of what
-- it did, and its sessions end at once. The last active super user cannot be deactivated.
-- $1 actor
-- $2 staff id
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active AND role = 'superuser'
), changed AS (
  UPDATE staff_users s
  SET is_active = false, deactivated_at = now(), updated_at = now()
  FROM actor
  WHERE s.id = $2::int
    AND s.is_active
    AND (
      s.role <> 'superuser'
      OR EXISTS (SELECT 1 FROM staff_users o WHERE o.is_active AND o.role = 'superuser' AND o.id <> s.id)
    )
  RETURNING s.id, s.email
), signed_out AS (
  DELETE FROM staff_sessions WHERE staff_id IN (SELECT id FROM changed)
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'staff.deactivate', 'staff_users', id::text, '{}'::jsonb FROM changed
)
SELECT id, email FROM changed;

-- name: list_staff_users
SELECT s.id, s.email, s.full_name, s.role, r.name AS role_name, s.is_active, s.last_login_at, s.created_at
FROM staff_users s JOIN staff_roles r ON r.code = s.role
ORDER BY s.is_active DESC, s.full_name;

-- ─────────── Signing in to the back office: the same way customers sign in to the site ───────────
-- A one-time code by e-mail, then a session. The code and the session token never reach the
-- database: the back office hashes them first, exactly as worker/auth/code.ts and
-- worker/auth/session.ts do (an HMAC of the code keyed with a secret; the SHA-256 of the token).

-- name: issue_staff_login_code
-- Keeps a code for the member of the team with this e-mail; any earlier code stops working. Returns
-- who to send it to, or no row: nobody active has that e-mail, or too many codes were sent lately.
-- Answer the same either way, so the form does not say who works at Carinova.
-- $1 email (lower case)
-- $2 hash of the code
-- $3 minutes the code is valid
-- $4 codes allowed in 15 minutes
-- $5 codes allowed in a day
WITH member AS (
  SELECT id, full_name FROM staff_users WHERE email = $1::text AND is_active
), sent AS (
  SELECT
    count(*) FILTER (WHERE created_at > now() - interval '15 minutes') AS last_quarter,
    count(*) AS last_day
  FROM staff_login_codes
  WHERE staff_id = (SELECT id FROM member) AND created_at > now() - interval '1 day'
), allowed AS (
  SELECT member.id, member.full_name FROM member, sent
  WHERE sent.last_quarter < $4::int AND sent.last_day < $5::int
), retired AS (
  UPDATE staff_login_codes SET expires_at = now()
  WHERE staff_id = (SELECT id FROM allowed) AND consumed_at IS NULL AND expires_at > now()
), swept AS (
  DELETE FROM staff_login_codes WHERE created_at < now() - interval '2 days'
), issued AS (
  INSERT INTO staff_login_codes (staff_id, code_hash, expires_at)
  SELECT id, $2::text, now() + ($3::int * interval '1 minute') FROM allowed
  RETURNING staff_id
)
SELECT full_name FROM allowed WHERE EXISTS (SELECT 1 FROM issued);

-- name: redeem_staff_login_code
-- Checks a code. Every call counts as an attempt against the member's current code. When the code is
-- right and had attempts left, it is used up and the session is opened; otherwise no row.
-- $1 email (lower case)
-- $2 hash of the code that was typed
-- $3 attempts allowed
-- $4 hash of the new session's token
-- $5 days the session lasts
WITH member AS (
  SELECT id FROM staff_users WHERE email = $1::text AND is_active
), tried AS (
  UPDATE staff_login_codes SET
    attempts = attempts + 1,
    consumed_at = CASE WHEN code_hash = $2::text AND attempts < $3::int THEN now() ELSE consumed_at END
  WHERE staff_id = (SELECT id FROM member) AND consumed_at IS NULL AND expires_at > now()
  RETURNING staff_id, consumed_at
), swept AS (
  DELETE FROM staff_sessions WHERE expires_at < now()
), opened AS (
  INSERT INTO staff_sessions (token_hash, staff_id, expires_at)
  SELECT $4::text, staff_id, now() + ($5::int * interval '1 day') FROM tried WHERE consumed_at IS NOT NULL
  LIMIT 1
  RETURNING staff_id
), seen AS (
  UPDATE staff_users SET last_login_at = now() WHERE id = (SELECT staff_id FROM opened)
)
SELECT id, email, full_name, role FROM staff_users WHERE id = (SELECT staff_id FROM opened);

-- name: find_staff_by_session
-- Who a session belongs to: run it on every request of the back office. No row: no such session, it
-- expired, or the account was deactivated.
-- $1 hash of the session's token
SELECT s.id, s.email, s.full_name, s.role
FROM staff_sessions t JOIN staff_users s ON s.id = t.staff_id
WHERE t.token_hash = $1::text AND t.expires_at > now() AND s.is_active;

-- name: end_staff_session
-- $1 hash of the session's token
DELETE FROM staff_sessions WHERE token_hash = $1::text;

-- ═════════════════════════════ Customers ═════════════════════════════

-- name: list_customers
-- Search by Carinova ID, e-mail, name or company; an empty search lists everyone, newest first.
-- $1 search text (may be empty)
-- $2 how many
-- $3 how many to skip
SELECT c.id, c.code, c.first_name, c.last_name, c.company_name, c.account_type, c.email, c.phone,
       c.country, c.city, c.status, c.source, c.created_at
FROM customers c
WHERE btrim($1::text) = ''
   OR c.code ILIKE '%' || btrim($1::text) || '%'
   OR c.email ILIKE '%' || btrim($1::text) || '%'
   OR (c.first_name || ' ' || c.last_name) ILIKE '%' || btrim($1::text) || '%'
   OR c.company_name ILIKE '%' || btrim($1::text) || '%'
ORDER BY c.created_at DESC, c.id DESC
LIMIT $2::int OFFSET $3::int;

-- name: find_customer
-- One customer as the team sees them, with how many of their packages are still on the way and what
-- they owe on issued invoices.
-- $1 Carinova ID
SELECT c.id, c.code, c.email, c.first_name, c.last_name, c.company_name, c.account_type, c.phone, c.country,
       c.address_line1, c.address_line2, c.city, c.state, c.postal_code, c.locale, c.status, c.source,
       c.email_verified_at, c.terms_accepted_at, c.created_at,
       (SELECT count(*)::int FROM packages p
         WHERE p.customer_id = c.id AND p.status NOT IN ('delivered', 'returned', 'cancelled')) AS open_packages,
       (SELECT COALESCE(sum(t.balance_usd), 0)::numeric(14, 2)
          FROM invoices i JOIN invoice_totals t ON t.invoice_id = i.id
         WHERE i.customer_id = c.id AND i.status = 'issued') AS balance_usd
FROM customers c
WHERE c.code = $1::text;

-- name: create_customer_by_staff
-- The team creates an account for a customer ("create accounts"). The customer has not confirmed the
-- e-mail or accepted the terms yet: both stay empty until they do. The database assigns the
-- Carinova ID. No row: the e-mail already has an account (look it up instead), or a business account
-- came without the company's name. Validate the fields as worker/signup/validate.ts does.
-- $1 actor
-- $2 email
-- $3 first name
-- $4 last name
-- $5 phone (E.164: +50588552956)
-- $6 country (NI | US)
-- $7 address line 1
-- $8 address line 2 (or null)
-- $9 city
-- $10 department or state
-- $11 postal code (or null)
-- $12 language (es | en)
-- $13 account type (personal | business)
-- $14 company name (for a business account, else null)
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), created AS (
  INSERT INTO customers (
    email, first_name, last_name, phone, country, address_line1, address_line2, city, state, postal_code,
    locale, account_type, company_name, source, email_verified_at, terms_accepted_at, created_by_staff_id
  )
  SELECT lower(btrim($2::text)), btrim($3::text), btrim($4::text), $5::text, $6::text, btrim($7::text),
         NULLIF(btrim($8::text), ''), btrim($9::text), btrim($10::text), NULLIF(btrim($11::text), ''),
         $12::text, $13::text, NULLIF(btrim($14::text), ''), 'staff', NULL, NULL, actor.id
  FROM actor
  WHERE $13::text = 'personal' OR NULLIF(btrim($14::text), '') IS NOT NULL
  ON CONFLICT (email) DO NOTHING
  RETURNING id, code, email, first_name, last_name
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'customer.create', 'customers', id::text, jsonb_build_object('code', code) FROM created
)
SELECT id, code, email, first_name, last_name FROM created;

-- name: set_customer_status
-- Suspends an account, or gives it back. A suspended customer cannot sign in, and the sessions they
-- had open end at once.
-- $1 actor
-- $2 Carinova ID (customers.code)
-- $3 status (active | suspended)
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), changed AS (
  UPDATE customers c SET status = $3::text, updated_at = now()
  FROM actor
  WHERE c.code = $2::text AND c.status <> $3::text
  RETURNING c.id, c.code, c.status
), signed_out AS (
  DELETE FROM customer_sessions WHERE customer_id IN (SELECT id FROM changed WHERE status = 'suspended')
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'customer.status', 'customers', id::text, jsonb_build_object('status', status) FROM changed
)
SELECT code, status FROM changed;

-- name: update_customer_contact
-- Changes the contact details of a customer; a null leaves a field as it is. The e-mail is how the
-- customer signs in: changing it is a different matter (confirm the new address first).
-- $1 actor
-- $2 Carinova ID
-- $3 phone
-- $4 address line 1
-- $5 address line 2 (empty text clears it)
-- $6 city
-- $7 department or state
-- $8 postal code (empty text clears it)
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), changed AS (
  UPDATE customers c SET
    phone = COALESCE($3::text, c.phone),
    address_line1 = COALESCE(NULLIF(btrim($4::text), ''), c.address_line1),
    address_line2 = CASE WHEN $5::text IS NULL THEN c.address_line2 ELSE NULLIF(btrim($5::text), '') END,
    city = COALESCE(NULLIF(btrim($6::text), ''), c.city),
    state = COALESCE(NULLIF(btrim($7::text), ''), c.state),
    postal_code = CASE WHEN $8::text IS NULL THEN c.postal_code ELSE NULLIF(btrim($8::text), '') END,
    updated_at = now()
  FROM actor
  WHERE c.code = $2::text
  RETURNING c.id, c.code
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'customer.update', 'customers', id::text, '{}'::jsonb FROM changed
)
SELECT code FROM changed;

-- ═════════════════════════════ Packages ═════════════════════════════

-- name: receive_package
-- A package arrived at a warehouse: the row, its first event ('received') and the record of who
-- registered it, together. No row: the customer does not exist, the warehouse is not open (Los
-- Ángeles, for now) or the branch does not exist.
-- $1 actor
-- $2 Carinova ID of the customer
-- $3 warehouse (MIA)
-- $4 description, as the customer will read it
-- $5 service (air | sea)
-- $6 rate basis (weight | volume | unit)
-- $7 weight in pounds (or null)
-- $8 length in inches (or null)
-- $9 width in inches (or null)
-- $10 height in inches (or null)
-- $11 pieces
-- $12 store (or null)
-- $13 carrier (or null)
-- $14 carrier's tracking number (or null)
-- $15 pickup branch (managua | bluefields), or null when not known or for home delivery
-- $16 delivery method (pickup | home)
-- $17 declared value in US dollars (or null)
-- $18 note for the team (or null)
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), received AS (
  INSERT INTO packages (
    customer_id, warehouse_id, branch_id, description, service, rate_basis, weight_lb, length_in, width_in,
    height_in, pieces, store, carrier, carrier_tracking, delivery_method, declared_value_usd, internal_notes,
    created_by_staff_id
  )
  SELECT c.id, w.id, b.id, btrim($4::text), $5::text, $6::text, $7::numeric, $8::numeric, $9::numeric,
         $10::numeric, $11::int, NULLIF(btrim($12::text), ''), NULLIF(btrim($13::text), ''),
         NULLIF(btrim($14::text), ''), $16::text, $17::numeric, NULLIF(btrim($18::text), ''), actor.id
  FROM actor
  JOIN customers c ON c.code = $2::text
  JOIN warehouses w ON w.code = $3::text AND w.is_active
  LEFT JOIN branches b ON b.code = $15::text
  WHERE $15::text IS NULL OR b.id IS NOT NULL
  RETURNING id, code, customer_id, received_at
), first_event AS (
  INSERT INTO package_events (package_id, status, staff_id, created_at)
  SELECT id, 'received', $1::int, received_at FROM received
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'package.receive', 'packages', id::text, jsonb_build_object('code', code) FROM received
)
SELECT id, code, received_at FROM received;

-- name: set_package_status
-- Moves a package forward: the event and the package change together, so the history and the status
-- never disagree. Forward only, along received → processing → in_transit → ready → delivered (a stage
-- can be skipped), or out to returned / cancelled from any stage before delivery. No row: the
-- package does not exist, it already finished, or the move would go backwards (use
-- correct_package_status for a mistake).
-- $1 actor
-- $2 reference of the package (PKG-000001)
-- $3 new status
-- $4 note for the customer (or null)
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), moved AS (
  UPDATE packages p SET
    status = $3::text,
    shipped_at = CASE WHEN $3::text IN ('in_transit', 'ready', 'delivered') THEN COALESCE(p.shipped_at, now()) ELSE p.shipped_at END,
    ready_at = CASE WHEN $3::text IN ('ready', 'delivered') THEN COALESCE(p.ready_at, now()) ELSE p.ready_at END,
    delivered_at = CASE WHEN $3::text = 'delivered' THEN now() ELSE p.delivered_at END,
    updated_at = now()
  FROM actor
  WHERE p.code = $2::text
    AND p.status NOT IN ('delivered', 'returned', 'cancelled')
    AND (
      $3::text IN ('returned', 'cancelled')
      OR array_position(ARRAY['received', 'processing', 'in_transit', 'ready', 'delivered'], $3::text)
         > array_position(ARRAY['received', 'processing', 'in_transit', 'ready', 'delivered'], p.status)
    )
  RETURNING p.id, p.code, p.status, p.customer_id
), event AS (
  INSERT INTO package_events (package_id, status, note, staff_id)
  SELECT id, status, NULLIF(btrim($4::text), ''), $1::int FROM moved
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'package.status', 'packages', id::text, jsonb_build_object('status', status) FROM moved
)
SELECT code, status, customer_id FROM moved;

-- name: correct_package_status
-- Puts a package back where it really is after a mistake. It can move in any direction and leaves
-- an event with its reason, which the customer reads: nothing is erased from the history. The stage
-- dates that no longer apply are cleared.
-- $1 actor
-- $2 reference of the package
-- $3 the status it really has
-- $4 reason (required)
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), stage AS (
  SELECT array_position(ARRAY['received', 'processing', 'in_transit', 'ready', 'delivered'], $3::text) AS at
), corrected AS (
  UPDATE packages p SET
    status = $3::text,
    shipped_at = CASE WHEN stage.at >= 3 THEN COALESCE(p.shipped_at, now()) WHEN stage.at < 3 THEN NULL ELSE p.shipped_at END,
    ready_at = CASE WHEN stage.at >= 4 THEN COALESCE(p.ready_at, now()) WHEN stage.at < 4 THEN NULL ELSE p.ready_at END,
    delivered_at = CASE WHEN stage.at = 5 THEN COALESCE(p.delivered_at, now()) WHEN stage.at < 5 THEN NULL ELSE p.delivered_at END,
    updated_at = now()
  FROM actor, stage
  WHERE p.code = $2::text AND p.status <> $3::text AND NULLIF(btrim($4::text), '') IS NOT NULL
  RETURNING p.id, p.code, p.status
), event AS (
  INSERT INTO package_events (package_id, status, note, staff_id)
  SELECT id, status, btrim($4::text), $1::int FROM corrected
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'package.correct', 'packages', id::text, jsonb_build_object('status', status, 'reason', btrim($4::text))
  FROM corrected
)
SELECT code, status FROM corrected;

-- name: update_package_measures
-- What was weighed and measured, and how it is charged; a null leaves a value as it is.
-- $1 actor
-- $2 reference of the package
-- $3 weight in pounds
-- $4 length in inches
-- $5 width in inches
-- $6 height in inches
-- $7 pieces
-- $8 rate basis (weight | volume | unit)
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), changed AS (
  UPDATE packages p SET
    weight_lb = COALESCE($3::numeric, p.weight_lb),
    length_in = COALESCE($4::numeric, p.length_in),
    width_in = COALESCE($5::numeric, p.width_in),
    height_in = COALESCE($6::numeric, p.height_in),
    pieces = COALESCE($7::int, p.pieces),
    rate_basis = COALESCE($8::text, p.rate_basis),
    updated_at = now()
  FROM actor
  WHERE p.code = $2::text
  RETURNING p.id, p.code
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'package.measure', 'packages', id::text, '{}'::jsonb FROM changed
)
SELECT code FROM changed;

-- name: list_packages
-- The team's list: by status (or every status), of one customer or of everyone, newest first, with
-- whose each one is and whether a line of an invoice charges for it.
-- $1 status, or empty text for all
-- $2 how many
-- $3 how many to skip
-- $4 Carinova ID of the customer, or empty text for everyone
SELECT p.code, p.description, p.service, p.status, p.weight_lb, p.pieces, p.received_at, p.shipped_at,
       p.ready_at, p.delivered_at, w.code AS warehouse, b.code AS branch, p.delivery_method,
       c.code AS customer_code, c.first_name, c.last_name,
       EXISTS (SELECT 1 FROM invoice_items it WHERE it.package_id = p.id) AS invoiced
FROM packages p
JOIN customers c ON c.id = p.customer_id
JOIN warehouses w ON w.id = p.warehouse_id
LEFT JOIN branches b ON b.id = p.branch_id
WHERE ($1::text = '' OR p.status = $1::text) AND ($4::text = '' OR c.code = $4::text)
ORDER BY p.received_at DESC, p.id DESC
LIMIT $2::int OFFSET $3::int;

-- name: find_package
-- One package with everything the team knows about it (the note for the team included), its history
-- oldest first with who recorded each step, and the invoices that charge for it.
-- $1 reference of the package
SELECT p.id, p.code, p.description, p.store, p.carrier, p.carrier_tracking, p.service, p.rate_basis,
       p.weight_lb, p.length_in, p.width_in, p.height_in, p.pieces, p.declared_value_usd, p.delivery_method,
       p.status, p.received_at, p.shipped_at, p.ready_at, p.delivered_at, p.internal_notes,
       w.code AS warehouse, b.code AS branch, c.code AS customer_code, c.first_name, c.last_name,
       COALESCE((
         SELECT json_agg(json_build_object(
           'status', e.status, 'note', e.note, 'at', e.created_at, 'staff', s.full_name
         ) ORDER BY e.created_at, e.id)
         FROM package_events e LEFT JOIN staff_users s ON s.id = e.staff_id
         WHERE e.package_id = p.id
       ), '[]'::json) AS events,
       COALESCE((
         SELECT json_agg(DISTINCT i.number ORDER BY i.number)
         FROM invoice_items it JOIN invoices i ON i.id = it.invoice_id
         WHERE it.package_id = p.id AND i.status <> 'void'
       ), '[]'::json) AS invoices
FROM packages p
JOIN customers c ON c.id = p.customer_id
JOIN warehouses w ON w.id = p.warehouse_id
LEFT JOIN branches b ON b.id = p.branch_id
WHERE p.code = $1::text;

-- ═════════════════════════════ Invoices and payments ═════════════════════════════

-- name: create_invoice
-- Starts an invoice for a customer, as a draft: the customer does not see it until it is issued.
-- $1 actor
-- $2 Carinova ID of the customer
-- $3 note for the customer (or null)
-- $4 due date (or null)
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), created AS (
  INSERT INTO invoices (customer_id, notes, due_at, created_by_staff_id)
  SELECT c.id, NULLIF(btrim($3::text), ''), $4::timestamptz, actor.id
  FROM actor JOIN customers c ON c.code = $2::text
  RETURNING id, number
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'invoice.create', 'invoices', id::text, jsonb_build_object('number', number) FROM created
)
SELECT id, number FROM created;

-- name: add_invoice_item
-- Adds a line to a draft. A line that charges for a package must be for a package of the invoice's
-- own customer. A discount is a line of kind 'discount' with a negative unit price. No row: the
-- invoice is not a draft, or the package is not that customer's.
-- $1 actor
-- $2 number of the invoice (INV-000001)
-- $3 reference of the package (or null)
-- $4 kind (shipping | home_delivery | assisted_purchase | storage | other | discount)
-- $5 description, as the customer will read it
-- $6 quantity
-- $7 unit price in US dollars
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), added AS (
  INSERT INTO invoice_items (invoice_id, package_id, kind, description, quantity, unit_price_usd)
  SELECT i.id, p.id, $4::text, btrim($5::text), $6::numeric, $7::numeric
  FROM actor
  JOIN invoices i ON i.number = $2::text AND i.status = 'draft'
  LEFT JOIN packages p ON p.code = $3::text AND p.customer_id = i.customer_id
  WHERE $3::text IS NULL OR p.id IS NOT NULL
  RETURNING id, invoice_id, amount_usd
)
SELECT id, amount_usd FROM added;

-- name: remove_invoice_item
-- Takes a line out of a draft.
-- $1 actor
-- $2 id of the line
DELETE FROM invoice_items it
USING invoices i, staff_users s
WHERE it.id = $2::bigint AND i.id = it.invoice_id AND i.status = 'draft' AND s.id = $1::int AND s.is_active
RETURNING it.id;

-- name: issue_invoice
-- Issues a draft: from now on the customer sees it and owes it, and its total is fixed at the sum of
-- its lines. It needs at least one line and a total above zero.
-- $1 actor
-- $2 number of the invoice
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), lines AS (
  SELECT it.invoice_id, sum(it.amount_usd) AS total_usd
  FROM invoice_items it JOIN invoices i ON i.id = it.invoice_id
  WHERE i.number = $2::text
  GROUP BY it.invoice_id
), issued AS (
  UPDATE invoices i SET status = 'issued', issued_at = now(), total_usd = lines.total_usd, updated_at = now()
  FROM actor, lines
  WHERE i.id = lines.invoice_id AND i.status = 'draft' AND lines.total_usd > 0
  RETURNING i.id, i.number, i.customer_id, i.issued_at, i.total_usd
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'invoice.issue', 'invoices', id::text, jsonb_build_object('number', number, 'total', total_usd)
  FROM issued
)
SELECT number, customer_id, issued_at, total_usd FROM issued;

-- name: void_invoice
-- Annuls an issued invoice, with its reason. An invoice with a confirmed payment cannot be voided:
-- the money has to be dealt with first (reverse_payment, when it was confirmed by mistake).
-- $1 actor
-- $2 number of the invoice
-- $3 reason (required)
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), voided AS (
  UPDATE invoices i SET status = 'void', voided_at = now(), void_reason = btrim($3::text), updated_at = now()
  FROM actor
  WHERE i.number = $2::text
    AND i.status = 'issued'
    AND i.paid_usd = 0
    AND NULLIF(btrim($3::text), '') IS NOT NULL
  RETURNING i.id, i.number
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'invoice.void', 'invoices', id::text, jsonb_build_object('reason', btrim($3::text)) FROM voided
)
SELECT number FROM voided;

-- name: record_payment
-- A member of the team records money received towards an issued invoice. It waits as 'pending'
-- until someone confirms it. It cannot be for more than what the invoice still owes. No row: the
-- invoice is not issued, or the amount is above its balance.
-- $1 actor
-- $2 number of the invoice
-- $3 amount in US dollars
-- $4 method (cash | bank_transfer | card | other)
-- $5 reference (or null)
-- $6 key of the receipt's picture in the bucket (or null)
-- $7 when it was paid (or null for now)
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), recorded AS (
  INSERT INTO payments (
    invoice_id, amount_usd, method, reference, proof_key, paid_at, reported_by, recorded_by_staff_id
  )
  SELECT i.id, $3::numeric, $4::text, NULLIF(btrim($5::text), ''), NULLIF(btrim($6::text), ''),
         COALESCE($7::timestamptz, now()), 'staff', actor.id
  FROM actor
  JOIN invoices i ON i.number = $2::text AND i.status = 'issued'
  JOIN invoice_totals t ON t.invoice_id = i.id
  WHERE $3::numeric <= t.balance_usd
  RETURNING id, invoice_id, amount_usd, status
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'payment.record', 'payments', id::text, jsonb_build_object('amount', amount_usd, 'by', 'staff')
  FROM recorded
)
SELECT id, amount_usd, status FROM recorded;

-- name: report_payment
-- The customer's side of the same thing, for when "Mi cuenta" lets them say "I paid this": the
-- payment waits as 'pending' like any other, until the team confirms or rejects it. This statement
-- belongs to the website's Worker, not to the back office, and it is here because nothing runs it
-- yet. It makes sure itself that the invoice is the customer's own: it starts from their session,
-- never from a customer number or an invoice id sent by the page. What they report, added to what
-- is already waiting on that invoice, cannot be more than the invoice still owes. No row: there is
-- no such session, the account is suspended, the invoice is not theirs or not issued, or the amount
-- is above what is left to cover.
-- $1 hash of the customer's session token (as worker/auth/session.ts makes it)
-- $2 number of the invoice
-- $3 amount in US dollars
-- $4 method (cash | bank_transfer | card | other)
-- $5 reference (or null)
-- $6 key of the receipt's picture in the bucket (or null)
-- $7 when it was paid (or null for now)
WITH owner AS (
  SELECT c.id
  FROM customer_sessions s JOIN customers c ON c.id = s.customer_id
  WHERE s.token_hash = $1::text AND s.expires_at > now() AND c.status = 'active'
), reported AS (
  INSERT INTO payments (invoice_id, amount_usd, method, reference, proof_key, paid_at, reported_by)
  SELECT i.id, $3::numeric, $4::text, NULLIF(btrim($5::text), ''), NULLIF(btrim($6::text), ''),
         COALESCE($7::timestamptz, now()), 'customer'
  FROM owner
  JOIN invoices i ON i.customer_id = owner.id AND i.number = $2::text AND i.status = 'issued'
  JOIN invoice_totals t ON t.invoice_id = i.id
  WHERE $3::numeric <= t.balance_usd - t.pending_usd
  RETURNING id, invoice_id, amount_usd, status
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT NULL, 'payment.report', 'payments', id::text, jsonb_build_object('amount', amount_usd, 'by', 'customer')
  FROM reported
)
SELECT id, amount_usd, status FROM reported;

-- name: confirm_payment
-- Confirms a pending payment: from now on it counts towards its invoice ("confirm payment invoices").
-- The payment and the invoice's paid amount change together. Returns what the invoice adds up to
-- afterwards. No row: the payment is not pending (someone confirmed or rejected it already), its
-- invoice is not issued, or it is for more than the invoice still owes.
--
-- If two payments of one invoice are confirmed at the same moment and together they are more than
-- it owes, the second one fails with the check "invoices_paid_within_total" (or
-- "invoices_void_is_unpaid", if the invoice was being voided): nothing of it is kept, the payment is
-- still pending. Treat that error as "no row" and show the invoice again.
-- $1 actor
-- $2 id of the payment
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), confirmed AS (
  UPDATE payments p SET
    status = 'confirmed', reviewed_by_staff_id = actor.id, reviewed_at = now(), updated_at = now()
  FROM actor, invoices i
  WHERE p.id = $2::bigint
    AND p.status = 'pending'
    AND i.id = p.invoice_id
    AND i.status = 'issued'
    AND i.paid_usd + p.amount_usd <= i.total_usd
  RETURNING p.id, p.invoice_id, p.amount_usd
), counted AS (
  UPDATE invoices i SET paid_usd = i.paid_usd + c.amount_usd, updated_at = now()
  FROM confirmed c
  WHERE i.id = c.invoice_id
  RETURNING i.number, i.total_usd, i.paid_usd
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'payment.confirm', 'payments', id::text, jsonb_build_object('amount', amount_usd) FROM confirmed
)
SELECT c.id, k.number, k.total_usd, k.paid_usd, k.total_usd - k.paid_usd AS balance_usd
FROM confirmed c, counted k;

-- name: reject_payment
-- Rejects a pending payment, with its reason: it does not count, and the customer sees it rejected.
-- $1 actor
-- $2 id of the payment
-- $3 reason (required)
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), rejected AS (
  UPDATE payments p SET
    status = 'rejected', reviewed_by_staff_id = actor.id, reviewed_at = now(),
    rejection_reason = btrim($3::text), updated_at = now()
  FROM actor
  WHERE p.id = $2::bigint AND p.status = 'pending' AND NULLIF(btrim($3::text), '') IS NOT NULL
  RETURNING p.id, p.invoice_id
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'payment.reject', 'payments', id::text, jsonb_build_object('reason', btrim($3::text)) FROM rejected
)
SELECT id, invoice_id FROM rejected;

-- name: reverse_payment
-- Takes back a payment that was confirmed by mistake (the wrong invoice, money that never arrived).
-- It stops counting towards its invoice and stays on record as rejected, with the reason; who had
-- confirmed it stays in audit_log. The payment and the invoice's paid amount change together.
-- Returns what the invoice adds up to afterwards. No row: the payment is not a confirmed one.
-- $1 actor
-- $2 id of the payment
-- $3 reason (required)
WITH actor AS (
  SELECT id FROM staff_users WHERE id = $1::int AND is_active
), reversed AS (
  UPDATE payments p SET
    status = 'rejected', reviewed_by_staff_id = actor.id, reviewed_at = now(),
    rejection_reason = btrim($3::text), updated_at = now()
  FROM actor
  WHERE p.id = $2::bigint AND p.status = 'confirmed' AND NULLIF(btrim($3::text), '') IS NOT NULL
  RETURNING p.id, p.invoice_id, p.amount_usd
), counted AS (
  UPDATE invoices i SET paid_usd = i.paid_usd - r.amount_usd, updated_at = now()
  FROM reversed r
  WHERE i.id = r.invoice_id
  RETURNING i.number, i.total_usd, i.paid_usd
), logged AS (
  INSERT INTO audit_log (staff_id, action, entity, entity_id, details)
  SELECT $1::int, 'payment.reverse', 'payments', id::text,
         jsonb_build_object('amount', amount_usd, 'reason', btrim($3::text))
  FROM reversed
)
SELECT r.id, k.number, k.total_usd, k.paid_usd, k.total_usd - k.paid_usd AS balance_usd
FROM reversed r, counted k;

-- name: list_pending_payments
-- The queue of payments waiting to be confirmed, oldest first.
-- $1 how many
SELECT p.id, p.amount_usd, p.method, p.reference, p.proof_key, p.paid_at, p.reported_by, p.created_at,
       i.number AS invoice_number, t.total_usd, t.balance_usd,
       c.code AS customer_code, c.first_name, c.last_name
FROM payments p
JOIN invoices i ON i.id = p.invoice_id
JOIN invoice_totals t ON t.invoice_id = i.id
JOIN customers c ON c.id = i.customer_id
WHERE p.status = 'pending'
ORDER BY p.created_at, p.id
LIMIT $1::int;

-- name: list_invoices
-- The team's list of invoices, of one customer or of everyone, newest first, by what the customer
-- reads about each one.
-- $1 payment state (draft | unpaid | in_review | partial | paid | void), or empty text for all
-- $2 how many
-- $3 how many to skip
-- $4 Carinova ID of the customer, or empty text for everyone
SELECT i.number, i.status, t.payment_state, t.total_usd, t.paid_usd, t.pending_usd, t.balance_usd,
       i.issued_at, i.due_at, i.created_at, c.code AS customer_code, c.first_name, c.last_name
FROM invoices i
JOIN invoice_totals t ON t.invoice_id = i.id
JOIN customers c ON c.id = i.customer_id
WHERE ($1::text = '' OR t.payment_state = $1::text) AND ($4::text = '' OR c.code = $4::text)
ORDER BY i.created_at DESC, i.id DESC
LIMIT $2::int OFFSET $3::int;

-- name: find_invoice
-- One invoice with its amounts, its lines and its payments. The ids are the ones remove_invoice_item,
-- confirm_payment, reject_payment and reverse_payment take. For the team: it includes drafts, the
-- reasons and where a receipt is kept, none of which the customer's account is given.
-- $1 number of the invoice
SELECT i.id, i.number, i.status, t.payment_state, t.total_usd, t.paid_usd, t.pending_usd, t.balance_usd,
       i.notes, i.issued_at, i.due_at, i.voided_at, i.void_reason, i.created_at,
       c.code AS customer_code, c.first_name, c.last_name, c.company_name,
       COALESCE((
         SELECT json_agg(json_build_object(
           'id', it.id, 'kind', it.kind, 'description', it.description, 'quantity', it.quantity,
           'unit_price_usd', it.unit_price_usd, 'amount_usd', it.amount_usd, 'package', p.code
         ) ORDER BY it.id)
         FROM invoice_items it LEFT JOIN packages p ON p.id = it.package_id
         WHERE it.invoice_id = i.id
       ), '[]'::json) AS items,
       COALESCE((
         SELECT json_agg(json_build_object(
           'id', pay.id, 'amount_usd', pay.amount_usd, 'method', pay.method, 'reference', pay.reference,
           'proof_key', pay.proof_key, 'paid_at', pay.paid_at, 'status', pay.status,
           'reported_by', pay.reported_by, 'reviewed_at', pay.reviewed_at, 'reviewed_by', s.full_name,
           'rejection_reason', pay.rejection_reason
         ) ORDER BY pay.id)
         FROM payments pay LEFT JOIN staff_users s ON s.id = pay.reviewed_by_staff_id
         WHERE pay.invoice_id = i.id
       ), '[]'::json) AS payments
FROM invoices i
JOIN invoice_totals t ON t.invoice_id = i.id
JOIN customers c ON c.id = i.customer_id
WHERE i.number = $1::text;

-- name: find_invoice_drift
-- A health check: the invoices whose stored amounts do not match their lines and their confirmed
-- payments. It must return nothing. A row here means something changed an invoice, a line or a
-- payment without the statements above: stop and find out what before confirming anything else.
SELECT i.number, i.status, i.total_usd, lines.lines_usd, i.paid_usd, COALESCE(pay.confirmed_usd, 0) AS confirmed_usd
FROM invoices i
LEFT JOIN (
  SELECT invoice_id, sum(amount_usd) AS lines_usd FROM invoice_items GROUP BY invoice_id
) lines ON lines.invoice_id = i.id
LEFT JOIN (
  SELECT invoice_id, sum(amount_usd) AS confirmed_usd FROM payments WHERE status = 'confirmed' GROUP BY invoice_id
) pay ON pay.invoice_id = i.id
WHERE i.paid_usd <> COALESCE(pay.confirmed_usd, 0)
   OR (i.status <> 'draft' AND i.total_usd IS DISTINCT FROM lines.lines_usd)
ORDER BY i.id;

-- name: list_audit_log
-- What was done to one thing, newest first: the history behind a customer, a package, an invoice or
-- a payment.
-- $1 table (customers | packages | invoices | payments | staff_users)
-- $2 id of the row, as text
SELECT a.id, a.action, a.details, a.created_at, s.full_name AS staff_name
FROM audit_log a LEFT JOIN staff_users s ON s.id = a.staff_id
WHERE a.entity = $1::text AND a.entity_id = $2::text
ORDER BY a.created_at DESC, a.id DESC;
