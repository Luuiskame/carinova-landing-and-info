import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { WA_MESSAGES } from '../data/carinova.ts';
import { LOCALES, isLocale, localeFrom } from './locales.ts';
import { ROUTES, alternatePath, localeOfPath, localizePath, pathOf, spanishPath } from './routes.ts';

const routes = Object.values(ROUTES);

test('every page has one address per language, and a file to render it', () => {
  const pages = new URL('../pages/', import.meta.url);
  for (const [id, route] of Object.entries(ROUTES)) {
    assert.ok(existsSync(new URL(route.page, pages)), `${id}: src/pages/${route.page} does not exist`);
    assert.equal(localeOfPath(route.es), 'es', id);
    assert.equal(localeOfPath(route.en), 'en', id);
    assert.match(route.en, /^\/en(\/[a-z0-9-]+)*$/, id);
    assert.match(route.es, /^\/([a-z0-9-]+(\/[a-z0-9-]+)*)?$/, id);
  }
  for (const locale of LOCALES) {
    const paths = routes.map((route) => route[locale]);
    assert.equal(new Set(paths).size, paths.length, `two pages share an address in ${locale}`);
  }
});

test('every page has its floating WhatsApp message', () => {
  for (const route of routes) assert.ok(WA_MESSAGES.floating[route.es], `${route.es} has no floating message`);
});

test('a Spanish path becomes the address of the language being rendered', () => {
  assert.equal(localizePath('/cotizador', 'es'), '/cotizador');
  assert.equal(localizePath('/cotizador', 'en'), '/en/quote');
  assert.equal(localizePath('/', 'en'), '/en');
  // What the address carries stays: the calculator's fields and the anchors are the same in both.
  assert.equal(localizePath('/cotizador?tarifa=maritimo&largo=48', 'en'), '/en/quote?tarifa=maritimo&largo=48');
  assert.equal(localizePath('/servicios#compras-asistidas', 'en'), '/en/services#compras-asistidas');
  assert.equal(localizePath('/registro/confirmar', 'en'), '/en/sign-up/confirm');
  assert.equal(localizePath('/registro/', 'en'), '/en/sign-up');
  // Not a page of the site: left alone.
  assert.equal(localizePath('/api/signup', 'en'), '/api/signup');
  assert.equal(localizePath('https://wa.me/50588552956', 'en'), 'https://wa.me/50588552956');
  assert.equal(localizePath('#tiendas', 'en'), '#tiendas');
});

test('each page knows its other language', () => {
  assert.equal(alternatePath('/cotizador', 'en'), '/en/quote');
  assert.equal(alternatePath('/en/quote', 'es'), '/cotizador');
  assert.equal(alternatePath('/en/quote/', 'en'), '/en/quote');
  assert.equal(alternatePath('/en', 'es'), '/');
  assert.equal(alternatePath('/', 'en'), '/en');
  assert.equal(alternatePath('/404', 'en'), undefined);
  assert.equal(alternatePath('/blog/una-entrada', 'en'), undefined);

  assert.equal(pathOf('mailbox', 'es'), '/mi-casillero');
  assert.equal(pathOf('mailbox', 'en'), '/en/my-mailbox');
});

test('what is kept per page uses the Spanish address, whatever the language', () => {
  assert.equal(spanishPath('/en/quote'), '/cotizador');
  assert.equal(spanishPath('/cotizador/'), '/cotizador');
  assert.equal(spanishPath('/en'), '/');
  assert.equal(spanishPath('/en/does-not-exist'), '/en/does-not-exist');
});

test('the language of an address, and of a form', () => {
  assert.equal(localeOfPath('/'), 'es');
  assert.equal(localeOfPath('/en'), 'en');
  assert.equal(localeOfPath('/en/'), 'en');
  assert.equal(localeOfPath('/en/quote'), 'en');
  // "en" only as a whole first segment.
  assert.equal(localeOfPath('/envios'), 'es');
  assert.equal(localeOfPath('/english'), 'es');

  assert.ok(isLocale('es') && isLocale('en'));
  assert.equal(isLocale('fr'), false);
  for (const value of [undefined, null, '', 'fr', 42, 'EN']) assert.equal(localeFrom(value), 'es');
  assert.equal(localeFrom('en'), 'en');
});
