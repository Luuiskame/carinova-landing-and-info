// How an estimate of the calculator is written out: its amount and the line that says how it was
// worked out. Shared by Calculator.astro, which renders the first estimate when the page is built,
// and by the calculator's script, so both write the same thing.
//
// Numbers are written the same way in every language of the site: "32.50", "1,728".
import type { Quote, QuoteInput } from '~/utils/quote';
import { fill } from '~/utils/template';

/** "32.50": an amount, always with its cents. */
export const amount = (value: number): string =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "5", "4.409", "1,728": a weight, a volume or a count, with the decimals it has (three at most). */
export const number = (value: number, digits = 3): string =>
  value.toLocaleString('en-US', { maximumFractionDigits: digits });

/** The sentences a formula is written with, in the language of the page; {placeholders} are filled here. */
export interface FormulaText {
  complete: string;
  expressPending: string;
  formulaWeight: string;
  formulaMinimum: string;
  formulaUnit: string;
  formulaVolume: string;
}

/** "5 lb × US$6.50 por lb", "2 × US$30.00 por unidad", "80 pies³ × US$20.00 por pie³", or what is missing. */
export const formulaText = (input: QuoteInput, quote: Quote, text: FormulaText): string => {
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
