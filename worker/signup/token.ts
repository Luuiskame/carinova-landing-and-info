/**
 * Confirmation tokens. The link in the verification e-mail carries the whole sign-up, encrypted
 * and authenticated with AES-GCM, so nothing is stored until the e-mail address is confirmed:
 * no database row, no pending state to clean up.
 *
 * Web Crypto only: the same code runs on Cloudflare Workers and on Node (dev server, tests).
 */
import { CONFIRM_LINK_HOURS } from '../../src/data/signup.ts';

const VERSION = 1;
const DEFAULT_TTL_SECONDS = CONFIRM_LINK_HOURS * 60 * 60;
const IV_BYTES = 12;
/** A real token is about 600 characters; anything far beyond that is not ours. */
const MAX_TOKEN_LENGTH = 4096;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** Ties the ciphertext to this purpose, should the secret ever be used for something else. */
const CONTEXT = encoder.encode('carinova-signup-v1');

/** Secrets shorter than this are refused (see `isUsableSecret`). */
export const MIN_SECRET_LENGTH = 32;
export const isUsableSecret = (secret: string | undefined): secret is string =>
  typeof secret === 'string' && secret.length >= MIN_SECRET_LENGTH;

const keyFrom = async (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey('raw', await crypto.subtle.digest('SHA-256', encoder.encode(secret)), 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ]);

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (text: string): Uint8Array<ArrayBuffer> | null => {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) return null;
  try {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
};

export const sealToken = async (
  data: unknown,
  secret: string,
  { now = Date.now(), ttlSeconds = DEFAULT_TTL_SECONDS }: { now?: number; ttlSeconds?: number } = {}
): Promise<string> => {
  const payload = { v: VERSION, exp: Math.floor(now / 1000) + ttlSeconds, data };
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: CONTEXT },
    await keyFrom(secret),
    encoder.encode(JSON.stringify(payload))
  );
  const token = new Uint8Array(IV_BYTES + cipher.byteLength);
  token.set(iv);
  token.set(new Uint8Array(cipher), IV_BYTES);
  return toBase64Url(token);
};

export type OpenedToken<T> = { ok: true; data: T } | { ok: false; reason: 'invalid' | 'expired' };

/** Decrypts a token. `invalid` covers everything that is not ours: damaged, forged or made with another secret. */
export const openToken = async <T>(token: string, secret: string, now = Date.now()): Promise<OpenedToken<T>> => {
  const invalid = { ok: false, reason: 'invalid' } as const;
  if (token.length > MAX_TOKEN_LENGTH) return invalid;
  const bytes = fromBase64Url(token);
  if (!bytes || bytes.length <= IV_BYTES) return invalid;

  let payload: { v?: unknown; exp?: unknown; data?: unknown };
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: bytes.subarray(0, IV_BYTES), additionalData: CONTEXT },
      await keyFrom(secret),
      bytes.subarray(IV_BYTES)
    );
    payload = JSON.parse(decoder.decode(plain));
  } catch {
    return invalid;
  }

  if (payload?.v !== VERSION || typeof payload.exp !== 'number') return invalid;
  if (payload.exp * 1000 <= now) return { ok: false, reason: 'expired' };
  return { ok: true, data: payload.data as T };
};
