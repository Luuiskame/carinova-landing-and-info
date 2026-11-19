// The estimate of the home page's calculator ("Calculador Iterativo"): what a shipment costs by air
// and by sea, with the rules of the page Carinova wrote on 2026-11-18. Shared by the page (the first
// quote is rendered at build time) and by its script, so both give the same number; the unit tests
// (quote.test.ts) run it on plain Node.
//
// The rules:
// - A device with a price per unit travels by air only: units × its price.
// - "Volume" and "restricted by air" travel by sea only.
// - By sea, a shipment with its three measurements is charged by volume (cubic feet × the price per
//   cubic foot); without them, by weight.
// - By weight, the packages together are billed for at least the minimum (RATES.minimumLb).
// - "Express" is quoted by the team until it has a price: the estimate is valid and pending.
//
// It has no rates of its own: the page hands it the ones of src/data/carinova.ts. The arithmetic is
// utils/rates.ts, the same the rest of the site uses.
import { quoteByVolume, quoteByWeight, type LengthUnit } from './rates.ts';

export type Mode = 'air' | 'sea';
export type Service = 'standard' | 'express';

/** Pounds in a kilogram. */
export const LB_PER_KG = 2.2046226218487757;

/** What the calculator knows of the rates. */
export interface QuoteRates {
  /** USD per pound. */
  air: number;
  sea: number;
  /** USD per cubic foot, by sea. */
  cubicFoot: number;
  /** The least a shipment by weight is billed for, in pounds. */
  minimumLb: number;
  /** USD per unit of each device, by its id; they travel by air. */
  devices: Record<string, number>;
  /** USD per pound of the express service; null while Carinova quotes it case by case. */
  express: Record<Mode, number | null>;
  /** The most packages or units it counts. */
  maxQuantity: number;
}

/** The form as it is: what the visitor typed, still text. */
export interface QuoteInput {
  mode?: string;
  service?: string;
  /** "general", "restricted", "volume" or the id of a device. */
  category?: string;
  quantity?: string | number;
  /** Of each package. */
  weight?: string | number;
  weightUnit?: string;
  length?: string | number;
  width?: string | number;
  height?: string | number;
  dimensionUnit?: string;
}

/** Why there is no estimate: the name of the sentence that says it (`landing` in the dictionaries). */
export type QuoteError =
  | 'uiErrorMode'
  | 'uiErrorQuantity'
  | 'uiErrorElectronics'
  | 'uiErrorCategory'
  | 'uiErrorVolumeMode'
  | 'uiErrorRestrictedAir'
  | 'uiErrorDimensions'
  | 'uiErrorDimensionUnit'
  | 'uiErrorTooLarge'
  | 'uiErrorWeight'
  | 'uiErrorWeightUnit'
  | 'uiErrorWeightOrDimensions';

export interface Quote {
  valid: boolean;
  /** A valid request whose price the team gives ("A cotizar"). */
  pending: boolean;
  service: Service;
  /** What it was charged by; empty when there is no estimate. */
  kind: 'unit' | 'volume' | 'weight' | '';
  total: number | null;
  /** USD per unit, per cubic foot or per pound. */
  rate: number | null;
  /** Pounds charged for, and pounds the packages weigh. */
  billableWeight: number | null;
  rawWeight: number | null;
  volumeCubicFeet: number | null;
  error: QuoteError | '';
}

const filled = (value: unknown): boolean => value !== null && value !== undefined && String(value).trim() !== '';

/** A number greater than zero, as a visitor types it. */
export const isPositive = (value: unknown): boolean =>
  filled(value) && Number.isFinite(Number(value)) && Number(value) > 0;

const UNITS: ReadonlyArray<string> = ['in', 'cm'];

export const calculateQuote = (input: QuoteInput, rates: QuoteRates): Quote => {
  const service: Service = input.service === 'express' ? 'express' : 'standard';
  const none: Quote = {
    valid: false,
    pending: false,
    service,
    kind: '',
    total: null,
    rate: null,
    billableWeight: null,
    rawWeight: null,
    volumeCubicFeet: null,
    error: '',
  };
  const fail = (error: QuoteError): Quote => ({ ...none, error });
  const pending = (details: Partial<Quote>): Quote => ({ ...none, ...details, valid: true, pending: true });

  const { mode, category = '' } = input;
  if (mode !== 'air' && mode !== 'sea') return fail('uiErrorMode');

  const quantity = Number(input.quantity);
  if (!isPositive(input.quantity) || !Number.isInteger(quantity) || quantity > rates.maxQuantity) {
    return fail('uiErrorQuantity');
  }

  // (Not Object.hasOwn: the script runs on phones whose browser is a few years old.)
  if (Object.prototype.hasOwnProperty.call(rates.devices, category)) {
    if (mode !== 'air') return fail('uiErrorElectronics');
    if (service === 'express') return pending({ kind: 'unit' });
    const rate = rates.devices[category];
    return { ...none, valid: true, kind: 'unit', rate, total: Math.round(rate * quantity * 100) / 100 };
  }
  if (category !== 'general' && category !== 'volume' && category !== 'restricted') return fail('uiErrorCategory');
  if (category === 'volume' && mode !== 'sea') return fail('uiErrorVolumeMode');
  // What cannot fly travels by sea.
  if (category === 'restricted' && mode !== 'sea') return fail('uiErrorRestrictedAir');

  let volumeCubicFeet: number | null = null;
  let volumeTotal = 0;
  const sides = [input.length, input.width, input.height];
  if (category === 'volume' || sides.some(filled)) {
    if (!sides.every(isPositive)) return fail('uiErrorDimensions');
    if (!UNITS.includes(input.dimensionUnit ?? '')) return fail('uiErrorDimensionUnit');
    const [length, width, height] = sides.map(Number);
    const volume = quoteByVolume({ length, width, height }, rates.cubicFoot, {
      unit: input.dimensionUnit as LengthUnit,
      pieces: quantity,
    });
    if (!Number.isFinite(volume.cubicFeet)) return fail('uiErrorTooLarge');
    volumeCubicFeet = volume.cubicFeet;
    volumeTotal = volume.total;
  }

  // By sea, measurements mean volume; without them, weight.
  if (mode === 'sea' && volumeCubicFeet !== null) {
    if (service === 'express') return pending({ kind: 'volume', volumeCubicFeet });
    if (!Number.isFinite(volumeTotal)) return fail('uiErrorTooLarge');
    return { ...none, valid: true, kind: 'volume', rate: rates.cubicFoot, total: volumeTotal, volumeCubicFeet };
  }

  if (!isPositive(input.weight)) {
    return fail(mode === 'sea' && !filled(input.weight) ? 'uiErrorWeightOrDimensions' : 'uiErrorWeight');
  }
  if (input.weightUnit !== 'lb' && input.weightUnit !== 'kg') return fail('uiErrorWeightUnit');

  const pounds = Number(input.weight) * (input.weightUnit === 'kg' ? LB_PER_KG : 1);
  const rate = service === 'express' ? rates.express[mode] : rates[mode];
  const weight = quoteByWeight(pounds, rate ?? 0, quantity, rates.minimumLb);
  const weighed = { billableWeight: weight.billedPounds, rawWeight: weight.totalPounds, volumeCubicFeet };
  if (rate === null) return pending({ kind: 'weight', ...weighed });
  if (!Number.isFinite(weight.total)) return fail('uiErrorTooLarge');
  return { ...none, valid: true, kind: 'weight', rate, total: weight.total, ...weighed };
};
