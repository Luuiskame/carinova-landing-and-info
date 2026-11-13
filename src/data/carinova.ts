/**
 * Carinova business data: contact, branches and hours, where packages are received in the United
 * States, rates, the Miami address, restricted items, the stores customers buy from, the labels of
 * the calls to action and every prefilled WhatsApp message. Pages and components read from here, so
 * this is the one file to edit when the details change. How the site is organised around this data:
 * docs/INFORMATION-ARCHITECTURE.md.
 *
 * Since 2026-11-13 the wording, the rates' conditions, the stores and the calls to action follow
 * Carinova's prototype page ("CARINOVA · Signature system v1.0"); what the prototype left to an
 * integration (accounts, tracking) is what the site and its database really do.
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

/** Carinova's line, under the logo and above the home page's title. */
export const TAGLINE = 'Envíos que unen';

/** The title of the home page, in two lines: the second one is shown in orange. */
export const HEADLINE: [string, string] = ['De Estados Unidos', 'hasta vos.'];

/** Carinova's promise, word for word from its prototype: the sentence under the home page's title. */
export const VALUE_PROPOSITION =
  'Traemos tus compras personales, encomiendas familiares y carga empresarial desde Estados Unidos hasta Nicaragua.';

export const CONTACT = {
  /** International format, digits only (505 + 8 digits for Nicaragua): what wa.me links need. */
  whatsapp: '50588552956',
  /** The same number as people read it (e-mails, the footer). */
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
 * The calls to action (docs/INFORMATION-ARCHITECTURE.md → "Calls to action"), with the labels of
 * Carinova's prototype: sign-up ("Crear cuenta", the orange button), the quote calculator ("Cotizá
 * tu envío"), signing in ("Ingresá" in the header, which opens the sign-in dialog), tracking
 * ("Rastreá tu paquete") and WhatsApp help, a link whose prefilled message depends on where it is
 * (WA_MESSAGES).
 *
 * `account` takes the place of `signup` for a customer who is signed in (they already have an
 * account). Paths are Spanish site paths: components turn them into the address of the language
 * being rendered (src/i18n).
 */
export const CTA = {
  signup: { text: 'Crear cuenta', path: '/registro' },
  quote: { text: 'Cotizá tu envío', path: '/cotizador' },
  help: { text: 'Ayuda por WhatsApp' },
  /** `short` is the label where space is tight: the header. */
  account: { text: 'Ir a mi cuenta', short: 'Mi cuenta', path: '/mi-cuenta' },
  /** `text` is the button of a form or a step; `short` is the header's link. */
  signin: { text: 'Ingresar', short: 'Ingresá', path: '/ingresar' },
  /** A customer goes to their packages; a visitor to the section of the home page that explains tracking. */
  track: { text: 'Rastreá tu paquete', path: '/mi-cuenta#paquetes', visitorPath: '/#rastreo' },
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
  /** Anchor on /sucursales (e.g. /sucursales#bluefields), and the `code` of the branch in the database. */
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

/**
 * Where customers' packages are received in the United States: the warehouses whose address a
 * customer sees in their account. Los Ángeles is not open yet: it is listed, as "Próximamente", and
 * has no address. `code` is the warehouse's code in the database (db/schema.sql → warehouses).
 */
export const RECEPTION_POINTS = [
  { id: 'miami', code: 'MIA', city: 'Miami', state: 'Florida', available: true },
  { id: 'los-angeles', code: 'LAX', city: 'Los Ángeles', state: 'California', available: false },
];

/**
 * Delivery to the customer's door (última milla). From Carinova's prototype: it is coordinated case
 * by case, anywhere in the country, and has an additional charge that depends on the destination.
 * There is no published price: it is confirmed when the delivery is arranged.
 */
export const LAST_MILE = { available: true, extraCharge: true };

export interface ElectronicsItem {
  /** Also the value of the calculator's "Tipo de tarifa" and of its URL parameter (/cotizador?base=celular). */
  id: string;
  name: string;
  plural: string;
  icon: string;
  /** USD per unit, by air. */
  price: number;
  /** Brand names keep their capitals inside a sentence. */
  brand?: boolean;
}

/**
 * A delivery estimate: the days as numbers (the English wording is built from them) and as Spanish
 * text, "3 a 4 días".
 */
const transit = (min: number, max: number) => ({
  transitDays: [min, max] as [number, number],
  transit: `${min} a ${max} días`,
});

/** Devices with a flat rate per unit, by air. */
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

/**
 * Rates and delivery estimates, from Carinova's prototype. A shipment is quoted on one basis at a
 * time: by the pound, by the cubic foot (sea) or per unit (some electronics, by air). Which basis
 * applies is decided by Carinova according to the cargo; the arithmetic is exact, with no minimum
 * weight and no rounding of pounds (utils/rates.ts).
 */
export const RATES = {
  /** Delivery estimates count from the moment the package is physically received in the United States. */
  transitFrom: 'desde la recepción física de tu paquete',
  air: {
    id: 'aereo',
    name: 'Aéreo',
    icon: 'tabler:plane',
    /** What its card says above its name. */
    badge: 'Más rápido',
    /** USD per pound. */
    pricePerLb: 6.5,
    ...transit(3, 4),
  },
  sea: {
    id: 'maritimo',
    name: 'Marítimo',
    icon: 'tabler:ship',
    badge: 'Más económico',
    pricePerLb: 2.5,
    /** USD per cubic foot: length × width × height ÷ 1,728 (inches) or ÷ 28,316.85 (centimetres). */
    pricePerCubicFoot: 20,
    ...transit(15, 20),
  },
  electronics: {
    id: 'electronicos',
    name: 'Electrónicos',
    icon: 'tabler:devices',
    /** They travel by air. */
    ...transit(3, 4),
    items: ELECTRONICS,
  },
  /** Shown under the rates and the calculator. */
  notes: [
    'Los plazos cuentan desde la recepción física del paquete y pueden variar por tránsito, aduana y destino.',
    'Se verifican el peso, las dimensiones, la modalidad, la cobertura y las condiciones del servicio.',
    'Las tarifas contemplan seguro e impuestos cuando correspondan al envío. La cobertura, los límites, las exclusiones y los cargos adicionales están sujetos a las condiciones del servicio.',
    'Las tarifas de electrónicos corresponden a envíos aéreos por unidad.',
  ],
};

/**
 * The address customers use at US stores, from Carinova's "Tu dirección en Miami" graphic.
 * The store's name fields carry "Carinova" and the service, which is how the Miami warehouse
 * knows whose package it is. Shown after sign-up, in the customer's account and in the welcome
 * e-mail. "Aéreo" is what the warehouse reads: it is not translated. The same address is the MIA
 * row of the `warehouses` table (db/schema.sql); a unit test compares the two.
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

export type RestrictedGroupId = 'notYet' | 'prohibited' | 'seaOnly';

export interface RestrictedItem {
  /** As Carinova lists it. */
  name: string;
  /**
   * Words a customer may type for it in "¿Puede ingresar a Nicaragua?" on the home page, without
   * accents and in lower case. Whole words are compared, so "arma" does not match "armario".
   */
  match: Array<string>;
}

export interface RestrictedGroup {
  title: string;
  /** One sentence: what the group means for the customer. */
  summary: string;
  items: Array<RestrictedItem>;
}

/**
 * What Carinova cannot bring, in the three groups Carinova gave on 2026-11-13. Owned by
 * /articulos-prohibidos; the home page's "¿Puede ingresar a Nicaragua?", the answers of the FAQ,
 * the confirmation page and the welcome e-mail read the same lists.
 */
export const RESTRICTED_ITEMS: Record<RestrictedGroupId, RestrictedGroup> = {
  notYet: {
    title: 'No autorizados para traer aún',
    summary: 'Todavía no estamos autorizados para traerlos.',
    items: [
      {
        name: 'Carros',
        match: ['carro', 'carros', 'auto', 'autos', 'automovil', 'vehiculo', 'vehiculos', 'camioneta'],
      },
      { name: 'Motos', match: ['moto', 'motos', 'motocicleta', 'motocicletas'] },
      {
        name: 'Maquinaria pesada',
        match: ['maquinaria', 'maquinaria pesada', 'excavadora', 'retroexcavadora', 'tractor', 'montacargas'],
      },
    ],
  },
  prohibited: {
    title: 'Prohibidos para recepción y transporte',
    summary: 'No los recibimos ni los transportamos.',
    items: [
      {
        name: 'Armas, municiones y sus accesorios',
        match: ['arma', 'armas', 'pistola', 'pistolas', 'rifle', 'rifles', 'municion', 'municiones', 'bala', 'balas'],
      },
      {
        name: 'Tabaco, cigarrillos y derivados',
        match: ['tabaco', 'cigarrillo', 'cigarrillos', 'cigarro', 'cigarros', 'puro', 'puros'],
      },
      {
        name: 'Cigarrillos electrónicos',
        match: [
          'cigarrillo electronico',
          'cigarrillos electronicos',
          'cigarro electronico',
          'vape',
          'vapes',
          'vapeador',
        ],
      },
      { name: 'Accesorios para aeronaves', match: ['aeronave', 'aeronaves', 'avion', 'aviones', 'avioneta'] },
      {
        name: 'Transmisores de radio',
        match: ['transmisor', 'transmisores', 'transmisor de radio', 'radio transmisor', 'walkie talkie'],
      },
      { name: 'Drones', match: ['dron', 'drone', 'drones'] },
    ],
  },
  seaOnly: {
    title: 'No ingresan por aéreo, pero sí por marítimo',
    summary: 'No pueden viajar en avión: los traemos por transporte marítimo.',
    items: [
      {
        name: 'Productos inflamables',
        match: ['inflamable', 'inflamables', 'combustible', 'gasolina', 'pintura', 'solvente', 'alcohol'],
      },
      {
        name: 'Baterías de litio sueltas',
        match: ['bateria', 'baterias', 'bateria de litio', 'baterias de litio', 'litio', 'power bank', 'pila', 'pilas'],
      },
      { name: 'Body spray', match: ['body spray', 'splash', 'colonia'] },
      { name: 'Perfumes', match: ['perfume', 'perfumes', 'fragancia', 'fragancias'] },
      { name: 'Aerosoles', match: ['aerosol', 'aerosoles', 'spray', 'desodorante en spray', 'laca'] },
    ],
  },
};

/** The groups in the order they are shown: what cannot come at all first, then what only comes by sea. */
export const RESTRICTED_ORDER: Array<RestrictedGroupId> = ['notYet', 'prohibited', 'seaOnly'];

/** What a search of "¿Puede ingresar a Nicaragua?" offers as examples (each one is in a list above). */
export const RESTRICTED_EXAMPLES = ['Perfume', 'Dron', 'Batería de litio', 'Moto', 'Cigarrillo electrónico'];

export type StoreCategoryId = 'moda' | 'tecnologia' | 'hogar' | 'marketplaces' | 'belleza';

/** The filters of "Explorá tiendas" on the home page, in their order. */
export const STORE_CATEGORIES: Array<{ id: StoreCategoryId; name: string }> = [
  { id: 'moda', name: 'Moda' },
  { id: 'tecnologia', name: 'Tecnología' },
  { id: 'hogar', name: 'Hogar' },
  { id: 'marketplaces', name: 'Marketplaces' },
  { id: 'belleza', name: 'Belleza' },
];

export interface Store {
  /** Key of the store on the home page. */
  id: string;
  name: string;
  /** Its address as people know it. */
  domain: string;
  /**
   * Where "Ir al sitio de la tienda" goes: the store's own site. On a phone that has the store's
   * app, the link opens the app instead (the stores register their addresses with iOS and Android).
   */
  url: string;
  category: StoreCategoryId;
  /** One line under its name. Only what is true of the store: no offers, no shipping promises. */
  tagline: string;
  /** What people find there and what to check before buying, in the store's card. */
  about: string;
}

/**
 * Stores customers buy from: "Explorá tiendas" on the home page. They are examples by category,
 * with no agreement with Carinova and no endorsement implied (the page says so). Names and
 * addresses only: the stores' logos are trademarks of their owners.
 */
export const STORES: Array<Store> = [
  {
    id: 'amazon',
    name: 'Amazon',
    domain: 'amazon.com',
    url: 'https://www.amazon.com/',
    category: 'marketplaces',
    tagline: 'Un universo de categorías en un mismo lugar.',
    about: 'Explorá artículos para el hogar, libros, accesorios, tecnología y muchos otros productos.',
  },
  {
    id: 'shein',
    name: 'SHEIN',
    domain: 'shein.com',
    url: 'https://us.shein.com/',
    category: 'moda',
    tagline: 'Moda y accesorios para cada estilo.',
    about: 'Prendas, bolsos y accesorios. Revisá tallas, materiales y disponibilidad.',
  },
  {
    id: 'temu',
    name: 'Temu',
    domain: 'temu.com',
    url: 'https://www.temu.com/',
    category: 'marketplaces',
    tagline: 'Productos para descubrir y comparar.',
    about: 'Artículos para el hogar, accesorios y compras cotidianas. Revisá cada descripción.',
  },
  {
    id: 'walmart',
    name: 'Walmart',
    domain: 'walmart.com',
    url: 'https://www.walmart.com/',
    category: 'hogar',
    tagline: 'Compras para la casa y la familia.',
    about: 'Artículos para el hogar, organización, accesorios y uso personal.',
  },
  {
    id: 'best-buy',
    name: 'Best Buy',
    domain: 'bestbuy.com',
    url: 'https://www.bestbuy.com/',
    category: 'tecnologia',
    tagline: 'Tecnología para trabajar y disfrutar.',
    about: 'Laptops, celulares, tablets y consolas. Confirmá la tarifa por unidad y los requisitos de las baterías.',
  },
  {
    id: 'nike',
    name: 'Nike',
    domain: 'nike.com',
    url: 'https://www.nike.com/',
    category: 'moda',
    tagline: 'Ropa y calzado para moverte a tu manera.',
    about: 'Calzado, ropa deportiva y accesorios de distintas categorías.',
  },
  {
    id: 'apple',
    name: 'Apple',
    domain: 'apple.com',
    url: 'https://www.apple.com/store',
    category: 'tecnologia',
    tagline: 'Dispositivos y accesorios.',
    about: 'Celulares, tablets, laptops y accesorios. Algunos productos tienen tarifa por unidad.',
  },
  {
    id: 'target',
    name: 'Target',
    domain: 'target.com',
    url: 'https://www.target.com/',
    category: 'hogar',
    tagline: 'Ideas para la casa y tu día a día.',
    about: 'Decoración, artículos para el hogar, regalos y otras categorías.',
  },
  {
    id: 'ebay',
    name: 'eBay',
    domain: 'ebay.com',
    url: 'https://www.ebay.com/',
    category: 'marketplaces',
    tagline: 'Productos nuevos y de segunda mano.',
    about: 'Compras a distintos vendedores. Revisá el estado, los detalles y las condiciones.',
  },
  {
    id: 'sephora',
    name: 'Sephora',
    domain: 'sephora.com',
    url: 'https://www.sephora.com/',
    category: 'belleza',
    tagline: 'Belleza y cuidado personal.',
    about: 'Maquillaje y cuidado personal. Los perfumes y los aerosoles solo viajan por marítimo.',
  },
  {
    id: 'home-depot',
    name: 'Home Depot',
    domain: 'homedepot.com',
    url: 'https://www.homedepot.com/',
    category: 'hogar',
    tagline: 'Ideas para proyectos y mejoras.',
    about: 'Herramientas y mejoras para el hogar. Verificá el tamaño y las restricciones.',
  },
  {
    id: 'adidas',
    name: 'Adidas',
    domain: 'adidas.com',
    url: 'https://www.adidas.com/us',
    category: 'moda',
    tagline: 'Deporte y estilo de vida.',
    about: 'Calzado, ropa deportiva y accesorios.',
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
    '/como-comprar': hello('Tengo una duda sobre cómo funciona el servicio.'),
    '/servicios': hello('Quiero saber qué servicio me conviene.'),
    '/cotizador': hello('Necesito ayuda para cotizar mi envío.'),
    '/sucursales': hello('Tengo una consulta sobre sus sucursales.'),
    '/mi-cuenta': hello('Estoy en mi cuenta y tengo una consulta.'),
    '/registro': hello('Estoy creando mi cuenta y tengo una duda.'),
    '/registro/confirmar': hello('Estoy confirmando mi correo y tengo una duda.'),
    '/ingresar': hello('Quiero ingresar a mi cuenta y tengo una duda.'),
    '/empresas': hello('Tengo una consulta sobre su servicio para empresas.'),
    '/preguntas-frecuentes': hello('Tengo una pregunta que no encontré en su página.'),
    '/articulos-prohibidos': hello('Tengo una duda sobre los artículos que no pueden traer.'),
    '/nosotros': hello('Quiero conocer más sobre Carinova.'),
    '/terminos': hello('Tengo una consulta sobre sus términos y condiciones.'),
    '/privacidad': hello('Tengo una consulta sobre mis datos personales.'),
  } as Record<string, string>,
  floatingDefault: hello('Vengo de su sitio web y tengo una consulta.'),
  footer: hello('Vengo de su sitio web y quiero información.'),

  // Home page
  /** The calculator of the home page. */
  homeQuote: (shipment: string, total: string) =>
    hello(`Coticé en su página de inicio ${shipment}: ${total}. ¿Me ayudan a confirmarlo?`),
  homeQuoteEmpty: hello('Estoy en la calculadora de su página de inicio y no sé qué datos poner.'),
  /** "¡Realizamos tus compras por vos!": the link the visitor pasted goes at the end. */
  shopper: (link: string) =>
    hello(
      `Quiero solicitar una compra asistida. Producto: ${link} ¿Me confirman disponibilidad, si puede ingresar y el costo total?`
    ),
  /** A store's card. */
  storeAssist: (store: string) => hello(`Quiero una compra asistida en ${store}. Este es el enlace del producto: `),
  /** "¿Puede ingresar a Nicaragua?": the article the visitor searched for. */
  itemCheck: (item: string) => hello(`Antes de comprar, quiero saber si pueden traer: ${item}`),
  itemCheckEmpty: hello('Quiero consultar si un artículo puede ingresar a Nicaragua: '),
  homeDelivery: hello('Quiero consultar la entrega a domicilio. Mi dirección es: '),
  homeFaq: hello('Leí sus preguntas frecuentes y tengo otra duda.'),
  careers: hello('Quiero formar parte del equipo de Carinova. Me interesa el área de: '),

  // Cómo funciona
  howToClosing: hello('Ya vi cómo funciona y quiero ayuda con mi primer envío.'),
  example: (category: string) => hello(`Vi su ejemplo de ${category.toLowerCase()} y quiero traer algo parecido.`),

  // Servicios: one per service, keyed by its id (src/data/services.ts)
  services: {
    aereo: hello('Quiero enviar por aéreo. ¿Me dan más información?'),
    maritimo: hello('Quiero enviar por marítimo. ¿Me dan más información?'),
    encomiendas: hello('Me van a mandar una encomienda desde Estados Unidos. ¿Cómo hago?'),
    'compras-asistidas': hello('Quiero que compren un producto por mí. Este es el enlace: '),
    'retiro-en-sucursal': hello('Quiero saber cómo retirar mi paquete en sucursal.'),
    'entrega-a-domicilio': hello('Quiero coordinar una entrega a domicilio. ¿Qué cobertura y qué cargo tiene?'),
  } as Record<string, string>,
  servicesClosing: hello('Quiero ayuda para elegir el servicio de mi envío.'),

  // Cotizador
  quote: (shipment: string, total: string) =>
    hello(`Coticé en su cotizador ${shipment}: ${total}. ¿Me ayudan a confirmarlo?`),
  quoteEmpty: hello('Estoy en su cotizador y no sé qué datos poner.'),
  quoteClosing: hello('Quiero cotizar un envío especial (muy grande, frágil o de varios artículos).'),

  // Sucursales
  branch: (city: string) => hello(`Tengo una consulta para la sucursal de ${city}.`),
  branchesClosing: hello('Quiero saber en qué sucursal me conviene retirar.'),

  // Mi cuenta: what a visitor sees
  accountClosing: hello('Tengo una duda antes de crear mi cuenta.'),

  // Sign-up and confirmation
  signupAssist: hello('Prefiero crear mi cuenta por WhatsApp.'),
  signupHelp: hello('Intenté registrarme en su página y necesito ayuda.'),
  confirmHelp: hello('No pude confirmar mi correo para crear mi cuenta.'),
  accountExisting: hello('Ya tengo mi Carinova ID y quiero consultar mis paquetes.'),
  customer: (code: string) => hello(`Mi Carinova ID es ${code} y tengo una consulta.`),
  welcomeEmail: (code: string) => hello(`Mi Carinova ID es ${code}. Recibí el correo de bienvenida y tengo una duda.`),

  // Sign-in and the customer's account
  signinHelp: hello('No puedo ingresar a mi cuenta. ¿Me ayudan?'),
  signinError: hello('Intenté ingresar a mi cuenta en su página y me dio un error.'),
  /** About the packages of an account, and about one of them (its reference: PKG-000123). */
  accountPackages: (code: string) => hello(`Mi Carinova ID es ${code}. Quiero consultar por mis paquetes.`),
  accountPackage: (code: string, reference: string) =>
    hello(`Mi Carinova ID es ${code}. Quiero consultar por mi paquete ${reference}.`),
  /** About an invoice (its number: INV-000123): how to pay it, or a payment already made. */
  accountInvoice: (code: string, number: string) =>
    hello(`Mi Carinova ID es ${code}. Quiero pagar o consultar la factura ${number}.`),
  accountUpdate: (code: string) => hello(`Mi Carinova ID es ${code} y quiero actualizar mis datos.`),
  accountError: hello('Intenté abrir mi cuenta en su página y me dio un error.'),

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
