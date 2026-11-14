/**
 * Brazilian Portuguese wording of ../signup.ts: the countries of the sign-up form with their
 * Portuguese name and what they call their first-level divisions. Everything the server checks (the
 * lists of departments and states, the phone and postal code rules, the examples) is the Spanish
 * file's own: a department is a proper name and is stored as it is written there.
 */
import { SIGNUP_COUNTRIES as COUNTRIES, type SignupCountry } from '../signup.ts';

const COUNTRY_TEXT: Record<string, Pick<SignupCountry, 'name' | 'stateLabel'>> = {
  NI: { name: 'Nicarágua', stateLabel: 'Departamento' },
  US: { name: 'Estados Unidos', stateLabel: 'Estado' },
};

export const SIGNUP_COUNTRIES: Array<SignupCountry> = COUNTRIES.map((country) => ({
  ...country,
  ...COUNTRY_TEXT[country.code],
}));
