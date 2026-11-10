// Shipping quote helpers, shared by the server-rendered calculator and its client script.

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** "$1,234.50" — Nicaragua writes dollar amounts the US way. */
export const formatUSD = (amount: number): string => usd.format(amount);

/** "2.5" → "2.5", "3" → "3": weights as typed, without trailing zeros. */
export const formatPounds = (pounds: number): string => String(Math.round(pounds * 100) / 100);

/** Weight that gets billed: never below the minimum, and rounded up to whole pounds when `roundUp` is set. */
export const billablePounds = (pounds: number, minLb: number, roundUp: boolean): number => {
  // Subtract a hair before rounding up so 2.0000000001 (float noise) still bills as 2.
  const weight = roundUp ? Math.ceil(pounds - 1e-9) : Math.round(pounds * 100) / 100;
  return Math.max(minLb, weight);
};

export const quoteTotal = (pounds: number, pricePerLb: number, minLb: number, roundUp: boolean): number =>
  Math.round(billablePounds(pounds, minLb, roundUp) * pricePerLb * 100) / 100;
