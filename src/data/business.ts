/**
 * Carinova for companies: what it explores with a company (the home page and /empresas show it) and
 * the form of /empresas: the options of its fields and their limits. The page renders them and the
 * Worker (worker/business/validate.ts) checks every submission against the same values, so the two
 * cannot disagree. What a company sends is e-mailed to Carinova (OWNER_EMAIL); nothing is stored.
 * No imports: the Worker bundles this file too.
 */

export interface BusinessVolume {
  /** What the form sends and the Worker accepts. */
  id: string;
  es: string;
  en: string;
}

export interface BusinessSolution {
  id: string;
  icon: string;
  es: { title: string; text: string };
  en: { title: string; text: string };
}

/**
 * What Carinova explores with a company, from its prototype ("Carinova para negocios"): shown on
 * the home page and on /empresas. Each one is an evaluation, not a promise: the conditions are
 * agreed case by case (BUSINESS_DISCLAIMER).
 */
export const BUSINESS_SOLUTIONS: Array<BusinessSolution> = [
  {
    id: 'importacion',
    icon: 'tabler:packages',
    es: {
      title: 'Importación y abastecimiento',
      text: 'Revisión del tipo de mercancía, la modalidad, el peso, el volumen y los requisitos documentales antes de cotizar.',
    },
    en: {
      title: 'Importing and supply',
      text: 'A review of the type of goods, the mode of transport, the weight, the volume and the documents required before quoting.',
    },
  },
  {
    id: 'recurrentes',
    icon: 'tabler:repeat',
    es: {
      title: 'Envíos recurrentes',
      text: 'Evaluación comercial de la frecuencia, la consolidación posible y las necesidades de abastecimiento, sujeta a factibilidad.',
    },
    en: {
      title: 'Recurring shipments',
      text: 'A commercial evaluation of the frequency, the possible consolidation and the supply needs, subject to feasibility.',
    },
  },
  {
    id: 'corporativa',
    icon: 'tabler:headset',
    es: {
      title: 'Atención corporativa',
      text: 'Definición del alcance, la trazabilidad requerida, la cobertura y las condiciones de servicio según la operación.',
    },
    en: {
      title: 'Corporate service',
      text: 'Definition of the scope, the traceability required, the coverage and the conditions of service according to the operation.',
    },
  },
];

/** Goes with BUSINESS_SOLUTIONS wherever they are shown. */
export const BUSINESS_DISCLAIMER = {
  es: 'Las modalidades empresariales y sus condiciones se estructuran caso por caso, previa evaluación de factibilidad y cumplimiento.',
  en: 'Business arrangements and their conditions are structured case by case, after an evaluation of feasibility and compliance.',
};

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
