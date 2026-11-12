/**
 * Frequently asked questions, grouped by stage of the customer's journey (account, services, rates,
 * times, prohibited items, pickup): every question belongs to exactly one group. `featured` items
 * also appear on the home page. Answers may contain simple HTML (links). Prices, times and lists come
 * from carinova.ts so they never disagree with the rest of the site.
 *
 * This is the Spanish wording; en/faq.ts has the same questions in English, in the same order (a
 * unit test compares the two). Both are functions of `link`, which writes a link to a page of the
 * site in the language being rendered: pages get the result as `FAQ_GROUPS` through `i18n(Astro)`
 * (src/i18n). Relative imports with the .ts extension: the unit tests run this file on plain Node.
 *
 * Draft answers marked TODO describe usual courier practice and must be confirmed by Carinova.
 */
import {
  BRANCHES,
  CARINOVA_ID_EXAMPLE,
  LAST_MILE,
  RATES,
  RECEPTION_POINTS,
  RESTRICTED_ITEMS,
  STORES,
  describeHours,
  sentence,
} from './carinova.ts';
import { FORMULA_EXAMPLE } from './services.ts';
import { describeVolume, formatUSD, quoteByVolume } from '../utils/rates.ts';

export interface FaqItem {
  title: string;
  description: string;
  featured?: boolean;
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
const soonReception = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);
const devices = electronics.items
  .map((item) => `${item.brand ? item.plural : item.plural.toLowerCase()} ${formatUSD(item.price)}`)
  .join(', ');
const stores = STORES.slice(0, FAQ_STORE_COUNT)
  .map((store) => store.name)
  .join(', ');
/** "Armas, Drones" → "armas; drones": the items carry commas of their own. */
const inline = (items: Array<string>) => items.map((item) => item.charAt(0).toLowerCase() + item.slice(1)).join('; ');

export const faqGroups = (link: LinkTo): Array<FaqGroup> => [
  {
    id: 'cuenta',
    title: 'Cuenta y casillero',
    items: [
      {
        title: '¿Qué es un casillero y cómo funciona?',
        description:
          'Es tu dirección en Miami para comprar en tiendas de Estados Unidos. Cuando tu compra o tu encomienda llega, la traemos a Nicaragua y te avisamos para que la retires.',
        featured: true,
      },
      {
        title: '¿Qué es el Carinova ID?',
        description: `Es tu número de cliente (por ejemplo, ${CARINOVA_ID_EXAMPLE}). Hay uno por persona o por empresa, y es el mismo para todos nuestros servicios: aéreo, marítimo, encomiendas y compras asistidas. ${link('/mi-cuenta', 'Ver qué incluye tu cuenta')}.`,
      },
      {
        title: '¿Cómo abro mi casillero?',
        description: `${link('/registro', 'Registrate en línea')} con tus datos y confirmá tu correo con el enlace que te mandamos. Al confirmar recibís tu Carinova ID y tu dirección en Miami, en pantalla y por correo. Si preferís, escribinos por WhatsApp y te ayudamos.`,
      },
      {
        title: '¿Cómo ingreso a mi casillero?',
        description: `En ${link('/ingresar', 'Ingresar')} escribí el correo con el que te registraste: te mandamos un código de 6 dígitos y entrás con él, sin contraseña. Ahí ves tu Carinova ID y tu dirección en Miami.`,
      },
      {
        // TODO: confirm that opening a mailbox is free.
        title: '¿Cuánto cuesta abrir mi casillero?',
        description: `Abrir tu casillero es gratis: solo pagás el envío de cada paquete. ${link('/registro', 'Abrilo en línea')} y recibí tu dirección en Miami.`,
        featured: true,
      },
      {
        // TODO: confirm how company accounts are opened.
        title: '¿Puedo abrir una cuenta para mi empresa?',
        description: `Sí: hay un Carinova ID por persona o por empresa. Contanos de tu empresa en ${link('/empresas', 'el formulario para empresas')} y te contactamos, o escribinos por WhatsApp.`,
      },
      {
        title: '¿Qué dirección pongo al comprar?',
        description: `La dirección de Miami que recibís al abrir tu casillero. Escribí el nombre y el apellido exactamente como te los damos: así identificamos tu paquete apenas llega.${
          soonReception.length ? ` Próximamente también vamos a recibir en ${soonReception.join(' y ')}.` : ''
        }`,
      },
    ],
  },
  {
    id: 'servicios',
    title: 'Servicios',
    items: [
      {
        title: '¿Qué diferencia hay entre aéreo y marítimo?',
        description: `El aéreo es más rápido: llega en ${air.transit} y cuesta ${formatUSD(air.pricePerLb)} la libra. El marítimo tarda ${sea.transit} y cuesta ${formatUSD(sea.pricePerLb)} la libra o ${formatUSD(sea.pricePerCubicFoot)} el pie cúbico: conviene para lo pesado o voluminoso. Los tiempos se cuentan ${RATES.transitFrom}.`,
      },
      {
        title: '¿Qué es una encomienda?',
        description:
          'Cualquier paquete que llega a tu casillero: tus compras en línea o la caja que te manda tu familia desde Estados Unidos. Viaja por aéreo o por marítimo, como prefieras.',
      },
      {
        // TODO: confirm how customers pay for the product.
        title: '¿Qué es una compra asistida?',
        description: `Si no tenés tarjeta o la tienda no acepta la tuya, mandanos el enlace del producto por WhatsApp y lo compramos por vos. El servicio es gratis: pagás el producto y el envío. ${link('/servicios#compras-asistidas', 'Ver cómo funciona')}.`,
        featured: true,
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
        title: '¿Cómo se calcula el costo de mi envío?',
        description: `Aéreo: ${formatUSD(air.pricePerLb)} la libra. Marítimo: ${formatUSD(sea.pricePerLb)} la libra o ${formatUSD(sea.pricePerCubicFoot)} el pie cúbico, el que resulte mayor. Celulares, tablets, laptops y consolas tienen tarifa fija por unidad. ${
          RATES.roundUpToPound ? 'Cada libra iniciada se cobra completa. ' : ''
        }Calculalo al instante en nuestro ${link('/cotizador', 'cotizador')}.`,
      },
      {
        title: '¿Cómo se calcula el pie cúbico?',
        description: `Multiplicá el largo, el ancho y el alto de la caja en pulgadas y dividí el resultado entre 1,728. Por ejemplo: ${describeVolume(
          quoteByVolume(FORMULA_EXAMPLE.dims, sea.pricePerCubicFoot)
        )}. En marítimo comparamos ese precio con el precio por peso y cobramos el mayor.`,
      },
      {
        title: '¿Las tarifas incluyen impuestos?',
        description: `Sí: nuestras tarifas incluyen seguro e impuestos cuando aplique. Los electrónicos con tarifa fija (${devices}) ya incluyen el envío aéreo y los impuestos.`,
        featured: true,
      },
      {
        // TODO: confirm payment moment and methods.
        title: '¿Cuándo y cómo pago?',
        description:
          'Pagás el envío al retirar tu paquete en sucursal. Escribinos para conocer las formas de pago disponibles en tu sucursal.',
      },
    ],
  },
  {
    id: 'tiempos',
    title: 'Tiempos y seguimiento',
    items: [
      {
        title: '¿Cuánto tarda en llegar mi paquete?',
        description: `Por aéreo, ${air.transit}; por marítimo, ${sea.transit}. Los electrónicos con tarifa fija viajan por aéreo. El tiempo se cuenta ${RATES.transitFrom} en nuestra bodega.`,
        featured: true,
      },
      {
        // TODO: confirm notification steps.
        title: '¿Cómo sé dónde está mi paquete?',
        description:
          'Te avisamos por WhatsApp cuando tu paquete llega a nuestra bodega, cuando sale hacia Nicaragua y cuando ya está listo para retirar. También podés escribirnos con tu Carinova ID en cualquier momento.',
      },
    ],
  },
  {
    id: 'prohibidos',
    title: 'Artículos prohibidos',
    items: [
      {
        title: '¿Qué artículos no puedo enviar?',
        description: `No transportamos: ${inline(RESTRICTED_ITEMS.prohibited.items)}. ${link('/articulos-prohibidos', 'Ver la lista de artículos prohibidos')}. Si no estás seguro de un producto, preguntanos antes de comprarlo.`,
        featured: true,
      },
      {
        title: '¿Puedo traer perfumes o aerosoles?',
        description: `No por vía aérea: ${inline(RESTRICTED_ITEMS.noAir.items)} no pueden viajar en avión. Si necesitás traer alguno, consultanos antes de comprarlo.`,
      },
    ],
  },
  {
    id: 'retiro',
    title: 'Retiro y entrega',
    items: [
      {
        title: '¿Dónde retiro mi paquete?',
        description: `${sentence(`En nuestras sucursales de ${cities}, de ${describeHours(hours)}`)} Te avisamos por WhatsApp cuando esté listo. ${link('/sucursales', 'Ver direcciones y horarios')}.`,
      },
      {
        title: '¿Hacen entregas a domicilio?',
        description: LAST_MILE.available
          ? 'Sí: también te llevamos tu paquete hasta tu casa.'
          : `Todavía no: por ahora retirás en ${cities}. La entrega a domicilio viene próximamente.`,
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
          'Te recomendamos retirarlo apenas te avisemos. Los paquetes que no se retiran a tiempo pueden generar cargos de almacenaje, según nuestros términos.',
      },
    ],
  },
];

/** The questions that also appear on the home page. */
export const featuredOf = (groups: Array<FaqGroup>): Array<FaqItem> =>
  groups.flatMap((group) => group.items).filter((item) => item.featured);

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
