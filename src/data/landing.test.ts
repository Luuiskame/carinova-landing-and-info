// What the home page takes from several places agrees: the lists and their icons, the stores and
// their logos, and the words each language has for the stores, the categories and the notices.
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { test } from 'node:test';
import { ICONS } from '../components/landing/icons.ts';
import { LOCALES, type Locale } from '../i18n/locales.ts';
import { ui as uiAr } from '../i18n/ui/ar.ts';
import { ui as uiEn } from '../i18n/ui/en.ts';
import { ui as uiEs } from '../i18n/ui/es.ts';
import { ui as uiFr } from '../i18n/ui/fr.ts';
import { ui as uiPt } from '../i18n/ui/pt.ts';
import { ui as uiRu } from '../i18n/ui/ru.ts';
import { ui as uiZh } from '../i18n/ui/zh.ts';
import { ARTICLE_RULES } from './articles.ts';
import { RATES, RESTRICTED_ITEMS } from './carinova.ts';
import { FEATURED_STORES, LANDING_LIMITS, LOGO_SCALE, RESTRICTED_ICONS, STORE_DIRECTORY } from './landing.ts';
import { NOTICES } from './notices.ts';

const UI = { es: uiEs, en: uiEn, fr: uiFr, pt: uiPt, zh: uiZh, ru: uiRu, ar: uiAr } satisfies Record<Locale, unknown>;
/** An icon of the home page's sprite, by the name the data gives it ("cart" is "i-cart" there). */
const isIcon = (name: string): boolean => `i-${name}` in ICONS;
const sorted = (items: Iterable<string>): Array<string> => [...items].sort();

const directoryStores = STORE_DIRECTORY.flatMap((category) => category.stores);
/**
 * The kinds of article the search names with a word of `landing.cat`. A device (a phone, a
 * console…) is not one of them: the answer calls it what the price list calls it.
 */
const namedKinds = ARTICLE_RULES.filter((rule) => !rule.electronic).map((rule) => rule.id);
const logos = readdirSync(new URL('../assets/images/tiendas/', import.meta.url));

test('each item of the two lists of the home page has its icon', () => {
  for (const list of ['prohibited', 'seaOnly'] as const) {
    assert.equal(
      RESTRICTED_ICONS[list].length,
      RESTRICTED_ITEMS[list].items.length,
      `RESTRICTED_ICONS.${list} (src/data/landing.ts) needs one icon per item of RESTRICTED_ITEMS.${list}, in its order`
    );
    for (const icon of RESTRICTED_ICONS[list]) assert.ok(isIcon(icon), `"${icon}" is not an icon of the home page`);
  }
});

test('the question about what is not carried names what the two lists hold', () => {
  // Its answer (`landing.faq`, "¿Qué artículos no transportan?") says the lists in a sentence, in
  // seven languages. When a list changes, rewrite that answer in each of them, then these numbers.
  assert.equal(RESTRICTED_ITEMS.prohibited.items.length, 7);
  assert.equal(RESTRICTED_ITEMS.seaOnly.items.length, 5);
});

test('Xbox and PlayStation cost the same: the page says both in one price', () => {
  const price = (id: string) => RATES.electronics.items.find((item) => item.id === id)?.price;
  assert.equal(typeof price('xbox'), 'number');
  assert.equal(price('xbox'), price('playstation'));
});

test('the limits of the forms are numbers a form can check', () => {
  const [shortest, longest] = LANDING_LIMITS.phoneDigits;
  assert.ok(LANDING_LIMITS.links >= 1 && LANDING_LIMITS.quantity >= 1 && LANDING_LIMITS.urlLength >= 256);
  assert.ok(shortest >= 7 && shortest < longest && longest <= 15, 'a phone number has at most 15 digits (E.164)');
});

test('the directory: ten categories of ten stores, each store once, each with a site of its own', () => {
  assert.equal(STORE_DIRECTORY.length, 10);
  assert.equal(new Set(STORE_DIRECTORY.map((category) => category.id)).size, STORE_DIRECTORY.length);
  for (const category of STORE_DIRECTORY) {
    assert.equal(category.stores.length, 10, category.id);
    assert.ok(isIcon(category.icon), `category "${category.id}": "${category.icon}" is not an icon of the home page`);
  }
  assert.equal(
    new Set(directoryStores.map((store) => store.id)).size,
    directoryStores.length,
    'a store is listed twice'
  );
  for (const store of [...directoryStores, ...FEATURED_STORES]) {
    assert.match(store.id, /^[a-z0-9]+$/, store.name);
    assert.equal(new URL(store.url).protocol, 'https:', store.name);
  }
});

test('the stores of the home page are stores of the directory, with the same name and site', () => {
  const byId = new Map(directoryStores.map((store) => [store.id, store]));
  assert.equal(new Set(FEATURED_STORES.map((store) => store.id)).size, FEATURED_STORES.length);
  for (const store of FEATURED_STORES) {
    assert.deepEqual(
      { name: byId.get(store.id)?.name, url: byId.get(store.id)?.url },
      { name: store.name, url: store.url },
      store.id
    );
    assert.ok(isIcon(store.icon), `"${store.icon}" is not an icon of the home page`);
  }
});

test('every store has its logo, and every logo its store', () => {
  // One file per store in src/assets/images/tiendas, named after the store's id.
  assert.deepEqual(
    sorted(logos.map((file) => file.replace(/\.(svg|webp)$/, ''))),
    sorted(directoryStores.map((store) => store.id))
  );
  for (const id of Object.keys(LOGO_SCALE)) {
    assert.ok(
      directoryStores.some((store) => store.id === id),
      `LOGO_SCALE names "${id}", which is not a store`
    );
    assert.ok(LOGO_SCALE[id] > 0 && LOGO_SCALE[id] <= 1.5, `LOGO_SCALE.${id}`);
  }
});

test('the notices: each has its title and its text, and their ids are not repeated', () => {
  assert.equal(new Set(NOTICES.map((notice) => notice.id)).size, NOTICES.length);
  for (const notice of NOTICES) {
    assert.ok(notice.title in uiEs.landing.ann, `${notice.id}: no "${notice.title}" in landing.ann`);
    assert.ok(notice.text in uiEs.landing.ann, `${notice.id}: no "${notice.text}" in landing.ann`);
  }
  // And nothing in `landing.ann` that no notice says.
  const said = new Set(NOTICES.flatMap((notice) => [notice.title, notice.text]));
  assert.deepEqual(
    Object.keys(uiEs.landing.ann).filter((key) => !said.has(key)),
    []
  );
});

test('the names of `landing.cat` are the kinds of article of the search and the categories of the directory', () => {
  const named = new Set([...namedKinds, ...STORE_DIRECTORY.map((category) => category.id)]);
  assert.deepEqual(sorted(Object.keys(uiEs.landing.cat)), sorted(named));
});

test('a device of the search is a device with a price', () => {
  for (const rule of ARTICLE_RULES.filter((item) => item.electronic)) {
    assert.ok(
      RATES.electronics.items.some((item) => item.id === rule.electronic),
      `${rule.id}: "${rule.electronic}" is not a device of RATES.electronics`
    );
  }
});

test('`landing.store` says what each store of the home page is, and nothing else', () => {
  assert.deepEqual(sorted(Object.keys(uiEs.landing.store)), sorted(FEATURED_STORES.map((store) => store.id)));
});

for (const locale of LOCALES) {
  const { landing } = UI[locale];
  const words = (group: Record<string, string>, keys: Array<string>, what: string) => {
    for (const key of keys) assert.ok(group[key]?.trim(), `${locale}: ${what} "${key}" has no words`);
  };

  test(`every store, category, kind of article and notice has words (${locale})`, () => {
    words(
      landing.store,
      FEATURED_STORES.map((store) => store.id),
      'the store'
    );
    words(landing.cat, [...namedKinds, ...STORE_DIRECTORY.map((category) => category.id)], 'the category');
    words(
      landing.ann,
      NOTICES.flatMap((notice) => [notice.title, notice.text]),
      'the notice'
    );
  });

  test(`the questions of the home page are nine, each with its answer (${locale})`, () => {
    assert.equal(landing.faq.length, 9);
    for (const { q, a } of landing.faq) assert.ok(q.trim() && a.trim());
  });

  test(`no sentence of the home page is left with a blank to fill that nothing fills (${locale})`, () => {
    // The blanks the page fills ({amount}, {date}…) are named in the Spanish; a language may not
    // invent one.
    const blanks = (text: string) => sorted(new Set(text.match(/\{[a-zA-Z]+\}/g) ?? []));
    const walk = (mine: unknown, spanish: unknown, path: string) => {
      if (typeof mine === 'string') {
        assert.deepEqual(blanks(mine), blanks(String(spanish)), `${locale}: ${path}`);
        assert.doesNotMatch(mine, /undefined|\[object|NaN/, `${locale}: ${path}`);
      } else if (mine && typeof mine === 'object') {
        for (const [key, value] of Object.entries(mine))
          walk(value, (spanish as Record<string, unknown>)?.[key], `${path}.${key}`);
      }
    };
    walk(landing, uiEs.landing, 'landing');
  });
}
