/**
 * The form for companies (/empresas): the options of its fields and their limits. The page renders
 * them and the Worker (worker/business/validate.ts) checks every submission against the same values,
 * so the two cannot disagree. What a company sends is e-mailed to Carinova (OWNER_EMAIL); nothing is
 * stored. No imports: the Worker bundles this file too.
 */

export interface BusinessVolume {
  /** What the form sends and the Worker accepts. */
  id: string;
  es: string;
  en: string;
}

/** How much the company expects to ship. Optional in the form: many do not know yet. */
export const BUSINESS_VOLUMES: Array<BusinessVolume> = [
  { id: 'under-100', es: 'Menos de 100 lb al mes', en: 'Under 100 lb a month' },
  { id: '100-500', es: 'De 100 a 500 lb al mes', en: '100 to 500 lb a month' },
  { id: 'over-500', es: 'Más de 500 lb al mes', en: 'Over 500 lb a month' },
  { id: 'pallets', es: 'Carga por tarimas o contenedor', en: 'Cargo by the pallet or the container' },
  { id: 'unknown', es: 'Todavía no lo sé', en: 'I do not know yet' },
];

/** Longest text each field takes (characters). The form states them as `maxlength`. */
export const BUSINESS_LIMITS = { company: 100, contactName: 80, city: 60, message: 1500 };

/** Shortest description of what the company needs: enough to be a sentence. */
export const BUSINESS_MESSAGE_MIN = 10;

/** Placeholders of the form: a sample company, like the sample customer of the sign-up form. */
export const BUSINESS_EXAMPLES = {
  company: 'Repuestos del Caribe, S. A.',
  contactName: 'Paula Palacios',
  email: 'compras@ejemplo.com',
};
