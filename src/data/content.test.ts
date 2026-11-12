import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BUSINESS_VOLUMES } from './business.ts';
import { sentence } from './carinova.ts';
import { content } from './content.ts';
import { faqGroups as faqEn } from './en/faq.ts';
import { faqGroups as faqEs, featuredOf } from './faq.ts';

const es = content('es');
const en = content('en');
const link = (path: string, text: string) => `<a href="${path}">${text}</a>`;

/** Ids, in order: the two languages must list the same things. */
const ids = <T extends { id: string }>(items: Array<T>) => items.map((item) => item.id);

test('English has every piece of data Spanish has', () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(es).sort());
  assert.deepEqual(ids(en.SERVICES), ids(es.SERVICES));
  assert.deepEqual(ids(en.SERVICE_AXES), ids(es.SERVICE_AXES));
  assert.deepEqual(ids(en.ACCOUNT_PARTS), ids(es.ACCOUNT_PARTS));
  assert.deepEqual(ids(en.SHOPPING_EXAMPLES), ids(es.SHOPPING_EXAMPLES));
  assert.deepEqual(ids(en.STORES), ids(es.STORES));
  assert.deepEqual(ids(en.BRANCHES), ids(es.BRANCHES));
  assert.deepEqual(ids(en.RECEPTION_POINTS), ids(es.RECEPTION_POINTS));
  assert.deepEqual(ids(en.RATES.electronics.items), ids(es.RATES.electronics.items));
  assert.equal(en.PROCESS_STEPS.length, es.PROCESS_STEPS.length);
  assert.deepEqual(
    en.SIGNUP_COUNTRIES.map((country) => country.code),
    es.SIGNUP_COUNTRIES.map((country) => country.code)
  );

  // Lists that are translated line by line keep their length.
  assert.equal(en.RATES.notes.length, es.RATES.notes.length);
  assert.equal(en.MIAMI_ADDRESS.notes.length, es.MIAMI_ADDRESS.notes.length);
  for (const kind of ['prohibited', 'noAir'] as const) {
    assert.equal(en.RESTRICTED_ITEMS[kind].items.length, es.RESTRICTED_ITEMS[kind].items.length, kind);
  }
  es.SERVICES.forEach((service, index) => {
    assert.equal(en.SERVICES[index].facts.length, service.facts.length, service.id);
    assert.equal(en.SERVICES[index].link?.path, service.link?.path, service.id);
    assert.equal(Boolean(en.SERVICES[index].whatsappText), Boolean(service.whatsappText), service.id);
  });
  es.PROCESS_STEPS.forEach((step, index) => {
    assert.equal(en.PROCESS_STEPS[index].details.length, step.details.length, step.title);
    assert.equal(en.PROCESS_STEPS[index].link.path, step.link.path, step.title);
  });
  es.STORES.forEach((store, index) => {
    assert.equal(en.STORES[index].categories.length, store.categories.length, store.id);
  });
});

test('the facts are the same in both languages: only the words change', () => {
  const facts = ({ air, sea, electronics, roundUpToPound }: typeof es.RATES) => ({
    roundUpToPound,
    air: [air.id, air.pricePerLb, air.minLb, air.transitDays],
    sea: [sea.id, sea.pricePerLb, sea.pricePerCubicFoot, sea.minLb, sea.transitDays],
    electronics: electronics.items.map((item) => [item.id, item.price, item.icon]),
  });
  assert.deepEqual(facts(en.RATES), facts(es.RATES));
  assert.equal(en.RATES.air.transit, '2 to 4 days');
  assert.equal(es.RATES.air.transit, '2 a 4 días');

  es.STORES.forEach((store, index) => {
    const { name, domain, url } = en.STORES[index];
    assert.deepEqual([name, domain, url], [store.name, store.domain, store.url]);
    assert.match(url, /^https:\/\//);
    assert.ok(url.includes(domain.replace(/^www\./, '')), `${store.id}: the card shows the address its button opens`);
  });

  es.BRANCHES.forEach((branch, index) => {
    const { city, whatsapp, hours } = en.BRANCHES[index];
    assert.deepEqual([city, whatsapp], [branch.city, branch.whatsapp]);
    assert.deepEqual(
      hours.map((row) => [row.opens, row.closes, row.dayOfWeek]),
      branch.hours.map((row) => [row.opens, row.closes, row.dayOfWeek])
    );
  });

  // The Miami address is what the warehouse reads: identical, "Aéreo" included.
  assert.deepEqual(en.miamiAddressRows('Paul', 'Palacios'), es.miamiAddressRows('Paul', 'Palacios'));
  assert.equal(en.MIAMI_ADDRESS.lastName('Palacios'), 'Palacios Aéreo');

  assert.deepEqual(
    en.SHOPPING_EXAMPLES.map((example) => [en.quoteExample(example).total, en.quoteExample(example).path]),
    es.SHOPPING_EXAMPLES.map((example) => [es.quoteExample(example).total, es.quoteExample(example).path])
  );
  assert.deepEqual(en.FORMULA_EXAMPLE.dims, es.FORMULA_EXAMPLE.dims);
});

test('nothing visitors read was left in Spanish', () => {
  const different = (english: string, spanish: string, what: string) =>
    assert.notEqual(english, spanish, `${what} reads the same in both languages`);

  different(en.VALUE_PROPOSITION, es.VALUE_PROPOSITION, 'the promise');
  assert.ok(en.VALUE_PROPOSITION.includes(en.VALUE_PROPOSITION_HIGHLIGHT));
  assert.ok(es.VALUE_PROPOSITION.includes(es.VALUE_PROPOSITION_HIGHLIGHT));
  for (const key of ['signup', 'quote', 'help', 'mailbox', 'signin'] as const) {
    different(en.CTA[key].text, es.CTA[key].text, `CTA.${key}`);
  }
  es.SERVICES.forEach((service, index) => {
    different(en.SERVICES[index].name, service.name, `service ${service.id}`);
    different(en.SERVICES[index].description, service.description, `service ${service.id}`);
  });
  es.SERVICE_AXES.forEach((axis, index) => different(en.SERVICE_AXES[index].question, axis.question, axis.id));
  es.PROCESS_STEPS.forEach((step, index) => different(en.PROCESS_STEPS[index].title, step.title, step.title));
  es.SHOPPING_EXAMPLES.forEach((example, index) =>
    different(en.SHOPPING_EXAMPLES[index].item, example.item, example.id)
  );
  es.STORES.forEach((store, index) => different(en.STORES[index].about, store.about, store.id));
  es.RATES.notes.forEach((note, index) => different(en.RATES.notes[index], note, 'rate note'));
  es.RESTRICTED_ITEMS.prohibited.items.forEach((item, index) => {
    // "Drones" is the one word both languages share.
    if (item !== 'Drones') different(en.RESTRICTED_ITEMS.prohibited.items[index], item, item);
  });
  different(en.RATES.transitFrom, es.RATES.transitFrom, 'transitFrom');
  different(en.BRANCHES[0].hours[0].days, es.BRANCHES[0].hours[0].days, 'opening days');

  for (const [key, message] of Object.entries(es.WA_MESSAGES)) {
    const english = en.WA_MESSAGES[key as keyof typeof en.WA_MESSAGES];
    if (typeof message === 'string') different(english as string, message, `WA_MESSAGES.${key}`);
  }
  assert.deepEqual(Object.keys(en.WA_MESSAGES.floating), Object.keys(es.WA_MESSAGES.floating));
  assert.deepEqual(Object.keys(en.WA_MESSAGES.services), Object.keys(es.WA_MESSAGES.services));

  for (const volume of BUSINESS_VOLUMES) different(volume.en, volume.es, volume.id);
});

test('opening hours and the formulas are written the way each language writes them', () => {
  const [hours] = es.BRANCHES[0].hours;
  assert.equal(es.formatHours(hours), '8:00 a. m. – 5:00 p. m.');
  assert.equal(en.formatHours(hours), '8:00 a.m. – 5:00 p.m.');
  assert.equal(es.describeHours(hours), 'lunes a sábado, de 8:00 a. m. a 5:00 p. m.');
  assert.equal(en.describeHours(en.BRANCHES[0].hours[0]), 'Monday to Saturday, 8:00 a.m. to 5:00 p.m.');

  // A sentence that ends in "p. m." takes one full stop, not two.
  assert.equal(sentence('Abrimos de 8:00 a. m. a 5:00 p. m.'), 'Abrimos de 8:00 a. m. a 5:00 p. m.');
  assert.equal(sentence('Sucursales en Managua'), 'Sucursales en Managua.');
  for (const { SERVICES, PROCESS_STEPS } of [es, en]) {
    const texts = [...SERVICES.flatMap((service) => service.facts), ...PROCESS_STEPS.flatMap((step) => step.details)];
    for (const text of texts) assert.equal(text.includes('..'), false, text);
  }

  const furniture = en.quoteExample(en.SHOPPING_EXAMPLES.find((item) => item.id === 'muebles')!);
  assert.equal(furniture.tariff, 'Sea, by weight or by volume');
  assert.equal(furniture.charged, 'Charged by volume, which is the higher of the two.');
  assert.ok(furniture.lines.some((line) => line.startsWith('By volume: ') && line.includes('ft³')));
  assert.equal(furniture.transit, '15 to 20 days');
});

test('the questions are the same in both languages: same groups, same order, same ones on the home page', () => {
  const spanish = faqEs(link);
  const english = faqEn(link);

  assert.deepEqual(ids(english), ids(spanish));
  spanish.forEach((group, index) => {
    const other = english[index];
    assert.notEqual(other.title, group.title, group.id);
    assert.equal(other.items.length, group.items.length, group.id);
    group.items.forEach((item, position) => {
      const translated = other.items[position];
      assert.equal(Boolean(translated.featured), Boolean(item.featured), item.title);
      assert.notEqual(translated.title, item.title);
      // Same links, in the same order: the answers point to the same pages.
      const targets = (html: string) => Array.from(html.matchAll(/href="([^"]+)"/g), (match) => match[1]);
      assert.deepEqual(targets(translated.description), targets(item.description), item.title);
      // And the same amounts.
      const amounts = (html: string) => html.match(/US\$[\d.,]*\d/g) ?? [];
      assert.deepEqual(amounts(translated.description), amounts(item.description), item.title);
      assert.equal(/\.\./.test(item.description) || /\.\./.test(translated.description), false, item.title);
    });
  });
  assert.equal(featuredOf(english).length, featuredOf(spanish).length);
  assert.ok(featuredOf(spanish).length >= 4);
});
