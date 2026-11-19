// The article search of the home page: Carinova's catalogue first, the lists of what cannot be
// brought for what it does not know, and general merchandise for any other word, as Carinova's
// page answers.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ACCESSORY_WORDS,
  ARTICLE_RULES,
  ARTICLE_WORDS,
  BUNDLE_WORDS,
  DEVICE_BUNDLE,
  DEVICE_EXTRAS,
} from '../data/articles.ts';
import { RATES } from '../data/carinova.ts';
import { content } from '../data/content.ts';
import { LOCALES, type Locale } from '../i18n/locales.ts';
import { ui as uiAr } from '../i18n/ui/ar.ts';
import { ui as uiEn } from '../i18n/ui/en.ts';
import { ui as uiEs } from '../i18n/ui/es.ts';
import { ui as uiFr } from '../i18n/ui/fr.ts';
import { ui as uiPt } from '../i18n/ui/pt.ts';
import { ui as uiRu } from '../i18n/ui/ru.ts';
import { ui as uiZh } from '../i18n/ui/zh.ts';
import { classifyArticle, compileCatalogue, lookupCatalogue, normalizeArticle } from './articles.ts';

const UI = { es: uiEs, en: uiEn, fr: uiFr, pt: uiPt, zh: uiZh, ru: uiRu, ar: uiAr } satisfies Record<Locale, unknown>;

const catalogue = compileCatalogue({
  rules: ARTICLE_RULES,
  extras: DEVICE_EXTRAS,
  bundle: DEVICE_BUNDLE,
  words: ARTICLE_WORDS,
  accessoryWords: ACCESSORY_WORDS,
  bundleWords: BUNDLE_WORDS,
});
/** The lists of a language, from the strictest to the mildest: how the page hands them over. */
const groupsOf = (locale: Locale) => {
  const { RESTRICTED_ITEMS } = content(locale);
  return (['prohibited', 'notYet', 'seaOnly'] as const).map((id) => ({ id, ...RESTRICTED_ITEMS[id] }));
};
const answer = (query: string, locale: Locale = 'es') => classifyArticle(query, catalogue, groupsOf(locale));
const kind = (query: string, locale: Locale = 'es') => {
  const { status, id, item, electronic } = answer(query, locale);
  return [status, electronic ?? (id || item || '')].join(' ');
};

test('a search is compared without accents, capitals or punctuation', () => {
  assert.equal(normalizeArticle('  ¡Batería de LITIO (18650)!  '), 'bateria de litio 18650');
  assert.equal(normalizeArticle("Victoria's Secret / body-splash"), 'victoria s secret body splash');
});

test('the catalogue is whole: every rule has words, a way to travel and, if it is a device, its price', () => {
  const ids = ARTICLE_RULES.map((rule) => rule.id);
  assert.equal(new Set(ids).size, ids.length, 'a rule id is repeated');
  const devices = RATES.electronics.items.map((item) => item.id);
  for (const rule of ARTICLE_RULES) {
    assert.ok(rule.terms || rule.cjk, rule.id);
    assert.equal(rule.status === 'air', Boolean(rule.device), `${rule.id}: only devices travel by air alone`);
    if (rule.device)
      assert.ok(devices.includes(rule.electronic ?? ''), `${rule.id}: ${rule.electronic} has no price in RATES`);
  }
  // Every device with a price per unit can be found.
  assert.deepEqual(
    ARTICLE_RULES.filter((rule) => rule.device)
      .map((rule) => rule.electronic)
      .sort(),
    [...devices].sort()
  );
  // The extra words belong to rules that exist.
  for (const id of Object.keys(ARTICLE_WORDS)) assert.ok(ids.includes(id), `ARTICLE_WORDS.${id} names no rule`);
});

test('every kind of article has its name in every language', () => {
  for (const locale of LOCALES) {
    const names: Record<string, string> = UI[locale].landing.cat;
    for (const rule of ARTICLE_RULES) {
      if (!rule.device) assert.ok(names[rule.id], `landing.cat.${rule.id} (${locale})`);
    }
    // An accessory of a device is one of these two kinds.
    assert.ok(names.techaccessories && names.games, locale);
  }
});

test('what the page offers as examples gets the answer it is there to show, in every language', () => {
  for (const locale of LOCALES) {
    const t = UI[locale].landing;
    assert.equal(answer(t.examplePerfume, locale).status, 'sea', `${locale}: ${t.examplePerfume}`);
    assert.equal(answer(t.examplePhone, locale).status, 'air', `${locale}: ${t.examplePhone}`);
    assert.equal(answer(t.exampleSofa, locale).status, 'volume', `${locale}: ${t.exampleSofa}`);
    assert.equal(answer(t.exampleDrone, locale).status, 'prohibited', `${locale}: ${t.exampleDrone}`);
  }
});

test("Carinova's catalogue answers: what does not travel, what goes by sea, devices, volume, general merchandise", () => {
  const expected: Record<string, string> = {
    Perfume: 'sea perfumes',
    'Batería de litio': 'sea lithium',
    'power bank': 'sea lithium',
    'alcohol en gel': 'sea flammables',
    'bicicleta eléctrica': 'sea emobility',
    Dron: 'prohibited drones',
    'drone DJI Mini': 'prohibited drones',
    vape: 'prohibited vapes',
    pistola: 'prohibited weapons',
    'walkie talkie': 'prohibited radio',
    'fuegos artificiales': 'prohibited explosives',
    ron: 'prohibited alcohol',
    Celular: 'air celular',
    'iPhone 15 Pro': 'air celular',
    tablet: 'air tablet',
    laptop: 'air laptop',
    xbox: 'air xbox',
    'PlayStation 5': 'air playstation',
    Sofá: 'volume furniture',
    'mesa de comedor': 'volume furniture',
    refrigeradora: 'volume appliances',
    'zapatos Nike': 'allowed clothing',
    vitaminas: 'allowed supplements',
    guitarra: 'allowed music',
    'pilas AA': 'allowed alkaline',
    libro: 'allowed books',
    medicamentos: 'review medicines',
    // English, Portuguese, French and Chinese are in the same catalogue.
    'running shoes': 'allowed clothing',
    beer: 'prohibited alcohol',
    手机: 'air celular',
    香水: 'sea perfumes',
    沙发: 'volume furniture',
  };
  for (const [query, result] of Object.entries(expected)) assert.equal(kind(query), result, query);
});

test('what only looks like something else is not taken for it', () => {
  // A water pistol is a toy, a kitchen set is not a battery, a board game is not a table.
  assert.equal(kind('pistola de agua'), 'allowed toys');
  assert.equal(kind('batería de cocina'), 'allowed home');
  assert.equal(kind('juego de mesa'), 'allowed toys');
  assert.equal(kind('transmisor bluetooth'), 'allowed electronics');
  // What goes with a device is an accessory; a device that comes with one is still the device.
  assert.equal(kind('funda para iPhone'), 'allowed techaccessories');
  assert.equal(kind('cargador de laptop'), 'allowed techaccessories');
  assert.equal(kind('juego de PS5'), 'allowed games');
  assert.equal(kind('control de xbox'), 'allowed games');
  assert.equal(kind('iPhone con funda'), 'air celular');
  assert.equal(kind('iphone with case', 'en'), 'air celular');
});

test('what the catalogue does not know is looked up in the lists, in the language of the page', () => {
  // Cars, motorcycles and heavy machinery are on no rule of the catalogue: the list answers.
  assert.equal(kind('carro'), 'notYet Carros');
  assert.equal(kind('tractor'), 'notYet Maquinaria pesada');
  // An electric motorcycle is a motorcycle: not authorised yet, whatever it runs on.
  assert.equal(kind('moto eléctrica'), 'notYet Motos');
  assert.equal(kind('electric motorcycle', 'en'), 'notYet Motorcycles');
  // Russian and Arabic: the catalogue has a few words of theirs, the lists have the rest.
  assert.equal(answer('духи', 'ru').status, 'sea');
  assert.equal(answer('дрон', 'ru').status, 'prohibited');
  assert.equal(answer('пиво', 'ru').status, 'prohibited');
  assert.equal(kind('телефон', 'ru'), 'air celular');
  assert.equal(kind('телефон с чехлом', 'ru'), 'air celular');
  assert.equal(kind('диван', 'ru'), 'volume furniture');
  assert.equal(answer('عطر', 'ar').status, 'sea');
  assert.equal(answer('سيارة', 'ar').status, 'notYet');
  assert.equal(kind('هاتف', 'ar'), 'air celular');
  assert.equal(kind('غطاء هاتف', 'ar'), 'allowed techaccessories');
  assert.equal(kind('هاتف مع غطاء', 'ar'), 'air celular');
  assert.equal(kind('أريكة', 'ar'), 'volume furniture');
});

test('a word it does not know is general merchandise, as in Carinova’s page; anything less is for the team', () => {
  for (const query of ['qzqzqz', 'cosa rara', 'joyas', 'штука', '东西']) {
    const result = answer(query);
    assert.deepEqual([result.status, result.known, result.id], ['allowed', false, 'general'], `"${query}"`);
  }
  // Not a word: a number, one letter, punctuation, nothing.
  for (const query of ['12345', 'a', '', '   ', '???']) {
    const result = answer(query);
    assert.deepEqual([result.status, result.known, result.id], ['review', false, ''], `"${query}"`);
  }
  // What the catalogue sets aside on purpose is not picked up by a list for one of its words.
  assert.equal(lookupCatalogue('cerveza sin alcohol', catalogue).excluded, true);
  assert.deepEqual([answer('cerveza sin alcohol').status, answer('cerveza sin alcohol').known], ['allowed', false]);
  assert.equal(answer('non alcoholic beer', 'en').status, 'allowed');
  // A car seat for a baby and parts for a car are not a car.
  assert.equal(kind('asiento de carro para bebé'), 'allowed baby');
  assert.equal(kind('repuestos para carro'), 'allowed tools');
});
