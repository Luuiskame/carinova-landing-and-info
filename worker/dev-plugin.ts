/**
 * Serves /api/* inside `astro dev`, so the forms and the sign-in work with one command and no
 * Cloudflare tooling. Development only: production runs worker/index.ts on Cloudflare, and
 * `npm run preview` runs that same Worker locally.
 *
 * Settings come from `.env` (see .env.example). What is missing gets a stand-in, so everything can
 * be tried before any account exists:
 *   - no RESEND_API_KEY / EMAIL_FROM → e-mails are printed in this terminal instead of sent
 *     (confirmation links and sign-in codes included)
 *   - no DATABASE_URL                → customers and sessions are kept in memory until the server restarts
 *   - no SIGNUP_TOKEN_SECRET         → a random one per server start
 *   - no OWNER_EMAIL                 → the requests of companies are printed too, but only while
 *                                      e-mails are: a real mailer never writes to a made-up address
 */
import { randomBytes } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { loadEnv, type Plugin } from 'vite';
import { handleApi, type Deps } from './api.ts';
import { consoleMailer, resendMailer } from './mailer.ts';
import { isUsableSecret } from './signup/token.ts';
import { memoryStore, neonStore } from './store.ts';

const toRequest = async (req: IncomingMessage): Promise<Request> => {
  const chunks: Array<Buffer> = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);

  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  return new Request(`http://${req.headers.host ?? 'localhost'}${req.url}`, {
    method: req.method,
    headers,
    body: hasBody ? Buffer.concat(chunks) : undefined,
  });
};

export const devApi = (): Plugin => ({
  name: 'carinova-dev-api',
  apply: 'serve',
  configureServer(server) {
    const env = loadEnv(server.config.mode, server.config.root, '');
    const print = (message: string) => server.config.logger.info(`\n[api] ${message}\n`);

    const standIns: Array<string> = [];
    const useStandIn = <T>(description: string, standIn: T): T => {
      standIns.push(description);
      return standIn;
    };

    const realMailer = env.RESEND_API_KEY && env.EMAIL_FROM ? resendMailer(env.RESEND_API_KEY, env.EMAIL_FROM) : null;

    const deps: Deps = {
      tokenSecret: isUsableSecret(env.SIGNUP_TOKEN_SECRET)
        ? env.SIGNUP_TOKEN_SECRET
        : useStandIn('a temporary SIGNUP_TOKEN_SECRET', randomBytes(32).toString('base64')),
      mailer: realMailer ?? useStandIn('e-mails printed here instead of sent', consoleMailer(print)),
      store: env.DATABASE_URL
        ? neonStore(env.DATABASE_URL)
        : useStandIn('customers and sessions kept in memory', memoryStore()),
      notifyTo: env.SIGNUP_NOTIFY_TO || undefined,
      // With the real mailer and no OWNER_EMAIL the form for companies answers "not available", as
      // in production.
      ownerEmail:
        env.OWNER_EMAIL ||
        (realMailer ? undefined : useStandIn('no OWNER_EMAIL: company requests printed here', 'owner@carinova.test')),
      log: print,
    };
    if (standIns.length > 0) print(`API in development mode: ${standIns.join('; ')}. See .env.example.`);

    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith('/api/')) return next();
      try {
        const response = await handleApi(await toRequest(req), deps);
        res.statusCode = response.status;
        response.headers.forEach((value, name) => {
          // Several cookies are several headers: forEach would hand them over joined into one.
          if (name !== 'set-cookie') res.setHeader(name, value);
        });
        const cookies = response.headers.getSetCookie();
        if (cookies.length > 0) res.setHeader('Set-Cookie', cookies);
        res.end(await response.text());
      } catch (error) {
        next(error);
      }
    });
  },
});
