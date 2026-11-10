/**
 * Carinova business data: contact, branches, rates, stores and WhatsApp messages.
 * Pages and components read from here, so this is the one file to edit when the details change.
 *
 * Every value marked TODO is placeholder content to be confirmed by Carinova before launch
 * (tracked in docs/PROJECT-LOG.md → "Pending content").
 */

export const SITE_STATUS = {
  /**
   * While true, every page shows a "datos de ejemplo" notice. Set it to false at launch, together
   * with `metadata.robots` in src/config.yaml (search indexing is off during the preview).
   */
  isPreview: true,
};

/** WhatsApp numbers: international format, digits only (505 + 8 digits for Nicaragua). */
export const CONTACT = {
  whatsapp: '50500000000', // TODO: main WhatsApp number
  email: '', // TODO: e.g. hola@carinova.com — hidden while empty
};

export const SOCIAL_LINKS = [
  { name: 'Facebook', icon: 'tabler:brand-facebook', href: '' }, // TODO
  { name: 'Instagram', icon: 'tabler:brand-instagram', href: '' }, // TODO
  { name: 'TikTok', icon: 'tabler:brand-tiktok', href: '' }, // TODO
].filter((link) => link.href);

export interface Branch {
  /** Anchor on /sucursales (e.g. /sucursales#esteli). */
  id: string;
  city: string;
  address: string;
  /** Directions the Nicaraguan way, e.g. "De la rotonda X, 2 c. al lago". */
  reference?: string;
  hours: Array<{ days: string; time: string }>;
  whatsapp: string;
  phone?: string;
  /** Google Maps link; the "Cómo llegar" button is hidden while empty. */
  mapsUrl?: string;
}

export const BRANCHES: Array<Branch> = [
  {
    id: 'managua',
    city: 'Managua',
    address: 'Dirección por confirmar', // TODO
    reference: '', // TODO
    hours: [
      { days: 'Lunes a viernes', time: '8:00 a. m. – 5:00 p. m.' }, // TODO
      { days: 'Sábado', time: '8:00 a. m. – 12:00 m.' }, // TODO
    ],
    whatsapp: '50500000000', // TODO
    mapsUrl: '', // TODO
  },
  {
    id: 'esteli',
    city: 'Estelí',
    address: 'Dirección por confirmar', // TODO
    reference: '', // TODO
    hours: [
      { days: 'Lunes a viernes', time: '8:00 a. m. – 5:00 p. m.' }, // TODO
      { days: 'Sábado', time: '8:00 a. m. – 12:00 m.' }, // TODO
    ],
    whatsapp: '50500000000', // TODO
    mapsUrl: '', // TODO
  },
];

export interface ShippingService {
  id: string;
  name: string;
  icon: string;
  /** USD per pound. */
  pricePerLb: number;
  /** Minimum billable weight, in pounds. */
  minLb: number;
  /** Transit time as shown to customers. */
  transit: string;
  features: Array<string>;
}

export const RATES = {
  /** Bill each started pound as a full pound (2.3 lb → 3 lb). TODO: confirm. */
  roundUpToPound: true,
  services: [
    {
      id: 'aereo',
      name: 'Aéreo',
      icon: 'tabler:plane',
      pricePerLb: 7, // TODO
      minLb: 1, // TODO
      transit: '3 a 5 días hábiles', // TODO
      features: [
        'Ideal para ropa, electrónicos y compras urgentes',
        'Te avisamos cuando tu paquete llega a sucursal',
        'Retiro en Managua o Estelí',
      ],
    },
    {
      id: 'maritimo',
      name: 'Marítimo',
      icon: 'tabler:ship',
      pricePerLb: 3, // TODO
      minLb: 1, // TODO
      transit: '15 a 20 días', // TODO
      features: [
        'Ideal para compras pesadas o voluminosas',
        'El precio por libra más bajo',
        'Retiro en Managua o Estelí',
      ],
    },
  ] satisfies Array<ShippingService>,
  /** Conditions shown under the rates and the calculator. TODO: confirm with Carinova. */
  notes: [
    'Precios en dólares estadounidenses (USD) por libra.',
    'Los paquetes grandes y livianos pueden cobrarse por peso volumétrico (según las medidas de la caja).',
    'Los impuestos de aduana, cuando aplican, no están incluidos.',
  ],
};

/** Stores shown in the "compra en" strip (names only; the store logos are trademarks of their owners). */
export const STORES = [
  'Amazon',
  'Shein',
  'Temu',
  'eBay',
  'Walmart',
  'Target',
  'Best Buy',
  'Nike',
  'Apple',
  'Macy’s',
  'Costco',
  'AliExpress',
];

/** Customer reviews (Google). The reviews section is hidden while this list is empty. Only real reviews. */
export const REVIEWS: Array<{ name: string; text: string; rating: number; source?: string }> = [];

/**
 * Prefilled WhatsApp messages, one per button, so the team can tell which button or page sent each lead.
 * Keep them short and different from each other.
 */
export const WA_MESSAGES = {
  header: 'Hola Carinova 👋 Vengo de su sitio web y quiero información.',
  hero: 'Hola Carinova 👋 Quiero cotizar un envío.',
  casillero: 'Hola Carinova 👋 Quiero abrir mi casillero.',
  service: (service: string) => `Hola Carinova 👋 Quiero cotizar un envío ${service.toLowerCase()}.`,
  branch: (city: string) => `Hola Carinova ${city} 👋 Tengo una consulta.`,
  faq: 'Hola Carinova 👋 Tengo una pregunta que no encontré en su página.',
  closing: 'Hola Carinova 👋 Quiero hacer mi primera compra con ustedes.',
  floating: 'Hola Carinova 👋 Vengo de su sitio web.',
  quote: (service: string, pounds: string, city: string, total: string) =>
    `Hola Carinova 👋 Quiero cotizar un envío ${service.toLowerCase()} de ${pounds} lb para retirar en ${city}. Estimado en la web: ${total}.`,
};
