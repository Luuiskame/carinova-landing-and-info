/**
 * Validates and normalises a sign-up submission. These rules decide: the form's own checks
 * (required, pattern) only save the visitor a round trip. The messages come back in the language the
 * form was filled in.
 */
import { content } from '../../src/data/content.ts';
import { SIGNUP_COUNTRIES, type SignupCountry } from '../../src/data/signup.ts';
import type { Locale } from '../../src/i18n/locales.ts';
import { EMAIL_MAX, NAME, clean, cleanEmail, isEmail } from '../validation.ts';

export interface SignupData {
  /** ISO 3166-1 alpha-2 code of one of SIGNUP_COUNTRIES. */
  country: string;
  firstName: string;
  lastName: string;
  /** Lower case. */
  email: string;
  /** E.164: "+" and digits. */
  phone: string;
  address1: string;
  /** Empty when not given. */
  address2: string;
  city: string;
  state: string;
  /** Empty when not given. */
  postalCode: string;
}

export type SignupField = keyof SignupData | 'terms';
export type FieldErrors = Partial<Record<SignupField, string>>;
export type ValidationResult = { ok: true; data: SignupData } | { ok: false; fields: FieldErrors };

const LIMITS = { name: 60, email: EMAIL_MAX, address1: 120, address2: 60, city: 60 };

const MESSAGES = {
  es: {
    country: 'Elegí un país.',
    labels: { firstName: 'nombre', lastName: 'apellido' },
    nameMissing: (label: string) => `Escribí tu ${label}.`,
    nameInvalid: (label: string) => `Usá solo letras en tu ${label} (entre 2 y ${LIMITS.name} caracteres).`,
    emailMissing: 'Escribí tu correo electrónico.',
    emailInvalid: 'Revisá tu correo: no parece válido.',
    phoneMissing: 'Escribí tu teléfono.',
    phoneInvalid: (example: string) =>
      `Escribí el número completo, por ejemplo ${example}. Si es de otro país, empezá con + y el código del país.`,
    addressMissing: 'Escribí tu dirección.',
    addressShort: 'Tu dirección parece incompleta.',
    tooLong: (max: number) => `Usá ${max} caracteres como máximo.`,
    cityMissing: 'Escribí tu ciudad.',
    cityLength: `Tu ciudad debe tener de 2 a ${LIMITS.city} caracteres.`,
    state: (label: string) => `Elegí tu ${label.toLowerCase()}.`,
    postalMissing: 'Escribí tu código postal.',
    postalInvalid: (example: string) => `Revisá el código postal (ejemplo: ${example}).`,
    terms: 'Para continuar, aceptá los términos y la política de privacidad.',
  },
  en: {
    country: 'Choose a country.',
    labels: { firstName: 'first name', lastName: 'last name' },
    nameMissing: (label: string) => `Enter your ${label}.`,
    nameInvalid: (label: string) => `Use only letters in your ${label} (between 2 and ${LIMITS.name} characters).`,
    emailMissing: 'Enter your e-mail.',
    emailInvalid: 'Check your e-mail: it does not look valid.',
    phoneMissing: 'Enter your phone number.',
    phoneInvalid: (example: string) =>
      `Enter the full number, for example ${example}. If it is from another country, start with + and the country code.`,
    addressMissing: 'Enter your address.',
    addressShort: 'Your address looks incomplete.',
    tooLong: (max: number) => `Use ${max} characters at most.`,
    cityMissing: 'Enter your city.',
    cityLength: `Your city must have 2 to ${LIMITS.city} characters.`,
    state: (label: string) => `Choose your ${label.toLowerCase()}.`,
    postalMissing: 'Enter your postal code.',
    postalInvalid: (example: string) => `Check the postal code (example: ${example}).`,
    terms: 'To continue, accept the terms and the privacy policy.',
  },
};

/**
 * Returns the phone as "+<digits>", or null when it cannot be a full number.
 * A number without "+" is read as a national number of the chosen country, or of the other
 * supported one (a customer in Miami may keep a Nicaraguan line).
 */
export const normalizePhone = (raw: string, country: SignupCountry): string | null => {
  const value = raw.trim();
  const digits = value.replace(/\D/g, '');

  if (value.startsWith('+') || value.startsWith('00')) {
    const international = value.startsWith('+') ? digits : digits.slice(2);
    return international.length >= 8 && international.length <= 15 ? `+${international}` : null;
  }

  for (const { dialCode, phoneDigits } of [
    country,
    ...SIGNUP_COUNTRIES.filter((other) => other.code !== country.code),
  ]) {
    if (digits.length === phoneDigits) return `+${dialCode}${digits}`;
    if (digits.length === dialCode.length + phoneDigits && digits.startsWith(dialCode)) return `+${digits}`;
  }
  return null;
};

const accepted = (value: unknown): boolean => value === true || value === 'true' || value === 'on';

export const validateSignup = (input: unknown, locale: Locale = 'es'): ValidationResult => {
  const body = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  const t = MESSAGES[locale];
  // The same countries in either language; only their names and what they call their divisions change.
  const countries = content(locale).SIGNUP_COUNTRIES;
  const fields: FieldErrors = {};

  const country = countries.find(({ code }) => code === body.country);
  if (!country) fields.country = t.country;
  // The remaining rules depend on the country; fall back to the first one so every field still gets checked.
  const rules = country ?? countries[0];

  const name = (field: 'firstName' | 'lastName'): string => {
    const value = clean(body[field], LIMITS.name);
    if (!value) fields[field] = t.nameMissing(t.labels[field]);
    else if (value.length < 2 || value.length > LIMITS.name || !NAME.test(value))
      fields[field] = t.nameInvalid(t.labels[field]);
    return value;
  };
  const firstName = name('firstName');
  const lastName = name('lastName');

  const email = cleanEmail(body.email);
  if (!email) fields.email = t.emailMissing;
  else if (!isEmail(email)) fields.email = t.emailInvalid;

  const rawPhone = clean(body.phone, 30);
  const phone = normalizePhone(rawPhone, rules);
  if (!rawPhone) fields.phone = t.phoneMissing;
  else if (!phone) fields.phone = t.phoneInvalid(rules.examples.phone);

  const address1 = clean(body.address1, LIMITS.address1);
  if (!address1) fields.address1 = t.addressMissing;
  else if (address1.length < 5) fields.address1 = t.addressShort;
  else if (address1.length > LIMITS.address1) fields.address1 = t.tooLong(LIMITS.address1);

  const address2 = clean(body.address2, LIMITS.address2);
  if (address2.length > LIMITS.address2) fields.address2 = t.tooLong(LIMITS.address2);

  const city = clean(body.city, LIMITS.city);
  if (!city) fields.city = t.cityMissing;
  else if (city.length < 2 || city.length > LIMITS.city) fields.city = t.cityLength;

  const state = clean(body.state, 60);
  if (!rules.states.includes(state)) fields.state = t.state(rules.stateLabel);

  const postalCode = clean(body.postalCode, 10);
  if (!postalCode) {
    if (rules.postalCode.required) fields.postalCode = t.postalMissing;
  } else if (!new RegExp(`^(?:${rules.postalCode.pattern})$`).test(postalCode)) {
    fields.postalCode = t.postalInvalid(rules.examples.postalCode);
  }

  if (!accepted(body.terms)) fields.terms = t.terms;

  if (Object.keys(fields).length > 0 || !country || !phone) return { ok: false, fields };
  return {
    ok: true,
    data: { country: country.code, firstName, lastName, email, phone, address1, address2, city, state, postalCode },
  };
};
