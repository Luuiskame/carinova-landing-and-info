// The article search of the home page: Carinova's catalogue first, then the lists of what cannot be
// brought; what neither knows is for the team to look at, and is never said to be allowed (D-128).
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
  return [status, electronic ?? (id || item || '')].join(' ').trim();
};
/** Each search of a table gets the answer beside it. */
const expectAll = (expected: Record<string, string>, locale: Locale = 'es') => {
  for (const [query, result] of Object.entries(expected)) assert.equal(kind(query, locale), result, `"${query}"`);
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

test('the words of a rule are written for every browser: no look-behind, which old iPhones cannot read', () => {
  for (const rule of ARTICLE_RULES) {
    for (const words of [rule.terms, rule.cjk, rule.apart, rule.unless]) {
      assert.doesNotMatch(words ?? '', /\(\?<[=!]/, `${rule.id} uses a look-behind`);
    }
  }
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
  expectAll({
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
  });
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

test('what the developer saw on 2026-11-21: alcohol and a crane are not answered as something that travels', () => {
  expectAll({
    alcohol: 'prohibited alcohol',
    Alcohol: 'prohibited alcohol',
    'botella de alcohol': 'prohibited alcohol',
    grúa: 'notYet machinery',
    grua: 'notYet machinery',
    'una grúa': 'notYet machinery',
    'camión grúa': 'notYet vehicles',
  });
  assert.equal(kind('crane', 'en'), 'notYet machinery');
  assert.equal(kind('alcohol', 'en'), 'prohibited alcohol');
  assert.equal(kind('alcool', 'fr'), 'prohibited alcohol');
  assert.equal(kind('álcool', 'pt'), 'prohibited alcohol');
  assert.equal(answer('алкоголь', 'ru').status, 'prohibited');
  assert.equal(answer('كحول', 'ar').status, 'prohibited');
  assert.equal(answer('رافعة', 'ar').status, 'notYet');
  assert.equal(kind('起重机', 'zh'), 'notYet machinery');
});

test('a word with two meanings is read as the stricter one, until the text says which it is', () => {
  expectAll({
    // The drink, by its names, its brands and how people misspell it.
    'bebidas alcohólicas': 'prohibited alcohol',
    guaro: 'prohibited alcohol',
    trago: 'prohibited alcohol',
    'Flor de Caña': 'prohibited alcohol',
    wisky: 'prohibited alcohol',
    champaña: 'prohibited alcohol',
    'caja de cervezas': 'prohibited alcohol',
    // The alcohol of the first-aid kit is a flammable: by sea.
    'alcohol isopropílico': 'sea flammables',
    'alcohol etílico': 'sea flammables',
    'alcohol 70%': 'sea flammables',
    'alcohol para heridas': 'sea flammables',
    'gel de alcohol': 'sea flammables',
    'rubbing alcohol': 'sea flammables',
    // Without alcohol, it is neither.
    'cerveza sin alcohol': 'allowed packagedfood',
    'enjuague bucal sin alcohol': 'allowed beauty',
    'copa de vino': 'allowed home',
    // "Bomba" is fireworks in Nicaragua, and also a pump.
    bomba: 'prohibited explosives',
    'bomba de agua': 'allowed tools',
    'bomba de baño': 'allowed beauty',
    granada: 'prohibited explosives',
    'jugo de granada': 'allowed packagedfood',
  });
  // In Chinese 酒精 is the alcohol of the first-aid kit and 酒 is the drink.
  assert.equal(kind('酒精', 'zh'), 'sea flammables');
  assert.equal(kind('白酒', 'zh'), 'prohibited alcohol');
});

test('cars, motorcycles and heavy machinery are not authorised yet, whatever they are called', () => {
  expectAll({
    carro: 'notYet vehicles',
    'carro usado': 'notYet vehicles',
    'un carro Toyota': 'notYet vehicles',
    vehículo: 'notYet vehicles',
    camioneta: 'notYet vehicles',
    camión: 'notYet vehicles',
    bus: 'notYet vehicles',
    microbús: 'notYet vehicles',
    cuadraciclo: 'notYet vehicles',
    'envío de carro': 'notYet vehicles',
    'el precio de traer una camioneta': 'notYet vehicles',
    moto: 'notYet motorcycles',
    motocicleta: 'notYet motorcycles',
    // An electric motorcycle is a motorcycle: not authorised yet, whatever it runs on.
    'moto eléctrica': 'notYet motorcycles',
    caponera: 'notYet motorcycles',
    excavadora: 'notYet machinery',
    retroexcavadora: 'notYet machinery',
    bulldozer: 'notYet machinery',
    tractor: 'notYet machinery',
    montacargas: 'notYet machinery',
    'maquinaria agrícola': 'notYet machinery',
    'mezcladora de concreto': 'notYet machinery',
  });
  assert.equal(kind('electric motorcycle', 'en'), 'notYet motorcycles');
  assert.equal(kind('used car', 'en'), 'notYet vehicles');
  assert.equal(kind('forklift', 'en'), 'notYet machinery');
  assert.equal(kind('voiture', 'fr'), 'notYet vehicles');
  assert.equal(kind('caminhão', 'pt'), 'notYet vehicles');
  assert.equal(kind('汽车', 'zh'), 'notYet vehicles');
  // Russian and Arabic: the lists answer in the language of the page.
  assert.equal(answer('автомобиль', 'ru').status, 'notYet');
  assert.equal(answer('سيارة', 'ar').status, 'notYet');
});

test('a part, an accessory or a toy of a vehicle is another article', () => {
  expectAll({
    'repuestos para carro': 'allowed tools',
    'accesorios para carro': 'allowed tools',
    'llantas para carro': 'allowed tools',
    'llantas carro': 'allowed tools',
    'radio para carro': 'allowed electronics',
    'asiento de carro para bebé': 'allowed baby',
    'carro de bebé': 'allowed baby',
    'batería de carro': 'review vehiclebattery',
    'casco para moto': 'allowed sports',
    'guantes de moto': 'allowed clothing',
    'carro de juguete': 'allowed toys',
    'carro a control remoto': 'allowed toys',
    'tractor de juguete': 'allowed toys',
    'grúa de juguete': 'allowed toys',
    // A Motorola phone is a "moto" too.
    'moto g54': 'air celular',
    motorola: 'air celular',
    motosierra: 'allowed tools',
    'gato hidráulico': 'allowed tools',
    // Something for a car that the catalogue does not name is for the team: not a car, and not "allowed".
    'tapicería para carro': 'review',
    'grúa para motor': 'review',
  });
  assert.equal(kind('car charger', 'en'), 'allowed electronics');
  assert.equal(kind('car seat', 'en'), 'allowed baby');
  assert.equal(kind('toy car', 'en'), 'allowed toys');
  assert.equal(kind('汽车配件', 'zh'), 'allowed tools');
});

test('what is set apart does not hide the rest of the text', () => {
  expectAll({
    'alcohol en gel y una botella de ron': 'prohibited alcohol',
    'pistola de agua y una pistola 9 mm': 'prohibited weapons',
    'repuestos para carro y una camioneta': 'notYet vehicles',
    'collar para perro y un perro': 'review animals',
    // The stricter answer comes first when a text names two articles.
    'ropa y un vape': 'prohibited vapes',
    'perfume y whisky': 'prohibited alcohol',
    'zapatos y un rifle': 'prohibited weapons',
    'una moto con su batería de litio': 'notYet motorcycles',
  });
});

test('an animal that is alive is for the team; what is for an animal is general merchandise', () => {
  expectAll({
    perro: 'review animals',
    gato: 'review animals',
    'un cachorro': 'review animals',
    loro: 'review animals',
    'perro con collar': 'review animals',
    'animales vivos': 'review animals',
    'comida para perro': 'allowed pets',

    'arnés para perro grande': 'allowed pets',
    'cama para gato': 'allowed pets',
    'perro de peluche': 'allowed toys',
    'lentes ojo de gato': 'allowed accessories',
    'gallo pinto': 'review',
  });
  // Written without "para": still something for a dog, whichever kind the catalogue calls it.
  assert.equal(answer('collar perro').status, 'allowed');
  assert.equal(kind('puppy', 'en'), 'review animals');
  assert.equal(kind('dog bed', 'en'), 'allowed pets');
});

test('weapons, explosives and what is regulated are caught by more of their names', () => {
  expectAll({
    espada: 'prohibited weapons',
    katana: 'prohibited weapons',
    'arco y flechas': 'prohibited weapons',
    resortera: 'prohibited weapons',
    'espada de juguete': 'allowed toys',
    'pistola nerf': 'allowed toys',
    cuchillo: 'allowed home',
    triquitraques: 'prohibited explosives',
    droga: 'prohibited drugs',
    'chaleco antibalas': 'review regulated',
    'uniforme militar': 'review regulated',
    'cenizas humanas': 'review regulated',
    'material radiactivo': 'review regulated',
    'billetes falsos': 'review regulated',
    joyas: 'review valuables',
  });
  // A camera that sees at night is a camera; a planta eléctrica is a generator, not a plant.
  assert.equal(kind('cámara con visión nocturna'), 'allowed electronics');
  assert.equal(kind('planta eléctrica'), 'allowed tools');
});

test('what the lists name and the catalogue does not is answered from the lists, in the language of the page', () => {
  // A whole aircraft is on the list of what is not carried.
  assert.equal(kind('avioneta'), 'prohibited Accesorios para aeronaves');
  assert.equal(kind('helicóptero'), 'prohibited Accesorios para aeronaves');
  // Russian and Arabic: the catalogue has a few words of theirs, the lists have the rest.
  assert.equal(answer('духи', 'ru').status, 'sea');
  assert.equal(answer('дрон', 'ru').status, 'prohibited');
  assert.equal(answer('пиво', 'ru').status, 'prohibited');
  assert.equal(kind('телефон', 'ru'), 'air celular');
  assert.equal(kind('телефон с чехлом', 'ru'), 'air celular');
  assert.equal(kind('диван', 'ru'), 'volume furniture');
  assert.equal(answer('عطر', 'ar').status, 'sea');
  assert.equal(kind('هاتف', 'ar'), 'air celular');
  assert.equal(kind('غطاء هاتف', 'ar'), 'allowed techaccessories');
  assert.equal(kind('هاتف مع غطاء', 'ar'), 'air celular');
  assert.equal(kind('أريكة', 'ar'), 'volume furniture');
});

test('what nobody has named is for the team to look at: it is never said to be allowed', () => {
  const unknown = [
    'qzqzqz',
    'cosa rara',
    'штука',
    '东西',
    // What made the old answer dangerous: it said "by air or by sea" of all of these.
    'tigre',
    'lancha',
    'yate',
    'jet ski',
    'machete',
    'navaja',
    'esposas',
    'toyota hilux',
    'cabezal',
    'fertilizante',
    // Not a word at all.
    '12345',
    'a',
    '???',
  ];
  for (const query of unknown) {
    const result = answer(query);
    assert.deepEqual([result.status, result.known, result.id], ['review', false, ''], `"${query}"`);
  }
  // What the catalogue sets aside on purpose is not picked up by a list for one of its words.
  assert.equal(lookupCatalogue('vino sin alcohol', catalogue).excluded, true);
  assert.deepEqual([answer('vino sin alcohol').status, answer('vino sin alcohol').known], ['review', false]);
  assert.equal(lookupCatalogue('tapicería para carro', catalogue).excluded, true);
  // Whatever is typed, "allowed" comes only with the name of a kind the catalogue has.
  const named = new Set(ARTICLE_RULES.map((rule) => rule.id));
  for (const query of [...unknown, 'ropa', 'café', 'televisor', 'termómetro', 'perfume', 'carro', 'alcohol']) {
    const result = answer(query);
    if (result.status === 'allowed' || result.status === 'volume' || result.status === 'air') {
      assert.ok(result.known && named.has(result.id), `"${query}" is ${result.status} without a kind`);
    }
  }
});

test('everyday purchases are still recognised', () => {
  expectAll({
    termómetro: 'allowed healthcare',
    'silla de ruedas': 'allowed healthcare',
    bastón: 'allowed healthcare',
    linterna: 'allowed electronics',
    'panel solar': 'allowed electronics',
    hamaca: 'allowed sports',
    impermeable: 'allowed clothing',
    lonchera: 'allowed home',
    'árbol de navidad': 'allowed home',
    piñata: 'allowed home',
    manguera: 'allowed tools',
    escalera: 'allowed tools',
    tijeras: 'allowed books',
    frijoles: 'allowed packagedfood',
    vinagre: 'allowed packagedfood',
    horno: 'volume appliances',
  });
});
