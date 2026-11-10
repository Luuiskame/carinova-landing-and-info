import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleApi, type Deps } from './api.ts';
import type { Email, SendResult } from './signup/mailer.ts';
import { memoryStore } from './signup/store.ts';
import { sealToken } from './signup/token.ts';

const ORIGIN = 'https://carinova.test';
const SECRET = 'a-secret-for-the-tests-that-is-long-enough';

const form = {
  country: 'NI',
  firstName: 'Paul',
  lastName: 'Palacios',
  email: 'paul@example.com',
  phone: '8855 2956',
  address1: 'Barrio Central, de la iglesia morava 1 c. al sur',
  address2: '',
  city: 'Bluefields',
  state: 'Costa Caribe Sur (RACCS)',
  postalCode: '',
  terms: true,
  contact_time: '',
};

/** The API with a recording mailer and an in-memory store. */
const setup = (overrides: Partial<Deps> = {}, sendResult: SendResult = { ok: true }) => {
  const sent: Array<Email> = [];
  const logs: Array<string> = [];
  const deps: Deps = {
    tokenSecret: SECRET,
    mailer: {
      async send(email) {
        sent.push(email);
        return sendResult;
      },
    },
    store: memoryStore(),
    log: (message) => logs.push(message),
    ...overrides,
  };
  const post = async (path: string, body: unknown, headers: Record<string, string> = {}) => {
    const response = await handleApi(
      new Request(`${ORIGIN}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: ORIGIN, ...headers },
        body: typeof body === 'string' ? body : JSON.stringify(body),
      }),
      deps
    );
    return { status: response.status, body: await response.json() };
  };
  return { sent, logs, post };
};

/** The confirmation link of an e-mail, as the customer would open it. */
const linkIn = (email: Email) => new URL(/https:\/\/\S+/.exec(email.text)![0]);
const tokenIn = (email: Email) => linkIn(email).searchParams.get('token');

test('sign-up, confirmation and welcome', async () => {
  const { sent, logs, post } = setup();

  assert.deepEqual(await post('/api/signup', form), { status: 200, body: { ok: true } });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'paul@example.com');
  assert.match(sent[0].subject, /Confirma tu correo/);
  const link = linkIn(sent[0]);
  assert.equal(link.origin + link.pathname, `${ORIGIN}/registro/confirmar`);

  assert.deepEqual(await post('/api/signup/confirm', { token: tokenIn(sent[0]) }), {
    status: 200,
    body: { ok: true, isNew: true, customer: { code: 'CNV-00001', firstName: 'Paul', lastName: 'Palacios' } },
  });
  assert.equal(sent.length, 2);
  assert.equal(sent[1].to, 'paul@example.com');
  assert.equal(sent[1].subject, 'Tu casillero Carinova está listo: CNV-00001');
  assert.ok(sent[1].text.includes('Carinova Paul') && sent[1].text.includes('Palacios Aéreo'));
  assert.deepEqual(logs, []);
});

test('opening the link again returns the same customer and sends nothing', async () => {
  const { sent, post } = setup();
  await post('/api/signup', form);
  const token = tokenIn(sent[0]);

  await post('/api/signup/confirm', { token });
  const again = await post('/api/signup/confirm', { token });

  assert.deepEqual(again.body, {
    ok: true,
    isNew: false,
    customer: { code: 'CNV-00001', firstName: 'Paul', lastName: 'Palacios' },
  });
  assert.equal(sent.length, 2);
});

test('signing up again with the same e-mail leads back to the existing customer', async () => {
  const { sent, post } = setup();
  await post('/api/signup', form);
  await post('/api/signup/confirm', { token: tokenIn(sent[0]) });

  await post('/api/signup', { ...form, firstName: 'Pablo', email: 'PAUL@example.com' });
  const second = await post('/api/signup/confirm', { token: tokenIn(sent[2]) });

  assert.deepEqual(second.body, {
    ok: true,
    isNew: false,
    customer: { code: 'CNV-00001', firstName: 'Paul', lastName: 'Palacios' },
  });
  assert.equal(sent.length, 3, 'no second welcome');
});

test('each new customer gets the next number', async () => {
  const { sent, post } = setup();
  await post('/api/signup', form);
  await post('/api/signup', { ...form, email: 'ana@example.com', firstName: 'Ana' });
  const [first, second] = [tokenIn(sent[0]), tokenIn(sent[1])];

  assert.equal((await post('/api/signup/confirm', { token: second })).body.customer.code, 'CNV-00001');
  assert.equal((await post('/api/signup/confirm', { token: first })).body.customer.code, 'CNV-00002');
});

test('the team is notified when an inbox is configured', async () => {
  const { sent, post } = setup({ notifyTo: 'equipo@carinova.test' });
  await post('/api/signup', form);
  await post('/api/signup/confirm', { token: tokenIn(sent[0]) });

  assert.equal(sent.length, 3);
  assert.equal(sent[2].to, 'equipo@carinova.test');
  assert.equal(sent[2].replyTo, 'paul@example.com');
  assert.equal(sent[2].subject, 'Nuevo casillero CNV-00001: Paul Palacios');
});

test('with waitUntil, the e-mails go out after the response', async () => {
  const pending: Array<Promise<unknown>> = [];
  const { sent, post } = setup({ waitUntil: (work) => pending.push(work) });
  await post('/api/signup', form);

  const response = await post('/api/signup/confirm', { token: tokenIn(sent[0]) });
  assert.equal(response.body.isNew, true);
  assert.equal(pending.length, 1);
  await Promise.all(pending);
  assert.equal(sent.length, 2);
});

test('an invalid form is answered with the fields to fix, and nothing is sent', async () => {
  const { sent, post } = setup();
  const response = await post('/api/signup', { ...form, email: 'paul@', state: 'Florida', terms: false });

  assert.equal(response.status, 422);
  assert.equal(response.body.error, 'validation');
  assert.deepEqual(Object.keys(response.body.fields).sort(), ['email', 'state', 'terms']);
  assert.equal(sent.length, 0);
});

test('a filled honeypot gets a success and no e-mail', async () => {
  const { sent, post } = setup();
  assert.deepEqual(await post('/api/signup', { ...form, contact_time: 'mañana' }), { status: 200, body: { ok: true } });
  assert.equal(sent.length, 0);
});

test('an address Resend rejects becomes an error on the e-mail field', async () => {
  const { post } = setup({}, { ok: false, reason: 'invalid_recipient', detail: 'Resend 422 validation_error' });
  const response = await post('/api/signup', form);

  assert.equal(response.status, 422);
  assert.deepEqual(Object.keys(response.body.fields), ['email']);
});

test('when the e-mail cannot be sent the answer is 503 and the reason is logged', async () => {
  const { logs, post } = setup({}, { ok: false, reason: 'failed', detail: 'Resend 403: domain is not verified' });

  assert.deepEqual(await post('/api/signup', form), { status: 503, body: { ok: false, error: 'unavailable' } });
  assert.match(logs[0], /domain is not verified/);
});

test('without its configuration the API answers 503 and names what is missing', async () => {
  for (const [missing, name] of [
    [{ store: undefined }, 'DATABASE_URL'],
    [{ mailer: undefined }, 'RESEND_API_KEY and EMAIL_FROM'],
    [{ tokenSecret: undefined }, 'SIGNUP_TOKEN_SECRET'],
    [{ tokenSecret: 'short' }, 'SIGNUP_TOKEN_SECRET'],
  ] as const) {
    const { sent, logs, post } = setup(missing);
    assert.equal((await post('/api/signup', form)).status, 503, name);
    assert.ok(logs[0].includes(name), logs[0]);
    assert.equal(sent.length, 0);
  }

  const { logs, post } = setup({ store: undefined });
  assert.equal((await post('/api/signup/confirm', { token: 'x' })).status, 503);
  assert.ok(logs[0].includes('DATABASE_URL'));
});

test('tokens that are not ours, or too old, are refused', async () => {
  const { post } = setup();
  for (const token of ['', 'abc', undefined, 42]) {
    assert.deepEqual(await post('/api/signup/confirm', { token }), {
      status: 400,
      body: { ok: false, error: 'invalid_token' },
    });
  }

  const threeDaysAgo = Date.now() - 72 * 60 * 60 * 1000;
  const old = await sealToken({ ...form, acceptedAt: new Date(threeDaysAgo).toISOString() }, SECRET, {
    now: threeDaysAgo,
  });
  assert.deepEqual(await post('/api/signup/confirm', { token: old }), {
    status: 410,
    body: { ok: false, error: 'expired' },
  });
});

test('when the customer cannot be stored the answer is 503 and the reason is logged', async () => {
  const store = {
    async create(): Promise<never> {
      throw new Error('relation "customers" does not exist');
    },
  };
  const { sent, logs, post } = setup({ store });
  await post('/api/signup', form);

  assert.equal((await post('/api/signup/confirm', { token: tokenIn(sent[0]) })).status, 503);
  assert.match(logs[0], /relation "customers" does not exist/);
  assert.equal(sent.length, 1, 'no welcome');
});

test('only JSON posted by the site itself is accepted', async () => {
  const { sent, post } = setup();
  const get = await handleApi(new Request(`${ORIGIN}/api/signup`), {});

  assert.equal(get.status, 405);
  assert.equal(get.headers.get('Allow'), 'POST');
  assert.equal((await post('/api/signup', form, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await post('/api/signup', form, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await post('/api/signup', '{not json')).status, 400);
  assert.equal((await post('/api/signup', [form])).status, 400);
  assert.equal((await post('/api/signup', { ...form, address1: 'x'.repeat(20_000) })).status, 413);
  assert.equal((await post('/api/nothing', form)).status, 404);
  assert.equal(sent.length, 0);
});

test('answers are JSON that is never cached', async () => {
  const response = await handleApi(new Request(`${ORIGIN}/api/signup`, { method: 'POST' }), {});
  assert.equal(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
