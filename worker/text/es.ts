/**
 * What the Worker says, in Spanish: the e-mails it sends a customer and the messages of the forms it
 * checks. The other languages (./en.ts…) are objects of this same shape (`ServerText`), so a
 * sentence missing in one of them is a type error. The team's own e-mails are always in Spanish and
 * are written where they are built (worker/signup/emails.ts, worker/business/emails.ts).
 *
 * Voseo, as on the site. Runs on Workers and on plain Node: relative imports with the .ts extension.
 */
import { LOGIN_CODE_MINUTES } from '../../src/data/account.ts';
import { BUSINESS_LIMITS } from '../../src/data/business.ts';
import { CONFIRM_LINK_HOURS } from '../../src/data/signup.ts';
import { SIGNUP_LIMITS } from '../validation.ts';

export const text = {
  /** The line under every e-mail. */
  tagline: 'Carinova · Envíos que unen · De Estados Unidos a Nicaragua',

  // worker/api.ts
  api: {
    emailMissing: 'Escribí tu correo electrónico.',
    emailInvalid: 'Revisá tu correo: no parece válido.',
    emailRejected: 'No pudimos enviar un mensaje a este correo. Revisá que esté bien escrito.',
  },

  // worker/auth/emails.ts
  loginCode: {
    subject: 'Tu código para ingresar a Carinova',
    preheader: (code: string) => `Tu código es ${code}. Vence en ${LOGIN_CODE_MINUTES} minutos.`,
    hello: (name: string) => `Hola, ${name}:`,
    intro: 'Usá este código para ingresar a tu cuenta de Carinova:',
    expires: `Vence en ${LOGIN_CODE_MINUTES} minutos y sirve una sola vez.`,
    never:
      'Escribilo solo en nuestro sitio. Nunca te lo vamos a pedir por WhatsApp, por teléfono ni por correo: si alguien te lo pide, no se lo des.',
    notYou: 'Si no fuiste vos, ignorá este mensaje: sin este código nadie puede ingresar a tu cuenta.',
  },

  // worker/business/validate.ts
  businessForm: {
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

  // worker/signup/emails.ts
  verification: {
    subject: 'Confirmá tu correo para crear tu cuenta Carinova',
    preheader: 'Un paso más y tu cuenta queda lista.',
    hello: (name: string) => `Hola, ${name}:`,
    intro:
      'Recibimos tu registro en Carinova. Confirmá tu correo para crear tu cuenta y recibir tu Carinova ID y tu dirección en Miami.',
    button: 'Confirmar mi correo',
    expires: `El enlace vence en ${CONFIRM_LINK_HOURS} horas.`,
    fallback: (openLink: string) => `Si el botón no funciona, ${openLink}.`,
    fallbackLink: 'abrí este enlace',
    notYou: 'Si no fuiste vos, ignorá este mensaje: no se creará ninguna cuenta.',
    textIntro:
      'Recibimos tu registro en Carinova. Abrí este enlace para confirmar tu correo, crear tu cuenta y recibir tu Carinova ID y tu dirección en Miami:',
  },

  // worker/signup/emails.ts
  welcome: {
    subject: (code: string) => `Tu cuenta Carinova está lista: ${code}`,
    preheader: (code: string) => `Tu Carinova ID es ${code}. Aquí está tu dirección en Miami.`,
    title: (name: string) => `¡Tu cuenta está lista, ${name}!`,
    thisIsId: 'Este es tu Carinova ID.',
    keepId: 'Guardalo: con él identificamos tu cuenta.',
    idLabel: 'Tu Carinova ID',
    address: 'Tu dirección en Miami',
    addressIntro: 'Usala como dirección de envío cuando compres en tiendas de Estados Unidos:',
    before: 'Antes de comprar',
    seeList: 'Ver esta lista en nuestro sitio',
    listOnSite: 'Lista en nuestro sitio',
    firstShipment: 'Antes de tu primer envío',
    quote:
      'Calculá cuánto te cuesta traer tu compra: por aéreo, por marítimo o con la tarifa por unidad de algunos electrónicos.',
    quoteText: 'Calculá cuánto te cuesta traer tu compra',
    online: 'Tu cuenta en línea',
    onlineText:
      'En nuestro sitio encontrás siempre tu Carinova ID, tu dirección, tus paquetes y tus pagos. Ingresás con tu correo y un código que te mandamos, sin contraseña.',
    questions: '¿Tenés dudas?',
    writeUs: (number: string) => `Escribinos por WhatsApp al ${number}`,
  },

  // worker/signup/validate.ts
  signupForm: {
    country: 'Elegí un país.',
    labels: { firstName: 'nombre', lastName: 'apellido' },
    nameMissing: (label: string) => `Escribí tu ${label}.`,
    nameInvalid: (label: string) => `Usá solo letras en tu ${label} (entre 2 y ${SIGNUP_LIMITS.name} caracteres).`,
    emailMissing: 'Escribí tu correo electrónico.',
    emailInvalid: 'Revisá tu correo: no parece válido.',
    phoneMissing: 'Escribí tu teléfono.',
    phoneInvalid: (example: string) =>
      `Escribí el número completo, por ejemplo ${example}. Si es de otro país, empezá con + y el código del país.`,
    addressMissing: 'Escribí tu dirección.',
    addressShort: 'Tu dirección parece incompleta.',
    tooLong: (max: number) => `Usá ${max} caracteres como máximo.`,
    cityMissing: 'Escribí tu ciudad.',
    cityLength: `Tu ciudad debe tener de 2 a ${SIGNUP_LIMITS.city} caracteres.`,
    state: (label: string) => `Elegí tu ${label.toLowerCase()}.`,
    postalMissing: 'Escribí tu código postal.',
    postalInvalid: (example: string) => `Revisá el código postal (ejemplo: ${example}).`,
    terms: 'Para continuar, aceptá los términos y la política de privacidad.',
  },
};

export type ServerText = typeof text;
