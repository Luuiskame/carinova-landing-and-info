import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SIGNUP_COUNTRIES, SIGNUP_NAME_EXAMPLES } from '../../src/data/signup.ts';
import { normalizePhone, validateSignup } from './validate.ts';

const [NI, US] = SIGNUP_COUNTRIES;

const nicaraguan = {
  country: 'NI',
  firstName: 'Paul',
  lastName: 'Palacios',
  email: 'paul@example.com',
  phone: '8855 2956',
  address1: 'Barrio Central, de la iglesia morava 1 c. al sur',
  address2: '',
  city: 'Bluefields',
  state: 'Costa Caribe Sur (RACCS)',
  postalCode: '',
  terms: true,
};

const american = {
  ...nicaraguan,
  country: 'US',
  phone: '(305) 555-0123',
  address1: '1200 NW 7th St',
  address2: 'Apt 4B',
  city: 'Miami',
  state: 'Florida',
  postalCode: '33125',
};

const errorsOf = (input: unknown) => {
  const result = validateSignup(input);
  return result.ok ? {} : result.fields;
};

test('accepts a sign-up from Nicaragua and normalises it', () => {
  const result = validateSignup({ ...nicaraguan, firstName: '  María   José ', email: ' Paul@Example.COM ' });
  assert.deepEqual(result, {
    ok: true,
    data: {
      country: 'NI',
      firstName: 'María José',
      lastName: 'Palacios',
      email: 'paul@example.com',
      phone: '+50588552956',
      address1: 'Barrio Central, de la iglesia morava 1 c. al sur',
      address2: '',
      city: 'Bluefields',
      state: 'Costa Caribe Sur (RACCS)',
      postalCode: '',
    },
  });
});

test('accepts a sign-up from the United States', () => {
  const result = validateSignup(american);
  assert.equal(result.ok, true);
  assert.deepEqual(result.ok && [result.data.phone, result.data.state, result.data.postalCode, result.data.address2], [
    '+13055550123',
    'Florida',
    '33125',
    'Apt 4B',
  ]);
});

test("the form's placeholders are valid answers", () => {
  // They are shown as examples and quoted in error messages: typing one must not be an error.
  for (const country of SIGNUP_COUNTRIES) {
    const form = {
      ...SIGNUP_NAME_EXAMPLES,
      ...country.examples,
      country: country.code,
      state: country.states[0],
      terms: true,
    };
    assert.deepEqual(errorsOf(form), {}, country.code);
  }
});

test('reports every missing field at once', () => {
  assert.deepEqual(Object.keys(errorsOf({})).sort(), [
    'address1',
    'city',
    'country',
    'email',
    'firstName',
    'lastName',
    'phone',
    'state',
    'terms',
  ]);
  assert.deepEqual(errorsOf(null), errorsOf({}));
  assert.deepEqual(errorsOf('not an object'), errorsOf({}));
});

test('names take letters of any alphabet, never links or digits', () => {
  for (const name of ["O'Brien", 'María José', 'Ana-Lucía', 'Núñez', 'D’Angelo', 'Jr.']) {
    assert.deepEqual(errorsOf({ ...nicaraguan, firstName: name, lastName: name }), {}, name);
  }
  for (const name of ['A', 'http://spam.example', 'Paul 123', 'Gana $500 hoy', '<b>Paul</b>', 'x'.repeat(61)]) {
    assert.ok(errorsOf({ ...nicaraguan, firstName: name }).firstName, name);
    assert.ok(errorsOf({ ...nicaraguan, lastName: name }).lastName, name);
  }
});

test('e-mail addresses', () => {
  for (const email of ['a@b.co', 'first.last+tag@sub.example.com']) {
    assert.deepEqual(errorsOf({ ...nicaraguan, email }), {}, email);
  }
  for (const email of ['', 'paul', 'paul@', '@example.com', 'paul@example', 'paul @example.com', 'a@b.c', 'a@b,com']) {
    assert.ok(errorsOf({ ...nicaraguan, email }).email, email);
  }
  assert.ok(errorsOf({ ...nicaraguan, email: `${'a'.repeat(250)}@example.com` }).email);
});

test('phone numbers are stored with their country code', () => {
  const cases: Array<[string, typeof NI, string | null]> = [
    ['8855 2956', NI, '+50588552956'],
    ['+505 8855-2956', NI, '+50588552956'],
    ['505 8855 2956', NI, '+50588552956'],
    ['00505 8855 2956', US, '+50588552956'],
    ['(305) 555-0123', US, '+13055550123'],
    ['1 305 555 0123', US, '+13055550123'],
    // A number of the other country: a customer in Miami with a Nicaraguan line, and the reverse.
    ['8855 2956', US, '+50588552956'],
    ['305 555 0123', NI, '+13055550123'],
    // 505 is also the area code of New Mexico: ten digits make it a US number.
    ['505 555 0123', US, '+15055550123'],
    ['+34 612 345 678', NI, '+34612345678'],
    ['12345', NI, null],
    ['+1', US, null],
    ['', NI, null],
  ];
  for (const [raw, country, expected] of cases) {
    assert.equal(normalizePhone(raw, country), expected, `${raw} (${country.code})`);
  }
  assert.ok(errorsOf({ ...nicaraguan, phone: '12345' }).phone);
});

test('the state must belong to the chosen country', () => {
  assert.ok(errorsOf({ ...nicaraguan, state: 'Florida' }).state);
  assert.ok(errorsOf({ ...american, state: 'Managua' }).state);
  assert.ok(errorsOf({ ...nicaraguan, state: '' }).state);
});

test('postal code: optional in Nicaragua, required in the United States', () => {
  assert.deepEqual(errorsOf({ ...nicaraguan, postalCode: '' }), {});
  assert.deepEqual(errorsOf({ ...nicaraguan, postalCode: '81000' }), {});
  assert.ok(errorsOf({ ...nicaraguan, postalCode: 'abc' }).postalCode);
  assert.ok(errorsOf({ ...american, postalCode: '' }).postalCode);
  assert.ok(errorsOf({ ...american, postalCode: '3312' }).postalCode);
  assert.deepEqual(errorsOf({ ...american, postalCode: '33195-2311' }), {});
});

test('addresses and cities have length limits', () => {
  assert.ok(errorsOf({ ...nicaraguan, address1: 'abc' }).address1);
  assert.ok(errorsOf({ ...nicaraguan, address1: 'x'.repeat(121) }).address1);
  assert.ok(errorsOf({ ...nicaraguan, address2: 'x'.repeat(61) }).address2);
  assert.ok(errorsOf({ ...nicaraguan, city: 'x'.repeat(61) }).city);
  assert.ok(errorsOf({ ...nicaraguan, city: 'x' }).city);
});

test('the terms must be accepted', () => {
  for (const terms of [false, undefined, 'no', 0]) assert.ok(errorsOf({ ...nicaraguan, terms }).terms);
  for (const terms of [true, 'true', 'on']) assert.deepEqual(errorsOf({ ...nicaraguan, terms }), {});
});

test('control characters and extra fields never reach the result', () => {
  const result = validateSignup({ ...nicaraguan, city: 'Blue\u0000fields\n', role: 'admin' });
  assert.equal(result.ok && result.data.city, 'Blue fields');
  assert.equal(result.ok && 'role' in result.data, false);
});

test('the option lists are complete', () => {
  assert.equal(NI.states.length, 17);
  assert.equal(US.states.length, 52);
  for (const { states } of SIGNUP_COUNTRIES) assert.equal(new Set(states).size, states.length);
});
