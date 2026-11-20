// How an estimate of the calculator is written out: its amount and the line that says how it was
// worked out. Shared by Calculator.astro, which renders the first estimate when the page is built,
// and by the calculator's script, so both write the same thing.
//
// Numbers are written the way the page's language writes them, as Carinova's page does: "32.50" in
// Spanish and English, "32,50" in French and Portuguese (`intl` in src/i18n/locales.ts).
//
// Relative imports with the .ts extension: the unit tests run this on plain Node.
import type { Quote, QuoteInput } from '../../../utils/quote.ts';
import { fill } from '../../../utils/template.ts';

/** The sentences a formula is written with, in the language of the page; {placeholders} are filled here. */
export interface FormulaText {
  complete: string;
  expressPending: string;
  formulaWeight: string;
  formulaMinimum: string;
  formulaUnit: string;
  formulaVolume: string;
}

/** What writes the numbers of an estimate in one language (`tag`: "es-NI", "fr-FR"…). */
export const quoteWriter = (tag: string) => {
  const cents = new Intl.NumberFormat(tag, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /** "32.50": an amount, always with its cents. */
  const amount = (value: number): string => cents.format(value);

  /** "5", "4.409", "1,728": a weight, a volume or a count, with the decimals it has (three at most). */
  const number = (value: number, digits = 3): string =>
    new Intl.NumberFormat(tag, { maximumFractionDigits: digits }).format(value);

  /** "5 lb × US$6.50 por lb", "2 × US$30.00 por unidad", "80 pies³ × US$20.00 por pie³", or what is missing. */
  const formulaText = (input: QuoteInput, quote: Quote, text: FormulaText): string => {
    if (!quote.valid) return text.complete;
    if (quote.pending) return text.expressPending;
    if (quote.kind === 'unit') {
      return fill(text.formulaUnit, { quantity: number(Number(input.quantity)), rate: amount(quote.rate ?? 0) });
    }
    if (quote.kind === 'volume') return fill(text.formulaVolume, { volume: number(quote.volumeCubicFeet ?? 0) });
    const formula = fill(text.formulaWeight, {
      weight: number(quote.billableWeight ?? 0),
      rate: amount(quote.rate ?? 0),
    });
    // Under the minimum, the line says why more pounds are charged than the shipment weighs.
    const underMinimum = (quote.rawWeight ?? 0) < (quote.billableWeight ?? 0);
    return underMinimum ? `${formula} · ${text.formulaMinimum}` : formula;
  };

  return { amount, number, formulaText };
};

/**
 * What a screen reader is told about an estimate: "Transporte estimado: US$32.50 · Aéreo · Standard
 * · 2–4 días". The parts that are empty are left out.
 */
export const estimateLine = (label: string, price: string, ...parts: Array<string>): string =>
  [`${label}: ${price}`, ...parts].filter(Boolean).join(' · ');
