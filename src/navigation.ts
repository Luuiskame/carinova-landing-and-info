import { getPermalink } from './utils/permalinks';
import { whatsappLink } from './utils/whatsapp';
import { BRANCHES, CONTACT, SOCIAL_LINKS, WA_MESSAGES } from './data/carinova';

export const headerData = {
  links: [
    { text: 'Cómo funciona', href: getPermalink('/#como-funciona') },
    { text: 'Tarifas', href: getPermalink('/#tarifas') },
    { text: 'Preguntas', href: getPermalink('/preguntas-frecuentes') },
    { text: 'Nosotros', href: getPermalink('/nosotros') },
    { text: 'Sucursales', href: getPermalink('/sucursales') },
  ],
  actions: [
    {
      variant: 'primary' as const,
      text: 'WhatsApp',
      icon: 'tabler:brand-whatsapp',
      href: whatsappLink(CONTACT.whatsapp, WA_MESSAGES.header),
      target: '_blank',
    },
  ],
};

export const footerData = {
  theme: 'dark',
  links: [
    {
      title: 'Envíos',
      links: [
        { text: 'Cómo funciona', href: getPermalink('/#como-funciona') },
        { text: 'Tarifas', href: getPermalink('/#tarifas') },
        { text: 'Calcular envío', href: getPermalink('/#cotizar') },
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
