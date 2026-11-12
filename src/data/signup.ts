/**
 * Sign-up form (/registro): the options of its fields. The page renders them and the Worker
 * (worker/signup/validate.ts) checks every submission against the same lists, so the two cannot
 * disagree. No imports here: the Worker bundles this file too.
 */

/**
 * Hours a confirmation link stays valid: shown in the copy and enforced by the Worker.
 * The privacy policy (src/data/legal) states the number too.
 */
export const CONFIRM_LINK_HOURS = 48;

export interface SignupCountry {
  /** ISO 3166-1 alpha-2; this is what the database stores. */
  code: string;
  name: string;
  /** What this country calls its first-level divisions. */
  stateLabel: string;
  states: Array<string>;
  /** Calling code and length of a national number: phones are stored as + and digits. */
  dialCode: string;
  phoneDigits: number;
  /** `pattern` is a regular expression source, checked by the Worker. */
  postalCode: { required: boolean; pattern: string };
  /**
   * Sample values, keyed by field name: the form shows them as placeholders and the Worker quotes
   * the phone and the postal code in its error messages, so each must pass that country's rules.
   */
  examples: { phone: string; address1: string; address2: string; city: string; postalCode: string };
}

/**
 * Placeholders of the fields that do not depend on the country. The sample customer is the one on
 * Carinova's "Tu dirección en Miami" sheet (Paul Palacios).
 */
export const SIGNUP_NAME_EXAMPLES = { firstName: 'Paul', lastName: 'Palacios', email: 'paul@ejemplo.com' };

export const SIGNUP_COUNTRIES: Array<SignupCountry> = [
  {
    code: 'NI',
    name: 'Nicaragua',
    stateLabel: 'Departamento',
    states: [
      'Boaco',
      'Carazo',
      'Chinandega',
      'Chontales',
      'Costa Caribe Norte (RACCN)',
      'Costa Caribe Sur (RACCS)',
      'Estelí',
      'Granada',
      'Jinotega',
      'León',
      'Madriz',
      'Managua',
      'Masaya',
      'Matagalpa',
      'Nueva Segovia',
      'Río San Juan',
      'Rivas',
    ],
    dialCode: '505',
    phoneDigits: 8,
    postalCode: { required: false, pattern: '\\d{5}' },
    examples: {
      phone: '8888 8888',
      address1: 'Del parque central, 2 cuadras al sur',
      address2: 'Casa 12',
      city: 'Managua',
      postalCode: '11001',
    },
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    stateLabel: 'Estado',
    states: [
      'Alabama',
      'Alaska',
      'Arizona',
      'Arkansas',
      'California',
      'Colorado',
      'Connecticut',
      'Delaware',
      'District of Columbia',
      'Florida',
      'Georgia',
      'Hawaii',
      'Idaho',
      'Illinois',
      'Indiana',
      'Iowa',
      'Kansas',
      'Kentucky',
      'Louisiana',
      'Maine',
      'Maryland',
      'Massachusetts',
      'Michigan',
      'Minnesota',
      'Mississippi',
      'Missouri',
      'Montana',
      'Nebraska',
      'Nevada',
      'New Hampshire',
      'New Jersey',
      'New Mexico',
      'New York',
      'North Carolina',
      'North Dakota',
      'Ohio',
      'Oklahoma',
      'Oregon',
      'Pennsylvania',
      'Puerto Rico',
      'Rhode Island',
      'South Carolina',
      'South Dakota',
      'Tennessee',
      'Texas',
      'Utah',
      'Vermont',
      'Virginia',
      'Washington',
      'West Virginia',
      'Wisconsin',
      'Wyoming',
    ],
    dialCode: '1',
    phoneDigits: 10,
    postalCode: { required: true, pattern: '\\d{5}(-\\d{4})?' },
    // The values on Carinova's "Tu dirección en Miami" sheet.
    examples: {
      phone: '786 687 9611',
      address1: '8611 NW 72ND St',
      address2: 'Ste G9',
      city: 'Miami',
      postalCode: '33195-2311',
    },
  },
];
