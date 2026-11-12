/**
 * Signing in (/ingresar) and the customer's session: the numbers the pages state and the Worker
 * enforces (worker/auth), so the two cannot disagree. The privacy policy (src/data/legal) states the
 * minutes and the days too. No imports: the Worker bundles this file.
 */

/** Digits of the code e-mailed to sign in. */
export const LOGIN_CODE_DIGITS = 6;

/** Minutes a code stays valid. */
export const LOGIN_CODE_MINUTES = 10;

/** Wrong codes accepted before a new one has to be requested. */
export const LOGIN_CODE_ATTEMPTS = 5;

/** Codes a customer can be sent: in a quarter of an hour, and in a day. */
export const LOGIN_CODES_PER_15_MINUTES = 3;
export const LOGIN_CODES_PER_DAY = 10;

/** Seconds the page waits before it offers to send another code. */
export const LOGIN_RESEND_SECONDS = 30;

/** Days a customer stays signed in on a browser. */
export const SESSION_DAYS = 30;

/**
 * Cookie that tells the pages a customer is signed in, so "Abrir mi casillero" can give way to
 * "Mi casillero" before the first paint (SessionState.astro). It carries no secret and grants
 * nothing: the session itself is another cookie, one that scripts cannot read
 * (worker/auth/session.ts).
 */
export const SESSION_FLAG_COOKIE = 'cnv_in';
