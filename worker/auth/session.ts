/**
 * A customer's session: the token that proves who they are and the cookies that carry it.
 *
 * - The token is 256 random bits. The browser holds it in a cookie; the database holds only its
 *   SHA-256 (store.ts), so a copy of the database cannot be used to sign in.
 * - The session cookie is HttpOnly (the page's scripts cannot read it, so a script injected in a
 *   page cannot steal it), Secure, and SameSite=Lax (other sites cannot make the browser send it
 *   with a form or a fetch). On HTTPS its name starts with "__Host-": the browser then refuses it
 *   unless it is Secure, for the whole site and without a Domain, so nothing else on the domain can
 *   plant or overwrite it.
 * - A second cookie, readable by scripts, only says "a session exists" (SESSION_FLAG_COOKIE): the
 *   static pages use it to show "Mi cuenta" instead of "Crear cuenta". It grants nothing.
 *
 * Web Crypto only: the same code runs on Cloudflare Workers and on Node (dev server, tests).
 */
import { SESSION_DAYS, SESSION_FLAG_COOKIE } from '../../src/data/account.ts';

const SESSION_COOKIE = 'cnv_session';
const TOKEN_BYTES = 32;
/** 32 bytes in base64url. */
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

const encoder = new TextEncoder();

/** Whether the request came over HTTPS. Only local development does not: there the cookies cannot be Secure. */
export const isSecure = (request: Request): boolean => new URL(request.url).protocol === 'https:';

const sessionCookieName = (secure: boolean): string => (secure ? `__Host-${SESSION_COOKIE}` : SESSION_COOKIE);

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const newSessionToken = (): string => toBase64Url(crypto.getRandomValues(new Uint8Array(TOKEN_BYTES)));

/** What the database keeps of a token: its SHA-256, in hexadecimal. */
export const hashSessionToken = async (token: string): Promise<string> => {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(token)));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/** The session token a request carries, or null when it has none (or something that is not one). */
export const sessionTokenOf = (request: Request): string | null => {
  const name = sessionCookieName(isSecure(request));
  for (const pair of (request.headers.get('Cookie') ?? '').split(';')) {
    const at = pair.indexOf('=');
    if (at < 0 || pair.slice(0, at).trim() !== name) continue;
    const value = pair.slice(at + 1).trim();
    return TOKEN.test(value) ? value : null;
  }
  return null;
};

const cookie = (name: string, value: string, maxAge: number, secure: boolean, httpOnly: boolean): string =>
  [
    `${name}=${value}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'SameSite=Lax',
    ...(secure ? ['Secure'] : []),
    ...(httpOnly ? ['HttpOnly'] : []),
  ].join('; ');

/** The Set-Cookie headers that sign a customer in: the session and the flag the pages read. */
export const sessionCookies = (token: string, secure: boolean): Array<string> => [
  cookie(sessionCookieName(secure), token, MAX_AGE, secure, true),
  cookie(SESSION_FLAG_COOKIE, '1', MAX_AGE, secure, false),
];

/** The Set-Cookie headers that sign a customer out. */
export const expiredSessionCookies = (secure: boolean): Array<string> => [
  cookie(sessionCookieName(secure), '', 0, secure, true),
  cookie(SESSION_FLAG_COOKIE, '', 0, secure, false),
];
