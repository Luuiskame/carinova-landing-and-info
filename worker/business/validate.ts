/**
 * Validates and normalises what a company sends from /empresas. As with the sign-up, these rules
 * decide: the form's own checks only save the visitor a round trip. The options and limits are in
 * src/data/business.ts, read by the page too.
 */
import { BUSINESS_LIMITS, BUSINESS_MESSAGE_MIN, BUSINESS_VOLUMES } from '../../src/data/business.ts';
import { content } from '../../src/data/content.ts';
import type { Locale } from '../../src/i18n/locales.ts';
import { normalizePhone } from '../signup/validate.ts';
import { NAME, clean, cleanEmail, cleanLines, isEmail } from '../validation.ts';

export interface BusinessInquiry {
  company: string;
  contactName: string;
  /** Lower case. */
  email: string;
  /** E.164: "+" and digits. */
  phone: string;
  /** ISO 3166-1 alpha-2 code of one of SIGNUP_COUNTRIES. */
  country: string;
  city: string;
  /** Id of one of BUSINESS_VOLUMES; empty when not given. */
  volume: string;
  /** May have several lines. */
  message: string;
}

export type BusinessField = keyof BusinessInquiry;
export type BusinessErrors = Partial<Record<BusinessField, string>>;
export type BusinessResult = { ok: true; data: BusinessInquiry } | { ok: false; fields: BusinessErrors };

const MESSAGES = {
  es: {
    company: 'Escribí el nombre de tu empresa.',
    companyLength: `El nombre de la empresa debe tener de 2 a ${BUSINESS_LIMITS.company} caracteres.`,
    contactName: 'Escribí tu nombre.',
    contactNameInvalid: `Usá solo letras en tu nombre (entre 2 y ${BUSINESS_LIMITS.contactName} caracteres).`,
    email: 'Escribí tu correo electrónico.',
    emailInvalid: 'Revisá tu correo: no parece válido.',
    phone: 'Escribí tu teléfono.',
    phoneInvalid: (example: string) =>
      `Escribí el número completo, por ejemplo ${example}. Si es de otro país, empezá con + y el código del país.`,
    country: 'Elegí un país.',
    city: 'Escribí tu ciudad.',
    cityLength: `Tu ciudad debe tener de 2 a ${BUSINESS_LIMITS.city} caracteres.`,
    volume: 'Elegí una de las opciones.',
    message: 'Contanos qué necesita tu empresa.',
    messageShort: 'Contanos un poco más sobre lo que necesita tu empresa.',
    messageLong: `Usá ${BUSINESS_LIMITS.message} caracteres como máximo.`,
  },
  en: {
    company: 'Enter the name of your company.',
    companyLength: `The name of the company must have 2 to ${BUSINESS_LIMITS.company} characters.`,
    contactName: 'Enter your name.',
    contactNameInvalid: `Use only letters in your name (between 2 and ${BUSINESS_LIMITS.contactName} characters).`,
    email: 'Enter your e-mail.',
    emailInvalid: 'Check your e-mail: it does not look valid.',
    phone: 'Enter your phone number.',
    phoneInvalid: (example: string) =>
      `Enter the full number, for example ${example}. If it is from another country, start with + and the country code.`,
    country: 'Choose a country.',
    city: 'Enter your city.',
    cityLength: `Your city must have 2 to ${BUSINESS_LIMITS.city} characters.`,
    volume: 'Choose one of the options.',
    message: 'Tell us what your company needs.',
    messageShort: 'Tell us a little more about what your company needs.',
    messageLong: `Use ${BUSINESS_LIMITS.message} characters at most.`,
  },
};

export const validateBusinessInquiry = (input: unknown, locale: Locale = 'es'): BusinessResult => {
  const body = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  const t = MESSAGES[locale];
  const countries = content(locale).SIGNUP_COUNTRIES;
  const fields: BusinessErrors = {};

  const company = clean(body.company, BUSINESS_LIMITS.company);
  if (!company) fields.company = t.company;
  else if (company.length < 2 || company.length > BUSINESS_LIMITS.company) fields.company = t.companyLength;

  const contactName = clean(body.contactName, BUSINESS_LIMITS.contactName);
  if (!contactName) fields.contactName = t.contactName;
  else if (contactName.length < 2 || contactName.length > BUSINESS_LIMITS.contactName || !NAME.test(contactName))
    fields.contactName = t.contactNameInvalid;

  const email = cleanEmail(body.email);
  if (!email) fields.email = t.email;
  else if (!isEmail(email)) fields.email = t.emailInvalid;

  const country = countries.find(({ code }) => code === body.country);
  if (!country) fields.country = t.country;
  // The phone is read as a number of the chosen country; fall back to the first one so it still gets checked.
  const rules = country ?? countries[0];

  const rawPhone = clean(body.phone, 30);
  const phone = normalizePhone(rawPhone, rules);
  if (!rawPhone) fields.phone = t.phone;
  else if (!phone) fields.phone = t.phoneInvalid(rules.examples.phone);

  const city = clean(body.city, BUSINESS_LIMITS.city);
  if (!city) fields.city = t.city;
  else if (city.length < 2 || city.length > BUSINESS_LIMITS.city) fields.city = t.cityLength;

  const volume = clean(body.volume, 40);
  if (volume && !BUSINESS_VOLUMES.some(({ id }) => id === volume)) fields.volume = t.volume;

  const message = cleanLines(body.message, BUSINESS_LIMITS.message);
  if (!message) fields.message = t.message;
  else if (message.length < BUSINESS_MESSAGE_MIN) fields.message = t.messageShort;
  else if (message.length > BUSINESS_LIMITS.message) fields.message = t.messageLong;

  if (Object.keys(fields).length > 0 || !country || !phone) return { ok: false, fields };
  return { ok: true, data: { company, contactName, email, phone, country: country.code, city, volume, message } };
};
