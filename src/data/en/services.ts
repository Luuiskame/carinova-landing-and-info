/**
 * English wording of ../services.ts: the same exports, in English. Ids, icons, availability, links
 * and the numbers of the worked examples are taken from the Spanish file; prices and times are
 * worked out from the same rates. Only the words are written here, keyed by id, so adding a service
 * or an example in Spanish without its English text fails src/data/content.test.ts.
 */
import * as es from '../services.ts';
import type { ProcessStep, Service, ServiceAxis, ServiceAxisId, ShoppingExample } from '../services.ts';
import { LAST_MILE, sentence } from '../carinova.ts';
import { formatUSD } from '../../utils/rates.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, describeHours } from './carinova.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city);
const [branchHours] = BRANCHES[0].hours;
const lowestUnitPrice = Math.min(...electronics.items.map((item) => item.price));

/** "a, b and c" */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
const lowercaseFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

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
    rule: 'Speed or savings: you choose.',
  },
  solucion: {
    name: 'Commercial solution',
    question: 'Who sends it to your mailbox?',
    rule: 'You buy it or your family sends it to you, or we buy it for you.',
  },
  distribucion: {
    name: 'Final delivery',
    question: 'How do you receive it in Nicaragua?',
    rule: 'At our branches or, soon, at your home.',
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
    description: 'For what you need soon: clothes, shoes, accessories, electronics and small purchases.',
    facts: [
      `${formatUSD(air.pricePerLb)} per pound.`,
      `Estimated delivery: ${air.transit}, ${RATES.transitFrom}.`,
      `Cell phones, tablets, laptops and consoles: flat rate from ${formatUSD(lowestUnitPrice)} per unit, taxes included.`,
      `They cannot travel by plane: ${listOf(RESTRICTED_ITEMS.noAir.items.map(lowercaseFirst))}.`,
    ],
    link: 'Get an air quote',
  },
  maritimo: {
    name: 'Sea',
    summary: `${formatUSD(sea.pricePerLb)} per pound or ${formatUSD(sea.pricePerCubicFoot)} per ft³ · ${sea.transit}`,
    description: 'For heavy or bulky things: household goods, furniture, appliances and large boxes.',
    facts: [
      `${formatUSD(sea.pricePerLb)} per pound or ${formatUSD(sea.pricePerCubicFoot)} per cubic foot: we charge whichever is higher.`,
      'Cubic foot: length × width × height, in inches, ÷ 1,728.',
      `Estimated delivery: ${sea.transit}, ${RATES.transitFrom}.`,
    ],
    link: 'Get a sea quote',
  },
  encomiendas: {
    name: 'Packages',
    summary: 'What you or your family send to your mailbox.',
    description:
      'We bring any package that reaches your mailbox in Miami: your online purchases or the box your family sends you from the United States.',
    facts: [
      'Buy at any store that ships within the United States.',
      'Your family or your friends can also send a box to your Miami address.',
      'It travels by air or by sea, as you prefer.',
    ],
    link: 'See how to buy',
  },
  'compras-asistidas': {
    name: 'Assisted purchases',
    summary: 'We buy for you, without charging for the service.',
    description:
      'You have no card, or the store does not accept yours? Send us the link to the product and we buy it for you.',
    facts: [
      'The service is free: you pay for the product and the shipping.',
      'Request it on WhatsApp with the link to the product.',
      'It arrives at your mailbox and travels like any other package.',
    ],
    whatsappText: 'Request an assisted purchase',
  },
  'retiro-en-sucursal': {
    name: 'Branch pickup',
    summary: `${listOf(cities)} · ${branchHours.days}`,
    description: 'We let you know when your package is ready and you pick it up at the branch closest to you.',
    facts: [`Branches in ${listOf(cities)}.`, sentence(`We are open ${describeHours(branchHours)}`)],
    link: 'See branches',
  },
  'entrega-a-domicilio': {
    name: 'Home delivery',
    summary: 'Your package to your door.',
    description: LAST_MILE.available
      ? 'We take your package to your home (the last mile).'
      : 'Delivery to your home (the last mile) will be available soon. In the meantime, you pick up your package at a branch.',
    facts: [],
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

/** In the order of ../services.ts: the steps have no id. */
const STEP_TEXT: Array<Pick<ProcessStep, 'title' | 'summary' | 'details'> & { link: string }> = [
  {
    title: 'Open your mailbox',
    summary: 'Sign up online and get your Carinova ID and your address in Miami.',
    details: [
      'You fill in a short form and confirm your e-mail.',
      'When you confirm, you see your Carinova ID and your address in Miami, and we also e-mail them to you.',
    ],
    link: CTA.signup.text,
  },
  {
    title: 'Buy, or have your package sent',
    summary: 'Use your Miami address at any store in the United States, or give it to your family.',
    details: [
      'At checkout, write your first name and your last name exactly as they appear in your Miami address.',
      'No card? Request an assisted purchase: we buy for you, free of charge.',
      'Before you buy, check that your product is not on the list of prohibited items.',
    ],
    link: 'See prohibited items',
  },
  {
    title: 'We bring it to Nicaragua',
    summary: `By air in ${air.transit} or by sea in ${sea.transit}, ${RATES.transitFrom}.`,
    details: [
      `Air: ${formatUSD(air.pricePerLb)} per pound. Sea: ${formatUSD(sea.pricePerLb)} per pound or ${formatUSD(sea.pricePerCubicFoot)} per cubic foot.`,
      'Cell phones, tablets, laptops and consoles travel at a flat rate per unit, taxes included.',
      'Rates include insurance and taxes where applicable.',
    ],
    link: CTA.quote.text,
  },
  {
    title: 'Pick it up at your branch',
    summary: `Collect your package in ${cities.join(' or ')}.`,
    details: [
      'We let you know when your package is ready for pickup.',
      sentence(`We are open ${describeHours(branchHours)}`),
      LAST_MILE.available ? 'We also take it to your home.' : 'Home delivery is coming soon.',
    ],
    link: 'See branches',
  },
];

export const PROCESS_STEPS: Array<ProcessStep> = es.PROCESS_STEPS.map((step, index) => {
  const text = STEP_TEXT[index];
  if (!text) throw new Error(`Step ${index + 1} of "Cómo comprar" has no English text (src/data/en/services.ts).`);
  return {
    ...step,
    title: text.title,
    summary: text.summary,
    details: text.details,
    link: { ...step.link, text: text.link },
  };
});

const receivingNow = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
const receivingSoon = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);

const ACCOUNT_TEXT: Record<string, { title: string; summary: string }> = {
  'carinova-id': { title: 'Carinova ID', summary: 'One per person or company, for all your shipments.' },
  recepcion: {
    title: 'Reception in the United States',
    summary: `${listOf(receivingNow)}.${receivingSoon.length ? ` ${listOf(receivingSoon)}, coming soon.` : ''}`,
  },
  retiro: { title: 'Pickup in Nicaragua', summary: `${listOf(cities)}.` },
};

export const ACCOUNT_PARTS: typeof es.ACCOUNT_PARTS = es.ACCOUNT_PARTS.map((part) => ({
  ...part,
  ...textOf(ACCOUNT_TEXT, part.id, 'account part'),
}));

const EXAMPLE_TEXT: Record<string, Pick<ShoppingExample, 'category' | 'item' | 'source'>> = {
  ropa: {
    category: 'Clothes and shoes',
    item: 'Two blouses, a pair of pants and a pair of sneakers',
    source: 'From Shein and Nike',
  },
  celulares: { category: 'Cell phones and tablets', item: 'A new cell phone', source: 'From Amazon' },
  laptops: {
    category: 'Laptops and consoles',
    item: 'A laptop and a PlayStation',
    source: 'From Best Buy and Walmart',
  },
  hogar: {
    category: 'Home and kitchen',
    item: 'An 18 lb cookware set, in a 16 × 12 × 10 inch box',
    source: 'From Walmart',
  },
  muebles: {
    category: 'Furniture',
    item: 'A 40 lb office chair, in a 28 × 26 × 14 inch box',
    source: 'From Costco',
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
    air: 'Air, per pound',
    sea: 'Sea, by weight or by volume',
    electronics: 'Electronics, flat rate per unit',
    electronicsNote: 'Includes air shipping and taxes.',
  },
  'en'
);

export const FORMULA_EXAMPLE: typeof es.FORMULA_EXAMPLE = { ...es.FORMULA_EXAMPLE, item: 'A cargo pallet' };
