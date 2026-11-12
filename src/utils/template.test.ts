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
    const { quote, customer } = content(locale).WA_MESSAGES;
    assert.equal(
      fill(quote('{shipment}', '{city}', '{total}'), { shipment: '1 celular', city: 'Managua', total: 'US$30' }),
      quote('1 celular', 'Managua', 'US$30')
    );
    assert.equal(fill(customer('{code}'), { code: 'CNV-00007' }), customer('CNV-00007'));
  }
});
