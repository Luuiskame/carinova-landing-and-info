import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  INVOICE_STATES,
  PACKAGE_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SHIPPED_STATUSES,
  WAREHOUSE_STATUSES,
} from './account.ts';
import { BUSINESS_DISCLAIMER, BUSINESS_SOLUTIONS, BUSINESS_VOLUMES } from './business.ts';
import { RESTRICTED_ORDER, sentence } from './carinova.ts';
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
  assert.deepEqual(ids(en.STORE_CATEGORIES), ids(es.STORE_CATEGORIES));
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
  assert.equal(en.RESTRICTED_EXAMPLES.length, es.RESTRICTED_EXAMPLES.length);
  assert.deepEqual(Object.keys(en.RESTRICTED_ITEMS), Object.keys(es.RESTRICTED_ITEMS));
  for (const kind of RESTRICTED_ORDER) {
    assert.equal(en.RESTRICTED_ITEMS[kind].items.length, es.RESTRICTED_ITEMS[kind].items.length, kind);
  }
  es.SERVICES.forEach((service, index) => {
    assert.equal(en.SERVICES[index].facts.length, service.facts.length, service.id);
    assert.equal(en.SERVICES[index].link?.path, service.link?.path, service.id);
    assert.equal(Boolean(en.SERVICES[index].whatsappText), Boolean(service.whatsappText), service.id);
  });
  es.PROCESS_STEPS.forEach((step, index) => {
    assert.equal(en.PROCESS_STEPS[index].details.length, step.details.length, step.title);
    assert.equal(en.PROCESS_STEPS[index].link?.path, step.link?.path, step.title);
    assert.equal(en.PROCESS_STEPS[index].homeAnchor, step.homeAnchor, step.title);
  });
});

test('the facts are the same in both languages: only the words change', () => {
  const facts = ({ air, sea, electronics }: typeof es.RATES) => ({
    air: [air.id, air.pricePerLb, air.transitDays],
    sea: [sea.id, sea.pricePerLb, sea.pricePerCubicFoot, sea.transitDays],
    electronics: electronics.items.map((item) => [item.id, item.price, item.icon]),
  });
  assert.deepEqual(facts(en.RATES), facts(es.RATES));
  assert.equal(en.RATES.air.transit, '3 to 4 days');
  assert.equal(es.RATES.air.transit, '3 a 4 días');
  assert.equal(es.RATES.sea.transit, '15 a 20 días');

  es.STORES.forEach((store, index) => {
    const { name, domain, url, category } = en.STORES[index];
    assert.deepEqual([name, domain, url, category], [store.name, store.domain, store.url, store.category]);
    assert.match(url, /^https:\/\//);
    assert.ok(url.includes(domain.replace(/^www\./, '')), `${store.id}: the card shows the address its button opens`);
    assert.ok(ids(es.STORE_CATEGORIES).includes(store.category), `${store.id}: its category is one of the filters`);
  });
  // Every filter of "Explorá tiendas" finds at least one store.
  for (const category of es.STORE_CATEGORIES) {
    assert.ok(
      es.STORES.some((store) => store.category === category.id),
      category.id
    );
  }

  es.BRANCHES.forEach((branch, index) => {
    const { city, whatsapp, hours } = en.BRANCHES[index];
    assert.deepEqual([city, whatsapp], [branch.city, branch.whatsapp]);
    assert.deepEqual(
      hours.map((row) => [row.opens, row.closes, row.dayOfWeek]),
      branch.hours.map((row) => [row.opens, row.closes, row.dayOfWeek])
    );
  });

  // Where packages are received: the same warehouses, open or not, in both languages.
  assert.deepEqual(
    en.RECEPTION_POINTS.map((point) => [point.code, point.available]),
    es.RECEPTION_POINTS.map((point) => [point.code, point.available])
  );

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

  different(en.TAGLINE, es.TAGLINE, 'the tagline');
  different(en.VALUE_PROPOSITION, es.VALUE_PROPOSITION, 'the promise');
  es.HEADLINE.forEach((line, index) => different(en.HEADLINE[index], line, 'the headline'));
  for (const key of ['signup', 'quote', 'help', 'account', 'signin', 'track'] as const) {
    different(en.CTA[key].text, es.CTA[key].text, `CTA.${key}`);
  }
  es.SERVICES.forEach((service, index) => {
    different(en.SERVICES[index].name, service.name, `service ${service.id}`);
    different(en.SERVICES[index].description, service.description, `service ${service.id}`);
  });
  es.SERVICE_AXES.forEach((axis, index) => different(en.SERVICE_AXES[index].question, axis.question, axis.id));
  es.PROCESS_STEPS.forEach((step, index) => different(en.PROCESS_STEPS[index].title, step.title, step.title));
  es.ACCOUNT_PARTS.forEach((part, index) => different(en.ACCOUNT_PARTS[index].summary, part.summary, part.id));
  es.SHOPPING_EXAMPLES.forEach((example, index) =>
    different(en.SHOPPING_EXAMPLES[index].item, example.item, example.id)
  );
  es.STORES.forEach((store, index) => {
    different(en.STORES[index].about, store.about, store.id);
    different(en.STORES[index].tagline, store.tagline, store.id);
  });
  es.RATES.notes.forEach((note, index) => different(en.RATES.notes[index], note, 'rate note'));
  different(en.RATES.air.badge, es.RATES.air.badge, 'air badge');
  different(en.RATES.sea.badge, es.RATES.sea.badge, 'sea badge');
  for (const kind of RESTRICTED_ORDER) {
    different(en.RESTRICTED_ITEMS[kind].title, es.RESTRICTED_ITEMS[kind].title, kind);
    different(en.RESTRICTED_ITEMS[kind].summary, es.RESTRICTED_ITEMS[kind].summary, kind);
    es.RESTRICTED_ITEMS[kind].items.forEach((item, index) => {
      // "Drones", "Body spray" and "Perfumes" are the words both languages share.
      if (!['Drones', 'Body spray', 'Perfumes'].includes(item.name)) {
        different(en.RESTRICTED_ITEMS[kind].items[index].name, item.name, item.name);
      }
    });
  }
  different(en.RATES.transitFrom, es.RATES.transitFrom, 'transitFrom');
  different(en.BRANCHES[0].hours[0].days, es.BRANCHES[0].hours[0].days, 'opening days');

  for (const [key, message] of Object.entries(es.WA_MESSAGES)) {
    const english = en.WA_MESSAGES[key as keyof typeof en.WA_MESSAGES];
    if (typeof message === 'string') different(english as string, message, `WA_MESSAGES.${key}`);
  }
  assert.deepEqual(Object.keys(en.WA_MESSAGES).sort(), Object.keys(es.WA_MESSAGES).sort());
  assert.deepEqual(Object.keys(en.WA_MESSAGES.floating), Object.keys(es.WA_MESSAGES.floating));
  assert.deepEqual(Object.keys(en.WA_MESSAGES.services), Object.keys(es.WA_MESSAGES.services));

  for (const volume of BUSINESS_VOLUMES) different(volume.en, volume.es, volume.id);
  for (const solution of BUSINESS_SOLUTIONS) {
    different(solution.en.title, solution.es.title, solution.id);
    different(solution.en.text, solution.es.text, solution.id);
  }
  different(BUSINESS_DISCLAIMER.en, BUSINESS_DISCLAIMER.es, 'the note for companies');

  const statuses = [...PACKAGE_STATUSES, ...INVOICE_STATES, ...PAYMENT_STATUSES];
  for (const status of statuses) {
    different(status.en.name, status.es.name, status.id);
    different(status.en.text, status.es.text, status.id);
  }
  for (const method of PAYMENT_METHODS) different(method.en, method.es, method.id);
});

test('what cannot be brought: three groups, and a search finds every item by its own name', () => {
  // Whole words, without accents, as the search of "¿Puede ingresar a Nicaragua?" compares them.
  const plain = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9ñ]+/g, ' ')
      .trim();
  const found = (query: string, words: Array<string>) =>
    words.some((word) => ` ${plain(query)} `.includes(` ${word} `));

  for (const { RESTRICTED_ITEMS, RESTRICTED_EXAMPLES } of [es, en]) {
    assert.deepEqual(Object.keys(RESTRICTED_ITEMS).sort(), [...RESTRICTED_ORDER].sort());
    const all = RESTRICTED_ORDER.flatMap((id) => RESTRICTED_ITEMS[id].items);
    assert.equal(all.length, 14);

    for (const item of all) {
      assert.ok(item.match.length > 0, item.name);
      for (const word of item.match)
        assert.equal(word, plain(word), `"${word}" is written the way the search compares it`);
    }
    // Each example of the search box leads to exactly one list.
    for (const example of RESTRICTED_EXAMPLES) {
      const groups = RESTRICTED_ORDER.filter((id) =>
        RESTRICTED_ITEMS[id].items.some((item) => found(example, item.match))
      );
      assert.equal(groups.length, 1, example);
    }
  }

  // The lists Carinova gave on 2026-11-13.
  assert.deepEqual(
    es.RESTRICTED_ITEMS.notYet.items.map((item) => item.name),
    ['Carros', 'Motos', 'Maquinaria pesada']
  );
  assert.deepEqual(
    es.RESTRICTED_ITEMS.prohibited.items.map((item) => item.name),
    [
      'Armas, municiones y sus accesorios',
      'Tabaco, cigarrillos y derivados',
      'Cigarrillos electrónicos',
      'Accesorios para aeronaves',
      'Transmisores de radio',
      'Drones',
    ]
  );
  assert.deepEqual(
    es.RESTRICTED_ITEMS.seaOnly.items.map((item) => item.name),
    ['Productos inflamables', 'Baterías de litio sueltas', 'Body spray', 'Perfumes', 'Aerosoles']
  );
  // "armario" is furniture, not a weapon: whole words only.
  assert.equal(found('armario de madera', es.RESTRICTED_ITEMS.prohibited.items[0].match), false);
  assert.equal(found('Pistola de juguete', es.RESTRICTED_ITEMS.prohibited.items[0].match), true);
});

test('the statuses of packages and payments cover what the account shows', () => {
  const packageIds = PACKAGE_STATUSES.map((status) => status.id);
  assert.deepEqual(packageIds, ['received', 'processing', 'in_transit', 'ready', 'delivered', 'returned', 'cancelled']);
  for (const status of [...WAREHOUSE_STATUSES, ...SHIPPED_STATUSES]) assert.ok(packageIds.includes(status), status);
  // No status is both "in the warehouse" and "shipped".
  assert.deepEqual(
    WAREHOUSE_STATUSES.filter((status) => SHIPPED_STATUSES.includes(status)),
    []
  );
  assert.deepEqual(
    PAYMENT_STATUSES.map((status) => status.id),
    ['pending', 'confirmed', 'rejected']
  );
  assert.deepEqual(
    INVOICE_STATES.map((state) => state.id),
    ['unpaid', 'in_review', 'partial', 'paid', 'void']
  );
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
    const texts = [
      ...SERVICES.flatMap((service) => service.facts),
      ...PROCESS_STEPS.flatMap((step) => [step.summary, ...step.details]),
    ];
    for (const text of texts) assert.equal(text.includes('..'), false, text);
  }

  const furniture = en.quoteExample(en.SHOPPING_EXAMPLES.find((item) => item.id === 'muebles')!);
  assert.equal(furniture.tariff, 'Sea, by volume');
  assert.ok(furniture.lines.some((line) => line.includes('in³') && line.includes('ft³')));
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
      assert.equal(translated.featured, item.featured, item.title);
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

  // The home page shows the ten questions of Carinova's prototype, in its order.
  const featured = featuredOf(spanish);
  assert.deepEqual(
    featured.map((item) => item.featured),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  );
  assert.equal(featured[0].title, '¿Cómo obtengo mi Carinova ID?');
  assert.equal(featured[9].title, '¿Cómo rastreo varios paquetes con un mismo Carinova ID?');
  assert.deepEqual(
    featuredOf(english).map((item) => item.featured),
    featured.map((item) => item.featured)
  );
});
