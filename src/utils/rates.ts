// Shipping quote math and how it is written out, shared by the pages (rendered at build time) and
// the calculator's script (in the browser), so both always show the same numbers and formulas.
// No rates of its own (they come from src/data/carinova.ts) and nothing imported at run time: the
// unit tests (rates.test.ts) run this file on plain Node.
import type { Locale } from '../i18n/locales.ts';

/** The few words the formulas are written with. Spanish is the default everywhere. */
const WORDS = {
  es: {
    cubicInches: 'pulg³',
    cubicFeet: 'pie³',
    byWeight: 'Por peso: ',
    byVolume: 'Por volumen: ',
    charged: (by: 'weight' | 'volume') => `Se cobra por ${by === 'volume' ? 'volumen' : 'peso'}, que es el mayor.`,
    and: 'y',
  },
  en: {
    cubicInches: 'in³',
    cubicFeet: 'ft³',
    byWeight: 'By weight: ',
    byVolume: 'By volume: ',
    charged: (by: 'weight' | 'volume') => `Charged by ${by}, which is the higher of the two.`,
    and: 'and',
  },
} satisfies Record<Locale, unknown>;

/** Cubic inches in a cubic foot (12 × 12 × 12). */
export const CUBIC_INCHES_PER_CUBIC_FOOT = 1728;

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * "US$6.50", "US$20", "US$1,600": cents only when there are any. "US$" because Nicaragua also
 * writes córdobas with a dollar sign (C$).
 */
export const formatUSD = (amount: number): string => {
  const value = round2(amount);
  const decimals = Number.isInteger(value) ? 0 : 2;
  return `US$${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

/** "138,240", "1.75", "80": thousands with commas and at most two decimals, as Nicaragua writes them. */
export const formatNumber = (value: number): string =>
  round2(value).toLocaleString('en-US', { maximumFractionDigits: 2 });

/** Weight that gets billed: never below the minimum, and rounded up to whole pounds when `roundUp` is set. */
export const billablePounds = (pounds: number, minLb: number, roundUp: boolean): number => {
  // Subtract a hair before rounding up so 2.0000000001 (float noise) still bills as 2.
  const weight = roundUp ? Math.ceil(pounds - 1e-9) : round2(pounds);
  return Math.max(minLb, weight);
};

export interface WeightQuote {
  pounds: number;
  billable: number;
  pricePerLb: number;
  total: number;
}

/** Air, or sea by weight: billable pounds × price per pound. */
export const quoteByWeight = (pounds: number, pricePerLb: number, minLb: number, roundUp: boolean): WeightQuote => {
  const billable = billablePounds(pounds, minLb, roundUp);
  return { pounds, billable, pricePerLb, total: round2(billable * pricePerLb) };
};

export interface Dimensions {
  /** Inches. */
  length: number;
  width: number;
  height: number;
}

export interface VolumeQuote {
  dims: Dimensions;
  cubicInches: number;
  cubicFeet: number;
  pricePerCubicFoot: number;
  total: number;
}

/**
 * Sea by volume, the formula of Carinova's brief: length × width × height (inches) = cubic inches;
 * ÷ 1,728 = cubic feet; × the price per cubic foot. Cubic feet are rounded to two decimals before
 * the multiplication, so the total matches the formula as it is shown.
 */
export const quoteByVolume = (dims: Dimensions, pricePerCubicFoot: number): VolumeQuote => {
  const cubicInches = round2(dims.length * dims.width * dims.height);
  const cubicFeet = round2(cubicInches / CUBIC_INCHES_PER_CUBIC_FOOT);
  return { dims, cubicInches, cubicFeet, pricePerCubicFoot, total: round2(cubicFeet * pricePerCubicFoot) };
};

export const hasDimensions = (dims?: Partial<Dimensions>): dims is Dimensions =>
  !!dims && [dims.length, dims.width, dims.height].every((side) => typeof side === 'number' && side > 0);

export interface SeaRate {
  pricePerLb: number;
  pricePerCubicFoot: number;
  minLb: number;
}

export interface SeaQuote {
  byWeight?: WeightQuote;
  byVolume?: VolumeQuote;
  /** Which of the two is charged: the higher one (a tie goes to weight). */
  chargedBy: 'weight' | 'volume';
  total: number;
}

/**
 * Sea freight is charged by weight or by volume, whichever costs more (weight/measure, the usual
 * rule for consolidated sea cargo). With only one of the two given, that one is charged.
 * Returns null when neither a weight nor all three measurements are given.
 */
export const quoteSea = (
  input: { pounds?: number; dims?: Partial<Dimensions> },
  rate: SeaRate,
  roundUp: boolean
): SeaQuote | null => {
  const byWeight =
    input.pounds !== undefined && input.pounds > 0
      ? quoteByWeight(input.pounds, rate.pricePerLb, rate.minLb, roundUp)
      : undefined;
  const byVolume = hasDimensions(input.dims) ? quoteByVolume(input.dims, rate.pricePerCubicFoot) : undefined;

  if (byVolume && (!byWeight || byVolume.total > byWeight.total)) {
    return { byWeight, byVolume, chargedBy: 'volume', total: byVolume.total };
  }
  if (byWeight) return { byWeight, byVolume, chargedBy: 'weight', total: byWeight.total };
  return null;
};

export interface UnitItem {
  id: string;
  name: string;
  plural: string;
  price: number;
  /** Brand names (Xbox, PlayStation) keep their capitals inside a sentence. */
  brand?: boolean;
}

export interface UnitLine {
  item: UnitItem;
  quantity: number;
  total: number;
}

export interface UnitsQuote {
  lines: Array<UnitLine>;
  units: number;
  total: number;
}

/** Flat rates per unit (electronics): quantity × price of each kind, added up. Fractions are dropped. */
export const quoteUnits = (quantities: Record<string, number | undefined>, items: Array<UnitItem>): UnitsQuote => {
  const lines = items
    .map((item) => {
      const quantity = Math.max(0, Math.floor(quantities[item.id] ?? 0));
      return { item, quantity, total: round2(quantity * item.price) };
    })
    .filter((line) => line.quantity > 0);
  return {
    lines,
    units: lines.reduce((sum, line) => sum + line.quantity, 0),
    total: round2(lines.reduce((sum, line) => sum + line.total, 0)),
  };
};

// How each quote is written out, in the calculator and in the worked examples.

/** "3 lb × US$6.50 = US$19.50"; "2.3 lb → 3 lb × US$6.50 = US$19.50" when the weight was rounded up. */
export const describeWeight = (quote: WeightQuote): string => {
  const weighed = quote.billable === quote.pounds ? '' : `${formatNumber(quote.pounds)} lb → `;
  return `${weighed}${formatNumber(quote.billable)} lb × ${formatUSD(quote.pricePerLb)} = ${formatUSD(quote.total)}`;
};

/** "48 × 40 × 72 = 138,240 pulg³ ÷ 1,728 = 80 pie³ × US$20 = US$1,600" ("in³" and "ft³" in English) */
export const describeVolume = (quote: VolumeQuote, locale: Locale = 'es'): string => {
  const { length, width, height } = quote.dims;
  const words = WORDS[locale];
  return (
    `${formatNumber(length)} × ${formatNumber(width)} × ${formatNumber(height)} = ` +
    `${formatNumber(quote.cubicInches)} ${words.cubicInches} ÷ ${formatNumber(CUBIC_INCHES_PER_CUBIC_FOOT)} = ` +
    `${formatNumber(quote.cubicFeet)} ${words.cubicFeet} × ${formatUSD(quote.pricePerCubicFoot)} = ${formatUSD(quote.total)}`
  );
};

/**
 * A sea quote written out: one line per measure given (labelled when there are two) and, when both
 * were worked out, which one is charged.
 */
export const describeSea = (quote: SeaQuote, locale: Locale = 'es'): { lines: Array<string>; charged?: string } => {
  const both = !!(quote.byWeight && quote.byVolume);
  const words = WORDS[locale];
  return {
    lines: [
      ...(quote.byWeight ? [`${both ? words.byWeight : ''}${describeWeight(quote.byWeight)}`] : []),
      ...(quote.byVolume ? [`${both ? words.byVolume : ''}${describeVolume(quote.byVolume, locale)}`] : []),
    ],
    charged: both ? words.charged(quote.chargedBy) : undefined,
  };
};

/** "1 Celular × US$30 = US$30", "2 Laptops × US$80 = US$160" */
export const describeUnitLine = ({ item, quantity, total }: UnitLine): string =>
  `${quantity} ${quantity === 1 ? item.name : item.plural} × ${formatUSD(item.price)} = ${formatUSD(total)}`;

/** "1 celular, 2 laptops y 1 PlayStation", for the WhatsApp message. */
export const listUnits = (lines: Array<UnitLine>, locale: Locale = 'es'): string => {
  const parts = lines.map(({ item, quantity }) => {
    const name = quantity === 1 ? item.name : item.plural;
    return `${quantity} ${item.brand ? name : name.toLowerCase()}`;
  });
  if (parts.length < 2) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} ${WORDS[locale].and} ${parts[parts.length - 1]}`;
};
