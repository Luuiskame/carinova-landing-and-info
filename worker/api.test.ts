import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ACCOUNT_LIST_LIMIT,
  LOGIN_CODES_PER_15_MINUTES,
  LOGIN_CODE_ATTEMPTS,
  LOGIN_CODE_MINUTES,
  SESSION_DAYS,
  SESSION_FLAG_COOKIE,
} from '../src/data/account.ts';
import { handleApi, type Deps } from './api.ts';
import type { Email, SendResult } from './mailer.ts';
import { sealToken } from './signup/token.ts';
import { memoryStore, type AccountActivity, type AccountInvoice, type AccountPackage, type Store } from './store.ts';

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

const inquiry = {
  company: 'Repuestos del Caribe, S. A.',
  contactName: 'Paula Palacios',
  email: 'compras@example.com',
  phone: '8855 2956',
  country: 'NI',
  city: 'Bluefields',
  volume: '100-500',
  message: 'Importamos repuestos de motor cada mes.\nQueremos una cuenta para la empresa.',
  contact_time: '',
};

interface Answer {
  status: number;
  // The shape depends on the endpoint: the tests read it loosely.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  /** The Set-Cookie headers of the answer. */
  cookies: Array<string>;
}

/** The API with a recording mailer, an in-memory store and a clock the test can move. */
const setup = (overrides: Partial<Deps> = {}, sendResult: SendResult = { ok: true }) => {
  const sent: Array<Email> = [];
  const logs: Array<string> = [];
  const clock = { now: Date.parse('2026-11-10T12:00:00Z') };
  const deps: Deps = {
    tokenSecret: SECRET,
    mailer: {
      async send(email) {
        sent.push(email);
        return sendResult;
      },
    },
    store: memoryStore({ now: () => clock.now }),
    ownerEmail: 'owner@carinova.test',
    log: (message) => logs.push(message),
    ...overrides,
  };

  const call = async (request: Request): Promise<Answer> => {
    const response = await handleApi(request, deps);
    return { status: response.status, body: await response.json(), cookies: response.headers.getSetCookie() };
  };
  const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
    call(
      new Request(`${ORIGIN}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: ORIGIN, ...headers },
        body: typeof body === 'string' ? body : JSON.stringify(body),
      })
    );
  const get = (path: string, headers: Record<string, string> = {}) =>
    call(new Request(`${ORIGIN}${path}`, { headers }));

  /** Signs up and confirms: the customer exists and the answer carries their session. */
  const register = async (data: Record<string, unknown> = form) => {
    await post('/api/signup', data);
    return post('/api/signup/confirm', { token: tokenIn(sent[sent.length - 1]) });
  };

  return { sent, logs, clock, post, get, register };
};

/** The confirmation link of an e-mail, as the customer would open it. */
const linkIn = (email: Email) => new URL(/https?:\/\/\S+/.exec(email.text)![0]);
const tokenIn = (email: Email) => linkIn(email).searchParams.get('token');
/** The sign-in code of an e-mail, as the customer would read it. */
const codeIn = (email: Email) => /^\d{6}$/m.exec(email.text)![0];
/** What a browser would send back after these Set-Cookie headers. */
const cookieHeader = (cookies: Array<string>) => ({
  Cookie: cookies.map((cookie) => cookie.split(';')[0]).join('; '),
});
const minutes = (count: number) => count * 60_000;
const days = (count: number) => count * 24 * 60 * 60_000;

// ───────────────────────────── Sign-up ─────────────────────────────

test('sign-up, confirmation and welcome', async () => {
  const { sent, logs, post } = setup();

  assert.deepEqual((await post('/api/signup', form)).body, { ok: true });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'paul@example.com');
  assert.match(sent[0].subject, /Confirmá tu correo/);
  const link = linkIn(sent[0]);
  assert.equal(link.origin + link.pathname, `${ORIGIN}/registro/confirmar`);

  const confirmed = await post('/api/signup/confirm', { token: tokenIn(sent[0]) });
  assert.equal(confirmed.status, 200);
  assert.deepEqual(confirmed.body, {
    ok: true,
    isNew: true,
    signedIn: true,
    customer: { code: 'CNV-00001', firstName: 'Paul', lastName: 'Palacios' },
  });
  assert.equal(sent.length, 2);
  assert.equal(sent[1].to, 'paul@example.com');
  assert.equal(sent[1].subject, 'Tu cuenta Carinova está lista: CNV-00001');
  assert.ok(sent[1].text.includes('Carinova Paul') && sent[1].text.includes('Palacios Aéreo'));
  assert.deepEqual(logs, []);
});

test('a sign-up from the English site is answered in English', async () => {
  const { sent, post } = setup();

  const invalid = await post('/api/signup', { ...form, lang: 'en', email: 'paul@' });
  assert.equal(invalid.body.fields.email, 'Check your e-mail: it does not look valid.');

  await post('/api/signup', { ...form, lang: 'en' });
  assert.equal(sent[0].subject, 'Confirm your e-mail to create your Carinova account');
  const link = linkIn(sent[0]);
  assert.equal(link.origin + link.pathname, `${ORIGIN}/en/sign-up/confirm`);

  await post('/api/signup/confirm', { token: tokenIn(sent[0]) });
  assert.equal(sent[1].subject, 'Your Carinova account is ready: CNV-00001');
  assert.ok(sent[1].text.includes(`${ORIGIN}/en/quote`) && sent[1].text.includes(`${ORIGIN}/en/sign-in`));
});

test('confirming signs the new customer in, with cookies scripts cannot use', async () => {
  const { register, get } = setup();
  const { cookies } = await register();

  const [session, flag] = cookies;
  assert.match(session, /^__Host-cnv_session=[A-Za-z0-9_-]{43}; /);
  for (const attribute of ['Path=/', `Max-Age=${SESSION_DAYS * 86_400}`, 'SameSite=Lax', 'Secure', 'HttpOnly']) {
    assert.ok(session.split('; ').includes(attribute), attribute);
  }
  assert.equal(/Domain=/i.test(session), false);
  // The flag the pages read says a session exists and nothing else.
  assert.ok(flag.startsWith(`${SESSION_FLAG_COOKIE}=1; `));
  assert.equal(flag.includes('HttpOnly'), false);

  const account = await get('/api/account', cookieHeader(cookies));
  assert.equal(account.status, 200);
  assert.equal(account.body.account.code, 'CNV-00001');
});

test('opening the link again returns the same customer, signs nobody in and sends nothing', async () => {
  const { sent, post } = setup();
  await post('/api/signup', form);
  const token = tokenIn(sent[0]);

  await post('/api/signup/confirm', { token });
  const again = await post('/api/signup/confirm', { token });

  assert.deepEqual(again.body, {
    ok: true,
    isNew: false,
    signedIn: false,
    customer: { code: 'CNV-00001', firstName: 'Paul', lastName: 'Palacios' },
  });
  assert.deepEqual(again.cookies, []);
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
    signedIn: false,
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
  assert.equal(sent[2].subject, 'Nueva cuenta CNV-00001: Paul Palacios');
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
  const answer = await post('/api/signup', { ...form, contact_time: 'mañana' });
  assert.deepEqual([answer.status, answer.body], [200, { ok: true }]);
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

  const answer = await post('/api/signup', form);
  assert.deepEqual([answer.status, answer.body], [503, { ok: false, error: 'unavailable' }]);
  assert.match(logs[0], /domain is not verified/);
});

test('without its configuration the API answers 503 and names what is missing', async () => {
  for (const [missing, name] of [
    [{ store: undefined }, 'DATABASE_URL'],
    [{ mailer: undefined }, 'RESEND_API_KEY and EMAIL_FROM'],
    [{ tokenSecret: undefined }, 'SIGNUP_TOKEN_SECRET'],
    [{ tokenSecret: 'short' }, 'SIGNUP_TOKEN_SECRET'],
  ] as const) {
    for (const [path, body] of [
      ['/api/signup', form],
      ['/api/login', { email: form.email }],
    ] as const) {
      const { sent, logs, post } = setup(missing);
      assert.equal((await post(path, body)).status, 503, `${path} without ${name}`);
      assert.ok(logs[0].includes(name), logs[0]);
      assert.equal(sent.length, 0);
    }
  }

  const { logs, post, get } = setup({ store: undefined });
  assert.equal((await post('/api/signup/confirm', { token: 'x' })).status, 503);
  assert.equal((await post('/api/login/verify', { email: form.email, code: '123456' })).status, 503);
  assert.equal((await get('/api/account')).status, 503);
  for (const line of logs) assert.ok(line.includes('DATABASE_URL'), line);
});

test('tokens that are not ours, or too old, are refused', async () => {
  const { post } = setup();
  for (const token of ['', 'abc', undefined, 42]) {
    const answer = await post('/api/signup/confirm', { token });
    assert.deepEqual([answer.status, answer.body], [400, { ok: false, error: 'invalid_token' }]);
  }

  const threeDaysAgo = Date.now() - 72 * 60 * 60 * 1000;
  const old = await sealToken({ ...form, acceptedAt: new Date(threeDaysAgo).toISOString() }, SECRET, {
    now: threeDaysAgo,
  });
  const answer = await post('/api/signup/confirm', { token: old });
  assert.deepEqual([answer.status, answer.body], [410, { ok: false, error: 'expired' }]);
});

test('when the customer cannot be stored the answer is 503 and the reason is logged', async () => {
  const store = {
    ...memoryStore(),
    async create(): Promise<never> {
      throw new Error('relation "customers" does not exist');
    },
  } satisfies Store;
  const { sent, logs, post } = setup({ store });
  await post('/api/signup', form);

  const answer = await post('/api/signup/confirm', { token: tokenIn(sent[0]) });
  assert.equal(answer.status, 503);
  assert.deepEqual(answer.cookies, [], 'no session without a customer');
  assert.match(logs[0], /relation "customers" does not exist/);
  assert.equal(sent.length, 1, 'no welcome');
});

// ───────────────────────────── Sign-in ─────────────────────────────

test('signing in: a code by e-mail, then a session', async () => {
  const { sent, post, get, register } = setup();
  await register();
  sent.length = 0;

  assert.deepEqual((await post('/api/login', { email: ' Paul@Example.com ' })).body, { ok: true });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'paul@example.com');
  assert.equal(sent[0].subject, 'Tu código para ingresar a Carinova');
  assert.ok(sent[0].text.includes(`${LOGIN_CODE_MINUTES} minutos`));

  const signedIn = await post('/api/login/verify', { email: 'paul@example.com', code: codeIn(sent[0]) });
  assert.equal(signedIn.status, 200);
  assert.deepEqual(signedIn.body.account, {
    code: 'CNV-00001',
    firstName: 'Paul',
    lastName: 'Palacios',
    email: 'paul@example.com',
    phone: '+50588552956',
    country: 'NI',
    address1: 'Barrio Central, de la iglesia morava 1 c. al sur',
    address2: '',
    city: 'Bluefields',
    state: 'Costa Caribe Sur (RACCS)',
    postalCode: '',
    locale: 'es',
    createdAt: '2026-11-10T12:00:00.000Z',
  });
  assert.equal(signedIn.cookies.length, 2);

  const account = await get('/api/account', cookieHeader(signedIn.cookies));
  assert.deepEqual(account.body, { ok: true, account: signedIn.body.account });
});

test('a code typed with spaces works, and the e-mail follows the language of the page', async () => {
  const { sent, post, register } = setup();
  await register();
  sent.length = 0;

  await post('/api/login', { email: form.email, lang: 'en' });
  assert.equal(sent[0].subject, 'Your code to sign in to Carinova');
  const code = codeIn(sent[0]);
  const spaced = `${code.slice(0, 3)} ${code.slice(3)}`;
  assert.equal((await post('/api/login/verify', { email: form.email, code: spaced })).status, 200);
});

test('asking for a code answers the same whether or not the address has an account', async () => {
  const { sent, post, register } = setup();
  await register();
  sent.length = 0;

  const known = await post('/api/login', { email: form.email });
  const unknown = await post('/api/login', { email: 'nobody@example.com' });
  assert.deepEqual([unknown.status, unknown.body], [known.status, known.body]);
  assert.deepEqual(
    sent.map((email) => email.to),
    [form.email],
    'nothing is sent to an address without an account'
  );

  for (const email of ['', 'paul@', 42]) {
    const answer = await post('/api/login', { email });
    assert.equal(answer.status, 422);
    assert.deepEqual(Object.keys(answer.body.fields), ['email']);
  }
});

test('a code works once, for its own account, and only for a few minutes', async () => {
  const { sent, clock, post, register } = setup();
  await register();
  await register({ ...form, email: 'ana@example.com', firstName: 'Ana' });
  sent.length = 0;
  const refused = { ok: false, error: 'invalid_code' };

  await post('/api/login', { email: form.email });
  const code = codeIn(sent[0]);

  // Not for another account, not without a code, not for an address without an account.
  assert.deepEqual((await post('/api/login/verify', { email: 'ana@example.com', code })).body, refused);
  assert.deepEqual((await post('/api/login/verify', { email: 'nobody@example.com', code })).body, refused);
  for (const wrong of [undefined, '', '12345', 'abcdef', 123456, '1234567']) {
    const answer = await post('/api/login/verify', { email: form.email, code: wrong });
    assert.deepEqual([answer.status, answer.body, answer.cookies], [401, refused, []], String(wrong));
  }

  assert.equal((await post('/api/login/verify', { email: form.email, code })).status, 200);
  assert.deepEqual((await post('/api/login/verify', { email: form.email, code })).body, refused, 'used');

  await post('/api/login', { email: form.email });
  clock.now += minutes(LOGIN_CODE_MINUTES) + 1;
  assert.deepEqual((await post('/api/login/verify', { email: form.email, code: codeIn(sent[1]) })).body, refused);
});

test('a new code retires the one before it', async () => {
  const { sent, post, register } = setup();
  await register();
  sent.length = 0;

  await post('/api/login', { email: form.email });
  await post('/api/login', { email: form.email });
  const [first, second] = sent.map(codeIn);

  if (first !== second) {
    assert.equal((await post('/api/login/verify', { email: form.email, code: first })).status, 401);
  }
  assert.equal((await post('/api/login/verify', { email: form.email, code: second })).status, 200);
});

test('after a few wrong guesses the code stops working, even when the right one follows', async () => {
  const { sent, post, register } = setup();
  await register();
  sent.length = 0;
  await post('/api/login', { email: form.email });
  const code = codeIn(sent[0]);
  const wrong = code === '000000' ? '111111' : '000000';

  for (let guess = 0; guess < LOGIN_CODE_ATTEMPTS; guess += 1) {
    assert.equal((await post('/api/login/verify', { email: form.email, code: wrong })).status, 401);
  }
  assert.equal((await post('/api/login/verify', { email: form.email, code })).status, 401);
});

test('a customer is sent only a few codes in a quarter of an hour', async () => {
  const { sent, clock, post, register } = setup();
  await register();
  sent.length = 0;

  for (let request = 0; request < LOGIN_CODES_PER_15_MINUTES + 2; request += 1) {
    assert.equal((await post('/api/login', { email: form.email })).status, 200, 'the answer does not change');
  }
  assert.equal(sent.length, LOGIN_CODES_PER_15_MINUTES);

  clock.now += minutes(16);
  await post('/api/login', { email: form.email });
  assert.equal(sent.length, LOGIN_CODES_PER_15_MINUTES + 1);
});

test('the code e-mail goes out after the answer when the Worker can wait', async () => {
  const pending: Array<Promise<unknown>> = [];
  const { sent, post, register } = setup({ waitUntil: (work) => pending.push(work) });
  await register();
  await Promise.all(pending);
  sent.length = 0;
  pending.length = 0;

  assert.equal((await post('/api/login', { email: form.email })).status, 200);
  assert.equal(pending.length, 1);
  await Promise.all(pending);
  assert.equal(sent.length, 1);
});

test('signing out ends the session and removes the cookies', async () => {
  const { post, get, register } = setup();
  const { cookies } = await register();
  const browser = cookieHeader(cookies);

  const out = await post('/api/logout', {}, browser);
  assert.equal(out.status, 200);
  assert.equal(out.cookies.length, 2);
  for (const cookie of out.cookies) assert.ok(cookie.includes('Max-Age=0'), cookie);

  // The token no longer opens anything, even if a copy of the cookie was kept.
  const after = await get('/api/account', browser);
  assert.deepEqual([after.status, after.body], [401, { ok: false, error: 'signed_out' }]);
});

test('without a session, or with an expired one, the account is not shown and the cookies are cleared', async () => {
  const { clock, get, register } = setup();
  const { cookies } = await register();

  const without: Array<Record<string, string>> = [
    {},
    { Cookie: '__Host-cnv_session=not-a-token' },
    { Cookie: `${SESSION_FLAG_COOKIE}=1` },
  ];
  for (const headers of without) {
    const answer = await get('/api/account', headers);
    assert.equal(answer.status, 401);
    assert.ok(answer.cookies.every((cookie) => cookie.includes('Max-Age=0')));
    assert.equal(answer.cookies.length, 2);
  }

  clock.now += days(SESSION_DAYS) + 1;
  assert.equal((await get('/api/account', cookieHeader(cookies))).status, 401);
});

test('over plain HTTP (local development) the cookies are not marked Secure', async () => {
  const sent: Array<Email> = [];
  const deps: Deps = {
    tokenSecret: SECRET,
    mailer: {
      async send(email) {
        sent.push(email);
        return { ok: true };
      },
    },
    store: memoryStore(),
  };
  const local = 'http://localhost:4321';
  const post = (path: string, body: unknown) =>
    handleApi(
      new Request(`${local}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: local },
        body: JSON.stringify(body),
      }),
      deps
    );

  await post('/api/signup', form);
  const confirmed = await post('/api/signup/confirm', { token: tokenIn(sent[0]) });
  const [session] = confirmed.headers.getSetCookie();
  assert.match(session, /^cnv_session=/);
  assert.equal(session.includes('Secure'), false);
  assert.ok(session.includes('HttpOnly'));

  const account = await handleApi(
    new Request(`${local}/api/account`, { headers: { Cookie: session.split(';')[0] } }),
    deps
  );
  assert.equal(account.status, 200);
});

// ───────────────────────────── Companies ─────────────────────────────

test("a company's request is e-mailed to the owner, who can reply to the company", async () => {
  const { sent, logs, post } = setup();

  const answer = await post('/api/business', inquiry);
  assert.deepEqual([answer.status, answer.body], [200, { ok: true }]);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'owner@carinova.test');
  assert.equal(sent[0].replyTo, 'compras@example.com');
  assert.equal(sent[0].subject, 'Solicitud de empresa: Repuestos del Caribe, S. A.');
  for (const value of [
    'Paula Palacios',
    '+50588552956',
    'Bluefields',
    'De 100 a 500 lb al mes',
    'repuestos de motor',
  ]) {
    assert.ok(sent[0].text.includes(value) && sent[0].html.includes(value), value);
  }
  assert.deepEqual(logs, []);
});

test('an incomplete request is answered with the fields to fix, in the language of the form', async () => {
  const { sent, post } = setup();

  const spanish = await post('/api/business', { ...inquiry, company: '', message: 'Hola' });
  assert.equal(spanish.status, 422);
  assert.deepEqual(Object.keys(spanish.body.fields).sort(), ['company', 'message']);
  assert.equal(spanish.body.fields.company, 'Escribí el nombre de tu empresa.');

  const english = await post('/api/business', { ...inquiry, lang: 'en', email: 'compras@' });
  assert.equal(english.body.fields.email, 'Check your e-mail: it does not look valid.');
  assert.equal(sent.length, 0);
});

test('the form for companies needs the owner’s inbox and a mailer', async () => {
  for (const [missing, name] of [
    [{ ownerEmail: undefined }, 'OWNER_EMAIL'],
    [{ mailer: undefined }, 'RESEND_API_KEY and EMAIL_FROM'],
  ] as const) {
    const { logs, post } = setup(missing);
    assert.equal((await post('/api/business', inquiry)).status, 503);
    assert.ok(logs[0].includes(name), logs[0]);
  }

  const { sent, logs, post } = setup({}, { ok: false, reason: 'failed', detail: 'Resend 500' });
  assert.equal((await post('/api/business', inquiry)).status, 503);
  assert.match(logs[0], /Resend 500/);
  assert.equal(sent.length, 1);

  const honeypot = setup();
  assert.equal((await honeypot.post('/api/business', { ...inquiry, contact_time: 'x' })).status, 200);
  assert.equal(honeypot.sent.length, 0);
});

// ───────────────────────────── Packages and payments ─────────────────────────────

const parcel: AccountPackage = {
  reference: 'PKG-000012',
  description: 'Zapatos Nike, caja mediana',
  store: 'Nike',
  carrier: 'UPS',
  carrierTracking: '1Z999AA10123456784',
  service: 'air',
  status: 'in_transit',
  warehouse: 'MIA',
  branch: 'bluefields',
  deliveryMethod: 'pickup',
  weightLb: 3.4,
  pieces: 1,
  receivedAt: '2026-11-09T15:00:00.000Z',
  shippedAt: '2026-11-10T09:00:00.000Z',
  readyAt: null,
  deliveredAt: null,
  events: [
    { status: 'received', at: '2026-11-09T15:00:00.000Z', note: '' },
    { status: 'in_transit', at: '2026-11-10T09:00:00.000Z', note: 'Salió hacia Nicaragua' },
  ],
};

const bill: AccountInvoice = {
  number: 'INV-000007',
  state: 'in_review',
  issuedAt: '2026-11-10T10:00:00.000Z',
  dueAt: null,
  total: 22.1,
  paid: 0,
  pending: 22.1,
  balance: 22.1,
  notes: '',
  items: [{ description: 'Envío aéreo, 3.4 lb × US$6.50', amount: 22.1, packageReference: 'PKG-000012' }],
  payments: [
    {
      amount: 22.1,
      method: 'bank_transfer',
      status: 'pending',
      paidAt: '2026-11-10T11:00:00.000Z',
      reference: 'BAC 8841',
    },
  ],
};

test('a customer sees their own packages and invoices, and only with a session', async () => {
  const activity: AccountActivity = { packages: [parcel], invoices: [bill] };
  // Only Paul has something: whose rows come back is decided by the session, not by the request.
  const store = memoryStore({
    activity: (account) => (account.email === form.email ? activity : { packages: [], invoices: [] }),
  });
  const { register, get } = setup({ store });

  const paul = await register();
  const answer = await get('/api/account/activity', cookieHeader(paul.cookies));
  assert.equal(answer.status, 200);
  assert.deepEqual(answer.body, { ok: true, ...activity });

  const ana = await register({ ...form, email: 'ana@example.com', firstName: 'Ana' });
  const empty = await get('/api/account/activity?customer=CNV-00001', cookieHeader(ana.cookies));
  assert.deepEqual([empty.status, empty.body], [200, { ok: true, packages: [], invoices: [] }]);

  // Without a session: no data, and the cookies that said "signed in" go.
  const without: Array<Record<string, string>> = [
    {},
    { Cookie: '__Host-cnv_session=not-a-token' },
    { Cookie: `${SESSION_FLAG_COOKIE}=1` },
  ];
  for (const headers of without) {
    const refused = await get('/api/account/activity', headers);
    assert.deepEqual([refused.status, refused.body], [401, { ok: false, error: 'signed_out' }]);
    assert.ok(refused.cookies.length === 2 && refused.cookies.every((cookie) => cookie.includes('Max-Age=0')));
  }
});

test('the account lists stop at the most recent ones, and end with the session', async () => {
  const many = Array.from({ length: ACCOUNT_LIST_LIMIT + 5 }, (_, index) => ({
    ...parcel,
    reference: `PKG-${String(index + 1).padStart(6, '0')}`,
  }));
  const store = memoryStore({ activity: () => ({ packages: many, invoices: [] }) });
  const { register, get, post } = setup({ store });
  const { cookies } = await register();

  const answer = await get('/api/account/activity', cookieHeader(cookies));
  assert.equal(answer.body.packages.length, ACCOUNT_LIST_LIMIT);
  assert.equal(answer.body.packages[0].reference, 'PKG-000001');

  await post('/api/logout', {}, cookieHeader(cookies));
  assert.equal((await get('/api/account/activity', cookieHeader(cookies))).status, 401);
});

test('without a database the account answers that it is not available', async () => {
  const { get, logs } = setup({ store: undefined });
  assert.equal((await get('/api/account/activity')).status, 503);
  assert.match(logs[0], /DATABASE_URL/);
});

// ───────────────────────────── Every endpoint ─────────────────────────────

test('only JSON posted by the site itself is accepted', async () => {
  const { sent, post, get } = setup();
  const wrongMethod = await handleApi(new Request(`${ORIGIN}/api/signup`), {});

  assert.equal(wrongMethod.status, 405);
  assert.equal(wrongMethod.headers.get('Allow'), 'POST');
  assert.equal((await post('/api/account', {})).status, 405);
  assert.equal((await post('/api/account/activity', {})).status, 405);
  assert.equal((await get('/api/account/activity', { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  assert.equal((await post('/api/signup', form, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await post('/api/signup', form, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  assert.equal((await post('/api/login', { email: form.email }, { 'Sec-Fetch-Site': 'same-site' })).status, 403);
  assert.equal((await get('/api/account', { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  assert.equal((await post('/api/signup', form, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await post('/api/signup', '{not json')).status, 400);
  assert.equal((await post('/api/signup', [form])).status, 400);
  assert.equal((await post('/api/signup', { ...form, address1: 'x'.repeat(20_000) })).status, 413);
  assert.equal((await post('/api/nothing', form)).status, 404);
  assert.equal(sent.length, 0);

  // What a browser sends from the site's own pages.
  assert.equal((await post('/api/signup', form, { 'Sec-Fetch-Site': 'same-origin' })).status, 200);
});

test('answers are JSON that is never cached', async () => {
  const response = await handleApi(new Request(`${ORIGIN}/api/signup`, { method: 'POST' }), {});
  assert.equal(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
