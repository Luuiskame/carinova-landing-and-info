/**
 * What the pages and the components say, in Spanish: the site's default language and the source of
 * every translation. One entry per page or component, named after it; the other languages
 * (./en.ts, ./fr.ts…) are objects of this same shape, so a sentence missing in one of them is a type
 * error (`UI`) and a failing unit test (ui.test.ts).
 *
 * - Voseo (docs/INFORMATION-ARCHITECTURE.md → "Voice").
 * - A sentence that needs a value is a function of it, or carries {placeholders} when a script
 *   fills it in the browser (`fill()` in src/utils/template.ts).
 * - Facts (prices, cities, hours) are never typed here: they are read from the data of the
 *   language (src/data), so a sentence cannot disagree with the page it is on.
 */
import {
  INVOICE_STATES,
  LOGIN_CODE_DIGITS,
  LOGIN_CODE_MINUTES,
  PACKAGE_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SESSION_DAYS,
  type InvoiceState,
  type PackageStatus,
  type PaymentMethod,
  type PaymentStatus,
} from '../../data/account.ts';
import { BUSINESS_DISCLAIMER, BUSINESS_SOLUTIONS, BUSINESS_VOLUMES } from '../../data/business.ts';
import { CONTACT, sentence } from '../../data/carinova.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, describeHours } from '../../data/carinova.ts';
import { CONFIRM_LINK_HOURS } from '../../data/signup.ts';
import { CUBIC_CM_PER_CUBIC_FOOT, formatNumber, formatUSD } from '../../utils/rates.ts';
import { landing } from './landing/es.ts';

// The facts the sentences below are written around, in this language.
const { air, sea } = RATES;
const cityNames = BRANCHES.map((branch) => branch.city);
const cities = cityNames;
/** The city Carinova was born in, as this language writes it. */
const bluefields = BRANCHES.find((branch) => branch.id === 'bluefields')?.city ?? 'Bluefields';
const [hours] = BRANCHES[0].hours;
/** The warehouse that receives packages today (the one that is open). */
const [warehouse] = RECEPTION_POINTS.filter((point) => point.available);
/** The Spanish words of a list of src/data that carries its own (statuses, options), by their id. */
/** A status as a short label and what it means, in a few words. */
type StatusWords = { name: string; text: string };
const byId = <Id extends string, Words>(list: ReadonlyArray<{ id: Id; es: Words }>): Record<Id, Words> =>
  Object.fromEntries(list.map((item) => [item.id, item.es])) as Record<Id, Words>;
/** Whether every branch opens at the same times: then the hours can be said once. */
const sameHours = BRANCHES.every((branch) => JSON.stringify(branch.hours) === JSON.stringify(BRANCHES[0].hours));

export const ui = {
  // components/carinova/AccountPanel.astro
  accountPanel: {
    loading: 'Abriendo tu cuenta…',
    noscript: 'Para ver tu cuenta necesitás activar JavaScript en tu navegador.',
    eyebrow: 'Mi cuenta',
    idLabel: 'Tu Carinova ID',
    idNote: 'Tenelo a mano cuando nos escribas o retires tus paquetes.',
    sections: 'Secciones de tu cuenta',
    packagesIntro: 'Lo que recibimos en nuestra bodega y lo que ya enviamos, con el estado de cada uno.',
    filterLabel: 'Filtrar paquetes',
    filters: { all: 'Todos', warehouse: 'En bodega', shipped: 'Enviados', delivered: 'Entregados' },
    packagesEmpty:
      'Todavía no recibimos paquetes a tu nombre. Cuando el primero llegue a nuestra bodega lo vas a ver aquí, con su estado.',
    packagesNone: 'No tenés paquetes en este grupo.',
    packagesAsk: 'Consultar por mis paquetes',
    history: 'Ver historial',
    packageAsk: 'Consultar por este paquete',
    paymentsIntro: 'Tus facturas y los pagos que confirmamos.',
    invoicesEmpty: 'Todavía no tenés facturas. Cuando emitamos la primera la vas a ver aquí.',
    payments: 'Pagos',
    invoiceAsk: 'Pagar o consultar esta factura',
    paymentsNote:
      'Para pagar o avisar de un pago, escribinos con el número de la factura. Un pago aparece como confirmado cuando nuestro equipo lo verifica.',
    activityError: 'No pudimos cargar tus paquetes y tus pagos.',
    retry: 'Intentar de nuevo',
    detailsTitle: 'Mis datos',
    detailsIntro: 'Con estos datos creaste tu cuenta.',
    name: 'Nombre',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    address: 'Dirección',
    since: 'Cliente desde',
    changed: '¿Cambió algo?',
    update: 'Pedir que actualicen mis datos',
    nextTitle: '¿Qué querés hacer?',
    howItWorks: 'Ver cómo funciona',
    restricted: 'Ver qué puede ingresar',
    signOut: 'Cerrar sesión',
    signingOut: 'Cerrando sesión…',
    errorTitle: 'No pudimos abrir tu cuenta',
    errorText: 'Revisá tu conexión e intentalo de nuevo. Si sigue fallando, escribinos por WhatsApp.',
    // For the script, with {placeholders}.
    script: {
      hello: 'Hola, {name}',
      documentTitle: 'Mi cuenta {code} | Carinova',
      received: 'Recibido en bodega',
      warehouse: 'Bodega',
      weight: 'Peso',
      pounds: '{weight} lb',
      pieces: 'Bultos',
      pickup: 'Retiro en',
      delivery: 'Entrega',
      homeDelivery: 'A domicilio',
      store: 'Tienda',
      carrier: 'Llegó con',
      issued: 'Emitida el {date}',
      due: 'vence el {date}',
      total: 'Total',
      paid: 'Pagado',
      balance: 'Saldo',
      forPackage: '{description} ({reference})',
      balanceDue: 'Saldo pendiente: {amount}',
      inReview: 'Pagos en revisión: {amount}',
      nothingDue: 'No tenés saldos pendientes.',
    },
  },

  // components/carinova/Branches.astro
  branches: {
    tagline: 'Sucursales',
    title: `Retirá en ${cities.join(' o ')}`,
    directions: 'Cómo llegar',
    branch: (city: string) => `(sucursal ${city})`,
  },

  // components/carinova/BusinessForm.astro
  businessForm: {
    title: 'Contanos de tu empresa',
    intro: 'Llená estos datos y te contactamos.',
    noscript:
      'Para enviar el formulario necesitás activar JavaScript en tu navegador. También podés escribirnos por WhatsApp.',
    company: 'Nombre de la empresa',
    contactName: 'Tu nombre',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    phoneHint: 'De preferencia, el número que usás en WhatsApp.',
    country: 'País',
    city: 'Ciudad',
    volume: 'Volumen estimado',
    optional: '(opcional)',
    choose: 'Elegí uno',
    message: '¿Qué necesita tu empresa?',
    messageHint: 'Qué traés, de dónde y cada cuánto.',
    honeypot: 'Dejá este campo vacío',
    submit: 'Enviar solicitud',
    sending: 'Enviando…',
    sentTitle: 'Recibimos tu solicitud',
    sentText: 'Gracias. Nuestro equipo la va a revisar y te va a contactar al correo o al teléfono que nos diste.',
    home: 'Volver al inicio',
    /** A sentence with a link in it: what comes before the link, the link's words, what comes after. */
    privacyNote: [
      'Al enviar, usamos estos datos para contactarte, como explica nuestra ',
      'Política de privacidad',
      '.',
    ],
    messages: {
      missing: 'Completá este campo.',
      unavailable: 'El formulario no está disponible en este momento. Escribinos por WhatsApp y te atendemos.',
      busy: 'Recibimos demasiados intentos seguidos. Esperá un minuto y volvé a intentarlo.',
      failed: 'No pudimos enviar tu solicitud. Revisá tu conexión e intentalo de nuevo, o escribinos por WhatsApp.',
      oneError: 'Hay un campo por corregir.',
      manyErrors: 'Hay {count} campos por corregir.',
    },
  },

  // components/carinova/QuoteCalculator.astro
  quoteCalculator: {
    title: 'Armá tu estimación',
    badge: 'Sin registro',
    mode: '¿Cómo lo querés traer?',
    basis: 'Tipo de tarifa',
    basisHint: 'Elegí una sola base de cálculo: el peso, el volumen y la tarifa por unidad no se suman.',
    byWeight: 'Por peso (libra)',
    byVolume: 'Por volumen (pie cúbico)',
    perUnit: (name: string) => `${name} (unidad)`,
    weightEach: 'Peso de cada paquete (lb)',
    packages: 'Cantidad de paquetes',
    kilos: '¿Lo tenés en kilos? 1 kg = 2.2 lb.',
    dimensions: ['Largo', 'Ancho', 'Alto'],
    unit: 'Medidas en',
    units: { cm: 'Centímetros', pulg: 'Pulgadas' },
    pieces: 'Cantidad de bultos',
    quantity: 'Cantidad de unidades',
    estimate: 'Estimación de tarifa base',
    what: '¿Qué estás cotizando?',
    send: 'Enviar mi cotización por WhatsApp',
    reset: 'Restablecer',
    estimateNote: 'Cálculo orientativo con las tarifas base vigentes.',
    footnote:
      'Estimación orientativa, no una cotización contractual. El total final depende de la revisión del peso, las dimensiones, el contenido, las tarifas aplicables y los posibles cargos adicionales. No incluye el costo de los productos ni la entrega a domicilio.',
    // For the script, with {placeholders}.
    script: {
      delivery: 'Entrega estimada: {transit}, {from}.',
      explainWeight:
        'Peso de cada paquete multiplicado por la cantidad, con un mínimo facturable de {minimum} lb por envío. El peso y la base aplicable se validan en la recepción.',
      explainVolume:
        'Largo × ancho × alto, convertido a pies cúbicos (1 pie = 30.48 cm = 12 pulgadas), sin mínimos ni redondeos.',
      explainUnit: 'Tarifa aérea por unidad del artículo elegido. No se le suma la tarifa por libra.',
      comparison: 'Solo como comparación: por {mode}, el mismo peso serían {total} ({transit}).',
      check: 'Revisá los datos',
      checkHint: 'Usá valores mayores que cero.',
      needData: 'Escribí el peso, las medidas o la cantidad para ver la estimación.',
      weightShipment: 'un envío {mode} de {weight} lb',
      weightShipmentMany: 'un envío {mode} de {count} paquetes de {weight} lb cada uno',
      volumeShipment: 'un envío {mode} de {count} bulto(s) de {measurements} {unit}',
      unitShipment: '{units} por {mode}',
      unitCm: 'cm',
      unitIn: 'pulgadas',
      announce: 'Estimación: {total}',
    },
  },

  // components/carinova/RateCards.astro
  rateCards: {
    tagline: 'Tarifas',
    title: 'Dos caminos. Un mismo destino.',
    subtitle:
      'Las tarifas contemplan seguro e impuestos cuando correspondan al envío. Los plazos cuentan desde la recepción física de tu paquete.',
    cities: BRANCHES.map((branch) => branch.city).join(' y '),
    perPound: 'por libra',
    perCubicFoot: 'por pie³',
    airFacts: ['Pensado para lo que querés recibir pronto.', 'Algunos electrónicos tienen tarifa fija por unidad.'],
    seaFacts: [
      'Ideal para cargas grandes y compras planificadas.',
      'La base por peso o por volumen se determina según la carga, su empaque y las condiciones del servicio.',
    ],
    calculate: (name: string) => `Calcular envío ${name.toLowerCase()}`,
    calculateUnits: 'Calcular por unidad',
    electronicsNote: 'Tarifa por unidad en envíos aéreos. No se suma a la tarifa por libra.',
    pickup: 'Retiro en sucursal:',
    homeDelivery: 'Entrega a domicilio',
    howTitle: 'Cómo calculamos',
    howIntro: 'Una base de cálculo a la vez: el peso, el volumen y la tarifa por unidad no se suman.',
    byPound: {
      title: 'Por libra',
      applies: 'Aéreo y marítimo',
      rule: 'Peso en libras × tarifa por libra, sin mínimos ni redondeos. El peso se valida en la recepción.',
    },
    byCubicFoot: {
      title: 'Por pie cúbico',
      applies: 'Marítimo',
      rule: `Largo × ancho × alto de la caja ÷ 1,728 si medís en pulgadas, o ÷ ${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)} si medís en centímetros = pies cúbicos; × ${formatUSD(sea.pricePerCubicFoot)}.`,
      link: 'Probalo en el cotizador',
    },
    byUnit: {
      title: 'Por unidad',
      applies: 'Electrónicos, por aéreo',
      rule: 'Cantidad × tarifa del equipo. No se le suma la tarifa por libra.',
    },
  },

  // components/carinova/ServiceBadge.astro
  serviceBadge: { soon: 'Próximamente', extra: 'Cargo adicional' },

  // components/carinova/ShippingModes.astro
  shippingModes: {
    eyebrow: 'Envío aéreo y marítimo a Nicaragua',
    title: ['Dos modalidades.', 'Un destino.'],
    intro:
      'Elegí cómo querés recibirlo. Más velocidad cuando lo necesitás, más ahorro cuando podés planificar. Compará antes de decidir.',
    air: {
      tag: 'Para llegar antes',
      overline: 'Envío aéreo',
      title: 'Cuando el tiempo importa.',
      text: 'Ideal para compras y encomiendas que querés recibir pronto.',
    },
    sea: {
      tag: 'Para planificar mejor',
      overline: 'Envío marítimo',
      title: 'Más espacio para tus planes.',
      text: 'Para compras planificadas y cargas de mayor tamaño.',
    },
    baseRate: 'Tarifa base',
    perPound: '/lb',
    orPerCubicFoot: (price: string) => `o ${price} por pie cúbico`,
    electronics: 'Electrónicos: tarifa por unidad',
    delivery: 'Entrega estimada',
    details: (name: string) => `Ver el detalle del envío ${name.toLowerCase()}`,
    important: 'Importante:',
  },

  // components/carinova/SigninDialog.astro
  signinDialog: { label: 'Ingresá a tu cuenta', close: 'Cerrar' },

  // components/carinova/SigninForm.astro
  signinForm: {
    title: 'Ingresá con tu correo',
    intro: `Te mandamos un código de ${LOGIN_CODE_DIGITS} dígitos a tu correo. No necesitás contraseña.`,
    noscript: 'Para ingresar necesitás activar JavaScript en tu navegador.',
    email: 'Correo electrónico',
    emailHint: 'El correo con el que creaste tu cuenta.',
    send: 'Enviarme un código',
    sending: 'Enviando…',
    noAccount: '¿Todavía no tenés cuenta?',
    codeTitle: 'Escribí tu código',
    /** Around the e-mail address the code was sent to: what comes before it and what comes after. */
    codeSent: [
      'Si ',
      ` tiene una cuenta, le enviamos un código de ${LOGIN_CODE_DIGITS} dígitos. Vence en ${LOGIN_CODE_MINUTES} minutos.`,
    ],
    code: `Código de ${LOGIN_CODE_DIGITS} dígitos`,
    enter: CTA.signin.text,
    entering: 'Ingresando…',
    notes: [
      'Puede tardar un par de minutos en llegar. Si no lo ves, revisá la carpeta de spam o correo no deseado.',
      'Nunca te vamos a pedir este código por WhatsApp ni por teléfono.',
    ],
    notArriving: 'Si no llega, puede que ese correo no tenga una cuenta.',
    openYours: 'Creá la tuya',
    resend: 'Enviar otro código',
    change: 'Usar otro correo',
    signedIn: 'Ya ingresaste en este navegador.',
    // For the script.
    messages: {
      emailMissing: 'Escribí tu correo electrónico.',
      codeMissing: `Escribí el código de ${LOGIN_CODE_DIGITS} dígitos.`,
      codeInvalid: 'El código no es correcto o ya venció. Revisalo o pedí otro.',
      resendIn: 'Enviar otro código ({seconds} s)',
      resent: 'Listo: si el correo tiene una cuenta, le enviamos otro código. El anterior ya no sirve.',
      unavailable: 'El ingreso no está disponible en este momento. Escribinos por WhatsApp y te ayudamos.',
      busy: 'Recibimos demasiados intentos seguidos. Esperá un minuto y volvé a intentarlo.',
      failed: 'No pudimos conectarnos. Revisá tu conexión e intentalo de nuevo.',
    },
  },

  // components/carinova/SignupConfirm.astro
  signupConfirm: {
    readyTitle: 'Confirmá tu correo',
    readyText:
      'Un paso más: confirmá tu correo para crear tu cuenta y ver tu Carinova ID y tu dirección en Estados Unidos.',
    confirm: 'Confirmar y crear mi cuenta',
    confirming: 'Creando tu cuenta…',
    noscript: 'Para confirmar tu correo necesitás activar JavaScript en tu navegador.',
    doneTitle: '¡Tu cuenta está lista!',
    doneIntro: 'Este es tu Carinova ID. Guardalo: con él identificamos tu cuenta.',
    emailed: 'También te enviamos estos datos por correo.',
    beforeTitle: 'Antes de comprar',
    beforeText: 'Revisá lo que no podemos traer.',
    nextTitle: '¿Y ahora?',
    nextText: 'Cotizá tu primer envío o mirá cómo funciona, con ejemplos.',
    howToBuy: 'Ver cómo funciona',
    signedIn:
      'Ya ingresaste en este navegador: en tu cuenta encontrás siempre tu Carinova ID, tu dirección, tus paquetes y tus pagos.',
    signedOut: 'Para ver estos datos cuando quieras, ingresá a tu cuenta con tu correo.',
    invalidTitle: 'Este enlace no es válido',
    invalidText: 'Puede que esté incompleto. Abrilo otra vez desde el correo que te mandamos o registrate de nuevo.',
    expiredTitle: 'Este enlace ya venció',
    expiredText: `Los enlaces de confirmación duran ${CONFIRM_LINK_HOURS} horas. Registrate de nuevo y te mandamos otro.`,
    signupAgain: 'Registrarme de nuevo',
    errorTitle: 'No pudimos crear tu cuenta',
    errorText: 'El problema es nuestro, no tuyo. Intentalo de nuevo y, si sigue fallando, escribinos por WhatsApp.',
    retry: 'Intentar de nuevo',
    retrying: 'Intentando…',
    // For the script.
    existingTitle: 'Ya tenés una cuenta',
    existingIntro: 'Este correo ya tiene una cuenta en Carinova. Este es tu Carinova ID:',
    documentTitle: 'Tu cuenta {code} | Carinova',
  },

  // components/carinova/SignupForm.astro
  signupForm: {
    signedIn: 'Ya ingresaste a tu cuenta en este navegador.',
    title: 'Tus datos',
    intro: 'Te toma un par de minutos.',
    noscript:
      'Para registrarte en línea necesitás activar JavaScript en tu navegador. También podés crear tu cuenta por WhatsApp.',
    country: 'País',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo electrónico',
    emailHint: 'Te enviaremos un enlace para confirmar tu cuenta.',
    phone: 'Teléfono',
    phoneHint: 'De preferencia, el número que usás en WhatsApp.',
    address1: 'Dirección',
    address2: 'Apto / Suite',
    optional: '(opcional)',
    city: 'Ciudad',
    choose: 'Elegí uno',
    postalCode: 'Código postal',
    honeypot: 'Dejá este campo vacío',
    sending: 'Enviando…',
    afterSubmit: 'Al enviar, te mandamos un correo para confirmar tu cuenta.',
    /** Two links in one sentence: text, the terms, text, the privacy policy, text. */
    accept: ['Acepto los ', 'Términos y condiciones', ' y la ', 'Política de privacidad', '.'],
    sentTitle: 'Revisá tu correo',
    /** Around the e-mail address the link was sent to. */
    sentTo: [
      'Te mandamos un enlace a ',
      '. Abrilo para confirmar tu cuenta y recibir tu Carinova ID y tu dirección en Estados Unidos.',
    ],
    sentNotes: [
      'Puede tardar un par de minutos en llegar.',
      'Si no lo ves, revisá la carpeta de spam o correo no deseado.',
      `El enlace vence en ${CONFIRM_LINK_HOURS} horas.`,
    ],
    edit: '¿Escribiste mal tu correo? Corregilo',
    // For the script.
    messages: {
      missing: 'Completá este campo.',
      terms: 'Para continuar, aceptá los términos y la política de privacidad.',
      unavailable:
        'El registro en línea no está disponible en este momento. Escribinos por WhatsApp y creamos tu cuenta.',
      busy: 'Recibimos demasiados intentos seguidos. Esperá un minuto y volvé a intentarlo.',
      failed: 'No pudimos enviar tu registro. Revisá tu conexión e intentalo de nuevo, o escribinos por WhatsApp.',
      oneError: 'Hay un campo por corregir.',
      manyErrors: 'Hay {count} campos por corregir.',
    },
  },

  // components/carinova/TopStrip.astro
  topStrip: {
    connect: 'Conectamos',
    usa: 'Estados Unidos',
    with: 'con',
    nicaragua: 'Nicaragua',
    soon: 'próximamente',
    to: 'a',
  },

  // components/carinova/UsAddressCard.astro
  usAddressCard: {
    title: 'Tu dirección en Estados Unidos',
    intro: 'Usala como dirección de envío cuando compres en tiendas de Estados Unidos.',
    warehouse: 'Bodega',
    soonTitle: (city: string) => `${city}: próximamente`,
    soonText: (city: string, state: string) =>
      `Pronto vas a poder recibir tus compras también en ${city}, ${state}. Cuando la bodega esté habilitada, su dirección va a aparecer aquí.`,
    meanwhile: (city: string) => `Mientras tanto, usá tu dirección de ${city}.`,
  },

  // components/carinova/WhatsAppFloat.astro
  whatsAppFloat: { whichBranch: '¿Con qué sucursal?', label: 'Escribinos' },

  // components/widgets/Header.astro
  header: { navigation: 'Navegación principal', menu: 'Menú' },

  // pages/404.astro
  notFoundPage: {
    metaTitle: 'Página no encontrada',
    title: 'No encontramos esta página',
    lead: '¿Buscabas otra cosa?',
    /** Around the link to the home page. */
    text: [
      'Puede que el enlace esté mal escrito o que la página ya no exista. Probá desde el ',
      'inicio',
      ' o seguí con lo que viniste a hacer:',
    ],
  },

  // pages/articulos-prohibidos.astro
  restrictedPage: {
    tagline: 'Artículos prohibidos y restringidos',
    title: '¿Puede ingresar a Nicaragua?',
    metaTitle: 'Artículos prohibidos: qué no se puede enviar a Nicaragua',
    description:
      'Lo que Carinova no puede traer de Estados Unidos a Nicaragua: artículos prohibidos, artículos que todavía no estamos autorizados a traer y productos que no viajan por aéreo pero sí por marítimo. Revisalo antes de comprar.',
    subtitle:
      'Hay artículos que no recibimos ni transportamos, otros que todavía no estamos autorizados a traer y otros que solo viajan por marítimo. Revisá las listas antes de comprar o enviar.',
    closing: {
      title: '¿No estás seguro de un producto?',
      subtitle: 'Preguntanos antes de comprarlo y te decimos si podemos traerlo.',
      lead: 'Mandanos el producto:',
    },
  },

  // pages/como-comprar.astro
  howToBuyPage: {
    tagline: 'Cómo funciona',
    title: 'Cómo comprar en Estados Unidos desde Nicaragua',
    description:
      'Paso a paso para comprar en tiendas de Estados Unidos y recibir en Nicaragua, con ejemplos de cuánto cuesta traer ropa, celulares, laptops, cosas para la casa, muebles y encomiendas.',
    subtitle:
      'Tres pasos claros, desde tu primera compra hasta tener tu paquete en Nicaragua, y ejemplos de cuánto cuesta traer ropa, celulares, laptops, cosas para la casa, muebles y encomiendas.',
    steps: 'Los pasos',
    examples: {
      tagline: 'Ejemplos por categoría',
      title: '¿Cuánto cuesta traer…?',
      subtitle:
        'Seis compras de ejemplo, calculadas con nuestras tarifas. Abrí cualquiera en el cotizador y cambiá los datos por los de tu compra.',
      open: 'Abrir en el cotizador',
    },
    closing: {
      title: 'Empezá por crear tu cuenta',
      subtitle: 'Con tu Carinova ID y tu dirección en Estados Unidos ya podés comprar en cualquier tienda.',
      lead: '¿Querés que te guiemos en tu primera compra?',
    },
    /** Above the amount of a worked example. */
    total: 'Total',
  },

  // pages/cotizador.astro
  quotePage: {
    tagline: 'Tarifas y cotizador',
    metaTitle: 'Cuánto cuesta enviar un paquete a Nicaragua: tarifas y cotizador',
    description: `Cuánto cuesta enviar un paquete de Estados Unidos a Nicaragua: aéreo ${formatUSD(air.pricePerLb)} la libra, marítimo ${formatUSD(sea.pricePerLb)} la libra o ${formatUSD(sea.pricePerCubicFoot)} el pie³, y electrónicos con tarifa por unidad. Calculalo sin registrarte.`,
    title: '¿Cuánto cuesta enviar un paquete a Nicaragua?',
    subtitle:
      'Cotizá tu envío en segundos: calculá cuánto cuesta traer tu compra o tu encomienda de Estados Unidos, sin registrarte.',
    closing: {
      title: '¿Ya sabés cuánto te sale?',
      subtitle: 'Creá tu cuenta y recibí tu Carinova ID y tu dirección en Estados Unidos para empezar a comprar.',
      lead: '¿Tu envío es especial?',
    },
  },

  // pages/empresas.astro
  businessPage: {
    tagline: 'Carinova para negocios',
    metaTitle: 'Carga y envíos para empresas de Estados Unidos a Nicaragua',
    description:
      'Soluciones logísticas de Estados Unidos a Nicaragua para empresas: importación y abastecimiento, envíos recurrentes y atención corporativa, por aéreo o por marítimo. Contanos qué necesitás.',
    title: 'Tus operaciones también merecen moverse mejor.',
    subtitle:
      'Desde el primer abastecimiento hasta el crecimiento de tu empresa, exploramos soluciones logísticas adaptadas a las características de tu carga.',
    offers: 'Lo que exploramos con tu empresa',
    also: 'Y lo que tenés como cualquier cliente',
    benefits: [
      {
        icon: 'tabler:packages',
        title: 'Carga aérea y marítima',
        text: `Aéreo a ${formatUSD(air.pricePerLb)} la libra, en ${air.transit}. Marítimo a ${formatUSD(sea.pricePerLb)} la libra o ${formatUSD(sea.pricePerCubicFoot)} el pie cúbico, en ${sea.transit}.`,
      },
      {
        icon: 'tabler:id-badge-2',
        title: 'Un Carinova ID para tu empresa',
        text: `El mismo ID para todos los envíos de tu empresa, con retiro en ${cityNames.join(' o ')}.`,
      },
    ],
    quote: 'Cotizar un envío',
    next: '¿Qué pasa después?',
    steps: [
      { title: 'Recibimos tu solicitud', description: 'Le llega directamente a nuestro equipo.' },
      {
        title: 'Te contactamos',
        description: 'Por correo o por WhatsApp, para conocer lo que necesita tu empresa.',
      },
      {
        title: 'Abrimos la cuenta de tu empresa',
        description: 'Con su Carinova ID y su dirección en Miami, lista para recibir.',
      },
    ],
    helpTitle: '¿Preferís escribirnos?',
    helpText: 'También abrimos la cuenta de tu empresa por WhatsApp.',
    helpLink: 'Abrir la cuenta de mi empresa',
    closing: {
      title: '¿Querés saber cuánto cuesta tu carga?',
      subtitle: 'Cotizá por libra o por pie cúbico en segundos.',
      lead: '¿Preferís hablar con un asesor?',
    },
  },

  // pages/index.astro
  homePage: {
    /** What Carinova does, in the words people search for: the name of the service in the page's structured data. */
    service: 'Envíos de Estados Unidos a Nicaragua',
    title: `Envíos de Estados Unidos a Nicaragua | Casillero en ${warehouse.city} | Carinova`,
    description: `Envíos de Estados Unidos a Nicaragua con casillero en ${warehouse.city}: aéreo en ${air.transit} a ${formatUSD(air.pricePerLb)} la libra y marítimo en ${sea.transit} desde ${formatUSD(sea.pricePerLb)}. Retirá en ${cityNames.join(' o ')}.`,
  },

  // pages/ingresar.astro
  signinPage: {
    tagline: 'Mi cuenta',
    metaTitle: 'Ingresar a mi cuenta',
    description:
      'Ingresá a tu cuenta de Carinova con tu correo: te enviamos un código y entrás sin contraseña. Ahí están tu Carinova ID, tu dirección en Estados Unidos, tus paquetes y tus pagos.',
    title: 'Ingresá a tu cuenta',
    subtitle:
      'Realizá todas tus gestiones desde un mismo lugar: tu Carinova ID, tu dirección, tus paquetes y tus pagos.',
    howTitle: 'Así funciona',
    how: [
      {
        icon: 'tabler:mail',
        title: 'Sin contraseña',
        text: 'No hay nada que recordar ni que te puedan robar: cada vez que ingresás te mandamos un código nuevo a tu correo.',
      },
      {
        icon: 'tabler:clock',
        title: 'Un código para una vez',
        text: `Sirve una sola vez y vence a los ${LOGIN_CODE_MINUTES} minutos.`,
      },
      {
        icon: 'tabler:shield-lock',
        title: 'Tu sesión, en este navegador',
        text: `Quedás dentro ${SESSION_DAYS} días o hasta que cerrés sesión. En un dispositivo compartido, cerrala al terminar.`,
      },
    ],
    helpTitle: '¿No podés ingresar?',
    helpText: 'Escribinos con tu Carinova ID o con el correo de tu cuenta.',
  },

  // pages/mi-cuenta.astro
  accountPage: {
    tagline: 'Mi cuenta',
    metaTitle: 'Mi cuenta: Carinova ID, paquetes y pagos',
    description: `Ingresá a tu cuenta Carinova: tu Carinova ID, tu dirección en Estados Unidos, tus paquetes con su estado y tus pagos. Retirá en ${cityNames.join(' o ')}.`,
    title: 'Tu cuenta Carinova',
    subtitle:
      'Realizá todas tus gestiones desde un mismo lugar: tu Carinova ID, tu dirección, tus paquetes y tus pagos.',
    signin: 'Ingresá a tu cuenta',
    noAccount: '¿Todavía no tenés cuenta?',
    includes: 'Lo que encontrás en tu cuenta',
    looksLike: 'Se ve así',
    idFacts: [
      'El sistema te lo asigna al confirmar tu correo.',
      'Es el mismo para aéreo, marítimo, encomiendas y compras asistidas.',
    ],
    company: '¿Sos empresa?',
    companyLink: 'Conocé Carinova para negocios',
    fullAddress: 'Ves la dirección completa al ingresar.',
    stages: 'Cada paquete, con su etapa:',
    paymentFacts: [
      'Cada factura con su monto y su estado.',
      'Un pago aparece como confirmado cuando nuestro equipo lo verifica.',
    ],
    pickup: 'Retirás en',
    homeDelivery: 'Entrega a domicilio',
    branches: 'Ver sucursales',
    closing: {
      title: 'Creá tu cuenta en un par de minutos',
      subtitle: 'Llenás un formulario corto, confirmás tu correo y listo: ya tenés tu Carinova ID.',
      lead: '¿Tenés dudas antes de registrarte?',
    },
  },

  // pages/nosotros.astro
  aboutPage: {
    tagline: 'Sobre nosotros',
    metaTitle: 'Sobre nosotros: quiénes somos y de dónde venimos',
    description: `Carinova es una empresa nicaragüense de envíos de Estados Unidos a Nicaragua, nacida en ${bluefields}. Conocé nuestras raíces, qué hacemos y dónde encontrarnos en ${cityNames.join(' y ')}.`,
    title: `Somos Carinova, el courier que nació en ${bluefields}`,
    subtitle: `Una empresa nicaragüense que trae tus compras, tus encomiendas y la carga de tu negocio desde Estados Unidos, con sucursales en ${cityNames.join(' y ')}.`,
    // "Nuestras raíces": Carinova's own words, from the page it wrote on 2026-11-18. A section of the
    // home page until 2026-11-21 (D-131).
    roots: {
      title: 'Nuestras raíces',
      text: 'Carinova nació en Bluefields, en la Costa Caribe Sur de Nicaragua. Llevamos en nuestro ADN la calidez, el compromiso y la fuerza de nuestra tierra multicultural, y trabajamos cada día para acortar distancias y entregar tus paquetes con la confianza y el cariño que nos caracterizan.',
      emblemAlt: 'Emblema de Carinova: tres figuras sostienen una llama dentro de un círculo',
    },
    whatTagline: 'Qué hacemos',
    whatTitle: 'Acercamos las tiendas de Estados Unidos a Nicaragua',
    what: `Con tu cuenta recibís tu Carinova ID y una dirección en ${warehouse.city} para comprar en cualquier tienda. Recibimos tus paquetes allá, los traemos por aire o por mar y los retirás en ${cityNames.join(' o ')}.`,
    servicesLink: 'Ver los servicios en detalle',
    factsTagline: 'En pocas palabras',
    factsTitle: 'Carinova en datos',
    facts: {
      origin: 'Nacimos en',
      originValue: `${bluefields}, Costa Caribe Sur de Nicaragua`,
      route: 'Nuestra ruta',
      routeValue: 'De Estados Unidos a Nicaragua',
      reception: 'Recibimos tus compras en',
      branches: 'Sucursales en Nicaragua',
      transport: 'Cómo viajan tus paquetes',
      contact: 'Atención por WhatsApp',
      networks: 'Seguinos en',
    },
    valuesTagline: 'Nuestros valores',
    valuesTitle: 'Lo que nos mueve',
    values: [
      {
        title: 'Trabajo en equipo',
        description:
          'Como en nuestro emblema: tres figuras que sostienen juntas la misma llama. Cada envío es trabajo de equipo, desde Miami hasta tu sucursal.',
      },
      {
        title: 'Alcance internacional',
        description:
          'El círculo que las rodea es el puente que cruzamos todos los días entre Estados Unidos y Nicaragua.',
      },
      {
        title: 'Compromiso',
        description: 'La llama es nuestra promesa: cuidar cada paquete como si fuera nuestro.',
      },
    ],
    where: 'Dónde estamos',
    reviewsTagline: 'Opiniones',
    reviewsTitle: 'Lo que dicen nuestros clientes',
    faqTitle: 'Preguntas sobre Carinova',
    faq: [
      {
        title: '¿Qué es Carinova?',
        description:
          'Carinova es una empresa nicaragüense de envíos. Traemos compras personales, encomiendas familiares y carga empresarial desde Estados Unidos hasta Nicaragua, por aire o por mar.',
      },
      {
        title: '¿De dónde es Carinova?',
        description: `Carinova nació en ${bluefields}, en la Costa Caribe Sur de Nicaragua, y hoy tiene sucursales en ${cityNames.join(' y ')}.`,
      },
      {
        title: '¿Dónde están las sucursales de Carinova y en qué horario atienden?',
        description: sentence(`En ${cityNames.join(' y ')}. Atendemos de ${describeHours(hours)}`),
      },
      {
        title: '¿Desde dónde trae Carinova los paquetes?',
        description: `Los recibimos en nuestra bodega de ${warehouse.city}, ${warehouse.state}, y los traemos a Nicaragua por vía aérea en ${air.transit} o por vía marítima en ${sea.transit}, contados desde que el paquete llega a la bodega.`,
      },
      {
        title: '¿Cómo me comunico con Carinova?',
        description: `Por WhatsApp, al <span dir="ltr">${CONTACT.whatsappDisplay}</span>, o en cualquiera de nuestras sucursales.`,
      },
      {
        title: '¿Dónde leo opiniones de clientes de Carinova?',
        description:
          'En la página de opiniones de este sitio están las que nuestros clientes publicaron, tal como las escribieron y con el enlace a donde se publicó cada una.',
      },
    ],
    careers: {
      title: 'Formá parte de nuestro equipo.',
      text: 'Buscamos personas comprometidas con el servicio y la excelencia operativa.',
      link: 'Conocé cómo postularte',
    },
    closing: {
      title: 'Hagamos tu primer envío',
      subtitle: 'Creá tu cuenta en línea o cotizá tu envío antes de comprar.',
      lead: '¿Querés conocernos mejor?',
    },
  },

  // What a review's card says, on the home page, on the page of reviews and on the page about
  // Carinova (components/carinova/ReviewCard.astro, components/landing/Testimonials.astro). The
  // reviews themselves are REVIEWS (src/data/carinova.ts) and are never translated.
  reviews: {
    recommends: 'Recomienda Carinova',
    rating: '{rating} de 5 estrellas',
    seeOn: 'Ver en {source}',
    allOn: 'Todas las opiniones en {source}',
    readAll: 'Leer completa',
    seeAll: 'Ver todas las opiniones',
    moreTitle: 'Hay más opiniones',
    moreText: 'Leé todo lo que nuestros clientes cuentan de sus envíos.',
  },

  // pages/opiniones.astro
  reviewsPage: {
    tagline: 'Opiniones',
    metaTitle: 'Opiniones y reseñas de clientes',
    description:
      'Opiniones reales de clientes de Carinova sobre sus envíos de Estados Unidos a Nicaragua, tal como las publicaron en {sources}. Leelas antes de tu primer envío.',
    title: 'Lo que dicen los clientes de Carinova',
    subtitle:
      'Opiniones reales de quienes ya trajeron sus compras de Estados Unidos a Nicaragua con nosotros, tal como las publicaron en {sources}.',
    listTitle: 'Opiniones de clientes',
    filterLabel: 'Mostrar opiniones de',
    all: 'Todas',
    howTitle: 'Cómo mostramos las opiniones',
    how: [
      {
        title: 'Publicadas por sus autores',
        text: 'Cada opinión fue publicada por su autor, con su nombre, en {sources}.',
      },
      {
        title: 'Ni una palabra cambiada',
        text: 'Las copiamos tal como fueron escritas y en su idioma original, sin corregirlas ni traducirlas.',
      },
      {
        title: 'Con el enlace a su origen',
        text: 'Cada una lleva a la página de Carinova donde se publicó. Ahí están todas, también las más nuevas.',
      },
    ],
    writeTitle: '¿Ya recibiste tu paquete? Contanos cómo te fue',
    writeText: 'Tu opinión ayuda a otras personas a decidirse y a nosotros a mejorar.',
    writeOn: 'Opinar en {source}',
    nextTitle: 'Antes de tu primer envío',
    next: {
      how: 'Mirá cómo funciona, paso a paso',
      quote: 'Calculá cuánto cuesta tu envío',
      branches: 'Conocé dónde retirás tu paquete',
      about: 'Conocé quiénes somos',
    },
    closing: {
      title: 'Hacé tu primer envío con Carinova',
      subtitle: 'Creá tu cuenta en línea y recibí tu Carinova ID y tu dirección en Estados Unidos.',
      lead: '¿Querés preguntarnos algo antes?',
    },
  },

  // pages/preguntas-frecuentes.astro
  faqPage: {
    tagline: 'Ayuda',
    title: 'Preguntas frecuentes sobre envíos a Nicaragua',
    description:
      'Casillero y Carinova ID, servicios, tarifas, plazos, artículos restringidos y retiro: respuestas a las dudas más comunes sobre los envíos de Estados Unidos a Nicaragua con Carinova.',
    subtitle: 'Todo sobre tu cuenta, los servicios, las tarifas, los tiempos de entrega y el retiro de tus paquetes.',
    topics: 'Temas',
    closing: {
      title: '¿No encontraste tu respuesta?',
      subtitle: 'Escribinos y te ayudamos, o empezá creando tu cuenta.',
      lead: 'Contanos tu duda:',
    },
  },

  // pages/registro.astro
  signupPage: {
    tagline: 'Mi cuenta',
    title: 'Creá tu cuenta',
    description: `Creá tu cuenta en línea y recibí tu Carinova ID y tu casillero en ${warehouse.city}: una dirección en Estados Unidos para comprar en cualquier tienda y recibir en ${cityNames.join(' o ')}.`,
    subtitle:
      'Un solo registro. Al confirmar tu correo, el sistema te asigna automáticamente tu Carinova ID y te muestra tu dirección en Estados Unidos.',
    existing: '¿Ya tenés cuenta?',
    next: '¿Qué pasa después?',
    steps: [
      { title: 'Confirmá tu correo', description: 'Te mandamos un enlace. Abrilo para activar tu cuenta.' },
      {
        title: 'Recibí tu Carinova ID y tu dirección en Estados Unidos',
        description: 'Los ves en pantalla al confirmar y también te llegan por correo.',
      },
      {
        title: 'Comprá y nosotros lo traemos',
        description: `Usá tu dirección en la tienda, seguí tu paquete en tu cuenta y retiralo en ${cityNames.join(' o ')}.`,
      },
    ],
    helpTitle: '¿Preferís que te ayudemos?',
    helpText: 'Escribinos y creamos tu cuenta por WhatsApp.',
  },

  // pages/servicios.astro
  servicesPage: {
    tagline: 'Servicios',
    metaTitle: 'Envíos aéreos y marítimos a Nicaragua, encomiendas y compras asistidas',
    description:
      'Envíos aéreos y marítimos de Estados Unidos a Nicaragua, encomiendas, compras asistidas, retiro en sucursal y entrega a domicilio. Elegí cómo viaja tu paquete y cómo lo recibís.',
    title: 'Envíos aéreos y marítimos de Estados Unidos a Nicaragua',
    subtitle: 'Cada envío combina tres decisiones: cómo viaja, quién hace la compra y cómo lo recibís.',
    kinds: 'Tipos de servicio',
    closing: {
      title: '¿No sabés qué te conviene?',
      subtitle: 'Cotizá tu envío y compará aéreo con marítimo, o creá tu cuenta y empezá a comprar.',
      lead: '¿Querés que te aconsejemos?',
    },
  },

  // pages/sucursales.astro
  branchesPage: {
    tagline: 'Sucursales',
    title: `Sucursales en ${cityNames.join(' y ')}`,
    description: `Direcciones, horarios y WhatsApp de Carinova en ${cityNames.join(' y ')}.${sameHours ? ` ${sentence(`Abrimos de ${describeHours(hours)}`)}` : ''}`,
    subtitle: sameHours
      ? sentence(`Por ahora retirás en ${cityNames.join(' y ')}, de ${describeHours(hours)}`)
      : `Por ahora retirás en ${cityNames.join(' y ')}.`,
    closing: {
      title: 'Tu próxima compra, lista para retirar',
      subtitle: 'Creá tu cuenta y cotizá tu envío antes de comprar.',
      lead: '¿No sabés en qué sucursal te conviene retirar?',
    },
  },

  // components/carinova/Tracker.astro and TrackingSection.astro
  tracker: {
    switchLabel: '¿Qué querés consultar?',
    tabs: { track: 'Rastrear paquete', check: '¿Puede ingresar?' },
    track: {
      title: 'Rastreá tu paquete',
      visitor:
        'Ingresá a tu cuenta para ver tus paquetes: lo que recibimos en bodega, lo que va en camino y lo que ya podés retirar.',
      signin: 'Ingresá para ver tus paquetes',
      noAccount: '¿Todavía no tenés cuenta?',
      customer: 'Escribí la referencia de tu paquete, o dejá el campo vacío para ver los que van en camino.',
      label: 'Referencia del paquete o número de rastreo',
      placeholder: 'Ej.: PKG-000123',
      submit: 'Rastrear',
      all: 'Ver todos mis paquetes y pagos',
      privacy: 'Por seguridad, el Carinova ID por sí solo no autoriza a consultar datos privados.',
    },
    check: {
      title: '¿Puede ingresar a Nicaragua?',
      intro:
        'Buscá el artículo que querés traer. El resultado es una orientación inicial, no una autorización de importación ni de transporte.',
      label: '¿Qué querés traer?',
      placeholder: 'Ej.: laptop, perfume, zapatos…',
      examples: 'Probá con:',
      lists: 'Ver las listas completas',
      ask: 'Consultar por WhatsApp',
      note: 'No sustituye la validación aduanera, los permisos ni la confirmación de Carinova.',
      // For the script.
      script: {
        idleTitle: 'Consultá antes de comprar.',
        idleText: 'Escribí el nombre del artículo para recibir una orientación.',
        unknownTitle: 'No aparece en nuestras listas',
        unknownText:
          'Eso no significa que pueda ingresar: hay artículos que necesitan permisos o una revisión. Consultanos antes de comprarlo.',
      },
    },
  },

  // components/widgets/Footer.astro
  footer: {
    channelsEyebrow: 'Estamos en línea',
    channelsTitle: 'Seguinos y escribinos',
    previous: 'Canales anteriores',
    next: 'Más canales',
    /** The name of the e-mail among the channels. */
    email: 'Correo',
    languages: 'Idiomas',
  },

  // src/navigation.ts and the layouts: the header, the footer and the trail of a page
  nav: {
    home: 'Inicio',
    services: 'Servicios',
    shopper: 'Compras por vos',
    rates: 'Tarifas',
    calculator: 'Cotizador',
    howItWorks: 'Cómo funciona',
    business: 'Empresas',
    help: 'Ayuda',
    explore: 'Explorá',
    yours: 'Tu Carinova',
    near: 'Estamos cerca',
    canItEnter: '¿Puede ingresar?',
    tracking: 'Rastreo',
    faq: 'Preguntas frecuentes',
    about: 'Nosotros',
    reviews: 'Opiniones',
    terms: 'Condiciones del servicio',
    privacy: 'Privacidad',
    and: ' y ',
    or: ' o ',
    brand: 'Envíos que unen. Acercamos tus compras, tu familia y los proyectos de tu empresa.',
    route: ['USA', 'Nicaragua'],
    rights: 'Todos los derechos reservados. Tarifas y plazos sujetos a verificación.',
    /** The language menu of the header. */
    language: 'Idioma',
    languageChoose: 'Elegí tu idioma',
    locker: `Casillero en ${warehouse.city}`,
    stores: 'Tiendas',
  },

  // components/common/Metadata.astro: what a page without its own title or description says
  meta: {
    title: `Envíos de Estados Unidos a Nicaragua | Casillero en ${warehouse.city} | Carinova`,
    description: `Envíos de Estados Unidos a Nicaragua con casillero en ${warehouse.city}, por aéreo o por marítimo. Creá tu cuenta en línea y retirá en ${cityNames.join(' o ')}.`,
  },

  // The statuses of packages, invoices and payments (src/data/account.ts), by their id
  statuses: {
    package: byId<PackageStatus, StatusWords>(PACKAGE_STATUSES),
    invoice: byId<InvoiceState, StatusWords>(INVOICE_STATES),
    payment: byId<PaymentStatus, StatusWords>(PAYMENT_STATUSES),
    paymentMethod: byId<PaymentMethod, string>(PAYMENT_METHODS),
  },

  // What Carinova explores with a company and the options of its form (src/data/business.ts), by their id
  business: {
    solutions: byId<string, { title: string; text: string }>(BUSINESS_SOLUTIONS),
    disclaimer: BUSINESS_DISCLAIMER.es,
    volumes: byId<string, string>(BUSINESS_VOLUMES),
  },

  // pages/rastreo.astro and components/carinova/PackageLookup.astro
  trackPage: {
    tagline: 'Rastreo',
    metaTitle: 'Rastreo de paquetes de Estados Unidos a Nicaragua',
    description:
      'Seguí tus paquetes de Estados Unidos a Nicaragua con Carinova: recibido en bodega, en preparación, en tránsito, disponible para entrega y entregado. Ingresá a tu cuenta y rastreá cada envío con su referencia.',
    title: 'Rastreá tu paquete',
    subtitle: 'Ingresá a tu cuenta y seguí cada envío con su referencia, etapa por etapa.',
    stagesTitle: 'Las etapas de tu paquete',
    stagesIntro: 'Así avanza cada envío, desde nuestra bodega en Estados Unidos hasta tus manos.',
    results: {
      active: 'Tus paquetes en camino',
      found: 'Resultado de tu búsqueda',
      loading: 'Buscando tus paquetes…',
      empty:
        'Todavía no recibimos paquetes a tu nombre. Cuando el primero llegue a nuestra bodega lo vas a ver aquí, con su etapa.',
      none: 'No tenés paquetes en camino en este momento.',
      notFoundHint: 'Revisá que esté bien escrita: la referencia empieza con PKG y aparece en tu cuenta.',
      askMissing: 'Consultar por esta referencia',
      ask: 'Consultar por este paquete',
      history: 'Ver historial',
      error: 'No pudimos cargar tus paquetes. Revisá tu conexión e intentalo de nuevo.',
      retry: 'Intentar de nuevo',
      // For the script, with {placeholders}.
      script: {
        notFound: 'No encontramos un paquete con la referencia {reference} en tu cuenta.',
        summary: '{reference} · {service}',
      },
    },
    closing: {
      title: '¿Todavía no tenés cuenta?',
      subtitle: 'Creá tu cuenta y seguí cada compra desde que llega a nuestra bodega.',
      lead: '¿No encontrás tu paquete?',
    },
  },

  // components/carinova/ProductLinkForm.astro
  productLink: {
    label: 'Enlace del producto',
    placeholder: 'https://tienda.com/producto',
    submit: 'Preparar solicitud',
    hint: 'Se abre WhatsApp con tu solicitud lista para enviar. Nada se compra hasta que confirmemos el costo total.',
    /** What the page says about a text that is not a link. */
    invalid: 'Pegá el enlace completo del producto: empieza con https://',
  },

  // pages/casillero-en-miami.astro
  lockerPage: {
    tagline: 'Casillero',
    metaTitle: `Casillero en ${warehouse.city} para Nicaragua`,
    description: `Abrí gratis tu casillero en ${warehouse.city} con Carinova: una dirección en Estados Unidos para comprar en Amazon, SHEIN o Temu y recibir en ${cityNames.join(' o ')}. Aéreo en ${air.transit}, marítimo en ${sea.transit}.`,
    title: `Casillero en ${warehouse.city} para Nicaragua`,
    subtitle: `Una dirección en Estados Unidos a tu nombre para comprar en cualquier tienda y recibir en ${cityNames.join(' o ')}. Viene con tu cuenta Carinova.`,
    whatTitle: `¿Qué es un casillero en ${warehouse.city} y cómo funciona?`,
    what: [
      'Un casillero es una dirección en Estados Unidos que usás como si vivieras allá: la escribís como dirección de envío cuando comprás en línea, la tienda entrega tu paquete en nuestra bodega y nosotros lo traemos a Nicaragua.',
      'También se le dice casillero virtual o casillero internacional: es lo mismo. En Carinova no se contrata aparte: viene con tu cuenta.',
      'Al crear tu cuenta recibís tu Carinova ID y tu dirección. Con el Carinova ID identificamos cada paquete que llega a tu nombre.',
    ],
    addressTitle: 'Dónde recibimos tus compras',
    addressNote: 'Ves la dirección completa al crear tu cuenta.',
    includesTitle: 'Lo que incluye tu casillero',
    includesLink: 'Ver todo lo que hay en tu cuenta',
    costTitle: '¿Cuánto cuesta un casillero?',
    cost: 'Crear tu cuenta es gratis: solo pagás el envío de cada paquete, por libra o, en marítimo, también por pie cúbico.',
    costLink: 'Calcular cuánto cuesta mi envío',
    stepsTitle: 'Cómo usar tu casillero',
    stepsLink: 'Ver cada paso con ejemplos',
    faqTitle: 'Preguntas sobre el casillero y tu cuenta',
    closing: {
      title: 'Abrí tu casillero en un par de minutos',
      subtitle: 'Creá tu cuenta en línea y recibí tu Carinova ID y tu dirección en Estados Unidos.',
      lead: '¿Tenés dudas antes de abrirlo?',
    },
  },

  // pages/tiendas.astro
  storesPage: {
    tagline: 'Tiendas',
    metaTitle: 'Comprar en Amazon, SHEIN y Temu desde Nicaragua',
    description: `Cómo comprar en Amazon, SHEIN, Temu, Walmart y otras tiendas de Estados Unidos desde Nicaragua: usá la dirección de tu cuenta Carinova o pedí que compremos por vos, y recibí en ${cityNames.join(' o ')}.`,
    title: 'Comprá en tiendas de Estados Unidos desde Nicaragua',
    subtitle:
      'Amazon, SHEIN, Temu, Walmart y muchas más: comprás con la dirección de tu cuenta y nosotros lo traemos a Nicaragua.',
    howTitle: 'Cómo comprar en una tienda de Estados Unidos',
    howLink: 'Ver cada paso con ejemplos',
    restrictedLink: 'Revisar qué artículos no pueden ingresar',
    storesTitle: 'Tiendas donde podés comprar',
    storesIntro:
      'Podés comprar en cualquier tienda en línea que entregue dentro de Estados Unidos. Estas son algunas de las más buscadas, por categoría.',
    categories: 'Categorías de tiendas',
    buyAt: (store: string) => `Comprar en ${store} desde Nicaragua`,
    visit: (store: string) => `Ir al sitio de ${store}`,
    assist: 'Pedir que compremos por vos',
    disclosure:
      'Las tiendas se muestran como ejemplos, sin convenio ni aval implícito. Precios, disponibilidad y condiciones de cada compra se consultan en el sitio de cada tienda.',
    assistTitle: '¿Preferís que compremos por vos?',
    assistIntro:
      'Con la compra asistida elegís el producto y Carinova hace la compra. Pegá el enlace del producto y prepará tu solicitud.',
    closing: {
      title: '¿Listo para tu primera compra?',
      subtitle: 'Creá tu cuenta y usá tu dirección en Estados Unidos en la tienda que prefirás.',
      lead: '¿Tenés dudas con una tienda?',
    },
  },

  // pages/index.astro and components/landing: the home page Carinova wrote (./landing)
  landing,
};

export type UI = typeof ui;
