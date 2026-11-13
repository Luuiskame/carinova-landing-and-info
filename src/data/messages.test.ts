import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { LOCALES } from '../i18n/locales.ts';
import { WA_MESSAGES } from './carinova.ts';
import { content } from './content.ts';
import { FORMULA_EXAMPLE, SHOPPING_EXAMPLES, quoteExample } from './services.ts';

const GREETING = { es: /^Hola Carinova 👋 \S/, en: /^Hi Carinova 👋 \S/ };

for (const locale of LOCALES) {
  test(`every WhatsApp link has a message of its own, so the team can tell where a lead came from (${locale})`, () => {
    const { BRANCHES, SERVICES, SHOPPING_EXAMPLES: examples, WA_MESSAGES: messagesOf } = content(locale);
    const {
      floating,
      services,
      example,
      quote,
      homeQuote,
      shopper,
      storeAssist,
      itemCheck,
      branch,
      customer,
      welcomeEmail,
      accountPackages,
      accountPackage,
      accountInvoice,
      accountUpdate,
      ...fixed
    } = messagesOf;
    const messages: Array<string> = [
      ...Object.values(floating),
      ...Object.values(fixed),
      ...SERVICES.map((service) => services[service.id]),
      ...examples.map((item) => example(item.category)),
      ...BRANCHES.map((item) => branch(item.city)),
      quote('un envío aéreo de 3 lb', 'US$19.50'),
      homeQuote('un envío aéreo de 3 lb', 'US$19.50'),
      shopper('https://www.amazon.com/dp/B000000000'),
      storeAssist('Amazon'),
      itemCheck('un perfume'),
      customer('CNV-01234'),
      welcomeEmail('CNV-01234'),
      accountPackages('CNV-01234'),
      accountPackage('CNV-01234', 'PKG-000123'),
      accountInvoice('CNV-01234', 'INV-000123'),
      accountUpdate('CNV-01234'),
    ];

    for (const message of messages) assert.match(message, GREETING[locale]);
    const repeated = messages.filter((message, index) => messages.indexOf(message) !== index);
    assert.deepEqual(repeated, []);
  });

  test(`every service has its WhatsApp message (${locale})`, () => {
    const { SERVICES, WA_MESSAGES: messagesOf } = content(locale);
    for (const service of SERVICES) assert.ok(messagesOf.services[service.id], service.id);
  });
}

test('the floating button has a message for pages that exist', () => {
  const pages = new URL('../pages/', import.meta.url);
  for (const path of Object.keys(WA_MESSAGES.floating)) {
    const name = path === '/' ? 'index' : path.slice(1);
    const candidates = [`${name}.astro`, `${name}.md`, `${name}/index.astro`];
    assert.ok(
      candidates.some((file) => existsSync(new URL(file, pages))),
      `${path} has a floating message but no page`
    );
  }
});

test('the worked examples of "Cómo comprar" add up', () => {
  const totals = Object.fromEntries(SHOPPING_EXAMPLES.map((item) => [item.id, quoteExample(item).total]));
  assert.deepEqual(totals, { ropa: 19.5, celulares: 30, laptops: 80, hogar: 45, muebles: 117.96, encomienda: 52 });

  // Each example is quoted on one basis, and opens the calculator on it.
  const paths = Object.fromEntries(SHOPPING_EXAMPLES.map((item) => [item.id, quoteExample(item).path]));
  assert.deepEqual(paths, {
    ropa: '/cotizador?tarifa=aereo&lb=3',
    celulares: '/cotizador?tarifa=aereo&base=celular&unidades=1',
    laptops: '/cotizador?tarifa=aereo&base=laptop&unidades=1',
    hogar: '/cotizador?tarifa=maritimo&lb=18',
    muebles: '/cotizador?tarifa=maritimo&base=volumen&largo=28&ancho=26&alto=14&unidad=pulg',
    encomienda: '/cotizador?tarifa=aereo&lb=8',
  });
  const furniture = quoteExample(SHOPPING_EXAMPLES.find((item) => item.id === 'muebles')!);
  assert.equal(furniture.tariff, 'Marítimo, por volumen');
  assert.deepEqual(furniture.lines, ['28 × 26 × 14 = 10,192 pulg³ ÷ 1,728 = 5.8981 pie³ × US$20 = US$117.96']);
});

test("the brief's cubic-foot example opens the calculator filled in", () => {
  assert.equal(FORMULA_EXAMPLE.path, '/cotizador?tarifa=maritimo&base=volumen&largo=48&ancho=40&alto=72&unidad=pulg');
});
