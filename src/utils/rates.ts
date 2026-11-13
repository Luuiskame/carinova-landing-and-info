// Shipping quote math and how it is written out, shared by the pages (rendered at build time) and
// the calculator's script (in the browser), so both always show the same numbers and formulas.
// No rates of its own (they come from src/data/carinova.ts) and nothing imported at run time: the
// unit tests (rates.test.ts) run this file on plain Node.
//
// A shipment is quoted on one basis at a time, as in Carinova's prototype: by weight, by volume or
// per unit. The arithmetic is exact: no minimum weight and no rounding of pounds or cubic feet,
// because Carinova has stated neither; only the amount is rounded, to cents.
import type { Locale } from '../i18n/locales.ts';

/** The measurements of a box come in centimetres or in inches. */
export type LengthUnit = 'cm' | 'in';

/** The few words the formulas are written with. Spanish is the default everywhere. */
const WORDS = {
  es: { cubic: { cm: 'cm³', in: 'pulg³' }, cubicFeet: 'pie³', and: 'y' },
  en: { cubic: { cm: 'cm³', in: 'in³' }, cubicFeet: 'ft³', and: 'and' },
} satisfies Record<Locale, unknown>;

/** Cubic inches in a cubic foot (12 × 12 × 12). */
export const CUBIC_INCHES_PER_CUBIC_FOOT = 1728;
/** Cubic centimetres in a cubic foot (30.48 × 30.48 × 30.48). */
export const CUBIC_CM_PER_CUBIC_FOOT = 28316.846592;

const DIVISOR: Record<LengthUnit, number> = { cm: CUBIC_CM_PER_CUBIC_FOOT, in: CUBIC_INCHES_PER_CUBIC_FOOT };

const round = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};
const round2 = (value: number): number => round(value, 2);
/** Removes the noise of floating-point products (0.1 × 3 = 0.30000000000000004) without rounding a measure. */
const tidy = (value: number): number => round(value, 6);

/**
 * "US$6.50", "US$20", "US$1,600": cents only when there are any. "US$" because Nicaragua also
 * writes córdobas with a dollar sign (C$).
 */
export const formatUSD = (amount: number): string => {
  const value = round2(amount);
  const decimals = Number.isInteger(value) ? 0 : 2;
  return `US$${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

/** "138,240", "1.75", "80": thousands with commas and at most two decimals (or `maxDecimals`), as Nicaragua writes them. */
export const formatNumber = (value: number, maxDecimals = 2): string =>
  round(value, maxDecimals).toLocaleString('en-US', { maximumFractionDigits: maxDecimals });

/** A count of packages, pieces or units: a whole number, at least one. */
const countOf = (count: number | undefined): number =>
  count !== undefined && Number.isFinite(count) && count >= 1 ? Math.floor(count) : 1;

export interface WeightQuote {
  /** Pounds of each package. */
  pounds: number;
  packages: number;
  totalPounds: number;
  pricePerLb: number;
  total: number;
}

/** By weight (air or sea): pounds of each package × packages × price per pound. */
export const quoteByWeight = (pounds: number, pricePerLb: number, packages?: number): WeightQuote => {
  const count = countOf(packages);
  const totalPounds = tidy(pounds * count);
  return { pounds, packages: count, totalPounds, pricePerLb, total: round2(totalPounds * pricePerLb) };
};

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface VolumeQuote {
  dims: Dimensions;
  unit: LengthUnit;
  pieces: number;
  /** Cubic centimetres or cubic inches of all the pieces. */
  cubicUnits: number;
  cubicFeet: number;
  pricePerCubicFoot: number;
  total: number;
}

/**
 * By volume (sea), the formula of Carinova's brief: length × width × height = cubic inches;
 * ÷ 1,728 = cubic feet; × the price per cubic foot. In centimetres the divisor is 28,316.85
 * (1 foot = 30.48 cm). The cubic feet are not rounded before the multiplication.
 */
export const quoteByVolume = (
  dims: Dimensions,
  pricePerCubicFoot: number,
  { unit = 'in', pieces }: { unit?: LengthUnit; pieces?: number } = {}
): VolumeQuote => {
  const count = countOf(pieces);
  const cubicUnits = tidy(dims.length * dims.width * dims.height * count);
  const cubicFeet = cubicUnits / DIVISOR[unit];
  return {
    dims,
    unit,
    pieces: count,
    cubicUnits,
    cubicFeet,
    pricePerCubicFoot,
    total: round2(cubicFeet * pricePerCubicFoot),
  };
};

export const hasDimensions = (dims?: Partial<Dimensions>): dims is Dimensions =>
  !!dims && [dims.length, dims.width, dims.height].every((side) => typeof side === 'number' && side > 0);

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

/** "3 lb × US$6.50 = US$19.50"; with several packages, "2 × 5 lb = 10 lb × US$6.50 = US$65". */
export const describeWeight = (quote: WeightQuote): string => {
  const each = quote.packages > 1 ? `${quote.packages} × ${formatNumber(quote.pounds, 5)} lb = ` : '';
  return `${each}${formatNumber(quote.totalPounds, 5)} lb × ${formatUSD(quote.pricePerLb)} = ${formatUSD(quote.total)}`;
};

/** Cubic feet as they are shown: four decimals, more for a very small box. */
export const formatCubicFeet = (cubicFeet: number): string => formatNumber(cubicFeet, cubicFeet < 0.01 ? 7 : 4);

/**
 * "48 × 40 × 72 = 138,240 pulg³ ÷ 1,728 = 80 pie³ × US$20 = US$1,600" ("in³" and "ft³" in English);
 * in centimetres, "50 × 40 × 30 = 60,000 cm³ ÷ 28,316.85 = 2.1189 pie³ × US$20 = US$42.38"; with
 * several pieces the count goes first: "2 × 50 × 40 × 30 = 120,000 cm³ …".
 */
export const describeVolume = (quote: VolumeQuote, locale: Locale = 'es'): string => {
  const { length, width, height } = quote.dims;
  const words = WORDS[locale];
  const pieces = quote.pieces > 1 ? `${quote.pieces} × ` : '';
  return (
    `${pieces}${formatNumber(length)} × ${formatNumber(width)} × ${formatNumber(height)} = ` +
    `${formatNumber(quote.cubicUnits)} ${words.cubic[quote.unit]} ÷ ${formatNumber(DIVISOR[quote.unit])} = ` +
    `${formatCubicFeet(quote.cubicFeet)} ${words.cubicFeet} × ${formatUSD(quote.pricePerCubicFoot)} = ${formatUSD(quote.total)}`
  );
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
