// The database and the website describe the same things in two places: the lists of statuses are
// CHECK constraints in db/schema.sql and constants in src/data/account.ts; the Miami address and
// the branches are rows of the schema and data of the site. These tests read the schema as text and
// fail when the two sides differ, so neither can change alone.
//
// What the statements do in a real PostgreSQL (constraints, the view, the Worker's queries) is
// checked against a database, outside the unit tests: docs/DATABASE.md → "Checking a change".
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  INVOICE_STATES,
  PACKAGE_SERVICES,
  PACKAGE_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from '../src/data/account.ts';
import { BRANCHES, MIAMI_ADDRESS, RECEPTION_POINTS } from '../src/data/carinova.ts';

const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

/** The values of `CONSTRAINT <name> CHECK (… IN ('a', 'b'))`, in the order they are written. */
const valuesOf = (constraint: string): Array<string> => {
  const at = schema.indexOf(`CONSTRAINT ${constraint} CHECK`);
  assert.notEqual(at, -1, `db/schema.sql has no constraint ${constraint}`);
  const list = /IN \(([^)]+)\)/.exec(schema.slice(at));
  assert.ok(list, `${constraint} is not a list of values`);
  return Array.from(list[1].matchAll(/'([^']+)'/g), (match) => match[1]);
};

const ids = (list: ReadonlyArray<{ id: string }>) => list.map((item) => item.id);

test('the statuses the database accepts are the ones the site knows how to show', () => {
  assert.deepEqual(valuesOf('packages_status_known'), ids(PACKAGE_STATUSES));
  assert.deepEqual(valuesOf('package_events_status_known'), ids(PACKAGE_STATUSES));
  assert.deepEqual(valuesOf('packages_service_known'), [...PACKAGE_SERVICES]);
  assert.deepEqual(valuesOf('payments_status_known'), ids(PAYMENT_STATUSES));
  assert.deepEqual(valuesOf('payments_method_known'), ids(PAYMENT_METHODS));
});

test('what a customer reads about an invoice is what the view invoice_totals works out', () => {
  const at = schema.indexOf('CREATE OR REPLACE VIEW invoice_totals');
  assert.notEqual(at, -1);
  const view = schema.slice(at, schema.indexOf(';', at));
  const states = Array.from(view.matchAll(/(?:THEN|ELSE) '([a-z_]+)'/g), (match) => match[1]);
  // "draft" is the one state a customer never sees: the Worker leaves drafts out.
  assert.deepEqual(states.filter((state) => state !== 'draft').sort(), ids(INVOICE_STATES).sort());
  assert.deepEqual(valuesOf('invoices_status_known'), ['draft', 'issued', 'void']);
});

test('the warehouses and the branches of the database are the ones the site shows', () => {
  for (const point of RECEPTION_POINTS) {
    const row = new RegExp(`\\('${point.code}', '[^']+',[^\\n]*, ${point.available}, \\d+\\)`);
    assert.match(schema, row, `${point.code}: a row of warehouses with is_active = ${point.available}`);
  }
  // The address customers copy into a store's checkout: the same characters in both places.
  for (const value of [MIAMI_ADDRESS.phone, MIAMI_ADDRESS.line1, MIAMI_ADDRESS.line2, MIAMI_ADDRESS.postalCode]) {
    assert.ok(schema.includes(`'${value}'`), `the MIA row has ${value}`);
  }
  for (const branch of BRANCHES) {
    assert.ok(schema.includes(`('${branch.id}', '${branch.city}', `), `${branch.id}: a row of branches`);
  }
});

/** The statements of the schema, without comments: split at the semicolons that are not inside a text. */
const statementsOf = (sql: string): Array<string> => {
  const statements: Array<string> = [];
  let current = '';
  let inText = false;
  for (let at = 0; at < sql.length; at += 1) {
    const char = sql[at];
    if (!inText && char === '-' && sql[at + 1] === '-') {
      // A comment runs to the end of its line.
      at = sql.indexOf('\n', at);
      if (at === -1) break;
      current += '\n';
    } else if (char === "'") {
      inText = !inText;
      current += char;
    } else if (char === ';' && !inText) {
      statements.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  return [...statements, current.trim()].filter(Boolean);
};

test('the schema can be run again: nothing is created or changed without a guard', () => {
  const statements = statementsOf(schema);
  assert.ok(statements.length > 40);

  for (const statement of statements) {
    const head = statement.split('\n')[0];
    if (statement.startsWith('CREATE TABLE')) assert.match(head, /^CREATE TABLE IF NOT EXISTS /, head);
    else if (statement.startsWith('CREATE INDEX')) assert.match(head, /^CREATE INDEX IF NOT EXISTS /, head);
    else if (statement.startsWith('CREATE')) assert.match(head, /^CREATE OR REPLACE VIEW /, head);
    else if (statement.startsWith('INSERT')) assert.match(statement, /ON CONFLICT \(\w+\) DO NOTHING$/, head);
    else if (statement.startsWith('ALTER TABLE')) {
      assert.match(statement, /ADD COLUMN IF NOT EXISTS|ALTER COLUMN \w+ DROP NOT NULL$/, head);
    } else assert.match(head, /^COMMENT ON (TABLE|VIEW|COLUMN) /, head);
  }
  // Nothing in it removes or rewrites what a database already holds.
  assert.equal(/\b(DROP TABLE|DROP COLUMN|TRUNCATE|DELETE FROM|UPDATE \w+ SET)\b/.test(statements.join(';')), false);
});
