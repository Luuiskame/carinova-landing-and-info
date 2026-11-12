/**
 * Carinova business data: contact, branches and hours, where packages are received in the United
 * States, rates, the Miami address, restricted items, the stores customers buy from, the labels of
 * the calls to action and every prefilled WhatsApp message. Pages and components read from here, so
 * this is the one file to edit when the details change. How the site is organised around this data:
 * docs/INFORMATION-ARCHITECTURE.md.
 *
 * This file holds the facts and their Spanish wording (the site's default language). The English
 * wording of the same exports is in en/carinova.ts, built on top of these facts so a price or an
 * address is only ever written here; pages get the language they are rendering through
 * `content(locale)` (content.ts).
 *
 * The Worker (worker/) bundles this file too, for the e-mails it sends, and the unit tests import it
 * on plain Node: keep it free of imports.
 *
 * Every value marked TODO is placeholder content to be confirmed by Carinova before launch
 * (tracked in docs/PROJECT-LOG.md → "Pending content"). Text for visitors uses voseo
 * (docs/INFORMATION-ARCHITECTURE.md → "Voice").
 */

export const SITE_STATUS = {
  /**
   * While true, the branches' LocalBusiness data (their addresses are still placeholders) is left
   * out of the page. Set it to false at launch, together with `metadata.robots` in
   * src/config.yaml (search indexing is off during the preview). The "vista previa" bar that used
   * to sit above the header was removed on 2026-11-11.
   */
  isPreview: true,
};

/** Carinova's promise, word for word from its brief: the title of the home page. */
export const VALUE_PROPOSITION = 'Traemos tus compras y encomiendas desde los Estados Unidos hasta Nicaragua';
/** The words of the promise shown in orange (the title falls back to plain text if they change). */
export const VALUE_PROPOSITION_HIGHLIGHT = 'compras y encomiendas';

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

/**
 * The calls to action, in order of importance (docs/INFORMATION-ARCHITECTURE.md → "Calls to
 * action"): 1. sign-up, the orange button; 2. the quote calculator, the outlined button; 3. WhatsApp
 * help, a link with the WhatsApp icon whose prefilled message depends on where it is (WA_MESSAGES).
 *
 * `mailbox` takes the place of `signup` for a customer who is signed in (they already have a
 * casillero), and `signin` is how a customer gets there. Paths are Spanish site paths: components
 * turn them into the address of the language being rendered (src/i18n).
 */
export const CTA = {
  signup: { text: 'Abrir mi casillero', path: '/registro' },
  quote: { text: 'Cotizar mi envío', path: '/cotizador' },
  help: { text: 'Ayuda por WhatsApp' },
  /** `short` is the label where space is tight: the header. */
  mailbox: { text: 'Ir a mi casillero', short: 'Mi casillero', path: '/mi-casillero' },
  signin: { text: 'Ingresar', path: '/ingresar' },
};

/**
 * What a Carinova ID looks like: the customer number the database assigns at sign-up
 * (db/schema.sql). Not CNV-00001, so the example does not suggest how many customers there are.
 */
export const CARINOVA_ID_EXAMPLE = 'CNV-01234';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface OpeningHours {
  /** As shown, e.g. "Lunes a sábado". */
  days: string;
  /** The same days for the branches' structured data (schema.org names). */
  dayOfWeek: Array<DayOfWeek>;
  /** 24-hour clock, "HH:MM". */
  opens: string;
  closes: string;
}

/** "08:00" → "8:00 a. m.", "12:00" → "12:00 m.", "17:00" → "5:00 p. m." (the way Nicaragua writes times). */
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const clock = `${hours % 12 || 12}:${String(minutes).padStart(2, '0')}`;
  if (hours === 12 && minutes === 0) return `${clock} m.`;
  return `${clock} ${hours < 12 ? 'a. m.' : 'p. m.'}`;
};

/** "8:00 a. m. – 5:00 p. m." */
export const formatHours = ({ opens, closes }: OpeningHours): string => `${formatTime(opens)} – ${formatTime(closes)}`;

/** "lunes a sábado, de 8:00 a. m. a 5:00 p. m.": opening hours inside a sentence. */
export const describeHours = (hours: OpeningHours): string =>
  `${hours.days.toLowerCase()}, de ${formatTime(hours.opens)} a ${formatTime(hours.closes)}`;

/**
 * Ends a sentence with a full stop, unless its last word already brings one: opening hours end in
 * "p. m." ("p.m." in English), and a sentence takes only one full stop.
 */
export const sentence = (text: string): string => (text.endsWith('.') ? text : `${text}.`);

/** From Carinova's brief: "Lunes a sábados, 8 a. m. – 5 p. m.", the same at both branches. */
const MONDAY_TO_SATURDAY: OpeningHours = {
  days: 'Lunes a sábado',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  opens: '08:00',
  closes: '17:00',
};

export interface Branch {
  /** Anchor on /sucursales (e.g. /sucursales#bluefields). */
  id: string;
  city: string;
  address: string;
  /** Directions the Nicaraguan way, e.g. "De la rotonda X, 2 c. al lago". */
  reference?: string;
  hours: Array<OpeningHours>;
  /** Give a branch its own number and the floating WhatsApp button becomes a branch menu. */
  whatsapp: string;
  phone?: string;
  /** Google Maps link; the "Cómo llegar" button is hidden while empty. */
  mapsUrl?: string;
}

/** What a branch shows while Carinova has not sent its address. A real address reads the same in both languages. */
export const ADDRESS_PENDING = 'Dirección por confirmar';

/** Pickup branches in Nicaragua ("inicialmente Managua y Bluefields"). */
export const BRANCHES: Array<Branch> = [
  {
    id: 'managua',
    city: 'Managua',
    address: ADDRESS_PENDING, // TODO
    reference: '', // TODO
    hours: [MONDAY_TO_SATURDAY],
    whatsapp: CONTACT.whatsapp,
    mapsUrl: '', // TODO
  },
  {
    id: 'bluefields',
    city: 'Bluefields',
    address: ADDRESS_PENDING, // TODO
    reference: '', // TODO
    hours: [MONDAY_TO_SATURDAY],
    whatsapp: CONTACT.whatsapp,
    mapsUrl: '', // TODO
  },
];

/** Where customers' packages are received in the United States. Los Ángeles: "sujeto a habilitación". */
export const RECEPTION_POINTS = [
  { id: 'miami', city: 'Miami', state: 'Florida', available: true },
  { id: 'los-angeles', city: 'Los Ángeles', state: 'California', available: false },
];

/** Delivery to the customer's door (última milla): "sujeto a habilitación". Shown as "Próximamente". */
export const LAST_MILE = { available: false };

export interface ElectronicsItem {
  /** Also the name of the calculator's field and of its URL parameter (/cotizador?celular=1). */
  id: string;
  name: string;
  plural: string;
  icon: string;
  /** USD per unit: air shipping and taxes included. */
  price: number;
  /** Brand names keep their capitals inside a sentence. */
  brand?: boolean;
}

/**
 * A delivery estimate: the days as numbers (the English wording is built from them) and as Spanish
 * text, "2 a 4 días".
 */
const transit = (min: number, max: number) => ({
  transitDays: [min, max] as [number, number],
  transit: `${min} a ${max} días`,
});

/** Devices with a flat rate per unit, air shipping and taxes included. */
const ELECTRONICS: Array<ElectronicsItem> = [
  { id: 'celular', name: 'Celular', plural: 'Celulares', icon: 'tabler:device-mobile', price: 30 },
  { id: 'tablet', name: 'Tablet', plural: 'Tablets', icon: 'tabler:device-tablet', price: 40 },
  { id: 'laptop', name: 'Laptop', plural: 'Laptops', icon: 'tabler:device-laptop', price: 80 },
  { id: 'xbox', name: 'Xbox', plural: 'Xbox', icon: 'tabler:device-gamepad-2', price: 85, brand: true },
  {
    id: 'playstation',
    name: 'PlayStation',
    plural: 'PlayStation',
    icon: 'tabler:device-gamepad-2',
    price: 85,
    brand: true,
  },
];

/** Rates from Carinova's brief. Insurance and taxes are included when they apply (`notes`). */
export const RATES = {
  /** Bill each started pound as a full pound (2.3 lb → 3 lb). TODO: confirm. */
  roundUpToPound: true,
  /** Delivery estimates count from the moment the package is received in the United States. */
  transitFrom: 'desde que recibimos tu paquete',
  air: {
    id: 'aereo',
    name: 'Aéreo',
    icon: 'tabler:plane',
    /** USD per pound. */
    pricePerLb: 6.5,
    /** Minimum billable weight, in pounds. TODO: confirm. */
    minLb: 1,
    ...transit(2, 4),
  },
  sea: {
    id: 'maritimo',
    name: 'Marítimo',
    icon: 'tabler:ship',
    pricePerLb: 2.5,
    /**
     * USD per cubic foot: length × width × height in inches ÷ 1,728. A shipment pays by weight or by
     * volume, whichever is more, the usual rule for sea cargo (utils/rates.ts → quoteSea). TODO: confirm.
     */
    pricePerCubicFoot: 20,
    /** TODO: confirm. */
    minLb: 1,
    ...transit(15, 20),
  },
  electronics: {
    id: 'electronicos',
    name: 'Electrónicos',
    icon: 'tabler:devices',
    /** They travel by air. */
    ...transit(2, 4),
    items: ELECTRONICS,
  },
  /** Shown under the rates and the calculator. */
  notes: [
    'Precios en dólares estadounidenses (US$).',
    'Las tarifas incluyen seguro e impuestos cuando aplique.',
    'La entrega estimada se cuenta desde que recibimos tu paquete. El monto final se confirma cuando lo recibimos.',
  ],
};

/**
 * The address customers use at US stores, from Carinova's "Tu dirección en Miami" graphic.
 * The store's name fields carry "Carinova" and the service, which is how the Miami warehouse
 * knows whose package it is. Shown after sign-up, in the customer's casillero and in the welcome
 * e-mail. "Aéreo" is what the warehouse reads: it is not translated.
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
    'Escribí el nombre y el apellido exactamente así: es como identificamos tus paquetes.',
    'Para envíos marítimos, consultanos por WhatsApp antes de comprar.',
  ],
};

/**
 * The Miami address as the fields of a store checkout, in the order of Carinova's graphic. The
 * labels carry both languages, as on the graphic: store checkouts are in English.
 */
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
    summary: 'No pueden viajar en avión. Si necesitás traer alguno, consultanos antes de comprarlo.',
    items: ['Productos inflamables', 'Baterías de litio sueltas', 'Body spray', 'Perfumes', 'Aerosoles'],
  },
};

export interface Store {
  /** Key of its card on the home page. */
  id: string;
  name: string;
  /** Its address as people know it: what the card and the home hero show. */
  domain: string;
  /**
   * Where "Ir a la tienda" goes: the store's own site. On a phone that has the store's app, the
   * link opens the app instead (the stores register their addresses with iOS and Android).
   */
  url: string;
  /** What it is, in one line. Only what is true of the store: no offers, no shipping promises. */
  about: string;
  /** What people usually buy there. */
  categories: Array<string>;
}

/**
 * Stores customers buy from: the cards of the "compra en" section and the moving background of the
 * home hero. Names and addresses only: the stores' logos are trademarks of their owners.
 */
export const STORES: Array<Store> = [
  {
    id: 'amazon',
    name: 'Amazon',
    domain: 'amazon.com',
    url: 'https://www.amazon.com/',
    about: 'Tienda en línea con millones de productos de todo tipo, de Amazon y de otros vendedores.',
    categories: ['Electrónica', 'Hogar', 'Ropa', 'Libros', 'Juguetes'],
  },
  {
    id: 'shein',
    name: 'Shein',
    domain: 'shein.com',
    url: 'https://us.shein.com/',
    about: 'Ropa, calzado y accesorios de moda a precios bajos.',
    categories: ['Ropa', 'Calzado', 'Accesorios', 'Hogar'],
  },
  {
    id: 'temu',
    name: 'Temu',
    domain: 'temu.com',
    url: 'https://www.temu.com/',
    about: 'Mercado en línea con precios bajos en artículos para el hogar, moda y accesorios.',
    categories: ['Hogar', 'Moda', 'Herramientas', 'Accesorios'],
  },
  {
    id: 'ebay',
    name: 'eBay',
    domain: 'ebay.com',
    url: 'https://www.ebay.com/',
    about: 'Mercado en línea de artículos nuevos y usados, por compra directa o por subasta.',
    categories: ['Electrónica', 'Repuestos', 'Coleccionables', 'Moda'],
  },
  {
    id: 'walmart',
    name: 'Walmart',
    domain: 'walmart.com',
    url: 'https://www.walmart.com/',
    about: 'Tienda por departamentos con de todo para la casa y la familia.',
    categories: ['Hogar', 'Electrónica', 'Juguetes', 'Ropa'],
  },
  {
    id: 'target',
    name: 'Target',
    domain: 'target.com',
    url: 'https://www.target.com/',
    about: 'Tienda por departamentos: hogar, ropa, belleza y artículos para niños.',
    categories: ['Hogar', 'Ropa', 'Belleza', 'Niños'],
  },
  {
    id: 'best-buy',
    name: 'Best Buy',
    domain: 'bestbuy.com',
    url: 'https://www.bestbuy.com/',
    about: 'Tienda especializada en electrónica y tecnología.',
    categories: ['Computadoras', 'Celulares', 'Televisores', 'Videojuegos'],
  },
  {
    id: 'nike',
    name: 'Nike',
    domain: 'nike.com',
    url: 'https://www.nike.com/',
    about: 'Calzado, ropa y accesorios deportivos de la marca.',
    categories: ['Tenis', 'Ropa deportiva', 'Accesorios'],
  },
  {
    id: 'apple',
    name: 'Apple',
    domain: 'apple.com',
    url: 'https://www.apple.com/store',
    about: 'La tienda oficial de Apple.',
    categories: ['iPhone', 'iPad', 'Mac', 'Apple Watch', 'AirPods'],
  },
  {
    id: 'macys',
    name: 'Macy’s',
    domain: 'macys.com',
    url: 'https://www.macys.com/',
    about: 'Tienda por departamentos: ropa, calzado, joyería y artículos para el hogar.',
    categories: ['Ropa', 'Calzado', 'Joyería', 'Hogar'],
  },
  {
    id: 'costco',
    name: 'Costco',
    domain: 'costco.com',
    url: 'https://www.costco.com/',
    about: 'Club de compras al por mayor: hogar, electrónica, muebles y electrodomésticos.',
    categories: ['Hogar', 'Electrónica', 'Muebles', 'Electrodomésticos'],
  },
  {
    id: 'aliexpress',
    name: 'AliExpress',
    domain: 'aliexpress.com',
    url: 'https://www.aliexpress.com/',
    about: 'Mercado en línea internacional, con vendedores de muchos países.',
    categories: ['Electrónica', 'Accesorios', 'Hogar', 'Herramientas'],
  },
];

/** Customer reviews (Google). The reviews section is hidden while this list is empty. Only real reviews. */
export const REVIEWS: Array<{ name: string; text: string; rating: number; source?: string }> = [];

const hello = (text: string) => `Hola Carinova 👋 ${text}`;

/**
 * Prefilled WhatsApp messages: one per place a WhatsApp link appears, so the team sees what the
 * customer was looking at and which link sent the lead. Customers write them, so they speak to
 * Carinova as "ustedes". Every message must be different from the others: src/data/messages.test.ts
 * checks it, in both languages. docs/INFORMATION-ARCHITECTURE.md lists where each one is used.
 */
export const WA_MESSAGES = {
  /**
   * The floating button, by the page's Spanish path (the English page uses the same key). Pages
   * without an entry (the 404 page) get `floatingDefault`.
   */
  floating: {
    '/': hello('Quiero información para traer mis compras de Estados Unidos.'),
    '/como-comprar': hello('Tengo una duda sobre cómo comprar en Estados Unidos.'),
    '/servicios': hello('Quiero saber qué servicio me conviene.'),
    '/cotizador': hello('Necesito ayuda para cotizar mi envío.'),
    '/sucursales': hello('Tengo una consulta sobre sus sucursales.'),
    '/mi-cuenta': hello('Tengo una consulta sobre mi cuenta.'),
    '/registro': hello('Estoy abriendo mi casillero y tengo una duda.'),
    '/registro/confirmar': hello('Estoy confirmando mi correo y tengo una duda.'),
    '/ingresar': hello('Quiero ingresar a mi casillero y tengo una duda.'),
    '/mi-casillero': hello('Estoy viendo mi casillero y tengo una consulta.'),
    '/empresas': hello('Tengo una consulta sobre su servicio para empresas.'),
    '/preguntas-frecuentes': hello('Tengo una pregunta que no encontré en su página.'),
    '/articulos-prohibidos': hello('Tengo una duda sobre los artículos prohibidos.'),
    '/nosotros': hello('Quiero conocer más sobre Carinova.'),
    '/terminos': hello('Tengo una consulta sobre sus términos y condiciones.'),
    '/privacidad': hello('Tengo una consulta sobre mis datos personales.'),
  } as Record<string, string>,
  floatingDefault: hello('Vengo de su sitio web y tengo una consulta.'),
  footer: hello('Vengo de su sitio web y quiero información.'),

  // Home page
  homeHero: hello('Quiero traer mis compras de Estados Unidos. ¿Cómo empiezo?'),
  /** Under the stores: for people without a card or another way to pay online. */
  storesAssist: hello('No tengo tarjeta para pagar en línea. ¿Me ayudan con una compra asistida?'),
  homeFaq: hello('Leí sus preguntas frecuentes y tengo otra duda.'),
  homeClosing: hello('Quiero hacer mi primera compra con ustedes. ¿Me ayudan?'),

  // Cómo comprar
  howToClosing: hello('Ya vi cómo comprar y quiero ayuda con mi primera compra.'),
  example: (category: string) => hello(`Vi su ejemplo de ${category.toLowerCase()} y quiero traer algo parecido.`),

  // Servicios: one per service, keyed by its id (src/data/services.ts)
  services: {
    aereo: hello('Quiero enviar por aéreo. ¿Me dan más información?'),
    maritimo: hello('Quiero enviar por marítimo. ¿Me dan más información?'),
    encomiendas: hello('Me van a mandar una encomienda desde Estados Unidos. ¿Cómo hago?'),
    'compras-asistidas': hello('Quiero una compra asistida. Este es el enlace del producto: '),
    'retiro-en-sucursal': hello('Quiero saber cómo retirar mi paquete en sucursal.'),
    'entrega-a-domicilio': hello('Quiero saber cuándo tendrán entrega a domicilio.'),
  } as Record<string, string>,
  servicesClosing: hello('Quiero ayuda para elegir el servicio de mi envío.'),

  // Cotizador
  quote: (shipment: string, city: string, total: string) =>
    hello(`Coticé en su página ${shipment} para retirar en ${city}: ${total}. ¿Me ayudan a confirmarlo?`),
  quoteEmpty: hello('Estoy en su cotizador y no sé qué datos poner.'),
  quoteClosing: hello('Quiero cotizar un envío especial (muy grande, frágil o de varios artículos).'),

  // Sucursales
  branch: (city: string) => hello(`Tengo una consulta para la sucursal de ${city}.`),
  branchesClosing: hello('Quiero saber en qué sucursal me conviene retirar.'),

  // Mi cuenta
  accountExisting: hello('Ya tengo mi Carinova ID y quiero consultar mis paquetes.'),
  accountClosing: hello('Tengo una duda antes de abrir mi casillero.'),

  // Sign-up and confirmation
  signupAssist: hello('Prefiero abrir mi casillero por WhatsApp.'),
  signupHelp: hello('Intenté registrarme en su página y necesito ayuda.'),
  confirmHelp: hello('No pude confirmar mi correo para abrir mi casillero.'),
  customer: (code: string) => hello(`Mi Carinova ID es ${code} y tengo una consulta.`),
  welcomeEmail: (code: string) => hello(`Mi Carinova ID es ${code}. Recibí el correo de bienvenida y tengo una duda.`),

  // Sign-in and the customer's casillero
  signinHelp: hello('No puedo ingresar a mi casillero. ¿Me ayudan?'),
  signinError: hello('Intenté ingresar a mi casillero en su página y me dio un error.'),
  mailbox: (code: string) => hello(`Mi Carinova ID es ${code}. Quiero consultar por mis paquetes.`),
  mailboxUpdate: (code: string) => hello(`Mi Carinova ID es ${code} y quiero actualizar mis datos.`),
  mailboxError: hello('Intenté abrir mi casillero en su página y me dio un error.'),

  // Empresas
  accountCompany: hello('Quiero abrir un Carinova ID para mi empresa.'),
  businessHelp: hello('Intenté enviar el formulario para empresas y necesito ayuda.'),
  businessClosing: hello('Quiero hablar con un asesor sobre los envíos de mi empresa.'),

  // Ayuda, artículos prohibidos, nosotros, 404
  faqClosing: hello('No encontré mi respuesta en sus preguntas frecuentes.'),
  restricted: hello('Antes de comprar, quiero saber si pueden traer este producto: '),
  aboutClosing: hello('Conocí Carinova en su página y quiero empezar a enviar con ustedes.'),
  notFound: hello('Llegué a una página de su sitio que no existe.'),
};
