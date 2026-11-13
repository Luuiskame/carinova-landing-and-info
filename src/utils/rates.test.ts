import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  describeUnitLine,
  describeVolume,
  describeWeight,
  formatCubicFeet,
  formatNumber,
  formatUSD,
  hasDimensions,
  listUnits,
  quoteByVolume,
  quoteByWeight,
  quoteUnits,
} from './rates.ts';

const DEVICES = [
  { id: 'celular', name: 'Celular', plural: 'Celulares', price: 30 },
  { id: 'laptop', name: 'Laptop', plural: 'Laptops', price: 80 },
  { id: 'playstation', name: 'PlayStation', plural: 'PlayStation', price: 85, brand: true },
];

test("the cubic-foot formula of Carinova's brief: 48 × 40 × 72 in is 80 ft³, US$1,600", () => {
  const quote = quoteByVolume({ length: 48, width: 40, height: 72 }, 20);
  assert.equal(quote.cubicUnits, 138_240);
  assert.equal(quote.cubicFeet, 80);
  assert.equal(quote.total, 1600);
  assert.equal(describeVolume(quote), '48 × 40 × 72 = 138,240 pulg³ ÷ 1,728 = 80 pie³ × US$20 = US$1,600');
});

test("the prototype's default box: 50 × 40 × 30 cm is 2.1189 ft³, US$42.38", () => {
  const quote = quoteByVolume({ length: 50, width: 40, height: 30 }, 20, { unit: 'cm' });
  assert.equal(quote.cubicUnits, 60_000);
  assert.equal(formatCubicFeet(quote.cubicFeet), '2.1189');
  assert.equal(quote.total, 42.38);
  assert.equal(describeVolume(quote), '50 × 40 × 30 = 60,000 cm³ ÷ 28,316.85 = 2.1189 pie³ × US$20 = US$42.38');
});

test('cubic feet are not rounded before multiplying: only the amount is, to cents', () => {
  const quote = quoteByVolume({ length: 28, width: 26, height: 14 }, 20);
  assert.equal(quote.cubicUnits, 10_192);
  assert.equal(formatCubicFeet(quote.cubicFeet), '5.8981');
  assert.equal(quote.total, 117.96);
  assert.equal(describeVolume(quote), '28 × 26 × 14 = 10,192 pulg³ ÷ 1,728 = 5.8981 pie³ × US$20 = US$117.96');
  assert.equal(
    formatCubicFeet(quoteByVolume({ length: 2, width: 2, height: 2 }, 20, { unit: 'cm' }).cubicFeet),
    '0.0002825'
  );
});

test('several pieces of the same size multiply the volume', () => {
  const quote = quoteByVolume({ length: 50, width: 40, height: 30 }, 20, { unit: 'cm', pieces: 2 });
  assert.equal(quote.cubicUnits, 120_000);
  assert.equal(quote.total, 84.76);
  assert.equal(describeVolume(quote), '2 × 50 × 40 × 30 = 120,000 cm³ ÷ 28,316.85 = 4.2378 pie³ × US$20 = US$84.76');
  // A count that is not a whole number of at least one is one piece.
  assert.equal(quoteByVolume({ length: 48, width: 40, height: 72 }, 20, { pieces: 0 }).pieces, 1);
  assert.equal(quoteByVolume({ length: 48, width: 40, height: 72 }, 20, { pieces: 2.9 }).pieces, 2);
});

test('by weight the pounds are charged as they are: no minimum and no rounding up', () => {
  const air = quoteByWeight(3, 6.5);
  assert.equal(air.total, 19.5);
  assert.equal(describeWeight(air), '3 lb × US$6.50 = US$19.50');

  assert.equal(quoteByWeight(2.3, 6.5).total, 14.95);
  assert.equal(describeWeight(quoteByWeight(2.3, 6.5)), '2.3 lb × US$6.50 = US$14.95');
  assert.equal(quoteByWeight(0.4, 6.5).total, 2.6);
  assert.equal(quoteByWeight(5, 6.5).total, 32.5);
  assert.equal(quoteByWeight(18, 2.5).total, 45);
});

test('several packages of the same weight multiply the pounds', () => {
  const quote = quoteByWeight(5, 6.5, 2);
  assert.equal(quote.totalPounds, 10);
  assert.equal(quote.total, 65);
  assert.equal(describeWeight(quote), '2 × 5 lb = 10 lb × US$6.50 = US$65');
  // Float noise does not reach the formula: 0.1 lb × 3 is 0.3 lb.
  assert.equal(describeWeight(quoteByWeight(0.1, 6.5, 3)), '3 × 0.1 lb = 0.3 lb × US$6.50 = US$1.95');
});

test('measurements count when all three are there', () => {
  assert.equal(hasDimensions({ length: 48, width: 40, height: 72 }), true);
  assert.equal(hasDimensions({ length: 48, width: 40 }), false);
  assert.equal(hasDimensions({ length: 48, width: 0, height: 72 }), false);
  assert.equal(hasDimensions(undefined), false);
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
  assert.equal(formatNumber(28316.846592), '28,316.85');
});

test('the formulas can be written in English: the numbers are the same', () => {
  const volume = quoteByVolume({ length: 48, width: 40, height: 72 }, 20);
  assert.equal(describeVolume(volume, 'en'), '48 × 40 × 72 = 138,240 in³ ÷ 1,728 = 80 ft³ × US$20 = US$1,600');
  assert.equal(describeVolume(volume, 'es'), describeVolume(volume));

  const metric = quoteByVolume({ length: 50, width: 40, height: 30 }, 20, { unit: 'cm' });
  assert.equal(describeVolume(metric, 'en'), '50 × 40 × 30 = 60,000 cm³ ÷ 28,316.85 = 2.1189 ft³ × US$20 = US$42.38');

  const units = quoteUnits({ celular: 1, laptop: 2, playstation: 1 }, DEVICES).lines;
  assert.equal(listUnits(units, 'en'), '1 celular, 2 laptops and 1 PlayStation');
});
