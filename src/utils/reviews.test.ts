// The reviews customers wrote: each one complete and real-looking (no blank, no day that does not
// exist or has not come yet), in order, and with the right photo, link, initials and month.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { REVIEWS, REVIEW_SOURCES, type Review } from '../data/carinova.ts';
import { LOCALE_INFO, type Locale } from '../i18n/locales.ts';
import {
  initials,
  isLongReview,
  newestFirst,
  paragraphsOf,
  photoUrl,
  previewOf,
  reviewCards,
  reviewIds,
  reviewMonth,
  reviewUrl,
  sourceNames,
  sourcesOf,
} from './reviews.ts';

const review = (changes: Partial<Review> = {}): Review =>
  ({ source: 'facebook', name: 'Ana Pérez', text: 'Muy bien.', lang: 'es', date: '2026-08-03', ...changes }) as Review;

test('every review has a name, its words, their language, a day that exists and has come, and a source', () => {
  const today = new Date().toISOString().slice(0, 10);
  for (const { name, text, lang, date, source, url, photo, ...rest } of REVIEWS) {
    const who = `the review of "${name}"`;
    assert.ok(name && name === name.trim() && !/\s{2}/.test(name), `${who}: its name`);
    assert.ok(text && text === text.trim(), `${who}: its words`);
    assert.match(lang, /^[a-z]{2,3}(-[A-Za-z\d]+)*$/, `${who}: its language`);
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/, `${who}: its day is written YYYY-MM-DD`);
    assert.equal(new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10), date, `${who}: its day exists`);
    assert.ok(date <= today, `${who}: its day has not come yet`);
    assert.ok(source in REVIEW_SOURCES, `${who}: "${source}" is not a source of REVIEW_SOURCES`);
    if (source === 'google') {
      const { rating } = rest as { rating: number };
      assert.ok(Number.isInteger(rating) && rating >= 1 && rating <= 5, `${who}: its stars`);
    }
    if (url) assert.match(url, /^https:\/\//, `${who}: its address`);
    if (photo) assert.doesNotMatch(photo, /\s/, `${who}: the name of its photo has spaces`);
  }
});

test('no review is in the list twice', () => {
  const seen = new Set(REVIEWS.map(({ name, text }) => `${name}\n${text}`));
  assert.equal(seen.size, REVIEWS.length);
});

test('each source has its name, and an address that is a secure link or nothing yet', () => {
  for (const [id, { name, url }] of Object.entries(REVIEW_SOURCES)) {
    assert.ok(name.trim(), `${id}: its name`);
    if (url) assert.match(url, /^https:\/\//, `${id}: its address`);
  }
});

test('the newest review first; two of the same day keep their order', () => {
  const list = [
    review({ name: 'A', date: '2026-07-04' }),
    review({ name: 'B', date: '2026-11-19' }),
    review({ name: 'C', date: '2026-11-19' }),
    review({ name: 'D', date: '2026-11-20' }),
  ];
  assert.deepEqual(
    newestFirst(list).map(({ name }) => name),
    ['D', 'B', 'C', 'A']
  );
  assert.equal(list[0].name, 'A', 'the list itself is not reordered');
});

test('a photo is a file of the bucket or an address of its own; without them, the initials', () => {
  const bucket = 'https://media.example.com/resenas';
  assert.equal(photoUrl('ana-perez.jpg', bucket), 'https://media.example.com/resenas/ana-perez.jpg');
  assert.equal(photoUrl('/ana-perez.jpg', `${bucket}/`), 'https://media.example.com/resenas/ana-perez.jpg');
  assert.equal(photoUrl('https://cdn.example.com/a.webp', bucket), 'https://cdn.example.com/a.webp');
  assert.equal(photoUrl('https://cdn.example.com/a.webp', ''), 'https://cdn.example.com/a.webp');
  assert.equal(photoUrl('ana-perez.jpg', ''), '', 'no bucket yet');
  assert.equal(photoUrl(undefined, bucket), '');
  assert.equal(photoUrl('', bucket), '');
});

test('the initials are the first letters of the first and the last word of the name', () => {
  assert.equal(initials('Kenard López Masis'), 'KM');
  assert.equal(initials('Emily N Gutierrez'), 'EG');
  assert.equal(initials('James Trace Lewis', 'en'), 'JL');
  assert.equal(initials('  élgen   tinoco '), 'ÉT');
  assert.equal(initials('Brian'), 'B');
  assert.equal(initials('𝓐na Ruiz'), '𝓐R', 'a letter written with two code units stays whole');
  for (const { name, lang } of REVIEWS) assert.ok(initials(name, lang).length > 0, name);
});

test('a card links to its review, or else to every review of its source', () => {
  const own = 'https://www.facebook.com/permalink.php?story_fbid=1&id=2';
  assert.equal(reviewUrl(review({ url: own })), own);
  assert.equal(reviewUrl(review()), REVIEW_SOURCES.facebook.url);
});

test('a source is named under the cards when it has a review and an address', () => {
  const facebook = review();
  const google = review({ source: 'google', rating: 5 } as Partial<Review>);
  assert.deepEqual(sourcesOf([]), []);
  assert.deepEqual(sourcesOf([facebook]), REVIEW_SOURCES.facebook.url ? ['facebook'] : []);
  assert.deepEqual(
    sourcesOf([facebook, google]),
    (['facebook', 'google'] as const).filter((source) => REVIEW_SOURCES[source].url)
  );
});

test('the month and the year of a review, as each language writes them', () => {
  const month = (locale: Locale) => reviewMonth(LOCALE_INFO[locale].intl, '2026-11-20');
  assert.equal(month('es'), 'noviembre de 2026');
  assert.equal(month('en'), 'November 2026');
  assert.equal(month('fr'), 'novembre 2026');
  assert.equal(month('pt'), 'novembro de 2026');
  assert.equal(month('zh'), '2026年11月');
  assert.equal(month('ru'), 'ноябрь 2026 г.');
  assert.equal(month('ar'), 'نوفمبر 2026');
  // The first and the last day of a month stay in it, wherever the build runs.
  assert.equal(reviewMonth('es-NI', '2026-08-01'), 'agosto de 2026');
  assert.equal(reviewMonth('es-NI', '2026-07-31'), 'julio de 2026');
});

test('a blank line separates two paragraphs; a single line break stays inside one', () => {
  assert.deepEqual(paragraphsOf('Muy útil ⭐⭐⭐⭐⭐\n\nBuena comunicación.'), [
    'Muy útil ⭐⭐⭐⭐⭐',
    'Buena comunicación.',
  ]);
  assert.deepEqual(paragraphsOf('Fácil, rápido y seguro.\nExcelente servicio'), [
    'Fácil, rápido y seguro.\nExcelente servicio',
  ]);
  assert.deepEqual(paragraphsOf('Uno.\n \n\nDos.'), ['Uno.', 'Dos.']);
  assert.deepEqual(paragraphsOf('Solo esto.'), ['Solo esto.']);
});

test('the home page previews the newest reviews, and with two sources they take turns', () => {
  const facebook = (name: string, date: string) => review({ name, date });
  const google = (name: string, date: string) => review({ name, date, source: 'google', rating: 5 } as Partial<Review>);
  const onlyFacebook = [facebook('A', '2026-07-01'), facebook('B', '2026-09-01'), facebook('C', '2026-08-01')];
  assert.deepEqual(
    previewOf(onlyFacebook, 2).map(({ name }) => name),
    ['B', 'C']
  );
  assert.deepEqual(previewOf(onlyFacebook, 0), []);
  assert.equal(previewOf(onlyFacebook, 9).length, 3);

  // Google has the three newest: Facebook still shows, every other card.
  const mixed = [
    google('G1', '2026-11-03'),
    google('G2', '2026-11-02'),
    google('G3', '2026-11-01'),
    facebook('F1', '2026-10-03'),
    facebook('F2', '2026-10-02'),
  ];
  assert.deepEqual(
    previewOf(mixed, 4).map(({ name }) => name),
    ['G1', 'F1', 'G2', 'F2']
  );
  // When one source runs out, the other goes on.
  assert.deepEqual(
    previewOf(mixed, 5).map(({ name }) => name),
    ['G1', 'F1', 'G2', 'F2', 'G3']
  );
  assert.equal(mixed[0].name, 'G1', 'the list itself is not reordered');
});

test('each review has an anchor of its own on the page of reviews, which a new review does not change', () => {
  const ids = reviewIds(REVIEWS);
  const all = REVIEWS.map((item) => ids.get(item));
  assert.equal(new Set(all).size, REVIEWS.length, 'two reviews share an anchor');
  for (const id of all) assert.match(id ?? '', /^opinion(-[a-z0-9]+)*$/);
  assert.equal(
    ids.get(REVIEWS.find(({ name }) => name === 'Kenard López Masis') as Review),
    'opinion-kenard-lopez-masis'
  );

  const first = review({ name: 'Ana Pérez', date: '2026-01-10' });
  const second = review({ name: 'Ana Pérez', text: 'Otra vez, muy bien.', date: '2026-03-10' });
  const unnamed = review({ name: '王芳', date: '2026-02-01' });
  const anchors = reviewIds([second, unnamed, first]);
  assert.equal(anchors.get(first), 'opinion-ana-perez', 'the oldest keeps the plain anchor');
  assert.equal(anchors.get(second), 'opinion-ana-perez-2');
  assert.equal(anchors.get(unnamed), 'opinion');
  // A newer review by somebody else leaves the others where they were.
  const later = reviewIds([review({ name: 'Luis Soto', date: '2026-05-01' }), second, unnamed, first]);
  assert.equal(later.get(first), 'opinion-ana-perez');
  assert.equal(later.get(second), 'opinion-ana-perez-2');
});

test('a long review is shown by its beginning on the home page; the others whole', () => {
  assert.equal(isLongReview('Excelente servicio! Super recomendados! Rápido, seguro y fácil'), false);
  assert.equal(isLongReview('Muy útil ⭐⭐⭐⭐⭐\n\nBuena comunicación.'), false);
  assert.equal(isLongReview('a'.repeat(141)), true);
  assert.equal(isLongReview('uno\ndos\ntres\ncuatro\ncinco\nseis'), true);
  // Today: only the long one of November.
  assert.deepEqual(
    REVIEWS.filter(({ text }) => isLongReview(text)).map(({ name }) => name),
    ['Otoniel Marin']
  );
});

test('the sources of a page are named as its language joins a list', () => {
  const facebook = review();
  const google = review({ source: 'google', rating: 4 } as Partial<Review>);
  assert.equal(sourceNames('es-NI', [facebook]), 'Facebook');
  assert.equal(sourceNames('es-NI', [google, facebook]), 'Facebook y Google');
  assert.equal(sourceNames('en-US', [facebook, google]), 'Facebook and Google');
  assert.equal(sourceNames('fr-FR', [facebook, google]), 'Facebook et Google');
  assert.equal(sourceNames('es-NI', []), '');
});

test('a card has what it shows worked out: anchor, paragraphs, initials, month, link and stars', () => {
  const google = review({ name: 'Luis Soto', source: 'google', rating: 4, date: '2026-10-05' } as Partial<Review>);
  const facebook = review({ text: 'Uno.\n\nDos.', photo: 'https://cdn.example.com/ana.webp' });
  const [card] = reviewCards([facebook], 'es-NI', [google, facebook]);
  assert.equal(card.id, 'opinion-ana-perez');
  assert.deepEqual(card.paragraphs, ['Uno.', 'Dos.']);
  assert.equal(card.initials, 'AP');
  assert.equal(card.photoSrc, 'https://cdn.example.com/ana.webp');
  assert.equal(card.month, 'agosto de 2026');
  assert.equal(card.sourceName, 'Facebook');
  assert.equal(card.link, REVIEW_SOURCES.facebook.url);
  assert.equal(card.stars, 0);
  assert.equal(card.long, false);
  const [starred] = reviewCards([google], 'en-US');
  assert.deepEqual([starred.stars, starred.sourceName, starred.month], [4, 'Google', 'October 2026']);
  // Every review of the site makes a card, in every order asked for.
  assert.deepEqual(
    reviewCards(newestFirst(REVIEWS), 'es-NI').map(({ name }) => name),
    newestFirst(REVIEWS).map(({ name }) => name)
  );
});
