import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isUsableSecret, openToken, sealToken } from './token.ts';

const SECRET = 'a-secret-for-the-tests-that-is-long-enough';
const data = { email: 'paul@example.com', firstName: 'Paul' };

test('a token gives back what was sealed', async () => {
  const token = await sealToken(data, SECRET);
  assert.match(token, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(await openToken(token, SECRET), { ok: true, data });
});

test('the contents cannot be read from the link', async () => {
  const token = await sealToken(data, SECRET);
  const raw = Buffer.from(token, 'base64url').toString('latin1');
  assert.equal(raw.includes('paul@example.com'), false);
  assert.notEqual(token, await sealToken(data, SECRET), 'each token uses a fresh nonce');
});

test('a changed, foreign or broken token is invalid', async () => {
  const token = await sealToken(data, SECRET);
  const middle = Math.floor(token.length / 2);
  const changed = token.slice(0, middle) + (token[middle] === 'A' ? 'B' : 'A') + token.slice(middle + 1);

  const invalid = { ok: false, reason: 'invalid' };
  assert.deepEqual(await openToken(changed, SECRET), invalid);
  assert.deepEqual(await openToken(token, 'another-secret-that-is-also-long-enough'), invalid);
  assert.deepEqual(await openToken(token.slice(0, -4), SECRET), invalid);
  for (const garbage of ['', 'abc', 'not a token!', '%%%', 'A'.repeat(5000)]) {
    assert.deepEqual(await openToken(garbage, SECRET), invalid, garbage.slice(0, 20));
  }
});

test('a token expires', async () => {
  const sealedAt = Date.UTC(2026, 10, 9, 12);
  const hour = 60 * 60 * 1000;
  const token = await sealToken(data, SECRET, { now: sealedAt });

  assert.equal((await openToken(token, SECRET, sealedAt + 47 * hour)).ok, true);
  assert.deepEqual(await openToken(token, SECRET, sealedAt + 48 * hour), { ok: false, reason: 'expired' });

  const short = await sealToken(data, SECRET, { now: sealedAt, ttlSeconds: 60 });
  assert.deepEqual(await openToken(short, SECRET, sealedAt + 61_000), { ok: false, reason: 'expired' });
});

test('short secrets are refused', () => {
  assert.equal(isUsableSecret(undefined), false);
  assert.equal(isUsableSecret(''), false);
  assert.equal(isUsableSecret('too-short'), false);
  assert.equal(isUsableSecret(SECRET), true);
});
