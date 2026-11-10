/**
 * The site's API: the two endpoints behind the sign-up form.
 *
 *   POST /api/signup          validates the form and e-mails a confirmation link
 *   POST /api/signup/confirm  opens the link's token and creates the customer
 *
 * Nothing is stored between the two steps: the link carries the sign-up, encrypted (token.ts).
 *
 * Plain Request → Response with its collaborators passed in, so the same code runs in the
 * Cloudflare Worker (index.ts), inside `astro dev` (dev-plugin.ts) and in the tests.
 */
import { CONTACT } from '../src/data/carinova.ts';
import { teamNotificationEmail, verificationEmail, welcomeEmail } from './signup/emails.ts';
import type { Email, Mailer } from './signup/mailer.ts';
import type { Customer, CustomerStore } from './signup/store.ts';
import { isUsableSecret, openToken, sealToken } from './signup/token.ts';
import { validateSignup, type SignupData } from './signup/validate.ts';

export interface Deps {
  /** Encrypts the confirmation links; at least 32 characters. */
  tokenSecret?: string;
  mailer?: Mailer;
  store?: CustomerStore;
  /** Inbox that is told about every new customer. Optional. */
  notifyTo?: string;
  /** Lets work continue after the response is sent (Workers: `ctx.waitUntil`). Without it, the work is awaited. */
  waitUntil?: (work: Promise<unknown>) => void;
  log?: (message: string) => void;
}

/** What a confirmation link carries. */
type PendingSignup = SignupData & { acceptedAt: string };

type Handler = (
  body: Record<string, unknown>,
  origin: string,
  deps: Deps,
  log: (message: string) => void
) => Promise<Response>;

/** A real submission is under 1 KB. */
const MAX_BODY_CHARS = 10_000;

const json = (status: number, body: unknown, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });

/** The form shows a "write to us on WhatsApp" fallback for this answer. */
const unavailable = (): Response => json(503, { ok: false, error: 'unavailable' });

const missingConfig = (deps: Deps): string =>
  [
    !isUsableSecret(deps.tokenSecret) && 'SIGNUP_TOKEN_SECRET (32 characters or more)',
    !deps.mailer && 'RESEND_API_KEY and EMAIL_FROM',
    !deps.store && 'DATABASE_URL',
  ]
    .filter(Boolean)
    .join(', ');

const signup: Handler = async (body, origin, deps, log) => {
  // All three, database included: a link that could not create the account would be a dead end.
  if (!isUsableSecret(deps.tokenSecret) || !deps.mailer || !deps.store) {
    log(`[signup] not configured, missing: ${missingConfig(deps)}`);
    return unavailable();
  }

  // Honeypot: a field people never see. Whatever fills it gets a success and no e-mail.
  if (typeof body.contact_time === 'string' && body.contact_time.trim() !== '') return json(200, { ok: true });

  const result = validateSignup(body);
  if (!result.ok) return json(422, { ok: false, error: 'validation', fields: result.fields });
  const { data } = result;

  const pending: PendingSignup = { ...data, acceptedAt: new Date().toISOString() };
  const confirmUrl = `${origin}/registro/confirmar?token=${await sealToken(pending, deps.tokenSecret)}`;
  const sent = await deps.mailer.send({
    to: data.email,
    replyTo: CONTACT.email || undefined,
    ...verificationEmail(data.firstName, confirmUrl),
  });

  if (sent.ok) return json(200, { ok: true });
  if (sent.reason === 'invalid_recipient') {
    const email = 'No pudimos enviar un mensaje a este correo. Revisa que esté bien escrito.';
    return json(422, { ok: false, error: 'validation', fields: { email } });
  }
  log(`[signup] confirmation e-mail not sent: ${sent.detail}`);
  return unavailable();
};

/** Welcome e-mail to the customer and, when configured, the notification to Carinova's team. */
const announce = async (
  customer: Customer,
  data: SignupData,
  origin: string,
  mailer: Mailer,
  notifyTo: string | undefined,
  log: (message: string) => void
): Promise<void> => {
  const emails: Array<Email> = [
    { to: data.email, replyTo: CONTACT.email || undefined, ...welcomeEmail(customer, origin) },
  ];
  if (notifyTo) emails.push({ to: notifyTo, replyTo: data.email, ...teamNotificationEmail(customer, data) });

  for (const email of emails) {
    const sent = await mailer.send(email);
    if (!sent.ok) log(`[signup] e-mail "${email.subject}" not sent: ${sent.detail}`);
  }
};

const confirm: Handler = async (body, origin, deps, log) => {
  if (!isUsableSecret(deps.tokenSecret) || !deps.store) {
    log(`[signup] not configured, missing: ${missingConfig(deps)}`);
    return unavailable();
  }

  const opened = await openToken<PendingSignup>(typeof body.token === 'string' ? body.token : '', deps.tokenSecret);
  if (!opened.ok) {
    return opened.reason === 'expired'
      ? json(410, { ok: false, error: 'expired' })
      : json(400, { ok: false, error: 'invalid_token' });
  }
  const { acceptedAt, ...data } = opened.data;

  // Opening the same link again returns the same customer (isNew: false) and sends nothing.
  const { isNew, ...customer } = await deps.store.create(data, new Date(acceptedAt));
  if (isNew && deps.mailer) {
    const work = announce(customer, data, origin, deps.mailer, deps.notifyTo, log);
    if (deps.waitUntil) deps.waitUntil(work);
    else await work;
  }
  return json(200, { ok: true, isNew, customer });
};

const ROUTES = new Map<string, Handler>([
  ['/api/signup', signup],
  ['/api/signup/confirm', confirm],
]);

export const handleApi = async (request: Request, deps: Deps): Promise<Response> => {
  const log = deps.log ?? ((message: string) => console.error(message));
  const url = new URL(request.url);

  const handler = ROUTES.get(url.pathname);
  if (!handler) return json(404, { ok: false, error: 'not_found' });
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method_not_allowed' }, { Allow: 'POST' });

  // Only our own pages may post here. Browsers send Origin with every POST, and asking for JSON
  // makes a cross-site request need a CORS preflight, which is never answered.
  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) return json(403, { ok: false, error: 'forbidden' });
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
    return json(415, { ok: false, error: 'unsupported_media_type' });
  }

  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) return json(413, { ok: false, error: 'too_large' });
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return json(400, { ok: false, error: 'bad_request' });
  }

  try {
    return await handler(body as Record<string, unknown>, url.origin, deps, log);
  } catch (error) {
    // Typically the database: unreachable, or db/schema.sql was never applied.
    log(`[signup] ${url.pathname} failed: ${error instanceof Error ? error.message : String(error)}`);
    return unavailable();
  }
};
