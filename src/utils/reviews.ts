// The reviews customers wrote (REVIEWS in src/data/carinova.ts), as the pages show them: their
// order, which of them the home page previews, each one's anchor on the page of reviews, the
// person's photo and initials, where a card links to and how it writes the month. Pure functions,
// shared by the home page (src/components/landing/Testimonials.astro), the page of reviews
// (/opiniones), the page about Carinova and the unit tests (reviews.test.ts).
//
// Relative imports with the .ts extension: the unit tests run this on plain Node.
import { REVIEW_PHOTOS_URL, REVIEW_SOURCES, type Review, type ReviewSource } from '../data/carinova.ts';

/** Newest first. Two of the same day keep the order they have in the list. */
export const newestFirst = (reviews: ReadonlyArray<Review>): Array<Review> =>
  [...reviews].sort((a, b) => b.date.localeCompare(a.date));

/**
 * The reviews a page previews: `count` of them, the newest. When they come from more than one
 * source the sources take turns (the newest of each, then the second of each…), starting with the
 * source of the newest review, so that Facebook and Google both show even when one of them has
 * all the recent ones. With one source it is simply the newest `count`.
 */
export const previewOf = (reviews: ReadonlyArray<Review>, count: number): Array<Review> => {
  const bySource = new Map<ReviewSource, Array<Review>>();
  for (const review of newestFirst(reviews)) {
    bySource.set(review.source, [...(bySource.get(review.source) ?? []), review]);
  }
  const lists = [...bySource.values()];
  const longest = Math.max(0, ...lists.map((list) => list.length));
  const picked: Array<Review> = [];
  for (let turn = 0; turn < longest; turn++) {
    for (const list of lists) if (turn < list.length) picked.push(list[turn]);
  }
  return picked.slice(0, Math.max(0, count));
};

/** "kenard-lopez-masis": a name as it can be written in an address. Empty without Latin letters or digits. */
const slug = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * The anchor of each review on the page of reviews: /opiniones#opinion-kenard-lopez-masis. It is
 * made of the author's name, so it can be read and shared; a second review under the same name
 * gets a number, and so does one whose name has no Latin letter. The oldest review keeps the plain
 * anchor: a link that was shared goes on leading to the same review when new ones arrive.
 */
export const reviewIds = (reviews: ReadonlyArray<Review>): Map<Review, string> => {
  const ids = new Map<Review, string>();
  const taken = new Map<string, number>();
  for (const review of newestFirst(reviews).reverse()) {
    const name = slug(review.name);
    const base = name ? `opinion-${name}` : 'opinion';
    const count = (taken.get(base) ?? 0) + 1;
    taken.set(base, count);
    ids.set(review, count === 1 ? base : `${base}-${count}`);
  }
  return ids;
};

/**
 * A review too long for a card of the home page, which shows the beginning of it and leads to the
 * whole on the page of reviews. Counted in characters, at the narrowest card (about 23 to a line,
 * seven lines), and in lines the person broke by hand.
 */
export const isLongReview = (text: string): boolean => text.length > 140 || text.split('\n').length > 5;

/**
 * The address of a person's photo: a full address stays as it is; a file name is looked for in the
 * bucket (REVIEW_PHOTOS_URL). Empty when there is nothing to show: the card shows initials.
 */
export const photoUrl = (photo: string | undefined, bucket: string = REVIEW_PHOTOS_URL): string => {
  if (!photo) return '';
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(photo)) return photo;
  return bucket ? `${bucket.replace(/\/+$/, '')}/${photo.replace(/^\/+/, '')}` : '';
};

/** First letter of a word, even when it is written with two code units. */
const firstLetter = (word = ''): string => Array.from(word)[0] ?? '';

/** "KM" for "Kenard López Masis": the first letters of the first and the last word of a name. */
export const initials = (name: string, lang = 'es'): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? firstLetter(words[0]) + firstLetter(words.at(-1)) : firstLetter(words[0]);
  return letters.toLocaleUpperCase(lang);
};

/** Where a card links to: the review itself, or else every review of its source. Empty: nowhere yet. */
export const reviewUrl = (review: Review): string => review.url || REVIEW_SOURCES[review.source].url;

/** The sources named on a page: those that have a review in the list and an address. */
export const sourcesOf = (reviews: ReadonlyArray<Review>): Array<ReviewSource> =>
  (Object.keys(REVIEW_SOURCES) as Array<ReviewSource>).filter(
    (source) => REVIEW_SOURCES[source].url && reviews.some((review) => review.source === source)
  );

/** "Facebook y Google": the names of the sources of a list of reviews, joined as the language joins a list. */
export const sourceNames = (intl: string, reviews: ReadonlyArray<Review>): string =>
  new Intl.ListFormat(intl, { style: 'long', type: 'conjunction' }).format(
    (Object.keys(REVIEW_SOURCES) as Array<ReviewSource>)
      .filter((source) => reviews.some((review) => review.source === source))
      .map((source) => REVIEW_SOURCES[source].name)
  );

/** "noviembre de 2026": the month and the year of a day (YYYY-MM-DD), as the language writes them. */
export const reviewMonth = (intl: string, date: string): string =>
  new Intl.DateTimeFormat(intl, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`)
  );

/** The paragraphs of a review: a blank line separates two; a single line break stays inside one. */
export const paragraphsOf = (text: string): Array<string> =>
  text
    .split(/\n[^\S\n]*\n\s*/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

/** A review with what a card needs to show it, worked out once. */
export type ReviewCard = Review & {
  /** Its anchor on the page of reviews. */
  id: string;
  paragraphs: Array<string>;
  initials: string;
  /** The address of the photo, or '' for the initials. */
  photoSrc: string;
  /** Where "Ver en Facebook" leads, or '' while its source has no address. */
  link: string;
  month: string;
  sourceName: string;
  /** The stars of a Google review; 0 for a recommendation on Facebook. */
  stars: number;
  long: boolean;
};

/**
 * The cards of some reviews (`shown`, in their order), as a language writes them. The anchors are
 * those the reviews have among `all` of them, so a card of the home page and its card on the page
 * of reviews agree.
 */
export const reviewCards = (
  shown: ReadonlyArray<Review>,
  intl: string,
  all: ReadonlyArray<Review> = shown
): Array<ReviewCard> => {
  const ids = reviewIds(all);
  return shown.map((review) => ({
    ...review,
    id: ids.get(review) ?? '',
    paragraphs: paragraphsOf(review.text),
    initials: initials(review.name, review.lang),
    photoSrc: photoUrl(review.photo),
    link: reviewUrl(review),
    month: reviewMonth(intl, review.date),
    sourceName: REVIEW_SOURCES[review.source].name,
    stars: review.source === 'google' ? review.rating : 0,
    long: isLongReview(review.text),
  }));
};
