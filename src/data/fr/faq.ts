/**
 * French wording of ../faq.ts: the same questions, in the same groups and the same order, with the
 * same ones on the home page (src/i18n/translations.test.ts compares the two). Prices, times and
 * lists come from the French data, which takes every fact from the Spanish data.
 */
import { LOGIN_CODE_DIGITS, PACKAGE_STAGES } from '../account.ts';
import { CARINOVA_ID_EXAMPLE, sentence, type RestrictedItem } from '../carinova.ts';
import { FAQ_STORE_COUNT, type FaqGroup, type LinkTo } from '../faq.ts';
import { ui } from '../../i18n/ui/fr.ts';
import {
  CUBIC_CM_PER_CUBIC_FOOT,
  describeVolume,
  formatNumber,
  formatUSD,
  quoteByVolume,
  quoteByWeight,
} from '../../utils/rates.ts';
import { BRANCHES, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, STORES, describeHours } from './carinova.ts';
import { FORMULA_EXAMPLE } from './services.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city).join(' et ');
const [hours] = BRANCHES[0].hours;
const receiving = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
const soonReception = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);
const devices = electronics.items
  .map((item) => `${item.brand ? item.plural : item.plural.toLowerCase()} ${formatUSD(item.price)}`)
  .join(', ');
const stores = STORES.slice(0, FAQ_STORE_COUNT)
  .map((store) => store.name)
  .join(', ');
/** "Armes, Drones" → "armes ; drones": the items carry commas of their own. */
const inline = (items: Array<RestrictedItem>) =>
  items.map((item) => item.name.charAt(0).toLowerCase() + item.name.slice(1)).join(' ; ');
const stages = PACKAGE_STAGES.map((stage) => ui.statuses.package[stage.id].name.toLowerCase()).join(', ');

export const faqGroups = (link: LinkTo): Array<FaqGroup> => [
  {
    id: 'cuenta',
    title: 'Compte et Carinova ID',
    items: [
      {
        title: 'Comment obtenir mon Carinova ID ?',
        description: `Remplissez ${link('/registro', 'le formulaire d’inscription')} avec votre e-mail et votre numéro de téléphone, puis confirmez votre e-mail avec le lien que nous vous envoyons. À la confirmation, la plateforme génère automatiquement votre Carinova ID unique (par exemple, ${CARINOVA_ID_EXAMPLE}).`,
        featured: 1,
      },
      {
        title: 'Qu’est-ce que le Carinova ID ?',
        description:
          'C’est l’identifiant de votre compte. Il y en a un par personne ou par entreprise, et c’est le même pour tous nos services : aérien, maritime, colis et achats assistés.',
      },
      {
        title: `Qu’est-ce qu’une adresse aux États-Unis à ${receiving.join(' et ')} (un « casillero ») et comment ça marche ?`,
        description: `C’est une adresse aux États-Unis à votre nom : vous l’indiquez comme adresse de livraison quand vous achetez en ligne, et ce qui arrive à notre entrepôt, nous l’acheminons au Nicaragua. Chez Carinova, elle est incluse avec votre compte : en le créant, vous recevez votre Carinova ID et votre adresse. ${link('/casillero-en-miami', 'Découvrir l’adresse aux États-Unis')}.`,
      },
      {
        title: 'Comment me connecter à mon compte ?',
        description: `Touchez ${link('/ingresar', 'Connexion')} et saisissez l’adresse e-mail de votre inscription : nous vous envoyons un code à ${LOGIN_CODE_DIGITS} chiffres et vous vous connectez avec, sans mot de passe. Dans ${link('/mi-cuenta', 'votre compte')}, vous trouvez votre Carinova ID, votre adresse aux États-Unis, vos colis et vos paiements.`,
      },
      {
        title: 'Combien coûte la création de mon compte ?',
        description: `La création de votre compte est gratuite : vous payez seulement l’envoi de chaque colis. ${link('/registro', 'Créez-le en ligne')} et recevez votre Carinova ID.`,
      },
      {
        title: 'Puis-je ouvrir un compte pour mon entreprise ?',
        description: `Oui : il y a un Carinova ID par personne ou par entreprise. Parlez-nous de votre entreprise dans ${link('/empresas', 'le formulaire pour les entreprises')} et nous vous contacterons, ou écrivez-nous sur WhatsApp.`,
      },
      {
        title: 'Où envoyer mes achats faits aux États-Unis ?',
        description: `Votre compte affiche l’adresse et les instructions de réception de notre entrepôt à ${receiving.join(' et ')}. Utilisez exactement ces informations pour que nous puissions identifier votre envoi.${
          soonReception.length ? ` Bientôt, vous pourrez aussi recevoir à ${soonReception.join(' et ')}.` : ''
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
        title: 'Quelle est la différence entre l’aérien et le maritime ?',
        description: `L’aérien est plus rapide : ${air.transit}, à ${formatUSD(air.pricePerLb)} la livre. Le maritime est plus économique : ${sea.transit}, à ${formatUSD(sea.pricePerLb)} la livre ou ${formatUSD(sea.pricePerCubicFoot)} le pied cube ; il convient aux gros volumes et aux achats planifiés. Les délais courent ${RATES.transitFrom}.`,
      },
      {
        title: 'Qu’entend-on par colis ?',
        description:
          'Tout colis qui arrive à notre entrepôt à votre nom : vos achats en ligne ou le carton que votre famille vous envoie depuis les États-Unis. Il voyage par avion ou par bateau, comme vous préférez.',
      },
      {
        title: 'Pouvez-vous acheter un produit pour moi ?',
        description: `Oui. Choisissez le magasin et envoyez-nous le lien. L’achat assisté nécessite la confirmation de la disponibilité, de l’admissibilité et des coûts du produit, du service et du transport. ${link('/#personal-shopper', 'Préparez votre demande')}.`,
        featured: 8,
      },
      {
        title: 'Dans quels magasins puis-je acheter ?',
        description: `Dans n’importe quel magasin en ligne qui livre aux États-Unis : ${stores} et bien d’autres.`,
      },
      {
        title: 'Comment acheter sur Amazon, SHEIN ou Temu depuis le Nicaragua ?',
        description: `Créez votre compte, utilisez l’adresse de votre compte comme adresse de livraison au moment de payer sur le site du magasin, et nous acheminons votre colis au Nicaragua, par avion ou par bateau. Si vous préférez que nous achetions pour vous, demandez un achat assisté. ${link('/tiendas', 'Voir les magasins')}.`,
      },
    ],
  },
  {
    id: 'tarifas',
    title: 'Tarifs et paiements',
    items: [
      {
        title: 'Combien coûte l’envoi d’un colis des États-Unis au Nicaragua ?',
        description: `Par avion, ${formatUSD(air.pricePerLb)} la livre ; par bateau, ${formatUSD(sea.pricePerLb)} la livre ou ${formatUSD(sea.pricePerCubicFoot)} le pied cube. Par exemple, un colis de 5 livres par avion revient à ${formatUSD(quoteByWeight(5, air.pricePerLb).total)}. ${link('/cotizador', 'Calculez votre envoi')}.`,
      },
      {
        title: 'Comment le tarif est-il calculé ?',
        description: `Aérien : ${formatUSD(air.pricePerLb)} la livre, avec des tarifs à l’unité pour certains appareils électroniques. Maritime : ${formatUSD(sea.pricePerLb)} la livre ou ${formatUSD(sea.pricePerCubicFoot)} le pied cube. La base de facturation est déterminée selon la marchandise et les conditions du service. Faites le calcul avec notre ${link('/cotizador', 'calculateur')}.`,
        featured: 4,
      },
      {
        title: 'Comment calcule-t-on le pied cube ?',
        description: `Multipliez la longueur, la largeur et la hauteur de la boîte en pouces, puis divisez le résultat par 1,728 ; si vous mesurez en centimètres, divisez-le par ${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)}. Par exemple : ${describeVolume(
          quoteByVolume(FORMULA_EXAMPLE.dims, sea.pricePerCubicFoot, { unit: FORMULA_EXAMPLE.unit }),
          'fr'
        )}.`,
      },
      {
        title: 'Quels appareils électroniques ont un tarif à l’unité ?',
        description: `Pour les envois aériens : ${devices}. Le tarif à l’unité ne s’ajoute pas au tarif à la livre.`,
      },
      {
        title: 'L’assurance et les taxes sont-elles incluses ?',
        description:
          'Les tarifs incluent l’assurance et les taxes lorsqu’elles s’appliquent à l’envoi. La couverture, les limites, les exclusions et les frais supplémentaires sont soumis aux conditions du service. Vérifiez les conditions applicables avant de souscrire au service.',
        featured: 5,
      },
      {
        title: 'Le prix estimé est-il ce que je vais payer ?',
        description:
          'Pas nécessairement. Le calculateur donne un tarif de référence, sans l’achat du produit ni le service de livraison à domicile. Le montant final est confirmé après vérification des dimensions, du poids, du contenu, du mode de transport et des conditions particulières.',
        featured: 9,
      },
      {
        title: 'Quand et comment dois-je payer ?',
        description: `Vous payez l’envoi au retrait de votre colis ou lors de l’organisation de sa livraison. Écrivez-nous pour connaître les moyens de paiement disponibles. Dans ${link('/mi-cuenta', 'votre compte')}, vous voyez vos factures et les paiements que nous avons confirmés.`,
      },
    ],
  },
  {
    id: 'tiempos',
    title: 'Délais et suivi',
    items: [
      {
        title: `Combien de temps prend un envoi de ${receiving.join(' et ')} au Nicaragua ?`,
        description: `Par avion, ${air.transit} ; par bateau, ${sea.transit}. Les délais courent ${RATES.transitFrom} et peuvent varier selon le transit, la douane et la destination.`,
      },
      {
        title: 'À partir de quand les délais courent-ils ?',
        description: `À partir de la réception physique du colis, et non de la date d’achat. Aérien : ${air.transit}. Maritime : ${sea.transit}. Ce sont des estimations qui dépendent du transit, de la douane et de la destination.`,
        featured: 3,
      },
      {
        title: 'Comment suivre plusieurs colis avec un même Carinova ID ?',
        description: `Le Carinova ID correspond à votre compte. Quand vous ${link('/ingresar', 'vous connectez')}, vous voyez chaque colis avec sa référence et ses statuts de suivi. Par sécurité, le numéro de compte à lui seul ne permet pas de consulter des données privées.`,
        featured: 10,
      },
      {
        title: 'Quels statuts mon colis peut-il avoir ?',
        description: `Dans l’ordre : ${stages}. Chaque changement est conservé dans l’historique du colis, dans ${link('/mi-cuenta', 'votre compte')}.`,
      },
    ],
  },
  {
    id: 'prohibidos',
    title: 'Articles restreints',
    items: [
      {
        title: 'Quels articles puis-je faire venir ?',
        description: `Cela dépend du type de marchandise, de ses composants et des règles de transport. Nous ne recevons ni ne transportons : ${inline(RESTRICTED_ITEMS.prohibited.items)}. Nous ne sommes pas encore autorisés à acheminer : ${inline(RESTRICTED_ITEMS.notYet.items)}. ${link('/articulos-prohibidos', 'Consultez les listes complètes')} et, si votre article n’y figure pas, demandez-nous avant de l’acheter.`,
        featured: 6,
      },
      {
        title: 'Puis-je faire venir des parfums ou des aérosols ?',
        description: `Oui, par bateau. Ne sont pas acceptés par avion : ${inline(RESTRICTED_ITEMS.seaOnly.items)}.`,
      },
      {
        title: 'Puis-je faire venir une voiture ou une moto ?',
        description: `Pas encore. Nous ne sommes toujours pas autorisés à acheminer : ${inline(RESTRICTED_ITEMS.notYet.items)}.`,
      },
    ],
  },
  {
    id: 'retiro',
    title: 'Retrait et livraison',
    items: [
      {
        title: 'Où retirer mon colis ?',
        description: `${sentence(`Dans nos agences de ${cities}, ${describeHours(hours)}`)} ${link('/sucursales', 'Voir les adresses et les horaires')}.`,
      },
      // One per branch outside the capital: people ask about their own city.
      ...BRANCHES.slice(1).map((branch) => ({
        title: `Faites-vous des envois à ${branch.city} ?`,
        description: `Oui : nous avons une agence de retrait à ${branch.city}, en plus de celle de ${BRANCHES[0].city}. ${link(`/sucursales#${branch.id}`, `Voir l’agence de ${branch.city}`)}.`,
      })),
      {
        title: 'Livrez-vous à domicile ?',
        description:
          'Nous livrons partout dans le pays, sous réserve de coordination et de couverture. La livraison à domicile entraîne des frais supplémentaires selon la destination et les conditions opérationnelles.',
        featured: 7,
      },
      {
        title: 'Une autre personne peut-elle retirer mon colis ?',
        description:
          'Oui. Prévenez-nous sur WhatsApp avant le retrait en indiquant le nom de la personne autorisée ; elle devra présenter sa pièce d’identité.',
      },
      {
        title: 'Combien de temps gardez-vous mon colis ?',
        description:
          'Nous vous recommandons de le retirer dès qu’il est disponible. Les colis qui ne sont pas retirés à temps peuvent entraîner des frais de stockage, selon nos conditions.',
      },
    ],
  },
];
