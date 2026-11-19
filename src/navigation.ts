import { CONTACT, SOCIAL_LINKS } from './data/carinova';
import { LOCALE_INFO, languagesOf, type PageI18n } from './i18n';
import { getPermalink } from './utils/permalinks';
import { whatsappLink } from './utils/whatsapp';

// Site structure: docs/INFORMATION-ARCHITECTURE.md. The header lists six places and the ways in
// ("Ingresá", "Crear cuenta"); the footer lists every page in three columns, with Carinova's
// channels above them. Both are built for the language of the page (`i18n(Astro)`; their words are
// `ui.nav`), and both carry two versions of what depends on the visitor being signed in:
// `auth: 'out'` shows to visitors, `auth: 'in'` to customers who are signed in (SessionState.astro).

/** The languages a page can be read in, each with this page's address in it; empty with one language. */
const languageMenu = (pathname: string) =>
  languagesOf(pathname).map(({ locale, path, home, current }) => {
    const info = LOCALE_INFO[locale];
    return {
      /** Two letters for the header's button ("ES", "EN"); the menu lists the names. */
      code: info.code,
      name: info.name,
      lang: info.htmlLang,
      dir: info.dir,
      href: getPermalink(path),
      /** Where it goes from a page without a translation: that language's home page. */
      home: getPermalink(home),
      current,
    };
  });

export const getHeaderData = ({ href, data, ui }: PageI18n, pathname: string) => {
  const { CTA } = data;
  const t = ui.nav;

  return {
    links: [
      // First in the phone menu: the main action and tracking. In the desktop bar they are the
      // buttons next to the links. A signed-in customer gets their account in the place of sign-up.
      { text: CTA.signup.text, href: href(CTA.signup.path), class: 'lg:hidden', auth: 'out' as const },
      { text: CTA.account.short, href: href(CTA.account.path), class: 'lg:hidden', auth: 'in' as const },
      { text: CTA.track.text, href: href(CTA.track.path), class: 'lg:hidden' },
      { text: t.services, href: href('/servicios') },
      { text: t.shopper, href: href('/#personal-shopper') },
      { text: t.rates, href: href(CTA.quote.path) },
      { text: t.howItWorks, href: href('/como-comprar') },
      { text: t.business, href: href('/empresas') },
      { text: t.help, href: href('/preguntas-frecuentes') },
    ],
    /** "Ingresá": opens the sign-in dialog (SigninDialog.astro); a plain link to the sign-in page without it. */
    signin: { text: CTA.signin.short, href: href(CTA.signin.path) },
    /** The outlined button, from 1280 px: "Rastreá tu paquete". */
    track: { text: CTA.track.text, href: href(CTA.track.path) },
    /** The orange button: "Crear cuenta", or "Mi cuenta" for a customer. */
    primary: { text: CTA.signup.text, href: href(CTA.signup.path) },
    account: { text: CTA.account.short, href: href(CTA.account.path) },
    languages: languageMenu(pathname),
  };
};

export const getFooterData = ({ href, data, ui }: PageI18n, pathname: string) => {
  const { BRANCHES, CTA, WA_MESSAGES } = data;
  const t = ui.nav;

  return {
    theme: 'dark',
    description: t.brand,
    route: t.route,
    // Carinova's channels, only the ones that have an address: the social networks of SOCIAL_LINKS,
    // WhatsApp and, once Carinova has one, the e-mail.
    channels: [
      ...SOCIAL_LINKS.map(({ name, icon, href: url, handle }) => ({ name, icon, href: url, handle })),
      {
        name: 'WhatsApp',
        icon: 'tabler:brand-whatsapp',
        href: whatsappLink(CONTACT.whatsapp, WA_MESSAGES.channels),
        handle: CONTACT.whatsappDisplay,
      },
      ...(CONTACT.email
        ? [{ name: ui.footer.email, icon: 'tabler:mail', href: `mailto:${CONTACT.email}`, handle: CONTACT.email }]
        : []),
    ],
    links: [
      {
        title: t.explore,
        links: [
          { text: t.services, href: href('/servicios') },
          { text: t.rates, href: href('/cotizador#tarifas') },
          { text: t.calculator, href: href(CTA.quote.path) },
          { text: t.locker, href: href('/casillero-en-miami') },
          { text: t.stores, href: href('/tiendas') },
          { text: t.shopper, href: href('/#personal-shopper') },
        ],
      },
      {
        title: t.yours,
        links: [
          { text: t.howItWorks, href: href('/como-comprar') },
          { text: t.canItEnter, href: href('/articulos-prohibidos') },
          { text: t.tracking, href: href(CTA.track.path) },
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
          { text: t.about, href: href('/nosotros') },
          { text: t.terms, href: href('/terminos') },
          { text: t.privacy, href: href('/privacidad') },
        ],
      },
    ],
    languages: languageMenu(pathname),
    footNote: `© ${new Date().getFullYear()} Carinova. ${t.rights}`,
  };
};
