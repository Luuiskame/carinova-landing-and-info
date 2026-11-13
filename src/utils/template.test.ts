import assert from 'node:assert/strict';
import { test } from 'node:test';
import { content } from '../data/content.ts';
import { fill } from './template.ts';

test('fills the placeholders of a sentence', () => {
  assert.equal(fill('Hola, {name}', { name: 'Paul' }), 'Hola, Paul');
  assert.equal(fill('{count} de {count}', { count: 3 }), '3 de 3');
  assert.equal(fill('Sin nada que llenar', {}), 'Sin nada que llenar');
  // A placeholder without a value is left as it is, so the gap can be seen.
  assert.equal(fill('Hola, {name}', {}), 'Hola, {name}');
  // What is filled in is not read again as a placeholder.
  assert.equal(fill('{a} {b}', { a: '{b}', b: 'x' }), '{b} x');
});

test('a WhatsApp message handed to a script as a template reads like the message built in one go', () => {
  for (const locale of ['es', 'en'] as const) {
    const messages = content(locale).WA_MESSAGES;
    const quote = { shipment: '1 celular', total: 'US$30' };
    assert.equal(fill(messages.quote('{shipment}', '{total}'), quote), messages.quote('1 celular', 'US$30'));
    assert.equal(fill(messages.homeQuote('{shipment}', '{total}'), quote), messages.homeQuote('1 celular', 'US$30'));
    assert.equal(fill(messages.customer('{code}'), { code: 'CNV-00007' }), messages.customer('CNV-00007'));

    // The home page: the product's link, the store, the article that was searched for.
    const link = 'https://www.amazon.com/dp/B000000000';
    assert.equal(fill(messages.shopper('{link}'), { link }), messages.shopper(link));
    assert.equal(fill(messages.storeAssist('{store}'), { store: 'Best Buy' }), messages.storeAssist('Best Buy'));
    assert.equal(fill(messages.itemCheck('{item}'), { item: 'un perfume' }), messages.itemCheck('un perfume'));

    // "Mi cuenta": the customer's Carinova ID with the package or the invoice it is about.
    const account = { code: 'CNV-00007', reference: 'PKG-000012', number: 'INV-000003' };
    assert.equal(fill(messages.accountPackages('{code}'), account), messages.accountPackages('CNV-00007'));
    assert.equal(
      fill(messages.accountPackage('{code}', '{reference}'), account),
      messages.accountPackage('CNV-00007', 'PKG-000012')
    );
    assert.equal(
      fill(messages.accountInvoice('{code}', '{number}'), account),
      messages.accountInvoice('CNV-00007', 'INV-000003')
    );
    assert.equal(fill(messages.accountUpdate('{code}'), account), messages.accountUpdate('CNV-00007'));
  }
});
