/**
 * Frequently asked questions, grouped by stage of the customer's journey (account, services, rates,
 * times, restricted items, pickup): every question belongs to exactly one group. The questions of
 * Carinova's prototype are the ones the home page shows, in the prototype's order: `featured` is
 * their position there. Answers may contain simple HTML (links). Prices, times and lists come from
 * carinova.ts so they never disagree with the rest of the site.
 *
 * This is the Spanish wording; en/faq.ts has the same questions in English, in the same order (a
 * unit test compares the two). Both are functions of `link`, which writes a link to a page of the
 * site in the language being rendered: pages get the result as `FAQ_GROUPS` through `i18n(Astro)`
 * (src/i18n). Relative imports with the .ts extension: the unit tests run this file on plain Node.
 *
 * Draft answers marked TODO describe usual courier practice and must be confirmed by Carinova.
 */
import { LOGIN_CODE_DIGITS, PACKAGE_STAGES } from './account.ts';
import {
  BRANCHES,
  CARINOVA_ID_EXAMPLE,
  RATES,
  RECEPTION_POINTS,
  RESTRICTED_ITEMS,
  STORES,
  describeHours,
  sentence,
  type RestrictedItem,
} from './carinova.ts';
import { FORMULA_EXAMPLE } from './services.ts';
import { CUBIC_CM_PER_CUBIC_FOOT, describeVolume, formatNumber, formatUSD, quoteByVolume } from '../utils/rates.ts';

export interface FaqItem {
  title: string;
  description: string;
  /** Its position among the questions of the home page; without one, it is only on the FAQ page. */
  featured?: number;
}

export interface FaqGroup {
  id: string;
  title: string;
  items: Array<FaqItem>;
}

/** Writes a link to a page of the site, given its Spanish path: "/mi-cuenta", "/servicios#aereo". */
export type LinkTo = (path: string, text: string) => string;

/** How many stores the answer about stores names before "y muchas más". */
export const FAQ_STORE_COUNT = 6;

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city).join(' y ');
const [hours] = BRANCHES[0].hours;
const receiving = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
const soonReception = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);
const devices = electronics.items
  .map((item) => `${item.brand ? item.plural : item.plural.toLowerCase()} ${formatUSD(item.price)}`)
  .join(', ');
const stores = STORES.slice(0, FAQ_STORE_COUNT)
  .map((store) => store.name)
  .join(', ');
/** "Armas, Drones" → "armas; drones": the items carry commas of their own. */
const inline = (items: Array<RestrictedItem>) =>
  items.map((item) => item.name.charAt(0).toLowerCase() + item.name.slice(1)).join('; ');
const stages = PACKAGE_STAGES.map((stage) => stage.es.name.toLowerCase()).join(', ');

export const faqGroups = (link: LinkTo): Array<FaqGroup> => [
  {
    id: 'cuenta',
    title: 'Cuenta y Carinova ID',
    items: [
      {
        title: '¿Cómo obtengo mi Carinova ID?',
        description: `Completá ${link('/registro', 'el registro')} con tu correo electrónico y tu teléfono, y confirmá tu correo con el enlace que te mandamos. Al confirmar, la plataforma genera automáticamente tu Carinova ID único (por ejemplo, ${CARINOVA_ID_EXAMPLE}).`,
        featured: 1,
      },
      {
        title: '¿Qué es el Carinova ID?',
        description:
          'Es el identificador de tu cuenta. Hay uno por persona o por empresa, y es el mismo para todos nuestros servicios: aéreo, marítimo, encomiendas y compras asistidas.',
      },
      {
        title: '¿Cómo ingreso a mi cuenta?',
        description: `Tocá ${link('/ingresar', 'Ingresá')} y escribí el correo con el que te registraste: te mandamos un código de ${LOGIN_CODE_DIGITS} dígitos y entrás con él, sin contraseña. En ${link('/mi-cuenta', 'tu cuenta')} están tu Carinova ID, tu dirección en Estados Unidos, tus paquetes y tus pagos.`,
      },
      {
        // TODO: confirm that creating an account is free.
        title: '¿Cuánto cuesta crear mi cuenta?',
        description: `Crear tu cuenta es gratis: solo pagás el envío de cada paquete. ${link('/registro', 'Creala en línea')} y recibí tu Carinova ID.`,
      },
      {
        // TODO: confirm how company accounts are opened.
        title: '¿Puedo abrir una cuenta para mi empresa?',
        description: `Sí: hay un Carinova ID por persona o por empresa. Contanos de tu empresa en ${link('/empresas', 'el formulario para empresas')} y te contactamos, o escribinos por WhatsApp.`,
      },
      {
        title: '¿Dónde envío mis compras de EE. UU.?',
        description: `Tu cuenta muestra la dirección y las instrucciones de recepción de nuestra bodega en ${receiving.join(' y ')}. Usá exactamente esos datos para que identifiquemos tu envío.${
          soonReception.length ? ` Próximamente también vas a poder recibir en ${soonReception.join(' y ')}.` : ''
        }`,
        featured: 2,
      },
    ],
  },
  {
    id: 'servicios',
    title: 'Servicios',
    items: [
      {
        title: '¿Qué diferencia hay entre aéreo y marítimo?',
        description: `El aéreo es más rápido: ${air.transit}, a ${formatUSD(air.pricePerLb)} la libra. El marítimo es más económico: ${sea.transit}, a ${formatUSD(sea.pricePerLb)} la libra o ${formatUSD(sea.pricePerCubicFoot)} el pie cúbico; conviene para cargas grandes y compras planificadas. Los plazos cuentan ${RATES.transitFrom}.`,
      },
      {
        title: '¿Qué es una encomienda?',
        description:
          'Cualquier paquete que llega a nuestra bodega a tu nombre: tus compras en línea o la caja que te manda tu familia desde Estados Unidos. Viaja por aéreo o por marítimo, como prefieras.',
      },
      {
        // TODO: confirm whether the service has a fee and how customers pay for the product.
        title: '¿Pueden comprar un producto por mí?',
        description: `Sí. Elegí la tienda y compartinos el enlace. La compra asistida requiere confirmación de disponibilidad, admisibilidad, costos del producto, servicio y transporte. ${link('/#compras', 'Prepará tu solicitud')}.`,
        featured: 8,
      },
      {
        title: '¿En qué tiendas puedo comprar?',
        description: `En cualquier tienda en línea que envíe dentro de Estados Unidos: ${stores} y muchas más.`,
      },
    ],
  },
  {
    id: 'tarifas',
    title: 'Tarifas y pagos',
    items: [
      {
        title: '¿Cómo se calcula la tarifa?',
        description: `Aéreo: ${formatUSD(air.pricePerLb)} por libra, con tarifas por unidad para electrónicos específicos. Marítimo: ${formatUSD(sea.pricePerLb)} por libra o ${formatUSD(sea.pricePerCubicFoot)} por pie cúbico. La base de cobro se determina según la mercancía y las condiciones del servicio. Calculala en nuestro ${link('/cotizador', 'cotizador')}.`,
        featured: 4,
      },
      {
        title: '¿Cómo se calcula el pie cúbico?',
        description: `Multiplicá el largo, el ancho y el alto de la caja en pulgadas y dividí el resultado entre 1,728; si medís en centímetros, dividilo entre ${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)}. Por ejemplo: ${describeVolume(
          quoteByVolume(FORMULA_EXAMPLE.dims, sea.pricePerCubicFoot, { unit: FORMULA_EXAMPLE.unit })
        )}.`,
      },
      {
        title: '¿Qué electrónicos tienen tarifa por unidad?',
        description: `En envíos aéreos: ${devices}. La tarifa por unidad no se suma a la tarifa por libra.`,
      },
      {
        title: '¿Incluye seguro e impuestos?',
        description:
          'Las tarifas contemplan seguro e impuestos cuando correspondan al envío. La cobertura, los límites, las exclusiones y los cargos adicionales están sujetos a las condiciones del servicio. Confirmá los términos aplicables antes de contratar.',
        featured: 5,
      },
      {
        title: '¿El precio estimado es lo que voy a pagar?',
        description:
          'No necesariamente. El cotizador calcula una tarifa de referencia, sin incluir la compra del producto ni el servicio de entrega a domicilio. El monto final se confirma después de revisar las dimensiones, el peso, el contenido, la modalidad y las condiciones específicas.',
        featured: 9,
      },
      {
        // TODO: confirm payment moment and methods.
        title: '¿Cuándo y cómo pago?',
        description: `Pagás el envío al retirar tu paquete o al coordinar su entrega. Escribinos para conocer las formas de pago disponibles. En ${link('/mi-cuenta', 'tu cuenta')} ves tus facturas y los pagos que confirmamos.`,
      },
    ],
  },
  {
    id: 'tiempos',
    title: 'Plazos y seguimiento',
    items: [
      {
        title: '¿Desde cuándo cuentan los plazos?',
        description: `Desde la recepción física del paquete, no desde la fecha de compra. Aéreo: ${air.transit}. Marítimo: ${sea.transit}. Son estimaciones sujetas a tránsito, aduana y destino.`,
        featured: 3,
      },
      {
        title: '¿Cómo rastreo varios paquetes con un mismo Carinova ID?',
        description: `El Carinova ID corresponde a tu cuenta. Al ${link('/ingresar', 'iniciar sesión')} ves cada paquete con su referencia y sus estados de seguimiento. Por seguridad, el número de cuenta por sí solo no autoriza a consultar datos privados.`,
        featured: 10,
      },
      {
        title: '¿Qué estados puede tener mi paquete?',
        description: `En orden: ${stages}. Cada cambio queda en el historial del paquete, en ${link('/mi-cuenta', 'tu cuenta')}.`,
      },
    ],
  },
  {
    id: 'prohibidos',
    title: 'Artículos restringidos',
    items: [
      {
        title: '¿Qué artículos puedo traer?',
        description: `Depende del tipo de mercancía, sus componentes y las reglas de transporte. No recibimos ni transportamos: ${inline(RESTRICTED_ITEMS.prohibited.items)}. Todavía no estamos autorizados para traer: ${inline(RESTRICTED_ITEMS.notYet.items)}. ${link('/articulos-prohibidos', 'Revisá las listas completas')} y, si tu artículo no aparece, consultanos antes de comprarlo.`,
        featured: 6,
      },
      {
        title: '¿Puedo traer perfumes o aerosoles?',
        description: `Sí, por transporte marítimo: ${inline(RESTRICTED_ITEMS.seaOnly.items)} no ingresan por transporte aéreo.`,
      },
      {
        title: '¿Puedo traer un carro o una moto?',
        description: `Todavía no: aún no estamos autorizados para traer ${inline(RESTRICTED_ITEMS.notYet.items)}.`,
      },
    ],
  },
  {
    id: 'retiro',
    title: 'Retiro y entrega',
    items: [
      {
        title: '¿Dónde retiro mi paquete?',
        description: `${sentence(`En nuestras sucursales de ${cities}, de ${describeHours(hours)}`)} ${link('/sucursales', 'Ver direcciones y horarios')}.`,
      },
      {
        title: '¿Hacen entregas a domicilio?',
        description:
          'Realizamos envíos a todo el país, sujetos a coordinación y cobertura. La entrega a domicilio tiene un cargo adicional según el destino y las condiciones operativas.',
        featured: 7,
      },
      {
        // TODO: confirm the authorization policy.
        title: '¿Puede otra persona retirar mi paquete?',
        description:
          'Sí. Avisanos por WhatsApp antes del retiro con el nombre de la persona autorizada; deberá presentar su cédula de identidad.',
      },
      {
        // TODO: storage period and fees.
        title: '¿Cuánto tiempo guardan mi paquete?',
        description:
          'Te recomendamos retirarlo apenas esté disponible para entrega. Los paquetes que no se retiran a tiempo pueden generar cargos de almacenaje, según nuestros términos.',
      },
    ],
  },
];

/** The questions that also appear on the home page, in the order of Carinova's prototype. */
export const featuredOf = (groups: Array<FaqGroup>): Array<FaqItem> =>
  groups
    .flatMap((group) => group.items)
    .filter((item) => item.featured !== undefined)
    .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0));

/** FAQPage structured data (one block per page), with the answers as plain text. */
export const faqSchema = (items: Array<FaqItem>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(({ title, description }) => ({
    '@type': 'Question',
    name: title,
    acceptedAnswer: {
      '@type': 'Answer',
      text: description
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    },
  })),
});
