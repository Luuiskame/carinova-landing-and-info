// How the home page writes a few facts the way Carinova's page writes them: a delivery time, the
// hours a place is open, the departments of a form. Pure functions, shared by the components of the
// page (src/components/landing) and the unit tests.
//
// Relative imports with the .ts extension: the unit tests run this on plain Node.
import { DEPARTMENTS } from '../data/landing.ts';
import type { Locale } from '../i18n/locales.ts';

/** "2–4": the days of a delivery, as numbers. */
export const daysNumbers = ([min, max]: [number, number]): string => `${min}–${max}`;

/**
 * "2–4 días": a delivery time as Carinova's page writes it, the numbers, a space and the word, in
 * every language (its Chinese too: "2–4 天").
 */
export const daysRange = (days: [number, number], word: string): string => `${daysNumbers(days)} ${word}`;

interface Clock {
  hour: number;
  minutes: number;
}
/** A time of the day ("08:00") as its hour and its minutes. */
const clock = (time: string): Clock => {
  const [hour = 0, minutes = 0] = time.split(':').map(Number);
  return { hour, minutes };
};
const two = (minutes: number): string => String(minutes).padStart(2, '0');
const twelve = ({ hour, minutes }: Clock): string => `${hour % 12 || 12}:${two(minutes)}`;
const twentyFour = ({ hour, minutes }: Clock): string => `${hour}:${two(minutes)}`;
/** No line break inside the hours: they are read as one thing. */
const NBSP = '\u00a0';

/** How each language writes one time of the day; the others write it as Spanish does. */
const TIME: Partial<Record<Locale, (time: Clock) => string>> = {
  fr: ({ hour, minutes }) => `${hour}${NBSP}h${minutes ? `${NBSP}${two(minutes)}` : ''}`,
  pt: ({ hour, minutes }) => `${hour}h${minutes ? two(minutes) : ''}`,
  zh: (time) => `${time.hour < 12 ? '上午' : '下午'}${NBSP}${twelve(time)}`,
  ru: twentyFour,
  ar: (time) => `${twelve(time)}${NBSP}${time.hour < 12 ? 'ص' : 'م'}`,
};
const meridiem = (time: Clock): string => `${twelve(time)}${NBSP}${time.hour < 12 ? 'a.m.' : 'p.m.'}`;

/**
 * The hours a place is open, written the way Carinova's page writes them in each language:
 * "8:00 a.m. – 5:00 p.m." in Spanish and English, "8 h – 17 h" in French, "8h – 17h" in Portuguese,
 * "上午 8:00 – 下午 5:00" in Chinese (and "8:00–17:00" in Russian, which the page did not have).
 * The times themselves are the ones of src/data.
 */
export const hoursRange = (locale: Locale, { opens, closes }: { opens: string; closes: string }): string => {
  const write = TIME[locale] ?? meridiem;
  return [write(clock(opens)), write(clock(closes))].join(locale === 'ru' ? '–' : `${NBSP}–${NBSP}`);
};

/**
 * The departments as a form lists them: "Managua (MG)", the two regions of the Caribbean coast by
 * the name the page's language gives them. `value` is the name the page's scripts and messages
 * use, the same in every language.
 */
export const departmentOptions = (regions: { north: string; south: string }): Array<{ value: string; label: string }> =>
  DEPARTMENTS.map(({ name, code, region }) => ({
    value: name,
    label: `${region ? regions[region] : name} (${code})`,
  }));
