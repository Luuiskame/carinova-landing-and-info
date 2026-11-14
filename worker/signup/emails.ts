/**
 * The e-mails of the sign-up flow: confirmation link, welcome (Carinova ID + Miami address) and the
 * notification to Carinova's team. Each one has an HTML and a plain-text version. The customer's
 * e-mails are written in the language they signed up in; the team's is in Spanish. The business
 * details come from src/data, like on the site.
 */
import { CONTACT } from '../../src/data/carinova.ts';
import { content } from '../../src/data/content.ts';
import type { Locale } from '../../src/i18n/locales.ts';
import { localizePath } from '../../src/i18n/routes.ts';
import { whatsappLink } from '../../src/utils/whatsapp.ts';
import {
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
  taglineOf,
  textList,
  textRows,
  type Message,
} from '../email-kit.ts';
import type { Customer } from '../store.ts';
import { LANGUAGE_NAMES, textOf } from '../text/index.ts';
import type { SignupData } from './validate.ts';

export { escapeHtml, type Message } from '../email-kit.ts';

/** Step 1: the link that proves the address is theirs. No account exists until it is opened. */
export const verificationEmail = (firstName: string, confirmUrl: string, locale: Locale = 'es'): Message => {
  const t = textOf(locale).verification;
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
    text: [t.hello(firstName), t.textIntro, confirmUrl, `${t.expires} ${t.notYou}`, taglineOf(locale)].join('\n\n'),
  };
};

/** Step 2, once the account exists: Carinova ID, Miami address, what cannot be shipped, the calculator and the way in. */
export const welcomeEmail = (customer: Customer, siteUrl: string, locale: Locale = 'es'): Message => {
  const t = textOf(locale).welcome;
  const { CTA, MIAMI_ADDRESS, RESTRICTED_ITEMS, RESTRICTED_ORDER, WA_MESSAGES, miamiAddressRows } = content(locale);
  // What cannot be brought, in Carinova's three groups: each one with its title, what it means and its items.
  const restricted = RESTRICTED_ORDER.map((id) => {
    const { title, summary, items } = RESTRICTED_ITEMS[id];
    return { title, summary, items: items.map((item) => item.name) };
  });

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
        ...restricted.flatMap((group) => [
          p(`<strong>${escapeHtml(group.title)}.</strong> ${escapeHtml(group.summary)}`),
          list(group.items),
        ]),
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
      t.before.toUpperCase(),
      ...restricted.map((group) => `${group.title}. ${group.summary}\n${textList(group.items)}`),
      `${t.listOnSite}: ${restrictedUrl}`,
      `${t.firstShipment.toUpperCase()}\n${t.quoteText}: ${quoteUrl}`,
      `${t.online.toUpperCase()}\n${t.onlineText}\n${CTA.signin.text}: ${signinUrl}`,
      `${t.questions} ${t.writeUs(CONTACT.whatsappDisplay)}: ${whatsappUrl}`,
      taglineOf(locale),
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
    { label: 'Idioma', value: LANGUAGE_NAMES[locale] },
  ];
  const chatUrl = whatsappLink(data.phone);

  return {
    subject: `Nueva cuenta ${customer.code}: ${data.firstName} ${data.lastName}`,
    html: layout(
      `${data.firstName} ${data.lastName} creó su cuenta en el sitio web.`,
      [
        h1(`Nueva cuenta: ${escapeHtml(customer.code)}`),
        p('Un cliente se registró en el sitio web y confirmó su correo.'),
        table(rows),
        button(chatUrl, 'Escribirle por WhatsApp'),
      ].join('\n')
    ),
    text: [
      `Nueva cuenta: ${customer.code}`,
      'Un cliente se registró en el sitio web y confirmó su correo.',
      textRows(rows),
      `WhatsApp del cliente: ${chatUrl}`,
    ].join('\n\n'),
  };
};
