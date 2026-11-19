// The estimate of the home page's calculator: the rules of the page Carinova wrote, with the rates
// of src/data/carinova.ts.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RATES } from '../data/carinova.ts';
import { LANDING_LIMITS } from '../data/landing.ts';
import { LB_PER_KG, calculateQuote, isPositive, type QuoteInput, type QuoteRates } from './quote.ts';

const rates: QuoteRates = {
  air: RATES.air.pricePerLb,
  sea: RATES.sea.pricePerLb,
  cubicFoot: RATES.sea.pricePerCubicFoot,
  minimumLb: RATES.minimumLb,
  devices: Object.fromEntries(RATES.electronics.items.map((item) => [item.id, item.price])),
  express: { air: null, sea: null },
  maxQuantity: LANDING_LIMITS.quantity,
};

/** The form as the page opens: 5 lb, one package of general merchandise, by air. */
const form = (changes: QuoteInput = {}): QuoteInput => ({
  mode: 'air',
  service: 'standard',
  category: 'general',
  quantity: '1',
  weight: '5',
  weightUnit: 'lb',
  length: '',
  width: '',
  height: '',
  dimensionUnit: 'in',
  ...changes,
});
const quote = (changes: QuoteInput = {}, withRates = rates) => calculateQuote(form(changes), withRates);

test('the rates the calculator works with are the ones Carinova publishes', () => {
  assert.deepEqual([rates.air, rates.sea, rates.cubicFoot, rates.minimumLb], [6.5, 2.5, 20, 1]);
  assert.deepEqual(rates.devices, { celular: 30, tablet: 40, laptop: 75, xbox: 85, playstation: 85 });
});

test('by weight: pounds × the price per pound, by air and by sea', () => {
  const air = quote();
  assert.deepEqual(
    [air.valid, air.pending, air.kind, air.total, air.rate, air.billableWeight, air.rawWeight, air.error],
    [true, false, 'weight', 32.5, 6.5, 5, 5, '']
  );
  assert.equal(quote({ mode: 'sea' }).total, 12.5);
  // Several packages of the same weight.
  const three = quote({ quantity: '3', weight: '2' });
  assert.deepEqual([three.rawWeight, three.total], [6, 39]);
  // Kilograms are turned into pounds.
  const kilos = quote({ weight: '2', weightUnit: 'kg' });
  assert.equal(kilos.rawWeight, Math.round(2 * LB_PER_KG * 1e6) / 1e6);
  assert.equal(kilos.total, 28.66);
});

test('a shipment under the minimum is billed for the minimum', () => {
  const light = quote({ weight: '0.4' });
  assert.deepEqual([light.rawWeight, light.billableWeight, light.total], [0.4, 1, 6.5]);
  // All the packages together count.
  assert.deepEqual(
    [quote({ weight: '0.4', quantity: '2' }).billableWeight, quote({ weight: '0.4', quantity: '2' }).total],
    [1, 6.5]
  );
  assert.deepEqual(
    [quote({ weight: '0.4', quantity: '3' }).billableWeight, quote({ weight: '0.4', quantity: '3' }).total],
    [1.2, 7.8]
  );
  assert.equal(quote({ weight: '0.4', mode: 'sea' }).total, 2.5);
});

test('devices are charged per unit and travel by air only', () => {
  const phones = quote({ category: 'celular', quantity: '2' });
  assert.deepEqual([phones.valid, phones.kind, phones.rate, phones.total], [true, 'unit', 30, 60]);
  assert.equal(quote({ category: 'laptop' }).total, 75);
  assert.equal(quote({ category: 'playstation', quantity: '3' }).total, 255);
  // Their weight and their measurements do not count.
  assert.equal(quote({ category: 'tablet', weight: '', length: '10' }).total, 40);
  assert.equal(quote({ category: 'celular', mode: 'sea' }).error, 'uiErrorElectronics');
});

test('by sea, the three measurements mean volume; without them, weight', () => {
  // The cubic-foot example of Carinova's brief: 48 × 40 × 72 in is 80 ft³, US$1,600.
  const pallet = quote({ mode: 'sea', category: 'volume', weight: '', length: '48', width: '40', height: '72' });
  assert.deepEqual(
    [pallet.valid, pallet.kind, pallet.volumeCubicFeet, pallet.rate, pallet.total],
    [true, 'volume', 80, 20, 1600]
  );
  assert.equal(
    quote({ mode: 'sea', category: 'volume', weight: '', length: '48', width: '40', height: '72', quantity: '2' })
      .total,
    3200
  );
  // General merchandise with measurements is charged by volume too, whatever it weighs.
  const general = quote({ mode: 'sea', length: '12', width: '12', height: '12' });
  assert.deepEqual([general.kind, general.volumeCubicFeet, general.total], ['volume', 1, 20]);
  // In centimetres: 30.48 cm is a foot.
  assert.equal(quote({ mode: 'sea', length: '30.48', width: '30.48', height: '30.48', dimensionUnit: 'cm' }).total, 20);
  // Without measurements, by weight.
  assert.deepEqual([quote({ mode: 'sea' }).kind, quote({ mode: 'sea' }).total], ['weight', 12.5]);
  // By air the measurements are checked and the weight is what is charged.
  const air = quote({ length: '12', width: '12', height: '12' });
  assert.deepEqual([air.kind, air.total, air.volumeCubicFeet], ['weight', 32.5, 1]);
});

test('what only travels by sea cannot be quoted by air', () => {
  assert.equal(quote({ category: 'volume', length: '10', width: '10', height: '10' }).error, 'uiErrorVolumeMode');
  assert.equal(quote({ category: 'restricted' }).error, 'uiErrorRestrictedAir');
  const perfume = quote({ category: 'restricted', mode: 'sea' });
  assert.deepEqual([perfume.valid, perfume.kind, perfume.total], [true, 'weight', 12.5]);
});

test('express is a valid request the team quotes, until it has a price', () => {
  for (const changes of [
    { service: 'express' },
    { service: 'express', mode: 'sea' },
    { service: 'express', category: 'celular' },
    { service: 'express', mode: 'sea', category: 'volume', length: '10', width: '10', height: '10' },
  ]) {
    const pending = quote(changes);
    assert.deepEqual(
      [pending.valid, pending.pending, pending.total, pending.error],
      [true, true, null, ''],
      JSON.stringify(changes)
    );
  }
  assert.deepEqual([quote({ service: 'express' }).kind, quote({ service: 'express' }).billableWeight], ['weight', 5]);
  // With a price per pound, express by weight is worked out; devices and volume stay to be quoted.
  const priced: QuoteRates = { ...rates, express: { air: 9.5, sea: null } };
  const express = quote({ service: 'express' }, priced);
  assert.deepEqual([express.pending, express.rate, express.total], [false, 9.5, 47.5]);
  assert.equal(quote({ service: 'express', mode: 'sea' }, priced).pending, true);
  assert.equal(quote({ service: 'express', category: 'laptop' }, priced).pending, true);
  // Anything that is not "express" is the standard service.
  assert.equal(quote({ service: 'qzqz' }).service, 'standard');
});

test('what is missing or wrong is named, in the order the form is read', () => {
  assert.equal(quote({ mode: 'qzqz' }).error, 'uiErrorMode');
  for (const quantity of ['', '0', '-1', '1.5', 'dos', String(LANDING_LIMITS.quantity + 1)]) {
    assert.equal(quote({ quantity }).error, 'uiErrorQuantity', `quantity "${quantity}"`);
  }
  assert.equal(quote({ quantity: String(LANDING_LIMITS.quantity) }).valid, true);
  assert.equal(quote({ category: 'qzqz' }).error, 'uiErrorCategory');
  // One measurement is not three.
  assert.equal(quote({ length: '10' }).error, 'uiErrorDimensions');
  assert.equal(quote({ mode: 'sea', category: 'volume', weight: '' }).error, 'uiErrorDimensions');
  assert.equal(quote({ length: '10', width: '0', height: '10' }).error, 'uiErrorDimensions');
  assert.equal(quote({ length: '10', width: '10', height: '10', dimensionUnit: 'ft' }).error, 'uiErrorDimensionUnit');
  // No weight: by sea the measurements would have done.
  assert.equal(quote({ weight: '' }).error, 'uiErrorWeight');
  assert.equal(quote({ weight: '', mode: 'sea' }).error, 'uiErrorWeightOrDimensions');
  assert.equal(quote({ weight: '0', mode: 'sea' }).error, 'uiErrorWeight');
  assert.equal(quote({ weightUnit: 'oz' }).error, 'uiErrorWeightUnit');
  // Numbers no parcel has.
  assert.equal(quote({ mode: 'sea', length: '1e200', width: '1e200', height: '1e200' }).error, 'uiErrorTooLarge');
  assert.equal(quote({ weight: '1e308', quantity: '999' }).error, 'uiErrorTooLarge');
  // An estimate that fails carries no numbers.
  const failed = quote({ weight: '' });
  assert.deepEqual([failed.valid, failed.total, failed.rate, failed.kind], [false, null, null, '']);
});

test('a number greater than zero, as it is typed', () => {
  for (const value of ['1', ' 2.5 ', 0.01, '1e3']) assert.equal(isPositive(value), true, String(value));
  for (const value of ['', ' ', '0', '-1', 'abc', null, undefined, Infinity, 'Infinity', NaN]) {
    assert.equal(isPositive(value), false, String(value));
  }
});
