import assert from 'node:assert/strict';
import { test } from 'node:test';
import { memoryStore, sqlStore, type Query } from './store.ts';

const data = {
  country: 'NI',
  firstName: 'Paul',
  lastName: 'Palacios',
  email: 'paul@example.com',
  phone: '+50588552956',
  address1: 'Barrio Central',
  address2: '',
  city: 'Bluefields',
  state: 'Costa Caribe Sur (RACCS)',
  postalCode: '',
};
const customer = { termsAcceptedAt: new Date('2026-11-10T12:00:00Z'), locale: 'es' as const };
const limits = { per15Minutes: 3, perDay: 10 };
const row = {
  code: 'CNV-00007',
  first_name: 'Paul',
  last_name: 'Palacios',
  email: 'paul@example.com',
  phone: '+50588552956',
  country: 'NI',
  address_line1: 'Barrio Central',
  address_line2: null,
  city: 'Bluefields',
  state: 'Costa Caribe Sur (RACCS)',
  postal_code: null,
  locale: 'en',
  created_at: new Date('2026-11-10T12:00:00Z'),
};

/** A stand-in for the database that records the statements and answers with the given rows. */
const recorder = (...answers: Array<Array<Record<string, unknown>>>) => {
  const calls: Array<{ text: string; params: Array<unknown> }> = [];
  const query: Query = async (text, params) => {
    calls.push({ text, params });
    return answers.shift() ?? [];
  };
  return { calls, store: sqlStore(query) };
};

/** The highest $n a statement uses. */
const placeholders = (statement: string) =>
  Math.max(0, ...Array.from(statement.matchAll(/\$(\d+)/g), (match) => Number(match[1])));

test('every statement is sent with exactly the values it has placeholders for', async () => {
  const { calls, store } = recorder(
    [{ code: 'CNV-00007', first_name: 'Paul', last_name: 'Palacios', is_new: true, signed_in: true }],
    [{ first_name: 'Paul' }],
    [row],
    [row],
    []
  );
  await store.create(data, { ...customer, session: { tokenHash: 'a'.repeat(64), days: 30 } });
  await store.issueLoginCode({ email: data.email, codeHash: 'b'.repeat(64), minutes: 10, limits });
  await store.redeemLoginCode(data.email, 'b'.repeat(64), 5, { tokenHash: 'c'.repeat(64), days: 30 });
  await store.findAccount('c'.repeat(64));
  await store.endSession('c'.repeat(64));

  assert.equal(calls.length, 5);
  for (const { text, params } of calls) {
    assert.equal(params.length, placeholders(text), text.trim().split('\n')[0]);
    assert.equal(params.includes(undefined), false, 'undefined is not a value the database takes');
  }
});

test('what people type travels as parameters, never pasted into the SQL', async () => {
  const { calls, store } = recorder([], []);
  await store.create({ ...data, firstName: "Robert'); DROP TABLE customers;--" }, customer).catch(() => undefined);

  for (const { text } of calls) assert.equal(text.includes('DROP TABLE'), false);
  assert.ok(calls[0].params.includes("Robert'); DROP TABLE customers;--"));
});

test('a customer row becomes the account the customer sees', async () => {
  const { store } = recorder([row]);
  assert.deepEqual(await store.findAccount('c'.repeat(64)), {
    code: 'CNV-00007',
    firstName: 'Paul',
    lastName: 'Palacios',
    email: 'paul@example.com',
    phone: '+50588552956',
    country: 'NI',
    address1: 'Barrio Central',
    address2: '',
    city: 'Bluefields',
    state: 'Costa Caribe Sur (RACCS)',
    postalCode: '',
    locale: 'en',
    createdAt: '2026-11-10T12:00:00.000Z',
  });

  const none = recorder([]);
  assert.equal(await none.store.findAccount('c'.repeat(64)), null);
  assert.equal(await none.store.redeemLoginCode(data.email, 'x', 5, { tokenHash: 'y', days: 30 }), null);
  assert.equal(await none.store.issueLoginCode({ email: data.email, codeHash: 'x', minutes: 10, limits }), null);
});

test('when the insert loses a race, the existing customer is read back', async () => {
  const { calls, store } = recorder(
    [],
    [{ code: 'CNV-00003', first_name: 'Paul', last_name: 'Palacios', is_new: false, signed_in: false }]
  );
  assert.deepEqual(await store.create(data, customer), {
    code: 'CNV-00003',
    firstName: 'Paul',
    lastName: 'Palacios',
    isNew: false,
    signedIn: false,
  });
  assert.equal(calls.length, 2);
  // No session was asked for: the statement gets NULL, which opens none.
  assert.equal(calls[0].params[12], null);
});

test('the in-memory store opens a session only for the customer it has just created', async () => {
  const store = memoryStore();
  const first = await store.create(data, { ...customer, session: { tokenHash: 'one', days: 30 } });
  const again = await store.create(data, { ...customer, session: { tokenHash: 'two', days: 30 } });

  assert.deepEqual([first.isNew, first.signedIn], [true, true]);
  assert.deepEqual([again.isNew, again.signedIn, again.code], [false, false, first.code]);
  assert.equal((await store.findAccount('one'))?.code, first.code);
  assert.equal(await store.findAccount('two'), null);

  await store.endSession('one');
  assert.equal(await store.findAccount('one'), null);
});
