// How the home page writes a delivery time, the opening hours, the departments of a form and the
// numbers of an estimate: the way Carinova's page writes them, language by language.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { quoteWriter } from '../components/landing/scripts/quote-view.ts';
import { DEPARTMENTS } from '../data/landing.ts';
import { LOCALE_INFO } from '../i18n/locales.ts';
import { daysRange, departmentOptions, hoursRange } from './landing.ts';

const NBSP = '\u00a0';
/** A sentence of the tests, with its spaces made the ones that do not break. */
const unbroken = (text: string): string => text.replaceAll(' ', NBSP);

test('a delivery time is its days, a space and the word, in every language', () => {
  assert.equal(daysRange([2, 4], 'días'), '2–4 días');
  assert.equal(daysRange([15, 20], '天'), '15–20 天');
});

test('the opening hours are written as Carinova’s page writes them in each language', () => {
  const day = { opens: '08:00', closes: '17:00' };
  assert.equal(hoursRange('es', day), unbroken('8:00 a.m. – 5:00 p.m.'));
  assert.equal(hoursRange('en', day), unbroken('8:00 a.m. – 5:00 p.m.'));
  assert.equal(hoursRange('fr', day), unbroken('8 h – 17 h'));
  assert.equal(hoursRange('pt', day), unbroken('8h – 17h'));
  assert.equal(hoursRange('zh', day), unbroken('上午 8:00 – 下午 5:00'));
  // The two languages the page did not have.
  assert.equal(hoursRange('ru', day), '8:00–17:00');
  assert.equal(hoursRange('ar', day), unbroken('8:00 ص – 5:00 م'));
});

test('…with their minutes when a place opens or closes at half past', () => {
  const day = { opens: '08:30', closes: '12:00' };
  assert.equal(hoursRange('es', day), unbroken('8:30 a.m. – 12:00 p.m.'));
  assert.equal(hoursRange('fr', day), unbroken('8 h 30 – 12 h'));
  assert.equal(hoursRange('pt', day), unbroken('8h30 – 12h'));
  assert.equal(hoursRange('ru', day), '8:30–12:00');
});

test('the hours never break in two lines', () => {
  for (const locale of ['es', 'en', 'fr', 'pt', 'zh', 'ar'] as const) {
    assert.ok(!hoursRange(locale, { opens: '08:00', closes: '17:00' }).includes(' '), locale);
  }
});

test('a form lists each department with its two letters, the two regions by their name in the language', () => {
  const options = departmentOptions({ north: 'North Caribbean Coast', south: 'South Caribbean Coast' });
  assert.equal(options.length, DEPARTMENTS.length);
  assert.deepEqual(options[0], { value: 'Boaco', label: 'Boaco (BO)' });
  assert.deepEqual(
    options.find((option) => option.value === 'Managua'),
    { value: 'Managua', label: 'Managua (MG)' }
  );
  // What the scripts and the messages use stays the same in every language.
  assert.deepEqual(options.at(-2), { value: 'Costa Caribe Norte', label: 'North Caribbean Coast (CN)' });
  assert.deepEqual(options.at(-1), { value: 'Costa Caribe Sur', label: 'South Caribbean Coast (CS)' });
});

test('an estimate writes its numbers the way the language of the page does', () => {
  const spanish = quoteWriter(LOCALE_INFO.es.intl);
  assert.equal(spanish.amount(32.5), '32.50');
  assert.equal(spanish.number(1728), '1,728');
  assert.equal(spanish.number(4.40925), '4.409');
  assert.equal(quoteWriter(LOCALE_INFO.en.intl).amount(1234.5), '1,234.50');
  assert.equal(quoteWriter(LOCALE_INFO.fr.intl).amount(32.5), '32,50');
  assert.equal(quoteWriter(LOCALE_INFO.pt.intl).amount(32.5), '32,50');
  assert.equal(quoteWriter(LOCALE_INFO.pt.intl).number(1728), '1.728');
  assert.equal(quoteWriter(LOCALE_INFO.zh.intl).amount(32.5), '32.50');
  // Arabic keeps the digits the prices of the page are written with.
  assert.match(quoteWriter(LOCALE_INFO.ar.intl).amount(32.5), /^32[.,٫]50$/);
});

test('…and the line that says how it was worked out', () => {
  const text = {
    complete: 'Completá los datos',
    expressPending: 'Por cotizar',
    formulaWeight: '{weight} lb × US${rate} por lb',
    formulaMinimum: 'mínimo',
    formulaUnit: '{quantity} × US${rate} por unidad',
    formulaVolume: '{volume} pies³',
  };
  const input = { mode: 'air', service: 'standard', category: 'general', quantity: '1', weight: '5', weightUnit: 'lb' };
  const quote = {
    valid: true,
    pending: false,
    kind: 'weight',
    total: 32.5,
    rate: 6.5,
    billableWeight: 5,
    rawWeight: 5,
  };
  const french = quoteWriter(LOCALE_INFO.fr.intl);
  assert.equal(french.formulaText(input as never, quote as never, text), '5 lb × US$6,50 por lb');
  assert.equal(
    quoteWriter(LOCALE_INFO.es.intl).formulaText(
      input as never,
      { ...quote, rawWeight: 0.4, billableWeight: 1 } as never,
      text
    ),
    '1 lb × US$6.50 por lb · mínimo'
  );
  assert.equal(french.formulaText(input as never, { ...quote, valid: false } as never, text), 'Completá los datos');
});
