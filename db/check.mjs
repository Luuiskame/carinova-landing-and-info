// Checks the database as a whole against a real PostgreSQL: db/schema.sql, every named statement of
// db/queries.sql and the statements of the website's Worker (worker/store.ts).
//
// The PostgreSQL is PGlite: it runs inside this process, in memory, and is gone when the script
// ends. Nothing outside the process is touched: no server, no network, no .env.
//
//   npm install --no-save @electric-sql/pglite      (once: it is not a dependency of the project)
//   node db/check.mjs
//
//   --pglite <dir>   use a copy of the package that is somewhere else (the folder with its package.json)
//   --from <ref>     the commit whose db/schema.sql stands for "the database as it is today"
//                    (default: HEAD). The upgrade of a database that already has a customer is
//                    checked from that schema to the one in the working copy.
//
// On a machine that is short of memory, `node --liftoff-only db/check.mjs` compiles PGlite cheaply.
//
// Run it after any change to db/schema.sql, db/queries.sql or the statements of worker/store.ts,
// and add to it whatever the change is about: it fails if a statement of db/queries.sql is never
// run. What two people do at the same moment cannot be seen here (one process, one connection):
// that is `node db/neon.mjs scratch`. docs/DATABASE.md → "Checking a change".
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const option = (name) => {
  const at = process.argv.indexOf(name);
  return at === -1 ? undefined : process.argv[at + 1];
};

let PGlite;
try {
  const elsewhere = option('--pglite');
  ({ PGlite } = await import(
    elsewhere ? pathToFileURL(path.join(elsewhere, 'dist/index.js')).href : '@electric-sql/pglite'
  ));
} catch {
  console.error(
    'PGlite is not installed. Run `npm install --no-save @electric-sql/pglite` (it changes neither package.json\n' +
      'nor the lock file), or pass the folder of a copy you already have: node db/check.mjs --pglite <dir>'
  );
  process.exit(2);
}

const { sqlStore } = await import(pathToFileURL(path.join(root, 'worker/store.ts')).href);
const schema = await readFile(path.join(root, 'db/schema.sql'), 'utf8');
const queriesFile = await readFile(path.join(root, 'db/queries.sql'), 'utf8');

/** db/schema.sql as it was at a commit, or nothing when it cannot be read (no git, no such file). */
const schemaAt = (ref) => {
  try {
    return execFileSync('git', ['show', `${ref}:db/schema.sql`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return undefined;
  }
};

/** The named statements of db/queries.sql. */
const queries = Object.fromEntries(
  queriesFile
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
const placeholders = (text) => Math.max(0, ...Array.from(text.matchAll(/\$(\d+)/g), (match) => Number(match[1])));

let checks = 0;
const ok = (name) => {
  checks += 1;
  console.log(`ok  ${name}`);
};

const storeOf = (db) => sqlStore(async (text, params) => (await db.query(text, params)).rows);
const one = async (db, text, params = []) => (await db.query(text, params)).rows[0];
const count = async (db, table, where = 'true') =>
  (await one(db, `select count(*)::int as n from ${table} where ${where}`)).n;

/** The statements that were run, to see at the end that none was left out. */
const ran = new Set();

/** Runs a named statement and returns its rows; it must be given exactly its parameters. */
const run = async (db, name, params = []) => {
  const text = queries[name];
  assert.ok(text, `db/queries.sql has no statement named ${name}`);
  ran.add(name);
  assert.equal(params.length, placeholders(text), `${name}: ${placeholders(text)} parameters expected`);
  return (await db.query(text, params)).rows;
};

const paul = {
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
const customer = { termsAcceptedAt: new Date('2026-11-09T20:00:00.000Z'), locale: 'es' };
const limits = { per15Minutes: 3, perDay: 10 };

// ───────── 1. A database made by the schema as it was, with a customer who is signed in.
{
  const ref = option('--from') ?? 'HEAD';
  const previousSchema = schemaAt(ref);
  if (previousSchema === undefined) {
    console.log(`--  upgrade: db/schema.sql could not be read at ${ref}; this part was skipped`);
  } else {
    const db = new PGlite();
    console.log((await one(db, 'select version()')).version);
    await db.exec(previousSchema);
    // Written by hand, with the columns the table has always had, so that this part does not depend
    // on what the Worker's own statements need today.
    await db.query(
      `insert into customers (email, first_name, last_name, phone, country, address_line1, city, state, terms_accepted_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, now())`,
      [paul.email, paul.firstName, paul.lastName, paul.phone, paul.country, paul.address1, paul.city, paul.state]
    );
    await db.query(
      "insert into customer_sessions (token_hash, customer_id, expires_at) values ('old-session', 1, now() + interval '30 days')"
    );
    const before = await one(db, 'select * from customers');

    await db.exec(schema);
    await db.exec(schema); // running it again must be harmless

    const after = await one(db, 'select * from customers');
    for (const [column, value] of Object.entries(before)) assert.deepEqual(after[column], value, column);
    assert.deepEqual(
      [after.status, after.account_type, after.company_name, after.created_by_staff_id],
      ['active', 'personal', null, null]
    );
    ok(`upgrade from ${ref}: the customer that was there keeps every value and has the defaults of the new columns`);

    const store = storeOf(db);
    assert.equal((await store.findAccount('old-session')).code, 'CNV-00001');
    assert.deepEqual(await store.findActivity('old-session', 50), { packages: [], invoices: [] });
    assert.deepEqual(await store.issueLoginCode({ email: paul.email, codeHash: 'h', minutes: 10, limits }), {
      firstName: 'Paul',
    });
    assert.equal((await store.redeemLoginCode(paul.email, 'h', 5, { tokenHash: 't2', days: 30 })).code, 'CNV-00001');
    ok('upgrade: their session still works, they can sign in again and their account has no packages or invoices');

    assert.equal(await count(db, 'warehouses'), 2);
    assert.equal(await count(db, 'branches'), 2);
    assert.equal(await count(db, 'staff_roles'), 1);
    ok('upgrade: the reference rows are written once, however many times the schema runs');
    await db.close();
  }
}

// ───────── 2. A new database: structure and constraints.
const db = new PGlite();
await db.exec(schema);
await db.exec(schema);
{
  const tables = (
    await db.query(
      "select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by 1"
    )
  ).rows.map((row) => row.table_name);
  assert.deepEqual(tables, [
    'audit_log',
    'branches',
    'customer_login_codes',
    'customer_sessions',
    'customers',
    'invoice_items',
    'invoices',
    'package_events',
    'packages',
    'payments',
    'staff_login_codes',
    'staff_roles',
    'staff_sessions',
    'staff_users',
    'warehouses',
  ]);
  const silent = (
    await db.query(
      "select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind in ('r','v') and obj_description(c.oid) is null"
    )
  ).rows;
  assert.deepEqual(silent, [], 'every table and view says what it is');
  ok('a new database has the fifteen tables and the view, each with its comment');

  const mia = await one(db, "select * from warehouses where code = 'MIA'");
  assert.deepEqual(
    [mia.is_active, mia.address_line1, mia.address_line2, mia.postal_code, mia.phone],
    [true, '8611 NW 72ND St', 'Ste G9', '33195-2311', '786 687 9611']
  );
  const lax = await one(db, "select * from warehouses where code = 'LAX'");
  assert.deepEqual([lax.is_active, lax.address_line1], [false, null]);
  await assert.rejects(
    db.query("update warehouses set is_active = true where code = 'LAX'"),
    /warehouses_active_has_address/
  );
  ok('Miami is open with its address; Los Ángeles is listed, closed, and cannot open without an address');

  // (The checks on customers are tried at the end: an insert that fails still takes a customer number.)
  const reject = async (text, constraint) => assert.rejects(db.query(text), new RegExp(constraint), text);
  await reject(
    "insert into staff_users (email, full_name, role) values ('Boss@Carinova.test','B','superuser')",
    'staff_users_email_lowercase'
  );
  await reject(
    "insert into staff_users (email, full_name, role) values ('x@carinova.test','X','admin')",
    'staff_users_role_fkey'
  );
  await reject(
    "insert into staff_users (email, full_name, role, is_active) values ('x@carinova.test','X','superuser', false)",
    'staff_users_inactive_has_date'
  );
  ok('the team: the checks on e-mail, role and deactivation hold');
}

// ───────── 3. The back office, with the statements of db/queries.sql.
const [boss] = await run(db, 'create_first_superuser', ['Owner@Carinova.test', ' Dueña Carinova ']);
assert.deepEqual([boss.email, boss.full_name, boss.role], ['owner@carinova.test', 'Dueña Carinova', 'superuser']);
assert.deepEqual(await run(db, 'create_first_superuser', ['other@carinova.test', 'Otra']), []);
ok('the first super user is created once; the statement does nothing afterwards');

const [clerk] = await run(db, 'create_staff_user', [boss.id, 'ana@carinova.test', 'Ana Operaciones', 'superuser']);
assert.equal(clerk.email, 'ana@carinova.test');
assert.deepEqual(
  await run(db, 'create_staff_user', [boss.id, 'ana@carinova.test', 'Ana', 'superuser']),
  [],
  'same e-mail twice'
);
assert.deepEqual(
  await run(db, 'create_staff_user', [boss.id, 'x@carinova.test', 'X', 'cashier']),
  [],
  'a role that does not exist'
);
assert.deepEqual(await run(db, 'create_staff_user', [9999, 'x@carinova.test', 'X', 'superuser']), [], 'nobody');
assert.equal(await count(db, 'audit_log', "action = 'staff.create'"), 1);
ok('a super user creates a team account, and it is on record; nobody else can');

// A second role, as the back office would add one, to see roles being assigned.
await db.query(
  "insert into staff_roles (code, name, description) values ('operator', 'Operador', 'Registra paquetes')"
);
assert.equal((await run(db, 'set_staff_role', [boss.id, clerk.id, 'operator']))[0].role, 'operator');
assert.deepEqual(
  await run(db, 'create_staff_user', [clerk.id, 'y@carinova.test', 'Y', 'operator']),
  [],
  'an operator cannot create accounts'
);
assert.deepEqual(
  await run(db, 'set_staff_role', [boss.id, boss.id, 'operator']),
  [],
  'the last super user keeps the role'
);
assert.deepEqual(
  await run(db, 'deactivate_staff_user', [boss.id, boss.id]),
  [],
  'the last super user cannot be deactivated'
);
assert.equal((await run(db, 'list_staff_users')).length, 2);
ok('roles can be assigned; the last super user cannot lose the role or be deactivated');

// Signing in to the back office.
assert.deepEqual(await run(db, 'issue_staff_login_code', ['ana@carinova.test', 'hash-1', 10, 3, 10]), [
  { full_name: 'Ana Operaciones' },
]);
assert.deepEqual(await run(db, 'issue_staff_login_code', ['nobody@carinova.test', 'hash-x', 10, 3, 10]), []);
assert.deepEqual(await run(db, 'redeem_staff_login_code', ['ana@carinova.test', 'wrong', 5, 'staff-token', 1]), []);
const [signedIn] = await run(db, 'redeem_staff_login_code', ['ana@carinova.test', 'hash-1', 5, 'staff-token', 1]);
assert.deepEqual([signedIn.email, signedIn.role], ['ana@carinova.test', 'operator']);
assert.deepEqual(
  await run(db, 'redeem_staff_login_code', ['ana@carinova.test', 'hash-1', 5, 'staff-token-2', 1]),
  [],
  'a code works once'
);
assert.equal((await run(db, 'find_staff_by_session', ['staff-token']))[0].id, clerk.id);
assert.ok((await one(db, 'select last_login_at from staff_users where id = $1', [clerk.id])).last_login_at);
// Deactivating ends the sessions at once.
assert.equal((await run(db, 'deactivate_staff_user', [boss.id, clerk.id]))[0].email, 'ana@carinova.test');
assert.deepEqual(await run(db, 'find_staff_by_session', ['staff-token']), []);
assert.deepEqual(
  await run(db, 'issue_staff_login_code', ['ana@carinova.test', 'hash-2', 10, 3, 10]),
  [],
  'no code for a deactivated account'
);
await run(db, 'end_staff_session', ['staff-token']);
ok('the team signs in with a one-time code; a deactivated account loses its sessions and gets no code');

// Customers: one from the website, one created by the team.
const store = storeOf(db);
const web = await store.create(paul, { ...customer, session: { tokenHash: 'paul-session', days: 30 } });
assert.deepEqual([web.code, web.isNew, web.signedIn], ['CNV-00001', true, true]);
const [made] = await run(db, 'create_customer_by_staff', [
  boss.id,
  'Compras@Repuestos.test',
  'Paula',
  'Palacios',
  '+50588550000',
  'NI',
  'Km 5 carretera norte',
  null,
  'Managua',
  'Managua',
  '',
  'es',
  'business',
  'Repuestos del Caribe, S. A.',
]);
assert.deepEqual([made.code, made.email], ['CNV-00002', 'compras@repuestos.test']);
const company = await one(db, "select * from customers where code = 'CNV-00002'");
assert.deepEqual(
  [
    company.source,
    company.email_verified_at,
    company.terms_accepted_at,
    company.account_type,
    company.company_name,
    company.created_by_staff_id,
    company.postal_code,
  ],
  ['staff', null, null, 'business', 'Repuestos del Caribe, S. A.', boss.id, null]
);
const someone = ['P', 'P', '+1', 'NI', 'x', null, 'y', 'z', null, 'es'];
assert.deepEqual(
  await run(db, 'create_customer_by_staff', [boss.id, 'compras@repuestos.test', ...someone, 'personal', null]),
  [],
  'same e-mail twice'
);
assert.deepEqual(
  await run(db, 'create_customer_by_staff', [boss.id, 'otra@empresa.test', ...someone, 'business', ' ']),
  [],
  'a company without a name'
);
assert.equal((await run(db, 'list_customers', ['', 10, 0])).length, 2);
assert.equal((await run(db, 'list_customers', ['repuestos', 10, 0]))[0].code, 'CNV-00002');
assert.equal((await run(db, 'list_customers', ['cnv-00001', 10, 0]))[0].email, 'paul@example.com');
await run(db, 'update_customer_contact', [boss.id, 'CNV-00002', '+50588551111', null, 'Bodega 4', null, null, null]);
const moved = await one(db, "select phone, address_line1, address_line2, city from customers where code = 'CNV-00002'");
assert.deepEqual(moved, {
  phone: '+50588551111',
  address_line1: 'Km 5 carretera norte',
  address_line2: 'Bodega 4',
  city: 'Managua',
});
ok(
  'the team creates an account (not confirmed, no terms yet, numbered by the database), finds customers and changes their contact details'
);

// The customer the team created can sign in with a code, like anyone.
assert.deepEqual(await store.issueLoginCode({ email: 'compras@repuestos.test', codeHash: 'c1', minutes: 10, limits }), {
  firstName: 'Paula',
});
assert.equal(
  (await store.redeemLoginCode('compras@repuestos.test', 'c1', 5, { tokenHash: 'company-session', days: 30 })).code,
  'CNV-00002'
);

// Packages.
const receive = (code, description, extra = {}) =>
  run(db, 'receive_package', [
    boss.id,
    code,
    extra.warehouse ?? 'MIA',
    description,
    extra.service ?? 'air',
    extra.basis ?? 'weight',
    extra.weight ?? 3.4,
    extra.length ?? null,
    extra.width ?? null,
    extra.height ?? null,
    extra.pieces ?? 1,
    extra.store ?? 'Nike',
    extra.carrier ?? 'UPS',
    extra.tracking ?? '1Z999AA10123456784',
    'branch' in extra ? extra.branch : 'bluefields',
    extra.delivery ?? 'pickup',
    extra.value ?? null,
    extra.notes ?? 'Caja abierta al llegar',
  ]);
const [shoes] = await receive('CNV-00001', 'Zapatos Nike, caja mediana');
assert.equal(shoes.code, 'PKG-000001');
assert.deepEqual(await receive('CNV-00001', 'A Los Ángeles', { warehouse: 'LAX' }), [], 'a warehouse that is not open');
assert.deepEqual(await receive('CNV-99999', 'De nadie'), [], 'no such customer');
assert.deepEqual(await receive('CNV-00001', 'Sucursal que no existe', { branch: 'leon' }), [], 'no such branch');
const [pots] = await receive('CNV-00001', 'Juego de ollas', {
  service: 'sea',
  weight: 18,
  pieces: 2,
  store: 'Walmart',
  carrier: null,
  tracking: null,
  branch: null,
  delivery: 'home',
  notes: null,
});
const [parts] = await receive('CNV-00002', 'Repuestos de motor', {
  service: 'sea',
  basis: 'volume',
  weight: null,
  length: 48,
  width: 40,
  height: 72,
});
assert.deepEqual([pots.code, parts.code], ['PKG-000002', 'PKG-000003'], 'a refused package takes no number');
assert.equal(await count(db, 'package_events'), 3);
ok(
  'receiving a package writes the package, its first event and the record; a closed warehouse, an unknown customer or branch receive nothing'
);

assert.deepEqual(
  await run(db, 'set_package_status', [boss.id, 'PKG-000001', 'in_transit', 'Salió de Miami hacia Managua']),
  [{ code: 'PKG-000001', status: 'in_transit', customer_id: 1 }]
);
assert.deepEqual(await run(db, 'set_package_status', [boss.id, 'PKG-000001', 'processing', null]), [], 'not backwards');
assert.deepEqual(
  await run(db, 'set_package_status', [boss.id, 'PKG-000001', 'in_transit', null]),
  [],
  'not to the same status'
);
await run(db, 'set_package_status', [boss.id, 'PKG-000001', 'ready', null]);
await run(db, 'set_package_status', [boss.id, 'PKG-000001', 'delivered', null]);
assert.deepEqual(
  await run(db, 'set_package_status', [boss.id, 'PKG-000001', 'cancelled', null]),
  [],
  'a delivered package is finished'
);
const delivered = await one(
  db,
  "select status, shipped_at, ready_at, delivered_at from packages where code = 'PKG-000001'"
);
assert.ok(delivered.status === 'delivered' && delivered.shipped_at && delivered.ready_at && delivered.delivered_at);
assert.deepEqual(
  (await db.query('select status from package_events where package_id = 1 order by created_at, id')).rows.map(
    (row) => row.status
  ),
  ['received', 'in_transit', 'ready', 'delivered']
);
await assert.rejects(db.query("update packages set status = 'lost' where id = 1"), /packages_status_known/);
ok('a package moves forward only, each move leaving its event and its date; a finished package does not move');

assert.deepEqual(
  await run(db, 'correct_package_status', [boss.id, 'PKG-000001', 'ready', '  ']),
  [],
  'a correction needs its reason'
);
assert.deepEqual(
  await run(db, 'correct_package_status', [boss.id, 'PKG-000001', 'ready', 'Se marcó entregado por error']),
  [{ code: 'PKG-000001', status: 'ready' }]
);
const corrected = await one(db, "select status, ready_at, delivered_at from packages where code = 'PKG-000001'");
assert.ok(corrected.status === 'ready' && corrected.ready_at && corrected.delivered_at === null);
assert.equal(await count(db, 'package_events', 'package_id = 1'), 5, 'the mistake stays in the history');
await run(db, 'update_package_measures', [boss.id, 'PKG-000002', 18.5, 20, 16, 12, null, null]);
assert.deepEqual(
  await one(db, "select weight_lb::float as w, pieces, rate_basis from packages where code = 'PKG-000002'"),
  { w: 18.5, pieces: 2, rate_basis: 'weight' }
);
assert.equal((await run(db, 'list_packages', ['', 10, 0, ''])).length, 3);
assert.deepEqual(
  (await run(db, 'list_packages', ['received', 10, 0, ''])).map((item) => item.code),
  ['PKG-000003', 'PKG-000002']
);
assert.deepEqual(
  (await run(db, 'list_packages', ['', 10, 0, 'CNV-00001'])).map((item) => item.code),
  ['PKG-000002', 'PKG-000001']
);
const jsonOf = (value) => (typeof value === 'string' ? JSON.parse(value) : value);
const [shoesNow] = await run(db, 'find_package', ['PKG-000001']);
assert.deepEqual(
  [shoesNow.status, shoesNow.customer_code, shoesNow.warehouse, shoesNow.branch, shoesNow.internal_notes],
  ['ready', 'CNV-00001', 'MIA', 'bluefields', 'Caja abierta al llegar']
);
assert.deepEqual(
  jsonOf(shoesNow.events).map((event) => [event.status, event.note, event.staff]),
  [
    ['received', null, 'Dueña Carinova'],
    ['in_transit', 'Salió de Miami hacia Managua', 'Dueña Carinova'],
    ['ready', null, 'Dueña Carinova'],
    ['delivered', null, 'Dueña Carinova'],
    ['ready', 'Se marcó entregado por error', 'Dueña Carinova'],
  ]
);
assert.deepEqual(jsonOf(shoesNow.invoices), []);
assert.deepEqual(await run(db, 'find_package', ['PKG-999999']), []);
ok(
  'a mistake is corrected with a reason that stays on record; measures can be completed; the team lists packages by status and by customer, and reads one whole'
);

// Invoices and payments.
const [draft] = await run(db, 'create_invoice', [boss.id, 'CNV-00001', 'Podés pagar al retirar.', null]);
assert.equal(draft.number, 'INV-000001');
assert.deepEqual(await run(db, 'issue_invoice', [boss.id, 'INV-000001']), [], 'an invoice without lines is not issued');
const [line] = await run(db, 'add_invoice_item', [
  boss.id,
  'INV-000001',
  'PKG-000001',
  'shipping',
  'Envío aéreo, 3.4 lb × US$6.50',
  3.4,
  6.5,
]);
assert.equal(Number(line.amount_usd), 22.1);
assert.deepEqual(
  await run(db, 'add_invoice_item', [boss.id, 'INV-000001', 'PKG-000003', 'shipping', 'De otro cliente', 1, 5]),
  [],
  "another customer's package"
);
const [extra] = await run(db, 'add_invoice_item', [boss.id, 'INV-000001', null, 'other', 'Cargo de prueba', 1, 4]);
assert.deepEqual(await run(db, 'remove_invoice_item', [boss.id, extra.id]), [{ id: extra.id }]);
await run(db, 'add_invoice_item', [boss.id, 'INV-000001', null, 'discount', 'Descuento de bienvenida', 1, -2.1]);
await assert.rejects(
  run(db, 'add_invoice_item', [boss.id, 'INV-000001', null, 'discount', 'Descuento mal escrito', 1, 2]),
  /invoice_items_discount_is_negative/
);
await assert.rejects(
  run(db, 'add_invoice_item', [boss.id, 'INV-000001', null, 'shipping', 'Precio negativo', 1, -2]),
  /invoice_items_discount_is_negative/
);
const totalsOf = async (number) => {
  const row = await one(
    db,
    'select t.total_usd::float as total, t.paid_usd::float as paid, t.pending_usd::float as pending, t.balance_usd::float as balance, t.payment_state as state from invoices i join invoice_totals t on t.invoice_id = i.id where i.number = $1',
    [number]
  );
  return [row.total, row.paid, row.pending, row.balance, row.state];
};
assert.deepEqual(await totalsOf('INV-000001'), [20, 0, 0, 20, 'draft']);
// The customer does not see a draft, and nobody pays one.
assert.deepEqual((await store.findActivity('paul-session', 50)).invoices, []);
assert.deepEqual(
  await run(db, 'record_payment', [boss.id, 'INV-000001', 20, 'cash', null, null, null]),
  [],
  'no payment towards a draft'
);
assert.deepEqual(
  await run(db, 'report_payment', ['paul-session', 'INV-000001', 20, 'bank_transfer', null, null, null]),
  [],
  'nor one reported by its customer'
);

const [issuedNow] = await run(db, 'issue_invoice', [boss.id, 'INV-000001']);
assert.deepEqual([issuedNow.number, Number(issuedNow.total_usd)], ['INV-000001', 20]);
assert.deepEqual(
  await run(db, 'add_invoice_item', [boss.id, 'INV-000001', null, 'other', 'Tarde', 1, 1]),
  [],
  'an issued invoice takes no more lines'
);
assert.deepEqual(await run(db, 'remove_invoice_item', [boss.id, line.id]), [], 'nor loses them');
assert.deepEqual(await totalsOf('INV-000001'), [20, 0, 0, 20, 'unpaid']);
ok(
  'an invoice is a draft the customer does not see until it is issued; its lines add up, and an issued invoice no longer changes'
);

assert.deepEqual(
  await run(db, 'record_payment', [boss.id, 'INV-000001', 25, 'cash', null, null, null]),
  [],
  'more than what is owed'
);
assert.deepEqual(
  await run(db, 'record_payment', [9999, 'INV-000001', 8, 'cash', null, null, null]),
  [],
  'nobody records a payment'
);
// The customer says they paid, from their account: only towards an invoice of their own.
const transfer = ['bank_transfer', 'BAC 884120', 'receipts/inv-000001/1.jpg', '2026-11-12T09:00:00Z'];
assert.deepEqual(
  await run(db, 'report_payment', ['company-session', 'INV-000001', 8, ...transfer]),
  [],
  "not towards another customer's invoice"
);
assert.deepEqual(
  await run(db, 'report_payment', ['no-such-session', 'INV-000001', 8, ...transfer]),
  [],
  'not without a session'
);
const [first] = await run(db, 'report_payment', ['paul-session', 'INV-000001', 8, ...transfer]);
assert.equal(first.status, 'pending');
assert.deepEqual(await one(db, 'select reported_by, recorded_by_staff_id from payments where id = $1', [first.id]), {
  reported_by: 'customer',
  recorded_by_staff_id: null,
});
assert.deepEqual(
  await run(db, 'report_payment', ['paul-session', 'INV-000001', 12.01, 'bank_transfer', null, null, null]),
  [],
  'not more than what is left to cover, counting what is already waiting'
);
assert.deepEqual(await totalsOf('INV-000001'), [20, 0, 8, 20, 'in_review']);
assert.equal((await run(db, 'list_pending_payments', [10]))[0].invoice_number, 'INV-000001');
ok('a customer reports a payment only towards their own issued invoice, within what it owes; it waits like any other');

const [confirmed] = await run(db, 'confirm_payment', [boss.id, first.id]);
assert.deepEqual([confirmed.number, Number(confirmed.paid_usd), Number(confirmed.balance_usd)], ['INV-000001', 8, 12]);
assert.deepEqual(await run(db, 'confirm_payment', [boss.id, first.id]), [], 'a payment is confirmed once');
assert.deepEqual(await totalsOf('INV-000001'), [20, 8, 0, 12, 'partial']);
const [bounced] = await run(db, 'record_payment', [
  boss.id,
  'INV-000001',
  12,
  'bank_transfer',
  'BAC 990001',
  null,
  null,
]);
assert.deepEqual(await run(db, 'reject_payment', [boss.id, bounced.id, '']), [], 'a rejection needs its reason');
assert.equal(
  (await run(db, 'reject_payment', [boss.id, bounced.id, 'La transferencia no aparece en el banco']))[0].id,
  bounced.id
);
assert.deepEqual(await totalsOf('INV-000001'), [20, 8, 0, 12, 'partial']);
const [rest] = await run(db, 'record_payment', [boss.id, 'INV-000001', 12, 'cash', null, null, null]);
// Two payments waiting that together are more than the balance: only one can be confirmed.
const [twice] = await run(db, 'record_payment', [boss.id, 'INV-000001', 12, 'card', null, null, null]);
await run(db, 'confirm_payment', [boss.id, rest.id]);
assert.deepEqual(await run(db, 'confirm_payment', [boss.id, twice.id]), [], 'an invoice is not paid twice');
assert.deepEqual(await totalsOf('INV-000001'), [20, 20, 12, 0, 'paid']);
await run(db, 'reject_payment', [boss.id, twice.id, 'Duplicado']);
assert.deepEqual(
  await run(db, 'void_invoice', [boss.id, 'INV-000001', 'Error']),
  [],
  'an invoice with confirmed money is not voided'
);
// A payment confirmed by mistake is taken back: it stays on record, rejected, and stops counting.
assert.deepEqual(
  await run(db, 'reverse_payment', [boss.id, rest.id, ' ']),
  [],
  'taking a payment back needs its reason'
);
assert.deepEqual(
  await run(db, 'reverse_payment', [boss.id, bounced.id, 'No era confirmado']),
  [],
  'only a confirmed payment is taken back'
);
const [undone] = await run(db, 'reverse_payment', [boss.id, rest.id, 'Era de otra factura']);
assert.deepEqual([undone.number, Number(undone.paid_usd), Number(undone.balance_usd)], ['INV-000001', 8, 12]);
assert.deepEqual(await run(db, 'reverse_payment', [boss.id, rest.id, 'Otra vez']), [], 'and only once');
assert.deepEqual(await totalsOf('INV-000001'), [20, 8, 0, 12, 'partial']);
assert.deepEqual(await one(db, 'select status, rejection_reason from payments where id = $1', [rest.id]), {
  status: 'rejected',
  rejection_reason: 'Era de otra factura',
});
assert.deepEqual(
  (await run(db, 'list_audit_log', ['payments', String(rest.id)])).map((entry) => entry.action),
  ['payment.reverse', 'payment.confirm', 'payment.record']
);
const [again] = await run(db, 'record_payment', [boss.id, 'INV-000001', 12, 'cash', null, null, null]);
await run(db, 'confirm_payment', [boss.id, again.id]);
assert.deepEqual(await totalsOf('INV-000001'), [20, 20, 0, 0, 'paid']);
// The invoice's own row refuses what must never happen, whoever asks and however.
await assert.rejects(db.query('update invoices set paid_usd = 25 where id = 1'), /invoices_paid_within_total/);
await assert.rejects(
  db.query("update invoices set status = 'void', voided_at = now(), void_reason = 'x' where id = 1"),
  /invoices_void_is_unpaid/
);
await assert.rejects(db.query("update invoices set status = 'draft' where id = 1"), /invoices_issued_has_total/);
assert.deepEqual(await run(db, 'find_invoice_drift'), []);
// A payment that was reviewed cannot go back to pending, and a rejection keeps its reason.
await assert.rejects(
  db.query(`update payments set status = 'pending' where id = ${first.id}`),
  /payments_review_complete/
);
await assert.rejects(
  db.query(`update payments set rejection_reason = null where id = ${bounced.id}`),
  /payments_rejection_has_reason/
);
ok(
  'a payment waits until the team confirms or rejects it; the invoice goes unpaid → in review → partial → paid and never above its total; a confirmation made by mistake is taken back'
);

const [mistake] = await run(db, 'create_invoice', [boss.id, 'CNV-00001', null, '2026-12-01T00:00:00Z']);
await run(db, 'add_invoice_item', [
  boss.id,
  mistake.number,
  'PKG-000002',
  'shipping',
  'Envío marítimo, 18.5 lb × US$2.50',
  18.5,
  2.5,
]);
await run(db, 'issue_invoice', [boss.id, mistake.number]);
assert.deepEqual(await run(db, 'void_invoice', [boss.id, mistake.number, ' ']), [], 'voiding needs its reason');
assert.equal(
  (await run(db, 'void_invoice', [boss.id, mistake.number, 'Se facturó dos veces']))[0].number,
  'INV-000002'
);
assert.deepEqual(await totalsOf('INV-000002'), [46.25, 0, 0, 46.25, 'void']);
assert.deepEqual(
  await run(db, 'record_payment', [boss.id, mistake.number, 46.25, 'cash', null, null, null]),
  [],
  'no payment towards a void invoice'
);
assert.deepEqual(
  (await run(db, 'list_invoices', ['', 10, 0, ''])).map((invoice) => [invoice.number, invoice.payment_state]),
  [
    ['INV-000002', 'void'],
    ['INV-000001', 'paid'],
  ]
);
assert.equal((await run(db, 'list_invoices', ['paid', 10, 0, ''])).length, 1);
assert.equal((await run(db, 'list_invoices', ['', 10, 0, 'CNV-00002'])).length, 0);
// One invoice, whole, as the team reads it: the ids to act on, the reasons, who reviewed.
const [whole] = await run(db, 'find_invoice', ['INV-000001']);
assert.deepEqual(
  [whole.status, whole.payment_state, Number(whole.total_usd), Number(whole.paid_usd), whole.customer_code],
  ['issued', 'paid', 20, 20, 'CNV-00001']
);
assert.deepEqual(
  jsonOf(whole.items).map((item) => [item.id, item.kind, item.amount_usd, item.package]),
  [
    [line.id, 'shipping', 22.1, 'PKG-000001'],
    [jsonOf(whole.items)[1].id, 'discount', -2.1, null],
  ]
);
assert.deepEqual(
  jsonOf(whole.payments).map((payment) => [
    payment.id,
    payment.status,
    payment.reported_by,
    payment.reviewed_by,
    payment.rejection_reason,
  ]),
  [
    [first.id, 'confirmed', 'customer', 'Dueña Carinova', null],
    [bounced.id, 'rejected', 'staff', 'Dueña Carinova', 'La transferencia no aparece en el banco'],
    [rest.id, 'rejected', 'staff', 'Dueña Carinova', 'Era de otra factura'],
    [twice.id, 'rejected', 'staff', 'Dueña Carinova', 'Duplicado'],
    [again.id, 'confirmed', 'staff', 'Dueña Carinova', null],
  ]
);
assert.equal(jsonOf(whole.payments)[0].proof_key, 'receipts/inv-000001/1.jpg');
assert.equal((await run(db, 'find_invoice', [mistake.number]))[0].void_reason, 'Se facturó dos veces');
assert.deepEqual(await run(db, 'find_invoice', ['INV-999999']), []);
assert.deepEqual(jsonOf((await run(db, 'find_package', ['PKG-000001']))[0].invoices), ['INV-000001']);
assert.deepEqual(
  jsonOf((await run(db, 'find_package', ['PKG-000002']))[0].invoices),
  [],
  'a void invoice does not count as charging for a package'
);
const [paulNow] = await run(db, 'find_customer', ['CNV-00001']);
assert.deepEqual(
  [paulNow.email, paulNow.status, paulNow.source, paulNow.open_packages, Number(paulNow.balance_usd)],
  ['paul@example.com', 'active', 'web', 2, 0]
);
assert.deepEqual(await run(db, 'find_customer', ['CNV-99999']), []);
assert.ok(
  (await run(db, 'list_audit_log', ['invoices', '1'])).some(
    (entry) => entry.action === 'invoice.issue' && entry.staff_name === 'Dueña Carinova'
  )
);
assert.deepEqual(
  (await run(db, 'list_audit_log', ['payments', String(first.id)])).map((entry) => [entry.action, entry.staff_name]),
  [
    ['payment.confirm', 'Dueña Carinova'],
    ['payment.report', null],
  ]
);
ok(
  'an invoice issued by mistake is voided with its reason and takes no payment; the team reads a customer, a package and an invoice whole; every action is in the audit log'
);

// A payment marked confirmed behind the statements' back is found by the health check.
await db.query(
  "insert into payments (invoice_id, amount_usd, method, status, reviewed_by_staff_id, reviewed_at) values (1, 1, 'cash', 'confirmed', $1, now())",
  [boss.id]
);
assert.deepEqual(
  (await run(db, 'find_invoice_drift')).map((row) => row.number),
  ['INV-000001']
);
await db.query('delete from payments where invoice_id = 1 and amount_usd = 1');
assert.deepEqual(await run(db, 'find_invoice_drift'), []);
ok('the health check finds an invoice whose amounts were changed without the statements, and nothing otherwise');

// ───────── 4. What the customer sees in "Mi cuenta" (worker/store.ts → findActivity).
{
  const mine = await store.findActivity('paul-session', 50);
  assert.deepEqual(
    mine.packages.map((item) => [item.reference, item.status]),
    [
      ['PKG-000002', 'received'],
      ['PKG-000001', 'ready'],
    ]
  );
  const [, shoesNow] = mine.packages;
  assert.deepEqual(
    {
      ...shoesNow,
      receivedAt: 'x',
      shippedAt: 'x',
      readyAt: 'x',
      events: shoesNow.events.map((event) => [event.status, event.note]),
    },
    {
      reference: 'PKG-000001',
      description: 'Zapatos Nike, caja mediana',
      store: 'Nike',
      carrier: 'UPS',
      carrierTracking: '1Z999AA10123456784',
      service: 'air',
      status: 'ready',
      warehouse: 'MIA',
      branch: 'bluefields',
      deliveryMethod: 'pickup',
      weightLb: 3.4,
      pieces: 1,
      receivedAt: 'x',
      shippedAt: 'x',
      readyAt: 'x',
      deliveredAt: null,
      events: [
        ['received', ''],
        ['in_transit', 'Salió de Miami hacia Managua'],
        ['ready', ''],
        ['delivered', ''],
        ['ready', 'Se marcó entregado por error'],
      ],
    }
  );
  assert.match(shoesNow.receivedAt, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/);
  assert.equal(
    JSON.stringify(mine).includes('Caja abierta al llegar'),
    false,
    "the team's notes never leave the database"
  );
  assert.deepEqual(mine.packages[0].deliveryMethod, 'home');
  assert.deepEqual(mine.packages[0].branch, '');

  assert.deepEqual(
    mine.invoices.map((invoice) => [
      invoice.number,
      invoice.state,
      invoice.total,
      invoice.paid,
      invoice.pending,
      invoice.balance,
    ]),
    [
      ['INV-000002', 'void', 46.25, 0, 0, 46.25],
      ['INV-000001', 'paid', 20, 20, 0, 0],
    ]
  );
  const paid = mine.invoices[1];
  assert.deepEqual(paid.items, [
    { description: 'Envío aéreo, 3.4 lb × US$6.50', amount: 22.1, packageReference: 'PKG-000001' },
    { description: 'Descuento de bienvenida', amount: -2.1, packageReference: '' },
  ]);
  assert.deepEqual(
    paid.payments.map((payment) => [payment.amount, payment.method, payment.status, payment.reference]),
    [
      [8, 'bank_transfer', 'confirmed', 'BAC 884120'],
      [12, 'bank_transfer', 'rejected', 'BAC 990001'],
      [12, 'cash', 'rejected', ''],
      [12, 'card', 'rejected', ''],
      [12, 'cash', 'confirmed', ''],
    ]
  );
  assert.equal(paid.notes, 'Podés pagar al retirar.');
  assert.equal(JSON.stringify(mine).includes('receipts/'), false, 'nor does the place where a receipt is kept');
  ok(
    'a customer sees their packages with their history and their issued invoices with lines and payments, and nothing internal'
  );

  const theirs = await store.findActivity('company-session', 50);
  assert.deepEqual([theirs.packages.map((item) => item.reference), theirs.invoices], [['PKG-000003'], []]);
  assert.equal(await store.findActivity('no-such-session', 50), null);
  assert.equal((await store.findActivity('paul-session', 1)).packages.length, 1);
  ok('each customer sees only their own; without a session there is nothing; the lists stop at the limit');

  // One more invoice that is owed, to see what a suspended customer can no longer do.
  const [owed] = await run(db, 'create_invoice', [boss.id, 'CNV-00001', null, null]);
  await run(db, 'add_invoice_item', [boss.id, owed.number, null, 'storage', 'Almacenaje, una semana', 1, 5]);
  await run(db, 'issue_invoice', [boss.id, owed.number]);
  const report = (session) => run(db, 'report_payment', [session, owed.number, 5, 'bank_transfer', null, null, null]);

  // Suspending an account ends its sessions and its sign-in.
  assert.deepEqual(await run(db, 'set_customer_status', [boss.id, 'CNV-00001', 'suspended']), [
    { code: 'CNV-00001', status: 'suspended' },
  ]);
  assert.equal(await store.findAccount('paul-session'), null);
  assert.equal(await store.findActivity('paul-session', 50), null);
  assert.equal(await store.issueLoginCode({ email: paul.email, codeHash: 'h9', minutes: 10, limits }), null);
  await db.query(
    "insert into customer_sessions (token_hash, customer_id, expires_at) values ('planted', 1, now() + interval '1 day')"
  );
  assert.equal(
    await store.findAccount('planted'),
    null,
    'even a session that somehow exists does not open a suspended account'
  );
  assert.deepEqual(await report('planted'), [], 'nor report a payment');
  await run(db, 'set_customer_status', [boss.id, 'CNV-00001', 'active']);
  assert.deepEqual(await store.issueLoginCode({ email: paul.email, codeHash: 'h10', minutes: 10, limits }), {
    firstName: 'Paul',
  });
  assert.equal((await report('planted'))[0].status, 'pending');
  ok(
    'a suspended customer is signed out, cannot sign in, sees nothing and reports nothing; giving the account back restores it'
  );
}

// The checks on customers, last: an insert that fails still takes a customer number.
{
  const insert = (columns, values) =>
    `insert into customers (email, first_name, last_name, phone, country, address_line1, city, state, ${columns}) values ('a@b.co','A','B','+1','NI','x','y','z', ${values})`;
  await assert.rejects(db.query(insert('account_type', "'business'")), /customers_business_has_name/);
  await assert.rejects(db.query(insert('status', "'gone'")), /customers_status_known/);
  await assert.rejects(db.query(insert('account_type', "'club'")), /customers_account_type_known/);
  await assert.rejects(
    db.query("update customers set email = 'Paul@Example.com' where id = 1"),
    /customers_email_lowercase/
  );
  await assert.rejects(
    db.query("delete from customers where code = 'CNV-00001'"),
    /packages_customer_id_fkey|violates foreign key/
  );
  ok(
    'customers: the checks on status, kind of account and e-mail hold, and a customer with packages cannot be deleted'
  );
}

// Every statement of db/queries.sql was run.
const never = Object.keys(queries).filter((name) => !ran.has(name));
assert.deepEqual(never, [], 'statements of db/queries.sql that were not exercised');
console.log(`\n${checks} groups of checks passed; ${Object.keys(queries).length} named statements exercised`);
await db.close();
