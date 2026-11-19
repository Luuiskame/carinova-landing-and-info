/**
 * What the pages and the components say, in English. Same shape as ./es.ts (`UI`): every entry of
 * the Spanish dictionary, translated.
 */
import {
  INVOICE_STATES,
  LOGIN_CODE_DIGITS,
  LOGIN_CODE_MINUTES,
  PACKAGE_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SESSION_DAYS,
  type InvoiceState,
  type PackageStatus,
  type PaymentMethod,
  type PaymentStatus,
} from '../../data/account.ts';
import { BUSINESS_DISCLAIMER, BUSINESS_SOLUTIONS, BUSINESS_VOLUMES } from '../../data/business.ts';
import { sentence } from '../../data/carinova.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, describeHours } from '../../data/en/carinova.ts';
import { CONFIRM_LINK_HOURS } from '../../data/signup.ts';
import { CUBIC_CM_PER_CUBIC_FOOT, formatNumber, formatUSD } from '../../utils/rates.ts';
import type { UI } from './es.ts';

// The facts the sentences below are written around, in this language.
const { air, sea } = RATES;
const cityNames = BRANCHES.map((branch) => branch.city);
const cities = cityNames;
const [hours] = BRANCHES[0].hours;
/** The warehouse that receives packages today (the one that is open). */
const [warehouse] = RECEPTION_POINTS.filter((point) => point.available);
/** The English words of a list of src/data that carries its own (statuses, options), by their id. */
/** A status as a short label and what it means, in a few words. */
type StatusWords = { name: string; text: string };
const byId = <Id extends string, Words>(list: ReadonlyArray<{ id: Id; en: Words }>): Record<Id, Words> =>
  Object.fromEntries(list.map((item) => [item.id, item.en])) as Record<Id, Words>;
/** Whether every branch opens at the same times: then the hours can be said once. */
const sameHours = BRANCHES.every((branch) => JSON.stringify(branch.hours) === JSON.stringify(BRANCHES[0].hours));

export const ui: UI = {
  // components/carinova/AccountPanel.astro
  accountPanel: {
    loading: 'Opening your account…',
    noscript: 'To see your account you need to turn on JavaScript in your browser.',
    eyebrow: 'My account',
    idLabel: 'Your Carinova ID',
    idNote: 'Keep it at hand when you write to us or pick up your packages.',
    sections: 'Sections of your account',
    packagesIntro: 'What we received at our warehouse and what we already shipped, with the status of each one.',
    filterLabel: 'Filter packages',
    filters: { all: 'All', warehouse: 'At the warehouse', shipped: 'Shipped', delivered: 'Delivered' },
    packagesEmpty:
      'We have not received any packages in your name yet. When the first one reaches our warehouse you will see it here, with its status.',
    packagesNone: 'You have no packages in this group.',
    packagesAsk: 'Ask about my packages',
    history: 'See history',
    packageAsk: 'Ask about this package',
    paymentsIntro: 'Your invoices and the payments we confirmed.',
    invoicesEmpty: 'You have no invoices yet. When we issue the first one you will see it here.',
    payments: 'Payments',
    invoiceAsk: 'Pay or ask about this invoice',
    paymentsNote:
      'To pay or to tell us about a payment, write to us with the number of the invoice. A payment shows as confirmed once our team verifies it.',
    activityError: 'We could not load your packages and your payments.',
    retry: 'Try again',
    detailsTitle: 'My details',
    detailsIntro: 'You created your account with these details.',
    name: 'Name',
    email: 'E-mail',
    phone: 'Phone',
    address: 'Address',
    since: 'Customer since',
    changed: 'Has something changed?',
    update: 'Ask to have my details updated',
    nextTitle: 'What would you like to do?',
    howItWorks: 'See how it works',
    restricted: 'See what can enter',
    signOut: 'Sign out',
    signingOut: 'Signing out…',
    errorTitle: 'We could not open your account',
    errorText: 'Check your connection and try again. If it keeps failing, write to us on WhatsApp.',
    script: {
      hello: 'Hi, {name}',
      documentTitle: 'My account {code} | Carinova',
      received: 'Received at the warehouse',
      warehouse: 'Warehouse',
      weight: 'Weight',
      pounds: '{weight} lb',
      pieces: 'Pieces',
      pickup: 'Pickup at',
      delivery: 'Delivery',
      homeDelivery: 'Home delivery',
      store: 'Store',
      carrier: 'Arrived with',
      issued: 'Issued on {date}',
      due: 'due on {date}',
      total: 'Total',
      paid: 'Paid',
      balance: 'Balance',
      forPackage: '{description} ({reference})',
      balanceDue: 'Balance due: {amount}',
      inReview: 'Payments under review: {amount}',
      nothingDue: 'You have no balance due.',
    },
  },

  // components/carinova/Branches.astro
  branches: {
    tagline: 'Branches',
    title: `Pick up in ${cities.join(' or ')}`,
    directions: 'Directions',
    branch: (city: string) => `(${city} branch)`,
  },

  // components/carinova/BusinessBand.astro
  businessBand: {
    eyebrow: 'Carinova Business · Cargo for companies',
    title: ['Your business does not stop.', 'Neither do we.'],
    intro:
      'Bring supplies, products or merchandise to grow with a solution designed for your operation. We evaluate each need individually.',
    button: 'Explore Business solutions',
    tiles: { name: ['Carinova', 'Business'], route: ['USA', 'NIC'], pace: 'At your pace' },
  },

  // components/carinova/BusinessForm.astro
  businessForm: {
    title: 'Tell us about your company',
    intro: 'Fill in these details and we will contact you.',
    noscript: 'To send the form you need to turn on JavaScript in your browser. You can also write to us on WhatsApp.',
    company: 'Name of the company',
    contactName: 'Your name',
    email: 'E-mail',
    phone: 'Phone',
    phoneHint: 'Preferably the number you use on WhatsApp.',
    country: 'Country',
    city: 'City',
    volume: 'Estimated volume',
    optional: '(optional)',
    choose: 'Choose one',
    message: 'What does your company need?',
    messageHint: 'What you bring, from where and how often.',
    honeypot: 'Leave this field empty',
    submit: 'Send request',
    sending: 'Sending…',
    sentTitle: 'We received your request',
    sentText: 'Thank you. Our team will review it and contact you at the e-mail or the phone you gave us.',
    home: 'Back to the home page',
    privacyNote: ['When you send it, we use these details to contact you, as our ', 'Privacy policy', ' explains.'],
    messages: {
      missing: 'Fill in this field.',
      unavailable: 'The form is not available right now. Write to us on WhatsApp and we will look after you.',
      busy: 'We received too many attempts in a row. Wait a minute and try again.',
      failed: 'We could not send your request. Check your connection and try again, or write to us on WhatsApp.',
      oneError: 'There is one field to correct.',
      manyErrors: 'There are {count} fields to correct.',
    },
  },

  // components/carinova/HomeClosing.astro
  homeClosing: {
    eyebrow: 'The next step is yours',
    title: ['As simple', 'as that.'],
    text: 'Create your account, get your Carinova ID and start preparing your next shipment.',
  },

  // components/carinova/HomeFaq.astro
  homeFaq: {
    eyebrow: 'Questions about shipping to Nicaragua',
    title: ['Frequently asked', 'questions.'],
    intro: 'The answers that matter, before your first shipment.',
    help: 'Have another question? Write to us',
    all: 'See all the questions',
  },

  // components/carinova/HowItWorks.astro
  howItWorks: {
    eyebrow: 'How to shop in the United States from Nicaragua',
    title: ['Three steps,', 'from there to here.'],
    intro: 'Three steps to start receiving your purchases and packages from the United States.',
    closing: 'No complications. A clear plan from start to finish.',
    more: 'See each step with examples',
  },

  // components/carinova/QuoteCalculator.astro
  quoteCalculator: {
    title: 'Build your estimate',
    badge: 'No sign-up',
    mode: 'How do you want to bring it?',
    basis: 'Type of rate',
    basisHint: 'Choose one basis only: weight, volume and the rate per unit are not added together.',
    byWeight: 'By weight (pound)',
    byVolume: 'By volume (cubic foot)',
    perUnit: (name: string) => `${name} (per unit)`,
    weightEach: 'Weight of each package (lb)',
    packages: 'Number of packages',
    kilos: 'Do you have it in kilos? 1 kg = 2.2 lb.',
    dimensions: ['Length', 'Width', 'Height'],
    unit: 'Measured in',
    units: { cm: 'Centimeters', pulg: 'Inches' },
    pieces: 'Number of pieces',
    quantity: 'Number of units',
    estimate: 'Estimated base rate',
    what: 'What are you quoting?',
    send: 'Send my quote on WhatsApp',
    reset: 'Reset',
    estimateNote: 'A guiding figure worked out with the current base rates.',
    footnote:
      'A guiding estimate, not a contractual quote. The final total depends on the review of the weight, the dimensions, the contents, the rates that apply and any additional charges. It does not include the cost of the products or home delivery.',
    script: {
      delivery: 'Estimated delivery: {transit}, {from}.',
      explainWeight:
        'Weight of each package multiplied by the number of packages, with a minimum of {minimum} lb billed per shipment. The weight and the basis that applies are validated on reception.',
      explainVolume:
        'Length × width × height, converted to cubic feet (1 foot = 30.48 cm = 12 inches), with no minimums and no rounding.',
      explainUnit: 'Air rate per unit of the item you chose. The rate per pound is not added to it.',
      comparison: 'Only as a comparison: by {mode}, the same weight would be {total} ({transit}).',
      check: 'Check the details',
      checkHint: 'Use values greater than zero.',
      needData: 'Enter the weight, the measurements or the quantity to see the estimate.',
      weightShipment: 'a shipment by {mode} of {weight} lb',
      weightShipmentMany: 'a shipment by {mode} of {count} packages of {weight} lb each',
      volumeShipment: 'a shipment by {mode} of {count} piece(s) measuring {measurements} {unit}',
      unitShipment: '{units} by {mode}',
      unitCm: 'cm',
      unitIn: 'inches',
      announce: 'Estimate: {total}',
    },
  },

  // components/carinova/RateCards.astro
  rateCards: {
    tagline: 'Rates',
    title: 'Two routes. One destination.',
    subtitle:
      'Rates include insurance and taxes where they apply to the shipment. Delivery times count from the physical reception of your package.',
    cities: BRANCHES.map((branch) => branch.city).join(' and '),
    perPound: 'per pound',
    perCubicFoot: 'per ft³',
    airFacts: ['Made for what you want to receive soon.', 'Some electronics have a flat rate per unit.'],
    seaFacts: [
      'Ideal for large loads and planned purchases.',
      'Whether weight or volume applies is determined by the cargo, its packaging and the conditions of the service.',
    ],
    calculate: (name: string) => `Calculate ${name.toLowerCase()} shipping`,
    calculateUnits: 'Calculate per unit',
    electronicsNote: 'Rate per unit on air shipments. It is not added to the rate per pound.',
    pickup: 'Branch pickup:',
    homeDelivery: 'Home delivery',
    howTitle: 'How we calculate',
    howIntro: 'One basis at a time: weight, volume and the rate per unit are not added together.',
    byPound: {
      title: 'Per pound',
      applies: 'Air and sea',
      rule: 'Weight in pounds × rate per pound, with no minimums and no rounding. The weight is validated on reception.',
    },
    byCubicFoot: {
      title: 'Per cubic foot',
      applies: 'Sea',
      rule: `Length × width × height of the box ÷ 1,728 if you measure in inches, or ÷ ${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)} if you measure in centimeters = cubic feet; × ${formatUSD(sea.pricePerCubicFoot)}.`,
      link: 'Try it in the calculator',
    },
    byUnit: {
      title: 'Per unit',
      applies: 'Electronics, by air',
      rule: 'Quantity × rate of the device. The rate per pound is not added to it.',
    },
  },

  // components/carinova/ServiceBadge.astro
  serviceBadge: { soon: 'Coming soon', extra: 'Additional charge' },

  // components/carinova/ShippingModes.astro
  shippingModes: {
    eyebrow: 'Air and sea shipping to Nicaragua',
    title: ['Two modes.', 'One destination.'],
    intro:
      'Choose how you want to receive it. More speed when you need it, more savings when you can plan. Compare before you decide.',
    air: {
      tag: 'To arrive sooner',
      overline: 'Air shipping',
      title: 'When time matters.',
      text: 'Ideal for purchases and packages you want to receive soon.',
    },
    sea: {
      tag: 'To plan ahead',
      overline: 'Sea shipping',
      title: 'More room for your plans.',
      text: 'For planned purchases and larger loads.',
    },
    baseRate: 'Base rate',
    perPound: '/lb',
    orPerCubicFoot: (price: string) => `or ${price} per cubic foot`,
    electronics: 'Electronics: rate per unit',
    delivery: 'Estimated delivery',
    details: (name: string) => `See the details of ${name.toLowerCase()} shipping`,
    important: 'Important:',
  },

  // components/carinova/SigninDialog.astro
  signinDialog: { label: 'Sign in to your account', close: 'Close' },

  // components/carinova/SigninForm.astro
  signinForm: {
    title: 'Sign in with your e-mail',
    intro: `We send a ${LOGIN_CODE_DIGITS}-digit code to your e-mail. You do not need a password.`,
    noscript: 'To sign in you need to turn on JavaScript in your browser.',
    email: 'E-mail',
    emailHint: 'The e-mail you created your account with.',
    send: 'Send me a code',
    sending: 'Sending…',
    noAccount: 'Do you not have an account yet?',
    codeTitle: 'Enter your code',
    codeSent: [
      'If ',
      ` has an account, we sent it a ${LOGIN_CODE_DIGITS}-digit code. It expires in ${LOGIN_CODE_MINUTES} minutes.`,
    ],
    code: `${LOGIN_CODE_DIGITS}-digit code`,
    enter: CTA.signin.text,
    entering: 'Signing in…',
    notes: [
      'It can take a couple of minutes to arrive. If you do not see it, check your spam or junk folder.',
      'We will never ask you for this code on WhatsApp or by phone.',
    ],
    notArriving: 'If it does not arrive, that e-mail may not have an account.',
    openYours: 'Create yours',
    resend: 'Send another code',
    change: 'Use another e-mail',
    signedIn: 'You are already signed in on this browser.',
    messages: {
      emailMissing: 'Enter your e-mail.',
      codeMissing: `Enter the ${LOGIN_CODE_DIGITS}-digit code.`,
      codeInvalid: 'The code is not correct or has expired. Check it or ask for another one.',
      resendIn: 'Send another code ({seconds} s)',
      resent: 'Done: if the e-mail has an account, we sent it another code. The earlier one no longer works.',
      unavailable: 'Signing in is not available right now. Write to us on WhatsApp and we will help you.',
      busy: 'We received too many attempts in a row. Wait a minute and try again.',
      failed: 'We could not connect. Check your connection and try again.',
    },
  },

  // components/carinova/SignupConfirm.astro
  signupConfirm: {
    readyTitle: 'Confirm your e-mail',
    readyText:
      'One more step: confirm your e-mail to create your account and see your Carinova ID and your address in the United States.',
    confirm: 'Confirm and create my account',
    confirming: 'Creating your account…',
    noscript: 'To confirm your e-mail you need to turn on JavaScript in your browser.',
    doneTitle: 'Your account is ready!',
    doneIntro: 'This is your Carinova ID. Keep it: it is how we identify your account.',
    emailed: 'We also sent you these details by e-mail.',
    beforeTitle: 'Before you buy',
    beforeText: 'Check what we cannot bring.',
    nextTitle: 'What now?',
    nextText: 'Get a quote for your first shipment or see how it works, with examples.',
    howToBuy: 'See how it works',
    signedIn:
      'You are signed in on this browser: your account always has your Carinova ID, your address, your packages and your payments.',
    signedOut: 'To see these details whenever you want, sign in to your account with your e-mail.',
    invalidTitle: 'This link is not valid',
    invalidText: 'It may be incomplete. Open it again from the e-mail we sent you, or sign up again.',
    expiredTitle: 'This link has expired',
    expiredText: `Confirmation links last ${CONFIRM_LINK_HOURS} hours. Sign up again and we will send you another one.`,
    signupAgain: 'Sign up again',
    errorTitle: 'We could not create your account',
    errorText: 'The problem is on our side, not yours. Try again and, if it keeps failing, write to us on WhatsApp.',
    retry: 'Try again',
    retrying: 'Trying…',
    existingTitle: 'You already have an account',
    existingIntro: 'This e-mail already has a Carinova account. This is your Carinova ID:',
    documentTitle: 'Your account {code} | Carinova',
  },

  // components/carinova/SignupForm.astro
  signupForm: {
    signedIn: 'You are already signed in to your account on this browser.',
    title: 'Your details',
    intro: 'It takes a couple of minutes.',
    noscript:
      'To sign up online you need to turn on JavaScript in your browser. You can also create your account through WhatsApp.',
    country: 'Country',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'E-mail',
    emailHint: 'We will send you a link to confirm your account.',
    phone: 'Phone',
    phoneHint: 'Preferably the number you use on WhatsApp.',
    address1: 'Address',
    address2: 'Apt / Suite',
    optional: '(optional)',
    city: 'City',
    choose: 'Choose one',
    postalCode: 'Postal code',
    honeypot: 'Leave this field empty',
    sending: 'Sending…',
    afterSubmit: 'When you submit, we send you an e-mail to confirm your account.',
    accept: ['I accept the ', 'Terms and conditions', ' and the ', 'Privacy policy', '.'],
    sentTitle: 'Check your e-mail',
    sentTo: [
      'We sent a link to ',
      '. Open it to confirm your account and get your Carinova ID and your address in the United States.',
    ],
    sentNotes: [
      'It can take a couple of minutes to arrive.',
      'If you do not see it, check your spam or junk folder.',
      `The link expires in ${CONFIRM_LINK_HOURS} hours.`,
    ],
    edit: 'Wrong e-mail? Correct it',
    messages: {
      missing: 'Fill in this field.',
      terms: 'To continue, accept the terms and the privacy policy.',
      unavailable:
        'Online sign-up is not available right now. Write to us on WhatsApp and we will create your account.',
      busy: 'We received too many attempts in a row. Wait a minute and try again.',
      failed: 'We could not send your sign-up. Check your connection and try again, or write to us on WhatsApp.',
      oneError: 'There is one field to correct.',
      manyErrors: 'There are {count} fields to correct.',
    },
  },

  // components/carinova/TopStrip.astro
  topStrip: {
    connect: 'We connect',
    usa: 'the United States',
    with: 'with',
    nicaragua: 'Nicaragua',
    soon: 'coming soon',
    to: 'to',
  },

  // components/carinova/UsAddressCard.astro
  usAddressCard: {
    title: 'Your address in the United States',
    intro: 'Use it as the shipping address when you buy at stores in the United States.',
    warehouse: 'Warehouse',
    soonTitle: (city: string) => `${city}: coming soon`,
    soonText: (city: string, state: string) =>
      `Soon you will also be able to receive your purchases in ${city}, ${state}. When the warehouse is open, its address will appear here.`,
    meanwhile: (city: string) => `In the meantime, use your ${city} address.`,
  },

  // components/carinova/WhatsAppFloat.astro
  whatsAppFloat: { whichBranch: 'Which branch?', label: 'Write to us' },

  // components/widgets/Header.astro
  header: { navigation: 'Main navigation', menu: 'Menu' },

  // pages/404.astro
  notFoundPage: {
    metaTitle: 'Page not found',
    title: 'We could not find this page',
    lead: 'Were you looking for something else?',
    text: [
      'The link may be mistyped or the page may no longer exist. Try from the ',
      'home page',
      ' or carry on with what you came to do:',
    ],
  },

  // pages/articulos-prohibidos.astro
  restrictedPage: {
    tagline: 'Prohibited and restricted items',
    title: 'Can it enter Nicaragua?',
    metaTitle: 'Prohibited items: what cannot be shipped to Nicaragua',
    description:
      'What Carinova cannot bring from the United States to Nicaragua: prohibited items, items we are not authorised to bring yet and products that do not travel by air but do by sea. Check it before you buy.',
    subtitle:
      'Some items we neither receive nor carry, others we are not authorised to bring yet, and others only travel by sea. Check the lists before you buy or send.',
    closing: {
      title: 'Not sure about a product?',
      subtitle: 'Ask us before you buy it and we will tell you if we can bring it.',
      lead: 'Send us the product:',
    },
  },

  // pages/como-comprar.astro
  howToBuyPage: {
    tagline: 'How it works',
    title: 'How to buy in the United States from Nicaragua',
    description:
      'Step by step to buy at stores in the United States and receive in Nicaragua, with examples of what it costs to bring clothes, cell phones, laptops, household goods, furniture and family packages.',
    subtitle:
      'Three clear steps, from your first purchase to having your package in Nicaragua, and examples of what it costs to bring clothes, cell phones, laptops, household goods, furniture and family packages.',
    steps: 'The steps',
    examples: {
      tagline: 'Examples by category',
      title: 'How much does it cost to bring…?',
      subtitle:
        'Six example purchases, worked out with our rates. Open any of them in the calculator and change the details for those of your purchase.',
      open: 'Open in the calculator',
    },
    closing: {
      title: 'Start by creating your account',
      subtitle: 'With your Carinova ID and your address in the United States you can already buy at any store.',
      lead: 'Would you like us to guide you through your first purchase?',
    },
    total: 'Total',
  },

  // pages/cotizador.astro
  quotePage: {
    tagline: 'Rates and calculator',
    metaTitle: 'How much it costs to send a package to Nicaragua: rates and calculator',
    description: `How much it costs to send a package from the United States to Nicaragua: by air ${formatUSD(air.pricePerLb)} per pound, by sea ${formatUSD(sea.pricePerLb)} per pound or ${formatUSD(sea.pricePerCubicFoot)} per ft³, and electronics at a rate per unit. Work it out without signing up.`,
    title: 'How much does it cost to send a package to Nicaragua?',
    subtitle:
      'Get a quote in seconds: work out what it costs to bring your purchase or your package from the United States, without signing up.',
    closing: {
      title: 'Now you know what it costs?',
      subtitle: 'Create your account and get your Carinova ID and your address in the United States to start buying.',
      lead: 'Is your shipment a special one?',
    },
  },

  // pages/empresas.astro
  businessPage: {
    tagline: 'Carinova for business',
    metaTitle: 'Cargo and shipping for companies from the United States to Nicaragua',
    description:
      'Logistics solutions from the United States to Nicaragua for companies: importing and supply, recurring shipments and corporate service, by air or by sea. Tell us what you need.',
    title: 'Your operations deserve to move better too.',
    subtitle:
      'From your first supply run to the growth of your company, we explore logistics solutions adapted to the characteristics of your cargo.',
    offers: 'What we explore with your company',
    also: 'And what you get like any customer',
    benefits: [
      {
        icon: 'tabler:packages',
        title: 'Air and sea cargo',
        text: `Air at ${formatUSD(air.pricePerLb)} per pound, in ${air.transit}. Sea at ${formatUSD(sea.pricePerLb)} per pound or ${formatUSD(sea.pricePerCubicFoot)} per cubic foot, in ${sea.transit}.`,
      },
      {
        icon: 'tabler:id-badge-2',
        title: 'One Carinova ID for your company',
        text: `The same ID for all your company’s shipments, with pickup in ${cityNames.join(' or ')}.`,
      },
    ],
    quote: 'Get a quote for a shipment',
    next: 'What happens next?',
    steps: [
      { title: 'We receive your request', description: 'It goes straight to our team.' },
      {
        title: 'We contact you',
        description: 'By e-mail or on WhatsApp, to learn what your company needs.',
      },
      {
        title: 'We open your company’s account',
        description: 'With its Carinova ID and its address in Miami, ready to receive.',
      },
    ],
    helpTitle: 'Would you rather write to us?',
    helpText: 'We also open your company’s account through WhatsApp.',
    helpLink: 'Open my company’s account',
    closing: {
      title: 'Want to know what your cargo costs?',
      subtitle: 'Get a quote per pound or per cubic foot in seconds.',
      lead: 'Would you rather talk to an advisor?',
    },
  },

  // pages/index.astro
  homePage: {
    title: `Shipping from the United States to Nicaragua | US address in ${warehouse.city} | Carinova`,
    description: `Shipping from the United States to Nicaragua with your own US address in ${warehouse.city}: by air in ${air.transit} at ${formatUSD(air.pricePerLb)} per pound and by sea in ${sea.transit} from ${formatUSD(sea.pricePerLb)}. Pick up in ${cityNames.join(' or ')}.`,
    reviews: { tagline: 'Reviews', title: 'What our customers say', source: 'Google review' },
    calculator: {
      eyebrow: 'Shipping calculator for Nicaragua',
      title: ['Calculate', 'your shipment.'],
      intro: 'A clear estimate so you can decide better. No sign-up.',
    },
  },

  // pages/ingresar.astro
  signinPage: {
    tagline: 'My account',
    metaTitle: 'Sign in to my account',
    description:
      'Sign in to your Carinova account with your e-mail: we send you a code and you get in without a password. Your Carinova ID, your address in the United States, your packages and your payments are there.',
    title: 'Sign in to your account',
    subtitle: 'Handle everything from one place: your Carinova ID, your address, your packages and your payments.',
    howTitle: 'How it works',
    how: [
      {
        icon: 'tabler:mail',
        title: 'No password',
        text: 'There is nothing to remember and nothing to steal: every time you sign in we send a new code to your e-mail.',
      },
      {
        icon: 'tabler:clock',
        title: 'A code for one use',
        text: `It works only once and expires after ${LOGIN_CODE_MINUTES} minutes.`,
      },
      {
        icon: 'tabler:shield-lock',
        title: 'Your session, on this browser',
        text: `You stay signed in for ${SESSION_DAYS} days or until you sign out. On a shared device, sign out when you finish.`,
      },
    ],
    helpTitle: 'Can you not sign in?',
    helpText: 'Write to us with your Carinova ID or with the e-mail of your account.',
  },

  // pages/mi-cuenta.astro
  accountPage: {
    tagline: 'My account',
    metaTitle: 'My account: Carinova ID, packages and payments',
    description: `Sign in to your Carinova account: your Carinova ID, your address in the United States, your packages with their status and your payments. Pick up in ${cityNames.join(' or ')}.`,
    title: 'Your Carinova account',
    subtitle: 'Handle everything from one place: your Carinova ID, your address, your packages and your payments.',
    signin: 'Sign in to your account',
    noAccount: 'Do you not have an account yet?',
    includes: 'What you find in your account',
    looksLike: 'It looks like this',
    idFacts: [
      'The system assigns it when you confirm your e-mail.',
      'It is the same for air, sea, packages and assisted purchases.',
    ],
    company: 'Are you a company?',
    companyLink: 'See Carinova for business',
    fullAddress: 'You see the full address when you sign in.',
    stages: 'Every package, with its stage:',
    paymentFacts: [
      'Every invoice with its amount and its status.',
      'A payment shows as confirmed once our team verifies it.',
    ],
    pickup: 'You pick up in',
    homeDelivery: 'Home delivery',
    branches: 'See branches',
    closing: {
      title: 'Create your account in a couple of minutes',
      subtitle: 'You fill in a short form, confirm your e-mail and that is it: you have your Carinova ID.',
      lead: 'Any questions before you sign up?',
    },
  },

  // pages/nosotros.astro
  aboutPage: {
    tagline: 'About us',
    description: `Carinova is a Nicaraguan company that ships from the United States to Nicaragua, with branches in ${cityNames.join(' and ')}.`,
    title: 'We are Carinova',
    subtitle: `A Nicaraguan company that brings the stores of the United States closer to ${cityNames.join(' and ')}.`,
    logoAlt: 'Carinova logo: three people raise a lit torch together in front of a globe.',
    storyTitle: 'Our story',
    story: [
      'Carinova was born in Nicaragua with a simple idea: buying in the United States should be easy, safe and clearly priced for everyone.',
      `From our branches in ${cityNames.join(' and ')} we look after every customer personally, on WhatsApp and in person, and we make sure every purchase and every package reaches its destination safely.`,
    ],
    valuesTagline: 'Our values',
    valuesTitle: 'What moves us',
    values: [
      {
        title: 'Teamwork',
        description:
          'As in our logo: three people raising the same torch together. Every shipment is teamwork, from Miami to your branch.',
      },
      {
        title: 'International reach',
        description: 'The globe in our name is the bridge we cross every day between the United States and Nicaragua.',
      },
      {
        title: 'Commitment',
        description: 'The flame is our promise: to look after every package as if it were our own.',
      },
    ],
    where: 'Where we are',
    careers: {
      title: 'Join our team.',
      text: 'We are looking for people committed to service and operational excellence.',
      link: 'Find out how to apply',
    },
    closing: {
      title: 'Let us make your first shipment',
      subtitle: 'Create your account online or get a quote for your shipment before you buy.',
      lead: 'Would you like to know us better?',
    },
  },

  // pages/preguntas-frecuentes.astro
  faqPage: {
    tagline: 'Help',
    title: 'Frequently asked questions about shipping to Nicaragua',
    description:
      'US address and Carinova ID, services, rates, delivery times, restricted items and pickup: answers to the most common questions about shipping from the United States to Nicaragua with Carinova.',
    subtitle:
      'Everything about your account, the services, the rates, the delivery times and the pickup of your packages.',
    topics: 'Topics',
    closing: {
      title: 'Did you not find your answer?',
      subtitle: 'Write to us and we will help you, or start by creating your account.',
      lead: 'Tell us your question:',
    },
  },

  // pages/registro.astro
  signupPage: {
    tagline: 'My account',
    title: 'Create your account',
    description: `Create your account online and get your Carinova ID and your US address in ${warehouse.city}, to buy at any store and receive in ${cityNames.join(' or ')}.`,
    subtitle:
      'One sign-up. When you confirm your e-mail, the system assigns your Carinova ID automatically and shows you your address in the United States.',
    existing: 'Already have an account?',
    next: 'What happens next?',
    steps: [
      { title: 'Confirm your e-mail', description: 'We send you a link. Open it to activate your account.' },
      {
        title: 'Get your Carinova ID and your address in the United States',
        description: 'You see them on screen when you confirm, and they also reach you by e-mail.',
      },
      {
        title: 'Buy, and we bring it',
        description: `Use your address at the store, follow your package in your account and pick it up in ${cityNames.join(' or ')}.`,
      },
    ],
    helpTitle: 'Would you rather we help you?',
    helpText: 'Write to us and we will create your account through WhatsApp.',
  },

  // pages/servicios.astro
  servicesPage: {
    tagline: 'Services',
    metaTitle: 'Air and sea shipping to Nicaragua, packages and assisted purchases',
    description:
      'Air and sea shipping from the United States to Nicaragua, packages, assisted purchases, branch pickup and home delivery. Choose how your package travels and how you receive it.',
    title: 'Air and sea shipping from the United States to Nicaragua',
    subtitle: 'Every shipment combines three decisions: how it travels, who makes the purchase and how you receive it.',
    kinds: 'Kinds of service',
    closing: {
      title: 'Not sure what suits you?',
      subtitle: 'Get a quote and compare air with sea, or create your account and start buying.',
      lead: 'Would you like our advice?',
    },
  },

  // pages/sucursales.astro
  branchesPage: {
    tagline: 'Branches',
    title: `Branches in ${cityNames.join(' and ')}`,
    description: `Addresses, opening hours and WhatsApp of Carinova in ${cityNames.join(' and ')}.${sameHours ? ` ${sentence(`We are open ${describeHours(hours)}`)}` : ''}`,
    subtitle: sameHours
      ? sentence(`For now you pick up in ${cityNames.join(' and ')}, ${describeHours(hours)}`)
      : `For now you pick up in ${cityNames.join(' and ')}.`,
    closing: {
      title: 'Your next purchase, ready for pickup',
      subtitle: 'Create your account and get a quote for your shipment before you buy.',
      lead: 'Not sure which branch suits you for pickup?',
    },
  },

  // components/carinova/HomeHero.astro
  homeHero: {
    eyebrow: 'Shipping from the United States to Nicaragua',
    lead: 'Buy, ship and receive from the United States to Nicaragua. Easier than you imagine, with the mode that suits you.',
    facts: [`By air in ${air.transit}`, `By sea in ${sea.transit}`, `Pickup in ${cityNames.join(' and ')}`],
    emblemAlt: 'Carinova’s emblem: three people raise a burning torch together',
    origin: 'Origin',
    originPlace: `${warehouse.city}, USA`,
    destination: 'Destination',
    destinationPlace: 'Nicaragua',
    bridgeTitle: 'A bridge between two countries.',
    bridgeText: 'A simpler way to be close.',
    route: [warehouse.city, 'Nicaragua'],
    explore: 'Explore Carinova',
  },

  // components/carinova/ProofStrip.astro
  proofStrip: {
    label: 'Carinova in short',
    items: [
      { title: 'Two ways to ship', text: 'Choose speed or savings' },
      { title: `From ${warehouse.city} to Nicaragua`, text: 'One route, many possibilities' },
      { title: 'Your way', text: 'Personal, family or business' },
    ],
  },

  // components/carinova/Solutions.astro
  solutions: {
    eyebrow: 'Shipping solutions to Nicaragua',
    title: ['A solution for', 'every need.'],
    aside: 'Choose the path that suits you best. We show you the next step.',
    cards: {
      shopping: {
        label: 'Online shopping',
        title: 'Buy at your favourite stores in the United States and receive in Nicaragua',
        text: `Choose what you like and check out with your US address in ${warehouse.city}. We bring it to Nicaragua.`,
        action: 'Start shopping',
        imageAlt: '',
      },
      assisted: {
        label: 'Assisted purchase',
        title: 'Share the link. We help you buy.',
        text: 'Found something online? Send us the link and we guide you.',
        action: 'Request assistance',
        imageAlt: 'A person shares the link to a product from their phone',
      },
      family: {
        label: 'Family packages',
        title: 'Send your family packages',
        text: 'Because some packages carry more than things: they carry affection.',
        action: 'Ask about a package',
        imageAlt: 'A family opens a package that arrived from the United States',
      },
      business: {
        label: 'For business',
        title: 'Carinova Business: solutions designed at the pace of your business.',
        text: 'Your operation, on the move.',
        action: 'Let’s talk about your business',
        imageAlt: 'Boxes of merchandise ready for a business',
      },
    },
    stores: {
      label: 'Stores in the United States where you can buy',
      previous: 'Previous store',
      next: 'Next store',
      pause: 'Pause the stores carousel',
      play: 'Resume the stores carousel',
      disclosure:
        'The stores are shown as examples, with no agreement or endorsement implied. Prices and availability are checked on each store’s site.',
      all: 'See all the stores',
    },
    storeNotice:
      'Visit the store, choose your product and share the link with us. The purchase, its admissibility and the rate are verified before we handle the operation.',
    visit: 'Go to the store’s site',
    assist: 'Ask us to buy for you',
    restricted: 'Before you buy, check whether the item can enter',
    close: 'Close',
    assistTitle: 'Send the link. We go with you.',
    assistIntro:
      'Paste the link to the product and prepare your request. The cost of the purchase, the taxes and the freight are confirmed before we handle the operation.',
    script: {
      status: '{name}, store {index} of {total}.',
    },
  },

  // components/carinova/Tracker.astro and TrackingSection.astro
  tracker: {
    eyebrow: 'Package tracking',
    title: ['Know which stage', 'your shipment is at.'],
    intro:
      'Every package moves through clear stages, from the moment we receive it in the United States until it is in your hands. You follow it from your account, with its reference and its history.',
    stagesLabel: 'The stages of a package',
    switchLabel: 'What do you want to look up?',
    tabs: { track: 'Track a package', check: 'Can it enter?' },
    track: {
      title: 'Track your package',
      visitor:
        'Sign in to your account to see your packages: what we received at the warehouse, what is on its way and what you can already pick up.',
      signin: 'Sign in to see your packages',
      noAccount: 'Do you not have an account yet?',
      customer: 'Enter the reference of your package, or leave the field empty to see the ones on their way.',
      label: 'Package reference or tracking number',
      placeholder: 'E.g. PKG-000123',
      submit: 'Track',
      all: 'See all my packages and payments',
      privacy: 'For security, the Carinova ID alone does not authorise anyone to look up private data.',
    },
    check: {
      title: 'Can it enter Nicaragua?',
      intro:
        'Search for the item you want to bring. The result is initial guidance, not an authorisation to import or to transport it.',
      label: 'What do you want to bring?',
      placeholder: 'E.g. laptop, perfume, shoes…',
      examples: 'Try:',
      lists: 'See the full lists',
      ask: 'Ask on WhatsApp',
      note: 'It does not replace customs validation, permits or Carinova’s confirmation.',
      script: {
        idleTitle: 'Ask before you buy.',
        idleText: 'Write the name of the item to get some guidance.',
        unknownTitle: 'It is not on our lists',
        unknownText: 'That does not mean it can enter: some items need permits or a review. Ask us before you buy it.',
      },
    },
  },

  // components/carinova/Locations.astro
  locations: {
    eyebrow: `Branches in ${cityNames.join(' and ')}`,
    title: ['We are', 'closer.'],
    intro: 'Pick up your shipments at our branches or ask about delivery to other parts of Nicaragua.',
    country: 'Nicaragua',
    regions: { managua: 'Pacific · Capital', bluefields: 'South Caribbean Coast' },
    see: (city: string) => `See the ${city} branch`,
    ask: 'Ask for the location',
    mapLabel: `Illustrative map of Nicaragua with service points in ${cities.join(' and ')}`,
    mapCaption: 'Illustrative map: it does not show physical addresses or operating routes.',
    fine: 'Addresses, specific coverage and home delivery charges are confirmed when the delivery is arranged.',
    delivery: 'Ask about home delivery',
  },

  // components/widgets/Footer.astro
  footer: {
    channelsEyebrow: 'We are online',
    channelsTitle: 'Follow us and write to us',
    previous: 'Previous channels',
    next: 'More channels',
    email: 'E-mail',
    languages: 'Languages',
  },

  // src/navigation.ts and the layouts: the header, the footer and the trail of a page
  nav: {
    home: 'Home',
    services: 'Services',
    shopper: 'We shop for you',
    rates: 'Rates',
    calculator: 'Calculator',
    howItWorks: 'How it works',
    business: 'Business',
    help: 'Help',
    explore: 'Explore',
    yours: 'Your Carinova',
    near: 'We are close',
    canItEnter: 'Can it enter?',
    tracking: 'Tracking',
    faq: 'Frequently asked questions',
    about: 'About us',
    terms: 'Terms of service',
    privacy: 'Privacy',
    and: ' and ',
    or: ' or ',
    brand: 'Shipments that bring us together. We bring your purchases, your family and your company’s projects closer.',
    route: ['USA', 'Nicaragua'],
    rights: 'All rights reserved. Rates and delivery times are subject to verification.',
    language: 'Language',
    languageChoose: 'Choose your language',
    locker: `US address in ${warehouse.city}`,
    stores: 'Stores',
  },

  // components/common/Metadata.astro: what a page without its own title or description says
  meta: {
    title: `Shipping from the United States to Nicaragua | US address in ${warehouse.city} | Carinova`,
    description: `Shipping from the United States to Nicaragua with your own US address in ${warehouse.city}, by air or by sea. Create your account online and pick up in ${cityNames.join(' or ')}.`,
  },

  // The statuses of packages, invoices and payments (src/data/account.ts), by their id
  statuses: {
    package: byId<PackageStatus, StatusWords>(PACKAGE_STATUSES),
    invoice: byId<InvoiceState, StatusWords>(INVOICE_STATES),
    payment: byId<PaymentStatus, StatusWords>(PAYMENT_STATUSES),
    paymentMethod: byId<PaymentMethod, string>(PAYMENT_METHODS),
  },

  // What Carinova explores with a company and the options of its form (src/data/business.ts), by their id
  business: {
    solutions: byId<string, { title: string; text: string }>(BUSINESS_SOLUTIONS),
    disclaimer: BUSINESS_DISCLAIMER.en,
    volumes: byId<string, string>(BUSINESS_VOLUMES),
  },

  // pages/rastreo.astro and components/carinova/PackageLookup.astro
  trackPage: {
    tagline: 'Tracking',
    metaTitle: 'Tracking packages from the United States to Nicaragua',
    description:
      'Follow your packages from the United States to Nicaragua with Carinova: received at the warehouse, being prepared, in transit, available for delivery and delivered. Sign in to your account and track each shipment by its reference.',
    title: 'Track your package',
    subtitle: 'Sign in to your account and follow each shipment by its reference, stage by stage.',
    stagesTitle: 'The stages of your package',
    stagesIntro: 'This is how each shipment moves, from our warehouse in the United States to your hands.',
    results: {
      active: 'Your packages on their way',
      found: 'The result of your search',
      loading: 'Looking for your packages…',
      empty:
        'We have not received any packages in your name yet. When the first one reaches our warehouse you will see it here, with its stage.',
      none: 'You have no packages on their way right now.',
      notFoundHint: 'Check that it is written correctly: the reference starts with PKG and is shown in your account.',
      askMissing: 'Ask about this reference',
      ask: 'Ask about this package',
      history: 'See history',
      error: 'We could not load your packages. Check your connection and try again.',
      retry: 'Try again',
      script: {
        notFound: 'We could not find a package with the reference {reference} in your account.',
        summary: '{reference} · {service}',
      },
    },
    closing: {
      title: 'Do you not have an account yet?',
      subtitle: 'Create your account and follow every purchase from the moment it reaches our warehouse.',
      lead: 'Can you not find your package?',
    },
  },

  // components/carinova/ProductLinkForm.astro
  productLink: {
    label: 'Link to the product',
    placeholder: 'https://store.com/product',
    submit: 'Prepare request',
    hint: 'WhatsApp opens with your request ready to send. Nothing is bought until we confirm the total cost.',
    invalid: 'Paste the full link to the product: it starts with https://',
  },

  // pages/casillero-en-miami.astro
  lockerPage: {
    tagline: 'US address',
    metaTitle: `A US address in ${warehouse.city} for shipping to Nicaragua`,
    description: `Open your US address in ${warehouse.city} with Carinova for free: an address in the United States to buy at Amazon, SHEIN or Temu and receive in ${cityNames.join(' or ')}. By air in ${air.transit}, by sea in ${sea.transit}.`,
    title: `Your US address in ${warehouse.city}, for Nicaragua`,
    subtitle: `An address in the United States in your name, to buy at any store and receive in ${cityNames.join(' or ')}. It comes with your Carinova account.`,
    whatTitle: `What is a US address in ${warehouse.city} and how does it work?`,
    what: [
      'It is an address in the United States that you use as if you lived there: you write it as the shipping address when you buy online, the store delivers your package to our warehouse and we bring it to Nicaragua.',
      'In Nicaragua it is called a "casillero", and also a virtual or international mailbox: it is the same thing. At Carinova you do not sign up for it separately: it comes with your account.',
      'When you create your account you get your Carinova ID and your address. The Carinova ID is how we identify every package that arrives in your name.',
    ],
    addressTitle: 'Where we receive your purchases',
    addressNote: 'You see the full address when you create your account.',
    includesTitle: 'What your US address includes',
    includesLink: 'See everything in your account',
    costTitle: 'How much does a US address cost?',
    cost: 'Creating your account is free: you only pay for the shipping of each package, per pound or, by sea, also per cubic foot.',
    costLink: 'Work out what my shipment costs',
    stepsTitle: 'How to use your US address',
    stepsLink: 'See each step with examples',
    faqTitle: 'Questions about the US address and your account',
    closing: {
      title: 'Open your US address in a couple of minutes',
      subtitle: 'Create your account online and get your Carinova ID and your address in the United States.',
      lead: 'Any questions before you open it?',
    },
  },

  // pages/tiendas.astro
  storesPage: {
    tagline: 'Stores',
    metaTitle: 'Shop at Amazon, SHEIN and Temu from Nicaragua',
    description: `How to shop at Amazon, SHEIN, Temu, Walmart and other stores in the United States from Nicaragua: use the address of your Carinova account or ask us to buy for you, and receive in ${cityNames.join(' or ')}.`,
    title: 'Shop at stores in the United States from Nicaragua',
    subtitle:
      'Amazon, SHEIN, Temu, Walmart and many more: you buy with the address of your account and we bring it to Nicaragua.',
    howTitle: 'How to buy at a store in the United States',
    howLink: 'See each step with examples',
    restrictedLink: 'Check which items cannot enter',
    storesTitle: 'Stores where you can buy',
    storesIntro:
      'You can buy at any online store that delivers within the United States. These are some of the most searched, by category.',
    categories: 'Store categories',
    buyAt: (store: string) => `Shop at ${store} from Nicaragua`,
    visit: (store: string) => `Go to the ${store} site`,
    assist: 'Ask us to buy for you',
    disclosure:
      'The stores are shown as examples, with no agreement or endorsement implied. Prices, availability and the conditions of each purchase are checked on each store’s site.',
    assistTitle: 'Would you rather we buy for you?',
    assistIntro:
      'With an assisted purchase you choose the product and Carinova makes the purchase. Paste the link to the product and prepare your request.',
    closing: {
      title: 'Ready for your first purchase?',
      subtitle: 'Create your account and use your address in the United States at the store you prefer.',
      lead: 'Any questions about a store?',
    },
  },
};
