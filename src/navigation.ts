import { CONTACT, SOCIAL_LINKS } from './data/carinova';
import { LOCALE_INFO, languageSwitchOf, type PageI18n } from './i18n';
import { getPermalink } from './utils/permalinks';
import { whatsappLink } from './utils/whatsapp';

// Site structure: docs/INFORMATION-ARCHITECTURE.md. The header and the footer follow Carinova's
// prototype: the header lists six places and the ways in ("Ingresá", "Crear cuenta"); the footer
// lists every page in three columns. Both are built for the language of the page (`i18n(Astro)`),
// and both carry two versions of what depends on the visitor being signed in: `auth: 'out'` shows
// to visitors, `auth: 'in'` to customers who are signed in (SessionState.astro).

const LABELS = {
  es: {
    services: 'Servicios',
    shopper: 'Compras por vos',
    rates: 'Tarifas',
    calculator: 'Cotizador',
    howItWorks: 'Cómo funciona',
    business: 'Empresas',
    help: 'Ayuda',
    explore: 'Explorá',
    yours: 'Tu Carinova',
    near: 'Estamos cerca',
    canItEnter: '¿Puede ingresar?',
    tracking: 'Rastreo',
    faq: 'Preguntas frecuentes',
    about: 'Nosotros',
    terms: 'Condiciones del servicio',
    privacy: 'Privacidad',
    and: ' y ',
    brand: 'Envíos que unen. Acercamos tus compras, tu familia y los proyectos de tu empresa.',
    route: ['USA', 'Nicaragua'],
    rights: 'Todos los derechos reservados. Tarifas y plazos sujetos a verificación.',
  },
  en: {
    services: 'Services',
    shopper: 'We shop for you',
    rates: 'Rates',
    calculator: 'Calculator',
    howItWorks: 'How it works',
    business: 'Business',
    help: 'Help',
    explore: 'Explore',
    yours: 'Your Carinova',
    near: 'We are close',
    canItEnter: 'Can it enter?',
    tracking: 'Tracking',
    faq: 'Frequently asked questions',
    about: 'About us',
    terms: 'Terms of service',
    privacy: 'Privacy',
    and: ' and ',
    brand: 'Shipments that bring us together. We bring your purchases, your family and your company’s projects closer.',
    route: ['USA', 'Nicaragua'],
    rights: 'All rights reserved. Rates and delivery times are subject to verification.',
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
      // First in the phone menu: the main action and tracking. In the desktop bar they are the
      // buttons next to the links. A signed-in customer gets their account in the place of sign-up.
      { text: CTA.signup.text, href: href(CTA.signup.path), class: 'lg:hidden', auth: 'out' as const },
      { text: CTA.account.short, href: href(CTA.account.path), class: 'lg:hidden', auth: 'in' as const },
      { text: CTA.track.text, href: href(CTA.track.visitorPath), class: 'lg:hidden', auth: 'out' as const },
      { text: CTA.track.text, href: href(CTA.track.path), class: 'lg:hidden', auth: 'in' as const },
      { text: t.services, href: href('/servicios') },
      { text: t.shopper, href: href('/#compras') },
      { text: t.rates, href: href(CTA.quote.path) },
      { text: t.howItWorks, href: href('/como-comprar') },
      { text: t.business, href: href('/empresas') },
      { text: t.help, href: href('/preguntas-frecuentes') },
    ],
    /** "Ingresá": opens the sign-in dialog (SigninDialog.astro); a plain link to the sign-in page without it. */
    signin: { text: CTA.signin.short, href: href(CTA.signin.path) },
    /** The outlined button, from 1280 px: "Rastreá tu paquete". */
    track: { text: CTA.track.text, href: href(CTA.track.visitorPath), accountHref: href(CTA.track.path) },
    /** The orange button: "Crear cuenta", or "Mi cuenta" for a customer. */
    primary: { text: CTA.signup.text, href: href(CTA.signup.path) },
    account: { text: CTA.account.short, href: href(CTA.account.path) },
    language: languageLink(pathname),
  };
};

export const getFooterData = ({ locale, href, data }: PageI18n, pathname: string) => {
  const { BRANCHES, CTA, WA_MESSAGES } = data;
  const t = LABELS[locale];

  return {
    theme: 'dark',
    description: t.brand,
    route: t.route,
    links: [
      {
        title: t.explore,
        links: [
          { text: t.services, href: href('/servicios') },
          { text: t.rates, href: href('/cotizador#tarifas') },
          { text: t.calculator, href: href(CTA.quote.path) },
          { text: t.shopper, href: href('/#compras') },
        ],
      },
      {
        title: t.yours,
        links: [
          { text: t.howItWorks, href: href('/como-comprar') },
          { text: t.canItEnter, href: href('/articulos-prohibidos') },
          { text: t.tracking, href: href(CTA.track.visitorPath), auth: 'out' as const },
          { text: t.tracking, href: href(CTA.track.path), auth: 'in' as const },
          { text: t.business, href: href('/empresas') },
          { text: CTA.signup.text, href: href(CTA.signup.path), auth: 'out' as const },
          { text: CTA.signin.short, href: href(CTA.signin.path), auth: 'out' as const, signin: true },
          { text: CTA.account.short, href: href(CTA.account.path), auth: 'in' as const },
        ],
      },
      {
        title: t.near,
        links: [
          { text: BRANCHES.map((branch) => branch.city).join(t.and), href: href('/sucursales') },
          { text: t.faq, href: href('/preguntas-frecuentes') },
          {
            text: `WhatsApp · ${CONTACT.whatsappDisplay}`,
            href: whatsappLink(CONTACT.whatsapp, WA_MESSAGES.footer),
            external: true,
          },
          ...(CONTACT.email ? [{ text: CONTACT.email, href: `mailto:${CONTACT.email}` }] : []),
          { text: t.about, href: href('/nosotros') },
          { text: t.terms, href: href('/terminos') },
          { text: t.privacy, href: href('/privacidad') },
        ],
      },
    ],
    language: languageLink(pathname),
    socialLinks: SOCIAL_LINKS.map(({ name, icon, href: url }) => ({ ariaLabel: name, icon, href: url })),
    footNote: `© ${new Date().getFullYear()} Carinova. ${t.rights}`,
  };
};
