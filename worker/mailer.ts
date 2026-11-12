/** Sends e-mail through Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email). */

export interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export type SendResult = { ok: true } | { ok: false; reason: 'invalid_recipient' | 'failed'; detail: string };

export interface Mailer {
  send(email: Email): Promise<SendResult>;
}

interface ResendOptions {
  fetch?: typeof fetch;
  /** Pause before the one retry after a "too many requests" answer. */
  retryDelayMs?: number;
}

/** An address without a name is sent as "Carinova <address>": inboxes show the name, not the address. */
const senderOf = (from: string): string => (from.includes('<') ? from.trim() : `Carinova <${from.trim()}>`);

/**
 * @param sender `Carinova <casillero@example.com>` or the address alone. Its domain must be verified in Resend.
 */
export const resendMailer = (
  apiKey: string,
  sender: string,
  { fetch: fetchImpl = fetch, retryDelayMs = 1100 }: ResendOptions = {}
): Mailer => ({
  async send({ to, subject, html, text, replyTo }) {
    const from = senderOf(sender);
    const request = () =>
      fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [to], subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
      });

    let response: Response;
    try {
      response = await request();
      // Resend allows a few requests per second. The welcome e-mail and the team notification go
      // out back to back, so one of them can be told to slow down: wait and try once more.
      if (response.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        response = await request();
      }
    } catch (error) {
      return { ok: false, reason: 'failed', detail: `Resend could not be reached: ${String(error)}` };
    }
    if (response.ok) return { ok: true };

    // Resend answers errors with { statusCode, name, message }.
    const body = (await response.json().catch(() => ({}))) as { name?: string; message?: string };
    const rejectedRecipient = response.status === 422 && /`to`/.test(body.message ?? '');
    return {
      ok: false,
      reason: rejectedRecipient ? 'invalid_recipient' : 'failed',
      // A rejected recipient's message repeats the address: keep customers' addresses out of the logs.
      detail:
        `Resend ${response.status} ${body.name ?? ''}${rejectedRecipient ? '' : `: ${body.message ?? ''}`}`.trim(),
    };
  },
});

/** For `astro dev` without Resend credentials: prints the message instead of sending it. */
export const consoleMailer = (print: (message: string) => void): Mailer => ({
  async send({ to, subject, text }) {
    print(`E-mail not sent (RESEND_API_KEY or EMAIL_FROM is not set)\nTo: ${to}\nSubject: ${subject}\n\n${text}`);
    return { ok: true };
  },
});
