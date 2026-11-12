import { CONTACT, SOCIAL_LINKS } from './data/carinova';
import { LOCALE_INFO, languageSwitchOf, type PageI18n } from './i18n';
import { getPermalink } from './utils/permalinks';
import { whatsappLink } from './utils/whatsapp';

// Site structure: docs/INFORMATION-ARCHITECTURE.md. The header lists the six sections in the order of
// the customer's journey; the footer lists every page. Both are built for the language of the page
// (`i18n(Astro)`), and both carry two versions of what depends on the visitor being signed in:
// `auth: 'out'` shows to visitors, `auth: 'in'` to customers who are signed in (SessionState.astro).

const LABELS = {
  es: {
    howToBuy: 'Cómo comprar',
    services: 'Servicios',
    quote: 'Cotizador',
    branches: 'Sucursales',
    help: 'Ayuda',
    account: 'Mi cuenta',
    customers: 'Clientes',
    business: 'Empresas',
    restricted: 'Artículos prohibidos',
    about: 'Nosotros',
    faq: 'Preguntas frecuentes',
    contact: 'Contacto',
    terms: 'Términos',
    privacy: 'Privacidad',
    rights: 'Todos los derechos reservados.',
  },
  en: {
    howToBuy: 'How to buy',
    services: 'Services',
    quote: 'Quote',
    branches: 'Branches',
    help: 'Help',
    account: 'My account',
    customers: 'Customers',
    business: 'For companies',
    restricted: 'Prohibited items',
    about: 'About us',
    faq: 'Frequently asked questions',
    contact: 'Contact',
    terms: 'Terms',
    privacy: 'Privacy',
    rights: 'All rights reserved.',
  },
};

/** The link to the same page in the other language; undefined while the English version is off. */
const languageLink = (pathname: string) => {
  const target = languageSwitchOf(pathname);
  if (!target) return undefined;
  const info = LOCALE_INFO[target.locale];
  return {
    /** Short label for the header ("EN", "ES"); the full name is read by screen readers. */
    code: target.locale.toUpperCase(),
    name: info.name,
    lang: info.htmlLang,
    href: getPermalink(target.path),
    /** Where it goes from a page without a translation: the other language's home page. */
    home: getPermalink(target.locale === 'en' ? '/en' : '/'),
  };
};

export const getHeaderData = ({ locale, href, data }: PageI18n, pathname: string) => {
  const { CTA } = data;
  const t = LABELS[locale];

  return {
    links: [
      // First in the phone menu: the main action. In the desktop bar the orange button next to the
      // links leads to the same page. A signed-in customer gets their casillero in its place.
      { text: CTA.signup.text, href: href(CTA.signup.path), class: 'lg:hidden', auth: 'out' as const },
      { text: CTA.mailbox.short, href: href(CTA.mailbox.path), class: 'lg:hidden', auth: 'in' as const },
      { text: t.howToBuy, href: href('/como-comprar') },
      { text: t.services, href: href('/servicios') },
      { text: t.quote, href: href(CTA.quote.path) },
      { text: t.branches, href: href('/sucursales') },
      { text: t.help, href: href('/preguntas-frecuentes') },
      { text: t.account, href: href('/mi-cuenta') },
    ],
    // One button: the main call to action. "Cotizar mi envío" is the Cotizador link beside it.
    actions: [
      { variant: 'primary' as const, text: CTA.signup.text, href: href(CTA.signup.path), 'data-auth': 'out' },
      { variant: 'primary' as const, text: CTA.mailbox.short, href: href(CTA.mailbox.path), 'data-auth': 'in' },
    ],
    signin: { text: CTA.signin.text, href: href(CTA.signin.path) },
    language: languageLink(pathname),
  };
};

export const getFooterData = ({ locale, href, data }: PageI18n, pathname: string) => {
  const { CTA, SERVICES, WA_MESSAGES } = data;
  const t = LABELS[locale];

  return {
    theme: 'dark',
    links: [
      {
        title: t.services,
        links: SERVICES.map((service) => ({ text: service.name, href: href(`/servicios#${service.id}`) })),
      },
      {
        title: t.customers,
        links: [
          { text: CTA.signup.text, href: href(CTA.signup.path), auth: 'out' as const },
          { text: CTA.signin.text, href: href(CTA.signin.path), auth: 'out' as const },
          { text: CTA.mailbox.short, href: href(CTA.mailbox.path), auth: 'in' as const },
          { text: t.account, href: href('/mi-cuenta') },
          { text: t.howToBuy, href: href('/como-comprar') },
          { text: CTA.quote.text, href: href(CTA.quote.path) },
          { text: t.business, href: href('/empresas') },
          { text: t.restricted, href: href('/articulos-prohibidos') },
        ],
      },
      {
        title: 'Carinova',
        links: [
          { text: t.about, href: href('/nosotros') },
          { text: t.branches, href: href('/sucursales') },
          { text: t.faq, href: href('/preguntas-frecuentes') },
        ],
      },
      {
        title: t.contact,
        links: [
          { text: CTA.help.text, href: whatsappLink(CONTACT.whatsapp, WA_MESSAGES.footer) },
          ...(CONTACT.email ? [{ text: CONTACT.email, href: `mailto:${CONTACT.email}` }] : []),
        ],
      },
    ],
    secondaryLinks: [
      { text: t.terms, href: href('/terminos') },
      { text: t.privacy, href: href('/privacidad') },
    ],
    language: languageLink(pathname),
    socialLinks: SOCIAL_LINKS.map(({ name, icon, href: url }) => ({ ariaLabel: name, icon, href: url })),
    footNote: `© ${new Date().getFullYear()} Carinova · ${t.rights}`,
  };
};
