/** What the Worker says, in English. Same shape as ./es.ts (`ServerText`). */
import { LOGIN_CODE_MINUTES } from '../../src/data/account.ts';
import { BUSINESS_LIMITS } from '../../src/data/business.ts';
import { CONFIRM_LINK_HOURS } from '../../src/data/signup.ts';
import { SIGNUP_LIMITS } from '../validation.ts';
import type { ServerText } from './es.ts';

export const text: ServerText = {
  tagline: 'Carinova · Shipments that bring us together · From the United States to Nicaragua',

  // worker/api.ts
  api: {
    emailMissing: 'Enter your e-mail.',
    emailInvalid: 'Check your e-mail: it does not look valid.',
    emailRejected: 'We could not send a message to this e-mail. Check that it is written correctly.',
  },

  // worker/auth/emails.ts
  loginCode: {
    subject: 'Your code to sign in to Carinova',
    preheader: (code: string) => `Your code is ${code}. It expires in ${LOGIN_CODE_MINUTES} minutes.`,
    hello: (name: string) => `Hi, ${name}:`,
    intro: 'Use this code to sign in to your Carinova account:',
    expires: `It expires in ${LOGIN_CODE_MINUTES} minutes and works only once.`,
    never:
      'Type it only on our site. We will never ask you for it on WhatsApp, by phone or by e-mail: if someone asks for it, do not give it to them.',
    notYou: 'If it was not you, ignore this message: without this code nobody can sign in to your account.',
  },

  // worker/business/validate.ts
  businessForm: {
    company: 'Enter the name of your company.',
    companyLength: `The name of the company must have 2 to ${BUSINESS_LIMITS.company} characters.`,
    contactName: 'Enter your name.',
    contactNameInvalid: `Use only letters in your name (between 2 and ${BUSINESS_LIMITS.contactName} characters).`,
    email: 'Enter your e-mail.',
    emailInvalid: 'Check your e-mail: it does not look valid.',
    phone: 'Enter your phone number.',
    phoneInvalid: (example: string) =>
      `Enter the full number, for example ${example}. If it is from another country, start with + and the country code.`,
    country: 'Choose a country.',
    city: 'Enter your city.',
    cityLength: `Your city must have 2 to ${BUSINESS_LIMITS.city} characters.`,
    volume: 'Choose one of the options.',
    message: 'Tell us what your company needs.',
    messageShort: 'Tell us a little more about what your company needs.',
    messageLong: `Use ${BUSINESS_LIMITS.message} characters at most.`,
  },

  // worker/signup/emails.ts
  verification: {
    subject: 'Confirm your e-mail to create your Carinova account',
    preheader: 'One more step and your account is ready.',
    hello: (name: string) => `Hi, ${name}:`,
    intro:
      'We received your sign-up at Carinova. Confirm your e-mail to create your account and get your Carinova ID and your address in Miami.',
    button: 'Confirm my e-mail',
    expires: `The link expires in ${CONFIRM_LINK_HOURS} hours.`,
    fallback: (openLink: string) => `If the button does not work, ${openLink}.`,
    fallbackLink: 'open this link',
    notYou: 'If it was not you, ignore this message: no account will be created.',
    textIntro:
      'We received your sign-up at Carinova. Open this link to confirm your e-mail, create your account and get your Carinova ID and your address in Miami:',
  },

  // worker/signup/emails.ts
  welcome: {
    subject: (code: string) => `Your Carinova account is ready: ${code}`,
    preheader: (code: string) => `Your Carinova ID is ${code}. Here is your address in Miami.`,
    title: (name: string) => `Your account is ready, ${name}!`,
    thisIsId: 'This is your Carinova ID.',
    keepId: 'Keep it: it is how we identify your account.',
    idLabel: 'Your Carinova ID',
    address: 'Your address in Miami',
    addressIntro: 'Use it as the shipping address when you buy at stores in the United States:',
    before: 'Before you buy',
    seeList: 'See this list on our site',
    listOnSite: 'The list on our site',
    firstShipment: 'Before your first shipment',
    quote: 'Work out what it costs to bring your purchase: by air, by sea or at the rate per unit of some electronics.',
    quoteText: 'Work out what it costs to bring your purchase',
    online: 'Your account online',
    onlineText:
      'On our site you always find your Carinova ID, your address, your packages and your payments. You sign in with your e-mail and a code we send you, without a password.',
    questions: 'Any questions?',
    writeUs: (number: string) => `Write to us on WhatsApp at ${number}`,
  },

  // worker/signup/validate.ts
  signupForm: {
    country: 'Choose a country.',
    labels: { firstName: 'first name', lastName: 'last name' },
    nameMissing: (label: string) => `Enter your ${label}.`,
    nameInvalid: (label: string) =>
      `Use only letters in your ${label} (between 2 and ${SIGNUP_LIMITS.name} characters).`,
    emailMissing: 'Enter your e-mail.',
    emailInvalid: 'Check your e-mail: it does not look valid.',
    phoneMissing: 'Enter your phone number.',
    phoneInvalid: (example: string) =>
      `Enter the full number, for example ${example}. If it is from another country, start with + and the country code.`,
    addressMissing: 'Enter your address.',
    addressShort: 'Your address looks incomplete.',
    tooLong: (max: number) => `Use ${max} characters at most.`,
    cityMissing: 'Enter your city.',
    cityLength: `Your city must have 2 to ${SIGNUP_LIMITS.city} characters.`,
    state: (label: string) => `Choose your ${label.toLowerCase()}.`,
    postalMissing: 'Enter your postal code.',
    postalInvalid: (example: string) => `Check the postal code (example: ${example}).`,
    terms: 'To continue, accept the terms and the privacy policy.',
  },
};
