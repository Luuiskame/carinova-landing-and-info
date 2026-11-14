/**
 * French wording of ../services.ts: the same exports, in French. Ids, icons, availability, links
 * and the numbers of the worked examples are taken from the Spanish file; prices and times are
 * worked out from the same rates. Only the words are written here, keyed by id, so adding a service
 * or an example in Spanish without its French text fails src/i18n/translations.test.ts.
 */
import * as es from '../services.ts';
import type { ProcessStep, Service, ServiceAxis, ServiceAxisId, ShoppingExample } from '../services.ts';
import { sentence } from '../carinova.ts';
import { formatUSD } from '../../utils/rates.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, describeHours } from './carinova.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city);
const [branchHours] = BRANCHES[0].hours;

/** "a, b et c" */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;
const lowercaseFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** "téléphones portables US$30, tablettes US$40, …" */
const devicePrices = electronics.items
  .map((item) => `${item.brand ? item.plural : item.plural.toLowerCase()} ${formatUSD(item.price)}`)
  .join(', ');

/** The text of an id, or an error that names what is missing. */
const textOf = <T>(table: Record<string, T>, id: string, kind: string): T => {
  const text = table[id];
  if (!text) throw new Error(`The ${kind} "${id}" has no French text (src/data/fr/services.ts).`);
  return text;
};

const AXIS_TEXT: Record<ServiceAxisId, Pick<ServiceAxis, 'name' | 'question' | 'rule'>> = {
  transporte: {
    name: 'Mode de transport',
    question: 'Comment voyage votre colis ?',
    rule: 'Deux voies, une même destination : rapidité ou économie, c’est vous qui choisissez.',
  },
  solucion: {
    name: 'Solution commerciale',
    question: 'Qui fait l’achat ?',
    rule: 'Vous l’achetez ou votre famille vous l’envoie, ou bien nous l’achetons pour vous.',
  },
  distribucion: {
    name: 'Livraison finale',
    question: 'Comment le recevez-vous au Nicaragua ?',
    rule: 'Dans nos agences ou chez vous, avec des frais supplémentaires.',
  },
};

export const SERVICE_AXES: Array<ServiceAxis> = es.SERVICE_AXES.map((axis) => ({ ...axis, ...AXIS_TEXT[axis.id] }));

interface ServiceText {
  name: string;
  summary: string;
  description: string;
  facts: Array<string>;
  /** Text of the service's link, when it has one. */
  link?: string;
  whatsappText?: string;
}

const SERVICE_TEXT: Record<string, ServiceText> = {
  aereo: {
    name: 'Aérien',
    summary: `${formatUSD(air.pricePerLb)} la livre · ${air.transit}`,
    description:
      'Pensé pour ce que vous voulez recevoir rapidement. Il applique un tarif de base à la livre et, pour certains appareils électroniques, un tarif fixe à l’unité.',
    facts: [
      `Livraison estimée : ${air.transit}, ${RATES.transitFrom}.`,
      `Tarif de base : ${formatUSD(air.pricePerLb)} la livre.`,
      `Électronique à l’unité : ${devicePrices}.`,
      `Refusés en avion, mais acceptés par voie maritime : ${listOf(RESTRICTED_ITEMS.seaOnly.items.map((item) => lowercaseFirst(item.name)))}.`,
      'Le tarif applicable est confirmé selon le type de marchandise, l’emballage et les conditions du service.',
    ],
    link: 'Calculer un envoi aérien',
  },
  maritimo: {
    name: 'Maritime',
    summary: `${formatUSD(sea.pricePerLb)} la livre ou ${formatUSD(sea.pricePerCubicFoot)} le pi³ · ${sea.transit}`,
    description:
      'Idéal pour les gros volumes, les achats planifiés et les envois où le coût passe avant tout. Il est calculé au poids ou au volume.',
    facts: [
      `Livraison estimée : ${sea.transit}, ${RATES.transitFrom}.`,
      `Tarif de base au poids : ${formatUSD(sea.pricePerLb)} la livre.`,
      `Tarif au volume : ${formatUSD(sea.pricePerCubicFoot)} le pied cube.`,
      'Le calcul au poids ou au volume est déterminé selon la marchandise, son emballage et les conditions du service.',
    ],
    link: 'Calculer un envoi maritime',
  },
  encomiendas: {
    name: 'Colis',
    summary: 'Ce que vous ou votre famille envoyez à notre entrepôt.',
    description:
      'Nous acheminons tout colis qui arrive à notre entrepôt à votre nom : vos achats en ligne ou le carton que votre famille vous envoie depuis les États-Unis.',
    facts: [
      'Achetez dans n’importe quel magasin qui livre aux États-Unis.',
      'Votre famille ou vos amis peuvent aussi vous envoyer un carton à votre adresse de Miami.',
      'Il voyage par avion ou par bateau, comme vous préférez.',
    ],
    link: 'Voir comment ça marche',
  },
  'compras-asistidas': {
    name: 'Achats assistés',
    summary: 'Vous choisissez le produit et nous faisons l’achat pour vous.',
    description: 'Choisissez le magasin et envoyez-nous le lien du produit : nous effectuons l’achat pour vous.',
    facts: [
      'Avant d’acheter, nous confirmons la disponibilité, si l’article peut entrer au Nicaragua et le coût total.',
      'Le coût de l’achat, les taxes et le fret sont confirmés avant que nous lancions l’opération.',
      'Il arrive à notre entrepôt et voyage comme n’importe quel colis.',
    ],
    link: 'Préparer ma demande',
    whatsappText: 'Demander un achat assisté',
  },
  'retiro-en-sucursal': {
    name: 'Retrait en agence',
    summary: `${listOf(cities)} · ${lowercaseFirst(branchHours.days)}`,
    description: 'Quand votre colis est disponible, vous passez le retirer à l’agence la plus proche de chez vous.',
    facts: [`Agences à ${listOf(cities)}.`, sentence(`Nous sommes ouverts ${describeHours(branchHours)}`)],
    link: 'Voir les agences',
  },
  'entrega-a-domicilio': {
    name: 'Livraison à domicile',
    summary: 'Partout dans le pays, avec des frais supplémentaires.',
    description:
      'Nous livrons partout dans le pays, sous réserve de coordination et de couverture. La livraison à domicile entraîne des frais supplémentaires selon la destination et les conditions opérationnelles.',
    facts: ['L’adresse, la couverture et les frais sont confirmés lors de l’organisation de la livraison.'],
    whatsappText: 'Se renseigner sur la livraison à domicile',
  },
};

export const SERVICES: Array<Service> = es.SERVICES.map((service) => {
  const text = textOf(SERVICE_TEXT, service.id, 'service');
  return {
    ...service,
    name: text.name,
    summary: text.summary,
    description: text.description,
    facts: text.facts,
    link: service.link && { ...service.link, text: text.link ?? service.link.text },
    whatsappText: service.whatsappText && text.whatsappText,
  };
});

export const servicesOf = (axis: ServiceAxisId) => SERVICES.filter((service) => service.axis === axis);

const receivingNow = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
const receivingSoon = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);
/** " Los Angeles, prochainement." or nothing, once every warehouse is open. */
const soonNote = receivingSoon.length ? ` ${listOf(receivingSoon)}, prochainement.` : '';

/** In the order of ../services.ts: the steps have no id. */
const STEP_TEXT: Array<Pick<ProcessStep, 'title' | 'summary' | 'details'> & { link: string }> = [
  {
    title: 'Créez votre compte',
    summary: `Confirmez votre e-mail et obtenez votre Carinova ID ainsi que votre adresse aux États-Unis : l’adresse de réception à ${listOf(receivingNow)}.`,
    details: [
      'Vous remplissez un court formulaire et confirmez votre e-mail avec le lien que nous vous envoyons.',
      'À la confirmation, vous voyez votre Carinova ID et votre adresse aux États-Unis, et nous vous les envoyons aussi par e-mail.',
      'Ensuite, vous vous connectez avec votre e-mail et un code à usage unique : aucun mot de passe à retenir.',
    ],
    link: CTA.signup.text,
  },
  {
    title: `Achetez et faites livrer à ${listOf(receivingNow)}`,
    summary: 'Utilisez l’adresse de votre compte lors de vos achats. Vérifiez d’abord que votre article est autorisé.',
    details: [
      `Envoyez votre achat à l’adresse de notre entrepôt à ${listOf(receivingNow)} indiquée dans votre compte.${soonNote}`,
      'Au moment de payer sur le site du magasin, écrivez votre prénom et votre nom exactement comme ils figurent dans votre adresse.',
      'Avant d’acheter, vérifiez si l’article peut entrer : certains articles sont interdits, nous ne sommes pas encore autorisés à en acheminer d’autres, et d’autres encore ne voyagent que par voie maritime.',
      'Vous préférez que nous achetions pour vous ? Demandez un achat assisté.',
    ],
    link: 'Vérifier un article',
  },
  {
    title: 'Recevez au Nicaragua',
    summary: `Retirez votre colis à ${cities.join(' ou ')}. Livraison partout dans le pays avec des frais supplémentaires.`,
    details: [
      `Nous l’acheminons par avion en ${air.transit} ou par bateau en ${sea.transit}, ${RATES.transitFrom}.`,
      'Vous suivez chaque étape depuis votre compte, avec la référence de votre colis.',
      sentence(`Nos agences sont ouvertes ${describeHours(branchHours)}`),
      'La livraison à domicile s’organise selon la destination et la couverture.',
    ],
    link: 'Voir les agences',
  },
];

export const PROCESS_STEPS: Array<ProcessStep> = es.PROCESS_STEPS.map((step, index) => {
  const text = STEP_TEXT[index];
  if (!text) throw new Error(`Step ${index + 1} of "¿Cómo funciona?" has no French text (src/data/fr/services.ts).`);
  return {
    ...step,
    title: text.title,
    summary: text.summary,
    details: text.details,
    link: step.link && { ...step.link, text: text.link },
  };
});

const ACCOUNT_TEXT: Record<string, { title: string; summary: string }> = {
  'carinova-id': { title: 'Carinova ID', summary: 'Un par personne ou par entreprise, pour tous vos envois.' },
  direccion: { title: 'Votre adresse aux États-Unis', summary: `${listOf(receivingNow)}.${soonNote}` },
  paquetes: {
    title: 'Vos colis',
    summary: 'Ce que nous avons reçu à l’entrepôt et ce que nous avons déjà expédié, avec le statut de chacun.',
  },
  pagos: { title: 'Vos paiements', summary: 'Vos factures et les paiements que nous avons confirmés.' },
};

export const ACCOUNT_PARTS: typeof es.ACCOUNT_PARTS = es.ACCOUNT_PARTS.map((part) => ({
  ...part,
  ...textOf(ACCOUNT_TEXT, part.id, 'account part'),
}));

const EXAMPLE_TEXT: Record<string, Pick<ShoppingExample, 'category' | 'item' | 'source'>> = {
  ropa: {
    category: 'Vêtements et chaussures',
    item: 'Deux chemisiers, un pantalon et une paire de baskets : 3 lb',
    source: 'Chez SHEIN et Nike',
  },
  celulares: { category: 'Téléphones et tablettes', item: 'Un téléphone neuf', source: 'Chez Amazon' },
  laptops: { category: 'Ordinateurs portables et consoles', item: 'Un ordinateur portable', source: 'Chez Best Buy' },
  hogar: { category: 'Maison et cuisine', item: 'Un ensemble de casseroles de 18 lb', source: 'Chez Walmart' },
  muebles: {
    category: 'Meubles',
    item: 'Une chaise de bureau, dans un carton de 28 × 26 × 14 pouces',
    source: 'Chez Home Depot',
  },
  encomienda: {
    category: 'Colis familiaux',
    item: 'Un carton de 8 lb avec des vêtements et des cadeaux',
    source: 'De votre famille aux États-Unis',
  },
};

export const SHOPPING_EXAMPLES: Array<ShoppingExample> = es.SHOPPING_EXAMPLES.map((example) => ({
  ...example,
  ...textOf(EXAMPLE_TEXT, example.id, 'example'),
}));

export const quoteExample = es.exampleQuoter(
  RATES,
  {
    airWeight: 'Aérien, à la livre',
    seaWeight: 'Maritime, au poids',
    seaVolume: 'Maritime, au volume',
    unit: 'Aérien, tarif à l’unité',
    unitNote: 'Le tarif à l’unité ne s’ajoute pas au tarif à la livre.',
  },
  'fr'
);

export const FORMULA_EXAMPLE: typeof es.FORMULA_EXAMPLE = {
  ...es.FORMULA_EXAMPLE,
  item: 'Une palette de marchandises',
};
