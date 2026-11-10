import { getPermalink } from './utils/permalinks';
import { whatsappLink } from './utils/whatsapp';
import { BRANCHES, CONTACT, SOCIAL_LINKS, WA_MESSAGES } from './data/carinova';

export const headerData = {
  links: [
    // Sign-up first: it is the main action. In the desktop bar the link shows from 1280 px; between
    // 1024 and 1279 px it does not fit next to the button, which leads to the same page.
    { text: 'Abrir mi casillero', href: getPermalink('/registro'), class: 'lg:hidden xl:block' },
    { text: 'Cómo funciona', href: getPermalink('/#como-funciona') },
    { text: 'Tarifas', href: getPermalink('/#tarifas') },
    { text: 'Preguntas', href: getPermalink('/preguntas-frecuentes') },
    { text: 'Nosotros', href: getPermalink('/nosotros') },
    { text: 'Sucursales', href: getPermalink('/sucursales') },
  ],
  // One button: there is no room for two next to the links at 1024 px. WhatsApp stays one tap away
  // on every page through the floating button.
  actions: [{ variant: 'primary' as const, text: 'Abrir casillero', href: getPermalink('/registro') }],
};

export const footerData = {
  theme: 'dark',
  links: [
    {
      title: 'Envíos',
      links: [
        { text: 'Abrir casillero', href: getPermalink('/registro') },
        { text: 'Cómo funciona', href: getPermalink('/#como-funciona') },
        { text: 'Tarifas', href: getPermalink('/#tarifas') },
        { text: 'Calcular envío', href: getPermalink('/#cotizar') },
        { text: 'Artículos prohibidos', href: getPermalink('/articulos-prohibidos') },
      ],
    },
    {
      title: 'Carinova',
      links: [
        { text: 'Nosotros', href: getPermalink('/nosotros') },
        { text: 'Preguntas frecuentes', href: getPermalink('/preguntas-frecuentes') },
        { text: 'Sucursales', href: getPermalink('/sucursales') },
      ],
    },
    {
      title: 'Sucursales',
      links: BRANCHES.map((branch) => ({ text: branch.city, href: getPermalink(`/sucursales#${branch.id}`) })),
    },
    {
      title: 'Contacto',
      links: [
        { text: 'WhatsApp', href: whatsappLink(CONTACT.whatsapp, WA_MESSAGES.header) },
        ...(CONTACT.email ? [{ text: CONTACT.email, href: `mailto:${CONTACT.email}` }] : []),
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Términos', href: getPermalink('/terminos') },
    { text: 'Privacidad', href: getPermalink('/privacidad') },
  ],
  socialLinks: SOCIAL_LINKS.map(({ name, icon, href }) => ({ ariaLabel: name, icon, href })),
  footNote: `© ${new Date().getFullYear()} Carinova · Todos los derechos reservados.`,
};
