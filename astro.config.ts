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
import { ENGLISH_ENABLED, LOCALE_INFO } from './src/i18n/locales';
import { ROUTES, alternatePath, type Route } from './src/i18n/routes';
import { devApi } from './worker/dev-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

// The English version (src/i18n/locales.ts → ENGLISH_ENABLED). Every English address renders the
// same page file as its Spanish address (src/i18n/routes.ts); the page reads its language from the
// address. While the switch is off, none of these routes exist.
const ENGLISH_NOT_FOUND = '/en/404';
const englishPages = (): AstroIntegration => ({
  name: 'carinova-english-pages',
  hooks: {
    'astro:config:setup': ({ injectRoute }) => {
      if (!ENGLISH_ENABLED) return;
      for (const route of Object.values<Route>(ROUTES)) {
        injectRoute({ pattern: route.en, entrypoint: `src/pages/${route.page}` });
      }
      injectRoute({ pattern: ENGLISH_NOT_FOUND, entrypoint: 'src/pages/404.astro' });
    },
    // Cloudflare answers an address that does not exist with the nearest 404.html up the folders
    // (wrangler.jsonc → not_found_handling), so the English one has to be en/404.html. Astro writes
    // every page but the root 404 as <page>/index.html: move it.
    'astro:build:done': ({ dir }) => {
      const built = new URL(`.${ENGLISH_NOT_FOUND}/index.html`, dir);
      if (!fs.existsSync(built)) return;
      fs.renameSync(built, new URL(`.${ENGLISH_NOT_FOUND}.html`, dir));
      fs.rmdirSync(new URL(`.${ENGLISH_NOT_FOUND}/`, dir));
    },
  },
});

// Pages that search engines have no use for: what a confirmation link opens (noindex) and the
// English 404 page. "Mi cuenta" stays: what it holds of a customer is fetched when they are signed in.
const PRIVATE_PAGES = [ROUTES.signupConfirm.es, ROUTES.signupConfirm.en, ENGLISH_NOT_FOUND];
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
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
  ],

  integrations: [
    englishPages(),
    sitemap({
      filter: (page) => !PRIVATE_PAGES.includes(pathOfUrl(page)),
      // With the English version on, every page lists its two languages (hreflang), Spanish as the
      // default. The addresses differ per language (/cotizador, /en/quote), so the pairs come from
      // src/i18n/routes.ts instead of the integration's own `i18n` option, which expects /en/cotizador.
      serialize: (item) => {
        if (!ENGLISH_ENABLED) return item;
        const pathname = pathOfUrl(item.url);
        const es = alternatePath(pathname, 'es');
        const en = alternatePath(pathname, 'en');
        if (!es || !en) return item;
        const origin = new URL(item.url).origin;
        const url = (path: string) => `${origin}${path === '/' ? '' : path}`;
        return {
          ...item,
          links: [
            { lang: LOCALE_INFO.es.htmlLang, url: url(es) },
            { lang: LOCALE_INFO.en.htmlLang, url: url(en) },
            { lang: 'x-default', url: url(es) },
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
