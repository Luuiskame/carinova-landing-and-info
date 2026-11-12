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
    const { floating, services, example, quote, branch, customer, welcomeEmail, mailbox, mailboxUpdate, ...fixed } =
      messagesOf;
    const messages: Array<string> = [
      ...Object.values(floating),
      ...Object.values(fixed),
      ...SERVICES.map((service) => services[service.id]),
      ...examples.map((item) => example(item.category)),
      ...BRANCHES.map((item) => branch(item.city)),
      quote('un envío aéreo de 3 lb', 'Managua', 'US$19.50'),
      customer('CNV-01234'),
      welcomeEmail('CNV-01234'),
      mailbox('CNV-01234'),
      mailboxUpdate('CNV-01234'),
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
  assert.deepEqual(totals, { ropa: 19.5, celulares: 30, laptops: 165, hogar: 45, muebles: 118, encomienda: 52 });

  const furniture = quoteExample(SHOPPING_EXAMPLES.find((item) => item.id === 'muebles')!);
  assert.equal(furniture.charged, 'Se cobra por volumen, que es el mayor.');
  assert.equal(furniture.path, '/cotizador?tarifa=maritimo&lb=40&largo=28&ancho=26&alto=14');
});

test("the brief's cubic-foot example opens the calculator filled in", () => {
  assert.equal(FORMULA_EXAMPLE.path, '/cotizador?tarifa=maritimo&largo=48&ancho=40&alto=72');
});
