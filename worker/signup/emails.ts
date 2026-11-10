/**
 * The e-mails of the sign-up flow: confirmation link, welcome (customer number + Miami address)
 * and the notification to Carinova's team. Each one has an HTML and a plain-text version.
 * The business details come from src/data/carinova.ts, like on the site.
 */
import { CONTACT, MIAMI_ADDRESS, RESTRICTED_ITEMS, WA_MESSAGES, miamiAddressRows } from '../../src/data/carinova.ts';
import { CONFIRM_LINK_HOURS, SIGNUP_COUNTRIES } from '../../src/data/signup.ts';
import { whatsappLink } from '../../src/utils/whatsapp.ts';
import type { Customer } from './store.ts';
import type { SignupData } from './validate.ts';

export interface Message {
  subject: string;
  html: string;
  text: string;
}

const TAGLINE = 'Carinova · Courier de Estados Unidos a Nicaragua';

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Everything a visitor typed goes through this before it is placed in HTML. */
export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (char) => ENTITIES[char]);

// E-mail clients ignore <style> blocks often enough that every style is inline.
const layout = (preheader: string, content: string): string => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Carinova</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#1e293b;">
<tr><td style="background:#011028;border-radius:12px 12px 0 0;padding:20px 28px;font-size:24px;font-weight:bold;color:#ffffff;">Carinova</td></tr>
<tr><td style="padding:28px 28px 12px;">
${content}
</td></tr>
<tr><td style="padding:0 28px 28px;font-size:13px;color:#64748b;">${TAGLINE}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const h1 = (text: string) => `<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#011028;">${text}</h1>`;
const h2 = (text: string) => `<h2 style="margin:28px 0 8px;font-size:18px;line-height:1.3;color:#011028;">${text}</h2>`;
const p = (html: string) => `<p style="margin:0 0 16px;">${html}</p>`;
const small = (html: string) => `<p style="margin:0 0 16px;font-size:14px;color:#475569;">${html}</p>`;
const link = (href: string, text: string) => `<a href="${escapeHtml(href)}" style="color:#053A86;">${text}</a>`;
const list = (items: Array<string>) =>
  `<ul style="margin:0 0 16px;padding-left:20px;">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;

/** Orange with navy text, like the buttons of the site (white on this orange is too faint). */
const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="background:#FA7005;border-radius:999px;">` +
  `<a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-weight:bold;color:#011028;text-decoration:none;">${label}</a>` +
  `</td></tr></table>`;

const table = (rows: Array<{ label: string; value: string }>) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border:1px solid #e2e8f0;border-radius:8px;">${rows
    .map(
      ({ label, value }, index) =>
        `<tr><td style="padding:8px 12px;width:44%;font-size:13px;color:#64748b;${index ? 'border-top:1px solid #e2e8f0;' : ''}">${escapeHtml(label)}</td>` +
        `<td style="padding:8px 12px;font-weight:bold;color:#011028;${index ? 'border-top:1px solid #e2e8f0;' : ''}">${escapeHtml(value)}</td></tr>`
    )
    .join('')}</table>`;

const textRows = (rows: Array<{ label: string; value: string }>) =>
  rows.map(({ label, value }) => `${label}: ${value}`).join('\n');
const textList = (items: Array<string>) => items.map((item) => `- ${item}`).join('\n');

/** Step 1: the link that proves the address is theirs. No account exists until it is opened. */
export const verificationEmail = (firstName: string, confirmUrl: string): Message => ({
  subject: 'Confirma tu correo para abrir tu casillero Carinova',
  html: layout(
    'Un paso más y tu casillero queda listo.',
    [
      h1(`Hola, ${escapeHtml(firstName)}:`),
      p(
        'Recibimos tu solicitud para abrir un casillero en Carinova. Confirma tu correo para crear tu cuenta y recibir tu dirección en Miami.'
      ),
      button(confirmUrl, 'Confirmar mi correo'),
      small(
        `El enlace vence en ${CONFIRM_LINK_HOURS} horas. Si el botón no funciona, ${link(confirmUrl, 'abre este enlace')}.`
      ),
      small('Si no fuiste tú, ignora este mensaje: no se creará ninguna cuenta.'),
    ].join('\n')
  ),
  text: [
    `Hola, ${firstName}:`,
    'Recibimos tu solicitud para abrir un casillero en Carinova. Abre este enlace para confirmar tu correo, crear tu cuenta y recibir tu dirección en Miami:',
    confirmUrl,
    `El enlace vence en ${CONFIRM_LINK_HOURS} horas. Si no fuiste tú, ignora este mensaje: no se creará ninguna cuenta.`,
    TAGLINE,
  ].join('\n\n'),
});

/** Step 2, once the account exists: customer number, Miami address and what cannot be shipped. */
export const welcomeEmail = (customer: Customer, siteUrl: string): Message => {
  const rows = miamiAddressRows(customer.firstName, customer.lastName);
  const restrictedUrl = `${siteUrl}/articulos-prohibidos`;
  const whatsappUrl = whatsappLink(CONTACT.whatsapp, WA_MESSAGES.customer(customer.code));
  const { prohibited, noAir } = RESTRICTED_ITEMS;

  return {
    subject: `Tu casillero Carinova está listo: ${customer.code}`,
    html: layout(
      `Tu número de cliente es ${customer.code}. Aquí está tu dirección en Miami.`,
      [
        h1(`¡Tu casillero está listo, ${escapeHtml(customer.firstName)}!`),
        p('Este es tu número de cliente. Guárdalo: con él identificamos tu cuenta.'),
        `<p style="margin:0 0 8px;font-size:30px;font-weight:bold;letter-spacing:1px;color:#011028;">${escapeHtml(customer.code)}</p>`,
        h2('Tu dirección en Miami'),
        p('Úsala como dirección de envío cuando compres en tiendas de Estados Unidos:'),
        table(rows),
        list(MIAMI_ADDRESS.notes),
        h2('Antes de comprar'),
        p(`<strong>${escapeHtml(prohibited.title)}.</strong> ${escapeHtml(prohibited.summary)}`),
        list(prohibited.items),
        p(`<strong>${escapeHtml(noAir.title)}.</strong> ${escapeHtml(noAir.summary)}`),
        list(noAir.items),
        p(link(restrictedUrl, 'Ver esta lista en nuestro sitio')),
        h2('¿Tienes dudas?'),
        p(`Escríbenos por WhatsApp al ${escapeHtml(CONTACT.whatsappDisplay)}.`),
        button(whatsappUrl, 'Escribir por WhatsApp'),
      ].join('\n')
    ),
    text: [
      `¡Tu casillero está listo, ${customer.firstName}!`,
      `Tu número de cliente: ${customer.code}\nGuárdalo: con él identificamos tu cuenta.`,
      `TU DIRECCIÓN EN MIAMI\nÚsala como dirección de envío cuando compres en tiendas de Estados Unidos:\n\n${textRows(rows)}`,
      textList(MIAMI_ADDRESS.notes),
      `ANTES DE COMPRAR\n\n${prohibited.title}. ${prohibited.summary}\n${textList(prohibited.items)}`,
      `${noAir.title}. ${noAir.summary}\n${textList(noAir.items)}`,
      `Lista en nuestro sitio: ${restrictedUrl}`,
      `¿Tienes dudas? Escríbenos por WhatsApp al ${CONTACT.whatsappDisplay}: ${whatsappUrl}`,
      TAGLINE,
    ].join('\n\n'),
  };
};

/** For Carinova's team: a new customer confirmed their e-mail (there is no admin panel yet). */
export const teamNotificationEmail = (customer: Customer, data: SignupData): Message => {
  const country = SIGNUP_COUNTRIES.find(({ code }) => code === data.country);
  const rows = [
    { label: 'Número de cliente', value: customer.code },
    { label: 'Nombre', value: `${data.firstName} ${data.lastName}` },
    { label: 'Correo', value: data.email },
    { label: 'Teléfono', value: data.phone },
    { label: 'País', value: country?.name ?? data.country },
    { label: 'Dirección', value: [data.address1, data.address2].filter(Boolean).join(', ') },
    { label: 'Ciudad', value: data.city },
    { label: country?.stateLabel ?? 'Estado', value: data.state },
    { label: 'Código postal', value: data.postalCode || '—' },
  ];
  const chatUrl = whatsappLink(data.phone);

  return {
    subject: `Nuevo casillero ${customer.code}: ${data.firstName} ${data.lastName}`,
    html: layout(
      `${data.firstName} ${data.lastName} abrió su casillero en el sitio web.`,
      [
        h1(`Nuevo casillero: ${escapeHtml(customer.code)}`),
        p('Un cliente se registró en el sitio web y confirmó su correo.'),
        table(rows),
        button(chatUrl, 'Escribirle por WhatsApp'),
      ].join('\n')
    ),
    text: [
      `Nuevo casillero: ${customer.code}`,
      'Un cliente se registró en el sitio web y confirmó su correo.',
      textRows(rows),
      `WhatsApp del cliente: ${chatUrl}`,
    ].join('\n\n'),
  };
};
