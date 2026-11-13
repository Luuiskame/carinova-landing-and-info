/**
 * What the Worker keeps in the database: the confirmed customers, the one-time codes they sign in
 * with and their sessions; and what it reads from it for "Mi cuenta": the packages and the invoices
 * of the customer who is signed in, which the back office writes. Production uses Neon (PostgreSQL)
 * over HTTP; the tables are defined in db/schema.sql and explained in docs/DATABASE.md. The
 * in-memory store exists for `astro dev` without a database and for the tests.
 *
 * Every operation is one SQL statement: it either happens whole or not at all, and two requests at
 * the same moment cannot interleave (two confirmations of one link, two guesses at one code).
 * Codes and session tokens never reach the database: only their hashes do (auth/code.ts,
 * auth/session.ts), so reading the database gives nothing to sign in with.
 */
import { neon } from '@neondatabase/serverless';
import type { InvoiceState, PackageService, PackageStatus, PaymentMethod, PaymentStatus } from '../src/data/account.ts';
import { localeFrom, type Locale } from '../src/i18n/locales.ts';
import type { SignupData } from './signup/validate.ts';

export interface Customer {
  /** Customer number as shown to people, e.g. "CNV-00001" (the Carinova ID). Assigned by the database. */
  code: string;
  firstName: string;
  lastName: string;
}

/** What a customer who is signed in sees of their own account. */
export interface Account extends Customer {
  email: string;
  phone: string;
  /** ISO 3166-1 alpha-2. */
  country: string;
  address1: string;
  /** Empty when not given. */
  address2: string;
  city: string;
  state: string;
  /** Empty when not given. */
  postalCode: string;
  /** The language the customer signed up in. */
  locale: Locale;
  /** ISO 8601. */
  createdAt: string;
}

/** A change of status in the history of a package. */
export interface PackageEvent {
  status: PackageStatus;
  /** ISO 8601. */
  at: string;
  /** What Carinova wrote next to it for the customer; empty when nothing. */
  note: string;
}

/** A package as its owner sees it in "Mi cuenta". Nothing internal: no notes of the team, no ids. */
export interface AccountPackage {
  /** The reference shown to the customer: "PKG-000123". */
  reference: string;
  description: string;
  /** Empty when not known. */
  store: string;
  /** Who delivered it to the warehouse, and under which number; empty when not known. */
  carrier: string;
  carrierTracking: string;
  service: PackageService;
  status: PackageStatus;
  /** The warehouse that received it: "MIA". */
  warehouse: string;
  /** The branch it will be picked up at ("managua"); empty when not decided, or for home delivery. */
  branch: string;
  deliveryMethod: 'pickup' | 'home';
  /** Pounds, as weighed at the warehouse; null when not weighed yet. */
  weightLb: number | null;
  pieces: number;
  /** ISO 8601; null for a stage the package has not reached. */
  receivedAt: string;
  shippedAt: string | null;
  readyAt: string | null;
  deliveredAt: string | null;
  /** Oldest first. */
  events: Array<PackageEvent>;
}

/** An invoice as the customer sees it. Amounts are US dollars. */
export interface AccountInvoice {
  /** "INV-000123" */
  number: string;
  state: InvoiceState;
  /** ISO 8601. */
  issuedAt: string;
  dueAt: string | null;
  total: number;
  /** Confirmed payments. */
  paid: number;
  /** Payments waiting to be confirmed. */
  pending: number;
  /** total − paid. */
  balance: number;
  /** What Carinova wrote for the customer; empty when nothing. */
  notes: string;
  items: Array<{ description: string; amount: number; /** "PKG-000123", or empty. */ packageReference: string }>;
  payments: Array<{ amount: number; method: PaymentMethod; status: PaymentStatus; paidAt: string; reference: string }>;
}

/** What "Mi cuenta" shows besides the customer's own details. */
export interface AccountActivity {
  /** Newest first. */
  packages: Array<AccountPackage>;
  /** Newest first; drafts are not included. */
  invoices: Array<AccountInvoice>;
}

/** A session to open: the hash of its token and how long it lasts. */
export interface NewSession {
  tokenHash: string;
  days: number;
}

export interface NewCustomer {
  termsAcceptedAt: Date;
  locale: Locale;
  /** Opened for the customer only when the account is created by this call. */
  session?: NewSession;
}

export interface NewLoginCode {
  /** Lower case. */
  email: string;
  codeHash: string;
  /** Minutes the code stays valid. */
  minutes: number;
  /** Codes a customer can be sent, counting this one. */
  limits: { per15Minutes: number; perDay: number };
}

export interface Store {
  /**
   * Creates the customer. An e-mail address can only have one account: if it already has one,
   * that account is returned untouched with `isNew: false`, and no session is opened.
   */
  create(data: SignupData, options: NewCustomer): Promise<Customer & { isNew: boolean; signedIn: boolean }>;

  /**
   * Keeps a sign-in code for the customer of this e-mail; any earlier code stops working. Resolves
   * with who to send it to, or with null when there is nothing to send: nobody has that e-mail, or
   * the customer was sent too many codes lately.
   */
  issueLoginCode(code: NewLoginCode): Promise<{ firstName: string } | null>;

  /**
   * Checks a sign-in code. Every call counts as an attempt against the customer's current code. When
   * the code is the right one and it had attempts left, it is used up, `session` is opened and the
   * account comes back; in every other case (wrong, expired, used, no such customer) null does.
   */
  redeemLoginCode(email: string, codeHash: string, maxAttempts: number, session: NewSession): Promise<Account | null>;

  /** The account a session belongs to; null once the session ended or expired, or the account was suspended. */
  findAccount(sessionTokenHash: string): Promise<Account | null>;

  /**
   * The packages and the invoices of the customer a session belongs to, at most `limit` of each (the
   * most recent ones); null when there is no such session. Only ever that customer's own rows: the
   * session decides whose, nothing the request says does.
   */
  findActivity(sessionTokenHash: string, limit: number): Promise<AccountActivity | null>;

  endSession(sessionTokenHash: string): Promise<void>;
}

/** Runs one parameterised statement and resolves with its rows. */
export type Query = (text: string, params: Array<unknown>) => Promise<Array<Record<string, unknown>>>;

const ACCOUNT_COLUMNS = `code, first_name, last_name, email, phone, country, address_line1, address_line2,
  city, state, postal_code, locale, created_at`;

// The insert only runs when the e-mail is new, which also keeps the customer numbers free of gaps,
// and the session is opened only for the customer this statement created.
const CREATE_CUSTOMER = `
WITH existing AS (
  SELECT code, first_name, last_name FROM customers WHERE email = $1
), inserted AS (
  INSERT INTO customers
    (email, first_name, last_name, phone, country, address_line1, address_line2, city, state, postal_code,
     terms_accepted_at, locale)
  SELECT $1, $2, $3, $4, $5, $6, NULLIF($7, ''), $8, $9, NULLIF($10, ''), $11::timestamptz, $12
  WHERE NOT EXISTS (SELECT 1 FROM existing)
  ON CONFLICT (email) DO NOTHING
  RETURNING id, code, first_name, last_name
), opened AS (
  INSERT INTO customer_sessions (token_hash, customer_id, expires_at)
  SELECT $13::text, id, now() + ($14::int * interval '1 day') FROM inserted WHERE $13::text IS NOT NULL
  RETURNING customer_id
)
SELECT code, first_name, last_name, true AS is_new, EXISTS (SELECT 1 FROM opened) AS signed_in FROM inserted
UNION ALL
SELECT code, first_name, last_name, false AS is_new, false AS signed_in FROM existing`;

const FIND_BY_EMAIL = `
SELECT code, first_name, last_name, false AS is_new, false AS signed_in FROM customers WHERE email = $1`;

// One code per customer works at a time: the new one retires the others. The limits count every
// code of the last day, retired or not. Codes too old to count are swept away on the way.
const ISSUE_LOGIN_CODE = `
WITH customer AS (
  SELECT id, first_name FROM customers WHERE email = $1 AND status = 'active'
), sent AS (
  SELECT
    count(*) FILTER (WHERE created_at > now() - interval '15 minutes') AS last_quarter,
    count(*) AS last_day
  FROM customer_login_codes
  WHERE customer_id = (SELECT id FROM customer) AND created_at > now() - interval '1 day'
), allowed AS (
  SELECT customer.id, customer.first_name FROM customer, sent
  WHERE sent.last_quarter < $4::int AND sent.last_day < $5::int
), retired AS (
  UPDATE customer_login_codes SET expires_at = now()
  WHERE customer_id = (SELECT id FROM allowed) AND consumed_at IS NULL AND expires_at > now()
), swept AS (
  DELETE FROM customer_login_codes WHERE created_at < now() - interval '2 days'
), issued AS (
  INSERT INTO customer_login_codes (customer_id, code_hash, expires_at)
  SELECT id, $2, now() + ($3::int * interval '1 minute') FROM allowed
  RETURNING customer_id
)
SELECT first_name FROM allowed WHERE EXISTS (SELECT 1 FROM issued)`;

// The attempt is counted and the code is used up in the same update, on a row the database locks:
// guesses made at the same moment are counted one after the other, and one code opens one session.
// In SET, "attempts" is the value before this attempt.
const REDEEM_LOGIN_CODE = `
WITH customer AS (
  SELECT id FROM customers WHERE email = $1 AND status = 'active'
), tried AS (
  UPDATE customer_login_codes SET
    attempts = attempts + 1,
    consumed_at = CASE WHEN code_hash = $2 AND attempts < $3::int THEN now() ELSE consumed_at END
  WHERE customer_id = (SELECT id FROM customer) AND consumed_at IS NULL AND expires_at > now()
  RETURNING customer_id, consumed_at
), swept AS (
  DELETE FROM customer_sessions WHERE expires_at < now()
), opened AS (
  INSERT INTO customer_sessions (token_hash, customer_id, expires_at)
  SELECT $4, customer_id, now() + ($5::int * interval '1 day') FROM tried WHERE consumed_at IS NOT NULL
  LIMIT 1
  RETURNING customer_id
)
SELECT ${ACCOUNT_COLUMNS} FROM customers WHERE id = (SELECT customer_id FROM opened)`;

const FIND_ACCOUNT = `
SELECT ${ACCOUNT_COLUMNS.replace(/(\w+)/g, 'c.$1')}
FROM customer_sessions s JOIN customers c ON c.id = s.customer_id
WHERE s.token_hash = $1 AND s.expires_at > now() AND c.status = 'active'`;

// One statement, one round trip: the customer of the session, their latest packages with the history
// of each one and their latest invoices with their lines and payments, as two JSON arrays. Drafts are
// the team's work in progress and never leave the database; neither do the team's notes.
const FIND_ACTIVITY = `
WITH me AS (
  SELECT c.id
  FROM customer_sessions s JOIN customers c ON c.id = s.customer_id
  WHERE s.token_hash = $1 AND s.expires_at > now() AND c.status = 'active'
), mine AS (
  SELECT p.*, w.code AS warehouse_code, b.code AS branch_code
  FROM packages p
  JOIN warehouses w ON w.id = p.warehouse_id
  LEFT JOIN branches b ON b.id = p.branch_id
  WHERE p.customer_id = (SELECT id FROM me)
  ORDER BY p.received_at DESC, p.id DESC
  LIMIT $2::int
), owed AS (
  SELECT i.id, i.number, i.issued_at, i.due_at, i.notes,
         t.total_usd, t.paid_usd, t.pending_usd, t.balance_usd, t.payment_state
  FROM invoices i JOIN invoice_totals t ON t.invoice_id = i.id
  WHERE i.customer_id = (SELECT id FROM me) AND i.status <> 'draft'
  ORDER BY i.issued_at DESC, i.id DESC
  LIMIT $2::int
)
SELECT
  EXISTS (SELECT 1 FROM me) AS signed_in,
  COALESCE((
    SELECT json_agg(json_build_object(
      'reference', m.code,
      'description', m.description,
      'store', m.store,
      'carrier', m.carrier,
      'carrierTracking', m.carrier_tracking,
      'service', m.service,
      'status', m.status,
      'warehouse', m.warehouse_code,
      'branch', m.branch_code,
      'deliveryMethod', m.delivery_method,
      'weightLb', m.weight_lb,
      'pieces', m.pieces,
      'receivedAt', m.received_at,
      'shippedAt', m.shipped_at,
      'readyAt', m.ready_at,
      'deliveredAt', m.delivered_at,
      'events', COALESCE((
        SELECT json_agg(json_build_object('status', e.status, 'at', e.created_at, 'note', e.note)
                        ORDER BY e.created_at, e.id)
        FROM package_events e WHERE e.package_id = m.id
      ), '[]'::json)
    ) ORDER BY m.received_at DESC, m.id DESC)
    FROM mine m
  ), '[]'::json) AS packages,
  COALESCE((
    SELECT json_agg(json_build_object(
      'number', o.number,
      'state', o.payment_state,
      'issuedAt', o.issued_at,
      'dueAt', o.due_at,
      'total', o.total_usd,
      'paid', o.paid_usd,
      'pending', o.pending_usd,
      'balance', o.balance_usd,
      'notes', o.notes,
      'items', COALESCE((
        SELECT json_agg(json_build_object(
          'description', it.description, 'amount', it.amount_usd, 'packageReference', pk.code
        ) ORDER BY it.id)
        FROM invoice_items it LEFT JOIN packages pk ON pk.id = it.package_id
        WHERE it.invoice_id = o.id
      ), '[]'::json),
      'payments', COALESCE((
        SELECT json_agg(json_build_object(
          'amount', pay.amount_usd, 'method', pay.method, 'status', pay.status,
          'paidAt', pay.paid_at, 'reference', pay.reference
        ) ORDER BY pay.paid_at, pay.id)
        FROM payments pay WHERE pay.invoice_id = o.id
      ), '[]'::json)
    ) ORDER BY o.issued_at DESC, o.id DESC)
    FROM owed o
  ), '[]'::json) AS invoices`;

const END_SESSION = 'DELETE FROM customer_sessions WHERE token_hash = $1';

const text = (value: unknown): string => (value === null || value === undefined ? '' : String(value));

const accountOf = (row: Record<string, unknown>): Account => ({
  code: text(row.code),
  firstName: text(row.first_name),
  lastName: text(row.last_name),
  email: text(row.email),
  phone: text(row.phone),
  country: text(row.country),
  address1: text(row.address_line1),
  address2: text(row.address_line2),
  city: text(row.city),
  state: text(row.state),
  postalCode: text(row.postal_code),
  locale: localeFrom(row.locale),
  createdAt: new Date(row.created_at as string | Date).toISOString(),
});

/** A JSON column: the driver hands it over parsed; a driver that does not gets it parsed here. */
const jsonOf = <T>(value: unknown): T => (typeof value === 'string' ? JSON.parse(value) : value) as T;

const isoOf = (value: unknown): string | null => {
  if (value === null || value === undefined || value === '') return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const numberOf = (value: unknown): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

type Json = Record<string, unknown>;

/** The rows of FIND_ACTIVITY as the API answers them: no nulls where a text goes, dates in ISO 8601. */
const activityOf = (row: Json): AccountActivity => ({
  packages: jsonOf<Array<Json>>(row.packages).map((item) => ({
    reference: text(item.reference),
    description: text(item.description),
    store: text(item.store),
    carrier: text(item.carrier),
    carrierTracking: text(item.carrierTracking),
    service: text(item.service) as PackageService,
    status: text(item.status) as PackageStatus,
    warehouse: text(item.warehouse),
    branch: text(item.branch),
    deliveryMethod: item.deliveryMethod === 'home' ? 'home' : 'pickup',
    weightLb: item.weightLb === null || item.weightLb === undefined ? null : numberOf(item.weightLb),
    pieces: numberOf(item.pieces) || 1,
    receivedAt: isoOf(item.receivedAt) ?? '',
    shippedAt: isoOf(item.shippedAt),
    readyAt: isoOf(item.readyAt),
    deliveredAt: isoOf(item.deliveredAt),
    events: ((item.events as Array<Json> | null) ?? []).map((event) => ({
      status: text(event.status) as PackageStatus,
      at: isoOf(event.at) ?? '',
      note: text(event.note),
    })),
  })),
  invoices: jsonOf<Array<Json>>(row.invoices).map((item) => ({
    number: text(item.number),
    state: text(item.state) as InvoiceState,
    issuedAt: isoOf(item.issuedAt) ?? '',
    dueAt: isoOf(item.dueAt),
    total: numberOf(item.total),
    paid: numberOf(item.paid),
    pending: numberOf(item.pending),
    balance: numberOf(item.balance),
    notes: text(item.notes),
    items: ((item.items as Array<Json> | null) ?? []).map((line) => ({
      description: text(line.description),
      amount: numberOf(line.amount),
      packageReference: text(line.packageReference),
    })),
    payments: ((item.payments as Array<Json> | null) ?? []).map((payment) => ({
      amount: numberOf(payment.amount),
      method: text(payment.method) as PaymentMethod,
      status: text(payment.status) as PaymentStatus,
      paidAt: isoOf(payment.paidAt) ?? '',
      reference: text(payment.reference),
    })),
  })),
});

export const sqlStore = (query: Query): Store => ({
  async create(data, { termsAcceptedAt, locale, session }) {
    let [row] = await query(CREATE_CUSTOMER, [
      data.email,
      data.firstName,
      data.lastName,
      data.phone,
      data.country,
      data.address1,
      data.address2,
      data.city,
      data.state,
      data.postalCode,
      termsAcceptedAt.toISOString(),
      locale,
      session?.tokenHash ?? null,
      session?.days ?? 0,
    ]);
    // No row: another request inserted the same e-mail between our check and our insert.
    if (!row) [row] = await query(FIND_BY_EMAIL, [data.email]);
    if (!row) throw new Error('The customer could not be created.');
    return {
      code: text(row.code),
      firstName: text(row.first_name),
      lastName: text(row.last_name),
      isNew: row.is_new === true,
      signedIn: row.signed_in === true,
    };
  },

  async issueLoginCode({ email, codeHash, minutes, limits }) {
    const [row] = await query(ISSUE_LOGIN_CODE, [email, codeHash, minutes, limits.per15Minutes, limits.perDay]);
    return row ? { firstName: text(row.first_name) } : null;
  },

  async redeemLoginCode(email, codeHash, maxAttempts, session) {
    const [row] = await query(REDEEM_LOGIN_CODE, [email, codeHash, maxAttempts, session.tokenHash, session.days]);
    return row ? accountOf(row) : null;
  },

  async findAccount(sessionTokenHash) {
    const [row] = await query(FIND_ACCOUNT, [sessionTokenHash]);
    return row ? accountOf(row) : null;
  },

  async findActivity(sessionTokenHash, limit) {
    const [row] = await query(FIND_ACTIVITY, [sessionTokenHash, limit]);
    return row && row.signed_in === true ? activityOf(row) : null;
  },

  async endSession(sessionTokenHash) {
    await query(END_SESSION, [sessionTokenHash]);
  },
});

export const neonStore = (databaseUrl: string): Store => {
  const sql = neon(databaseUrl);
  return sqlStore((statement, params) => sql.query(statement, params));
};

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

/**
 * Same behaviour as the database, kept in memory. Numbers restart whenever the process does.
 * `now` lets the tests move the clock. Nothing writes packages or invoices here (the back office
 * does, in the real database), so every account has none, unless `activity` says what an account
 * has: the tests and the browser checks use it to see "Mi cuenta" with something in it.
 */
export const memoryStore = ({
  now = Date.now,
  activity,
}: { now?: () => number; activity?: (account: Account) => AccountActivity } = {}): Store => {
  const accounts = new Map<string, Account>();
  const codes = new Map<string, { hash: string; attempts: number; expiresAt: number; used: boolean }>();
  /** When each customer was sent a code, for the limits. */
  const issued = new Map<string, Array<number>>();
  const sessions = new Map<string, { email: string; expiresAt: number }>();

  const open = (email: string, session: NewSession) =>
    sessions.set(session.tokenHash, { email, expiresAt: now() + session.days * DAY });

  /** The account a live session belongs to. */
  const accountOf = (sessionTokenHash: string): Account | null => {
    const session = sessions.get(sessionTokenHash);
    if (!session || session.expiresAt <= now()) return null;
    return accounts.get(session.email) ?? null;
  };

  return {
    async create(data, { locale, session }) {
      const existing = accounts.get(data.email);
      if (existing) {
        const { code, firstName, lastName } = existing;
        return { code, firstName, lastName, isNew: false, signedIn: false };
      }
      const account: Account = {
        ...data,
        code: `CNV-${String(accounts.size + 1).padStart(5, '0')}`,
        locale,
        createdAt: new Date(now()).toISOString(),
      };
      accounts.set(data.email, account);
      if (session) open(data.email, session);
      const { code, firstName, lastName } = account;
      return { code, firstName, lastName, isNew: true, signedIn: session !== undefined };
    },

    async issueLoginCode({ email, codeHash, minutes, limits }) {
      const account = accounts.get(email);
      if (!account) return null;
      const sent = (issued.get(email) ?? []).filter((at) => at > now() - DAY);
      const lastQuarter = sent.filter((at) => at > now() - 15 * MINUTE).length;
      if (lastQuarter >= limits.per15Minutes || sent.length >= limits.perDay) return null;

      issued.set(email, [...sent, now()]);
      codes.set(email, { hash: codeHash, attempts: 0, expiresAt: now() + minutes * MINUTE, used: false });
      return { firstName: account.firstName };
    },

    async redeemLoginCode(email, codeHash, maxAttempts, session) {
      const account = accounts.get(email);
      const code = codes.get(email);
      if (!account || !code || code.used || code.expiresAt <= now()) return null;

      const attemptsBefore = code.attempts;
      code.attempts += 1;
      if (code.hash !== codeHash || attemptsBefore >= maxAttempts) return null;

      code.used = true;
      open(email, session);
      return account;
    },

    async findAccount(sessionTokenHash) {
      return accountOf(sessionTokenHash);
    },

    async findActivity(sessionTokenHash, limit) {
      const account = accountOf(sessionTokenHash);
      if (!account) return null;
      const { packages, invoices } = activity?.(account) ?? { packages: [], invoices: [] };
      return { packages: packages.slice(0, limit), invoices: invoices.slice(0, limit) };
    },

    async endSession(sessionTokenHash) {
      sessions.delete(sessionTokenHash);
    },
  };
};
