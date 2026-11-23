// What the components of the home page share when they are rendered.
import { LOCALE_INFO, type Locale } from '~/i18n';

import type { IconId } from './icons';

// How a delivery time, the opening hours and the departments are written: utils/landing.ts (tested).
export { daysNumbers, daysRange, departmentOptions, hoursRange } from '~/utils/landing';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Text as it is written inside HTML. */
export const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, (character) => ESCAPES[character]);

/** A sentence with its amounts set in bold: "desde <strong>US$6.50</strong>". The result is HTML. */
export const emphasize = (text: string): string =>
  escapeHtml(text).replace(/US\$\s?[\d.,]*\d/g, (amount) => `<strong>${amount}</strong>`);

/**
 * A unit as it follows a price: "/lb" sits against it ("US$6.50/lb"); a word, as Arabic writes it
 * ("للرطل"), keeps the gap the language puts between two words.
 */
export const unitAfter = (locale: Locale, unit: string): string =>
  unit.startsWith('/') ? unit : `${LOCALE_INFO[locale].wordGap}${unit}`;

/**
 * The flag of each language in the language menu: the ones Carinova's page chose for its five, and
 * for the two the site adds, Russia's for Russian and Palestine's for Arabic (the developer's
 * choice: D-132).
 */
export const FLAGS: Record<Locale, IconId> = {
  es: 'flag-ni',
  en: 'flag-us',
  pt: 'flag-br',
  fr: 'flag-fr',
  zh: 'flag-cn',
  ru: 'flag-ru',
  ar: 'flag-ps',
};

/** The icon of each network of the footer, by the name it has in SOCIAL_LINKS. */
export const SOCIAL_ICONS: Record<string, IconId> = {
  Facebook: 's-facebook',
  Instagram: 's-instagram',
  TikTok: 's-tiktok',
};
