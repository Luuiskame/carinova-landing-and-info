import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MIAMI_ADDRESS, RESTRICTED_ITEMS } from '../../src/data/carinova.ts';
import { escapeHtml, teamNotificationEmail, verificationEmail, welcomeEmail } from './emails.ts';

const customer = { code: 'CNV-00007', firstName: 'Paul', lastName: "O'Brien" };

test('escapeHtml', () => {
  assert.equal(
    escapeHtml(`<a href="x">Tom & Jerry's</a>`),
    '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;'
  );
});

test('the confirmation e-mail carries the link in both versions', () => {
  const url = 'https://carinova.test/registro/confirmar?token=abc_DEF-123';
  const email = verificationEmail("D'Angelo", url);

  assert.match(email.subject, /Confirmá tu correo/);
  assert.ok(email.html.includes(`href="${url}"`));
  assert.ok(email.html.includes('Hola, D&#39;Angelo:'));
  assert.ok(email.text.includes(url));
  assert.ok(email.text.includes("Hola, D'Angelo:"));
  assert.ok(email.html.includes('48 horas') && email.text.includes('48 horas'));
});

test('the welcome e-mail has the Carinova ID, the Miami address, the restricted items and the calculator', () => {
  const email = welcomeEmail(customer, 'https://carinova.test');

  assert.equal(email.subject, 'Tu casillero Carinova está listo: CNV-00007');
  for (const version of [email.html, email.text]) {
    assert.ok(version.includes('CNV-00007'));
    assert.ok(version.includes('Carinova Paul'));
    for (const line of [MIAMI_ADDRESS.line1, MIAMI_ADDRESS.line2, MIAMI_ADDRESS.postalCode, MIAMI_ADDRESS.phone]) {
      assert.ok(version.includes(line), line);
    }
    for (const item of [...RESTRICTED_ITEMS.prohibited.items, ...RESTRICTED_ITEMS.noAir.items]) {
      assert.ok(version.includes(item), item);
    }
    assert.ok(version.includes('https://carinova.test/articulos-prohibidos'));
    assert.ok(version.includes('https://carinova.test/cotizador'));
    assert.ok(version.includes('https://wa.me/50588552956?text='));
  }
  // The last name is the customer's own text: escaped in HTML, untouched in plain text.
  assert.ok(email.html.includes('O&#39;Brien Aéreo'));
  assert.ok(email.text.includes("O'Brien Aéreo"));
});

test('the team notification lists the customer and links to their WhatsApp', () => {
  const email = teamNotificationEmail(customer, {
    country: 'NI',
    firstName: 'Paul',
    lastName: "O'Brien",
    email: 'paul@example.com',
    phone: '+50588552956',
    address1: 'Barrio Central <casa azul>',
    address2: '',
    city: 'Bluefields',
    state: 'Costa Caribe Sur (RACCS)',
    postalCode: '',
  });

  assert.equal(email.subject, "Nuevo casillero CNV-00007: Paul O'Brien");
  for (const version of [email.html, email.text]) {
    for (const value of ['CNV-00007', 'paul@example.com', '+50588552956', 'Nicaragua', 'Bluefields']) {
      assert.ok(version.includes(value), value);
    }
    assert.ok(version.includes('https://wa.me/50588552956'));
  }
  assert.ok(email.html.includes('Barrio Central &lt;casa azul&gt;'));
  assert.equal(email.html.includes('<casa azul>'), false);
});

test('the customer’s e-mails are written in the language they signed up in', () => {
  const url = 'https://carinova.test/en/sign-up/confirm?token=abc';
  const confirmation = verificationEmail('Paul', url, 'en');
  assert.equal(confirmation.subject, 'Confirm your e-mail to open your Carinova mailbox');
  assert.ok(confirmation.html.includes('<html lang="en">') && confirmation.html.includes(`href="${url}"`));
  assert.ok(confirmation.html.includes('48 hours') && confirmation.text.includes('48 hours'));
  assert.ok(confirmation.text.includes('Hi, Paul:'));

  const welcome = welcomeEmail(customer, 'https://carinova.test', 'en');
  assert.equal(welcome.subject, 'Your Carinova mailbox is ready: CNV-00007');
  for (const version of [welcome.html, welcome.text]) {
    // The address is what the warehouse reads: the same in both languages.
    assert.ok(version.includes('Carinova Paul') && version.includes('Aéreo'));
    assert.ok(version.includes(MIAMI_ADDRESS.line1));
    assert.ok(version.includes('Weapons, ammunition and accessories'));
    assert.ok(version.includes('https://carinova.test/en/prohibited-items'));
    assert.ok(version.includes('https://carinova.test/en/quote'));
    assert.ok(version.includes('https://carinova.test/en/sign-in'));
    assert.ok(version.includes(encodeURIComponent('Hi Carinova')));
    assert.equal(version.includes('Armas'), false, 'nothing left in Spanish');
  }
});

test('the welcome e-mail says how to get back in: with the e-mail, no password', () => {
  const email = welcomeEmail(customer, 'https://carinova.test');
  for (const version of [email.html, email.text]) {
    assert.ok(version.includes('https://carinova.test/ingresar'));
    assert.ok(version.includes('sin contraseña'));
  }
});

test('the team notification is in Spanish and says which language the customer uses', () => {
  const data = {
    country: 'US',
    firstName: 'Paul',
    lastName: "O'Brien",
    email: 'paul@example.com',
    phone: '+13055550123',
    address1: '1200 NW 7th St',
    address2: 'Apt 4B',
    city: 'Miami',
    state: 'Florida',
    postalCode: '33125',
  };
  const email = teamNotificationEmail(customer, data, 'en');
  assert.ok(email.text.includes('País: Estados Unidos') && email.text.includes('Idioma: Inglés'));
  assert.ok(teamNotificationEmail(customer, data).text.includes('Idioma: Español'));
});
