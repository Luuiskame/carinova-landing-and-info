/**
 * The e-mails of the sign-up flow: confirmation link, welcome (Carinova ID + Miami address) and the
 * notification to Carinova's team. Each one has an HTML and a plain-text version. The customer's
 * e-mails are written in the language they signed up in; the team's is in Spanish. The business
 * details come from src/data, like on the site.
 */
import { CONTACT } from '../../src/data/carinova.ts';
import { content } from '../../src/data/content.ts';
import { CONFIRM_LINK_HOURS } from '../../src/data/signup.ts';
import type { Locale } from '../../src/i18n/locales.ts';
import { localizePath } from '../../src/i18n/routes.ts';
import { whatsappLink } from '../../src/utils/whatsapp.ts';
import {
  TAGLINE,
  big,
  button,
  escapeHtml,
  h1,
  h2,
  layout,
  link,
  list,
  p,
  small,
  table,
  textList,
  textRows,
  type Message,
} from '../email-kit.ts';
import type { Customer } from '../store.ts';
import type { SignupData } from './validate.ts';

export { escapeHtml, type Message } from '../email-kit.ts';

const VERIFICATION = {
  es: {
    subject: 'Confirmá tu correo para abrir tu casillero Carinova',
    preheader: 'Un paso más y tu casillero queda listo.',
    hello: (name: string) => `Hola, ${name}:`,
    intro:
      'Recibimos tu solicitud para abrir un casillero en Carinova. Confirmá tu correo para crear tu cuenta y recibir tu Carinova ID y tu dirección en Miami.',
    button: 'Confirmar mi correo',
    expires: `El enlace vence en ${CONFIRM_LINK_HOURS} horas.`,
    fallback: (openLink: string) => `Si el botón no funciona, ${openLink}.`,
    fallbackLink: 'abrí este enlace',
    notYou: 'Si no fuiste vos, ignorá este mensaje: no se creará ninguna cuenta.',
    textIntro:
      'Recibimos tu solicitud para abrir un casillero en Carinova. Abrí este enlace para confirmar tu correo, crear tu cuenta y recibir tu Carinova ID y tu dirección en Miami:',
  },
  en: {
    subject: 'Confirm your e-mail to open your Carinova mailbox',
    preheader: 'One more step and your mailbox is ready.',
    hello: (name: string) => `Hi, ${name}:`,
    intro:
      'We received your request to open a mailbox at Carinova. Confirm your e-mail to create your account and get your Carinova ID and your address in Miami.',
    button: 'Confirm my e-mail',
    expires: `The link expires in ${CONFIRM_LINK_HOURS} hours.`,
    fallback: (openLink: string) => `If the button does not work, ${openLink}.`,
    fallbackLink: 'open this link',
    notYou: 'If it was not you, ignore this message: no account will be created.',
    textIntro:
      'We received your request to open a mailbox at Carinova. Open this link to confirm your e-mail, create your account and get your Carinova ID and your address in Miami:',
  },
};

/** Step 1: the link that proves the address is theirs. No account exists until it is opened. */
export const verificationEmail = (firstName: string, confirmUrl: string, locale: Locale = 'es'): Message => {
  const t = VERIFICATION[locale];
  return {
    subject: t.subject,
    html: layout(
      t.preheader,
      [
        h1(t.hello(escapeHtml(firstName))),
        p(t.intro),
        button(confirmUrl, t.button),
        small(`${t.expires} ${t.fallback(link(confirmUrl, t.fallbackLink))}`),
        small(t.notYou),
      ].join('\n'),
      locale
    ),
    text: [t.hello(firstName), t.textIntro, confirmUrl, `${t.expires} ${t.notYou}`, TAGLINE[locale]].join('\n\n'),
  };
};

const WELCOME = {
  es: {
    subject: (code: string) => `Tu casillero Carinova está listo: ${code}`,
    preheader: (code: string) => `Tu Carinova ID es ${code}. Aquí está tu dirección en Miami.`,
    title: (name: string) => `¡Tu casillero está listo, ${name}!`,
    thisIsId: 'Este es tu Carinova ID.',
    keepId: 'Guardalo: con él identificamos tu cuenta.',
    idLabel: 'Tu Carinova ID',
    address: 'Tu dirección en Miami',
    addressIntro: 'Usala como dirección de envío cuando compres en tiendas de Estados Unidos:',
    before: 'Antes de comprar',
    seeList: 'Ver esta lista en nuestro sitio',
    listOnSite: 'Lista en nuestro sitio',
    firstShipment: 'Antes de tu primer envío',
    quote: 'Calculá cuánto te cuesta traer tu compra: aéreo, marítimo o electrónicos con tarifa fija.',
    quoteText: 'Calculá cuánto te cuesta traer tu compra',
    online: 'Tu casillero en línea',
    onlineText:
      'En nuestro sitio encontrás siempre tu Carinova ID y tu dirección. Ingresás con tu correo y un código que te mandamos, sin contraseña.',
    questions: '¿Tenés dudas?',
    writeUs: (number: string) => `Escribinos por WhatsApp al ${number}`,
  },
  en: {
    subject: (code: string) => `Your Carinova mailbox is ready: ${code}`,
    preheader: (code: string) => `Your Carinova ID is ${code}. Here is your address in Miami.`,
    title: (name: string) => `Your mailbox is ready, ${name}!`,
    thisIsId: 'This is your Carinova ID.',
    keepId: 'Keep it: it is how we identify your account.',
    idLabel: 'Your Carinova ID',
    address: 'Your address in Miami',
    addressIntro: 'Use it as the shipping address when you buy at stores in the United States:',
    before: 'Before you buy',
    seeList: 'See this list on our site',
    listOnSite: 'The list on our site',
    firstShipment: 'Before your first shipment',
    quote: 'Work out what it costs to bring your purchase: air, sea or electronics at a flat rate.',
    quoteText: 'Work out what it costs to bring your purchase',
    online: 'Your mailbox online',
    onlineText:
      'On our site you always find your Carinova ID and your address. You sign in with your e-mail and a code we send you, without a password.',
    questions: 'Any questions?',
    writeUs: (number: string) => `Write to us on WhatsApp at ${number}`,
  },
};

/** Step 2, once the account exists: Carinova ID, Miami address, what cannot be shipped, the calculator and the way in. */
export const welcomeEmail = (customer: Customer, siteUrl: string, locale: Locale = 'es'): Message => {
  const t = WELCOME[locale];
  const { CTA, MIAMI_ADDRESS, RESTRICTED_ITEMS, WA_MESSAGES, miamiAddressRows } = content(locale);
  const { prohibited, noAir } = RESTRICTED_ITEMS;

  const rows = miamiAddressRows(customer.firstName, customer.lastName);
  const page = (path: string) => `${siteUrl}${localizePath(path, locale)}`;
  const restrictedUrl = page('/articulos-prohibidos');
  const quoteUrl = page(CTA.quote.path);
  const signinUrl = page(CTA.signin.path);
  const whatsappUrl = whatsappLink(CONTACT.whatsapp, WA_MESSAGES.welcomeEmail(customer.code));

  return {
    subject: t.subject(customer.code),
    html: layout(
      t.preheader(customer.code),
      [
        h1(t.title(escapeHtml(customer.firstName))),
        p(`${t.thisIsId} ${t.keepId}`),
        big(customer.code),
        h2(t.address),
        p(t.addressIntro),
        table(rows),
        list(MIAMI_ADDRESS.notes),
        h2(t.before),
        p(`<strong>${escapeHtml(prohibited.title)}.</strong> ${escapeHtml(prohibited.summary)}`),
        list(prohibited.items),
        p(`<strong>${escapeHtml(noAir.title)}.</strong> ${escapeHtml(noAir.summary)}`),
        list(noAir.items),
        p(link(restrictedUrl, t.seeList)),
        h2(t.firstShipment),
        p(t.quote),
        button(quoteUrl, CTA.quote.text),
        h2(t.online),
        p(`${t.onlineText} ${link(signinUrl, CTA.signin.text)}.`),
        h2(t.questions),
        p(`${t.writeUs(escapeHtml(CONTACT.whatsappDisplay))}: ${link(whatsappUrl, CTA.help.text)}.`),
      ].join('\n'),
      locale
    ),
    text: [
      t.title(customer.firstName),
      `${t.idLabel}: ${customer.code}\n${t.keepId}`,
      `${t.address.toUpperCase()}\n${t.addressIntro}\n\n${textRows(rows)}`,
      textList(MIAMI_ADDRESS.notes),
      `${t.before.toUpperCase()}\n\n${prohibited.title}. ${prohibited.summary}\n${textList(prohibited.items)}`,
      `${noAir.title}. ${noAir.summary}\n${textList(noAir.items)}`,
      `${t.listOnSite}: ${restrictedUrl}`,
      `${t.firstShipment.toUpperCase()}\n${t.quoteText}: ${quoteUrl}`,
      `${t.online.toUpperCase()}\n${t.onlineText}\n${CTA.signin.text}: ${signinUrl}`,
      `${t.questions} ${t.writeUs(CONTACT.whatsappDisplay)}: ${whatsappUrl}`,
      TAGLINE[locale],
    ].join('\n\n'),
  };
};

/** For Carinova's team: a new customer confirmed their e-mail (there is no admin panel yet). Always in Spanish. */
export const teamNotificationEmail = (customer: Customer, data: SignupData, locale: Locale = 'es'): Message => {
  const country = content('es').SIGNUP_COUNTRIES.find(({ code }) => code === data.country);
  const rows = [
    { label: 'Carinova ID', value: customer.code },
    { label: 'Nombre', value: `${data.firstName} ${data.lastName}` },
    { label: 'Correo', value: data.email },
    { label: 'Teléfono', value: data.phone },
    { label: 'País', value: country?.name ?? data.country },
    { label: 'Dirección', value: [data.address1, data.address2].filter(Boolean).join(', ') },
    { label: 'Ciudad', value: data.city },
    { label: country?.stateLabel ?? 'Estado', value: data.state },
    { label: 'Código postal', value: data.postalCode || '—' },
    // The language to write to the customer in.
    { label: 'Idioma', value: locale === 'en' ? 'Inglés' : 'Español' },
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
