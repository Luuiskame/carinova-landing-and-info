/**
 * Where confirmed customers are stored. Production uses Neon (PostgreSQL) over HTTP; the table
 * is defined in db/schema.sql. The in-memory store exists for `astro dev` without a database
 * and for the tests.
 */
import { neon } from '@neondatabase/serverless';
import type { SignupData } from './validate.ts';

export interface Customer {
  /** Customer number as shown to people, e.g. "CNV-00001". Assigned by the database. */
  code: string;
  firstName: string;
  lastName: string;
}

export interface CustomerStore {
  /**
   * Creates the customer. An e-mail address can only have one account: if it already has one,
   * that account is returned untouched with `isNew: false`.
   */
  create(data: SignupData, termsAcceptedAt: Date): Promise<Customer & { isNew: boolean }>;
}

/** Runs one parameterised statement and resolves with its rows. */
export type Query = (text: string, params: Array<unknown>) => Promise<Array<Record<string, unknown>>>;

// One statement, so two confirmations of the same link cannot create two accounts. The insert
// only runs when the e-mail is new, which also keeps the customer numbers free of gaps.
const CREATE_CUSTOMER = `
WITH existing AS (
  SELECT code, first_name, last_name FROM customers WHERE email = $1
), inserted AS (
  INSERT INTO customers
    (email, first_name, last_name, phone, country, address_line1, address_line2, city, state, postal_code, terms_accepted_at)
  SELECT $1, $2, $3, $4, $5, $6, NULLIF($7, ''), $8, $9, NULLIF($10, ''), $11::timestamptz
  WHERE NOT EXISTS (SELECT 1 FROM existing)
  ON CONFLICT (email) DO NOTHING
  RETURNING code, first_name, last_name
)
SELECT code, first_name, last_name, true AS is_new FROM inserted
UNION ALL
SELECT code, first_name, last_name, false AS is_new FROM existing`;

const FIND_BY_EMAIL = 'SELECT code, first_name, last_name, false AS is_new FROM customers WHERE email = $1';

export const sqlStore = (query: Query): CustomerStore => ({
  async create(data, termsAcceptedAt) {
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
    ]);
    // No row: another request inserted the same e-mail between our check and our insert.
    if (!row) [row] = await query(FIND_BY_EMAIL, [data.email]);
    if (!row) throw new Error('The customer could not be created.');
    return {
      code: String(row.code),
      firstName: String(row.first_name),
      lastName: String(row.last_name),
      isNew: row.is_new === true,
    };
  },
});

export const neonStore = (databaseUrl: string): CustomerStore => {
  const sql = neon(databaseUrl);
  return sqlStore((text, params) => sql.query(text, params));
};

/** Same behaviour as the database, kept in memory. Numbers restart whenever the process does. */
export const memoryStore = (): CustomerStore => {
  const customers = new Map<string, Customer>();
  return {
    async create(data) {
      const existing = customers.get(data.email);
      if (existing) return { ...existing, isNew: false };
      const customer = {
        code: `CNV-${String(customers.size + 1).padStart(5, '0')}`,
        firstName: data.firstName,
        lastName: data.lastName,
      };
      customers.set(data.email, customer);
      return { ...customer, isNew: true };
    },
  };
};
