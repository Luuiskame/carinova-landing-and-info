/**
 * English wording of ../carinova.ts: the same exports with the same shapes, for the English version
 * of the site (src/i18n). Facts are not repeated here: every price, number, address and id is taken
 * from the Spanish file and only the words around it are written again, so the two languages
 * cannot disagree on a fact. src/data/content.test.ts checks that nothing is left untranslated.
 *
 * Like ../carinova.ts, the Worker bundles this file: relative imports with the .ts extension only.
 */
import * as es from '../carinova.ts';
import type { Branch, DayOfWeek, OpeningHours, RestrictedGroupId, Store, StoreCategoryId } from '../carinova.ts';

/** "a, b and c" */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

export const TAGLINE = 'Shipments that bring us together';
export const HEADLINE: [string, string] = ['From the United States', 'to you.'];
export const VALUE_PROPOSITION =
  'We bring your personal purchases, family packages and business cargo from the United States to Nicaragua.';

export const CTA: typeof es.CTA = {
  signup: { ...es.CTA.signup, text: 'Create account' },
  quote: { ...es.CTA.quote, text: 'Quote your shipment' },
  help: { text: 'Help on WhatsApp' },
  account: { ...es.CTA.account, text: 'Go to my account', short: 'My account' },
  signin: { ...es.CTA.signin, text: 'Sign in', short: 'Sign in' },
  track: { ...es.CTA.track, text: 'Track your package' },
};

/** "08:00" → "8:00 a.m.", "17:00" → "5:00 p.m." */
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'a.m.' : 'p.m.'}`;
};

/** "8:00 a.m. – 5:00 p.m." */
export const formatHours = ({ opens, closes }: OpeningHours): string => `${formatTime(opens)} – ${formatTime(closes)}`;

/** "Monday to Saturday, 8:00 a.m. to 5:00 p.m.": opening hours inside a sentence. */
export const describeHours = (hours: OpeningHours): string =>
  `${hours.days}, ${formatTime(hours.opens)} to ${formatTime(hours.closes)}`;

const WEEK: Array<DayOfWeek> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** The days a branch opens, from the structured list: "Monday to Saturday", or the days one by one. */
const daysOf = (days: Array<DayOfWeek>): string => {
  const order = days.map((day) => WEEK.indexOf(day)).sort((a, b) => a - b);
  const inARow = order.every((day, index) => index === 0 || day === order[index - 1] + 1);
  return order.length > 2 && inARow
    ? `${WEEK[order[0]]} to ${WEEK[order[order.length - 1]]}`
    : listOf(order.map((day) => WEEK[day]));
};

export const BRANCHES: Array<Branch> = es.BRANCHES.map((branch) => ({
  ...branch,
  // A real address is the same in both languages; only the placeholder is words.
  address: branch.address === es.ADDRESS_PENDING ? 'Address to be confirmed' : branch.address,
  hours: branch.hours.map((row) => ({ ...row, days: daysOf(row.dayOfWeek) })),
}));

const CITY_NAMES: Record<string, string> = { 'los-angeles': 'Los Angeles' };

export const RECEPTION_POINTS: typeof es.RECEPTION_POINTS = es.RECEPTION_POINTS.map((point) => ({
  ...point,
  city: CITY_NAMES[point.id] ?? point.city,
}));

/** "3 to 4 days" */
const transit = ([min, max]: [number, number]): string => `${min} to ${max} days`;

const DEVICE_NAMES: Record<string, { name: string; plural: string }> = {
  celular: { name: 'Cell phone', plural: 'Cell phones' },
  tablet: { name: 'Tablet', plural: 'Tablets' },
  laptop: { name: 'Laptop', plural: 'Laptops' },
  xbox: { name: 'Xbox', plural: 'Xbox' },
  playstation: { name: 'PlayStation', plural: 'PlayStation' },
};

export const RATES: typeof es.RATES = {
  ...es.RATES,
  transitFrom: 'from the physical reception of your package',
  air: { ...es.RATES.air, name: 'Air', badge: 'Fastest', transit: transit(es.RATES.air.transitDays) },
  sea: { ...es.RATES.sea, name: 'Sea', badge: 'Most economical', transit: transit(es.RATES.sea.transitDays) },
  electronics: {
    ...es.RATES.electronics,
    name: 'Electronics',
    transit: transit(es.RATES.electronics.transitDays),
    items: es.RATES.electronics.items.map((item) => ({ ...item, ...DEVICE_NAMES[item.id] })),
  },
  notes: [
    'Delivery times count from the physical reception of the package and may vary with transit, customs and destination.',
    'Weight, dimensions, mode of transport, coverage and the conditions of the service are verified.',
    'Rates include insurance and taxes where they apply to the shipment. Coverage, limits, exclusions and additional charges are subject to the conditions of the service.',
    'The rates for electronics are for air shipments, per unit.',
  ],
};

export const MIAMI_ADDRESS: typeof es.MIAMI_ADDRESS = {
  ...es.MIAMI_ADDRESS,
  notes: [
    'Write the first name and the last name exactly like this: it is how we identify your packages.',
    'For sea shipments, ask us on WhatsApp before you buy.',
  ],
};

/** The labels already carry both languages, as on Carinova's graphic. */
export const miamiAddressRows = es.miamiAddressRows;

/**
 * The names of the items, in the order of the Spanish lists, with the words an English speaker may
 * type for each one. The Spanish words still match too: the site's visitors mix both languages.
 */
const RESTRICTED_TEXT: Record<
  RestrictedGroupId,
  { title: string; summary: string; items: Array<{ name: string; match: Array<string> }> }
> = {
  notYet: {
    title: 'Not authorised to bring yet',
    summary: 'We are not authorised to bring them yet.',
    items: [
      { name: 'Cars', match: ['car', 'cars', 'vehicle', 'vehicles', 'truck', 'trucks', 'pickup truck'] },
      { name: 'Motorcycles', match: ['motorcycle', 'motorcycles', 'motorbike', 'motorbikes', 'scooter'] },
      {
        name: 'Heavy machinery',
        match: ['heavy machinery', 'machinery', 'excavator', 'backhoe', 'tractor', 'forklift'],
      },
    ],
  },
  prohibited: {
    title: 'Prohibited for reception and transport',
    summary: 'We neither receive nor carry them.',
    items: [
      {
        name: 'Weapons, ammunition and their accessories',
        match: [
          'weapon',
          'weapons',
          'gun',
          'guns',
          'pistol',
          'rifle',
          'firearm',
          'ammunition',
          'ammo',
          'bullet',
          'bullets',
        ],
      },
      {
        name: 'Tobacco, cigarettes and tobacco products',
        match: ['tobacco', 'cigarette', 'cigarettes', 'cigar', 'cigars'],
      },
      {
        name: 'Electronic cigarettes',
        match: ['electronic cigarette', 'electronic cigarettes', 'e cigarette', 'e cigarettes', 'vape', 'vapes'],
      },
      { name: 'Aircraft accessories', match: ['aircraft', 'airplane', 'airplanes', 'plane parts', 'aircraft parts'] },
      {
        name: 'Radio transmitters',
        match: ['radio transmitter', 'radio transmitters', 'transmitter', 'walkie talkie'],
      },
      { name: 'Drones', match: ['drone', 'drones'] },
    ],
  },
  seaOnly: {
    title: 'Not accepted by air, but accepted by sea',
    summary: 'They cannot travel by plane: we bring them by sea.',
    items: [
      { name: 'Flammable products', match: ['flammable', 'fuel', 'gasoline', 'paint', 'solvent', 'alcohol'] },
      {
        name: 'Loose lithium batteries',
        match: ['battery', 'batteries', 'lithium battery', 'lithium batteries', 'lithium', 'power bank'],
      },
      { name: 'Body spray', match: ['body spray', 'body mist', 'cologne'] },
      { name: 'Perfumes', match: ['perfume', 'perfumes', 'fragrance', 'fragrances'] },
      { name: 'Aerosols', match: ['aerosol', 'aerosols', 'spray', 'spray deodorant', 'hairspray'] },
    ],
  },
};

export const RESTRICTED_ITEMS: typeof es.RESTRICTED_ITEMS = Object.fromEntries(
  es.RESTRICTED_ORDER.map((id) => {
    const text = RESTRICTED_TEXT[id];
    return [
      id,
      {
        title: text.title,
        summary: text.summary,
        items: es.RESTRICTED_ITEMS[id].items.map((item, index) => ({
          name: text.items[index].name,
          match: [...text.items[index].match, ...item.match],
        })),
      },
    ];
  })
) as typeof es.RESTRICTED_ITEMS;

export const RESTRICTED_ORDER = es.RESTRICTED_ORDER;

export const RESTRICTED_EXAMPLES = ['Perfume', 'Drone', 'Lithium battery', 'Motorcycle', 'Electronic cigarette'];

const CATEGORY_NAMES: Record<StoreCategoryId, string> = {
  moda: 'Fashion',
  tecnologia: 'Technology',
  hogar: 'Home',
  marketplaces: 'Marketplaces',
  belleza: 'Beauty',
};

export const STORE_CATEGORIES: typeof es.STORE_CATEGORIES = es.STORE_CATEGORIES.map((category) => ({
  ...category,
  name: CATEGORY_NAMES[category.id],
}));

const STORE_TEXT: Record<string, Pick<Store, 'tagline' | 'about'>> = {
  amazon: {
    tagline: 'A universe of categories in one place.',
    about: 'Explore home goods, books, accessories, technology and many other products.',
  },
  shein: {
    tagline: 'Fashion and accessories for every style.',
    about: 'Clothing, bags and accessories. Check sizes, materials and availability.',
  },
  temu: {
    tagline: 'Products to discover and compare.',
    about: 'Home goods, accessories and everyday purchases. Check each description.',
  },
  walmart: {
    tagline: 'Shopping for the home and the family.',
    about: 'Home goods, organisation, accessories and items for personal use.',
  },
  'best-buy': {
    tagline: 'Technology for work and play.',
    about: 'Laptops, cell phones, tablets and consoles. Confirm the rate per unit and the requirements for batteries.',
  },
  nike: {
    tagline: 'Clothes and shoes to move your way.',
    about: 'Footwear, sportswear and accessories in several categories.',
  },
  apple: {
    tagline: 'Devices and accessories.',
    about: 'Cell phones, tablets, laptops and accessories. Some products have a rate per unit.',
  },
  target: {
    tagline: 'Ideas for your home and your day to day.',
    about: 'Decoration, home goods, gifts and other categories.',
  },
  ebay: {
    tagline: 'New and second-hand products.',
    about: 'Purchases from different sellers. Check the condition, the details and the terms.',
  },
  sephora: {
    tagline: 'Beauty and personal care.',
    about: 'Make-up and personal care. Perfumes and aerosols only travel by sea.',
  },
  'home-depot': {
    tagline: 'Ideas for projects and improvements.',
    about: 'Tools and home improvement. Check the size and the restrictions.',
  },
  adidas: {
    tagline: 'Sport and lifestyle.',
    about: 'Footwear, sportswear and accessories.',
  },
};

export const STORES: Array<Store> = es.STORES.map((store) => ({ ...store, ...STORE_TEXT[store.id] }));

const hello = (text: string) => `Hi Carinova 👋 ${text}`;

/** One message per place, as in Spanish: the keys are the same and each text is still unique. */
export const WA_MESSAGES: typeof es.WA_MESSAGES = {
  floating: {
    '/': hello('I would like information about bringing my purchases from the United States.'),
    '/como-comprar': hello('I have a question about how the service works.'),
    '/servicios': hello('I would like to know which service suits me.'),
    '/cotizador': hello('I need help getting a quote for my shipment.'),
    '/sucursales': hello('I have a question about your branches.'),
    '/mi-cuenta': hello('I am in my account and have a question.'),
    '/registro': hello('I am creating my account and have a question.'),
    '/registro/confirmar': hello('I am confirming my e-mail and have a question.'),
    '/ingresar': hello('I want to sign in to my account and have a question.'),
    '/empresas': hello('I have a question about your service for companies.'),
    '/preguntas-frecuentes': hello('I have a question I could not find on your site.'),
    '/articulos-prohibidos': hello('I have a question about the items you cannot bring.'),
    '/nosotros': hello('I would like to know more about Carinova.'),
    '/terminos': hello('I have a question about your terms and conditions.'),
    '/privacidad': hello('I have a question about my personal data.'),
  },
  floatingDefault: hello('I am coming from your website and have a question.'),
  footer: hello('I am coming from your website and would like some information.'),

  homeQuote: (shipment: string, total: string) =>
    hello(`I got a quote on your home page for ${shipment}: ${total}. Can you help me confirm it?`),
  homeQuoteEmpty: hello('I am on the calculator of your home page and do not know what to enter.'),
  shopper: (link: string) =>
    hello(
      `I would like to request an assisted purchase. Product: ${link} Can you confirm availability, whether it can enter, and the total cost?`
    ),
  storeAssist: (store: string) =>
    hello(`I would like an assisted purchase at ${store}. This is the link to the product: `),
  itemCheck: (item: string) => hello(`Before I buy, I would like to know if you can bring: ${item}`),
  itemCheckEmpty: hello('I would like to ask whether an item can enter Nicaragua: '),
  homeDelivery: hello('I would like to ask about home delivery. My address is: '),
  homeFaq: hello('I read your frequently asked questions and have another one.'),
  careers: hello('I would like to join the Carinova team. I am interested in this area: '),

  howToClosing: hello('I saw how it works and would like help with my first shipment.'),
  example: (category: string) =>
    hello(`I saw your example for ${category.toLowerCase()} and want to bring something similar.`),

  services: {
    aereo: hello('I want to ship by air. Can you give me more information?'),
    maritimo: hello('I want to ship by sea. Can you give me more information?'),
    encomiendas: hello('Someone is sending me a package from the United States. What do I do?'),
    'compras-asistidas': hello('I would like you to buy a product for me. This is the link: '),
    'retiro-en-sucursal': hello('I would like to know how to pick up my package at a branch.'),
    'entrega-a-domicilio': hello('I would like to arrange a home delivery. What coverage and charge does it have?'),
  },
  servicesClosing: hello('I would like help choosing the service for my shipment.'),

  quote: (shipment: string, total: string) =>
    hello(`I got a quote on your calculator for ${shipment}: ${total}. Can you help me confirm it?`),
  quoteEmpty: hello('I am on your quote calculator and do not know what to enter.'),
  quoteClosing: hello('I want a quote for a special shipment (very large, fragile or with several items).'),

  branch: (city: string) => hello(`I have a question for the ${city} branch.`),
  branchesClosing: hello('I would like to know which branch suits me for pickup.'),

  accountClosing: hello('I have a question before I create my account.'),

  signupAssist: hello('I would rather create my account through WhatsApp.'),
  signupHelp: hello('I tried to sign up on your site and need help.'),
  confirmHelp: hello('I could not confirm my e-mail to create my account.'),
  accountExisting: hello('I already have my Carinova ID and want to ask about my packages.'),
  customer: (code: string) => hello(`My Carinova ID is ${code} and I have a question.`),
  welcomeEmail: (code: string) => hello(`My Carinova ID is ${code}. I got the welcome e-mail and have a question.`),

  signinHelp: hello('I cannot sign in to my account. Can you help me?'),
  signinError: hello('I tried to sign in to my account on your site and got an error.'),
  accountPackages: (code: string) => hello(`My Carinova ID is ${code}. I want to ask about my packages.`),
  accountPackage: (code: string, reference: string) =>
    hello(`My Carinova ID is ${code}. I want to ask about my package ${reference}.`),
  accountInvoice: (code: string, number: string) =>
    hello(`My Carinova ID is ${code}. I want to pay or ask about invoice ${number}.`),
  accountUpdate: (code: string) => hello(`My Carinova ID is ${code} and I want to update my details.`),
  accountError: hello('I tried to open my account on your site and got an error.'),

  accountCompany: hello('I want to open a Carinova ID for my company.'),
  businessHelp: hello('I tried to send the form for companies and need help.'),
  businessClosing: hello('I want to talk to an advisor about my company’s shipments.'),

  faqClosing: hello('I could not find my answer in your frequently asked questions.'),
  restricted: hello('Before I buy, I want to know if you can bring this product: '),
  aboutClosing: hello('I found Carinova on your site and want to start shipping with you.'),
  notFound: hello('I landed on a page of your site that does not exist.'),
};
