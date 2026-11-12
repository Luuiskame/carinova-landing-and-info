/**
 * English wording of ../faq.ts: the same questions, in the same groups and the same order, with the
 * same ones featured on the home page (src/data/content.test.ts compares the two). Prices, times
 * and lists come from the English data, which takes every fact from the Spanish data.
 */
import { CARINOVA_ID_EXAMPLE, LAST_MILE, sentence } from '../carinova.ts';
import { FAQ_STORE_COUNT, type FaqGroup, type LinkTo } from '../faq.ts';
import { describeVolume, formatUSD, quoteByVolume } from '../../utils/rates.ts';
import { BRANCHES, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, STORES, describeHours } from './carinova.ts';
import { FORMULA_EXAMPLE } from './services.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city).join(' and ');
const [hours] = BRANCHES[0].hours;
const soonReception = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);
const devices = electronics.items
  .map((item) => `${item.brand ? item.plural : item.plural.toLowerCase()} ${formatUSD(item.price)}`)
  .join(', ');
const stores = STORES.slice(0, FAQ_STORE_COUNT)
  .map((store) => store.name)
  .join(', ');
/** "Weapons, Drones" → "weapons; drones": the items carry commas of their own. */
const inline = (items: Array<string>) => items.map((item) => item.charAt(0).toLowerCase() + item.slice(1)).join('; ');

export const faqGroups = (link: LinkTo): Array<FaqGroup> => [
  {
    id: 'cuenta',
    title: 'Account and mailbox',
    items: [
      {
        title: 'What is a mailbox and how does it work?',
        description:
          'It is your address in Miami for buying at stores in the United States. When your purchase or your package arrives, we bring it to Nicaragua and let you know so you can pick it up.',
        featured: true,
      },
      {
        title: 'What is the Carinova ID?',
        description: `It is your customer number (for example, ${CARINOVA_ID_EXAMPLE}). There is one per person or per company, and it is the same for all our services: air, sea, packages and assisted purchases. ${link('/mi-cuenta', 'See what your account includes')}.`,
      },
      {
        title: 'How do I open my mailbox?',
        description: `${link('/registro', 'Sign up online')} with your details and confirm your e-mail with the link we send you. When you confirm, you get your Carinova ID and your address in Miami, on screen and by e-mail. If you prefer, write to us on WhatsApp and we will help you.`,
      },
      {
        title: 'How do I sign in to my mailbox?',
        description: `On ${link('/ingresar', 'Sign in')}, enter the e-mail you signed up with: we send you a 6-digit code and you sign in with it, no password needed. There you see your Carinova ID and your address in Miami.`,
      },
      {
        title: 'How much does it cost to open my mailbox?',
        description: `Opening your mailbox is free: you only pay for the shipping of each package. ${link('/registro', 'Open it online')} and get your address in Miami.`,
        featured: true,
      },
      {
        title: 'Can I open an account for my company?',
        description: `Yes: there is one Carinova ID per person or per company. Tell us about your company in ${link('/empresas', 'the form for companies')} and we will contact you, or write to us on WhatsApp.`,
      },
      {
        title: 'What address do I use when I buy?',
        description: `The Miami address you get when you open your mailbox. Write the first name and the last name exactly as we give them to you: that is how we identify your package as soon as it arrives.${
          soonReception.length ? ` Soon we will also receive packages in ${soonReception.join(' and ')}.` : ''
        }`,
      },
    ],
  },
  {
    id: 'servicios',
    title: 'Services',
    items: [
      {
        title: 'What is the difference between air and sea?',
        description: `Air is faster: it arrives in ${air.transit} and costs ${formatUSD(air.pricePerLb)} per pound. Sea takes ${sea.transit} and costs ${formatUSD(sea.pricePerLb)} per pound or ${formatUSD(sea.pricePerCubicFoot)} per cubic foot: it suits heavy or bulky things. Times count ${RATES.transitFrom}.`,
      },
      {
        title: 'What counts as a package?',
        description:
          'Anything that arrives at your mailbox: your online purchases or the box your family sends you from the United States. It travels by air or by sea, as you prefer.',
      },
      {
        title: 'What is an assisted purchase?',
        description: `If you have no card or the store does not accept yours, send us the link to the product on WhatsApp and we buy it for you. The service is free: you pay for the product and the shipping. ${link('/servicios#compras-asistidas', 'See how it works')}.`,
        featured: true,
      },
      {
        title: 'Which stores can I buy from?',
        description: `Any online store that ships within the United States: ${stores} and many more.`,
      },
    ],
  },
  {
    id: 'tarifas',
    title: 'Rates and payments',
    items: [
      {
        title: 'How is the cost of my shipment calculated?',
        description: `Air: ${formatUSD(air.pricePerLb)} per pound. Sea: ${formatUSD(sea.pricePerLb)} per pound or ${formatUSD(sea.pricePerCubicFoot)} per cubic foot, whichever is higher. Cell phones, tablets, laptops and consoles have a flat rate per unit. ${
          RATES.roundUpToPound ? 'Each started pound is charged as a full pound. ' : ''
        }Work it out in seconds with our ${link('/cotizador', 'quote calculator')}.`,
      },
      {
        title: 'How is a cubic foot calculated?',
        description: `Multiply the length, the width and the height of the box in inches and divide the result by 1,728. For example: ${describeVolume(
          quoteByVolume(FORMULA_EXAMPLE.dims, sea.pricePerCubicFoot),
          'en'
        )}. By sea we compare that price with the price by weight and charge the higher one.`,
      },
      {
        title: 'Do the rates include taxes?',
        description: `Yes: our rates include insurance and taxes where applicable. Electronics with a flat rate (${devices}) already include air shipping and taxes.`,
        featured: true,
      },
      {
        title: 'When and how do I pay?',
        description:
          'You pay for the shipping when you pick up your package at the branch. Write to us to find out which payment methods your branch accepts.',
      },
    ],
  },
  {
    id: 'tiempos',
    title: 'Times and tracking',
    items: [
      {
        title: 'How long does my package take to arrive?',
        description: `By air, ${air.transit}; by sea, ${sea.transit}. Electronics with a flat rate travel by air. The time counts ${RATES.transitFrom} at our warehouse.`,
        featured: true,
      },
      {
        title: 'How do I know where my package is?',
        description:
          'We let you know on WhatsApp when your package arrives at our warehouse, when it leaves for Nicaragua and when it is ready for pickup. You can also write to us with your Carinova ID at any time.',
      },
    ],
  },
  {
    id: 'prohibidos',
    title: 'Prohibited items',
    items: [
      {
        title: 'Which items can I not ship?',
        description: `We do not carry: ${inline(RESTRICTED_ITEMS.prohibited.items)}. ${link('/articulos-prohibidos', 'See the list of prohibited items')}. If you are not sure about a product, ask us before you buy it.`,
        featured: true,
      },
      {
        title: 'Can I bring perfumes or aerosols?',
        description: `Not by air: ${inline(RESTRICTED_ITEMS.noAir.items)} cannot travel by plane. If you need to bring one, ask us before you buy it.`,
      },
    ],
  },
  {
    id: 'retiro',
    title: 'Pickup and delivery',
    items: [
      {
        title: 'Where do I pick up my package?',
        description: `${sentence(`At our branches in ${cities}, ${describeHours(hours)}`)} We let you know on WhatsApp when it is ready. ${link('/sucursales', 'See addresses and opening hours')}.`,
      },
      {
        title: 'Do you deliver to my home?',
        description: LAST_MILE.available
          ? 'Yes: we also take your package to your home.'
          : `Not yet: for now you pick up in ${cities}. Home delivery is coming soon.`,
      },
      {
        title: 'Can someone else pick up my package?',
        description:
          'Yes. Let us know on WhatsApp before the pickup with the name of the person you authorise; they will need to show their identity card.',
      },
      {
        title: 'How long do you keep my package?',
        description:
          'We recommend picking it up as soon as we let you know. Packages that are not picked up in time may incur storage charges, according to our terms.',
      },
    ],
  },
];
