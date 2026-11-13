/**
 * What Carinova offers, organised the way the site presents it (docs/INFORMATION-ARCHITECTURE.md):
 *
 * - SERVICES: six services on three independent axes (how a package travels, who makes the
 *   purchase, how the customer receives it). Every shipment is one choice on each axis.
 * - PROCESS_STEPS: the five steps of "¿Cómo funciona?" (summary on the home page, details on
 *   /como-comprar), as in Carinova's prototype.
 * - ACCOUNT_PARTS: what a customer finds in their account ("Mi cuenta").
 * - SHOPPING_EXAMPLES: the worked examples of "¿Cómo funciona?", one per kind of purchase, and
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
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, describeHours, sentence } from './carinova.ts';
import {
  describeUnitLine,
  describeVolume,
  describeWeight,
  formatUSD,
  quoteByVolume,
  quoteByWeight,
  quoteUnits,
  type Dimensions,
  type LengthUnit,
} from '../utils/rates.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city);
const [branchHours] = BRANCHES[0].hours;

/** "a, b y c" */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
const lowercaseFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** "celulares US$30, tablets US$40, …" */
const devicePrices = electronics.items
  .map((item) => `${item.brand ? item.plural : item.plural.toLowerCase()} ${formatUSD(item.price)}`)
  .join(', ');

/**
 * The calculator with its fields filled in: it reads the same names from the address
 * (QuoteCalculator.astro): tarifa (aereo | maritimo), base (peso | volumen | a device's id), lb,
 * paquetes, largo, ancho, alto, unidad (cm | pulg), bultos, unidades.
 */
export const quotePath = (fields: Record<string, string | number | undefined>): string => {
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(fields)) if (value !== undefined) query.set(name, String(value));
  return `${CTA.quote.path}?${query}`;
};

/** How the calculator's address names the unit of the measurements. */
export const UNIT_PARAM: Record<LengthUnit, string> = { cm: 'cm', in: 'pulg' };

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
    rule: 'Dos caminos, un mismo destino: rapidez o ahorro, vos elegís.',
  },
  {
    id: 'solucion',
    name: 'Solución comercial',
    question: '¿Quién hace la compra?',
    rule: 'Lo comprás vos o te lo manda tu familia, o lo compramos nosotros por vos.',
  },
  {
    id: 'distribucion',
    name: 'Distribución final',
    question: '¿Cómo lo recibís en Nicaragua?',
    rule: 'En nuestras sucursales o en tu casa, con un cargo adicional.',
  },
];

export interface Service {
  /** Anchor on /servicios, and the key of its WhatsApp message (WA_MESSAGES.services). */
  id: string;
  axis: ServiceAxisId;
  name: string;
  icon: string;
  /** One line, for summaries. */
  summary: string;
  /** One paragraph, for /servicios. */
  description: string;
  facts: Array<string>;
  available: boolean;
  /** ServiceBadge.astro writes it in the page's language: "Próximamente" / "Cargo adicional". */
  badge?: 'soon' | 'extra';
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
    description:
      'Pensado para lo que querés recibir pronto. Usa una tarifa base por libra y, en determinados electrónicos, una tarifa fija por unidad.',
    facts: [
      `Entrega estimada: ${air.transit}, ${RATES.transitFrom}.`,
      `Tarifa base: ${formatUSD(air.pricePerLb)} por libra.`,
      `Electrónicos por unidad: ${devicePrices}.`,
      `No viajan en avión, pero sí por marítimo: ${listOf(RESTRICTED_ITEMS.seaOnly.items.map((item) => lowercaseFirst(item.name)))}.`,
      'La tarifa aplicable se confirma según el tipo de mercancía, el embalaje y las condiciones del servicio.',
    ],
    available: true,
    link: { text: 'Calcular envío aéreo', path: quotePath({ tarifa: air.id }) },
  },
  {
    id: 'maritimo',
    axis: 'transporte',
    name: 'Marítimo',
    icon: sea.icon,
    summary: `${formatUSD(sea.pricePerLb)} la libra o ${formatUSD(sea.pricePerCubicFoot)} el pie³ · ${sea.transit}`,
    description:
      'Ideal para cargas grandes, compras planificadas y envíos donde priorizás el costo. Se cotiza por peso o por volumen.',
    facts: [
      `Entrega estimada: ${sea.transit}, ${RATES.transitFrom}.`,
      `Tarifa base por peso: ${formatUSD(sea.pricePerLb)} por libra.`,
      `Tarifa por volumen: ${formatUSD(sea.pricePerCubicFoot)} por pie cúbico.`,
      'La base por peso o por volumen se determina según la carga, su empaque y las condiciones del servicio.',
    ],
    available: true,
    link: { text: 'Calcular envío marítimo', path: quotePath({ tarifa: sea.id }) },
  },
  {
    id: 'encomiendas',
    axis: 'solucion',
    name: 'Encomiendas',
    icon: 'tabler:package',
    summary: 'Lo que vos o tu familia mandan a nuestra bodega.',
    description:
      'Traemos cualquier paquete que llegue a nuestra bodega a tu nombre: tus compras en línea o la caja que te manda tu familia desde Estados Unidos.',
    facts: [
      'Comprá en cualquier tienda que envíe dentro de Estados Unidos.',
      'Tu familia o tus amigos también pueden mandarte una caja a tu dirección de Miami.',
      'Viaja por aéreo o por marítimo, como prefieras.',
    ],
    available: true,
    link: { text: 'Ver cómo funciona', path: '/como-comprar' },
  },
  {
    id: 'compras-asistidas',
    axis: 'solucion',
    name: 'Compras asistidas',
    icon: 'tabler:shopping-bag',
    summary: 'Elegís el producto y nosotros hacemos la compra por vos.',
    description: 'Elegí la tienda y compartinos el enlace del producto: nosotros realizamos la compra por vos.',
    // TODO: confirm with Carinova whether the service has a fee and how customers pay for the product.
    facts: [
      'Antes de comprar confirmamos la disponibilidad, si el artículo puede ingresar y el costo total.',
      'El costo de la compra, los impuestos y el flete se confirman antes de gestionar la operación.',
      'Llega a nuestra bodega y viaja como cualquier encomienda.',
    ],
    available: true,
    link: { text: 'Preparar mi solicitud', path: '/#compras' },
    whatsappText: 'Pedir una compra asistida',
  },
  {
    id: 'retiro-en-sucursal',
    axis: 'distribucion',
    name: 'Retiro en sucursal',
    icon: 'tabler:building-store',
    summary: `${listOf(cities)} · ${branchHours.days.toLowerCase()}`,
    description: 'Cuando tu paquete está disponible para entrega, pasás por él a la sucursal que te quede más cerca.',
    facts: [`Sucursales en ${listOf(cities)}.`, sentence(`Abrimos de ${describeHours(branchHours)}`)],
    available: true,
    link: { text: 'Ver sucursales', path: '/sucursales' },
  },
  {
    id: 'entrega-a-domicilio',
    axis: 'distribucion',
    name: 'Entrega a domicilio',
    icon: 'tabler:truck-delivery',
    badge: 'extra',
    summary: 'A todo el país, con un cargo adicional.',
    description:
      'Realizamos envíos a todo el país, sujetos a coordinación y cobertura. La entrega a domicilio tiene un cargo adicional según el destino y las condiciones operativas.',
    facts: ['La dirección, la cobertura y el cargo se confirman al coordinar la entrega.'],
    available: true,
    whatsappText: 'Consultar entrega a domicilio',
  },
];

export const servicesOf = (axis: ServiceAxisId) => SERVICES.filter((service) => service.axis === axis);

export interface ProcessStep {
  icon: string;
  title: string;
  /** One or two sentences, for the home page. */
  summary: string;
  /** For /como-comprar. */
  details: Array<string>;
  /** Where the step leads; without one, the step is something Carinova does. */
  link?: { text: string; path: string };
  /** The section of the home page that does the same as `link`, when there is one. */
  homeAnchor?: string;
}

const receivingNow = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
const receivingSoon = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);
/** " Los Ángeles, próximamente." or nothing, once every warehouse is open. */
const soonNote = receivingSoon.length ? ` ${listOf(receivingSoon)}, próximamente.` : '';

export const PROCESS_STEPS: Array<ProcessStep> = [
  {
    icon: 'tabler:user-plus',
    title: 'Registrate',
    summary:
      'Registrate con tu correo y tu número telefónico. Al confirmar tu correo, el sistema te asigna automáticamente tu Carinova ID.',
    details: [
      'Llenás un formulario corto y confirmás tu correo con el enlace que te mandamos.',
      'Al confirmar ves tu Carinova ID y tu dirección en Estados Unidos, y también te los mandamos por correo.',
    ],
    link: { text: CTA.signup.text, path: CTA.signup.path },
  },
  {
    icon: 'tabler:layout-dashboard',
    title: 'Ingresá a tu cuenta',
    summary: 'Realizá todas tus gestiones desde un mismo lugar.',
    details: [
      'Ingresás con tu correo y un código de un solo uso: no hay contraseña que recordar.',
      'En tu cuenta están tu Carinova ID, tu dirección en Estados Unidos, tus paquetes y tus pagos.',
    ],
    link: { text: CTA.signin.text, path: CTA.signin.path },
  },
  {
    icon: 'tabler:search',
    title: '¿Puede ingresar?',
    summary: 'Antes de comprar o enviar, revisá si el artículo puede ingresar.',
    details: [
      'Hay artículos prohibidos, otros que todavía no estamos autorizados a traer y otros que solo viajan por marítimo.',
      'Si tu artículo no aparece en las listas, consultanos antes de comprarlo.',
    ],
    link: { text: 'Revisar artículo', path: '/articulos-prohibidos' },
    homeAnchor: '#verificador',
  },
  {
    icon: 'tabler:building-warehouse',
    title: 'Recibimos',
    summary: `Envialo a la dirección de nuestra bodega en ${listOf(receivingNow)} indicada en tu cuenta.${soonNote}`,
    details: [
      'Al pagar en la tienda, escribí tu nombre y tu apellido exactamente como aparecen en tu dirección.',
      '¿Preferís que compremos por vos? Pedí una compra asistida.',
      `Lo traemos por aéreo en ${air.transit} o por marítimo en ${sea.transit}, ${RATES.transitFrom}.`,
    ],
    link: { text: CTA.quote.text, path: CTA.quote.path },
  },
  {
    icon: 'tabler:home-check',
    title: 'Lo recibís',
    summary: `Retirá en ${cities.join(' o ')}. La entrega a domicilio tiene cargo adicional.`,
    details: [
      sentence(`Nuestras sucursales abren de ${describeHours(branchHours)}`),
      'La entrega a domicilio se coordina según el destino y la cobertura.',
    ],
    link: { text: 'Ver sucursales', path: '/sucursales' },
  },
];

/** What a customer finds in their account ("Mi cuenta"). The ids are the anchors of its sections. */
export const ACCOUNT_PARTS = [
  {
    id: 'carinova-id',
    icon: 'tabler:id-badge-2',
    title: 'Carinova ID',
    summary: 'Uno por persona o empresa, para todos tus envíos.',
  },
  {
    id: 'direccion',
    icon: 'tabler:building-warehouse',
    title: 'Tu dirección en Estados Unidos',
    summary: `${listOf(receivingNow)}.${soonNote}`,
  },
  {
    id: 'paquetes',
    icon: 'tabler:package',
    title: 'Tus paquetes',
    summary: 'Lo que recibimos en bodega y lo que ya enviamos, con el estado de cada uno.',
  },
  {
    id: 'pagos',
    icon: 'tabler:receipt',
    title: 'Tus pagos',
    summary: 'Tus facturas y los pagos que confirmamos.',
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
  tariff: 'aereo' | 'maritimo';
  /** The one basis the example is quoted on. */
  basis: 'peso' | 'volumen' | 'unidad';
  pounds?: number;
  dims?: Dimensions;
  /** The unit of `dims`. */
  unit?: LengthUnit;
  /** For `unidad`: the id of the device (RATES.electronics.items) and how many. */
  device?: string;
  units?: number;
}

/**
 * One example per kind of purchase, each teaching one way of pricing: air by the pound, flat rate
 * per device, sea by weight, sea by volume. Weights and measurements are illustrative; the prices
 * are computed from RATES.
 */
export const SHOPPING_EXAMPLES: Array<ShoppingExample> = [
  {
    id: 'ropa',
    category: 'Ropa y zapatos',
    icon: 'tabler:shirt',
    item: 'Dos blusas, un pantalón y unos tenis: 3 lb',
    source: 'En SHEIN y Nike',
    tariff: 'aereo',
    basis: 'peso',
    pounds: 3,
  },
  {
    id: 'celulares',
    category: 'Celulares y tablets',
    icon: 'tabler:device-mobile',
    item: 'Un celular nuevo',
    source: 'En Amazon',
    tariff: 'aereo',
    basis: 'unidad',
    device: 'celular',
    units: 1,
  },
  {
    id: 'laptops',
    category: 'Laptops y consolas',
    icon: 'tabler:device-laptop',
    item: 'Una laptop',
    source: 'En Best Buy',
    tariff: 'aereo',
    basis: 'unidad',
    device: 'laptop',
    units: 1,
  },
  {
    id: 'hogar',
    category: 'Hogar y cocina',
    icon: 'tabler:tools-kitchen-2',
    item: 'Un juego de ollas de 18 lb',
    source: 'En Walmart',
    tariff: 'maritimo',
    basis: 'peso',
    pounds: 18,
  },
  {
    id: 'muebles',
    category: 'Muebles',
    icon: 'tabler:armchair',
    item: 'Una silla de oficina, en una caja de 28 × 26 × 14 pulgadas',
    source: 'En Home Depot',
    tariff: 'maritimo',
    basis: 'volumen',
    dims: { length: 28, width: 26, height: 14 },
    unit: 'in',
  },
  {
    id: 'encomienda',
    category: 'Encomiendas familiares',
    icon: 'tabler:gift',
    item: 'Una caja de 8 lb con ropa y regalos',
    source: 'De tu familia en Estados Unidos',
    tariff: 'aereo',
    basis: 'peso',
    pounds: 8,
  },
];

export interface ExampleQuote {
  /** How it is priced, e.g. "Aéreo, por libra". */
  tariff: string;
  /** The arithmetic. */
  lines: Array<string>;
  note?: string;
  total: number;
  transit: string;
  /** The calculator with the example filled in. */
  path: string;
}

const dimsFields = (dims: Dimensions, unit: LengthUnit) => ({
  largo: dims.length,
  ancho: dims.width,
  alto: dims.height,
  unidad: UNIT_PARAM[unit],
});

/** How each way of pricing is called in an example. */
export interface ExampleWords {
  airWeight: string;
  seaWeight: string;
  seaVolume: string;
  unit: string;
  unitNote: string;
}

/**
 * Works an example out with the rates of a language (their names and times are words) and writes the
 * arithmetic in that language. The numbers are the same in both.
 */
export const exampleQuoter =
  (rates: typeof RATES, words: ExampleWords, locale: Locale) =>
  (example: ShoppingExample): ExampleQuote => {
    if (example.basis === 'unidad') {
      const quote = quoteUnits({ [example.device ?? '']: example.units ?? 1 }, rates.electronics.items);
      if (!quote.units) throw new Error(`Example "${example.id}" names a device that has no rate.`);
      return {
        tariff: words.unit,
        lines: quote.lines.map(describeUnitLine),
        note: words.unitNote,
        total: quote.total,
        transit: rates.electronics.transit,
        path: quotePath({ tarifa: rates.air.id, base: example.device, unidades: example.units ?? 1 }),
      };
    }

    if (example.basis === 'volumen') {
      if (!example.dims) throw new Error(`Example "${example.id}" needs its measurements.`);
      const unit = example.unit ?? 'in';
      const quote = quoteByVolume(example.dims, rates.sea.pricePerCubicFoot, { unit });
      return {
        tariff: words.seaVolume,
        lines: [describeVolume(quote, locale)],
        total: quote.total,
        transit: rates.sea.transit,
        path: quotePath({ tarifa: rates.sea.id, base: 'volumen', ...dimsFields(example.dims, unit) }),
      };
    }

    const bySea = example.tariff === 'maritimo';
    const rate = bySea ? rates.sea : rates.air;
    const quote = quoteByWeight(example.pounds ?? 0, rate.pricePerLb);
    return {
      tariff: bySea ? words.seaWeight : words.airWeight,
      lines: [describeWeight(quote)],
      total: quote.total,
      transit: rate.transit,
      path: quotePath({ tarifa: rate.id, lb: example.pounds }),
    };
  };

export const quoteExample = exampleQuoter(
  RATES,
  {
    airWeight: 'Aéreo, por libra',
    seaWeight: 'Marítimo, por peso',
    seaVolume: 'Marítimo, por volumen',
    unit: 'Aéreo, tarifa por unidad',
    unitNote: 'La tarifa por unidad no se suma a la tarifa por libra.',
  },
  'es'
);

const PALLET: Dimensions = { length: 48, width: 40, height: 72 };

/** The cubic-foot example of Carinova's brief: a 48 × 40 × 72 in pallet is 80 ft³, US$1,600 by sea. */
export const FORMULA_EXAMPLE = {
  item: 'Una tarima (palé) de carga',
  dims: PALLET,
  unit: 'in' as LengthUnit,
  path: quotePath({ tarifa: sea.id, base: 'volumen', ...dimsFields(PALLET, 'in') }),
};
