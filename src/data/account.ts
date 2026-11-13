/**
 * The customer's account: signing in (/ingresar) and what "Mi cuenta" shows of their packages and
 * payments.
 *
 * - The numbers of the sign-in are what the pages state and the Worker enforces (worker/auth), so
 *   the two cannot disagree. The privacy policy (src/data/legal) states the minutes and the days too.
 * - The statuses of packages, invoices and payments are the values the database stores
 *   (db/schema.sql has the same lists as CHECK constraints; a unit test compares them) with the
 *   words a customer reads for each one, in both languages.
 *
 * No imports: the Worker bundles this file.
 */

/** Digits of the code e-mailed to sign in. */
export const LOGIN_CODE_DIGITS = 6;

/** Minutes a code stays valid. */
export const LOGIN_CODE_MINUTES = 10;

/** Wrong codes accepted before a new one has to be requested. */
export const LOGIN_CODE_ATTEMPTS = 5;

/** Codes a customer can be sent: in a quarter of an hour, and in a day. */
export const LOGIN_CODES_PER_15_MINUTES = 3;
export const LOGIN_CODES_PER_DAY = 10;

/** Seconds the page waits before it offers to send another code. */
export const LOGIN_RESEND_SECONDS = 30;

/** Days a customer stays signed in on a browser. */
export const SESSION_DAYS = 30;

/**
 * Cookie that tells the pages a customer is signed in, so "Crear cuenta" can give way to
 * "Mi cuenta" before the first paint (SessionState.astro). It carries no secret and grants
 * nothing: the session itself is another cookie, one that scripts cannot read
 * (worker/auth/session.ts).
 */
export const SESSION_FLAG_COOKIE = 'cnv_in';

/**
 * The id of the sign-in dialog every page carries (SigninDialog.astro). A link with
 * `data-dialog-open` set to it opens the dialog instead of leading to the sign-in page.
 */
export const SIGNIN_DIALOG_ID = 'cn-signin-dialog';

/** How many packages and how many invoices "Mi cuenta" asks for: the most recent ones. */
export const ACCOUNT_LIST_LIMIT = 50;

interface Words {
  /** The status as a short label. */
  name: string;
  /** What it means, in a few words. */
  text: string;
}

export interface StatusInfo<Id extends string> {
  id: Id;
  es: Words;
  en: Words;
}

/**
 * The journey of a package, in order (packages.status). The first four are the stages of
 * Carinova's prototype ("Sabé en qué etapa va tu envío").
 */
export const PACKAGE_STAGES = [
  {
    id: 'received',
    es: { name: 'Recibido en bodega', text: 'Recepción física en Estados Unidos' },
    en: { name: 'Received at the warehouse', text: 'Physical reception in the United States' },
  },
  {
    id: 'processing',
    es: { name: 'En preparación', text: 'Clasificación y coordinación' },
    en: { name: 'Being prepared', text: 'Sorting and coordination' },
  },
  {
    id: 'in_transit',
    es: { name: 'En tránsito', text: 'Traslado hacia Nicaragua' },
    en: { name: 'In transit', text: 'On its way to Nicaragua' },
  },
  {
    id: 'ready',
    es: { name: 'Disponible para entrega', text: 'Retiro o entrega coordinada' },
    en: { name: 'Available for delivery', text: 'Pickup or arranged delivery' },
  },
  {
    id: 'delivered',
    es: { name: 'Entregado', text: 'Lo recibiste' },
    en: { name: 'Delivered', text: 'You received it' },
  },
] as const satisfies ReadonlyArray<StatusInfo<string>>;

/** How a journey can end without a delivery (packages.status). */
export const PACKAGE_EXITS = [
  {
    id: 'returned',
    es: { name: 'Devuelto', text: 'Devuelto al remitente' },
    en: { name: 'Returned', text: 'Returned to the sender' },
  },
  {
    id: 'cancelled',
    es: { name: 'Cancelado', text: 'El envío se canceló' },
    en: { name: 'Cancelled', text: 'The shipment was cancelled' },
  },
] as const satisfies ReadonlyArray<StatusInfo<string>>;

export type PackageStatus = (typeof PACKAGE_STAGES)[number]['id'] | (typeof PACKAGE_EXITS)[number]['id'];

/** Every value of packages.status, in the order of the journey. */
export const PACKAGE_STATUSES: ReadonlyArray<StatusInfo<PackageStatus>> = [...PACKAGE_STAGES, ...PACKAGE_EXITS];

/** "In the warehouse": received in the United States and not shipped yet. */
export const WAREHOUSE_STATUSES: ReadonlyArray<PackageStatus> = ['received', 'processing'];
/** "Shipped": it left the warehouse and has not been handed over yet. */
export const SHIPPED_STATUSES: ReadonlyArray<PackageStatus> = ['in_transit', 'ready'];

/** How a package travels (packages.service): the ids of RATES.air and RATES.sea, as the database names them. */
export const PACKAGE_SERVICES = ['air', 'sea'] as const;
export type PackageService = (typeof PACKAGE_SERVICES)[number];

/**
 * What a customer reads about an invoice. The database stores only whether it is a draft, issued or
 * void (invoices.status); whether it is paid follows from its payments (the view `invoice_totals`).
 * Drafts are never shown to the customer.
 */
export const INVOICE_STATES = [
  {
    id: 'unpaid',
    es: { name: 'Pendiente de pago', text: 'Todavía no registramos un pago' },
    en: { name: 'Payment pending', text: 'We have not recorded a payment yet' },
  },
  {
    id: 'in_review',
    es: { name: 'Pago en revisión', text: 'Recibimos tu pago y lo estamos confirmando' },
    en: { name: 'Payment under review', text: 'We received your payment and are confirming it' },
  },
  {
    id: 'partial',
    es: { name: 'Pago parcial', text: 'Confirmamos una parte del monto' },
    en: { name: 'Partially paid', text: 'We confirmed part of the amount' },
  },
  {
    id: 'paid',
    es: { name: 'Pagada', text: 'Confirmamos tu pago' },
    en: { name: 'Paid', text: 'We confirmed your payment' },
  },
  {
    id: 'void',
    es: { name: 'Anulada', text: 'Esta factura ya no aplica' },
    en: { name: 'Void', text: 'This invoice no longer applies' },
  },
] as const satisfies ReadonlyArray<StatusInfo<string>>;

export type InvoiceState = (typeof INVOICE_STATES)[number]['id'];

/** A payment as Carinova's team sees it (payments.status). */
export const PAYMENT_STATUSES = [
  {
    id: 'pending',
    es: { name: 'En revisión', text: 'Lo estamos confirmando' },
    en: { name: 'Under review', text: 'We are confirming it' },
  },
  {
    id: 'confirmed',
    es: { name: 'Confirmado', text: 'Lo recibimos' },
    en: { name: 'Confirmed', text: 'We received it' },
  },
  {
    id: 'rejected',
    es: { name: 'Rechazado', text: 'No pudimos confirmarlo' },
    en: { name: 'Rejected', text: 'We could not confirm it' },
  },
] as const satisfies ReadonlyArray<StatusInfo<string>>;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]['id'];

/** How a payment was made (payments.method). */
export const PAYMENT_METHODS = [
  { id: 'cash', es: 'Efectivo', en: 'Cash' },
  { id: 'bank_transfer', es: 'Transferencia bancaria', en: 'Bank transfer' },
  { id: 'card', es: 'Tarjeta', en: 'Card' },
  { id: 'other', es: 'Otro medio', en: 'Other' },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['id'];
