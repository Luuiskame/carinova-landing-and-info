// Every language says everything Spanish says: the same pieces, the same facts, in its own words.
//
// Spanish is the original (src/i18n/ui/es.ts, src/data/*.ts, worker/text/es.ts, src/data/legal).
// Each translation is checked against it, piece by piece. Run one language while translating it:
//
//   node --test --test-name-pattern="\(fr\)" src/i18n/translations.test.ts
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { textOf } from '../../worker/text/index.ts';
import { faqGroups as faqAr } from '../data/ar/faq.ts';
import { RESTRICTED_ORDER } from '../data/carinova.ts';
import { content } from '../data/content.ts';
import { faqGroups as faqEn } from '../data/en/faq.ts';
import { faqGroups as faqEs, featuredOf, type FaqGroup, type LinkTo } from '../data/faq.ts';
import { faqGroups as faqFr } from '../data/fr/faq.ts';
import { faqGroups as faqPt } from '../data/pt/faq.ts';
import { faqGroups as faqRu } from '../data/ru/faq.ts';
import { faqGroups as faqZh } from '../data/zh/faq.ts';
import { findRestricted, plain } from '../utils/restricted.ts';
import { DEFAULT_LOCALE, LOCALES, LOCALE_INFO, PUBLISHED_TRANSLATIONS, type Locale } from './locales.ts';
import { DATA_RULES, TEXT_RULES, compareShape, sameAs, shareIn, type Rules } from './parity.ts';
import { ui as uiAr } from './ui/ar.ts';
import { ui as uiEn } from './ui/en.ts';
import { ui as uiEs } from './ui/es.ts';
import { ui as uiFr } from './ui/fr.ts';
import { ui as uiPt } from './ui/pt.ts';
import { ui as uiRu } from './ui/ru.ts';
import { ui as uiZh } from './ui/zh.ts';

const UI: Record<Locale, unknown> = { es: uiEs, en: uiEn, fr: uiFr, pt: uiPt, zh: uiZh, ru: uiRu, ar: uiAr };
const FAQ: Record<Locale, (link: LinkTo) => Array<FaqGroup>> = {
  es: faqEs,
  en: faqEn,
  fr: faqFr,
  pt: faqPt,
  zh: faqZh,
  ru: faqRu,
  ar: faqAr,
};
const link: LinkTo = (path, text) => `<a href="${path}">${text}</a>`;

const TRANSLATIONS = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

/** The letters a language is written with, where they tell it apart from Spanish and English. */
const SCRIPT: Partial<Record<Locale, RegExp>> = {
  zh: /\p{Script=Han}/u,
  ru: /\p{Script=Cyrillic}/u,
  ar: /\p{Script=Arabic}/u,
};

/**
 * At most this share of a translation's sentences may read exactly like another language's. The data
 * has more names that are the same everywhere (stores, devices, "Nicaragua") than the pages do.
 */
const SAME_IN_TEXT = 0.08;
const SAME_IN_DATA = 0.2;

const report = (problems: Array<string>) =>
  problems.length === 0
    ? ''
    : `\n${problems.slice(0, 25).join('\n')}${problems.length > 25 ? `\n… and ${problems.length - 25} more` : ''}`;

test('the languages of the site: the default, the published ones and what each is called', () => {
  assert.equal(DEFAULT_LOCALE, 'es');
  assert.deepEqual([...LOCALES], ['es', 'en', 'fr', 'pt', 'zh', 'ru', 'ar']);
  for (const locale of PUBLISHED_TRANSLATIONS) assert.ok(TRANSLATIONS.includes(locale), locale);
  assert.equal(new Set(PUBLISHED_TRANSLATIONS).size, PUBLISHED_TRANSLATIONS.length);
  for (const locale of LOCALES) {
    const info = LOCALE_INFO[locale];
    assert.ok(
      info.name && /^[A-Z]{2}$/.test(info.code) && info.htmlLang && /^[a-z]{2}_[A-Z]{2}$/.test(info.ogLocale),
      locale
    );
    assert.equal(info.dir, locale === 'ar' ? 'rtl' : 'ltr', locale);
    // Dates can be written for its readers.
    assert.doesNotThrow(() => new Intl.DateTimeFormat(info.intl, { dateStyle: 'medium' }).format(new Date(0)), locale);
  }
  assert.equal(new Set(LOCALES.map((locale) => LOCALE_INFO[locale].htmlLang)).size, LOCALES.length);
});

for (const locale of TRANSLATIONS) {
  test(`what the pages say has every sentence of the Spanish, in the same shape (${locale})`, () => {
    const problems = compareShape(UI.es, UI[locale], TEXT_RULES);
    assert.equal(problems.length, 0, report(problems));
  });

  test(`the site's data has every piece of the Spanish, with the same facts (${locale})`, () => {
    const problems = compareShape(content('es'), content(locale), DATA_RULES);
    assert.equal(problems.length, 0, report(problems));
  });

  test(`what the Worker says (e-mails, the forms' messages) has every sentence of the Spanish (${locale})`, () => {
    const problems = compareShape(textOf('es'), textOf(locale), TEXT_RULES);
    assert.equal(problems.length, 0, report(problems));
  });

  test(`the questions are the Spanish ones: same groups, same order, same links, same amounts (${locale})`, () => {
    const spanish = faqEs(link);
    const translated = FAQ[locale](link);
    assert.deepEqual(
      translated.map((group) => group.id),
      spanish.map((group) => group.id)
    );
    const targets = (html: string) => Array.from(html.matchAll(/href="([^"]+)"/g), (match) => match[1]);
    const amounts = (html: string) => html.match(/US\$[\d.,]*\d/g) ?? [];
    spanish.forEach((group, index) => {
      const other = translated[index];
      assert.equal(other.items.length, group.items.length, group.id);
      group.items.forEach((item, position) => {
        const answer = other.items[position];
        assert.equal(answer.featured, item.featured, item.title);
        assert.deepEqual(targets(answer.description), targets(item.description), `links of "${item.title}"`);
        assert.deepEqual(amounts(answer.description), amounts(item.description), `amounts of "${item.title}"`);
        assert.equal(/\.\./.test(answer.description), false, `two full stops in "${answer.title}"`);
      });
    });
    assert.deepEqual(
      featuredOf(translated).map((item) => item.featured),
      featuredOf(spanish).map((item) => item.featured)
    );
  });

  test(`it was translated: its sentences are not the Spanish ones, nor another language's (${locale})`, () => {
    const pieces: Array<[string, unknown, unknown, unknown, Rules, number]> = [
      ['the pages', UI[locale], UI.es, UI.en, TEXT_RULES, SAME_IN_TEXT],
      ['the data', content(locale), content('es'), content('en'), DATA_RULES, SAME_IN_DATA],
      ['the Worker', textOf(locale), textOf('es'), textOf('en'), TEXT_RULES, SAME_IN_TEXT],
      ['the questions', FAQ[locale](link), faqEs(link), faqEn(link), DATA_RULES, SAME_IN_TEXT],
    ];
    for (const [name, mine, spanish, english, facts, limit] of pieces) {
      const likeSpanish = sameAs(mine, spanish, facts);
      assert.ok(
        likeSpanish.same.length <= likeSpanish.total * limit,
        `${name}: ${likeSpanish.same.length} of ${likeSpanish.total} sentences are still in Spanish:${report(likeSpanish.same)}`
      );
      if (locale !== 'en') {
        const likeEnglish = sameAs(mine, english, facts);
        assert.ok(
          likeEnglish.same.length <= likeEnglish.total * limit,
          `${name}: ${likeEnglish.same.length} of ${likeEnglish.total} sentences are still in English:${report(likeEnglish.same)}`
        );
      }
      const script = SCRIPT[locale];
      if (script) {
        const share = shareIn(mine, script, facts);
        assert.ok(
          share >= 0.85,
          `${name}: only ${Math.round(share * 100)}% of the sentences are written in its script`
        );
      }
    }
  });

  test(`what cannot be brought: every example of the search finds one list, and items answer to words (${locale})`, () => {
    const { RESTRICTED_ITEMS, RESTRICTED_EXAMPLES } = content(locale);
    const groups = (['prohibited', 'notYet', 'seaOnly'] as const).map((id) => ({ id, ...RESTRICTED_ITEMS[id] }));
    assert.deepEqual(Object.keys(RESTRICTED_ITEMS).sort(), [...RESTRICTED_ORDER].sort());
    for (const group of groups) {
      for (const item of group.items) {
        assert.ok(item.match.length > 0, item.name);
        for (const word of item.match) assert.notEqual(plain(word), '', `"${word}" of ${item.name} has no letters`);
        // An item is found by its own name, in the list it is on or in a stricter one.
        assert.ok(findRestricted(item.name, groups), `searching "${item.name}" finds nothing`);
      }
    }
    for (const example of RESTRICTED_EXAMPLES) {
      const lists = groups.filter((group) => findRestricted(example, [group]));
      assert.equal(lists.length, 1, `the example "${example}" is on ${lists.length} lists`);
    }
    // What is on no list is never found.
    assert.equal(findRestricted('qzqzqz', groups), null);
  });

  test(`the legal texts exist, with the sections of the Spanish ones (${locale})`, () => {
    for (const name of ['terminos', 'privacidad']) {
      const file = new URL(`../data/legal/${name}.${locale}.md`, import.meta.url);
      assert.ok(existsSync(file), `src/data/legal/${name}.${locale}.md does not exist`);
      const text = readFileSync(file, 'utf8');
      const spanish = readFileSync(new URL(`../data/legal/${name}.es.md`, import.meta.url), 'utf8');
      const sections = (markdown: string) => (markdown.match(/^## /gm) ?? []).length;
      assert.match(text, /^---\ntitle: .+\n---\n/, `${name}.${locale}.md starts with its title`);
      assert.equal(sections(text), sections(spanish), `${name}.${locale}.md: sections`);
      if (locale !== 'en') {
        const english = readFileSync(new URL(`../data/legal/${name}.en.md`, import.meta.url), 'utf8');
        assert.notEqual(text, english, `${name}.${locale}.md is still the English text`);
      }
      assert.notEqual(text, spanish, `${name}.${locale}.md is still the Spanish text`);
    }
  });
}
