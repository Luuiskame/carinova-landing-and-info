/**
 * The one-time codes customers sign in with (/ingresar): no password to choose, forget or leak.
 * A code is e-mailed to the address of the account, works once and for a few minutes, and only a few
 * wrong guesses are accepted before a new one has to be requested (src/data/account.ts has the
 * numbers; store.ts enforces them).
 *
 * The database keeps an HMAC of the code, keyed with a secret that is not in the database: six
 * digits are few enough to be guessed from a plain hash, so without the key a copy of the table
 * tells nothing. The e-mail address is part of what is hashed, so a code only works for its account.
 *
 * Web Crypto only: the same code runs on Cloudflare Workers and on Node (dev server, tests).
 */
import { LOGIN_CODE_DIGITS } from '../../src/data/account.ts';

const encoder = new TextEncoder();

/** Keeps this use of the secret apart from the others (the confirmation links are encrypted with it too). */
const CONTEXT = 'carinova-login-code-v1';

/** Every code from 000000 to 999999 is as likely as any other. */
export const newLoginCode = (): string => {
  const codes = 10 ** LOGIN_CODE_DIGITS;
  // Random 32-bit numbers past the last full run of `codes` would favour the low codes: draw again.
  const fair = Math.floor(2 ** 32 / codes) * codes;
  const draw = new Uint32Array(1);
  do crypto.getRandomValues(draw);
  while (draw[0] >= fair);
  return String(draw[0] % codes).padStart(LOGIN_CODE_DIGITS, '0');
};

/** What was typed as a code, digits only ("123 456" is fine), or null when it cannot be one. */
export const normalizeLoginCode = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.length > 4 * LOGIN_CODE_DIGITS) return null;
  const digits = value.replace(/[\s-]/g, '');
  return new RegExp(`^\\d{${LOGIN_CODE_DIGITS}}$`).test(digits) ? digits : null;
};

/** What the database keeps of a code. `email` is the account's address, lower case. */
export const hashLoginCode = async (code: string, email: string, secret: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`${CONTEXT}:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(`${email}\n${code}`)));
  return Array.from(mac, (byte) => byte.toString(16).padStart(2, '0')).join('');
};
