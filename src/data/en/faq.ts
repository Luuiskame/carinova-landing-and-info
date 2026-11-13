/**
 * English wording of ../faq.ts: the same questions, in the same groups and the same order, with the
 * same ones on the home page (src/data/content.test.ts compares the two). Prices, times and lists
 * come from the English data, which takes every fact from the Spanish data.
 */
import { LOGIN_CODE_DIGITS, PACKAGE_STAGES } from '../account.ts';
import { CARINOVA_ID_EXAMPLE, sentence, type RestrictedItem } from '../carinova.ts';
import { FAQ_STORE_COUNT, type FaqGroup, type LinkTo } from '../faq.ts';
import { CUBIC_CM_PER_CUBIC_FOOT, describeVolume, formatNumber, formatUSD, quoteByVolume } from '../../utils/rates.ts';
import { BRANCHES, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, STORES, describeHours } from './carinova.ts';
import { FORMULA_EXAMPLE } from './services.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city).join(' and ');
const [hours] = BRANCHES[0].hours;
const receiving = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
const soonReception = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);
const devices = electronics.items
  .map((item) => `${item.brand ? item.plural : item.plural.toLowerCase()} ${formatUSD(item.price)}`)
  .join(', ');
const stores = STORES.slice(0, FAQ_STORE_COUNT)
  .map((store) => store.name)
  .join(', ');
/** "Weapons, Drones" → "weapons; drones": the items carry commas of their own. */
const inline = (items: Array<RestrictedItem>) =>
  items.map((item) => item.name.charAt(0).toLowerCase() + item.name.slice(1)).join('; ');
const stages = PACKAGE_STAGES.map((stage) => stage.en.name.toLowerCase()).join(', ');

export const faqGroups = (link: LinkTo): Array<FaqGroup> => [
  {
    id: 'cuenta',
    title: 'Account and Carinova ID',
    items: [
      {
        title: 'How do I get my Carinova ID?',
        description: `Complete ${link('/registro', 'the sign-up')} with your e-mail and your phone number, and confirm your e-mail with the link we send you. When you confirm, the platform generates your unique Carinova ID automatically (for example, ${CARINOVA_ID_EXAMPLE}).`,
        featured: 1,
      },
      {
        title: 'What is the Carinova ID?',
        description:
          'It is the identifier of your account. There is one per person or per company, and it is the same for all our services: air, sea, packages and assisted purchases.',
      },
      {
        title: 'How do I sign in to my account?',
        description: `Tap ${link('/ingresar', 'Sign in')} and enter the e-mail you signed up with: we send you a ${LOGIN_CODE_DIGITS}-digit code and you sign in with it, no password needed. In ${link('/mi-cuenta', 'your account')} you find your Carinova ID, your address in the United States, your packages and your payments.`,
      },
      {
        title: 'How much does it cost to create my account?',
        description: `Creating your account is free: you only pay for the shipping of each package. ${link('/registro', 'Create it online')} and get your Carinova ID.`,
      },
      {
        title: 'Can I open an account for my company?',
        description: `Yes: there is one Carinova ID per person or per company. Tell us about your company in ${link('/empresas', 'the form for companies')} and we will contact you, or write to us on WhatsApp.`,
      },
      {
        title: 'Where do I send my purchases from the US?',
        description: `Your account shows the address and the reception instructions of our warehouse in ${receiving.join(' and ')}. Use exactly those details so that we can identify your shipment.${
          soonReception.length ? ` Soon you will also be able to receive in ${soonReception.join(' and ')}.` : ''
        }`,
        featured: 2,
      },
    ],
  },
  {
    id: 'servicios',
    title: 'Services',
    items: [
      {
        title: 'What is the difference between air and sea?',
        description: `Air is faster: ${air.transit}, at ${formatUSD(air.pricePerLb)} per pound. Sea is more economical: ${sea.transit}, at ${formatUSD(sea.pricePerLb)} per pound or ${formatUSD(sea.pricePerCubicFoot)} per cubic foot; it suits large loads and planned purchases. Times count ${RATES.transitFrom}.`,
      },
      {
        title: 'What counts as a package?',
        description:
          'Anything that reaches our warehouse in your name: your online purchases or the box your family sends you from the United States. It travels by air or by sea, as you prefer.',
      },
      {
        title: 'Can you buy a product for me?',
        description: `Yes. Choose the store and share the link with us. An assisted purchase requires confirmation of availability, admissibility, and the costs of the product, the service and the transport. ${link('/#compras', 'Prepare your request')}.`,
        featured: 8,
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
        title: 'How is the rate calculated?',
        description: `Air: ${formatUSD(air.pricePerLb)} per pound, with rates per unit for specific electronics. Sea: ${formatUSD(sea.pricePerLb)} per pound or ${formatUSD(sea.pricePerCubicFoot)} per cubic foot. The basis of the charge is determined by the goods and the conditions of the service. Work it out with our ${link('/cotizador', 'quote calculator')}.`,
        featured: 4,
      },
      {
        title: 'How is a cubic foot calculated?',
        description: `Multiply the length, the width and the height of the box in inches and divide the result by 1,728; if you measure in centimeters, divide it by ${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)}. For example: ${describeVolume(
          quoteByVolume(FORMULA_EXAMPLE.dims, sea.pricePerCubicFoot, { unit: FORMULA_EXAMPLE.unit }),
          'en'
        )}.`,
      },
      {
        title: 'Which electronics have a rate per unit?',
        description: `On air shipments: ${devices}. The rate per unit is not added to the rate per pound.`,
      },
      {
        title: 'Does it include insurance and taxes?',
        description:
          'Rates include insurance and taxes where they apply to the shipment. Coverage, limits, exclusions and additional charges are subject to the conditions of the service. Confirm the terms that apply before you hire the service.',
        featured: 5,
      },
      {
        title: 'Is the estimated price what I will pay?',
        description:
          'Not necessarily. The calculator works out a reference rate, without the purchase of the product or the home delivery service. The final amount is confirmed after checking the dimensions, the weight, the contents, the mode of transport and the specific conditions.',
        featured: 9,
      },
      {
        title: 'When and how do I pay?',
        description: `You pay for the shipping when you pick up your package or when its delivery is arranged. Write to us to find out which payment methods are available. In ${link('/mi-cuenta', 'your account')} you see your invoices and the payments we confirmed.`,
      },
    ],
  },
  {
    id: 'tiempos',
    title: 'Times and tracking',
    items: [
      {
        title: 'When do delivery times start counting?',
        description: `From the physical reception of the package, not from the date of purchase. Air: ${air.transit}. Sea: ${sea.transit}. They are estimates subject to transit, customs and destination.`,
        featured: 3,
      },
      {
        title: 'How do I track several packages with one Carinova ID?',
        description: `The Carinova ID belongs to your account. When you ${link('/ingresar', 'sign in')} you see each package with its reference and its tracking statuses. For security, the account number alone does not authorise anyone to look up private data.`,
        featured: 10,
      },
      {
        title: 'Which statuses can my package have?',
        description: `In order: ${stages}. Every change is kept in the history of the package, in ${link('/mi-cuenta', 'your account')}.`,
      },
    ],
  },
  {
    id: 'prohibidos',
    title: 'Restricted items',
    items: [
      {
        title: 'Which items can I bring?',
        description: `It depends on the type of goods, their components and the rules of transport. We neither receive nor carry: ${inline(RESTRICTED_ITEMS.prohibited.items)}. We are not authorised to bring yet: ${inline(RESTRICTED_ITEMS.notYet.items)}. ${link('/articulos-prohibidos', 'Check the full lists')} and, if your item is not there, ask us before you buy it.`,
        featured: 6,
      },
      {
        title: 'Can I bring perfumes or aerosols?',
        description: `Yes, by sea: ${inline(RESTRICTED_ITEMS.seaOnly.items)} are not accepted by air.`,
      },
      {
        title: 'Can I bring a car or a motorcycle?',
        description: `Not yet: we are still not authorised to bring ${inline(RESTRICTED_ITEMS.notYet.items)}.`,
      },
    ],
  },
  {
    id: 'retiro',
    title: 'Pickup and delivery',
    items: [
      {
        title: 'Where do I pick up my package?',
        description: `${sentence(`At our branches in ${cities}, ${describeHours(hours)}`)} ${link('/sucursales', 'See addresses and opening hours')}.`,
      },
      {
        title: 'Do you deliver to my home?',
        description:
          'We deliver anywhere in the country, subject to coordination and coverage. Home delivery has an additional charge that depends on the destination and the operating conditions.',
        featured: 7,
      },
      {
        title: 'Can someone else pick up my package?',
        description:
          'Yes. Let us know on WhatsApp before the pickup with the name of the person you authorise; they will need to show their identity card.',
      },
      {
        title: 'How long do you keep my package?',
        description:
          'We recommend picking it up as soon as it is available for delivery. Packages that are not picked up in time may incur storage charges, according to our terms.',
      },
    ],
  },
];
