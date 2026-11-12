import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  billablePounds,
  describeSea,
  describeUnitLine,
  describeVolume,
  describeWeight,
  formatNumber,
  formatUSD,
  listUnits,
  quoteByVolume,
  quoteByWeight,
  quoteSea,
  quoteUnits,
} from './rates.ts';

const SEA = { pricePerLb: 2.5, pricePerCubicFoot: 20, minLb: 1 };
const DEVICES = [
  { id: 'celular', name: 'Celular', plural: 'Celulares', price: 30 },
  { id: 'laptop', name: 'Laptop', plural: 'Laptops', price: 80 },
  { id: 'playstation', name: 'PlayStation', plural: 'PlayStation', price: 85, brand: true },
];

test("the cubic-foot formula of Carinova's brief: 48 × 40 × 72 in is 80 ft³, US$1,600", () => {
  const quote = quoteByVolume({ length: 48, width: 40, height: 72 }, 20);
  assert.equal(quote.cubicInches, 138_240);
  assert.equal(quote.cubicFeet, 80);
  assert.equal(quote.total, 1600);
  assert.equal(describeVolume(quote), '48 × 40 × 72 = 138,240 pulg³ ÷ 1,728 = 80 pie³ × US$20 = US$1,600');
});

test('cubic feet are rounded to cents before multiplying, so the total matches the formula shown', () => {
  const quote = quoteByVolume({ length: 28, width: 26, height: 14 }, 20);
  assert.equal(quote.cubicInches, 10_192);
  assert.equal(quote.cubicFeet, 5.9);
  assert.equal(quote.total, 118);
  assert.equal(describeVolume(quote), '28 × 26 × 14 = 10,192 pulg³ ÷ 1,728 = 5.9 pie³ × US$20 = US$118');
});

test('by weight: started pounds bill as whole pounds, never below the minimum', () => {
  assert.equal(billablePounds(2.3, 1, true), 3);
  assert.equal(billablePounds(2.0000000001, 1, true), 2);
  assert.equal(billablePounds(0.4, 1, true), 1);
  assert.equal(billablePounds(2.345, 1, false), 2.35);

  const air = quoteByWeight(3, 6.5, 1, true);
  assert.equal(air.total, 19.5);
  assert.equal(describeWeight(air), '3 lb × US$6.50 = US$19.50');
  assert.equal(describeWeight(quoteByWeight(2.3, 6.5, 1, true)), '2.3 lb → 3 lb × US$6.50 = US$19.50');
});

test('sea charges weight or volume, whichever is more', () => {
  const heavy = quoteSea({ pounds: 18, dims: { length: 16, width: 12, height: 10 } }, SEA, true);
  assert.equal(heavy?.chargedBy, 'weight');
  assert.equal(heavy?.total, 45);
  assert.equal(heavy?.byVolume?.total, 22.2);

  const bulky = quoteSea({ pounds: 40, dims: { length: 28, width: 26, height: 14 } }, SEA, true);
  assert.equal(bulky?.chargedBy, 'volume');
  assert.equal(bulky?.total, 118);
  assert.equal(bulky?.byWeight?.total, 100);
});

test('sea with only one measure charges that one; with neither there is no quote', () => {
  assert.equal(quoteSea({ dims: { length: 48, width: 40, height: 72 } }, SEA, true)?.total, 1600);
  assert.equal(quoteSea({ pounds: 20 }, SEA, true)?.total, 50);
  assert.equal(quoteSea({ pounds: 20, dims: { length: 18, width: 14 } }, SEA, true)?.chargedBy, 'weight');
  assert.equal(quoteSea({}, SEA, true), null);
  assert.equal(quoteSea({ pounds: 0, dims: { length: 10, width: 0, height: 10 } }, SEA, true), null);
});

test('electronics add up per unit and drop fractions and negatives', () => {
  const quote = quoteUnits({ celular: 1, laptop: 2, playstation: 0.7, tablet: 3 }, DEVICES);
  assert.equal(quote.total, 190);
  assert.equal(quote.units, 3);
  assert.deepEqual(quote.lines.map(describeUnitLine), ['1 Celular × US$30 = US$30', '2 Laptops × US$80 = US$160']);
  assert.equal(quoteUnits({ celular: -2 }, DEVICES).total, 0);
});

test('units are listed for a sentence, keeping brand capitals', () => {
  assert.equal(listUnits(quoteUnits({ celular: 1 }, DEVICES).lines), '1 celular');
  assert.equal(
    listUnits(quoteUnits({ celular: 1, laptop: 2, playstation: 1 }, DEVICES).lines),
    '1 celular, 2 laptops y 1 PlayStation'
  );
});

test('amounts in US$ show cents only when there are any; numbers use commas for thousands', () => {
  assert.equal(formatUSD(6.5), 'US$6.50');
  assert.equal(formatUSD(20), 'US$20');
  assert.equal(formatUSD(1600), 'US$1,600');
  assert.equal(formatUSD(31.6), 'US$31.60');
  assert.equal(formatUSD(0.1 + 0.2), 'US$0.30');
  assert.equal(formatNumber(138_240), '138,240');
  assert.equal(formatNumber(1.111111), '1.11');
});

test('the formulas can be written in English: the numbers are the same', () => {
  const volume = quoteByVolume({ length: 48, width: 40, height: 72 }, 20);
  assert.equal(describeVolume(volume, 'en'), '48 × 40 × 72 = 138,240 in³ ÷ 1,728 = 80 ft³ × US$20 = US$1,600');
  assert.equal(describeVolume(volume, 'es'), describeVolume(volume));

  const bulky = quoteSea({ pounds: 40, dims: { length: 28, width: 26, height: 14 } }, SEA, true)!;
  assert.deepEqual(describeSea(bulky, 'en'), {
    lines: [
      'By weight: 40 lb × US$2.50 = US$100',
      'By volume: 28 × 26 × 14 = 10,192 in³ ÷ 1,728 = 5.9 ft³ × US$20 = US$118',
    ],
    charged: 'Charged by volume, which is the higher of the two.',
  });
  assert.equal(describeSea(bulky).charged, 'Se cobra por volumen, que es el mayor.');

  const units = quoteUnits({ celular: 1, laptop: 2, playstation: 1 }, DEVICES).lines;
  assert.equal(listUnits(units, 'en'), '1 celular, 2 laptops and 1 PlayStation');
});
