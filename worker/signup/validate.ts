/**
 * Validates and normalises a sign-up submission. These rules decide: the form's own checks
 * (required, pattern) only save the visitor a round trip.
 */
import { SIGNUP_COUNTRIES, type SignupCountry } from '../../src/data/signup.ts';

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

// Letters of any alphabet plus what real names contain. No digits or URL characters, so a name
// can never smuggle a link into the e-mails we send.
const NAME = /^\p{L}[\p{L}\p{M}'’. -]*$/u;
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

const LIMITS = { name: 60, email: 254, address1: 120, address2: 60, city: 60 };

/** Trims, collapses whitespace and drops control characters. Keeps one character past `max` so "too long" still shows. */
const clean = (value: unknown, max: number): string =>
  (typeof value === 'string' ? value : '')
    .normalize('NFC')
    .replace(/\p{Cc}/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max + 1);

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

  for (const { dialCode, phoneDigits } of [country, ...SIGNUP_COUNTRIES.filter((other) => other !== country)]) {
    if (digits.length === phoneDigits) return `+${dialCode}${digits}`;
    if (digits.length === dialCode.length + phoneDigits && digits.startsWith(dialCode)) return `+${digits}`;
  }
  return null;
};

const accepted = (value: unknown): boolean => value === true || value === 'true' || value === 'on';

export const validateSignup = (input: unknown): ValidationResult => {
  const body = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
  const fields: FieldErrors = {};

  const country = SIGNUP_COUNTRIES.find(({ code }) => code === body.country);
  if (!country) fields.country = 'Elige un país.';
  // The remaining rules depend on the country; fall back to the first one so every field still gets checked.
  const rules = country ?? SIGNUP_COUNTRIES[0];

  const name = (field: 'firstName' | 'lastName', label: string): string => {
    const value = clean(body[field], LIMITS.name);
    if (!value) fields[field] = `Escribe tu ${label}.`;
    else if (value.length < 2 || value.length > LIMITS.name || !NAME.test(value))
      fields[field] = `Usa solo letras en tu ${label} (entre 2 y ${LIMITS.name} caracteres).`;
    return value;
  };
  const firstName = name('firstName', 'nombre');
  const lastName = name('lastName', 'apellido');

  const email = clean(body.email, LIMITS.email).toLowerCase();
  if (!email) fields.email = 'Escribe tu correo electrónico.';
  else if (email.length > LIMITS.email || !EMAIL.test(email)) fields.email = 'Revisa tu correo: no parece válido.';

  const rawPhone = clean(body.phone, 30);
  const phone = normalizePhone(rawPhone, rules);
  if (!rawPhone) fields.phone = 'Escribe tu teléfono.';
  else if (!phone)
    fields.phone = `Escribe el número completo, por ejemplo ${rules.examples.phone}. Si es de otro país, empieza con + y el código del país.`;

  const address1 = clean(body.address1, LIMITS.address1);
  if (!address1) fields.address1 = 'Escribe tu dirección.';
  else if (address1.length < 5) fields.address1 = 'Tu dirección parece incompleta.';
  else if (address1.length > LIMITS.address1) fields.address1 = `Usa ${LIMITS.address1} caracteres como máximo.`;

  const address2 = clean(body.address2, LIMITS.address2);
  if (address2.length > LIMITS.address2) fields.address2 = `Usa ${LIMITS.address2} caracteres como máximo.`;

  const city = clean(body.city, LIMITS.city);
  if (!city) fields.city = 'Escribe tu ciudad.';
  else if (city.length < 2 || city.length > LIMITS.city)
    fields.city = `Tu ciudad debe tener de 2 a ${LIMITS.city} caracteres.`;

  const state = clean(body.state, 60);
  if (!rules.states.includes(state)) fields.state = `Elige tu ${rules.stateLabel.toLowerCase()}.`;

  const postalCode = clean(body.postalCode, 10);
  if (!postalCode) {
    if (rules.postalCode.required) fields.postalCode = 'Escribe tu código postal.';
  } else if (!new RegExp(`^(?:${rules.postalCode.pattern})$`).test(postalCode)) {
    fields.postalCode = `Revisa el código postal (ejemplo: ${rules.examples.postalCode}).`;
  }

  if (!accepted(body.terms)) fields.terms = 'Para continuar, acepta los términos y la política de privacidad.';

  if (Object.keys(fields).length > 0 || !country || !phone) return { ok: false, fields };
  return {
    ok: true,
    data: { country: country.code, firstName, lastName, email, phone, address1, address2, city, state, postalCode },
  };
};
