/**
 * English wording of ../carinova.ts: the same exports with the same shapes, for the English version
 * of the site (src/i18n). Facts are not repeated here: every price, number, address and id is taken
 * from the Spanish file and only the words around it are written again, so the two languages
 * cannot disagree on a fact. src/data/content.test.ts checks that nothing is left untranslated.
 *
 * Like ../carinova.ts, the Worker bundles this file: relative imports with the .ts extension only.
 */
import * as es from '../carinova.ts';
import type { Branch, DayOfWeek, OpeningHours, Store } from '../carinova.ts';

/** "a, b and c" */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

export const VALUE_PROPOSITION = 'We bring your purchases and packages from the United States to Nicaragua';
export const VALUE_PROPOSITION_HIGHLIGHT = 'purchases and packages';

/** "Casillero" is "mailbox" throughout: the customer's address in Miami and the account around it. */
export const CTA: typeof es.CTA = {
  signup: { ...es.CTA.signup, text: 'Open my mailbox' },
  quote: { ...es.CTA.quote, text: 'Quote my shipment' },
  help: { text: 'Help on WhatsApp' },
  mailbox: { ...es.CTA.mailbox, text: 'Go to my mailbox', short: 'My mailbox' },
  signin: { ...es.CTA.signin, text: 'Sign in' },
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

/** "2 to 4 days" */
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
  transitFrom: 'from the moment we receive your package',
  air: { ...es.RATES.air, name: 'Air', transit: transit(es.RATES.air.transitDays) },
  sea: { ...es.RATES.sea, name: 'Sea', transit: transit(es.RATES.sea.transitDays) },
  electronics: {
    ...es.RATES.electronics,
    name: 'Electronics',
    transit: transit(es.RATES.electronics.transitDays),
    items: es.RATES.electronics.items.map((item) => ({ ...item, ...DEVICE_NAMES[item.id] })),
  },
  notes: [
    'Prices in US dollars (US$).',
    'Rates include insurance and taxes where applicable.',
    'The delivery estimate counts from the moment we receive your package. The final amount is confirmed when we receive it.',
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

export const RESTRICTED_ITEMS: typeof es.RESTRICTED_ITEMS = {
  prohibited: {
    title: 'Prohibited',
    summary: 'We do not carry them.',
    items: [
      'Weapons, ammunition and accessories',
      'Cigarettes, cigars and tobacco products',
      'Electronic cigarettes',
      'Aircraft accessories',
      'Radio transmitters',
      'Drones',
    ],
  },
  noAir: {
    title: 'Not accepted by air',
    summary: 'They cannot travel by plane. If you need to bring one, ask us before you buy it.',
    items: ['Flammable products', 'Loose lithium batteries', 'Body spray', 'Perfumes', 'Aerosols'],
  },
};

const STORE_TEXT: Record<string, Pick<Store, 'about' | 'categories'>> = {
  amazon: {
    about: 'Online store with millions of products of every kind, from Amazon and from other sellers.',
    categories: ['Electronics', 'Home', 'Clothing', 'Books', 'Toys'],
  },
  shein: {
    about: 'Fashion clothing, shoes and accessories at low prices.',
    categories: ['Clothing', 'Shoes', 'Accessories', 'Home'],
  },
  temu: {
    about: 'Online marketplace with low prices on home goods, fashion and accessories.',
    categories: ['Home', 'Fashion', 'Tools', 'Accessories'],
  },
  ebay: {
    about: 'Online marketplace for new and used items, sold at a fixed price or by auction.',
    categories: ['Electronics', 'Parts', 'Collectibles', 'Fashion'],
  },
  walmart: {
    about: 'Department store with everything for the home and the family.',
    categories: ['Home', 'Electronics', 'Toys', 'Clothing'],
  },
  target: {
    about: 'Department store: home, clothing, beauty and items for children.',
    categories: ['Home', 'Clothing', 'Beauty', 'Kids'],
  },
  'best-buy': {
    about: 'Store specialised in electronics and technology.',
    categories: ['Computers', 'Cell phones', 'TVs', 'Video games'],
  },
  nike: {
    about: 'The brand’s sports shoes, clothing and accessories.',
    categories: ['Sneakers', 'Sportswear', 'Accessories'],
  },
  apple: {
    about: 'Apple’s official store.',
    categories: ['iPhone', 'iPad', 'Mac', 'Apple Watch', 'AirPods'],
  },
  macys: {
    about: 'Department store: clothing, shoes, jewellery and home goods.',
    categories: ['Clothing', 'Shoes', 'Jewellery', 'Home'],
  },
  costco: {
    about: 'Wholesale club: home, electronics, furniture and appliances.',
    categories: ['Home', 'Electronics', 'Furniture', 'Appliances'],
  },
  aliexpress: {
    about: 'International online marketplace, with sellers from many countries.',
    categories: ['Electronics', 'Accessories', 'Home', 'Tools'],
  },
};

export const STORES: Array<Store> = es.STORES.map((store) => ({ ...store, ...STORE_TEXT[store.id] }));

const hello = (text: string) => `Hi Carinova 👋 ${text}`;

/** One message per place, as in Spanish: the keys are the same and each text is still unique. */
export const WA_MESSAGES: typeof es.WA_MESSAGES = {
  floating: {
    '/': hello('I would like information about bringing my purchases from the United States.'),
    '/como-comprar': hello('I have a question about how to buy in the United States.'),
    '/servicios': hello('I would like to know which service suits me.'),
    '/cotizador': hello('I need help getting a quote for my shipment.'),
    '/sucursales': hello('I have a question about your branches.'),
    '/mi-cuenta': hello('I have a question about my account.'),
    '/registro': hello('I am opening my mailbox and have a question.'),
    '/registro/confirmar': hello('I am confirming my e-mail and have a question.'),
    '/ingresar': hello('I want to sign in to my mailbox and have a question.'),
    '/mi-casillero': hello('I am looking at my mailbox and have a question.'),
    '/empresas': hello('I have a question about your service for companies.'),
    '/preguntas-frecuentes': hello('I have a question I could not find on your site.'),
    '/articulos-prohibidos': hello('I have a question about the prohibited items.'),
    '/nosotros': hello('I would like to know more about Carinova.'),
    '/terminos': hello('I have a question about your terms and conditions.'),
    '/privacidad': hello('I have a question about my personal data.'),
  },
  floatingDefault: hello('I am coming from your website and have a question.'),
  footer: hello('I am coming from your website and would like some information.'),

  homeHero: hello('I want to bring my purchases from the United States. How do I start?'),
  storesAssist: hello('I do not have a card to pay online. Can you help me with an assisted purchase?'),
  homeFaq: hello('I read your frequently asked questions and have another one.'),
  homeClosing: hello('I want to make my first purchase with you. Can you help me?'),

  howToClosing: hello('I saw how to buy and would like help with my first purchase.'),
  example: (category: string) =>
    hello(`I saw your example for ${category.toLowerCase()} and want to bring something similar.`),

  services: {
    aereo: hello('I want to ship by air. Can you give me more information?'),
    maritimo: hello('I want to ship by sea. Can you give me more information?'),
    encomiendas: hello('Someone is sending me a package from the United States. What do I do?'),
    'compras-asistidas': hello('I would like an assisted purchase. This is the link to the product: '),
    'retiro-en-sucursal': hello('I would like to know how to pick up my package at a branch.'),
    'entrega-a-domicilio': hello('I would like to know when you will have home delivery.'),
  },
  servicesClosing: hello('I would like help choosing the service for my shipment.'),

  quote: (shipment: string, city: string, total: string) =>
    hello(`I got a quote on your site for ${shipment}, to pick up in ${city}: ${total}. Can you help me confirm it?`),
  quoteEmpty: hello('I am on your quote calculator and do not know what to enter.'),
  quoteClosing: hello('I want a quote for a special shipment (very large, fragile or with several items).'),

  branch: (city: string) => hello(`I have a question for the ${city} branch.`),
  branchesClosing: hello('I would like to know which branch suits me for pickup.'),

  accountExisting: hello('I already have my Carinova ID and want to ask about my packages.'),
  accountClosing: hello('I have a question before I open my mailbox.'),

  signupAssist: hello('I would rather open my mailbox through WhatsApp.'),
  signupHelp: hello('I tried to sign up on your site and need help.'),
  confirmHelp: hello('I could not confirm my e-mail to open my mailbox.'),
  customer: (code: string) => hello(`My Carinova ID is ${code} and I have a question.`),
  welcomeEmail: (code: string) => hello(`My Carinova ID is ${code}. I got the welcome e-mail and have a question.`),

  signinHelp: hello('I cannot sign in to my mailbox. Can you help me?'),
  signinError: hello('I tried to sign in to my mailbox on your site and got an error.'),
  mailbox: (code: string) => hello(`My Carinova ID is ${code}. I want to ask about my packages.`),
  mailboxUpdate: (code: string) => hello(`My Carinova ID is ${code} and I want to update my details.`),
  mailboxError: hello('I tried to open my mailbox on your site and got an error.'),

  accountCompany: hello('I want to open a Carinova ID for my company.'),
  businessHelp: hello('I tried to send the form for companies and need help.'),
  businessClosing: hello('I want to talk to an advisor about my company’s shipments.'),

  faqClosing: hello('I could not find my answer in your frequently asked questions.'),
  restricted: hello('Before I buy, I want to know if you can bring this product: '),
  aboutClosing: hello('I found Carinova on your site and want to start shipping with you.'),
  notFound: hello('I landed on a page of your site that does not exist.'),
};
