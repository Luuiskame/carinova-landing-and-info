/**
 * Languages of the site.
 *
 * Spanish is the default language: its pages live at the root (/cotizador) and are the ones search
 * engines index for Nicaragua. Every other language is a translation of the same pages under its
 * own prefix (/en/quote, /fr/quote…). The versions of a page point at each other with hreflang, so a
 * translation never competes with the Spanish addresses or replaces them in search results.
 *
 * No imports: the Worker bundles this file and the unit tests run it on plain Node.
 */
export const LOCALES = ['es', 'en', 'fr', 'pt', 'zh', 'ru', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

/** A language that is not the default one: it lives under its own prefix. */
export type Translation = Exclude<Locale, 'es'>;

/**
 * The translations that are published, in the order the language menu lists them after Spanish.
 * Take a language out and none of its pages is built, nothing links to one and no page names it in
 * its hreflang; empty the list and the site is exactly the Spanish site
 * (docs/INFORMATION-ARCHITECTURE.md → "Languages").
 */
export const PUBLISHED_TRANSLATIONS: ReadonlyArray<Translation> = ['en', 'fr', 'pt', 'zh', 'ru', 'ar'];

/** The languages visitors can reach. */
export const ACTIVE_LOCALES: ReadonlyArray<Locale> = [DEFAULT_LOCALE, ...PUBLISHED_TRANSLATIONS];

export const isLocale = (value: unknown): value is Locale => LOCALES.includes(value as Locale);

/** The language a form was sent from (its `lang` field); Spanish when it is missing or unknown. */
export const localeFrom = (value: unknown): Locale => (isLocale(value) ? value : DEFAULT_LOCALE);

export interface LocaleInfo {
  /** What the language is called in its own words: what the language menu lists. */
  name: string;
  /** Two letters for the header's button. */
  code: string;
  /** For <html lang> and hreflang. */
  htmlLang: string;
  /** For Open Graph. */
  ogLocale: string;
  /** Which way it is written. */
  dir: 'ltr' | 'rtl';
  /** How dates are written for its readers (Intl). Arabic keeps the digits the prices are written with. */
  intl: string;
  /** What goes between two pieces of a sentence that a page joins: a space, or nothing in Chinese. */
  wordGap: ' ' | '';
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  es: { name: 'Español', code: 'ES', htmlLang: 'es', ogLocale: 'es_NI', dir: 'ltr', intl: 'es-NI', wordGap: ' ' },
  en: { name: 'English', code: 'EN', htmlLang: 'en', ogLocale: 'en_US', dir: 'ltr', intl: 'en-US', wordGap: ' ' },
  fr: { name: 'Français', code: 'FR', htmlLang: 'fr', ogLocale: 'fr_FR', dir: 'ltr', intl: 'fr-FR', wordGap: ' ' },
  pt: { name: 'Português', code: 'PT', htmlLang: 'pt', ogLocale: 'pt_BR', dir: 'ltr', intl: 'pt-BR', wordGap: ' ' },
  zh: { name: '中文', code: 'ZH', htmlLang: 'zh-Hans', ogLocale: 'zh_CN', dir: 'ltr', intl: 'zh-CN', wordGap: '' },
  ru: { name: 'Русский', code: 'RU', htmlLang: 'ru', ogLocale: 'ru_RU', dir: 'ltr', intl: 'ru-RU', wordGap: ' ' },
  ar: {
    name: 'العربية',
    code: 'AR',
    htmlLang: 'ar',
    ogLocale: 'ar_AR',
    dir: 'rtl',
    intl: 'ar-u-nu-latn',
    wordGap: ' ',
  },
};
