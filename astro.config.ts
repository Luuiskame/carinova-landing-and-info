import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig, fontProviders } from 'astro/config';

import { unified } from '@astrojs/markdown-remark';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import type { AstroIntegration } from 'astro';

import astrowind from './vendor/integration';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin } from './src/utils/frontmatter';
import { ACTIVE_LOCALES, DEFAULT_LOCALE, LOCALE_INFO, PUBLISHED_TRANSLATIONS } from './src/i18n/locales';
import { ROUTES, alternatePath, notFoundPathOf, pathIn, type Route } from './src/i18n/routes';
import { devApi } from './worker/dev-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

// The translations (src/i18n/locales.ts → PUBLISHED_TRANSLATIONS). Every address of a translation
// renders the same page file as its Spanish address (src/i18n/routes.ts); the page reads its
// language from the address. A language that is not published has none of these routes.
const translatedPages = (): AstroIntegration => ({
  name: 'carinova-translated-pages',
  hooks: {
    'astro:config:setup': ({ injectRoute }) => {
      for (const locale of PUBLISHED_TRANSLATIONS) {
        for (const route of Object.values<Route>(ROUTES)) {
          injectRoute({ pattern: pathIn(route, locale), entrypoint: `src/pages/${route.page}` });
        }
        injectRoute({ pattern: notFoundPathOf(locale), entrypoint: 'src/pages/404.astro' });
      }
    },
    // Cloudflare answers an address that does not exist with the nearest 404.html up the folders
    // (wrangler.jsonc → not_found_handling), so each language's has to be <language>/404.html. Astro
    // writes every page but the root 404 as <page>/index.html: move them.
    'astro:build:done': ({ dir }) => {
      for (const locale of PUBLISHED_TRANSLATIONS) {
        const notFound = notFoundPathOf(locale);
        const built = new URL(`.${notFound}/index.html`, dir);
        if (!fs.existsSync(built)) continue;
        fs.renameSync(built, new URL(`.${notFound}.html`, dir));
        fs.rmdirSync(new URL(`.${notFound}/`, dir));
      }
    },
  },
});

// Pages that search engines have no use for: what a confirmation link opens (noindex) and the
// translations' 404 pages. "Mi cuenta" stays: what it holds of a customer is fetched when they are
// signed in.
const PRIVATE_PAGES = ACTIVE_LOCALES.flatMap((locale) => [
  pathIn(ROUTES.signupConfirm, locale),
  notFoundPathOf(locale),
]);
const pathOfUrl = (url: string) => new URL(url).pathname.replace(/\/+$/, '') || '/';

export default defineConfig({
  output: 'static',

  // Prefetch a page when the visitor hovers or touches its link (works together with
  // <ClientRouter />). 'hover' instead of 'viewport' so phones on prepaid data don't
  // download every page linked from the home page.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  // Native Fonts API: self-hosts + subsets + preloads the fonts and generates
  // metric-adjusted fallbacks. Injected via <Font /> in Layout.astro and consumed
  // through the CSS variables in CustomStyles.astro: Inter for text and headings, as in
  // Carinova's prototype (the wordmark itself is an image: Logo.astro).
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['100 900'],
      styles: ['normal'],
      // Latin for Spanish, English, French and Portuguese; Cyrillic for Russian. A browser downloads
      // a subset only when the page has its letters. Chinese and Arabic use the device's own fonts.
      subsets: ['latin', 'cyrillic'],
      fallbacks: ['sans-serif'],
    },
    // The home page is the one Carinova wrote, set in Manrope (src/layouts/LandingLayout.astro). The
    // page came with the font inside its stylesheet; here it is a file of its own, so it is cached,
    // only the letters a page is written with are fetched and the text shows at once in a fallback
    // of the same metrics.
    //
    // That fallback is "Manrope Fallback", written by hand in landing.css, and not the one Astro
    // would generate (`optimizedFallbacks`): the generated one draws every weight in regular Arial,
    // and the page's titles are extra bold, so a title was a tenth narrower and much lighter until
    // Manrope arrived, and took a different number of lines at some widths.
    {
      provider: fontProviders.fontsource(),
      name: 'Manrope',
      cssVariable: '--font-manrope',
      weights: ['200 800'],
      styles: ['normal'],
      subsets: ['latin', 'cyrillic'],
      fallbacks: ['Manrope Fallback', 'sans-serif'],
      optimizedFallbacks: false,
    },
  ],

  integrations: [
    translatedPages(),
    sitemap({
      filter: (page) => !PRIVATE_PAGES.includes(pathOfUrl(page)),
      // With translations published, every page lists its languages (hreflang), Spanish as the
      // default. The addresses differ per language (/cotizador, /en/quote), so they come from
      // src/i18n/routes.ts instead of the integration's own `i18n` option, which expects /en/cotizador.
      serialize: (item) => {
        const pathname = pathOfUrl(item.url);
        const spanish = alternatePath(pathname, DEFAULT_LOCALE);
        if (ACTIVE_LOCALES.length < 2 || !spanish) return item;
        const origin = new URL(item.url).origin;
        const url = (path: string) => `${origin}${path === '/' ? '' : path}`;
        return {
          ...item,
          links: [
            ...ACTIVE_LOCALES.map((locale) => ({
              lang: LOCALE_INFO[locale].htmlLang,
              url: url(alternatePath(pathname, locale) ?? spanish),
            })),
            { lang: 'x-default', url: url(spanish) },
          ],
        };
      },
    }),
    mdx(),
    icon({
      // Local SVG icons (used as <Icon name="file-name" />) live next to the other assets.
      iconDir: 'src/assets/icons',
      include: {
        tabler: ['*'],
      },
    }),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ['dataLayer.push'] },
      })
    ),

    compress({
      // csso off on purpose: its parser doesn't understand the media range
      // syntax Tailwind v4 emits for breakpoints (`@media (width>=48rem)`) and
      // silently drops every one of those blocks — the site then renders as if
      // all `md:`/`lg:` classes were missing. lightningcss parses it correctly.
      CSS: { csso: false, lightningcss: { minify: true } },
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),

    astrowind({
      config: './src/config.yaml',
    }),
  ],

  image: {
    // Astro's default Sharp service handles local images.
    //
    // Most remote CDN images (Unsplash, Cloudinary, Imgix…) are routed by
    // src/components/common/Image.astro through `unpic`, which rewrites the
    // URL with CDN-side query parameters and serves it straight from the
    // provider — Astro never downloads it, so they don't need to be listed.
    //
    // `domains` only matters for remote URLs that fall through to Astro's
    // native <Image /> (i.e. providers Unpic can't detect, like Pixabay).
    // Listed entries are authorized to be processed by Sharp. Carinova only
    // uses local images, so none are listed.
    domains: [],

    // Emit responsive styles for the native <Image layout=…> used by
    // src/components/common/Image.astro (local images). Utility classes on
    // each usage still win, since these styles use low-specificity selectors.
    responsiveStyles: true,
  },

  markdown: {
    processor: unified({
      remarkPlugins: [readingTimeRemarkPlugin],
      rehypePlugins: [responsiveTablesRehypePlugin],
    }),
    shikiConfig: {
      // Code blocks follow the site theme; see the `.astro-code` rules in tailwind.css.
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },

  vite: {
    // devApi: the API (/api/*: sign-up, sign-in, companies) during `astro dev`. In production it is the
    // Cloudflare Worker in worker/index.ts; the pages stay static either way.
    plugins: [tailwindcss(), devApi()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
