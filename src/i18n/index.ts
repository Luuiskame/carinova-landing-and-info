/**
 * What a page or a component needs to render in its language:
 *
 *   const { locale, href, data } = i18n(Astro);
 *
 * - `locale`: the language of the address being rendered ("es" at the root, "en" under /en). Every
 *   page file renders both; nothing has to be passed down to components.
 * - `href('/cotizador?tarifa=aereo')`: a Spanish site path as the address of this language, ready
 *   for an href ("/en/quote?tarifa=aereo").
 * - `data`: the site's data in this language (src/data/content.ts) plus the questions of faq.ts.
 *
 * Copy that belongs to one page or component is written in that file, both languages side by side:
 *
 *   const t = { es: { title: 'Sucursales' }, en: { title: 'Branches' } }[locale];
 *
 * Rules and the list of addresses: docs/INFORMATION-ARCHITECTURE.md → "Languages".
 */
import { content, type Content } from '~/data/content';
import { faqGroups as faqGroupsEn } from '~/data/en/faq';
import { faqGroups as faqGroupsEs, featuredOf, type FaqGroup, type FaqItem } from '~/data/faq';
import { getPermalink } from '~/utils/permalinks';
import { DEFAULT_LOCALE, ENGLISH_ENABLED, LOCALE_INFO, type Locale } from './locales';
import { alternatePath, localeOfPath, localizePath } from './routes';

export { ENGLISH_ENABLED, LOCALE_INFO, type Locale } from './locales';
export { pathOf, spanishPath, type RouteId } from './routes';

export interface PageData extends Content {
  FAQ_GROUPS: Array<FaqGroup>;
  /** The questions that also appear on the home page. */
  FEATURED_FAQS: Array<FaqItem>;
}

export interface PageI18n {
  locale: Locale;
  href: (path: string) => string;
  data: PageData;
}

const build = (locale: Locale): PageI18n => {
  const href = (path: string) => getPermalink(localizePath(path, locale));
  const groups = (locale === 'en' ? faqGroupsEn : faqGroupsEs)(
    (path, text) => `<a class="text-link underline" href="${href(path)}">${text}</a>`
  );
  return {
    locale,
    href,
    data: { ...content(locale), FAQ_GROUPS: groups, FEATURED_FAQS: featuredOf(groups) },
  };
};

const cache = new Map<Locale, PageI18n>();

export const i18n = (astro: { url: URL }): PageI18n => {
  const locale = localeOfPath(astro.url.pathname);
  let page = cache.get(locale);
  if (!page) cache.set(locale, (page = build(locale)));
  return page;
};

/**
 * The hreflang links of a page: its address in each language and the default (Spanish). Empty while
 * the English version is off, and for pages that exist in one language only (404, the blog).
 */
export const alternatesOf = (pathname: string): Array<{ hreflang: string; path: string }> => {
  if (!ENGLISH_ENABLED) return [];
  const es = alternatePath(pathname, 'es');
  const en = alternatePath(pathname, 'en');
  if (!es || !en) return [];
  return [
    { hreflang: LOCALE_INFO.es.htmlLang, path: es },
    { hreflang: LOCALE_INFO.en.htmlLang, path: en },
    { hreflang: 'x-default', path: es },
  ];
};

/**
 * Where the language switch of a page leads: the same page in the other language, or that
 * language's home page when the page has no translation. Undefined while English is off.
 */
export const languageSwitchOf = (pathname: string): { locale: Locale; path: string } | undefined => {
  if (!ENGLISH_ENABLED) return undefined;
  const other: Locale = localeOfPath(pathname) === DEFAULT_LOCALE ? 'en' : DEFAULT_LOCALE;
  return { locale: other, path: alternatePath(pathname, other) ?? (other === 'en' ? '/en' : '/') };
};
