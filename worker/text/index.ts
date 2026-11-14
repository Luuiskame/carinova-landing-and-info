/**
 * What the Worker says in each language: the e-mails it sends a customer (confirmation, welcome,
 * sign-in code) and the messages of the forms it checks (sign-up, sign-in, companies).
 *
 *   const t = textOf(locale).welcome;
 *
 * One module per language, all of the shape of the Spanish one (`ServerText`): a language without
 * its module, or a sentence missing in one, does not compile. The e-mails Carinova's team reads are
 * always in Spanish and are written where they are built.
 *
 * Runs on Workers and on plain Node: relative imports with the .ts extension only.
 */
import type { Locale } from '../../src/i18n/locales.ts';
import { text as ar } from './ar.ts';
import { text as en } from './en.ts';
import { text as es, type ServerText } from './es.ts';
import { text as fr } from './fr.ts';
import { text as pt } from './pt.ts';
import { text as ru } from './ru.ts';
import { text as zh } from './zh.ts';

export type { ServerText } from './es.ts';

const TEXT: Record<Locale, ServerText> = { es, en, fr, pt, zh, ru, ar };

export const textOf = (locale: Locale): ServerText => TEXT[locale];

/** What each language is called in Spanish, for the e-mails Carinova's team reads. */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  es: 'Español',
  en: 'Inglés',
  fr: 'Francés',
  pt: 'Portugués',
  zh: 'Chino',
  ru: 'Ruso',
  ar: 'Árabe',
};
