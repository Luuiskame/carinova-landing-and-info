/**
 * The site's data in the language being rendered: `content('en').RATES`, `content('es').WA_MESSAGES`.
 *
 * Spanish is written in carinova.ts, services.ts and signup.ts; English in the files of the same
 * name under en/, which reuse every fact of the Spanish ones. Both sides have the same exports with
 * the same types: `Content` is the Spanish shape and the English object must fit it, so a missing
 * translation is a type error.
 *
 * What does not depend on the language (CONTACT, SITE_STATUS, SOCIAL_LINKS, LAST_MILE, REVIEWS,
 * CARINOVA_ID_EXAMPLE, the placeholders of the sign-up form, quotePath) is imported from its own
 * file. Pages get this through `i18n(Astro)` (src/i18n), which adds the questions of faq.ts.
 *
 * Runs on the Worker and on plain Node: relative imports with the .ts extension only.
 */
import type { Locale } from '../i18n/locales.ts';
import * as carinovaEs from './carinova.ts';
import * as carinovaEn from './en/carinova.ts';
import * as servicesEs from './services.ts';
import * as servicesEn from './en/services.ts';
import { SIGNUP_COUNTRIES as COUNTRIES_ES } from './signup.ts';
import { SIGNUP_COUNTRIES as COUNTRIES_EN } from './en/signup.ts';

const es = {
  VALUE_PROPOSITION: carinovaEs.VALUE_PROPOSITION,
  VALUE_PROPOSITION_HIGHLIGHT: carinovaEs.VALUE_PROPOSITION_HIGHLIGHT,
  CTA: carinovaEs.CTA,
  BRANCHES: carinovaEs.BRANCHES,
  formatHours: carinovaEs.formatHours,
  describeHours: carinovaEs.describeHours,
  RECEPTION_POINTS: carinovaEs.RECEPTION_POINTS,
  RATES: carinovaEs.RATES,
  MIAMI_ADDRESS: carinovaEs.MIAMI_ADDRESS,
  miamiAddressRows: carinovaEs.miamiAddressRows,
  RESTRICTED_ITEMS: carinovaEs.RESTRICTED_ITEMS,
  STORES: carinovaEs.STORES,
  WA_MESSAGES: carinovaEs.WA_MESSAGES,

  SERVICE_AXES: servicesEs.SERVICE_AXES,
  SERVICES: servicesEs.SERVICES,
  servicesOf: servicesEs.servicesOf,
  PROCESS_STEPS: servicesEs.PROCESS_STEPS,
  ACCOUNT_PARTS: servicesEs.ACCOUNT_PARTS,
  SHOPPING_EXAMPLES: servicesEs.SHOPPING_EXAMPLES,
  quoteExample: servicesEs.quoteExample,
  FORMULA_EXAMPLE: servicesEs.FORMULA_EXAMPLE,

  SIGNUP_COUNTRIES: COUNTRIES_ES,
};

export type Content = typeof es;

const en: Content = {
  VALUE_PROPOSITION: carinovaEn.VALUE_PROPOSITION,
  VALUE_PROPOSITION_HIGHLIGHT: carinovaEn.VALUE_PROPOSITION_HIGHLIGHT,
  CTA: carinovaEn.CTA,
  BRANCHES: carinovaEn.BRANCHES,
  formatHours: carinovaEn.formatHours,
  describeHours: carinovaEn.describeHours,
  RECEPTION_POINTS: carinovaEn.RECEPTION_POINTS,
  RATES: carinovaEn.RATES,
  MIAMI_ADDRESS: carinovaEn.MIAMI_ADDRESS,
  miamiAddressRows: carinovaEn.miamiAddressRows,
  RESTRICTED_ITEMS: carinovaEn.RESTRICTED_ITEMS,
  STORES: carinovaEn.STORES,
  WA_MESSAGES: carinovaEn.WA_MESSAGES,

  SERVICE_AXES: servicesEn.SERVICE_AXES,
  SERVICES: servicesEn.SERVICES,
  servicesOf: servicesEn.servicesOf,
  PROCESS_STEPS: servicesEn.PROCESS_STEPS,
  ACCOUNT_PARTS: servicesEn.ACCOUNT_PARTS,
  SHOPPING_EXAMPLES: servicesEn.SHOPPING_EXAMPLES,
  quoteExample: servicesEn.quoteExample,
  FORMULA_EXAMPLE: servicesEn.FORMULA_EXAMPLE,

  SIGNUP_COUNTRIES: COUNTRIES_EN,
};

export const content = (locale: Locale): Content => (locale === 'en' ? en : es);
