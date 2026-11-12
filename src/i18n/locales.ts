/**
 * Languages of the site.
 *
 * Spanish is the default language: its pages live at the root (/cotizador) and are the ones search
 * engines index for Nicaragua. English is a translation of the same pages under /en (/en/quote).
 * The two versions of a page point at each other with hreflang, so the English pages never compete
 * with the Spanish addresses or replace them in search results.
 *
 * No imports: the Worker bundles this file and the unit tests run it on plain Node.
 */
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

/**
 * Switch of the English version. While it is false no /en page is built, nothing links to one, the
 * language switch is hidden and the Spanish pages carry no hreflang: the site is exactly the Spanish
 * site. Set it to true to publish the translation (docs/INFORMATION-ARCHITECTURE.md → "Languages").
 */
export const ENGLISH_ENABLED = true;

/** The languages visitors can reach. */
export const ACTIVE_LOCALES: ReadonlyArray<Locale> = ENGLISH_ENABLED ? LOCALES : [DEFAULT_LOCALE];

export const isLocale = (value: unknown): value is Locale => LOCALES.includes(value as Locale);

/** The language a form was sent from (its `lang` field); Spanish when it is missing or unknown. */
export const localeFrom = (value: unknown): Locale => (isLocale(value) ? value : DEFAULT_LOCALE);

/** What each language is called in its own words, and its codes for <html lang> and Open Graph. */
export const LOCALE_INFO: Record<Locale, { name: string; htmlLang: string; ogLocale: string }> = {
  es: { name: 'Español', htmlLang: 'es', ogLocale: 'es_NI' },
  en: { name: 'English', htmlLang: 'en', ogLocale: 'en_US' },
};
