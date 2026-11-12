/**
 * The pages of the site and their address in each language.
 *
 * Spanish addresses are the ones used everywhere in the code and the data ("/cotizador",
 * "/servicios#aereo"): `localizePath` turns one into the address of the language being rendered.
 * Anchors and query parameters are the same in both languages (/en/quote?tarifa=maritimo), because
 * they are ids of the data, not text.
 *
 * `page` is the file in src/pages both addresses render from: the English address is the same page
 * rendered again (astro.config.ts injects it when ENGLISH_ENABLED is on).
 *
 * No imports besides locales.ts: the Worker builds its links with this file too.
 */
import { DEFAULT_LOCALE, type Locale } from './locales.ts';

export interface Route {
  es: string;
  en: string;
  /** Page file, relative to src/pages. */
  page: string;
}

export const ROUTES = {
  home: { es: '/', en: '/en', page: 'index.astro' },
  howToBuy: { es: '/como-comprar', en: '/en/how-to-buy', page: 'como-comprar.astro' },
  services: { es: '/servicios', en: '/en/services', page: 'servicios.astro' },
  quote: { es: '/cotizador', en: '/en/quote', page: 'cotizador.astro' },
  branches: { es: '/sucursales', en: '/en/branches', page: 'sucursales.astro' },
  faq: { es: '/preguntas-frecuentes', en: '/en/faq', page: 'preguntas-frecuentes.astro' },
  restricted: { es: '/articulos-prohibidos', en: '/en/prohibited-items', page: 'articulos-prohibidos.astro' },
  account: { es: '/mi-cuenta', en: '/en/my-account', page: 'mi-cuenta.astro' },
  signup: { es: '/registro', en: '/en/sign-up', page: 'registro.astro' },
  signupConfirm: { es: '/registro/confirmar', en: '/en/sign-up/confirm', page: 'registro/confirmar.astro' },
  signin: { es: '/ingresar', en: '/en/sign-in', page: 'ingresar.astro' },
  mailbox: { es: '/mi-casillero', en: '/en/my-mailbox', page: 'mi-casillero.astro' },
  business: { es: '/empresas', en: '/en/business', page: 'empresas.astro' },
  about: { es: '/nosotros', en: '/en/about', page: 'nosotros.astro' },
  terms: { es: '/terminos', en: '/en/terms', page: 'terminos.astro' },
  privacy: { es: '/privacidad', en: '/en/privacy', page: 'privacidad.astro' },
} as const satisfies Record<string, Route>;

export type RouteId = keyof typeof ROUTES;

const ROUTE_LIST: ReadonlyArray<Route> = Object.values(ROUTES);

/** "/cotizador?tarifa=aereo" → ["/cotizador", "?tarifa=aereo"] */
const splitPath = (path: string): [string, string] => {
  const at = path.search(/[?#]/);
  return at < 0 ? [path, ''] : [path.slice(0, at), path.slice(at)];
};

/** Without the trailing slash some hosts add: "/en/quote/" → "/en/quote". */
const trimEnd = (pathname: string): string => pathname.replace(/\/+$/, '') || '/';

/** The language of an address: English under /en, Spanish everywhere else. */
export const localeOfPath = (pathname: string): Locale => (/^\/en(\/|$)/.test(pathname) ? 'en' : DEFAULT_LOCALE);

const routeOfPath = (pathname: string): Route | undefined => {
  const path = trimEnd(pathname);
  return ROUTE_LIST.find((route) => route.es === path || route.en === path);
};

/** The address of a page in a language. */
export const pathOf = (id: RouteId, locale: Locale): string => ROUTES[id][locale];

/**
 * A Spanish site path, with its query and anchor, in the given language:
 * "/cotizador?tarifa=aereo" → "/en/quote?tarifa=aereo". What is not a page of ROUTES (an asset,
 * the API, an address outside the site) comes back unchanged.
 */
export const localizePath = (path: string, locale: Locale): string => {
  // An anchor on its own ("#tiendas") stays on the page it is on; so does anything that is not a site path.
  if (locale === DEFAULT_LOCALE || !path.startsWith('/')) return path;
  const [pathname, rest] = splitPath(path);
  const route = ROUTE_LIST.find((item) => item.es === trimEnd(pathname));
  return route ? `${route[locale]}${rest}` : path;
};

/** The same page in another language; undefined when the page has no translation (the blog, 404). */
export const alternatePath = (pathname: string, locale: Locale): string | undefined => routeOfPath(pathname)?.[locale];

/**
 * The Spanish address of a page, whatever language it was opened in: the key of what is kept per
 * page, such as the floating WhatsApp button's message.
 */
export const spanishPath = (pathname: string): string => routeOfPath(pathname)?.es ?? trimEnd(pathname);
