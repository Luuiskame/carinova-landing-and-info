/**
 * The site's API.
 *
 *   POST /api/signup          validates the sign-up form and e-mails a confirmation link
 *   POST /api/signup/confirm  opens the link's token, creates the customer and signs them in
 *   POST /api/login           e-mails a one-time code to the customer of an address
 *   POST /api/login/verify    checks the code and signs the customer in
 *   POST /api/logout          ends the session
 *   GET  /api/account         the account of the customer who is signed in
 *   POST /api/business        e-mails a company's request to Carinova's owner
 *
 * Nothing is stored between the two steps of a sign-up: the link carries it, encrypted (token.ts).
 * A session is a random token in a cookie that scripts cannot read; the database keeps its hash
 * (auth/session.ts). Requests are accepted from the site's own pages only.
 *
 * Plain Request → Response with its collaborators passed in, so the same code runs in the
 * Cloudflare Worker (index.ts), inside `astro dev` (dev-plugin.ts) and in the tests.
 */
import {
  LOGIN_CODES_PER_15_MINUTES,
  LOGIN_CODES_PER_DAY,
  LOGIN_CODE_ATTEMPTS,
  LOGIN_CODE_MINUTES,
  SESSION_DAYS,
} from '../src/data/account.ts';
import { CONTACT } from '../src/data/carinova.ts';
import { localeFrom, type Locale } from '../src/i18n/locales.ts';
import { localizePath } from '../src/i18n/routes.ts';
import { hashLoginCode, newLoginCode, normalizeLoginCode } from './auth/code.ts';
import { loginCodeEmail } from './auth/emails.ts';
import {
  expiredSessionCookies,
  hashSessionToken,
  isSecure,
  newSessionToken,
  sessionCookies,
  sessionTokenOf,
} from './auth/session.ts';
import { businessInquiryEmail } from './business/emails.ts';
import { validateBusinessInquiry } from './business/validate.ts';
import type { Email, Mailer } from './mailer.ts';
import { teamNotificationEmail, verificationEmail, welcomeEmail } from './signup/emails.ts';
import { isUsableSecret, openToken, sealToken } from './signup/token.ts';
import { validateSignup, type SignupData } from './signup/validate.ts';
import type { Customer, Store } from './store.ts';
import { cleanEmail, isEmail, normalizeEmail } from './validation.ts';

export interface Deps {
  /** Encrypts the confirmation links and keys the hashes of the sign-in codes; at least 32 characters. */
  tokenSecret?: string;
  mailer?: Mailer;
  store?: Store;
  /** Inbox that is told about every new customer. Optional. */
  notifyTo?: string;
  /** Inbox of Carinova's owner: where the requests of companies go. */
  ownerEmail?: string;
  /** Lets work continue after the response is sent (Workers: `ctx.waitUntil`). Without it, the work is awaited. */
  waitUntil?: (work: Promise<unknown>) => void;
  log?: (message: string) => void;
}

/** What a confirmation link carries. */
type PendingSignup = SignupData & { acceptedAt: string; locale?: Locale };

interface Context {
  request: Request;
  /** The JSON object that was posted; empty for GET. */
  body: Record<string, unknown>;
  /** The site's own origin, e.g. "https://carinovanic.com". */
  origin: string;
  /** The language of the page that sent the request (`lang`); Spanish by default. */
  locale: Locale;
  deps: Deps;
  log: (message: string) => void;
}

type Handler = (context: Context) => Promise<Response>;

/** A real submission is under 3 KB (a company's message is the longest thing anybody sends). */
const MAX_BODY_CHARS = 10_000;

const json = (status: number, body: unknown, { cookies = [] as Array<string>, allow = '' } = {}): Response => {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  if (allow) headers.set('Allow', allow);
  for (const cookie of cookies) headers.append('Set-Cookie', cookie);
  return new Response(JSON.stringify(body), { status, headers });
};

/** The forms show a "write to us on WhatsApp" fallback for this answer. */
const unavailable = (): Response => json(503, { ok: false, error: 'unavailable' });

/** Names of the settings a handler needs and does not have, for the log. */
const missing = (deps: Deps, needs: Array<'secret' | 'mailer' | 'store' | 'owner'>): string =>
  [
    needs.includes('secret') && !isUsableSecret(deps.tokenSecret) && 'SIGNUP_TOKEN_SECRET (32 characters or more)',
    needs.includes('mailer') && !deps.mailer && 'RESEND_API_KEY and EMAIL_FROM',
    needs.includes('store') && !deps.store && 'DATABASE_URL',
    needs.includes('owner') && !deps.ownerEmail && 'OWNER_EMAIL',
  ]
    .filter(Boolean)
    .join(', ');

const TEXT = {
  es: {
    emailMissing: 'Escribí tu correo electrónico.',
    emailInvalid: 'Revisá tu correo: no parece válido.',
    emailRejected: 'No pudimos enviar un mensaje a este correo. Revisá que esté bien escrito.',
  },
  en: {
    emailMissing: 'Enter your e-mail.',
    emailInvalid: 'Check your e-mail: it does not look valid.',
    emailRejected: 'We could not send a message to this e-mail. Check that it is written correctly.',
  },
};

// ───────────────────────────── Sign-up ─────────────────────────────

const signup: Handler = async ({ body, origin, locale, deps, log }) => {
  // All three, database included: a link that could not create the account would be a dead end.
  if (!isUsableSecret(deps.tokenSecret) || !deps.mailer || !deps.store) {
    log(`[signup] not configured, missing: ${missing(deps, ['secret', 'mailer', 'store'])}`);
    return unavailable();
  }

  // Honeypot: a field people never see. Whatever fills it gets a success and no e-mail.
  if (typeof body.contact_time === 'string' && body.contact_time.trim() !== '') return json(200, { ok: true });

  const result = validateSignup(body, locale);
  if (!result.ok) return json(422, { ok: false, error: 'validation', fields: result.fields });
  const { data } = result;

  // The link opens the confirmation page of the language the form was filled in.
  const pending: PendingSignup = { ...data, acceptedAt: new Date().toISOString(), locale };
  const confirmPath = localizePath('/registro/confirmar', locale);
  const confirmUrl = `${origin}${confirmPath}?token=${await sealToken(pending, deps.tokenSecret)}`;
  const sent = await deps.mailer.send({
    to: data.email,
    replyTo: CONTACT.email || undefined,
    ...verificationEmail(data.firstName, confirmUrl, locale),
  });

  if (sent.ok) return json(200, { ok: true });
  if (sent.reason === 'invalid_recipient') {
    return json(422, { ok: false, error: 'validation', fields: { email: TEXT[locale].emailRejected } });
  }
  log(`[signup] confirmation e-mail not sent: ${sent.detail}`);
  return unavailable();
};

/** Welcome e-mail to the customer and, when configured, the notification to Carinova's team. */
const announce = async (
  customer: Customer,
  data: SignupData,
  origin: string,
  locale: Locale,
  mailer: Mailer,
  notifyTo: string | undefined,
  log: (message: string) => void
): Promise<void> => {
  const emails: Array<Email> = [
    { to: data.email, replyTo: CONTACT.email || undefined, ...welcomeEmail(customer, origin, locale) },
  ];
  if (notifyTo) emails.push({ to: notifyTo, replyTo: data.email, ...teamNotificationEmail(customer, data, locale) });

  for (const email of emails) {
    const sent = await mailer.send(email);
    if (!sent.ok) log(`[signup] e-mail "${email.subject}" not sent: ${sent.detail}`);
  }
};

const confirm: Handler = async ({ request, body, origin, deps, log }) => {
  if (!isUsableSecret(deps.tokenSecret) || !deps.store) {
    log(`[signup] not configured, missing: ${missing(deps, ['secret', 'store'])}`);
    return unavailable();
  }

  const opened = await openToken<PendingSignup>(typeof body.token === 'string' ? body.token : '', deps.tokenSecret);
  if (!opened.ok) {
    return opened.reason === 'expired'
      ? json(410, { ok: false, error: 'expired' })
      : json(400, { ok: false, error: 'invalid_token' });
  }
  const { acceptedAt, locale: pendingLocale, ...data } = opened.data;
  const locale = localeFrom(pendingLocale);

  // Whoever opens the link has just proved the address is theirs: the confirmation that creates the
  // account also signs them in. Opening the same link again returns the same customer
  // (isNew: false), signs nobody in and sends nothing.
  const token = newSessionToken();
  const { isNew, signedIn, ...customer } = await deps.store.create(data, {
    termsAcceptedAt: new Date(acceptedAt),
    locale,
    session: { tokenHash: await hashSessionToken(token), days: SESSION_DAYS },
  });
  if (isNew && deps.mailer) {
    const work = announce(customer, data, origin, locale, deps.mailer, deps.notifyTo, log);
    if (deps.waitUntil) deps.waitUntil(work);
    else await work;
  }
  return json(
    200,
    { ok: true, isNew, signedIn, customer },
    { cookies: signedIn ? sessionCookies(token, isSecure(request)) : [] }
  );
};

// ───────────────────────────── Sign-in ─────────────────────────────

/**
 * Asks for a code. The answer is the same whether or not the address has an account, so the form
 * cannot be used to find out who is a customer; the code is e-mailed after the answer for the same
 * reason (sending takes time only when there is someone to send to).
 */
const login: Handler = async ({ body, locale, deps, log }) => {
  if (!isUsableSecret(deps.tokenSecret) || !deps.mailer || !deps.store) {
    log(`[login] not configured, missing: ${missing(deps, ['secret', 'mailer', 'store'])}`);
    return unavailable();
  }
  const { mailer } = deps;

  const typed = cleanEmail(body.email);
  if (!typed || !isEmail(typed)) {
    const email = typed ? TEXT[locale].emailInvalid : TEXT[locale].emailMissing;
    return json(422, { ok: false, error: 'validation', fields: { email } });
  }

  const code = newLoginCode();
  const recipient = await deps.store.issueLoginCode({
    email: typed,
    codeHash: await hashLoginCode(code, typed, deps.tokenSecret),
    minutes: LOGIN_CODE_MINUTES,
    limits: { per15Minutes: LOGIN_CODES_PER_15_MINUTES, perDay: LOGIN_CODES_PER_DAY },
  });

  if (recipient) {
    const work = mailer
      .send({ to: typed, replyTo: CONTACT.email || undefined, ...loginCodeEmail(recipient.firstName, code, locale) })
      .then((sent) => {
        if (!sent.ok) log(`[login] code e-mail not sent: ${sent.detail}`);
      });
    if (deps.waitUntil) deps.waitUntil(work);
    else await work;
  }
  return json(200, { ok: true });
};

/** Checks a code. One answer for every way of failing: wrong, expired, used, too many attempts, no such account. */
const verify: Handler = async ({ request, body, deps, log }) => {
  if (!isUsableSecret(deps.tokenSecret) || !deps.store) {
    log(`[login] not configured, missing: ${missing(deps, ['secret', 'store'])}`);
    return unavailable();
  }
  const refused = () => json(401, { ok: false, error: 'invalid_code' });

  const email = normalizeEmail(body.email);
  const code = normalizeLoginCode(body.code);
  if (!email || !code) return refused();

  const token = newSessionToken();
  const account = await deps.store.redeemLoginCode(
    email,
    await hashLoginCode(code, email, deps.tokenSecret),
    LOGIN_CODE_ATTEMPTS,
    { tokenHash: await hashSessionToken(token), days: SESSION_DAYS }
  );
  if (!account) return refused();
  return json(200, { ok: true, account }, { cookies: sessionCookies(token, isSecure(request)) });
};

const logout: Handler = async ({ request, deps }) => {
  const token = sessionTokenOf(request);
  if (token && deps.store) await deps.store.endSession(await hashSessionToken(token));
  return json(200, { ok: true }, { cookies: expiredSessionCookies(isSecure(request)) });
};

const account: Handler = async ({ request, deps, log }) => {
  if (!deps.store) {
    log(`[account] not configured, missing: ${missing(deps, ['store'])}`);
    return unavailable();
  }
  // Without a live session the cookies go too, so the pages stop showing "Mi casillero".
  const signedOut = () =>
    json(401, { ok: false, error: 'signed_out' }, { cookies: expiredSessionCookies(isSecure(request)) });

  const token = sessionTokenOf(request);
  if (!token) return signedOut();
  const found = await deps.store.findAccount(await hashSessionToken(token));
  return found ? json(200, { ok: true, account: found }) : signedOut();
};

// ───────────────────────────── Companies ─────────────────────────────

const business: Handler = async ({ body, locale, deps, log }) => {
  if (!deps.mailer || !deps.ownerEmail) {
    log(`[business] not configured, missing: ${missing(deps, ['mailer', 'owner'])}`);
    return unavailable();
  }

  // Honeypot, as in the sign-up form.
  if (typeof body.contact_time === 'string' && body.contact_time.trim() !== '') return json(200, { ok: true });

  const result = validateBusinessInquiry(body, locale);
  if (!result.ok) return json(422, { ok: false, error: 'validation', fields: result.fields });

  const sent = await deps.mailer.send({
    to: deps.ownerEmail,
    replyTo: result.data.email,
    ...businessInquiryEmail(result.data, locale),
  });
  if (sent.ok) return json(200, { ok: true });
  log(`[business] request not sent: ${sent.detail}`);
  return unavailable();
};

const ROUTES = new Map<string, { method: 'GET' | 'POST'; handler: Handler }>([
  ['/api/signup', { method: 'POST', handler: signup }],
  ['/api/signup/confirm', { method: 'POST', handler: confirm }],
  ['/api/login', { method: 'POST', handler: login }],
  ['/api/login/verify', { method: 'POST', handler: verify }],
  ['/api/logout', { method: 'POST', handler: logout }],
  ['/api/account', { method: 'GET', handler: account }],
  ['/api/business', { method: 'POST', handler: business }],
]);

export const handleApi = async (request: Request, deps: Deps): Promise<Response> => {
  const log = deps.log ?? ((message: string) => console.error(message));
  const url = new URL(request.url);

  const route = ROUTES.get(url.pathname);
  if (!route) return json(404, { ok: false, error: 'not_found' });
  if (request.method !== route.method) {
    return json(405, { ok: false, error: 'method_not_allowed' }, { allow: route.method });
  }

  // Only our own pages may call the API. Browsers say where a request comes from: `Sec-Fetch-Site`
  // on every request and `Origin` on every POST. Asking for JSON also makes a cross-site POST need a
  // CORS preflight, which is never answered, and the session cookie is SameSite=Lax, so another site
  // could not send it anyway.
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    return json(403, { ok: false, error: 'forbidden' });
  }
  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) return json(403, { ok: false, error: 'forbidden' });

  let body: Record<string, unknown> = {};
  if (route.method === 'POST') {
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
      return json(415, { ok: false, error: 'unsupported_media_type' });
    }
    const text = await request.text();
    if (text.length > MAX_BODY_CHARS) return json(413, { ok: false, error: 'too_large' });
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return json(400, { ok: false, error: 'bad_request' });
    }
    body = parsed as Record<string, unknown>;
  }

  try {
    return await route.handler({ request, body, origin: url.origin, locale: localeFrom(body.lang), deps, log });
  } catch (error) {
    // Typically the database: unreachable, or db/schema.sql was never applied.
    log(`[api] ${url.pathname} failed: ${error instanceof Error ? error.message : String(error)}`);
    return unavailable();
  }
};
