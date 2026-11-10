import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resendMailer } from './mailer.ts';

const email = { to: 'paul@example.com', subject: 'Hola', html: '<p>Hola</p>', text: 'Hola' };

/** A stand-in for Resend that answers with the given responses, in order, and records the requests. */
const fakeResend = (...responses: Array<{ status: number; body: unknown } | Error>) => {
  const requests: Array<{ url: string; headers: Headers; body: Record<string, unknown> }> = [];
  const fetchImpl = (async (url: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ url: String(url), headers: new Headers(init?.headers), body: JSON.parse(String(init?.body)) });
    const next = responses.shift();
    if (!next) throw new Error('unexpected request');
    if (next instanceof Error) throw next;
    return Response.json(next.body, { status: next.status });
  }) as typeof fetch;
  return { requests, fetchImpl };
};

const mailerWith = (fetchImpl: typeof fetch) =>
  resendMailer('re_test_key', 'Carinova <casillero@carinova.test>', { fetch: fetchImpl, retryDelayMs: 0 });

test('sends the message to Resend', async () => {
  const { requests, fetchImpl } = fakeResend({ status: 200, body: { id: '1' } }, { status: 200, body: { id: '2' } });
  const mailer = mailerWith(fetchImpl);

  assert.deepEqual(await mailer.send(email), { ok: true });
  assert.equal(requests[0].url, 'https://api.resend.com/emails');
  assert.equal(requests[0].headers.get('Authorization'), 'Bearer re_test_key');
  assert.deepEqual(requests[0].body, {
    from: 'Carinova <casillero@carinova.test>',
    to: ['paul@example.com'],
    subject: 'Hola',
    html: '<p>Hola</p>',
    text: 'Hola',
  });

  await mailer.send({ ...email, replyTo: 'hola@carinova.test' });
  assert.equal(requests[1].body.reply_to, 'hola@carinova.test');
});

test('a sender without a name gets "Carinova"', async () => {
  const { requests, fetchImpl } = fakeResend({ status: 200, body: { id: '1' } });
  await resendMailer('re_test_key', ' casillero@carinova.test ', { fetch: fetchImpl }).send(email);
  assert.equal(requests[0].body.from, 'Carinova <casillero@carinova.test>');
});

test('a rejected recipient is told apart, and its address stays out of the detail', async () => {
  const body = { statusCode: 422, name: 'validation_error', message: 'Invalid `to` field: paul@example.com' };
  const result = await mailerWith(fakeResend({ status: 422, body }).fetchImpl).send(email);

  assert.equal(result.ok, false);
  assert.equal(!result.ok && result.reason, 'invalid_recipient');
  assert.equal(!result.ok && result.detail.includes('paul@example.com'), false);
});

test('other errors are failures, with the reason Resend gives', async () => {
  const body = { statusCode: 403, name: 'validation_error', message: 'The carinova.test domain is not verified.' };
  const result = await mailerWith(fakeResend({ status: 403, body }).fetchImpl).send(email);

  assert.deepEqual(result, {
    ok: false,
    reason: 'failed',
    detail: 'Resend 403 validation_error: The carinova.test domain is not verified.',
  });
});

test('retries once when Resend asks to slow down', async () => {
  const slowDown = { status: 429, body: { name: 'rate_limit_exceeded', message: 'Too many requests' } };

  const recovered = fakeResend(slowDown, { status: 200, body: { id: '1' } });
  assert.deepEqual(await mailerWith(recovered.fetchImpl).send(email), { ok: true });
  assert.equal(recovered.requests.length, 2);

  const stillBusy = fakeResend(slowDown, slowDown);
  const result = await mailerWith(stillBusy.fetchImpl).send(email);
  assert.equal(!result.ok && result.reason, 'failed');
  assert.equal(stillBusy.requests.length, 2);
});

test('a network error is a failure, not an exception', async () => {
  const result = await mailerWith(fakeResend(new Error('socket hang up')).fetchImpl).send(email);
  assert.equal(!result.ok && result.reason, 'failed');
  assert.match(!result.ok ? result.detail : '', /socket hang up/);
});
