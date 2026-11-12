/**
 * What Carinova offers, organised the way the site presents it (docs/INFORMATION-ARCHITECTURE.md):
 *
 * - SERVICES: six services on three independent axes (how a package travels, who sends it to the
 *   casillero, how the customer receives it). Every shipment is one choice on each axis.
 * - PROCESS_STEPS: the four steps of "Cómo comprar" (summary on the home page, details on the page).
 * - ACCOUNT_PARTS: what a Carinova account is made of ("Mi cuenta").
 * - SHOPPING_EXAMPLES: the worked examples of "Cómo comprar", one per kind of purchase, and
 *   FORMULA_EXAMPLE, the cubic-foot example of Carinova's brief (on the calculator page).
 *
 * Prices and times come from carinova.ts and are worked out with utils/rates.ts, so no page can
 * disagree with the calculator. Relative imports with the .ts extension and no astro:* modules: the
 * unit tests import this file on plain Node. Paths are Spanish site paths; components turn them into
 * the address of the language being rendered (src/i18n).
 *
 * This is the Spanish wording; en/services.ts gives the same exports in English, keeping the ids,
 * icons, numbers and links of this file (content.ts picks the language).
 */
import type { Locale } from '../i18n/locales.ts';
import {
  BRANCHES,
  CTA,
  LAST_MILE,
  RATES,
  RECEPTION_POINTS,
  RESTRICTED_ITEMS,
  describeHours,
  sentence,
} from './carinova.ts';
import {
  describeSea,
  describeUnitLine,
  describeWeight,
  formatUSD,
  quoteByWeight,
  quoteSea,
  quoteUnits,
  type Dimensions,
} from '../utils/rates.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city);
const [branchHours] = BRANCHES[0].hours;
const lowestUnitPrice = Math.min(...electronics.items.map((item) => item.price));

/** "a, b y c" */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
const lowercaseFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** The calculator with its fields filled in: it reads the same names from the address (QuoteCalculator.astro). */
export const quotePath = (fields: Record<string, string | number | undefined>): string => {
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(fields)) if (value !== undefined) query.set(name, String(value));
  return `${CTA.quote.path}?${query}`;
};

export type ServiceAxisId = 'transporte' | 'solucion' | 'distribucion';

export interface ServiceAxis {
  id: ServiceAxisId;
  /** Carinova's name for the axis (its brief), shown as the tagline. */
  name: string;
  /** The question the axis answers for the customer. */
  question: string;
  /** How its two options split. */
  rule: string;
}

export const SERVICE_AXES: Array<ServiceAxis> = [
  {
    id: 'transporte',
    name: 'Modalidad de transporte',
    question: '¿Cómo viaja tu paquete?',
    rule: 'Rapidez o ahorro: vos elegís.',
  },
  {
    id: 'solucion',
    name: 'Solución comercial',
    question: '¿Quién lo manda a tu casillero?',
    rule: 'Lo comprás vos o te lo manda tu familia, o lo compramos nosotros por vos.',
  },
  {
    id: 'distribucion',
    name: 'Distribución final',
    question: '¿Cómo lo recibís en Nicaragua?',
    rule: 'En nuestras sucursales o, próximamente, en tu casa.',
  },
];

export interface Service {
  /** Anchor on /servicios, and the key of its WhatsApp message (WA_MESSAGES.services). */
  id: string;
  axis: ServiceAxisId;
  name: string;
  icon: string;
  /** One line, for the services overview on the home page. */
  summary: string;
  /** One paragraph, for /servicios. */
  description: string;
  facts: Array<string>;
  available: boolean;
  /** ServiceBadge.astro writes it in the page's language: "Gratis" / "Próximamente". */
  badge?: 'free' | 'soon';
  /** The next step besides WhatsApp. */
  link?: { text: string; path: string };
  /** Label of the WhatsApp link when WhatsApp is how the service is requested. */
  whatsappText?: string;
}

export const SERVICES: Array<Service> = [
  {
    id: 'aereo',
    axis: 'transporte',
    name: 'Aéreo',
    icon: air.icon,
    summary: `${formatUSD(air.pricePerLb)} la libra · ${air.transit}`,
    description: 'Para lo que necesitás pronto: ropa, zapatos, accesorios, electrónicos y compras pequeñas.',
    facts: [
      `${formatUSD(air.pricePerLb)} por libra.`,
      `Entrega estimada: ${air.transit}, ${RATES.transitFrom}.`,
      `Celulares, tablets, laptops y consolas: tarifa fija desde ${formatUSD(lowestUnitPrice)} por unidad, con impuestos incluidos.`,
      `No viajan en avión: ${listOf(RESTRICTED_ITEMS.noAir.items.map(lowercaseFirst))}.`,
    ],
    available: true,
    link: { text: 'Cotizar aéreo', path: quotePath({ tarifa: air.id }) },
  },
  {
    id: 'maritimo',
    axis: 'transporte',
    name: 'Marítimo',
    icon: sea.icon,
    summary: `${formatUSD(sea.pricePerLb)} la libra o ${formatUSD(sea.pricePerCubicFoot)} el pie³ · ${sea.transit}`,
    description: 'Para lo pesado o voluminoso: cosas para la casa, muebles, electrodomésticos y cajas grandes.',
    facts: [
      `${formatUSD(sea.pricePerLb)} por libra o ${formatUSD(sea.pricePerCubicFoot)} por pie cúbico: se cobra el que resulte mayor.`,
      'Pie cúbico: largo × ancho × alto, en pulgadas, ÷ 1,728.',
      `Entrega estimada: ${sea.transit}, ${RATES.transitFrom}.`,
    ],
    available: true,
    link: { text: 'Cotizar marítimo', path: quotePath({ tarifa: sea.id }) },
  },
  {
    id: 'encomiendas',
    axis: 'solucion',
    name: 'Encomiendas',
    icon: 'tabler:package',
    summary: 'Lo que vos o tu familia mandan a tu casillero.',
    description:
      'Traemos cualquier paquete que llegue a tu casillero en Miami: tus compras en línea o la caja que te manda tu familia desde Estados Unidos.',
    facts: [
      'Comprá en cualquier tienda que envíe dentro de Estados Unidos.',
      'Tu familia o tus amigos también pueden mandarte una caja a tu dirección de Miami.',
      'Viaja por aéreo o por marítimo, como prefieras.',
    ],
    available: true,
    link: { text: 'Ver cómo comprar', path: '/como-comprar' },
  },
  {
    id: 'compras-asistidas',
    axis: 'solucion',
    name: 'Compras asistidas',
    icon: 'tabler:shopping-bag',
    badge: 'free',
    summary: 'Compramos por vos, sin cobrarte el servicio.',
    description:
      '¿No tenés tarjeta o la tienda no acepta la tuya? Mandanos el enlace del producto y lo compramos por vos.',
    // TODO: confirm with Carinova how customers pay for the product.
    facts: [
      'El servicio es gratis: pagás el producto y el envío.',
      'Pedila por WhatsApp con el enlace del producto.',
      'Llega a tu casillero y viaja como cualquier encomienda.',
    ],
    available: true,
    whatsappText: 'Pedir una compra asistida',
  },
  {
    id: 'retiro-en-sucursal',
    axis: 'distribucion',
    name: 'Retiro en sucursal',
    icon: 'tabler:building-store',
    summary: `${listOf(cities)} · ${branchHours.days.toLowerCase()}`,
    // TODO: confirm the notifications Carinova sends.
    description: 'Te avisamos cuando tu paquete está listo y pasás por él a la sucursal que te quede más cerca.',
    facts: [`Sucursales en ${listOf(cities)}.`, sentence(`Abrimos de ${describeHours(branchHours)}`)],
    available: true,
    link: { text: 'Ver sucursales', path: '/sucursales' },
  },
  {
    id: 'entrega-a-domicilio',
    axis: 'distribucion',
    name: 'Entrega a domicilio',
    icon: 'tabler:truck-delivery',
    badge: LAST_MILE.available ? undefined : 'soon',
    // The "Próximamente" badge says when; the summary says what.
    summary: 'Tu paquete hasta tu puerta.',
    description: LAST_MILE.available
      ? 'Te llevamos tu paquete hasta tu casa (la última milla).'
      : 'La entrega hasta tu casa (la última milla) estará disponible próximamente. Mientras tanto, retirás tu paquete en sucursal.',
    facts: [],
    available: LAST_MILE.available,
  },
];

export const servicesOf = (axis: ServiceAxisId) => SERVICES.filter((service) => service.axis === axis);

export interface ProcessStep {
  icon: string;
  title: string;
  /** One line, for the home page. */
  summary: string;
  /** For /como-comprar. */
  details: Array<string>;
  link: { text: string; path: string };
}

export const PROCESS_STEPS: Array<ProcessStep> = [
  {
    icon: 'tabler:id-badge-2',
    title: 'Abrí tu casillero',
    summary: 'Registrate en línea y recibí tu Carinova ID y tu dirección en Miami.',
    details: [
      'Llenás un formulario corto y confirmás tu correo.',
      'Al confirmar ves tu Carinova ID y tu dirección en Miami, y también te los mandamos por correo.',
    ],
    link: { text: CTA.signup.text, path: CTA.signup.path },
  },
  {
    icon: 'tabler:shopping-cart',
    title: 'Comprá o mandá tu encomienda',
    summary: 'Usá tu dirección de Miami en cualquier tienda de Estados Unidos, o dásela a tu familia.',
    details: [
      'Al pagar, escribí tu nombre y tu apellido exactamente como aparecen en tu dirección de Miami.',
      '¿No tenés tarjeta? Pedí una compra asistida: compramos por vos, gratis.',
      'Antes de comprar, revisá que tu producto no esté en la lista de artículos prohibidos.',
    ],
    link: { text: 'Ver artículos prohibidos', path: '/articulos-prohibidos' },
  },
  {
    icon: 'tabler:plane-departure',
    title: 'Lo traemos a Nicaragua',
    summary: `Por aéreo en ${air.transit} o por marítimo en ${sea.transit}, ${RATES.transitFrom}.`,
    details: [
      `Aéreo: ${formatUSD(air.pricePerLb)} la libra. Marítimo: ${formatUSD(sea.pricePerLb)} la libra o ${formatUSD(sea.pricePerCubicFoot)} el pie cúbico.`,
      'Celulares, tablets, laptops y consolas viajan con tarifa fija por unidad, con impuestos incluidos.',
      'Las tarifas incluyen seguro e impuestos cuando aplique.',
    ],
    link: { text: CTA.quote.text, path: CTA.quote.path },
  },
  {
    icon: 'tabler:building-store',
    title: 'Retiralo en tu sucursal',
    summary: `Pasá por tu paquete a ${cities.join(' o ')}.`,
    details: [
      // TODO: confirm the notifications Carinova sends.
      'Te avisamos cuando tu paquete está listo para retirar.',
      sentence(`Abrimos de ${describeHours(branchHours)}`),
      LAST_MILE.available ? 'También te lo llevamos a tu casa.' : 'La entrega a domicilio viene próximamente.',
    ],
    link: { text: 'Ver sucursales', path: '/sucursales' },
  },
];

const receivingNow = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
const receivingSoon = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);

/** The three parts of a Carinova account, from Carinova's brief ("Mi cuenta"). */
export const ACCOUNT_PARTS = [
  {
    id: 'carinova-id',
    icon: 'tabler:id-badge-2',
    title: 'Carinova ID',
    summary: 'Uno por persona o empresa, para todos tus envíos.',
  },
  {
    id: 'recepcion',
    icon: 'tabler:building-warehouse',
    title: 'Recepción en Estados Unidos',
    summary: `${listOf(receivingNow)}.${receivingSoon.length ? ` ${listOf(receivingSoon)}, próximamente.` : ''}`,
  },
  {
    id: 'retiro',
    icon: 'tabler:map-pin',
    title: 'Retiro en Nicaragua',
    summary: `${listOf(cities)}.`,
  },
];

export interface ShoppingExample {
  /** Also the key of its WhatsApp message: WA_MESSAGES.example(category). */
  id: string;
  category: string;
  icon: string;
  /** What is bought or sent… */
  item: string;
  /** …and where it comes from. */
  source: string;
  tariff: 'aereo' | 'maritimo' | 'electronicos';
  pounds?: number;
  dims?: Dimensions;
  units?: Record<string, number>;
}

/**
 * One example per kind of purchase, each teaching one way of pricing: air by the pound, flat rate
 * per device, sea where the weight is charged, sea where the volume is charged. Weights and
 * measurements are illustrative; the prices are computed from RATES.
 */
export const SHOPPING_EXAMPLES: Array<ShoppingExample> = [
  {
    id: 'ropa',
    category: 'Ropa y zapatos',
    icon: 'tabler:shirt',
    item: 'Dos blusas, un pantalón y unos tenis',
    source: 'En Shein y Nike',
    tariff: 'aereo',
    pounds: 3,
  },
  {
    id: 'celulares',
    category: 'Celulares y tablets',
    icon: 'tabler:device-mobile',
    item: 'Un celular nuevo',
    source: 'En Amazon',
    tariff: 'electronicos',
    units: { celular: 1 },
  },
  {
    id: 'laptops',
    category: 'Laptops y consolas',
    icon: 'tabler:device-laptop',
    item: 'Una laptop y un PlayStation',
    source: 'En Best Buy y Walmart',
    tariff: 'electronicos',
    units: { laptop: 1, playstation: 1 },
  },
  {
    id: 'hogar',
    category: 'Hogar y cocina',
    icon: 'tabler:tools-kitchen-2',
    item: 'Un juego de ollas de 18 lb, en una caja de 16 × 12 × 10 pulgadas',
    source: 'En Walmart',
    tariff: 'maritimo',
    pounds: 18,
    dims: { length: 16, width: 12, height: 10 },
  },
  {
    id: 'muebles',
    category: 'Muebles',
    icon: 'tabler:armchair',
    item: 'Una silla de oficina de 40 lb, en una caja de 28 × 26 × 14 pulgadas',
    source: 'En Costco',
    tariff: 'maritimo',
    pounds: 40,
    dims: { length: 28, width: 26, height: 14 },
  },
  {
    id: 'encomienda',
    category: 'Encomiendas familiares',
    icon: 'tabler:gift',
    item: 'Una caja de 8 lb con ropa y regalos',
    source: 'De tu familia en Estados Unidos',
    tariff: 'aereo',
    pounds: 8,
  },
];

export interface ExampleQuote {
  /** How it is priced, e.g. "Aéreo, por libra". */
  tariff: string;
  /** The arithmetic, one line per measure. */
  lines: Array<string>;
  /** Which measure is charged, when both were worked out. */
  charged?: string;
  note?: string;
  total: number;
  transit: string;
  /** The calculator with the example filled in. */
  path: string;
}

const dimsFields = (dims?: Dimensions) => ({ largo: dims?.length, ancho: dims?.width, alto: dims?.height });

/** How each way of pricing is called in an example. */
export interface ExampleWords {
  air: string;
  sea: string;
  electronics: string;
  electronicsNote: string;
}

/**
 * Works an example out with the rates of a language (their names and times are words) and writes the
 * arithmetic in that language. The numbers are the same in both.
 */
export const exampleQuoter =
  (rates: typeof RATES, words: ExampleWords, locale: Locale) =>
  (example: ShoppingExample): ExampleQuote => {
    if (example.tariff === 'electronicos') {
      const quote = quoteUnits(example.units ?? {}, rates.electronics.items);
      return {
        tariff: words.electronics,
        lines: quote.lines.map(describeUnitLine),
        note: words.electronicsNote,
        total: quote.total,
        transit: rates.electronics.transit,
        path: quotePath({ tarifa: rates.electronics.id, ...example.units }),
      };
    }

    if (example.tariff === 'maritimo') {
      const quote = quoteSea({ pounds: example.pounds, dims: example.dims }, rates.sea, rates.roundUpToPound);
      if (!quote) throw new Error(`Example "${example.id}" needs a weight or measurements.`);
      return {
        tariff: words.sea,
        ...describeSea(quote, locale),
        total: quote.total,
        transit: rates.sea.transit,
        path: quotePath({ tarifa: rates.sea.id, lb: example.pounds, ...dimsFields(example.dims) }),
      };
    }

    const quote = quoteByWeight(example.pounds ?? 0, rates.air.pricePerLb, rates.air.minLb, rates.roundUpToPound);
    return {
      tariff: words.air,
      lines: [describeWeight(quote)],
      total: quote.total,
      transit: rates.air.transit,
      path: quotePath({ tarifa: rates.air.id, lb: example.pounds }),
    };
  };

export const quoteExample = exampleQuoter(
  RATES,
  {
    air: 'Aéreo, por libra',
    sea: 'Marítimo, por peso o por volumen',
    electronics: 'Electrónicos, tarifa fija por unidad',
    electronicsNote: 'Incluye envío aéreo e impuestos.',
  },
  'es'
);

const PALLET: Dimensions = { length: 48, width: 40, height: 72 };

/** The cubic-foot example of Carinova's brief: a 48 × 40 × 72 in pallet is 80 ft³, US$1,600 by sea. */
export const FORMULA_EXAMPLE = {
  item: 'Una tarima (palé) de carga',
  dims: PALLET,
  path: quotePath({ tarifa: sea.id, ...dimsFields(PALLET) }),
};
