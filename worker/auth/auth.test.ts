import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LOGIN_CODE_DIGITS, LOGIN_CODE_MINUTES, SESSION_DAYS, SESSION_FLAG_COOKIE } from '../../src/data/account.ts';
import { hashLoginCode, newLoginCode, normalizeLoginCode } from './code.ts';
import { loginCodeEmail } from './emails.ts';
import {
  expiredSessionCookies,
  hashSessionToken,
  isSecure,
  newSessionToken,
  sessionCookies,
  sessionTokenOf,
} from './session.ts';

const SECRET = 'a-secret-for-the-tests-that-is-long-enough';
const request = (url: string, cookie?: string) => new Request(url, cookie ? { headers: { Cookie: cookie } } : {});

test('session tokens are long, random and never stored as they are', async () => {
  const token = newSessionToken();
  assert.match(token, /^[A-Za-z0-9_-]{43}$/, '32 bytes in base64url');
  assert.notEqual(token, newSessionToken());

  const hash = await hashSessionToken(token);
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(hash, await hashSessionToken(token));
  assert.notEqual(hash, await hashSessionToken(newSessionToken()));
  assert.equal(hash.includes(token), false);
});

test('over HTTPS the session cookie is HttpOnly, Secure, SameSite=Lax and bound to the host', () => {
  const token = newSessionToken();
  const [session, flag] = sessionCookies(token, true);
  const maxAge = `Max-Age=${SESSION_DAYS * 24 * 60 * 60}`;

  assert.deepEqual(session.split('; '), [
    `__Host-cnv_session=${token}`,
    'Path=/',
    maxAge,
    'SameSite=Lax',
    'Secure',
    'HttpOnly',
  ]);
  // What the pages read: it lasts as long as the session and carries nothing.
  assert.deepEqual(flag.split('; '), [`${SESSION_FLAG_COOKIE}=1`, 'Path=/', maxAge, 'SameSite=Lax', 'Secure']);

  for (const cookie of expiredSessionCookies(true)) assert.ok(cookie.includes('Max-Age=0'), cookie);
  assert.ok(expiredSessionCookies(true)[0].startsWith('__Host-cnv_session=;'));
});

test('over plain HTTP (local development) the cookie has a plain name and is not Secure', () => {
  const [session] = sessionCookies(newSessionToken(), false);
  assert.match(session, /^cnv_session=/);
  assert.equal(session.includes('Secure'), false);
  assert.ok(session.includes('HttpOnly'));

  assert.equal(isSecure(request('https://carinova.test/api/account')), true);
  assert.equal(isSecure(request('http://localhost:4321/api/account')), false);
});

test('the token is read from the cookie of the scheme in use, and only when it looks like one', () => {
  const token = newSessionToken();
  const https = 'https://carinova.test/api/account';
  const http = 'http://localhost:4321/api/account';

  assert.equal(sessionTokenOf(request(https, `other=1; __Host-cnv_session=${token}; ${SESSION_FLAG_COOKIE}=1`)), token);
  assert.equal(sessionTokenOf(request(http, `cnv_session=${token}`)), token);
  // A cookie without the prefix could have been set by anything on the domain: not accepted over HTTPS.
  assert.equal(sessionTokenOf(request(https, `cnv_session=${token}`)), null);
  assert.equal(sessionTokenOf(request(https)), null);
  for (const value of ['', 'short', `${token}x`, `${token.slice(0, 42)}!`, '../../etc/passwd']) {
    assert.equal(sessionTokenOf(request(https, `__Host-cnv_session=${value}`)), null, value);
  }
});

test('sign-in codes are six digits, all equally likely to start with any digit', () => {
  const codes = Array.from({ length: 2000 }, newLoginCode);
  for (const code of codes) assert.match(code, new RegExp(`^\\d{${LOGIN_CODE_DIGITS}}$`));
  assert.ok(new Set(codes).size > 1990, 'no repeats to speak of');
  // Leading zeros are kept: about a tenth of the codes start with 0.
  const zeros = codes.filter((code) => code.startsWith('0')).length;
  assert.ok(zeros > 120 && zeros < 290, `${zeros} of 2000 start with 0`);
});

test('a typed code may have spaces or a dash; anything else is not a code', () => {
  assert.equal(normalizeLoginCode('123456'), '123456');
  assert.equal(normalizeLoginCode(' 123 456 '), '123456');
  assert.equal(normalizeLoginCode('123-456'), '123456');
  assert.equal(normalizeLoginCode('012345'), '012345');
  for (const value of ['', '12345', '1234567', 'abcdef', '12345a', 123456, null, undefined, '1'.repeat(40)]) {
    assert.equal(normalizeLoginCode(value), null, String(value));
  }
});

test('what is stored of a code depends on the code, the account and the secret', async () => {
  const hash = await hashLoginCode('123456', 'paul@example.com', SECRET);
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(hash, await hashLoginCode('123456', 'paul@example.com', SECRET));
  assert.notEqual(hash, await hashLoginCode('123457', 'paul@example.com', SECRET));
  assert.notEqual(hash, await hashLoginCode('123456', 'ana@example.com', SECRET));
  assert.notEqual(hash, await hashLoginCode('123456', 'paul@example.com', `${SECRET}!`));
});

test('the code e-mail carries the code, how long it lasts and who may ask for it: nobody', () => {
  const spanish = loginCodeEmail("D'Angelo", '012345');
  assert.equal(spanish.subject, 'Tu código para ingresar a Carinova');
  assert.equal(spanish.subject.includes('012345'), false, 'the code stays out of the subject');
  for (const version of [spanish.html, spanish.text]) {
    assert.ok(version.includes('012345'));
    assert.ok(version.includes(`${LOGIN_CODE_MINUTES} minutos`));
    assert.ok(version.includes('Nunca te lo vamos a pedir'));
  }
  assert.ok(spanish.html.includes('Hola, D&#39;Angelo:') && spanish.html.includes('<html lang="es">'));
  assert.ok(spanish.text.includes("Hola, D'Angelo:"));
  assert.match(spanish.text, /^012345$/m, 'the code has a line of its own');

  const english = loginCodeEmail('Paul', '987654', 'en');
  assert.equal(english.subject, 'Your code to sign in to Carinova');
  assert.ok(english.html.includes('<html lang="en">') && english.html.includes('987654'));
  assert.ok(english.text.includes(`${LOGIN_CODE_MINUTES} minutes`) && english.text.includes('We will never ask'));
});
