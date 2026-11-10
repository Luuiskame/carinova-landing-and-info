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

  assert.match(email.subject, /Confirma tu correo/);
  assert.ok(email.html.includes(`href="${url}"`));
  assert.ok(email.html.includes('Hola, D&#39;Angelo:'));
  assert.ok(email.text.includes(url));
  assert.ok(email.text.includes("Hola, D'Angelo:"));
  assert.ok(email.html.includes('48 horas') && email.text.includes('48 horas'));
});

test('the welcome e-mail has the customer number, the Miami address and the restricted items', () => {
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
