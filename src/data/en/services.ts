/**
 * English wording of ../services.ts: the same exports, in English. Ids, icons, availability, links
 * and the numbers of the worked examples are taken from the Spanish file; prices and times are
 * worked out from the same rates. Only the words are written here, keyed by id, so adding a service
 * or an example in Spanish without its English text fails src/data/content.test.ts.
 */
import * as es from '../services.ts';
import type { ProcessStep, Service, ServiceAxis, ServiceAxisId, ShoppingExample } from '../services.ts';
import { sentence } from '../carinova.ts';
import { formatUSD } from '../../utils/rates.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, describeHours } from './carinova.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city);
const [branchHours] = BRANCHES[0].hours;

/** "a, b and c" */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
const lowercaseFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** "cell phones US$30, tablets US$40, …" */
const devicePrices = electronics.items
  .map((item) => `${item.brand ? item.plural : item.plural.toLowerCase()} ${formatUSD(item.price)}`)
  .join(', ');

/** The text of an id, or an error that names what is missing. */
const textOf = <T>(table: Record<string, T>, id: string, kind: string): T => {
  const text = table[id];
  if (!text) throw new Error(`The ${kind} "${id}" has no English text (src/data/en/services.ts).`);
  return text;
};

const AXIS_TEXT: Record<ServiceAxisId, Pick<ServiceAxis, 'name' | 'question' | 'rule'>> = {
  transporte: {
    name: 'Mode of transport',
    question: 'How does your package travel?',
    rule: 'Two routes, one destination: speed or savings, you choose.',
  },
  solucion: {
    name: 'Commercial solution',
    question: 'Who makes the purchase?',
    rule: 'You buy it or your family sends it to you, or we buy it for you.',
  },
  distribucion: {
    name: 'Final delivery',
    question: 'How do you receive it in Nicaragua?',
    rule: 'At our branches or at your home, for an additional charge.',
  },
};

export const SERVICE_AXES: Array<ServiceAxis> = es.SERVICE_AXES.map((axis) => ({ ...axis, ...AXIS_TEXT[axis.id] }));

interface ServiceText {
  name: string;
  summary: string;
  description: string;
  facts: Array<string>;
  /** Text of the service's link, when it has one. */
  link?: string;
  whatsappText?: string;
}

const SERVICE_TEXT: Record<string, ServiceText> = {
  aereo: {
    name: 'Air',
    summary: `${formatUSD(air.pricePerLb)} per pound · ${air.transit}`,
    description:
      'Made for what you want to receive soon. It uses a base rate per pound and, for certain electronics, a flat rate per unit.',
    facts: [
      `Estimated delivery: ${air.transit}, ${RATES.transitFrom}.`,
      `Base rate: ${formatUSD(air.pricePerLb)} per pound.`,
      `Electronics per unit: ${devicePrices}.`,
      `They cannot travel by plane, but they can by sea: ${listOf(RESTRICTED_ITEMS.seaOnly.items.map((item) => lowercaseFirst(item.name)))}.`,
      'The rate that applies is confirmed according to the type of goods, the packaging and the conditions of the service.',
    ],
    link: 'Calculate air shipping',
  },
  maritimo: {
    name: 'Sea',
    summary: `${formatUSD(sea.pricePerLb)} per pound or ${formatUSD(sea.pricePerCubicFoot)} per ft³ · ${sea.transit}`,
    description:
      'Ideal for large loads, planned purchases and shipments where cost comes first. It is quoted by weight or by volume.',
    facts: [
      `Estimated delivery: ${sea.transit}, ${RATES.transitFrom}.`,
      `Base rate by weight: ${formatUSD(sea.pricePerLb)} per pound.`,
      `Rate by volume: ${formatUSD(sea.pricePerCubicFoot)} per cubic foot.`,
      'Whether weight or volume applies is determined by the cargo, its packaging and the conditions of the service.',
    ],
    link: 'Calculate sea shipping',
  },
  encomiendas: {
    name: 'Packages',
    summary: 'What you or your family send to our warehouse.',
    description:
      'We bring any package that reaches our warehouse in your name: your online purchases or the box your family sends you from the United States.',
    facts: [
      'Buy at any store that ships within the United States.',
      'Your family or your friends can also send a box to your Miami address.',
      'It travels by air or by sea, as you prefer.',
    ],
    link: 'See how it works',
  },
  'compras-asistidas': {
    name: 'Assisted purchases',
    summary: 'You choose the product and we make the purchase for you.',
    description: 'Choose the store and share the link to the product with us: we make the purchase for you.',
    facts: [
      'Before buying we confirm availability, whether the item can enter and the total cost.',
      'The cost of the purchase, the taxes and the freight are confirmed before we handle the operation.',
      'It arrives at our warehouse and travels like any other package.',
    ],
    link: 'Prepare my request',
    whatsappText: 'Request an assisted purchase',
  },
  'retiro-en-sucursal': {
    name: 'Branch pickup',
    summary: `${listOf(cities)} · ${branchHours.days}`,
    description: 'When your package is available for delivery, you pick it up at the branch closest to you.',
    facts: [`Branches in ${listOf(cities)}.`, sentence(`We are open ${describeHours(branchHours)}`)],
    link: 'See branches',
  },
  'entrega-a-domicilio': {
    name: 'Home delivery',
    summary: 'Anywhere in the country, for an additional charge.',
    description:
      'We deliver anywhere in the country, subject to coordination and coverage. Home delivery has an additional charge that depends on the destination and the operating conditions.',
    facts: ['The address, the coverage and the charge are confirmed when the delivery is arranged.'],
    whatsappText: 'Ask about home delivery',
  },
};

export const SERVICES: Array<Service> = es.SERVICES.map((service) => {
  const text = textOf(SERVICE_TEXT, service.id, 'service');
  return {
    ...service,
    name: text.name,
    summary: text.summary,
    description: text.description,
    facts: text.facts,
    link: service.link && { ...service.link, text: text.link ?? service.link.text },
    whatsappText: service.whatsappText && text.whatsappText,
  };
});

export const servicesOf = (axis: ServiceAxisId) => SERVICES.filter((service) => service.axis === axis);

const receivingNow = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
const receivingSoon = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);
const soonNote = receivingSoon.length ? ` ${listOf(receivingSoon)}, coming soon.` : '';

/** In the order of ../services.ts: the steps have no id. */
const STEP_TEXT: Array<Pick<ProcessStep, 'title' | 'summary' | 'details'> & { link: string }> = [
  {
    title: 'Sign up',
    summary:
      'Sign up with your e-mail and your phone number. When you confirm your e-mail, the system assigns your Carinova ID automatically.',
    details: [
      'You fill in a short form and confirm your e-mail with the link we send you.',
      'When you confirm, you see your Carinova ID and your address in the United States, and we also e-mail them to you.',
    ],
    link: CTA.signup.text,
  },
  {
    title: 'Sign in to your account',
    summary: 'Handle everything from one place.',
    details: [
      'You sign in with your e-mail and a one-time code: there is no password to remember.',
      'Your account has your Carinova ID, your address in the United States, your packages and your payments.',
    ],
    link: CTA.signin.text,
  },
  {
    title: 'Can it enter?',
    summary: 'Before you buy or send, check whether the item can enter.',
    details: [
      'Some items are prohibited, others we are not authorised to bring yet, and others only travel by sea.',
      'If your item is not on the lists, ask us before you buy it.',
    ],
    link: 'Check an item',
  },
  {
    title: 'We receive it',
    summary: `Send it to the address of our warehouse in ${listOf(receivingNow)} shown in your account.${soonNote}`,
    details: [
      'At the store’s checkout, write your first name and your last name exactly as they appear in your address.',
      'Would you rather we buy for you? Request an assisted purchase.',
      `We bring it by air in ${air.transit} or by sea in ${sea.transit}, ${RATES.transitFrom}.`,
    ],
    link: CTA.quote.text,
  },
  {
    title: 'You receive it',
    summary: `Pick up in ${cities.join(' or ')}. Home delivery has an additional charge.`,
    details: [
      sentence(`Our branches are open ${describeHours(branchHours)}`),
      'Home delivery is arranged according to the destination and the coverage.',
    ],
    link: 'See branches',
  },
];

export const PROCESS_STEPS: Array<ProcessStep> = es.PROCESS_STEPS.map((step, index) => {
  const text = STEP_TEXT[index];
  if (!text) throw new Error(`Step ${index + 1} of "¿Cómo funciona?" has no English text (src/data/en/services.ts).`);
  return {
    ...step,
    title: text.title,
    summary: text.summary,
    details: text.details,
    link: step.link && { ...step.link, text: text.link },
  };
});

const ACCOUNT_TEXT: Record<string, { title: string; summary: string }> = {
  'carinova-id': { title: 'Carinova ID', summary: 'One per person or company, for all your shipments.' },
  direccion: { title: 'Your address in the United States', summary: `${listOf(receivingNow)}.${soonNote}` },
  paquetes: {
    title: 'Your packages',
    summary: 'What we received at the warehouse and what we already shipped, with the status of each one.',
  },
  pagos: { title: 'Your payments', summary: 'Your invoices and the payments we confirmed.' },
};

export const ACCOUNT_PARTS: typeof es.ACCOUNT_PARTS = es.ACCOUNT_PARTS.map((part) => ({
  ...part,
  ...textOf(ACCOUNT_TEXT, part.id, 'account part'),
}));

const EXAMPLE_TEXT: Record<string, Pick<ShoppingExample, 'category' | 'item' | 'source'>> = {
  ropa: {
    category: 'Clothes and shoes',
    item: 'Two blouses, a pair of pants and a pair of sneakers: 3 lb',
    source: 'From SHEIN and Nike',
  },
  celulares: { category: 'Cell phones and tablets', item: 'A new cell phone', source: 'From Amazon' },
  laptops: { category: 'Laptops and consoles', item: 'A laptop', source: 'From Best Buy' },
  hogar: { category: 'Home and kitchen', item: 'An 18 lb cookware set', source: 'From Walmart' },
  muebles: {
    category: 'Furniture',
    item: 'An office chair, in a 28 × 26 × 14 inch box',
    source: 'From Home Depot',
  },
  encomienda: {
    category: 'Family packages',
    item: 'An 8 lb box with clothes and gifts',
    source: 'From your family in the United States',
  },
};

export const SHOPPING_EXAMPLES: Array<ShoppingExample> = es.SHOPPING_EXAMPLES.map((example) => ({
  ...example,
  ...textOf(EXAMPLE_TEXT, example.id, 'example'),
}));

export const quoteExample = es.exampleQuoter(
  RATES,
  {
    airWeight: 'Air, per pound',
    seaWeight: 'Sea, by weight',
    seaVolume: 'Sea, by volume',
    unit: 'Air, rate per unit',
    unitNote: 'The rate per unit is not added to the rate per pound.',
  },
  'en'
);

export const FORMULA_EXAMPLE: typeof es.FORMULA_EXAMPLE = { ...es.FORMULA_EXAMPLE, item: 'A cargo pallet' };
