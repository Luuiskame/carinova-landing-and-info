/**
 * Frequently asked questions, grouped by topic. `featured` items also appear on the home page.
 * Answers may contain simple HTML (links). Prices and transit times come from carinova.ts so they
 * never disagree with the rates section.
 *
 * Draft answers marked TODO describe usual courier practice and must be confirmed by Carinova.
 */
import { BRANCHES, RATES } from '~/data/carinova';
import { formatUSD } from '~/utils/rates';
import { getPermalink } from '~/utils/permalinks';

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

const [air, sea] = RATES.services;
const cities = BRANCHES.map((branch) => branch.city).join(' y ');
const link = (href: string, text: string) => `<a class="text-link underline" href="${href}">${text}</a>`;

export const FAQ_GROUPS: Array<FaqGroup> = [
  {
    id: 'casillero',
    title: 'Casillero y compras',
    items: [
      {
        title: '¿Qué es un casillero y cómo funciona?',
        description:
          'Es una dirección en Miami a tu nombre. Compras en cualquier tienda de Estados Unidos y la usas como dirección de envío; cuando tu paquete llega, nosotros lo traemos a Nicaragua y te avisamos para que lo retires.',
        featured: true,
      },
      {
        // TODO: confirm that opening a mailbox is free.
        title: '¿Cuánto cuesta abrir mi casillero?',
        description:
          'Abrir tu casillero es gratis: solo pagas el envío de cada paquete según su peso. Escríbenos por WhatsApp y te damos tu dirección.',
        featured: true,
      },
      {
        title: '¿En qué tiendas puedo comprar?',
        description:
          'En cualquier tienda en línea que envíe dentro de Estados Unidos: Amazon, Shein, Temu, eBay, Walmart, Target y muchas más.',
      },
      {
        // TODO: confirm the address format (customer code?).
        title: '¿Qué pongo como dirección de envío?',
        description:
          'Tu nombre completo, tu código de cliente Carinova y la dirección de Miami que te damos al abrir tu casillero. Así identificamos tu paquete apenas llega.',
      },
    ],
  },
  {
    id: 'tarifas',
    title: 'Tarifas y pagos',
    items: [
      {
        title: '¿Cómo se calcula el costo de mi envío?',
        description: `Por libra, según el tipo de envío: aéreo ${formatUSD(air.pricePerLb)} y marítimo ${formatUSD(sea.pricePerLb)} por libra${
          RATES.roundUpToPound ? ', y cada libra iniciada se cobra completa' : ''
        }. Puedes calcularlo al instante en nuestra ${link(getPermalink('/#cotizar'), 'calculadora')}.`,
        featured: true,
      },
      {
        title: '¿Qué es el peso volumétrico?',
        description:
          'Cuando un paquete es grande pero liviano (por ejemplo, una almohada o una caja de zapatos vacía), se cobra según el espacio que ocupa, calculado con las medidas de la caja. Si tienes dudas, envíanos las medidas y te decimos el precio exacto.',
      },
      {
        // TODO: confirm payment moment and methods.
        title: '¿Cuándo y cómo pago?',
        description:
          'Pagas el envío al retirar tu paquete en sucursal. Escríbenos para conocer las formas de pago disponibles en tu sucursal.',
      },
    ],
  },
  {
    id: 'tiempos',
    title: 'Tiempos y seguimiento',
    items: [
      {
        title: '¿Cuánto tarda en llegar mi paquete?',
        description: `Por aéreo, ${air.transit}; por marítimo, ${sea.transit}. El tiempo se cuenta desde que tu paquete llega a nuestra bodega en Miami.`,
        featured: true,
      },
      {
        // TODO: confirm notification steps.
        title: '¿Cómo sé dónde está mi paquete?',
        description:
          'Te avisamos por WhatsApp cuando tu paquete llega a Miami, cuando sale hacia Nicaragua y cuando ya está listo para retirar. También puedes escribirnos en cualquier momento.',
      },
    ],
  },
  {
    id: 'aduana',
    title: 'Aduana y artículos prohibidos',
    items: [
      {
        title: '¿Tengo que pagar impuestos de aduana?',
        description:
          'Depende del valor y del tipo de producto, según las regulaciones de la Dirección General de Servicios Aduaneros (DGA). Si tu compra paga impuestos, te lo informamos antes de que la retires.',
        featured: true,
      },
      {
        // TODO: confirm the full list with Carinova.
        title: '¿Qué artículos no puedo enviar?',
        description:
          'No transportamos armas, municiones ni explosivos; líquidos inflamables ni químicos peligrosos; drogas o sustancias controladas; dinero en efectivo; animales vivos ni alimentos perecederos. Si no estás seguro de un producto, pregúntanos antes de comprarlo.',
        featured: true,
      },
    ],
  },
  {
    id: 'retiro',
    title: 'Retiro de paquetes',
    items: [
      {
        title: '¿Dónde retiro mi paquete?',
        description: `En nuestras sucursales de ${cities}. Te avisamos por WhatsApp cuando esté listo. ${link(getPermalink('/sucursales'), 'Ver direcciones y horarios')}.`,
      },
      {
        // TODO: confirm the authorization policy.
        title: '¿Puede otra persona retirar mi paquete?',
        description:
          'Sí. Avísanos por WhatsApp antes del retiro con el nombre de la persona autorizada; deberá presentar su cédula de identidad.',
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

export const FEATURED_FAQS = FAQ_GROUPS.flatMap((group) => group.items).filter((item) => item.featured);

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
