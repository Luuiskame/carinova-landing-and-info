/**
 * Validates and normalises what a company sends from /empresas. As with the sign-up, these rules
 * decide: the form's own checks only save the visitor a round trip. The options and limits are in
 * src/data/business.ts, read by the page too.
 */
import { BUSINESS_LIMITS, BUSINESS_MESSAGE_MIN, BUSINESS_VOLUMES } from '../../src/data/business.ts';
import { content } from '../../src/data/content.ts';
import type { Locale } from '../../src/i18n/locales.ts';
import { normalizePhone } from '../signup/validate.ts';
import { textOf } from '../text/index.ts';
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

export const validateBusinessInquiry = (input: unknown, locale: Locale = 'es'): BusinessResult => {
  const body = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  const t = textOf(locale).businessForm;
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
