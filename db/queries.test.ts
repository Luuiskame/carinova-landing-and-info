// db/queries.sql is a contract nothing runs yet, so nothing would notice it going out of shape.
// These tests read it as text and hold it to what its header promises: one statement per name, one
// comment line per parameter, an audit row for every action, and the same list of statements in
// docs/DATABASE.md.
//
// What the statements do is checked against a real PostgreSQL by `node db/check.mjs`, which also
// fails if one of them is never run (docs/DATABASE.md → "Checking a change").
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const file = readFileSync(new URL('./queries.sql', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const guide = readFileSync(new URL('../docs/DATABASE.md', import.meta.url), 'utf8');

interface Statement {
  name: string;
  /** The `-- $1 …` lines, in the order they are written. */
  parameters: Array<number>;
  sql: string;
}

const statements: Array<Statement> = file
  .split(/^-- name: /m)
  .slice(1)
  .map((block) => {
    const [name, ...rest] = block.split('\n');
    return {
      name: name.trim(),
      parameters: rest.flatMap((line) => {
        const parameter = /^-- \$(\d+) \S/.exec(line);
        return parameter ? [Number(parameter[1])] : [];
      }),
      sql: rest
        .filter((line) => !line.startsWith('--'))
        .join('\n')
        .trim(),
    };
  });

const named = (name: string): Statement => {
  const statement = statements.find((candidate) => candidate.name === name);
  assert.ok(statement, `db/queries.sql has no statement named ${name}`);
  return statement;
};

/** The numbers after `$` that a statement uses, each once, in order. */
const placeholdersOf = (sql: string): Array<number> =>
  [...new Set(Array.from(sql.matchAll(/\$(\d+)/g), (match) => Number(match[1])))].sort((a, b) => a - b);

test('every statement has its own name', () => {
  assert.ok(statements.length >= 35);
  for (const { name } of statements) assert.match(name, /^[a-z][a-z_]*$/, name);
  const names = statements.map((statement) => statement.name);
  assert.deepEqual(names, [...new Set(names)], 'a name is used twice');
});

test('each one is a single statement, with every value as a parameter', () => {
  for (const { name, sql } of statements) {
    // Outside texts ('…'), the only semicolon is the one that ends it.
    const bare = sql.replace(/'[^']*'/g, "''");
    assert.equal(bare.indexOf(';'), bare.length - 1, `${name}: one statement, ended by its semicolon`);
    // Whatever arrives from outside comes with a cast, so every driver sends it the same way.
    for (const use of bare.matchAll(/\$\d+(?!\d)(?!::)/g)) {
      assert.fail(`${name}: ${use[0]} is used without a cast (write ${use[0]}::text, ::int…)`);
    }
  }
});

test('each parameter has its comment line, in order and with no gaps', () => {
  for (const { name, parameters, sql } of statements) {
    const used = placeholdersOf(sql);
    assert.deepEqual(
      used,
      used.map((_, index) => index + 1),
      `${name}: its parameters are $1 to $${used.length}`
    );
    assert.deepEqual(parameters, used, `${name}: one "-- $n …" line per parameter, in order`);
  }
});

/** Statements that write and leave no row in audit_log, each with the reason it does not. */
const UNLOGGED: Record<string, string> = {
  create_first_superuser: 'there is nobody yet to name as the one who did it',
  issue_staff_login_code: 'signing in is not an action of the back office',
  redeem_staff_login_code: 'signing in is not an action of the back office',
  end_staff_session: 'signing out is not an action of the back office',
  add_invoice_item: 'the lines of a draft: the record says the total when the invoice is issued',
  remove_invoice_item: 'the lines of a draft: the record says the total when the invoice is issued',
};

test('every action that changes something writes its row in audit_log', () => {
  const writes = statements.filter(({ sql }) => /\b(INSERT INTO|UPDATE|DELETE FROM)\b/.test(sql));
  assert.ok(writes.length >= 20);
  for (const { name, sql } of writes) {
    const logged = /INSERT INTO audit_log \(staff_id, action, entity, entity_id, details\)/.test(sql);
    assert.equal(logged, !(name in UNLOGGED), `${name}: ${UNLOGGED[name] ?? 'it must write its audit row'}`);
  }
  for (const name of Object.keys(UNLOGGED)) named(name);

  // The action is "<thing>.<verb>" and the entity is a table of the schema.
  const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');
  for (const { name, sql } of writes) {
    for (const [, action, entity] of sql.matchAll(/SELECT (?:\$1::int|NULL), '([^']+)', '([^']+)'/g)) {
      assert.match(action, /^[a-z]+\.[a-z]+$/, `${name}: ${action}`);
      assert.ok(schema.includes(`CREATE TABLE IF NOT EXISTS ${entity} (`), `${name}: no table ${entity}`);
    }
  }
});

test('whoever acts has to be an active member of the team, and a super user to manage the team', () => {
  const acting = statements.filter(({ sql }) => /\bactor\b/.test(sql) || /staff_users s\b.*\$1::int/s.test(sql));
  assert.ok(acting.length >= 18);
  for (const { name, sql } of acting) {
    assert.match(sql, /\$1::int AND (s\.)?is_active/, `${name}: the actor is checked to be active`);
  }
  for (const name of ['create_staff_user', 'set_staff_role', 'deactivate_staff_user']) {
    assert.match(named(name).sql, /is_active AND role = 'superuser'/, `${name}: asks for a super user`);
  }
  // The customer's own statement starts from their session, never from a number the page sends.
  assert.match(named('report_payment').sql, /customer_sessions s JOIN customers c[\s\S]+c\.status = 'active'/);
  assert.match(named('report_payment').sql, /i\.customer_id = owner\.id/);
});

test('docs/DATABASE.md lists the same statements', () => {
  const start = guide.indexOf('## The statements of the back office');
  const end = guide.indexOf('### Using them from code');
  assert.ok(start !== -1 && end > start, 'the section of the statements is in docs/DATABASE.md');
  const listed = Array.from(guide.slice(start, end).matchAll(/^\| `([a-z_]+)`/gm), (match) => match[1]);
  assert.deepEqual(
    [...listed].sort(),
    statements.map((statement) => statement.name).sort(),
    'the table of statements in docs/DATABASE.md and db/queries.sql differ'
  );
  assert.ok(
    guide.includes(`| \`db/queries.sql\``) && guide.includes(`${statements.length} named statements`),
    `docs/DATABASE.md says how many statements there are (${statements.length})`
  );
});
