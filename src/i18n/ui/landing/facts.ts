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

  // Where packages are received today: Los Ángeles joins the sentences when it opens.
  const open = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
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
    palletTotal: formatUSD(pallet.total),
    banksAnd: list(PAYMENTS.banks, 'conjunction'),
    banksOr: list(PAYMENTS.banks, 'disjunction'),
    receptionOr: list(open, 'disjunction'),
    receptionAnd: list(open, 'conjunction'),
    maxLinks: String(LANDING_LIMITS.links),
    maxQuantity: String(LANDING_LIMITS.quantity),
    phoneMin: String(LANDING_LIMITS.phoneDigits[0]),
    phoneMax: String(LANDING_LIMITS.phoneDigits[1]),
  };
};
