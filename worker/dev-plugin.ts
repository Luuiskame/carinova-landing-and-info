/**
 * Serves /api/* inside `astro dev`, so the sign-up form works with one command and no Cloudflare
 * tooling. Development only: production runs worker/index.ts on Cloudflare, and `npm run preview`
 * runs that same Worker locally.
 *
 * Settings come from `.env` (see .env.example). What is missing gets a stand-in, so the whole
 * flow can be tried before any account exists:
 *   - no RESEND_API_KEY / EMAIL_FROM → e-mails are printed in this terminal instead of sent
 *   - no DATABASE_URL                → customers are kept in memory until the server restarts
 *   - no SIGNUP_TOKEN_SECRET         → a random one per server start
 */
import { randomBytes } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { loadEnv, type Plugin } from 'vite';
import { handleApi, type Deps } from './api.ts';
import { consoleMailer, resendMailer } from './signup/mailer.ts';
import { memoryStore, neonStore } from './signup/store.ts';
import { isUsableSecret } from './signup/token.ts';

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

    const deps: Deps = {
      tokenSecret: isUsableSecret(env.SIGNUP_TOKEN_SECRET)
        ? env.SIGNUP_TOKEN_SECRET
        : useStandIn('a temporary SIGNUP_TOKEN_SECRET', randomBytes(32).toString('base64')),
      mailer:
        env.RESEND_API_KEY && env.EMAIL_FROM
          ? resendMailer(env.RESEND_API_KEY, env.EMAIL_FROM)
          : useStandIn('e-mails printed here instead of sent', consoleMailer(print)),
      store: env.DATABASE_URL ? neonStore(env.DATABASE_URL) : useStandIn('customers kept in memory', memoryStore()),
      notifyTo: env.SIGNUP_NOTIFY_TO || undefined,
      log: print,
    };
    if (standIns.length > 0) print(`Sign-up API in development mode: ${standIns.join('; ')}. See .env.example.`);

    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith('/api/')) return next();
      try {
        const response = await handleApi(await toRequest(req), deps);
        res.statusCode = response.status;
        response.headers.forEach((value, name) => res.setHeader(name, value));
        res.end(await response.text());
      } catch (error) {
        next(error);
      }
    });
  },
});
