/**
 * What the Worker keeps in the database: the confirmed customers, the one-time codes they sign in
 * with and their sessions. Production uses Neon (PostgreSQL) over HTTP; the tables are defined in
 * db/schema.sql. The in-memory store exists for `astro dev` without a database and for the tests.
 *
 * Every operation is one SQL statement: it either happens whole or not at all, and two requests at
 * the same moment cannot interleave (two confirmations of one link, two guesses at one code).
 * Codes and session tokens never reach the database: only their hashes do (auth/code.ts,
 * auth/session.ts), so reading the database gives nothing to sign in with.
 */
import { neon } from '@neondatabase/serverless';
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

  /** The account a session belongs to; null once the session ended or expired. */
  findAccount(sessionTokenHash: string): Promise<Account | null>;

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
  SELECT id, first_name FROM customers WHERE email = $1
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
  SELECT id FROM customers WHERE email = $1
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
WHERE s.token_hash = $1 AND s.expires_at > now()`;

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
 * `now` lets the tests move the clock.
 */
export const memoryStore = ({ now = Date.now }: { now?: () => number } = {}): Store => {
  const accounts = new Map<string, Account>();
  const codes = new Map<string, { hash: string; attempts: number; expiresAt: number; used: boolean }>();
  /** When each customer was sent a code, for the limits. */
  const issued = new Map<string, Array<number>>();
  const sessions = new Map<string, { email: string; expiresAt: number }>();

  const open = (email: string, session: NewSession) =>
    sessions.set(session.tokenHash, { email, expiresAt: now() + session.days * DAY });

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
      const session = sessions.get(sessionTokenHash);
      if (!session || session.expiresAt <= now()) return null;
      return accounts.get(session.email) ?? null;
    },

    async endSession(sessionTokenHash) {
      sessions.delete(sessionTokenHash);
    },
  };
};
