/** What the Worker says, in French. Same shape as ./es.ts (`ServerText`). */
import { LOGIN_CODE_MINUTES } from '../../src/data/account.ts';
import { BUSINESS_LIMITS } from '../../src/data/business.ts';
import { CONFIRM_LINK_HOURS } from '../../src/data/signup.ts';
import { SIGNUP_LIMITS } from '../validation.ts';
import type { ServerText } from './es.ts';

export const text: ServerText = {
  tagline: 'Carinova · Des envois qui nous unissent · Des États-Unis au Nicaragua',

  // worker/api.ts
  api: {
    emailMissing: 'Saisissez votre adresse e-mail.',
    emailInvalid: 'Vérifiez votre adresse e-mail : elle ne semble pas valide.',
    emailRejected: 'Nous n’avons pas pu envoyer de message à cette adresse e-mail. Vérifiez qu’elle est bien écrite.',
  },

  // worker/auth/emails.ts
  loginCode: {
    subject: 'Votre code pour vous connecter à Carinova',
    preheader: (code: string) => `Votre code est ${code}. Il expire dans ${LOGIN_CODE_MINUTES} minutes.`,
    hello: (name: string) => `Bonjour ${name},`,
    intro: 'Utilisez ce code pour vous connecter à votre compte Carinova :',
    expires: `Il expire dans ${LOGIN_CODE_MINUTES} minutes et ne fonctionne qu’une seule fois.`,
    never:
      'Saisissez-le uniquement sur notre site. Nous ne vous le demanderons jamais sur WhatsApp, par téléphone ni par e-mail : si quelqu’un vous le demande, ne le lui donnez pas.',
    notYou: 'Si ce n’était pas vous, ignorez ce message : sans ce code, personne ne peut se connecter à votre compte.',
  },

  // worker/business/validate.ts
  businessForm: {
    company: 'Saisissez le nom de votre entreprise.',
    companyLength: `Le nom de l’entreprise doit comporter de 2 à ${BUSINESS_LIMITS.company} caractères.`,
    contactName: 'Saisissez votre nom.',
    contactNameInvalid: `Utilisez uniquement des lettres dans votre nom (entre 2 et ${BUSINESS_LIMITS.contactName} caractères).`,
    email: 'Saisissez votre adresse e-mail.',
    emailInvalid: 'Vérifiez votre adresse e-mail : elle ne semble pas valide.',
    phone: 'Saisissez votre numéro de téléphone.',
    phoneInvalid: (example: string) =>
      `Saisissez le numéro complet, par exemple ${example}. S’il s’agit d’un numéro d’un autre pays, commencez par + et l’indicatif du pays.`,
    country: 'Choisissez un pays.',
    city: 'Saisissez votre ville.',
    cityLength: `Votre ville doit comporter de 2 à ${BUSINESS_LIMITS.city} caractères.`,
    volume: 'Choisissez l’une des options.',
    message: 'Dites-nous ce dont votre entreprise a besoin.',
    messageShort: 'Dites-nous-en un peu plus sur les besoins de votre entreprise.',
    messageLong: `Utilisez ${BUSINESS_LIMITS.message} caractères au maximum.`,
  },

  // worker/signup/emails.ts
  verification: {
    subject: 'Confirmez votre e-mail pour créer votre compte Carinova',
    preheader: 'Encore une étape et votre compte sera prêt.',
    hello: (name: string) => `Bonjour ${name},`,
    intro:
      'Nous avons reçu votre inscription chez Carinova. Confirmez votre e-mail pour créer votre compte et recevoir votre Carinova ID et votre adresse à Miami.',
    button: 'Confirmer mon e-mail',
    expires: `Le lien expire dans ${CONFIRM_LINK_HOURS} heures.`,
    fallback: (openLink: string) => `Si le bouton ne fonctionne pas, ${openLink}.`,
    fallbackLink: 'ouvrez ce lien',
    notYou: 'Si ce n’était pas vous, ignorez ce message : aucun compte ne sera créé.',
    textIntro:
      'Nous avons reçu votre inscription chez Carinova. Ouvrez ce lien pour confirmer votre e-mail, créer votre compte et recevoir votre Carinova ID et votre adresse à Miami :',
  },

  // worker/signup/emails.ts
  welcome: {
    subject: (code: string) => `Votre compte Carinova est prêt : ${code}`,
    preheader: (code: string) => `Votre Carinova ID est ${code}. Voici votre adresse à Miami.`,
    title: (name: string) => `Votre compte est prêt, ${name} !`,
    thisIsId: 'Voici votre Carinova ID.',
    keepId: 'Conservez-le : c’est avec lui que nous identifions votre compte.',
    idLabel: 'Votre Carinova ID',
    address: 'Votre adresse à Miami',
    addressIntro: 'Utilisez-la comme adresse de livraison quand vous achetez dans des magasins aux États-Unis :',
    before: 'Avant d’acheter',
    seeList: 'Voir cette liste sur notre site',
    listOnSite: 'La liste sur notre site',
    firstShipment: 'Avant votre premier envoi',
    quote:
      'Calculez ce que coûte l’envoi de votre achat : par avion, par bateau ou au tarif à l’unité de certains appareils électroniques.',
    quoteText: 'Calculez ce que coûte l’envoi de votre achat',
    online: 'Votre compte en ligne',
    onlineText:
      'Sur notre site, vous retrouvez toujours votre Carinova ID, votre adresse, vos colis et vos paiements. Vous vous connectez avec votre e-mail et un code que nous vous envoyons, sans mot de passe.',
    questions: 'Des questions ?',
    writeUs: (number: string) => `Écrivez-nous sur WhatsApp au ${number}`,
  },

  // worker/signup/validate.ts
  signupForm: {
    country: 'Choisissez un pays.',
    labels: { firstName: 'prénom', lastName: 'nom' },
    nameMissing: (label: string) => `Saisissez votre ${label}.`,
    nameInvalid: (label: string) =>
      `Utilisez uniquement des lettres dans votre ${label} (entre 2 et ${SIGNUP_LIMITS.name} caractères).`,
    emailMissing: 'Saisissez votre adresse e-mail.',
    emailInvalid: 'Vérifiez votre adresse e-mail : elle ne semble pas valide.',
    phoneMissing: 'Saisissez votre numéro de téléphone.',
    phoneInvalid: (example: string) =>
      `Saisissez le numéro complet, par exemple ${example}. S’il s’agit d’un numéro d’un autre pays, commencez par + et l’indicatif du pays.`,
    addressMissing: 'Saisissez votre adresse.',
    addressShort: 'Votre adresse semble incomplète.',
    tooLong: (max: number) => `Utilisez ${max} caractères au maximum.`,
    cityMissing: 'Saisissez votre ville.',
    cityLength: `Votre ville doit comporter de 2 à ${SIGNUP_LIMITS.city} caractères.`,
    state: (label: string) => `Choisissez votre ${label.toLowerCase()}.`,
    postalMissing: 'Saisissez votre code postal.',
    postalInvalid: (example: string) => `Vérifiez le code postal (exemple : ${example}).`,
    terms: 'Pour continuer, acceptez les conditions générales et la politique de confidentialité.',
  },
};
