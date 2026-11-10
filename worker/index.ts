/**
 * Cloudflare Worker of the site (see wrangler.jsonc).
 *
 * The pages are static files in dist/, which Cloudflare serves without running this code. The
 * Worker runs for /api/* (the sign-up endpoints, api.ts) and for requests that match no file,
 * which it hands back to the asset server so they get the 404 page.
 */
import { handleApi, type Deps } from './api.ts';
import { resendMailer } from './signup/mailer.ts';
import { neonStore } from './signup/store.ts';

/**
 * Bindings. The secrets are optional in the type because a deploy can lack them; the API then
 * answers 503 and the form offers WhatsApp instead. Names and values: README → "Sign-up backend".
 */
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  DATABASE_URL?: string;
  SIGNUP_TOKEN_SECRET?: string;
  SIGNUP_NOTIFY_TO?: string;
}

interface WorkerContext {
  waitUntil(work: Promise<unknown>): void;
}

const depsFromEnv = (env: Env, ctx: WorkerContext): Deps => ({
  tokenSecret: env.SIGNUP_TOKEN_SECRET,
  mailer: env.RESEND_API_KEY && env.EMAIL_FROM ? resendMailer(env.RESEND_API_KEY, env.EMAIL_FROM) : undefined,
  store: env.DATABASE_URL ? neonStore(env.DATABASE_URL) : undefined,
  notifyTo: env.SIGNUP_NOTIFY_TO || undefined,
  waitUntil: (work) => ctx.waitUntil(work),
});

export default {
  async fetch(request: Request, env: Env, ctx: WorkerContext): Promise<Response> {
    if (new URL(request.url).pathname.startsWith('/api/')) return handleApi(request, depsFromEnv(env, ctx));
    return env.ASSETS.fetch(request);
  },
};
