/**
 * What the pages and the components say, in French. Same shape as ./es.ts (`UI`): every entry of
 * the Spanish dictionary, translated. The customer is addressed as "vous".
 */
import { LOGIN_CODE_DIGITS, LOGIN_CODE_MINUTES, SESSION_DAYS } from '../../data/account.ts';
import { CONTACT, sentence } from '../../data/carinova.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, describeHours } from '../../data/fr/carinova.ts';
import { CONFIRM_LINK_HOURS } from '../../data/signup.ts';
import { CUBIC_CM_PER_CUBIC_FOOT, formatNumber, formatUSD } from '../../utils/rates.ts';
import type { UI } from './es.ts';
import { landing } from './landing/fr.ts';

// The facts the sentences below are written around, in this language.
const { air, sea } = RATES;
const cityNames = BRANCHES.map((branch) => branch.city);
const cities = cityNames;
/** The city Carinova was born in, as this language writes it. */
const bluefields = BRANCHES.find((branch) => branch.id === 'bluefields')?.city ?? 'Bluefields';
const [hours] = BRANCHES[0].hours;
/** The warehouse that receives packages today (the one that is open). */
const [warehouse] = RECEPTION_POINTS.filter((point) => point.available);
/** Whether every branch opens at the same times: then the hours can be said once. */
const sameHours = BRANCHES.every((branch) => JSON.stringify(branch.hours) === JSON.stringify(BRANCHES[0].hours));

export const ui: UI = {
  // components/carinova/AccountPanel.astro
  accountPanel: {
    loading: 'Ouverture de votre compte…',
    noscript: 'Pour voir votre compte, vous devez activer JavaScript dans votre navigateur.',
    eyebrow: 'Mon compte',
    idLabel: 'Votre Carinova ID',
    idNote: 'Gardez-le à portée de main quand vous nous écrivez ou retirez vos colis.',
    sections: 'Sections de votre compte',
    packagesIntro:
      'Ce que nous avons reçu à notre entrepôt et ce que nous avons déjà expédié, avec le statut de chacun.',
    filterLabel: 'Filtrer les colis',
    filters: { all: 'Tous', warehouse: 'À l’entrepôt', shipped: 'Expédiés', delivered: 'Livrés' },
    packagesEmpty:
      'Nous n’avons encore reçu aucun colis à votre nom. Quand le premier arrivera à notre entrepôt, vous le verrez ici, avec son statut.',
    packagesNone: 'Vous n’avez aucun colis dans ce groupe.',
    packagesAsk: 'Poser une question sur mes colis',
    history: 'Voir l’historique',
    packageAsk: 'Poser une question sur ce colis',
    paymentsIntro: 'Vos factures et les paiements que nous avons confirmés.',
    invoicesEmpty: 'Vous n’avez pas encore de facture. Quand nous émettrons la première, vous la verrez ici.',
    payments: 'Paiements',
    invoiceAsk: 'Payer cette facture ou poser une question',
    paymentsNote:
      'Pour payer ou nous signaler un paiement, écrivez-nous avec le numéro de la facture. Un paiement apparaît comme confirmé une fois que notre équipe l’a vérifié.',
    activityError: 'Nous n’avons pas pu charger vos colis et vos paiements.',
    retry: 'Réessayer',
    detailsTitle: 'Mes coordonnées',
    detailsIntro: 'Vous avez créé votre compte avec ces coordonnées.',
    name: 'Nom',
    email: 'E-mail',
    phone: 'Téléphone',
    address: 'Adresse',
    since: 'Client depuis',
    changed: 'Quelque chose a changé ?',
    update: 'Demander la mise à jour de mes coordonnées',
    nextTitle: 'Que voulez-vous faire ?',
    howItWorks: 'Voir comment ça marche',
    restricted: 'Voir ce qui peut entrer',
    signOut: 'Se déconnecter',
    signingOut: 'Déconnexion…',
    errorTitle: 'Nous n’avons pas pu ouvrir votre compte',
    errorText: 'Vérifiez votre connexion et réessayez. Si le problème persiste, écrivez-nous sur WhatsApp.',
    script: {
      hello: 'Bonjour, {name}',
      documentTitle: 'Mon compte {code} | Carinova',
      received: 'Reçu à l’entrepôt',
      warehouse: 'Entrepôt',
      weight: 'Poids',
      pounds: '{weight} lb',
      pieces: 'Pièces',
      pickup: 'Retrait à',
      delivery: 'Livraison',
      homeDelivery: 'À domicile',
      store: 'Magasin',
      carrier: 'Transporteur',
      issued: 'Émise le {date}',
      due: 'échéance le {date}',
      total: 'Total',
      paid: 'Payé',
      balance: 'Solde',
      forPackage: '{description} ({reference})',
      balanceDue: 'Solde à payer : {amount}',
      inReview: 'Paiements en vérification : {amount}',
      nothingDue: 'Vous n’avez aucun solde à payer.',
    },
  },

  // components/carinova/Branches.astro
  branches: {
    tagline: 'Agences',
    title: `Retirez vos colis à ${cities.join(' ou ')}`,
    directions: 'Itinéraire',
    branch: (city: string) => `(agence de ${city})`,
  },

  // components/carinova/BusinessForm.astro
  businessForm: {
    title: 'Parlez-nous de votre entreprise',
    intro: 'Remplissez ces informations et nous vous contacterons.',
    noscript:
      'Pour envoyer le formulaire, vous devez activer JavaScript dans votre navigateur. Vous pouvez aussi nous écrire sur WhatsApp.',
    company: 'Nom de l’entreprise',
    contactName: 'Votre nom',
    email: 'E-mail',
    phone: 'Téléphone',
    phoneHint: 'De préférence, le numéro que vous utilisez sur WhatsApp.',
    country: 'Pays',
    city: 'Ville',
    volume: 'Volume estimé',
    optional: '(facultatif)',
    choose: 'Choisissez une option',
    message: 'De quoi votre entreprise a-t-elle besoin ?',
    messageHint: 'Ce que vous faites venir, d’où et à quelle fréquence.',
    honeypot: 'Laissez ce champ vide',
    submit: 'Envoyer la demande',
    sending: 'Envoi…',
    sentTitle: 'Nous avons reçu votre demande',
    sentText:
      'Merci. Notre équipe va l’examiner et vous contactera à l’adresse e-mail ou au numéro de téléphone que vous nous avez donnés.',
    home: 'Retour à l’accueil',
    privacyNote: [
      'Lorsque vous l’envoyez, nous utilisons ces informations pour vous contacter, comme l’explique notre ',
      'Politique de confidentialité',
      '.',
    ],
    messages: {
      missing: 'Remplissez ce champ.',
      unavailable:
        'Le formulaire n’est pas disponible pour le moment. Écrivez-nous sur WhatsApp et nous nous occuperons de vous.',
      busy: 'Nous avons reçu trop de tentatives d’affilée. Attendez une minute et réessayez.',
      failed:
        'Nous n’avons pas pu envoyer votre demande. Vérifiez votre connexion et réessayez, ou écrivez-nous sur WhatsApp.',
      oneError: 'Il y a un champ à corriger.',
      manyErrors: 'Nombre de champs à corriger : {count}.',
    },
  },

  // components/carinova/QuoteCalculator.astro
  quoteCalculator: {
    title: 'Faites votre estimation',
    badge: 'Sans inscription',
    mode: 'Comment voulez-vous le faire venir ?',
    basis: 'Type de tarif',
    basisHint: 'Choisissez une seule base de calcul : le poids, le volume et le tarif à l’unité ne s’additionnent pas.',
    byWeight: 'Au poids (livre)',
    byVolume: 'Au volume (pied cube)',
    perUnit: (name: string) => `${name} (à l’unité)`,
    weightEach: 'Poids de chaque colis (lb)',
    packages: 'Nombre de colis',
    kilos: 'Vous l’avez en kilos ? 1 kg = 2.2 lb.',
    dimensions: ['Longueur', 'Largeur', 'Hauteur'],
    unit: 'Mesures en',
    units: { cm: 'Centimètres', pulg: 'Pouces' },
    pieces: 'Nombre de pièces',
    quantity: 'Nombre d’unités',
    estimate: 'Estimation du tarif de base',
    what: 'Que souhaitez-vous estimer ?',
    send: 'Envoyer mon estimation sur WhatsApp',
    reset: 'Réinitialiser',
    estimateNote: 'Calcul indicatif avec les tarifs de base en vigueur.',
    footnote:
      'Estimation indicative, pas un devis contractuel. Le total final dépend de la vérification du poids, des dimensions, du contenu, des tarifs applicables et des éventuels frais supplémentaires. Il n’inclut ni le coût des produits ni la livraison à domicile.',
    script: {
      delivery: 'Livraison estimée : {transit}, {from}.',
      explainWeight:
        'Poids de chaque colis multiplié par le nombre de colis, avec un minimum facturable de {minimum} lb par envoi. Le poids et la base applicable sont validés à la réception.',
      explainVolume:
        'Longueur × largeur × hauteur, converties en pieds cubes (1 pied = 30.48 cm = 12 pouces), sans minimum ni arrondi.',
      explainUnit: 'Tarif aérien à l’unité de l’article choisi. Le tarif à la livre ne s’y ajoute pas.',
      comparison: 'À titre de comparaison seulement : en envoi {mode}, le même poids coûterait {total} ({transit}).',
      check: 'Vérifiez les données',
      checkHint: 'Utilisez des valeurs supérieures à zéro.',
      needData: 'Saisissez le poids, les mesures ou la quantité pour voir l’estimation.',
      weightShipment: 'un envoi {mode} de {weight} lb',
      weightShipmentMany: 'un envoi {mode} de {count} colis de {weight} lb chacun',
      volumeShipment: 'un envoi {mode} de {count} pièce(s) de {measurements} {unit}',
      unitShipment: '{units} en envoi {mode}',
      unitCm: 'cm',
      unitIn: 'pouces',
      announce: 'Estimation : {total}',
    },
  },

  // components/carinova/RateCards.astro
  rateCards: {
    tagline: 'Tarifs',
    title: 'Deux voies. Une même destination.',
    subtitle:
      'Les tarifs incluent l’assurance et les taxes lorsqu’elles s’appliquent à l’envoi. Les délais courent à compter de la réception physique de votre colis.',
    cities: BRANCHES.map((branch) => branch.city).join(' et '),
    perPound: 'la livre',
    perCubicFoot: 'le pi³',
    airFacts: [
      'Pensé pour ce que vous voulez recevoir rapidement.',
      'Certains appareils électroniques ont un tarif fixe à l’unité.',
    ],
    seaFacts: [
      'Idéal pour les gros volumes et les achats planifiés.',
      'Le calcul au poids ou au volume est déterminé selon la marchandise, son emballage et les conditions du service.',
    ],
    calculate: (name: string) => `Calculer un envoi ${name.toLowerCase()}`,
    calculateUnits: 'Calculer à l’unité',
    electronicsNote: 'Tarif à l’unité pour les envois aériens. Il ne s’ajoute pas au tarif à la livre.',
    pickup: 'Retrait en agence :',
    homeDelivery: 'Livraison à domicile',
    howTitle: 'Comment nous calculons',
    howIntro: 'Une base de calcul à la fois : le poids, le volume et le tarif à l’unité ne s’additionnent pas.',
    byPound: {
      title: 'À la livre',
      applies: 'Aérien et maritime',
      rule: 'Poids en livres × tarif à la livre, sans minimum ni arrondi. Le poids est validé à la réception.',
    },
    byCubicFoot: {
      title: 'Au pied cube',
      applies: 'Maritime',
      rule: `Longueur × largeur × hauteur de la boîte ÷ 1,728 si vous mesurez en pouces, ou ÷ ${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)} si vous mesurez en centimètres = pieds cubes ; × ${formatUSD(sea.pricePerCubicFoot)}.`,
      link: 'Essayez-le dans le calculateur',
    },
    byUnit: {
      title: 'À l’unité',
      applies: 'Électronique, en aérien',
      rule: 'Quantité × tarif de l’appareil. Le tarif à la livre ne s’y ajoute pas.',
    },
  },

  // components/carinova/ServiceBadge.astro
  serviceBadge: { soon: 'Prochainement', extra: 'Frais supplémentaires' },

  // components/carinova/ShippingModes.astro
  shippingModes: {
    eyebrow: 'Envoi aérien et maritime vers le Nicaragua',
    title: ['Deux modes.', 'Une destination.'],
    intro:
      'Choisissez comment vous voulez le recevoir. Plus de rapidité quand vous en avez besoin, plus d’économies quand vous pouvez planifier. Comparez avant de décider.',
    air: {
      tag: 'Pour arriver plus tôt',
      overline: 'Envoi aérien',
      title: 'Quand le temps compte.',
      text: 'Idéal pour les achats et les colis que vous voulez recevoir rapidement.',
    },
    sea: {
      tag: 'Pour mieux planifier',
      overline: 'Envoi maritime',
      title: 'Plus d’espace pour vos projets.',
      text: 'Pour les achats planifiés et les chargements plus volumineux.',
    },
    baseRate: 'Tarif de base',
    perPound: '/lb',
    orPerCubicFoot: (price: string) => `ou ${price} le pied cube`,
    electronics: 'Électronique : tarif à l’unité',
    delivery: 'Livraison estimée',
    details: (name: string) => `Voir le détail de l’envoi ${name.toLowerCase()}`,
    important: 'Important :',
  },

  // components/carinova/SigninDialog.astro
  signinDialog: { label: 'Connectez-vous à votre compte', close: 'Fermer' },

  // components/carinova/SigninForm.astro
  signinForm: {
    title: 'Connectez-vous avec votre e-mail',
    intro: `Nous envoyons un code à ${LOGIN_CODE_DIGITS} chiffres à votre adresse e-mail. Pas besoin de mot de passe.`,
    noscript: 'Pour vous connecter, vous devez activer JavaScript dans votre navigateur.',
    email: 'E-mail',
    emailHint: 'L’adresse e-mail avec laquelle vous avez créé votre compte.',
    send: 'M’envoyer un code',
    sending: 'Envoi…',
    noAccount: 'Vous n’avez pas encore de compte ?',
    codeTitle: 'Saisissez votre code',
    codeSent: [
      'Si l’adresse ',
      ` correspond à un compte, nous y avons envoyé un code à ${LOGIN_CODE_DIGITS} chiffres. Il expire dans ${LOGIN_CODE_MINUTES} minutes.`,
    ],
    code: `Code à ${LOGIN_CODE_DIGITS} chiffres`,
    enter: CTA.signin.text,
    entering: 'Connexion…',
    notes: [
      'Il peut mettre quelques minutes à arriver. Si vous ne le voyez pas, vérifiez votre dossier de spam ou de courrier indésirable.',
      'Nous ne vous demanderons jamais ce code sur WhatsApp ni par téléphone.',
    ],
    notArriving: 'S’il n’arrive pas, cette adresse e-mail n’a peut-être pas de compte.',
    openYours: 'Créez le vôtre',
    resend: 'Envoyer un autre code',
    change: 'Utiliser une autre adresse e-mail',
    signedIn: 'Votre session est déjà ouverte sur ce navigateur.',
    messages: {
      emailMissing: 'Saisissez votre adresse e-mail.',
      codeMissing: `Saisissez le code à ${LOGIN_CODE_DIGITS} chiffres.`,
      codeInvalid: 'Le code est incorrect ou a expiré. Vérifiez-le ou demandez-en un autre.',
      resendIn: 'Envoyer un autre code ({seconds} s)',
      resent:
        'C’est fait : si cette adresse e-mail correspond à un compte, nous y avons envoyé un autre code. Le précédent ne fonctionne plus.',
      unavailable: 'La connexion n’est pas disponible pour le moment. Écrivez-nous sur WhatsApp et nous vous aiderons.',
      busy: 'Nous avons reçu trop de tentatives d’affilée. Attendez une minute et réessayez.',
      failed: 'Nous n’avons pas pu nous connecter. Vérifiez votre connexion et réessayez.',
    },
  },

  // components/carinova/SignupConfirm.astro
  signupConfirm: {
    readyTitle: 'Confirmez votre e-mail',
    readyText:
      'Encore une étape : confirmez votre e-mail pour créer votre compte et voir votre Carinova ID et votre adresse aux États-Unis.',
    confirm: 'Confirmer et créer mon compte',
    confirming: 'Création de votre compte…',
    noscript: 'Pour confirmer votre e-mail, vous devez activer JavaScript dans votre navigateur.',
    doneTitle: 'Votre compte est prêt !',
    doneIntro: 'Voici votre Carinova ID. Conservez-le : c’est avec lui que nous identifions votre compte.',
    emailed: 'Nous vous avons aussi envoyé ces informations par e-mail.',
    beforeTitle: 'Avant d’acheter',
    beforeText: 'Vérifiez ce que nous ne pouvons pas acheminer.',
    nextTitle: 'Et maintenant ?',
    nextText: 'Estimez votre premier envoi ou découvrez comment ça marche, avec des exemples.',
    howToBuy: 'Voir comment ça marche',
    signedIn:
      'Votre session est ouverte sur ce navigateur : vous retrouvez toujours dans votre compte votre Carinova ID, votre adresse, vos colis et vos paiements.',
    signedOut: 'Pour voir ces informations quand vous le souhaitez, connectez-vous à votre compte avec votre e-mail.',
    invalidTitle: 'Ce lien n’est pas valide',
    invalidText:
      'Il est peut-être incomplet. Ouvrez-le à nouveau depuis l’e-mail que nous vous avons envoyé, ou inscrivez-vous de nouveau.',
    expiredTitle: 'Ce lien a expiré',
    expiredText: `Les liens de confirmation sont valables ${CONFIRM_LINK_HOURS} heures. Inscrivez-vous de nouveau et nous vous en enverrons un autre.`,
    signupAgain: 'M’inscrire de nouveau',
    errorTitle: 'Nous n’avons pas pu créer votre compte',
    errorText:
      'Le problème vient de chez nous, pas de vous. Réessayez et, si le problème persiste, écrivez-nous sur WhatsApp.',
    retry: 'Réessayer',
    retrying: 'Nouvelle tentative…',
    existingTitle: 'Vous avez déjà un compte',
    existingIntro: 'Cette adresse e-mail a déjà un compte Carinova. Voici votre Carinova ID :',
    documentTitle: 'Votre compte {code} | Carinova',
  },

  // components/carinova/SignupForm.astro
  signupForm: {
    signedIn: 'Votre compte est déjà ouvert sur ce navigateur.',
    title: 'Vos coordonnées',
    intro: 'Cela ne prend que quelques minutes.',
    noscript:
      'Pour vous inscrire en ligne, vous devez activer JavaScript dans votre navigateur. Vous pouvez aussi créer votre compte par WhatsApp.',
    country: 'Pays',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'E-mail',
    emailHint: 'Nous vous enverrons un lien pour confirmer votre compte.',
    phone: 'Téléphone',
    phoneHint: 'De préférence, le numéro que vous utilisez sur WhatsApp.',
    address1: 'Adresse',
    address2: 'Complément d’adresse',
    optional: '(facultatif)',
    city: 'Ville',
    choose: 'Choisissez une option',
    postalCode: 'Code postal',
    honeypot: 'Laissez ce champ vide',
    sending: 'Envoi…',
    afterSubmit: 'Après l’envoi, nous vous adressons un e-mail pour confirmer votre compte.',
    accept: ['J’accepte les ', 'Conditions générales', ' et la ', 'Politique de confidentialité', '.'],
    sentTitle: 'Consultez votre boîte e-mail',
    sentTo: [
      'Nous avons envoyé un lien à ',
      '. Ouvrez-le pour confirmer votre compte et recevoir votre Carinova ID et votre adresse aux États-Unis.',
    ],
    sentNotes: [
      'Il peut mettre quelques minutes à arriver.',
      'Si vous ne le voyez pas, vérifiez votre dossier de spam ou de courrier indésirable.',
      `Le lien expire dans ${CONFIRM_LINK_HOURS} heures.`,
    ],
    edit: 'Adresse e-mail erronée ? Corrigez-la',
    messages: {
      missing: 'Remplissez ce champ.',
      terms: 'Pour continuer, acceptez les conditions générales et la politique de confidentialité.',
      unavailable:
        'L’inscription en ligne n’est pas disponible pour le moment. Écrivez-nous sur WhatsApp et nous créerons votre compte.',
      busy: 'Nous avons reçu trop de tentatives d’affilée. Attendez une minute et réessayez.',
      failed:
        'Nous n’avons pas pu envoyer votre inscription. Vérifiez votre connexion et réessayez, ou écrivez-nous sur WhatsApp.',
      oneError: 'Il y a un champ à corriger.',
      manyErrors: 'Nombre de champs à corriger : {count}.',
    },
  },

  // components/carinova/TopStrip.astro
  topStrip: {
    connect: 'Nous relions',
    usa: 'les États-Unis',
    with: 'au',
    nicaragua: 'Nicaragua',
    soon: 'prochainement',
    to: 'vers',
  },

  // components/carinova/UsAddressCard.astro
  usAddressCard: {
    title: 'Votre adresse aux États-Unis',
    intro: 'Utilisez-la comme adresse de livraison quand vous achetez dans des magasins aux États-Unis.',
    warehouse: 'Entrepôt',
    soonTitle: (city: string) => `${city} : prochainement`,
    soonText: (city: string, state: string) =>
      `Bientôt, vous pourrez aussi recevoir vos achats à ${city}, ${state}. Quand l’entrepôt sera ouvert, son adresse apparaîtra ici.`,
    meanwhile: (city: string) => `En attendant, utilisez votre adresse de ${city}.`,
  },

  // components/carinova/WhatsAppFloat.astro
  whatsAppFloat: { whichBranch: 'Quelle agence ?', label: 'Écrivez-nous' },

  // components/widgets/Header.astro
  header: { navigation: 'Navigation principale', menu: 'Menu' },

  // pages/404.astro
  notFoundPage: {
    metaTitle: 'Page introuvable',
    title: 'Nous n’avons pas trouvé cette page',
    lead: 'Vous cherchiez autre chose ?',
    text: [
      'Le lien est peut-être mal écrit, ou la page n’existe plus. Essayez depuis la ',
      'page d’accueil',
      ' ou continuez ce que vous vouliez faire :',
    ],
  },

  // pages/articulos-prohibidos.astro
  restrictedPage: {
    tagline: 'Articles interdits et restreints',
    title: 'Votre article peut-il entrer au Nicaragua ?',
    metaTitle: 'Articles interdits : ce qu’on ne peut pas envoyer au Nicaragua',
    description:
      'Ce que Carinova ne peut pas acheminer des États-Unis vers le Nicaragua : les articles interdits, ceux que nous ne sommes pas encore autorisés à acheminer et les produits qui ne voyagent pas par avion mais bien par bateau. Vérifiez avant d’acheter.',
    subtitle:
      'Certains articles, nous ne les recevons ni ne les transportons ; d’autres, nous ne sommes pas encore autorisés à les acheminer ; d’autres encore ne voyagent que par voie maritime. Consultez les listes avant d’acheter ou d’envoyer.',
    closing: {
      title: 'Vous avez un doute sur un produit ?',
      subtitle: 'Demandez-nous avant de l’acheter et nous vous dirons si nous pouvons l’acheminer.',
      lead: 'Envoyez-nous le produit :',
    },
  },

  // pages/como-comprar.astro
  howToBuyPage: {
    tagline: 'Comment ça marche',
    title: 'Comment acheter aux États-Unis depuis le Nicaragua',
    description:
      'Pas à pas pour acheter dans des magasins aux États-Unis et recevoir au Nicaragua, avec des exemples de ce que coûte l’envoi de vêtements, de téléphones, d’ordinateurs portables, d’articles pour la maison, de meubles et de colis familiaux.',
    subtitle:
      'Trois étapes claires, de votre premier achat jusqu’à votre colis au Nicaragua, et des exemples de ce que coûte l’envoi de vêtements, de téléphones, d’ordinateurs portables, d’articles pour la maison, de meubles et de colis familiaux.',
    steps: 'Les étapes',
    examples: {
      tagline: 'Exemples par catégorie',
      title: 'Combien coûte l’envoi de… ?',
      subtitle:
        'Six exemples d’achats, calculés avec nos tarifs. Ouvrez celui de votre choix dans le calculateur et remplacez les données par celles de votre achat.',
      open: 'Ouvrir dans le calculateur',
    },
    closing: {
      title: 'Commencez par créer votre compte',
      subtitle:
        'Avec votre Carinova ID et votre adresse aux États-Unis, vous pouvez déjà acheter dans n’importe quel magasin.',
      lead: 'Voulez-vous que nous vous guidions pour votre premier achat ?',
    },
    total: 'Total',
  },

  // pages/cotizador.astro
  quotePage: {
    tagline: 'Tarifs et calculateur',
    metaTitle: 'Combien coûte l’envoi d’un colis au Nicaragua : tarifs et calculateur',
    description: `Combien coûte l’envoi d’un colis des États-Unis au Nicaragua : en aérien ${formatUSD(air.pricePerLb)} la livre, en maritime ${formatUSD(sea.pricePerLb)} la livre ou ${formatUSD(sea.pricePerCubicFoot)} le pi³, et l’électronique à un tarif à l’unité. Calculez-le sans vous inscrire.`,
    title: 'Combien coûte l’envoi d’un colis au Nicaragua ?',
    subtitle:
      'Faites une estimation en quelques secondes : calculez ce que coûte l’envoi de votre achat ou de votre colis depuis les États-Unis, sans vous inscrire.',
    closing: {
      title: 'Vous savez maintenant combien ça coûte ?',
      subtitle:
        'Créez votre compte et recevez votre Carinova ID et votre adresse aux États-Unis pour commencer à acheter.',
      lead: 'Votre envoi est particulier ?',
    },
  },

  // pages/empresas.astro
  businessPage: {
    tagline: 'Carinova pour les entreprises',
    metaTitle: 'Fret et envois pour les entreprises des États-Unis vers le Nicaragua',
    description:
      'Solutions logistiques des États-Unis vers le Nicaragua pour les entreprises : importation et approvisionnement, envois récurrents et service aux entreprises, par voie aérienne ou maritime. Dites-nous ce dont vous avez besoin.',
    title: 'Vos opérations méritent elles aussi de mieux circuler.',
    subtitle:
      'Du premier approvisionnement jusqu’à la croissance de votre entreprise, nous étudions des solutions logistiques adaptées aux caractéristiques de votre marchandise.',
    offers: 'Ce que nous étudions avec votre entreprise',
    also: 'Et ce dont vous bénéficiez comme tout client',
    benefits: [
      {
        icon: 'tabler:packages',
        title: 'Fret aérien et maritime',
        text: `Aérien à ${formatUSD(air.pricePerLb)} la livre, en ${air.transit}. Maritime à ${formatUSD(sea.pricePerLb)} la livre ou ${formatUSD(sea.pricePerCubicFoot)} le pied cube, en ${sea.transit}.`,
      },
      {
        icon: 'tabler:id-badge-2',
        title: 'Un Carinova ID pour votre entreprise',
        text: `Le même ID pour tous les envois de votre entreprise, avec retrait à ${cityNames.join(' ou ')}.`,
      },
    ],
    quote: 'Estimer un envoi',
    next: 'Et ensuite ?',
    steps: [
      { title: 'Nous recevons votre demande', description: 'Elle arrive directement à notre équipe.' },
      {
        title: 'Nous vous contactons',
        description: 'Par e-mail ou sur WhatsApp, pour connaître les besoins de votre entreprise.',
      },
      {
        title: 'Nous ouvrons le compte de votre entreprise',
        description: 'Avec son Carinova ID et son adresse à Miami, prêt à recevoir.',
      },
    ],
    helpTitle: 'Vous préférez nous écrire ?',
    helpText: 'Nous ouvrons aussi le compte de votre entreprise par WhatsApp.',
    helpLink: 'Ouvrir le compte de mon entreprise',
    closing: {
      title: 'Vous voulez savoir combien coûte l’envoi de votre marchandise ?',
      subtitle: 'Faites une estimation à la livre ou au pied cube en quelques secondes.',
      lead: 'Vous préférez parler à un conseiller ?',
    },
  },

  // pages/index.astro
  homePage: {
    service: 'Envois des États-Unis vers le Nicaragua',
    title: `Envois des États-Unis vers le Nicaragua | Adresse aux États-Unis à ${warehouse.city} | Carinova`,
    description: `Envois des États-Unis vers le Nicaragua avec votre propre adresse aux États-Unis à ${warehouse.city} : par avion en ${air.transit} à ${formatUSD(air.pricePerLb)} la livre et par bateau en ${sea.transit} à partir de ${formatUSD(sea.pricePerLb)}. Retrait à ${cityNames.join(' ou ')}.`,
  },

  // pages/ingresar.astro
  signinPage: {
    tagline: 'Mon compte',
    metaTitle: 'Connexion à mon compte',
    description:
      'Connectez-vous à votre compte Carinova avec votre e-mail : nous vous envoyons un code et vous entrez sans mot de passe. Vous y trouvez votre Carinova ID, votre adresse aux États-Unis, vos colis et vos paiements.',
    title: 'Connectez-vous à votre compte',
    subtitle: 'Gérez tout depuis un seul endroit : votre Carinova ID, votre adresse, vos colis et vos paiements.',
    howTitle: 'Comment ça marche',
    how: [
      {
        icon: 'tabler:mail',
        title: 'Sans mot de passe',
        text: 'Rien à retenir et rien à voler : à chaque connexion, nous envoyons un nouveau code à votre adresse e-mail.',
      },
      {
        icon: 'tabler:clock',
        title: 'Un code à usage unique',
        text: `Il ne fonctionne qu’une seule fois et expire au bout de ${LOGIN_CODE_MINUTES} minutes.`,
      },
      {
        icon: 'tabler:shield-lock',
        title: 'Votre session, sur ce navigateur',
        text: `Votre session reste ouverte ${SESSION_DAYS} jours ou jusqu’à ce que vous vous déconnectiez. Sur un appareil partagé, déconnectez-vous en terminant.`,
      },
    ],
    helpTitle: 'Vous n’arrivez pas à vous connecter ?',
    helpText: 'Écrivez-nous avec votre Carinova ID ou avec l’adresse e-mail de votre compte.',
  },

  // pages/mi-cuenta.astro
  accountPage: {
    tagline: 'Mon compte',
    metaTitle: 'Mon compte : Carinova ID, colis et paiements',
    description: `Connectez-vous à votre compte Carinova : votre Carinova ID, votre adresse aux États-Unis, vos colis avec leur statut et vos paiements. Retrait à ${cityNames.join(' ou ')}.`,
    title: 'Votre compte Carinova',
    subtitle: 'Gérez tout depuis un seul endroit : votre Carinova ID, votre adresse, vos colis et vos paiements.',
    signin: 'Connectez-vous à votre compte',
    noAccount: 'Vous n’avez pas encore de compte ?',
    includes: 'Ce que vous trouvez dans votre compte',
    looksLike: 'Il ressemble à ceci',
    idFacts: [
      'Le système vous l’attribue quand vous confirmez votre e-mail.',
      'C’est le même pour l’aérien, le maritime, les colis et les achats assistés.',
    ],
    company: 'Vous êtes une entreprise ?',
    companyLink: 'Découvrir Carinova pour les entreprises',
    fullAddress: 'Vous voyez l’adresse complète en vous connectant.',
    stages: 'Chaque colis, avec son étape :',
    paymentFacts: [
      'Chaque facture avec son montant et son statut.',
      'Un paiement apparaît comme confirmé une fois que notre équipe l’a vérifié.',
    ],
    pickup: 'Vous retirez vos colis à',
    homeDelivery: 'Livraison à domicile',
    branches: 'Voir les agences',
    closing: {
      title: 'Créez votre compte en quelques minutes',
      subtitle:
        'Vous remplissez un court formulaire, vous confirmez votre e-mail et c’est tout : vous avez votre Carinova ID.',
      lead: 'Des questions avant de vous inscrire ?',
    },
  },

  // pages/nosotros.astro
  aboutPage: {
    tagline: 'À propos',
    metaTitle: 'À propos : qui nous sommes et d’où nous venons',
    description: `Carinova est une entreprise nicaraguayenne d’envois des États-Unis vers le Nicaragua, née à ${bluefields}. Découvrez nos racines, ce que nous faisons et où nous trouver à ${cityNames.join(' et ')}.`,
    title: `Nous sommes Carinova, le transporteur né à ${bluefields}`,
    subtitle: `Une entreprise nicaraguayenne qui achemine vos achats, les colis de votre famille et le fret de votre entreprise depuis les États-Unis, avec des agences à ${cityNames.join(' et ')}.`,
    roots: {
      title: 'Nos racines',
      text: 'Carinova est née à Bluefields, sur la côte caraïbe sud du Nicaragua. La chaleur, l’engagement et la force de notre terre multiculturelle font partie de notre ADN, et nous travaillons chaque jour pour réduire les distances et livrer vos colis avec la confiance et l’attention qui nous caractérisent.',
      emblemAlt: 'Emblème de Carinova : trois figures portent une flamme à l’intérieur d’un cercle',
    },
    whatTagline: 'Ce que nous faisons',
    whatTitle: 'Nous rapprochons les magasins des États-Unis du Nicaragua',
    what: `Avec votre compte, vous recevez votre Carinova ID et une adresse à ${warehouse.city} pour acheter dans n’importe quel magasin. Nous y recevons vos colis, nous les acheminons par avion ou par bateau et vous les retirez à ${cityNames.join(' ou ')}.`,
    servicesLink: 'Voir les services en détail',
    factsTagline: 'En quelques mots',
    factsTitle: 'Carinova en bref',
    facts: {
      origin: 'Nous sommes nés à',
      originValue: `${bluefields}, côte caraïbe sud du Nicaragua`,
      route: 'Notre trajet',
      routeValue: 'Des États-Unis au Nicaragua',
      reception: 'Nous recevons vos achats à',
      branches: 'Agences au Nicaragua',
      transport: 'Comment voyagent vos colis',
      contact: 'Assistance sur WhatsApp',
      networks: 'Suivez-nous sur',
    },
    valuesTagline: 'Nos valeurs',
    valuesTitle: 'Ce qui nous anime',
    values: [
      {
        title: 'Travail d’équipe',
        description:
          'Comme dans notre emblème : trois figures qui portent ensemble la même flamme. Chaque envoi est un travail d’équipe, de Miami jusqu’à votre agence.',
      },
      {
        title: 'Portée internationale',
        description:
          'Le cercle qui les entoure est le pont que nous traversons chaque jour entre les États-Unis et le Nicaragua.',
      },
      {
        title: 'Engagement',
        description: 'La flamme est notre promesse : prendre soin de chaque colis comme s’il était le nôtre.',
      },
    ],
    where: 'Où nous trouver',
    reviewsTagline: 'Avis',
    reviewsTitle: 'Ce que disent nos clients',
    faqTitle: 'Questions sur Carinova',
    faq: [
      {
        title: 'Qu’est-ce que Carinova ?',
        description:
          'Carinova est une entreprise nicaraguayenne d’envois. Nous acheminons des achats personnels, des colis familiaux et du fret d’entreprise des États-Unis au Nicaragua, par avion ou par bateau.',
      },
      {
        title: 'D’où vient Carinova ?',
        description: `Carinova est née à ${bluefields}, sur la côte caraïbe sud du Nicaragua, et compte aujourd’hui des agences à ${cityNames.join(' et ')}.`,
      },
      {
        title: 'Où se trouvent les agences de Carinova et quels sont leurs horaires ?',
        description: sentence(`À ${cityNames.join(' et ')}. Nous sommes ouverts ${describeHours(hours)}`),
      },
      {
        title: 'D’où Carinova achemine-t-elle les colis ?',
        description: `Nous les recevons dans notre entrepôt de ${warehouse.city}, ${warehouse.state}, et nous les acheminons au Nicaragua par avion en ${air.transit} ou par bateau en ${sea.transit}, à compter de l’arrivée du colis à l’entrepôt.`,
      },
      {
        title: 'Comment contacter Carinova ?',
        description: `Sur WhatsApp, au <span dir="ltr">${CONTACT.whatsappDisplay}</span>, ou dans l’une de nos agences.`,
      },
      {
        title: 'Où lire des avis de clients de Carinova ?',
        description:
          'La page des avis de ce site réunit ceux que nos clients ont publiés, tels qu’ils les ont écrits et avec le lien vers l’endroit où chacun a été publié.',
      },
    ],
    careers: {
      title: 'Rejoignez notre équipe.',
      text: 'Nous recherchons des personnes engagées pour le service et l’excellence opérationnelle.',
      link: 'Découvrir comment postuler',
    },
    closing: {
      title: 'Faisons votre premier envoi',
      subtitle: 'Créez votre compte en ligne ou estimez votre envoi avant d’acheter.',
      lead: 'Vous voulez mieux nous connaître ?',
    },
  },

  // What a review's card says (the reviews themselves are never translated)
  reviews: {
    recommends: 'Recommande Carinova',
    rating: 'Note de {rating} sur 5',
    seeOn: 'Voir sur {source}',
    allOn: 'Tous les avis sur {source}',
    readAll: 'Lire l’avis en entier',
    seeAll: 'Voir tous les avis',
    moreTitle: 'Il y a d’autres avis',
    moreText: 'Lisez tout ce que nos clients racontent de leurs envois.',
    previous: 'Avis précédents',
    next: 'Avis suivants',
  },

  // pages/opiniones.astro
  reviewsPage: {
    tagline: 'Avis',
    metaTitle: 'Avis des clients',
    description:
      'Des avis réels de clients de Carinova sur leurs envois des États-Unis vers le Nicaragua, tels qu’ils les ont publiés sur {sources}. Lisez-les avant votre premier envoi.',
    title: 'Ce que disent les clients de Carinova',
    subtitle:
      'Des avis réels de personnes qui ont déjà fait venir leurs achats des États-Unis au Nicaragua avec nous, tels qu’ils les ont publiés sur {sources}.',
    listTitle: 'Les avis de nos clients',
    filterLabel: 'Afficher les avis de',
    all: 'Tous',
    howTitle: 'Comment nous présentons les avis',
    how: [
      {
        title: 'Publiés par leurs auteurs',
        text: 'Chaque avis a été publié par son auteur, sous son nom, sur {sources}.',
      },
      {
        title: 'Pas un mot changé',
        text: 'Nous les reprenons tels qu’ils ont été écrits et dans leur langue d’origine, sans les corriger ni les traduire.',
      },
      {
        title: 'Avec le lien vers la source',
        text: 'Chacun mène à la page de Carinova où il a été publié. Ils y sont tous, les plus récents aussi.',
      },
    ],
    writeTitle: 'Vous avez déjà reçu votre colis ? Racontez-nous',
    writeText: 'Votre avis aide d’autres personnes à se décider et nous aide à nous améliorer.',
    writeOn: 'Donner mon avis sur {source}',
    nextTitle: 'Avant votre premier envoi',
    next: {
      how: 'Voir comment ça marche, étape par étape',
      quote: 'Calculer le prix de votre envoi',
      branches: 'Voir où retirer votre colis',
      about: 'Découvrir qui nous sommes',
    },
    closing: {
      title: 'Faites votre premier envoi avec Carinova',
      subtitle: 'Créez votre compte en ligne et recevez votre Carinova ID et votre adresse aux États-Unis.',
      lead: 'Une question avant de commencer ?',
    },
  },

  // pages/preguntas-frecuentes.astro
  faqPage: {
    tagline: 'Aide',
    title: 'Questions fréquentes sur les envois vers le Nicaragua',
    description:
      'Adresse aux États-Unis et Carinova ID, services, tarifs, délais, articles restreints et retrait : les réponses aux questions les plus courantes sur les envois des États-Unis vers le Nicaragua avec Carinova.',
    subtitle: 'Tout sur votre compte, les services, les tarifs, les délais de livraison et le retrait de vos colis.',
    topics: 'Thèmes',
    closing: {
      title: 'Vous n’avez pas trouvé votre réponse ?',
      subtitle: 'Écrivez-nous et nous vous aiderons, ou commencez par créer votre compte.',
      lead: 'Posez-nous votre question :',
    },
  },

  // pages/registro.astro
  signupPage: {
    tagline: 'Mon compte',
    title: 'Créez votre compte',
    description: `Créez votre compte en ligne et obtenez votre Carinova ID et votre adresse aux États-Unis à ${warehouse.city}, pour acheter dans n’importe quel magasin et recevoir à ${cityNames.join(' ou ')}.`,
    subtitle:
      'Une seule inscription. Quand vous confirmez votre e-mail, le système vous attribue automatiquement votre Carinova ID et vous montre votre adresse aux États-Unis.',
    existing: 'Vous avez déjà un compte ?',
    next: 'Et ensuite ?',
    steps: [
      {
        title: 'Confirmez votre e-mail',
        description: 'Nous vous envoyons un lien. Ouvrez-le pour activer votre compte.',
      },
      {
        title: 'Recevez votre Carinova ID et votre adresse aux États-Unis',
        description: 'Vous les voyez à l’écran en confirmant, et vous les recevez aussi par e-mail.',
      },
      {
        title: 'Achetez, nous l’acheminons',
        description: `Utilisez votre adresse sur le site du magasin, suivez votre colis dans votre compte et retirez-le à ${cityNames.join(' ou ')}.`,
      },
    ],
    helpTitle: 'Vous préférez que nous vous aidions ?',
    helpText: 'Écrivez-nous et nous créerons votre compte par WhatsApp.',
  },

  // pages/servicios.astro
  servicesPage: {
    tagline: 'Services',
    metaTitle: 'Envois aériens et maritimes vers le Nicaragua, colis et achats assistés',
    description:
      'Envois aériens et maritimes des États-Unis vers le Nicaragua, colis, achats assistés, retrait en agence et livraison à domicile. Choisissez comment voyage votre colis et comment vous le recevez.',
    title: 'Envois aériens et maritimes des États-Unis vers le Nicaragua',
    subtitle: 'Chaque envoi combine trois choix : comment il voyage, qui fait l’achat et comment vous le recevez.',
    kinds: 'Types de service',
    closing: {
      title: 'Vous ne savez pas ce qui vous convient ?',
      subtitle:
        'Estimez votre envoi et comparez l’aérien et le maritime, ou créez votre compte et commencez à acheter.',
      lead: 'Vous voulez nos conseils ?',
    },
  },

  // pages/sucursales.astro
  branchesPage: {
    tagline: 'Agences',
    title: `Agences à ${cityNames.join(' et ')}`,
    description: `Adresses, horaires et WhatsApp de Carinova à ${cityNames.join(' et ')}.${sameHours ? ` ${sentence(`Nous sommes ouverts ${describeHours(hours)}`)}` : ''}`,
    subtitle: sameHours
      ? sentence(`Pour l’instant, vous retirez vos colis à ${cityNames.join(' et ')}, ${describeHours(hours)}`)
      : `Pour l’instant, vous retirez vos colis à ${cityNames.join(' et ')}.`,
    closing: {
      title: 'Votre prochain achat, prêt à être retiré',
      subtitle: 'Créez votre compte et estimez votre envoi avant d’acheter.',
      lead: 'Vous ne savez pas dans quelle agence retirer votre colis ?',
    },
  },

  // components/carinova/Tracker.astro and TrackingSection.astro
  tracker: {
    switchLabel: 'Que voulez-vous vérifier ?',
    tabs: { track: 'Suivre un colis', check: 'Peut-il entrer ?' },
    track: {
      title: 'Suivez votre colis',
      visitor:
        'Connectez-vous à votre compte pour voir vos colis : ce que nous avons reçu à l’entrepôt, ce qui est en route et ce que vous pouvez déjà retirer.',
      signin: 'Connectez-vous pour voir vos colis',
      noAccount: 'Vous n’avez pas encore de compte ?',
      customer: 'Saisissez la référence de votre colis, ou laissez le champ vide pour voir ceux qui sont en route.',
      label: 'Référence du colis ou numéro de suivi',
      placeholder: 'Ex. : PKG-000123',
      submit: 'Suivre',
      all: 'Voir tous mes colis et paiements',
      privacy: 'Par sécurité, le Carinova ID à lui seul ne permet pas de consulter des données privées.',
    },
    check: {
      title: 'Votre article peut-il entrer au Nicaragua ?',
      intro:
        'Cherchez l’article que vous voulez faire venir. Le résultat est une première indication, pas une autorisation d’importation ni de transport.',
      label: 'Que voulez-vous faire venir ?',
      placeholder: 'Ex. : ordinateur portable, parfum, chaussures…',
      examples: 'Essayez :',
      lists: 'Voir les listes complètes',
      ask: 'Demander sur WhatsApp',
      note: 'Cela ne remplace ni le contrôle douanier, ni les autorisations, ni la confirmation de Carinova.',
      script: {
        idleTitle: 'Renseignez-vous avant d’acheter.',
        idleText: 'Écrivez le nom de l’article pour obtenir une indication.',
        unknownTitle: 'Il ne figure pas sur nos listes',
        unknownText:
          'Cela ne veut pas dire qu’il peut entrer : certains articles nécessitent des autorisations ou une vérification. Demandez-nous avant de l’acheter.',
      },
    },
  },

  // components/widgets/Footer.astro
  footer: {
    channelsEyebrow: 'Nous sommes en ligne',
    channelsTitle: 'Suivez-nous et écrivez-nous',
    previous: 'Canaux précédents',
    next: 'Plus de canaux',
    email: 'E-mail',
    languages: 'Langues',
  },

  // src/navigation.ts and the layouts: the header, the footer and the trail of a page
  nav: {
    home: 'Accueil',
    services: 'Services',
    shopper: 'Achat assisté',
    rates: 'Tarifs',
    calculator: 'Calculateur',
    howItWorks: 'Fonctionnement',
    business: 'Entreprises',
    help: 'Aide',
    explore: 'Explorer',
    yours: 'Votre Carinova',
    near: 'Tout près de vous',
    canItEnter: 'Peut-il entrer ?',
    tracking: 'Suivi',
    faq: 'Questions fréquentes',
    about: 'À propos',
    reviews: 'Avis',
    terms: 'Conditions du service',
    privacy: 'Confidentialité',
    and: ' et ',
    or: ' ou ',
    brand:
      'Des envois qui nous unissent. Nous rapprochons vos achats, votre famille et les projets de votre entreprise.',
    route: ['États-Unis', 'Nicaragua'],
    rights: 'Tous droits réservés. Tarifs et délais sous réserve de vérification.',
    language: 'Langue',
    languageChoose: 'Choisissez votre langue',
    locker: `Votre adresse à ${warehouse.city}`,
    stores: 'Magasins',
  },

  // components/common/Metadata.astro: what a page without its own title or description says
  meta: {
    title: `Envois des États-Unis vers le Nicaragua | Adresse aux États-Unis à ${warehouse.city} | Carinova`,
    description: `Envois des États-Unis vers le Nicaragua avec votre propre adresse aux États-Unis à ${warehouse.city}, par avion ou par bateau. Créez votre compte en ligne et retirez vos colis à ${cityNames.join(' ou ')}.`,
  },

  // The statuses of packages, invoices and payments (src/data/account.ts), by their id
  statuses: {
    package: {
      received: { name: 'Reçu à l’entrepôt', text: 'Réception physique aux États-Unis' },
      processing: { name: 'En préparation', text: 'Tri et coordination' },
      in_transit: { name: 'En transit', text: 'En route vers le Nicaragua' },
      ready: { name: 'Disponible pour la livraison', text: 'Retrait ou livraison organisée' },
      delivered: { name: 'Livré', text: 'Vous l’avez reçu' },
      returned: { name: 'Retourné', text: 'Retourné à l’expéditeur' },
      cancelled: { name: 'Annulé', text: 'L’envoi a été annulé' },
    },
    invoice: {
      unpaid: { name: 'En attente de paiement', text: 'Nous n’avons pas encore enregistré de paiement' },
      in_review: { name: 'Paiement en vérification', text: 'Nous avons reçu votre paiement et le confirmons' },
      partial: { name: 'Paiement partiel', text: 'Nous avons confirmé une partie du montant' },
      paid: { name: 'Payée', text: 'Nous avons confirmé votre paiement' },
      void: { name: 'Annulée', text: 'Cette facture ne s’applique plus' },
    },
    payment: {
      pending: { name: 'En vérification', text: 'Nous sommes en train de le confirmer' },
      confirmed: { name: 'Confirmé', text: 'Nous l’avons reçu' },
      rejected: { name: 'Refusé', text: 'Nous n’avons pas pu le confirmer' },
    },
    paymentMethod: {
      cash: 'Espèces',
      bank_transfer: 'Virement bancaire',
      card: 'Carte',
      other: 'Autre moyen',
    },
  },

  // What Carinova explores with a company and the options of its form (src/data/business.ts), by their id
  business: {
    solutions: {
      importacion: {
        title: 'Importation et approvisionnement',
        text: 'Examen du type de marchandise, du mode de transport, du poids, du volume et des documents exigés avant d’établir un devis.',
      },
      recurrentes: {
        title: 'Envois récurrents',
        text: 'Évaluation commerciale de la fréquence, de la consolidation possible et des besoins d’approvisionnement, sous réserve de faisabilité.',
      },
      corporativa: {
        title: 'Service aux entreprises',
        text: 'Définition de la portée, de la traçabilité requise, de la couverture et des conditions de service selon l’opération.',
      },
    },
    disclaimer:
      'Les formules pour les entreprises et leurs conditions sont établies au cas par cas, après une évaluation de faisabilité et de conformité.',
    volumes: {
      'under-100': 'Moins de 100 lb par mois',
      '100-500': 'De 100 à 500 lb par mois',
      'over-500': 'Plus de 500 lb par mois',
      pallets: 'Fret par palette ou par conteneur',
      unknown: 'Je ne sais pas encore',
    },
  },

  // pages/rastreo.astro and components/carinova/PackageLookup.astro
  trackPage: {
    tagline: 'Suivi',
    metaTitle: 'Suivi des colis des États-Unis vers le Nicaragua',
    description:
      'Suivez vos colis des États-Unis vers le Nicaragua avec Carinova : reçu à l’entrepôt, en préparation, en transit, disponible pour la livraison et livré. Connectez-vous à votre compte et suivez chaque envoi avec sa référence.',
    title: 'Suivez votre colis',
    subtitle: 'Connectez-vous à votre compte et suivez chaque envoi avec sa référence, étape par étape.',
    stagesTitle: 'Les étapes de votre colis',
    stagesIntro: 'Voici comment avance chaque envoi, de notre entrepôt aux États-Unis jusqu’à vos mains.',
    results: {
      active: 'Vos colis en route',
      found: 'Le résultat de votre recherche',
      loading: 'Recherche de vos colis…',
      empty:
        'Nous n’avons encore reçu aucun colis à votre nom. Quand le premier arrivera à notre entrepôt, vous le verrez ici, avec son étape.',
      none: 'Vous n’avez aucun colis en route pour le moment.',
      notFoundHint: 'Vérifiez qu’elle est bien écrite : la référence commence par PKG et figure dans votre compte.',
      askMissing: 'Poser une question sur cette référence',
      ask: 'Poser une question sur ce colis',
      history: 'Voir l’historique',
      error: 'Nous n’avons pas pu charger vos colis. Vérifiez votre connexion et réessayez.',
      retry: 'Réessayer',
      script: {
        notFound: 'Nous n’avons trouvé aucun colis avec la référence {reference} dans votre compte.',
        summary: '{reference} · {service}',
      },
    },
    closing: {
      title: 'Vous n’avez pas encore de compte ?',
      subtitle: 'Créez votre compte et suivez chaque achat dès son arrivée à notre entrepôt.',
      lead: 'Vous ne trouvez pas votre colis ?',
    },
  },

  // components/carinova/ProductLinkForm.astro
  productLink: {
    label: 'Lien du produit',
    placeholder: 'https://magasin.com/produit',
    submit: 'Préparer la demande',
    hint: 'WhatsApp s’ouvre avec votre demande prête à envoyer. Rien n’est acheté avant que nous ayons confirmé le coût total.',
    invalid: 'Collez le lien complet du produit : il commence par https://',
  },

  // pages/casillero-en-miami.astro
  lockerPage: {
    tagline: 'Adresse aux États-Unis',
    metaTitle: `Une adresse aux États-Unis à ${warehouse.city} pour vos envois vers le Nicaragua`,
    description: `Ouvrez gratuitement votre adresse à ${warehouse.city} avec Carinova : une adresse aux États-Unis pour acheter sur Amazon, SHEIN ou Temu et recevoir à ${cityNames.join(' ou ')}. Par avion en ${air.transit}, par bateau en ${sea.transit}.`,
    title: `Votre adresse aux États-Unis à ${warehouse.city}, pour le Nicaragua`,
    subtitle: `Une adresse aux États-Unis à votre nom, pour acheter dans n’importe quel magasin et recevoir à ${cityNames.join(' ou ')}. Elle est incluse avec votre compte Carinova.`,
    whatTitle: `Qu’est-ce qu’une adresse aux États-Unis à ${warehouse.city} et comment ça marche ?`,
    what: [
      'C’est une adresse aux États-Unis que vous utilisez comme si vous y habitiez : vous l’indiquez comme adresse de livraison quand vous achetez en ligne, le magasin livre votre colis à notre entrepôt et nous l’acheminons au Nicaragua.',
      'Au Nicaragua, on l’appelle un « casillero », ou encore boîte aux lettres virtuelle ou internationale : c’est la même chose. Chez Carinova, inutile de la souscrire à part : elle est incluse avec votre compte.',
      'En créant votre compte, vous recevez votre Carinova ID et votre adresse. Le Carinova ID nous permet d’identifier chaque colis qui arrive à votre nom.',
    ],
    addressTitle: 'Où nous recevons vos achats',
    addressNote: 'Vous voyez l’adresse complète en créant votre compte.',
    includesTitle: 'Ce que comprend votre adresse aux États-Unis',
    includesLink: 'Voir tout ce que contient votre compte',
    costTitle: 'Combien coûte une adresse aux États-Unis ?',
    cost: 'La création de votre compte est gratuite : vous payez seulement l’envoi de chaque colis, à la livre ou, en maritime, aussi au pied cube.',
    costLink: 'Calculer le coût de mon envoi',
    stepsTitle: 'Comment utiliser votre adresse aux États-Unis',
    stepsLink: 'Voir chaque étape avec des exemples',
    faqTitle: 'Questions sur l’adresse aux États-Unis et votre compte',
    closing: {
      title: 'Ouvrez votre adresse aux États-Unis en quelques minutes',
      subtitle: 'Créez votre compte en ligne et obtenez votre Carinova ID et votre adresse aux États-Unis.',
      lead: 'Des questions avant de l’ouvrir ?',
    },
  },

  // pages/tiendas.astro
  storesPage: {
    tagline: 'Magasins',
    metaTitle: 'Acheter sur Amazon, SHEIN et Temu depuis le Nicaragua',
    description: `Comment acheter sur Amazon, SHEIN, Temu, Walmart et d’autres magasins aux États-Unis depuis le Nicaragua : utilisez l’adresse de votre compte Carinova ou demandez-nous d’acheter pour vous, et recevez à ${cityNames.join(' ou ')}.`,
    title: 'Achetez dans des magasins aux États-Unis depuis le Nicaragua',
    subtitle:
      'Amazon, SHEIN, Temu, Walmart et bien d’autres : vous achetez avec l’adresse de votre compte et nous l’acheminons au Nicaragua.',
    howTitle: 'Comment acheter dans un magasin aux États-Unis',
    howLink: 'Voir chaque étape avec des exemples',
    restrictedLink: 'Vérifier quels articles ne peuvent pas entrer',
    storesTitle: 'Magasins où vous pouvez acheter',
    storesIntro:
      'Vous pouvez acheter dans n’importe quel magasin en ligne qui livre aux États-Unis. Voici quelques-uns des plus recherchés, par catégorie.',
    categories: 'Catégories de magasins',
    buyAt: (store: string) => `Acheter sur ${store} depuis le Nicaragua`,
    visit: (store: string) => `Aller sur le site de ${store}`,
    assist: 'Nous demander d’acheter pour vous',
    disclosure:
      'Les magasins sont présentés à titre d’exemple, sans accord ni recommandation implicite. Les prix, la disponibilité et les conditions de chaque achat se vérifient sur le site de chaque magasin.',
    assistTitle: 'Vous préférez que nous achetions pour vous ?',
    assistIntro:
      'Avec l’achat assisté, vous choisissez le produit et Carinova effectue l’achat. Collez le lien du produit et préparez votre demande.',
    closing: {
      title: 'Envie de faire votre premier achat ?',
      subtitle: 'Créez votre compte et utilisez votre adresse aux États-Unis dans le magasin de votre choix.',
      lead: 'Une question sur un magasin ?',
    },
  },

  // pages/index.astro and components/landing: the home page Carinova wrote (./landing)
  landing,
};
