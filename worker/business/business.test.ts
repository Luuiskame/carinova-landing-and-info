import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BUSINESS_EXAMPLES, BUSINESS_LIMITS, BUSINESS_VOLUMES } from '../../src/data/business.ts';
import { businessInquiryEmail } from './emails.ts';
import { validateBusinessInquiry } from './validate.ts';

const inquiry = {
  company: 'Repuestos del Caribe, S. A.',
  contactName: 'Paula Palacios',
  email: 'compras@example.com',
  phone: '8855 2956',
  country: 'NI',
  city: 'Bluefields',
  volume: '100-500',
  message: 'Importamos repuestos de motor cada mes.\nQueremos una cuenta para la empresa.',
};

const errorsOf = (input: unknown, locale?: 'es' | 'en') => {
  const result = validateBusinessInquiry(input, locale);
  return result.ok ? {} : result.fields;
};

test('accepts a request and normalises it', () => {
  const result = validateBusinessInquiry({
    ...inquiry,
    company: '  Repuestos   del Caribe, S. A. ',
    email: ' Compras@Example.COM ',
    message: '  Importamos repuestos.\r\n\r\n\r\n\r\nCada   mes.\t ',
    role: 'admin',
  });
  assert.deepEqual(result, {
    ok: true,
    data: {
      company: 'Repuestos del Caribe, S. A.',
      contactName: 'Paula Palacios',
      email: 'compras@example.com',
      phone: '+50588552956',
      country: 'NI',
      city: 'Bluefields',
      volume: '100-500',
      message: 'Importamos repuestos.\n\nCada mes.',
    },
  });
});

test('the volume is optional; a company in the United States is fine', () => {
  const result = validateBusinessInquiry({
    ...inquiry,
    volume: '',
    country: 'US',
    phone: '(305) 555-0123',
    city: 'Miami',
  });
  assert.equal(result.ok && result.data.volume, '');
  assert.equal(result.ok && result.data.phone, '+13055550123');
  for (const { id } of BUSINESS_VOLUMES) assert.deepEqual(errorsOf({ ...inquiry, volume: id }), {}, id);
});

test("the form's placeholders are valid answers", () => {
  assert.deepEqual(errorsOf({ ...inquiry, ...BUSINESS_EXAMPLES }), {});
});

test('reports every missing field at once', () => {
  assert.deepEqual(Object.keys(errorsOf({})).sort(), [
    'city',
    'company',
    'contactName',
    'country',
    'email',
    'message',
    'phone',
  ]);
  assert.deepEqual(errorsOf(null), errorsOf({}));
});

test('each field has its rules', () => {
  assert.ok(errorsOf({ ...inquiry, company: 'A' }).company);
  assert.ok(errorsOf({ ...inquiry, company: 'x'.repeat(BUSINESS_LIMITS.company + 1) }).company);
  assert.deepEqual(errorsOf({ ...inquiry, company: 'Café & Cía. 24/7 (Managua)' }), {}, 'company names are free text');
  for (const name of ['P', 'http://spam.example', 'Paula 123', '<b>Paula</b>']) {
    assert.ok(errorsOf({ ...inquiry, contactName: name }).contactName, name);
  }
  for (const email of ['compras', 'compras@', 'compras @example.com']) {
    assert.ok(errorsOf({ ...inquiry, email }).email, email);
  }
  assert.ok(errorsOf({ ...inquiry, phone: '12345' }).phone);
  assert.ok(errorsOf({ ...inquiry, country: 'CR' }).country);
  assert.ok(errorsOf({ ...inquiry, city: 'x' }).city);
  assert.ok(errorsOf({ ...inquiry, volume: 'a-lot' }).volume);
  assert.ok(errorsOf({ ...inquiry, message: 'Hola' }).message);
  assert.ok(errorsOf({ ...inquiry, message: 'x'.repeat(BUSINESS_LIMITS.message + 1) }).message);
  assert.deepEqual(errorsOf({ ...inquiry, message: 'x'.repeat(BUSINESS_LIMITS.message) }), {});
});

test('the messages come in the language of the form', () => {
  assert.equal(errorsOf({ ...inquiry, company: '' }).company, 'Escribí el nombre de tu empresa.');
  assert.equal(errorsOf({ ...inquiry, company: '' }, 'en').company, 'Enter the name of your company.');
  assert.match(
    errorsOf({ ...inquiry, phone: '123' }, 'en').phone ?? '',
    /^Enter the full number, for example 8888 8888/
  );
});

test("the owner's e-mail lists the request and never trusts what was typed", () => {
  const result = validateBusinessInquiry({ ...inquiry, company: 'Tom & <Jerry>', message: 'Línea 1\nLínea <2>' });
  assert.ok(result.ok);
  const email = businessInquiryEmail(result.data, 'en');

  assert.equal(email.subject, 'Solicitud de empresa: Tom & <Jerry>');
  for (const version of [email.html, email.text]) {
    for (const value of ['Paula Palacios', 'compras@example.com', '+50588552956', 'Nicaragua', 'Bluefields']) {
      assert.ok(version.includes(value), value);
    }
    assert.ok(version.includes('De 100 a 500 lb al mes'), 'the volume in words');
    assert.ok(version.includes('Inglés'), 'the language to answer in');
    assert.ok(version.includes('https://wa.me/50588552956'));
  }
  assert.ok(email.html.includes('Tom &amp; &lt;Jerry&gt;'));
  assert.ok(email.html.includes('Línea 1<br>Línea &lt;2&gt;'), 'line breaks are kept, markup is not');
  assert.equal(email.html.includes('<Jerry>'), false);
  assert.ok(email.text.includes('Línea 1\nLínea <2>'));
});
