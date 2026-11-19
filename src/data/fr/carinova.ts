/**
 * French wording of ../carinova.ts: the same exports with the same shapes, for the French version
 * of the site (src/i18n). Facts are not repeated here: every price, number, address and id is taken
 * from the Spanish file and only the words around it are written again, so the languages cannot
 * disagree on a fact. src/i18n/translations.test.ts checks that nothing is left untranslated.
 *
 * Like ../carinova.ts, the Worker bundles this file: relative imports with the .ts extension only.
 */
import * as es from '../carinova.ts';
import type { Branch, DayOfWeek, OpeningHours, RestrictedGroupId, Store, StoreCategoryId } from '../carinova.ts';

/** "a, b et c" */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const lowercaseFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

export const TAGLINE = 'Des envois qui nous unissent';
export const HEADLINE: [string, string] = ['De là-bas', 'jusqu’ici.'];
export const VALUE_PROPOSITION =
  'Nous acheminons vos achats personnels, vos colis familiaux et le fret de votre entreprise des États-Unis jusqu’au Nicaragua.';

export const CTA: typeof es.CTA = {
  signup: { ...es.CTA.signup, text: 'Créer un compte' },
  quote: { ...es.CTA.quote, text: 'Estimez votre envoi' },
  help: { text: 'Aide sur WhatsApp' },
  account: { ...es.CTA.account, text: 'Aller à mon compte', short: 'Mon compte' },
  signin: { ...es.CTA.signin, text: 'Se connecter', short: 'Connexion' },
  track: { ...es.CTA.track, text: 'Suivi de colis' },
};

/** "08:00" → "8 h", "17:30" → "17 h 30": the 24-hour clock, as French writes opening hours. */
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  return minutes ? `${hours} h ${String(minutes).padStart(2, '0')}` : `${hours} h`;
};

/** "8 h – 17 h" */
export const formatHours = ({ opens, closes }: OpeningHours): string => `${formatTime(opens)} – ${formatTime(closes)}`;

/** "du lundi au samedi, de 8 h à 17 h": opening hours inside a sentence. */
export const describeHours = (hours: OpeningHours): string =>
  `${lowercaseFirst(hours.days)}, de ${formatTime(hours.opens)} à ${formatTime(hours.closes)}`;

const WEEK: Array<DayOfWeek> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NAMES = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

/** The days a branch opens, from the structured list: "Du lundi au samedi", or the days one by one. */
const daysOf = (days: Array<DayOfWeek>): string => {
  const order = days.map((day) => WEEK.indexOf(day)).sort((a, b) => a - b);
  const inARow = order.every((day, index) => index === 0 || day === order[index - 1] + 1);
  return capitalize(
    order.length > 2 && inARow
      ? `du ${DAY_NAMES[order[0]]} au ${DAY_NAMES[order[order.length - 1]]}`
      : listOf(order.map((day) => DAY_NAMES[day]))
  );
};

export const BRANCHES: Array<Branch> = es.BRANCHES.map((branch) => ({
  ...branch,
  // A real address is the same in every language; only the placeholder is words.
  address: branch.address === es.ADDRESS_PENDING ? 'Adresse à confirmer' : branch.address,
  hours: branch.hours.map((row) => ({ ...row, days: daysOf(row.dayOfWeek) })),
}));

const CITY_NAMES: Record<string, string> = { 'los-angeles': 'Los Angeles' };

export const RECEPTION_POINTS: typeof es.RECEPTION_POINTS = es.RECEPTION_POINTS.map((point) => ({
  ...point,
  city: CITY_NAMES[point.id] ?? point.city,
}));

/** When packages are received in the United States, in this language. */
export const RECEPTION_HOURS: OpeningHours = {
  ...es.RECEPTION_HOURS,
  days: daysOf(es.RECEPTION_HOURS.dayOfWeek),
};

/** "3 à 4 jours" */
const transit = ([min, max]: [number, number]): string => `${min} à ${max} jours`;

const DEVICE_NAMES: Record<string, { name: string; plural: string }> = {
  celular: { name: 'Téléphone portable', plural: 'Téléphones portables' },
  tablet: { name: 'Tablette', plural: 'Tablettes' },
  laptop: { name: 'Ordinateur portable', plural: 'Ordinateurs portables' },
  xbox: { name: 'Xbox', plural: 'Xbox' },
  playstation: { name: 'PlayStation', plural: 'PlayStation' },
};

export const RATES: typeof es.RATES = {
  ...es.RATES,
  transitFrom: 'à compter de la réception physique de votre colis',
  air: { ...es.RATES.air, name: 'Aérien', badge: 'Le plus rapide', transit: transit(es.RATES.air.transitDays) },
  sea: {
    ...es.RATES.sea,
    name: 'Maritime',
    badge: 'Le plus économique',
    transit: transit(es.RATES.sea.transitDays),
  },
  electronics: {
    ...es.RATES.electronics,
    name: 'Électronique',
    transit: transit(es.RATES.electronics.transitDays),
    items: es.RATES.electronics.items.map((item) => ({ ...item, ...DEVICE_NAMES[item.id] })),
  },
  notes: [
    'Les délais courent à compter de la réception physique du colis et peuvent varier selon le transit, la douane et la destination.',
    'Le poids, les dimensions, le mode de transport, la couverture et les conditions du service sont vérifiés.',
    'Les tarifs incluent l’assurance et les taxes lorsqu’elles s’appliquent à l’envoi. La couverture, les limites, les exclusions et les frais supplémentaires sont soumis aux conditions du service.',
    'Les tarifs de l’électronique s’appliquent aux envois aériens, à l’unité.',
    `Au poids, chaque envoi est facturé pour un minimum de ${es.RATES.minimumLb} lb.`,
  ],
};

export const MIAMI_ADDRESS: typeof es.MIAMI_ADDRESS = {
  ...es.MIAMI_ADDRESS,
  notes: [
    'Écrivez le prénom et le nom exactement ainsi : c’est ce qui nous permet d’identifier vos colis.',
    'Pour les envois maritimes, écrivez-nous sur WhatsApp avant d’acheter.',
  ],
};

/** The labels already carry Spanish and English, as on Carinova's graphic: store checkouts are in English. */
export const miamiAddressRows = es.miamiAddressRows;

/**
 * The names of the items, in the order of the Spanish lists, with the words a French speaker may
 * type for each one. The Spanish words still match too: the site's visitors mix languages.
 */
const RESTRICTED_TEXT: Record<
  RestrictedGroupId,
  { title: string; summary: string; items: Array<{ name: string; match: Array<string> }> }
> = {
  notYet: {
    title: 'Pas encore autorisés',
    summary: 'Nous ne sommes pas encore autorisés à les acheminer.',
    items: [
      {
        name: 'Voitures',
        match: [
          'voiture',
          'voitures',
          'automobile',
          'automobiles',
          'vehicule',
          'vehicules',
          'camion',
          'camions',
          'camionnette',
        ],
      },
      { name: 'Motos', match: ['moto', 'motos', 'motocyclette', 'motocyclettes', 'scooter', 'scooters'] },
      {
        name: 'Engins lourds',
        match: [
          'engin lourd',
          'engins lourds',
          'engin de chantier',
          'engins de chantier',
          'machinerie lourde',
          'machine lourde',
          'machines lourdes',
          'pelleteuse',
          'excavatrice',
          'tractopelle',
          'tracteur',
          'chariot elevateur',
        ],
      },
    ],
  },
  prohibited: {
    title: 'Interdits à la réception et au transport',
    summary: 'Nous ne les recevons pas et ne les transportons pas.',
    items: [
      {
        name: 'Armes, munitions et leurs accessoires',
        match: [
          'arme',
          'armes',
          'arme a feu',
          'armes a feu',
          'pistolet',
          'pistolets',
          'revolver',
          'fusil',
          'fusils',
          'carabine',
          'munition',
          'munitions',
        ],
      },
      {
        name: 'Tabac, cigarettes et produits du tabac',
        match: ['tabac', 'cigarette', 'cigarettes', 'cigare', 'cigares', 'cigarillo', 'cigarillos'],
      },
      {
        name: 'Cigarettes électroniques',
        match: [
          'cigarette electronique',
          'cigarettes electroniques',
          'e cigarette',
          'e cigarettes',
          'vapoteuse',
          'vapoteuses',
          'vape',
          'vapes',
        ],
      },
      {
        name: 'Boissons alcoolisées',
        match: [
          'boisson alcoolisee',
          'boissons alcoolisees',
          'spiritueux',
          'liqueur',
          'rhum',
          'whisky',
          'vodka',
          'tequila',
          'biere',
          'bieres',
          'vin',
          'vins',
        ],
      },
      {
        name: 'Accessoires pour aéronefs',
        match: ['aeronef', 'aeronefs', 'avion', 'avions', 'piece d avion', 'pieces d avion', 'pieces aeronautiques'],
      },
      {
        name: 'Émetteurs radio',
        match: ['emetteur', 'emetteurs', 'emetteur radio', 'emetteurs radio', 'emetteur recepteur', 'talkie walkie'],
      },
      { name: 'Drones', match: ['drone', 'drones'] },
    ],
  },
  seaOnly: {
    title: 'Refusés en aérien, mais acceptés en maritime',
    summary: 'Ils ne peuvent pas voyager en avion : nous les acheminons par voie maritime.',
    items: [
      {
        name: 'Produits inflammables',
        match: [
          'inflammable',
          'inflammables',
          'carburant',
          'essence',
          'peinture',
          'peintures',
          'solvant',
          'solvants',
          'diluant',
          'alcool',
        ],
      },
      {
        name: 'Batteries au lithium seules',
        match: [
          'batterie',
          'batteries',
          'batterie au lithium',
          'batteries au lithium',
          'batterie lithium',
          'batteries lithium',
          'lithium',
          'pile',
          'piles',
          'pile au lithium',
          'piles au lithium',
          'batterie externe',
          'batteries externes',
          'powerbank',
        ],
      },
      {
        name: 'Brumes pour le corps',
        match: [
          'brume',
          'brumes',
          'brume pour le corps',
          'brumes pour le corps',
          'brume parfumee',
          'brumes parfumees',
          'spray corporel',
          'body mist',
          'eau de cologne',
        ],
      },
      { name: 'Parfums', match: ['parfum', 'parfums', 'eau de parfum', 'eau de toilette', 'fragrance', 'fragrances'] },
      {
        name: 'Aérosols',
        match: [
          'aerosol',
          'aerosols',
          'bombe aerosol',
          'sprays',
          'deodorant spray',
          'deodorant en spray',
          'laque',
          'laque pour cheveux',
          'mousse a raser',
        ],
      },
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

export const RESTRICTED_EXAMPLES = ['Parfum', 'Drone', 'Batterie au lithium', 'Moto', 'Cigarette électronique'];

const CATEGORY_NAMES: Record<StoreCategoryId, string> = {
  moda: 'Mode',
  tecnologia: 'Technologie',
  hogar: 'Maison',
  marketplaces: 'Places de marché',
  belleza: 'Beauté',
};

export const STORE_CATEGORIES: typeof es.STORE_CATEGORIES = es.STORE_CATEGORIES.map((category) => ({
  ...category,
  name: CATEGORY_NAMES[category.id],
}));

const STORE_TEXT: Record<string, Pick<Store, 'tagline' | 'about'>> = {
  amazon: {
    tagline: 'Un univers de catégories au même endroit.',
    about:
      'Découvrez des articles pour la maison, des livres, des accessoires, de la technologie et bien d’autres produits.',
  },
  shein: {
    tagline: 'La mode et les accessoires pour tous les styles.',
    about: 'Vêtements, sacs et accessoires. Vérifiez les tailles, les matières et la disponibilité.',
  },
  temu: {
    tagline: 'Des produits à découvrir et à comparer.',
    about: 'Articles pour la maison, accessoires et achats du quotidien. Lisez bien chaque description.',
  },
  walmart: {
    tagline: 'Des achats pour la maison et la famille.',
    about: 'Articles pour la maison, rangement, accessoires et articles d’usage personnel.',
  },
  'best-buy': {
    tagline: 'La technologie pour travailler et se divertir.',
    about:
      'Ordinateurs portables, téléphones, tablettes et consoles. Vérifiez le tarif à l’unité et les exigences liées aux batteries.',
  },
  nike: {
    tagline: 'Des vêtements et des chaussures pour bouger à votre façon.',
    about: 'Chaussures, vêtements de sport et accessoires de plusieurs catégories.',
  },
  apple: {
    tagline: 'Appareils et accessoires.',
    about: 'Téléphones, tablettes, ordinateurs portables et accessoires. Certains produits ont un tarif à l’unité.',
  },
  target: {
    tagline: 'Des idées pour la maison et votre quotidien.',
    about: 'Décoration, articles pour la maison, cadeaux et autres catégories.',
  },
  ebay: {
    tagline: 'Des produits neufs et d’occasion.',
    about: 'Des achats auprès de différents vendeurs. Vérifiez l’état, les détails et les conditions.',
  },
  sephora: {
    tagline: 'Beauté et soins personnels.',
    about: 'Maquillage et soins personnels. Les parfums et les aérosols ne voyagent que par voie maritime.',
  },
  'home-depot': {
    tagline: 'Des idées pour vos projets et vos travaux.',
    about: 'Outillage et aménagement de la maison. Vérifiez la taille et les restrictions.',
  },
  adidas: {
    tagline: 'Sport et style de vie.',
    about: 'Chaussures, vêtements de sport et accessoires.',
  },
};

export const STORES: Array<Store> = es.STORES.map((store) => ({ ...store, ...STORE_TEXT[store.id] }));

const hello = (text: string) => `Bonjour Carinova 👋 ${text}`;

/** One message per place, as in Spanish: the keys are the same and each text is still unique. */
export const WA_MESSAGES: typeof es.WA_MESSAGES = {
  floating: {
    '/': hello('Je souhaite des informations pour faire venir mes achats des États-Unis.'),
    '/como-comprar': hello('J’ai une question sur le fonctionnement du service.'),
    '/servicios': hello('Je voudrais savoir quel service me convient.'),
    '/cotizador': hello('J’ai besoin d’aide pour estimer mon envoi.'),
    '/sucursales': hello('J’ai une question sur vos agences.'),
    '/casillero-en-miami': hello('Je voudrais ouvrir mon adresse aux États-Unis à Miami.'),
    '/tiendas': hello('Je veux acheter dans un magasin aux États-Unis et j’ai une question.'),
    '/rastreo': hello('Je voudrais savoir où se trouve mon colis.'),
    '/mi-cuenta': hello('Je suis dans mon compte et j’ai une question.'),
    '/registro': hello('Je suis en train de créer mon compte et j’ai une question.'),
    '/registro/confirmar': hello('Je suis en train de confirmer mon e-mail et j’ai une question.'),
    '/ingresar': hello('Je veux me connecter à mon compte et j’ai une question.'),
    '/empresas': hello('J’ai une question sur votre service pour les entreprises.'),
    '/preguntas-frecuentes': hello('J’ai une question dont je n’ai pas trouvé la réponse sur votre site.'),
    '/articulos-prohibidos': hello('J’ai une question sur les articles que vous ne pouvez pas acheminer.'),
    '/nosotros': hello('Je voudrais en savoir plus sur Carinova.'),
    '/terminos': hello('J’ai une question sur vos conditions générales.'),
    '/privacidad': hello('J’ai une question sur mes données personnelles.'),
  },
  floatingDefault: hello('Je viens de votre site web et j’ai une question.'),
  footer: hello('Je viens de votre site web et je souhaite des informations.'),
  channels: hello('Je vous ai trouvés sur votre site web et je voudrais vous écrire.'),

  /** "Contactar al equipo", under the conditions of the service on the home page. */
  homeConditions: hello('J’ai lu les conditions du service sur votre page d’accueil et j’ai une question.'),

  trackItemCheck: (item: string) =>
    hello(`Je suis sur votre page de suivi et je voudrais savoir si vous pouvez acheminer : ${item}`),
  trackItemCheckEmpty: hello('Je suis sur votre page de suivi et je voudrais me renseigner sur un article : '),
  trackPackage: (code: string, reference: string) =>
    hello(`Mon Carinova ID est ${code}. Je suis en train de suivre mon colis ${reference} et j’ai une question.`),
  trackMissing: (code: string, reference: string) =>
    hello(`Mon Carinova ID est ${code}. Je ne trouve pas le colis ${reference} dans mon compte.`),
  trackClosing: hello('Je ne trouve pas mon colis sur la page de suivi. Pouvez-vous m’aider ?'),

  howToClosing: hello('J’ai vu comment ça marche et je voudrais de l’aide pour mon premier envoi.'),
  example: (category: string) =>
    hello(`J’ai vu votre exemple « ${category.toLowerCase()} » et je voudrais faire venir quelque chose de semblable.`),

  services: {
    aereo: hello('Je veux envoyer par avion. Pouvez-vous me donner plus d’informations ?'),
    maritimo: hello('Je veux envoyer par bateau. Pouvez-vous me donner plus d’informations ?'),
    encomiendas: hello('Quelqu’un va m’envoyer un colis depuis les États-Unis. Comment faire ?'),
    'compras-asistidas': hello('Je voudrais que vous achetiez un produit pour moi. Voici le lien : '),
    'retiro-en-sucursal': hello('Je voudrais savoir comment retirer mon colis en agence.'),
    'entrega-a-domicilio': hello(
      'Je voudrais organiser une livraison à domicile. Quelle couverture et quels frais s’appliquent ?'
    ),
  },
  servicesClosing: hello('Je voudrais de l’aide pour choisir le service de mon envoi.'),

  lockerClosing: hello('Je voudrais en savoir plus sur l’adresse aux États-Unis à Miami avant de créer mon compte.'),
  storesShopper: (link: string) =>
    hello(
      `Je suis sur votre page des magasins et je voudrais un achat assisté. Produit : ${link} Pouvez-vous me confirmer la disponibilité, si l’article peut entrer au Nicaragua et le coût total ?`
    ),
  storePageAssist: (store: string) =>
    hello(
      `J’ai vu ${store} sur votre page des magasins et je voudrais que vous achetiez pour moi. Voici le lien du produit : `
    ),
  storesClosing: hello('Je voudrais de l’aide pour acheter dans un magasin aux États-Unis.'),

  quote: (shipment: string, total: string) =>
    hello(
      `J’ai fait une estimation sur votre calculateur pour ${shipment} : ${total}. Pouvez-vous m’aider à la confirmer ?`
    ),
  quoteEmpty: hello('Je suis sur votre calculateur et je ne sais pas quoi saisir.'),
  quoteClosing: hello(
    'Je voudrais une estimation pour un envoi spécial (très grand, fragile ou avec plusieurs articles).'
  ),

  branch: (city: string) => hello(`J’ai une question pour l’agence de ${city}.`),
  branchesClosing: hello('Je voudrais savoir dans quelle agence il vaut mieux retirer mon colis.'),

  accountClosing: hello('J’ai une question avant de créer mon compte.'),

  signupAssist: hello('Je préfère créer mon compte par WhatsApp.'),
  signupHelp: hello('J’ai essayé de m’inscrire sur votre site et j’ai besoin d’aide.'),
  confirmHelp: hello('Je n’ai pas pu confirmer mon e-mail pour créer mon compte.'),
  accountExisting: hello('J’ai déjà mon Carinova ID et je voudrais me renseigner sur mes colis.'),
  customer: (code: string) => hello(`Mon Carinova ID est ${code} et j’ai une question.`),
  welcomeEmail: (code: string) =>
    hello(`Mon Carinova ID est ${code}. J’ai reçu l’e-mail de bienvenue et j’ai une question.`),

  signinHelp: hello('Je n’arrive pas à me connecter à mon compte. Pouvez-vous m’aider ?'),
  signinError: hello('J’ai essayé de me connecter à mon compte sur votre site et j’ai eu une erreur.'),
  accountPackages: (code: string) => hello(`Mon Carinova ID est ${code}. Je voudrais me renseigner sur mes colis.`),
  accountPackage: (code: string, reference: string) =>
    hello(`Mon Carinova ID est ${code}. Je voudrais me renseigner sur mon colis ${reference}.`),
  accountInvoice: (code: string, number: string) =>
    hello(`Mon Carinova ID est ${code}. Je voudrais payer la facture ${number} ou poser une question à son sujet.`),
  accountUpdate: (code: string) => hello(`Mon Carinova ID est ${code} et je voudrais mettre à jour mes coordonnées.`),
  accountError: hello('J’ai essayé d’ouvrir mon compte sur votre site et j’ai eu une erreur.'),

  accountCompany: hello('Je voudrais ouvrir un Carinova ID pour mon entreprise.'),
  businessHelp: hello('J’ai essayé d’envoyer le formulaire pour les entreprises et j’ai besoin d’aide.'),
  businessClosing: hello('Je voudrais parler à un conseiller des envois de mon entreprise.'),

  faqClosing: hello('Je n’ai pas trouvé ma réponse dans vos questions fréquentes.'),
  restricted: hello('Avant d’acheter, je voudrais savoir si vous pouvez acheminer ce produit : '),
  aboutClosing: hello('J’ai découvert Carinova sur votre site et je voudrais commencer à envoyer avec vous.'),
  careers: hello('Je voudrais rejoindre l’équipe Carinova. Le domaine qui m’intéresse : '),
  notFound: hello('J’ai suivi un lien de votre site vers une page qui n’existe pas.'),
};
