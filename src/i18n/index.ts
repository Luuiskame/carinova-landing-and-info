/**
 * What a page or a component needs to render in its language:
 *
 *   const { locale, href, data, ui } = i18n(Astro);
 *
 * - `locale`: the language of the address being rendered ("es" at the root, "en" under /en, "fr"
 *   under /fr…). Every page file renders every language; nothing has to be passed down to components.
 * - `href('/cotizador?tarifa=aereo')`: a Spanish site path as the address of this language, ready
 *   for an href ("/en/quote?tarifa=aereo").
 * - `data`: the site's data in this language (src/data/content.ts) plus the questions of faq.ts.
 * - `ui`: what the pages and the components say in this language (src/i18n/ui): one entry per
 *   page or component, named after it.
 *
 *   const t = ui.branchesPage;   // { title: 'Sucursales', … } or { title: 'Branches', … }
 *
 * Rules and the list of addresses: docs/INFORMATION-ARCHITECTURE.md → "Languages".
 */
import { faqGroups as faqAr } from '~/data/ar/faq';
import { content, type Content } from '~/data/content';
import { faqGroups as faqEn } from '~/data/en/faq';
import { faqGroups as faqEs, featuredOf, type FaqGroup, type FaqItem } from '~/data/faq';
import { faqGroups as faqFr } from '~/data/fr/faq';
import { faqGroups as faqPt } from '~/data/pt/faq';
import { faqGroups as faqRu } from '~/data/ru/faq';
import { faqGroups as faqZh } from '~/data/zh/faq';
import { getPermalink } from '~/utils/permalinks';
import { ACTIVE_LOCALES, DEFAULT_LOCALE, LOCALE_INFO, type Locale } from './locales';
import { alternatePath, homeOf, localeOfPath, localizePath } from './routes';
import { ui as uiAr } from './ui/ar';
import { ui as uiEn } from './ui/en';
import { ui as uiEs, type UI } from './ui/es';
import { ui as uiFr } from './ui/fr';
import { ui as uiPt } from './ui/pt';
import { ui as uiRu } from './ui/ru';
import { ui as uiZh } from './ui/zh';

export { ACTIVE_LOCALES, LOCALE_INFO, type Locale } from './locales';
export { pathOf, spanishPath, type RouteId } from './routes';
export type { UI } from './ui/es';

/** What the pages say, per language. A language without its dictionary does not compile. */
const UI_OF: Record<Locale, UI> = { es: uiEs, en: uiEn, fr: uiFr, pt: uiPt, zh: uiZh, ru: uiRu, ar: uiAr };

/** The questions of each language, as functions of how a link is written (faq.ts). */
const FAQ_OF: Record<Locale, typeof faqEs> = {
  es: faqEs,
  en: faqEn,
  fr: faqFr,
  pt: faqPt,
  zh: faqZh,
  ru: faqRu,
  ar: faqAr,
};

export interface PageData extends Content {
  FAQ_GROUPS: Array<FaqGroup>;
  /** The questions that also appear on the home page. */
  FEATURED_FAQS: Array<FaqItem>;
}

export interface PageI18n {
  locale: Locale;
  href: (path: string) => string;
  data: PageData;
  ui: UI;
}

const build = (locale: Locale): PageI18n => {
  const href = (path: string) => getPermalink(localizePath(path, locale));
  const groups = FAQ_OF[locale]((path, text) => `<a class="text-link underline" href="${href(path)}">${text}</a>`);
  return {
    locale,
    href,
    data: { ...content(locale), FAQ_GROUPS: groups, FEATURED_FAQS: featuredOf(groups) },
    ui: UI_OF[locale],
  };
};

const cache = new Map<Locale, PageI18n>();

export const i18n = (astro: { url: URL }): PageI18n => {
  const locale = localeOfPath(astro.url.pathname);
  let page = cache.get(locale);
  if (!page) cache.set(locale, (page = build(locale)));
  return page;
};

/** Whether the site is published in more than one language. */
export const isMultilingual = ACTIVE_LOCALES.length > 1;

/**
 * The hreflang links of a page: its address in each published language and the default (Spanish).
 * Empty while only Spanish is published, and for pages that exist in one language only (404, the
 * blog).
 */
export const alternatesOf = (pathname: string): Array<{ hreflang: string; path: string }> => {
  const spanish = alternatePath(pathname, DEFAULT_LOCALE);
  if (!isMultilingual || spanish === undefined) return [];
  const paths = ACTIVE_LOCALES.map((locale) => ({
    hreflang: LOCALE_INFO[locale].htmlLang,
    path: alternatePath(pathname, locale) ?? spanish,
  }));
  return [...paths, { hreflang: 'x-default', path: spanish }];
};

export interface LanguageOption {
  locale: Locale;
  /** This page in that language, or that language's home page when the page has no translation. */
  path: string;
  /** That language's home page. */
  home: string;
  /** Whether it is the language of the page. */
  current: boolean;
}

/**
 * What the language menu of a page offers: every published language, each leading to this same
 * page in it. Empty while only Spanish is published.
 */
export const languagesOf = (pathname: string): Array<LanguageOption> => {
  if (!isMultilingual) return [];
  const current = localeOfPath(pathname);
  return ACTIVE_LOCALES.map((locale) => ({
    locale,
    path: alternatePath(pathname, locale) ?? homeOf(locale),
    home: homeOf(locale),
    current: locale === current,
  }));
};
