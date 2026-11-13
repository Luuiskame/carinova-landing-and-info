// Talks to the database the website uses: DATABASE_URL, from the environment or from .env (which,
// on the developer's machine, is the production database, with real customers). It never prints the
// URL, a secret or anything a customer wrote: names of tables and counts only.
//
//   node db/neon.mjs status    what is there: the tables, how many rows each has, the next customer number
//   node db/neon.mjs scratch   db/schema.sql, statements of db/queries.sql and of the Worker, run over
//                              the real driver in a schema made for the test and dropped at the end.
//                              It is where two people acting at the same moment are checked. The real
//                              tables are not read or written: their row counts are compared before
//                              and after, and the run fails if they differ.
//   node db/neon.mjs apply     runs db/schema.sql on the real tables (schema "public"): it creates what
//                              is missing and changes no row. It fails if a table that was there ends
//                              with a different number of rows or the next customer number moved.
//
// `scratch` is the only way to try SQL against the real server: never create, change or delete rows
// of the real tables to test something. docs/DATABASE.md → "Checking a change".
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseEnv } from 'node:util';

const root = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(path.join(root, 'package.json'));
const { neon } = require('@neondatabase/serverless');

const envFile = path.join(root, '.env');
const url = (
  process.env.DATABASE_URL ?? (existsSync(envFile) ? parseEnv(readFileSync(envFile, 'utf8')).DATABASE_URL : '')
)?.trim();
if (!url) {
  console.error('DATABASE_URL is not set: neither in the environment nor in .env');
  process.exit(2);
}
const sql = neon(url);
const [action] = process.argv.slice(2);

/** The statements of a .sql file, without comments: split at the semicolons that are not inside a text. */
const statementsOf = (text) => {
  const statements = [];
  let current = '';
  let inText = false;
  for (let at = 0; at < text.length; at += 1) {
    const char = text[at];
    if (!inText && char === '-' && text[at + 1] === '-') {
      at = text.indexOf('\n', at);
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

const schemaStatements = statementsOf(readFileSync(path.join(root, 'db/schema.sql'), 'utf8'));

const tablesOf = (schema) =>
  sql.query('SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = $1 ORDER BY 1', [
    schema,
  ]);

/** How many rows each table of public has: numbers only. */
const publicCounts = async () => {
  const counts = {};
  for (const { table_name: table, table_type: type } of await tablesOf('public')) {
    if (type !== 'BASE TABLE') continue;
    counts[table] = (await sql.query(`SELECT count(*)::int AS n FROM public."${table}"`))[0].n;
  }
  return counts;
};

const nextCustomerNumber = async () => {
  const [identity] = await sql.query("SELECT pg_get_serial_sequence('public.customers', 'id') AS seq");
  if (!identity?.seq) return null;
  const [next] = await sql.query(`SELECT last_value, is_called FROM ${identity.seq}`);
  return next.is_called ? Number(next.last_value) + 1 : Number(next.last_value);
};

const status = async () => {
  const [server] = await sql.query("SELECT current_database() AS db, current_setting('server_version') AS version");
  console.log('connected:', server);
  const tables = await tablesOf('public');
  console.log(
    'in public:',
    tables.map((table) => `${table.table_name}${table.table_type === 'VIEW' ? ' (view)' : ''}`).join(', ') ||
      '(nothing)'
  );
  console.log('rows:', JSON.stringify(await publicCounts()));
  if (tables.some((table) => table.table_name === 'customers')) {
    console.log('next customer number:', await nextCustomerNumber());
  }
  if (tables.some((table) => table.table_name === 'staff_users')) {
    const [team] = await sql.query(
      "SELECT count(*) FILTER (WHERE is_active AND role = 'superuser')::int AS n FROM public.staff_users"
    );
    console.log('active super users:', team.n);
  }
  const leftovers = await sql.query(
    "SELECT nspname FROM pg_namespace WHERE nspname LIKE 'carinova_check_%' ORDER BY 1"
  );
  console.log('leftover test schemas:', leftovers.map((row) => row.nspname).join(', ') || '(none)');
};

if (action === 'status') {
  await status();
} else if (action === 'apply') {
  const before = { counts: await publicCounts(), next: await nextCustomerNumber() };
  for (const statement of schemaStatements) {
    await sql.query(statement);
  }
  console.log(`ran the ${schemaStatements.length} statements of db/schema.sql on public`);
  const after = { counts: await publicCounts(), next: await nextCustomerNumber() };
  for (const [table, rows] of Object.entries(before.counts)) {
    assert.equal(after.counts[table], rows, `${table}: the number of rows changed`);
  }
  if (before.next !== null) assert.equal(after.next, before.next, 'the next customer number changed');
  console.log('the tables that were there have the same number of rows as before, and the next customer number too');
  await status();
} else if (action === 'scratch') {
  const before = { counts: await publicCounts(), next: await nextCustomerNumber() };
  const schema = `carinova_check_${Date.now()}`;
  // Each call is one request and one transaction of its own, as in the Worker; the first statement of
  // the transaction points it at the test's schema, so no table name has to be rewritten.
  const run = async (text, params = []) => {
    const [, rows] = await sql.transaction([sql.query(`SET LOCAL search_path TO ${schema}`), sql.query(text, params)]);
    return rows;
  };
  const queries = Object.fromEntries(
    readFileSync(path.join(root, 'db/queries.sql'), 'utf8')
      .split(/^-- name: /m)
      .slice(1)
      .map((block) => {
        const [name, ...rest] = block.split('\n');
        const text = rest
          .filter((line) => !line.startsWith('--'))
          .join('\n')
          .trim()
          .replace(/;\s*$/, '');
        return [name.trim(), text];
      })
  );
  const named = (name, params = []) => run(queries[name], params);
  const { sqlStore } = await import(pathToFileURL(path.join(root, 'worker/store.ts')).href);
  const store = sqlStore(run);
  const went = (result) => result.status === 'fulfilled' && result.value.length === 1;
  let failed = false;

  try {
    await sql.query(`CREATE SCHEMA ${schema}`);
    for (const statement of schemaStatements) await run(statement);
    for (const statement of schemaStatements) await run(statement); // and again
    const made = await tablesOf(schema);
    assert.equal(made.filter((table) => table.table_type === 'BASE TABLE').length, 15);
    assert.equal(made.filter((table) => table.table_type === 'VIEW').length, 1);
    console.log(`ok  ${schema}: db/schema.sql ran twice over the real driver: 15 tables and the view`);

    // Made-up people on a domain that cannot receive mail; nothing is ever sent from here.
    const [boss] = await named('create_first_superuser', ['prueba@example.invalid', 'Prueba Carinova']);
    const data = {
      country: 'NI',
      firstName: 'Prueba',
      lastName: 'Carinova',
      email: 'cliente@example.invalid',
      phone: '+50588880000',
      address1: 'Prueba automática',
      address2: '',
      city: 'Managua',
      state: 'Managua',
      postalCode: '',
    };
    const created = await store.create(data, {
      termsAcceptedAt: new Date(),
      locale: 'es',
      session: { tokenHash: 'session-a', days: 30 },
    });
    assert.deepEqual([created.code, created.signedIn], ['CNV-00001', true]);

    const receive = (description) =>
      named('receive_package', [
        boss.id,
        'CNV-00001',
        'MIA',
        description,
        'air',
        'weight',
        4,
        null,
        null,
        null,
        1,
        null,
        null,
        null,
        'managua',
        'pickup',
        null,
        null,
      ]);
    const [[first], [second]] = await Promise.all([receive('Paquete uno'), receive('Paquete dos')]);
    assert.notEqual(first.code, second.code);
    console.log(
      'ok  two packages received at the same moment get two references:',
      [first.code, second.code].sort().join(', ')
    );

    // Two people move the same package at the same moment: the same move happens once.
    const moves = await Promise.all([
      named('set_package_status', [boss.id, first.code, 'in_transit', null]),
      named('set_package_status', [boss.id, first.code, 'in_transit', null]),
    ]);
    assert.equal(moves.filter((rows) => rows.length === 1).length, 1);
    const [{ n: events }] = await run('SELECT count(*)::int AS n FROM package_events WHERE package_id = $1', [
      first.id,
    ]);
    assert.equal(events, 2);
    console.log('ok  the same move asked for twice at once happens once: one event, not two');

    // An invoice of US$20 and two payments of US$12 waiting: confirmed at the same moment, only one counts.
    const [invoice] = await named('create_invoice', [boss.id, 'CNV-00001', null, null]);
    await named('add_invoice_item', [boss.id, invoice.number, first.code, 'shipping', 'Envío de prueba', 1, 20]);
    await named('issue_invoice', [boss.id, invoice.number]);
    const [one] = await named('record_payment', [boss.id, invoice.number, 12, 'cash', null, null, null]);
    // The other one is reported by the customer, from their session, over the real driver.
    const [two] = await named('report_payment', ['session-a', invoice.number, 8, 'bank_transfer', null, null, null]);
    assert.deepEqual([one.status, two.status], ['pending', 'pending']);
    assert.deepEqual(
      await named('report_payment', ['session-a', invoice.number, 0.01, 'bank_transfer', null, null, null]),
      [],
      'nothing is left to cover with what is waiting'
    );
    const [three] = await named('record_payment', [boss.id, invoice.number, 12, 'card', null, null, null]);
    const settled = await Promise.allSettled([
      named('confirm_payment', [boss.id, one.id]),
      named('confirm_payment', [boss.id, three.id]),
    ]);
    assert.equal(settled.filter(went).length, 1, 'exactly one of the two confirmations went through');
    const refused = settled.find((result) => !went(result));
    const how =
      refused.status === 'rejected'
        ? `refused by the check (${/invoices_\w+/.exec(String(refused.reason?.message))?.[0] ?? 'an error'})`
        : 'no row';
    const totalsOf = async (number) =>
      (
        await run(
          'SELECT i.paid_usd::float AS paid, t.pending_usd::float AS pending, t.payment_state AS state FROM invoices i JOIN invoice_totals t ON t.invoice_id = i.id WHERE i.number = $1',
          [number]
        )
      )[0];
    assert.deepEqual(await totalsOf(invoice.number), { paid: 12, pending: 20, state: 'in_review' });
    assert.deepEqual(await named('find_invoice_drift'), []);
    console.log(
      `ok  two payments confirmed at the same moment, together more than the invoice: one counts, the other is ${how}`
    );

    // The same payment confirmed twice at once counts once.
    await named('reject_payment', [boss.id, refused === settled[0] ? one.id : three.id, 'Prueba']);
    const twice = await Promise.allSettled([
      named('confirm_payment', [boss.id, two.id]),
      named('confirm_payment', [boss.id, two.id]),
    ]);
    assert.equal(twice.filter(went).length, 1);
    assert.deepEqual(await totalsOf(invoice.number), { paid: 20, pending: 0, state: 'paid' });
    assert.deepEqual(await named('find_invoice_drift'), []);
    console.log('ok  one payment confirmed twice at once counts once; the invoice ends paid, with nothing out of step');

    // Both confirmed payments taken back at the same moment: neither subtraction is lost.
    const kept = refused === settled[0] ? three.id : one.id;
    const undone = await Promise.allSettled([
      named('reverse_payment', [boss.id, kept, 'Prueba']),
      named('reverse_payment', [boss.id, two.id, 'Prueba']),
    ]);
    assert.equal(undone.filter(went).length, 2);
    assert.deepEqual(await totalsOf(invoice.number), { paid: 0, pending: 0, state: 'unpaid' });
    assert.deepEqual(await named('find_invoice_drift'), []);
    const [back] = await named('record_payment', [boss.id, invoice.number, 20, 'cash', null, null, null]);
    await named('confirm_payment', [boss.id, back.id]);
    console.log('ok  two confirmed payments taken back at once: the invoice owes everything again, and is then paid');

    // Voiding and confirming at the same moment: never a void invoice with money on it.
    const [other] = await named('create_invoice', [boss.id, 'CNV-00001', null, null]);
    await named('add_invoice_item', [boss.id, other.number, second.code, 'shipping', 'Envío de prueba', 1, 10]);
    await named('issue_invoice', [boss.id, other.number]);
    const [money] = await named('record_payment', [boss.id, other.number, 10, 'cash', null, null, null]);
    await Promise.allSettled([
      named('void_invoice', [boss.id, other.number, 'Prueba']),
      named('confirm_payment', [boss.id, money.id]),
    ]);
    const [end] = await run('SELECT status, paid_usd::float AS paid FROM invoices WHERE number = $1', [other.number]);
    assert.ok(
      (end.status === 'void' && end.paid === 0) || (end.status === 'issued' && end.paid === 10),
      JSON.stringify(end)
    );
    assert.deepEqual(await named('find_invoice_drift'), []);
    console.log(
      `ok  voiding and confirming at once: the invoice ends ${end.status === 'void' ? 'void with nothing paid' : 'paid and not void'}, never both`
    );

    // What the team reads of one invoice and one package, over the real driver.
    const [whole] = await named('find_invoice', [invoice.number]);
    assert.deepEqual([whole.payment_state, Number(whole.total_usd), Number(whole.paid_usd)], ['paid', 20, 20]);
    assert.equal(whole.items.length, 1);
    assert.equal(whole.items[0].amount_usd, 20);
    assert.equal(whole.payments.filter((payment) => payment.status === 'confirmed').length, 1);
    const [parcel] = await named('find_package', [first.code]);
    assert.deepEqual([parcel.status, parcel.events.length, parcel.invoices], ['in_transit', 2, [invoice.number]]);
    const [owner] = await named('find_customer', ['CNV-00001']);
    assert.equal(owner.open_packages, 2);
    assert.equal((await named('list_packages', ['', 10, 0, 'CNV-00001'])).length, 2);
    assert.equal((await named('list_invoices', ['paid', 10, 0, ''])).length >= 1, true);
    console.log('ok  the team reads one invoice, one package and one customer whole, and the lists by customer');

    // What the customer's account gets, over the real driver (JSON columns, numerics, dates).
    const mine = await store.findActivity('session-a', 50);
    assert.equal(mine.packages.length, 2);
    assert.equal(mine.invoices.length, 2);
    const shipped = mine.packages.find((item) => item.reference === first.code);
    assert.deepEqual(
      [shipped.status, shipped.weightLb, shipped.warehouse, shipped.branch, shipped.events.length],
      ['in_transit', 4, 'MIA', 'managua', 2]
    );
    assert.match(shipped.receivedAt, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/);
    const settledInvoice = mine.invoices.find((item) => item.number === invoice.number);
    assert.deepEqual(
      [settledInvoice.state, settledInvoice.total, settledInvoice.paid, settledInvoice.balance],
      ['paid', 20, 20, 0]
    );
    assert.equal(typeof settledInvoice.items[0].amount, 'number');
    assert.equal(await store.findActivity('no-such-session', 50), null);
    console.log(
      'ok  the account of the customer reads its packages and invoices through the real driver: numbers are numbers, dates are ISO'
    );
  } catch (error) {
    failed = true;
    console.error('FAILED:', error.message);
  } finally {
    await sql.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    const after = { counts: await publicCounts(), next: await nextCustomerNumber() };
    assert.deepEqual(after, before, 'the real tables changed');
    console.log(
      `the test schema is dropped; the real tables are as they were: ${JSON.stringify(after.counts)}, next customer number ${after.next}`
    );
  }
  if (failed) process.exit(1);
} else {
  console.log('usage: node db/neon.mjs status | scratch | apply');
  process.exit(2);
}
