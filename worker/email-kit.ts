/**
 * What every e-mail of the site is built with: the page around the message and its pieces
 * (headings, paragraphs, the orange button, tables), in HTML and in plain text. The e-mails
 * themselves are in signup/emails.ts, auth/emails.ts and business/emails.ts.
 */
import { LOCALE_INFO, type Locale } from '../src/i18n/locales.ts';
import { textOf } from './text/index.ts';

export interface Message {
  subject: string;
  html: string;
  text: string;
}

/** The line under every message, in its language (worker/text). */
export const taglineOf = (locale: Locale): string => textOf(locale).tagline;

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Everything a visitor typed goes through this before it is placed in HTML. */
export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (char) => ENTITIES[char]);

/** Arial draws Arabic in a book hand; the interface fonts of the devices come first there. */
const fontOf = (locale: Locale): string =>
  LOCALE_INFO[locale].dir === 'rtl' ? "'Segoe UI',Tahoma,Arial,Helvetica,sans-serif" : 'Arial,Helvetica,sans-serif';

// E-mail clients ignore <style> blocks often enough that every style is inline.
export const layout = (preheader: string, content: string, locale: Locale = 'es'): string => `<!doctype html>
<html lang="${LOCALE_INFO[locale].htmlLang}" dir="${LOCALE_INFO[locale].dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Carinova</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;font-family:${fontOf(locale)};font-size:16px;line-height:1.5;color:#1e293b;">
<tr><td style="background:#06172F;border-radius:12px 12px 0 0;padding:20px 28px;font-size:24px;font-weight:bold;color:#ffffff;">Carinova</td></tr>
<tr><td style="padding:28px 28px 12px;">
${content}
</td></tr>
<tr><td style="padding:0 28px 28px;font-size:13px;color:#64748b;">${taglineOf(locale)}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

export const h1 = (text: string) =>
  `<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#06172F;">${text}</h1>`;
export const h2 = (text: string) =>
  `<h2 style="margin:28px 0 8px;font-size:18px;line-height:1.3;color:#06172F;">${text}</h2>`;
export const p = (html: string) => `<p style="margin:0 0 16px;">${html}</p>`;
export const small = (html: string) => `<p style="margin:0 0 16px;font-size:14px;color:#475569;">${html}</p>`;
export const link = (href: string, text: string) => `<a href="${escapeHtml(href)}" style="color:#1164CF;">${text}</a>`;
// Room on both sides: the bullets are on the left in most languages and on the right in Arabic.
export const list = (items: Array<string>) =>
  `<ul style="margin:0 0 16px;padding:0 20px;">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;

/** A value to read at a glance and copy: the Carinova ID, a sign-in code. */
export const big = (text: string) =>
  `<p style="margin:0 0 16px;font-size:30px;font-weight:bold;letter-spacing:2px;color:#06172F;">${escapeHtml(text)}</p>`;

/** Orange with navy text, like the buttons of the site (white on this orange is too faint). */
export const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="background:#FF8A00;border-radius:8px;">` +
  `<a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-weight:bold;color:#06172F;text-decoration:none;">${label}</a>` +
  `</td></tr></table>`;

export interface Row {
  label: string;
  value: string;
}

// A value is data (an address in the United States, a name, a phone): it is written from left to
// right whatever the language of the message, so it keeps its order in an Arabic e-mail.
export const table = (rows: Array<Row>) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border:1px solid #e2e8f0;border-radius:8px;">${rows
    .map(
      ({ label, value }, index) =>
        `<tr><td style="padding:8px 12px;width:44%;font-size:13px;color:#64748b;vertical-align:top;${index ? 'border-top:1px solid #e2e8f0;' : ''}">${escapeHtml(label)}</td>` +
        `<td style="padding:8px 12px;font-weight:bold;color:#06172F;${index ? 'border-top:1px solid #e2e8f0;' : ''}"><span dir="ltr">${escapeHtml(value).replace(/\n/g, '<br>')}</span></td></tr>`
    )
    .join('')}</table>`;

export const textRows = (rows: Array<Row>) => rows.map(({ label, value }) => `${label}: ${value}`).join('\n');
export const textList = (items: Array<string>) => items.map((item) => `- ${item}`).join('\n');
