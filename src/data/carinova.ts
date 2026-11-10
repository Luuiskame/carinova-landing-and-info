/**
 * Carinova business data: contact, branches, rates, stores, the Miami address, restricted items
 * and WhatsApp messages. Pages and components read from here, so this is the one file to edit
 * when the details change.
 *
 * The sign-up Worker (worker/) bundles this file too, for the e-mails it sends: keep it free of
 * imports, so it also runs outside Astro.
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

export const CONTACT = {
  /** International format, digits only (505 + 8 digits for Nicaragua): what wa.me links need. */
  whatsapp: '50588552956',
  /** The same number as people read it (e-mails). */
  whatsappDisplay: '+505 8855 2956',
  /** TODO: e.g. hola@carinova.com. Hidden while empty; once set, replies to the sign-up e-mails go here. */
  email: '',
};

export const SOCIAL_LINKS = [
  { name: 'Facebook', icon: 'tabler:brand-facebook', href: '' }, // TODO: address of the "Carinova" page
  { name: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://www.instagram.com/carinova_nic/' },
  { name: 'TikTok', icon: 'tabler:brand-tiktok', href: 'https://www.tiktok.com/@carinova_nic' },
].filter((link) => link.href);

export interface Branch {
  /** Anchor on /sucursales (e.g. /sucursales#bluefields). */
  id: string;
  city: string;
  address: string;
  /** Directions the Nicaraguan way, e.g. "De la rotonda X, 2 c. al lago". */
  reference?: string;
  hours: Array<{ days: string; time: string }>;
  /** Give a branch its own number and the floating WhatsApp button becomes a branch menu. */
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
    whatsapp: CONTACT.whatsapp,
    mapsUrl: '', // TODO
  },
  {
    id: 'bluefields',
    city: 'Bluefields',
    address: 'Dirección por confirmar', // TODO
    reference: '', // TODO
    hours: [
      { days: 'Lunes a viernes', time: '8:00 a. m. – 5:00 p. m.' }, // TODO
      { days: 'Sábado', time: '8:00 a. m. – 12:00 m.' }, // TODO
    ],
    whatsapp: CONTACT.whatsapp,
    mapsUrl: '', // TODO
  },
];

const PICKUP_CITIES = BRANCHES.map((branch) => branch.city).join(' o ');

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
        `Retiro en ${PICKUP_CITIES}`,
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
        `Retiro en ${PICKUP_CITIES}`,
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

/**
 * The address customers use at US stores, from Carinova's "Tu dirección en Miami" graphic.
 * The store's name fields carry "Carinova" and the service, which is how the Miami warehouse
 * knows whose package it is. Shown after sign-up and sent in the welcome e-mail.
 */
export const MIAMI_ADDRESS = {
  firstName: (firstName: string) => `Carinova ${firstName}`,
  lastName: (lastName: string) => `${lastName} Aéreo`,
  phone: '786 687 9611',
  line1: '8611 NW 72ND St',
  line2: 'Ste G9',
  city: 'Miami',
  state: 'Florida (FL)',
  postalCode: '33195-2311',
  country: 'United States',
  /** Shown under the address. TODO: confirm what customers write for sea shipments. */
  notes: [
    'Escribe el nombre y el apellido exactamente así: es como identificamos tus paquetes.',
    'Para envíos marítimos, consúltanos por WhatsApp antes de comprar.',
  ],
};

/** The Miami address as the fields of a store checkout, in the order of Carinova's graphic. */
export const miamiAddressRows = (firstName: string, lastName: string) => [
  { id: 'country', label: 'País / Country', value: MIAMI_ADDRESS.country },
  { id: 'firstName', label: 'Nombre / Name', value: MIAMI_ADDRESS.firstName(firstName) },
  { id: 'lastName', label: 'Apellido / Last name', value: MIAMI_ADDRESS.lastName(lastName) },
  { id: 'phone', label: 'Teléfono / Phone', value: MIAMI_ADDRESS.phone },
  { id: 'line1', label: 'Dirección / Address', value: MIAMI_ADDRESS.line1 },
  { id: 'line2', label: 'Apto / Suite', value: MIAMI_ADDRESS.line2 },
  { id: 'city', label: 'Ciudad / City', value: MIAMI_ADDRESS.city },
  { id: 'state', label: 'Estado / State', value: MIAMI_ADDRESS.state },
  { id: 'postalCode', label: 'Código postal / Zip code', value: MIAMI_ADDRESS.postalCode },
];

/** What Carinova does not carry, from its "Prohibido / No ingresa vía aérea" graphic. */
export const RESTRICTED_ITEMS = {
  prohibited: {
    title: 'Prohibido',
    summary: 'No los transportamos.',
    items: [
      'Armas, municiones y accesorios',
      'Cigarros y sus derivados',
      'Cigarros electrónicos',
      'Accesorios para aviones',
      'Transmisores de radio',
      'Drones',
    ],
  },
  noAir: {
    title: 'No ingresa por vía aérea',
    summary: 'No pueden viajar en avión. Si necesitas traer alguno, consúltanos antes de comprarlo.',
    items: ['Productos inflamables', 'Baterías de litio sueltas', 'Body spray', 'Perfumes', 'Aerosoles'],
  },
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
  signupHelp: 'Hola Carinova 👋 Intenté registrarme en su sitio web y necesito ayuda.',
  customer: (code: string) => `Hola Carinova 👋 Soy cliente ${code} y tengo una consulta.`,
  restricted: 'Hola Carinova 👋 Quiero saber si pueden traer un producto.',
  service: (service: string) => `Hola Carinova 👋 Quiero cotizar un envío ${service.toLowerCase()}.`,
  branch: (city: string) => `Hola Carinova ${city} 👋 Tengo una consulta.`,
  faq: 'Hola Carinova 👋 Tengo una pregunta que no encontré en su página.',
  closing: 'Hola Carinova 👋 Quiero hacer mi primera compra con ustedes.',
  floating: 'Hola Carinova 👋 Vengo de su sitio web.',
  quote: (service: string, pounds: string, city: string, total: string) =>
    `Hola Carinova 👋 Quiero cotizar un envío ${service.toLowerCase()} de ${pounds} lb para retirar en ${city}. Estimado en la web: ${total}.`,
};
