// The reviews of the home page ("Lo que dicen nuestros clientes"): their order, each person's photo
// and initials, where each card links to and how it writes the month. Pure functions, shared by
// src/components/landing/Testimonials.astro and the unit tests (reviews.test.ts).
//
// Relative imports with the .ts extension: the unit tests run this on plain Node.
import { REVIEW_PHOTOS_URL, REVIEW_SOURCES, type Review, type ReviewSource } from '../data/carinova.ts';

/** Newest first. Two of the same day keep the order they have in the list. */
export const newestFirst = (reviews: ReadonlyArray<Review>): Array<Review> =>
  [...reviews].sort((a, b) => b.date.localeCompare(a.date));

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

/** The sources named under the cards: those that have a review in the list and an address. */
export const sourcesOf = (reviews: ReadonlyArray<Review>): Array<ReviewSource> =>
  (Object.keys(REVIEW_SOURCES) as Array<ReviewSource>).filter(
    (source) => REVIEW_SOURCES[source].url && reviews.some((review) => review.source === source)
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
