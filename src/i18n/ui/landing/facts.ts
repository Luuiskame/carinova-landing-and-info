/**
 * The facts the sentences of Carinova's home page are written around, as they are written in one
 * language: prices, days, the minimum, the banks, where packages are received and the limits of
 * the forms. Each landing dictionary (./es.ts, ./en.ts…) builds its sentences with them, so a
 * price or a time is written once, in src/data, and the home page cannot disagree with the pages
 * that own it.
 *
 * Relative imports with the .ts extension: the unit tests run the dictionaries on plain Node.
 */
import { PAYMENTS } from '../../../data/carinova.ts';
import type { Content } from '../../../data/content.ts';
import { LANDING_LIMITS } from '../../../data/landing.ts';
import { FORMULA_EXAMPLE } from '../../../data/services.ts';
import { formatNumber, formatUSD, quoteByVolume } from '../../../utils/rates.ts';
import { LOCALE_INFO, type Locale } from '../../locales.ts';

/** The two cities where packages are received, as Carinova's Chinese page names them in a sentence. */
const CITIES_ZH: Record<string, string> = { miami: '迈阿密', 'los-angeles': '洛杉矶' };

/** "US$20.00": with its cents even when there are none, where the page sets two prices side by side. */
const withCents = (amount: number): string =>
  `US$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const landingFacts = (
  locale: Locale,
  { RATES, RECEPTION_POINTS }: Pick<Content, 'RATES' | 'RECEPTION_POINTS'>
) => {
  const { air, sea, electronics, minimumLb } = RATES;
  const days = ([min, max]: [number, number]): string => `${min}–${max}`;
  const device = (id: string): string => formatUSD(electronics.items.find((item) => item.id === id)?.price ?? 0);
  /** "a, b y c" or "a, b o c", the way the language joins a list. */
  const list = (items: Array<string>, type: 'conjunction' | 'disjunction'): string =>
    new Intl.ListFormat(LOCALE_INFO[locale].intl, { style: 'long', type }).format(items);
  /**
   * A list as Carinova's page writes it: in English without the comma before "and" or "or" ("BAC,
   * Banpro and LAFISE"); in Chinese with a space between "和" or "或" and a name in Latin letters
   * ("BAC、Banpro 和 LAFISE").
   */
  const written = (items: Array<string>, type: 'conjunction' | 'disjunction'): string => {
    const text = list(items, type);
    if (locale === 'en') return text.replace(/, (and|or) /, ' $1 ');
    if (locale === 'zh') return text.replace(/([A-Za-z0-9])([和或])(?=[A-Za-z0-9])/g, '$1 $2 ');
    return text;
  };
  const either = (items: Array<string>): string => written(items, 'disjunction');
  /**
   * "US$1,600", "US$1.600", "US$1 600": an amount with its thousands set apart the way the language
   * does it, as Carinova's page writes the price of its example (a plain space where the language
   * uses one).
   */
  const grouped = (amount: number): string =>
    `US$${new Intl.NumberFormat(LOCALE_INFO[locale].intl, { maximumFractionDigits: 2 }).format(amount).replace(/[\u00a0\u202f]/g, ' ')}`;

  // Where packages are received, as Carinova's page says it: Miami and Los Ángeles. (The inner
  // pages still mark Los Ángeles "Próximamente", from `available`: docs/PROJECT-LOG.md → D-114.)
  // Inside a sentence, Carinova's Chinese page writes the two cities in Chinese.
  const openInChoice = RECEPTION_POINTS.map((point) =>
    locale === 'zh' ? (CITIES_ZH[point.id] ?? point.city) : point.city
  );
  // The cubic-foot example of Carinova's brief: a 48 × 40 × 72 in pallet.
  const { length, width, height } = FORMULA_EXAMPLE.dims;
  const pallet = quoteByVolume(FORMULA_EXAMPLE.dims, sea.pricePerCubicFoot, { unit: FORMULA_EXAMPLE.unit });

  return {
    airLb: formatUSD(air.pricePerLb),
    seaLb: formatUSD(sea.pricePerLb),
    cubicFoot: formatUSD(sea.pricePerCubicFoot),
    cubicFootCents: withCents(sea.pricePerCubicFoot),
    phone: device('celular'),
    tablet: device('tablet'),
    laptop: device('laptop'),
    /** Xbox and PlayStation cost the same, and the page says so in one price (landing.test.ts). */
    console: device('xbox'),
    airDays: days(air.transitDays),
    seaDays: days(sea.transitDays),
    deviceDays: days(electronics.transitDays),
    minimumLb: formatNumber(minimumLb),
    palletDims: `${length} × ${width} × ${height}`,
    palletTotal: grouped(pallet.total),
    banksAnd: written(PAYMENTS.banks, 'conjunction'),
    banksOr: either(PAYMENTS.banks),
    receptionOr: either(openInChoice),
    /** The same choice with the preposition before each city, as French wants it: "de Miami ou de Los Angeles". */
    receptionOrWith: (preposition: string): string => either(openInChoice.map((city) => `${preposition} ${city}`)),
    receptionAnd: written(openInChoice, 'conjunction'),
    maxLinks: String(LANDING_LIMITS.links),
    maxQuantity: String(LANDING_LIMITS.quantity),
    phoneMin: String(LANDING_LIMITS.phoneDigits[0]),
    phoneMax: String(LANDING_LIMITS.phoneDigits[1]),
  };
};
