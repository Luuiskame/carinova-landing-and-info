/**
 * The site's data in the language being rendered: `content('en').RATES`, `content('es').WA_MESSAGES`.
 *
 * Spanish is written in carinova.ts, services.ts and signup.ts; every other language in the files of
 * the same name under its own folder (en/, fr/, pt/, zh/, ru/, ar/), which reuse every fact of the
 * Spanish ones. All of them have the same exports with the same types: `Content` is the Spanish
 * shape and each language must fit it, so a missing translation is a type error.
 *
 * What does not depend on the language (CONTACT, SITE_STATUS, SOCIAL_LINKS, LAST_MILE, REVIEWS,
 * CARINOVA_ID_EXAMPLE, the placeholders of the sign-up form, quotePath) is imported from its own
 * file. Pages get this through `i18n(Astro)` (src/i18n), which adds the questions of faq.ts.
 *
 * Runs on the Worker and on plain Node: relative imports with the .ts extension only.
 */
import type { Locale } from '../i18n/locales.ts';
import * as carinovaAr from './ar/carinova.ts';
import * as servicesAr from './ar/services.ts';
import { SIGNUP_COUNTRIES as countriesAr } from './ar/signup.ts';
import * as carinovaEs from './carinova.ts';
import * as carinovaEn from './en/carinova.ts';
import * as servicesEn from './en/services.ts';
import { SIGNUP_COUNTRIES as countriesEn } from './en/signup.ts';
import * as carinovaFr from './fr/carinova.ts';
import * as servicesFr from './fr/services.ts';
import { SIGNUP_COUNTRIES as countriesFr } from './fr/signup.ts';
import * as carinovaPt from './pt/carinova.ts';
import * as servicesPt from './pt/services.ts';
import { SIGNUP_COUNTRIES as countriesPt } from './pt/signup.ts';
import * as carinovaRu from './ru/carinova.ts';
import * as servicesRu from './ru/services.ts';
import { SIGNUP_COUNTRIES as countriesRu } from './ru/signup.ts';
import * as servicesEs from './services.ts';
import { SIGNUP_COUNTRIES as countriesEs, type SignupCountry } from './signup.ts';
import * as carinovaZh from './zh/carinova.ts';
import * as servicesZh from './zh/services.ts';
import { SIGNUP_COUNTRIES as countriesZh } from './zh/signup.ts';

/** What each language's carinova.ts has to export. */
type CarinovaWords = Pick<
  typeof carinovaEs,
  | 'TAGLINE'
  | 'HEADLINE'
  | 'VALUE_PROPOSITION'
  | 'CTA'
  | 'BRANCHES'
  | 'formatHours'
  | 'describeHours'
  | 'RECEPTION_POINTS'
  | 'RECEPTION_HOURS'
  | 'RATES'
  | 'MIAMI_ADDRESS'
  | 'miamiAddressRows'
  | 'RESTRICTED_ITEMS'
  | 'RESTRICTED_ORDER'
  | 'RESTRICTED_EXAMPLES'
  | 'STORE_CATEGORIES'
  | 'STORES'
  | 'WA_MESSAGES'
>;

/** What each language's services.ts has to export. */
type ServicesWords = Pick<
  typeof servicesEs,
  | 'SERVICE_AXES'
  | 'SERVICES'
  | 'servicesOf'
  | 'PROCESS_STEPS'
  | 'ACCOUNT_PARTS'
  | 'SHOPPING_EXAMPLES'
  | 'quoteExample'
  | 'FORMULA_EXAMPLE'
>;

const build = (carinova: CarinovaWords, services: ServicesWords, SIGNUP_COUNTRIES: Array<SignupCountry>) => ({
  TAGLINE: carinova.TAGLINE,
  HEADLINE: carinova.HEADLINE,
  VALUE_PROPOSITION: carinova.VALUE_PROPOSITION,
  CTA: carinova.CTA,
  BRANCHES: carinova.BRANCHES,
  formatHours: carinova.formatHours,
  describeHours: carinova.describeHours,
  RECEPTION_POINTS: carinova.RECEPTION_POINTS,
  RECEPTION_HOURS: carinova.RECEPTION_HOURS,
  RATES: carinova.RATES,
  MIAMI_ADDRESS: carinova.MIAMI_ADDRESS,
  miamiAddressRows: carinova.miamiAddressRows,
  RESTRICTED_ITEMS: carinova.RESTRICTED_ITEMS,
  RESTRICTED_ORDER: carinova.RESTRICTED_ORDER,
  RESTRICTED_EXAMPLES: carinova.RESTRICTED_EXAMPLES,
  STORE_CATEGORIES: carinova.STORE_CATEGORIES,
  STORES: carinova.STORES,
  WA_MESSAGES: carinova.WA_MESSAGES,

  SERVICE_AXES: services.SERVICE_AXES,
  SERVICES: services.SERVICES,
  servicesOf: services.servicesOf,
  PROCESS_STEPS: services.PROCESS_STEPS,
  ACCOUNT_PARTS: services.ACCOUNT_PARTS,
  SHOPPING_EXAMPLES: services.SHOPPING_EXAMPLES,
  quoteExample: services.quoteExample,
  FORMULA_EXAMPLE: services.FORMULA_EXAMPLE,

  SIGNUP_COUNTRIES,
});

export type Content = ReturnType<typeof build>;

const CONTENT: Record<Locale, Content> = {
  es: build(carinovaEs, servicesEs, countriesEs),
  en: build(carinovaEn, servicesEn, countriesEn),
  fr: build(carinovaFr, servicesFr, countriesFr),
  pt: build(carinovaPt, servicesPt, countriesPt),
  zh: build(carinovaZh, servicesZh, countriesZh),
  ru: build(carinovaRu, servicesRu, countriesRu),
  ar: build(carinovaAr, servicesAr, countriesAr),
};

export const content = (locale: Locale): Content => CONTENT[locale];
