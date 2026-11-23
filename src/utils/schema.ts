// Structured data (schema.org) of the site: what search engines read about the company and what it
// offers. Everything here is built from src/config.yaml and src/data, in the language of the page,
// so it can only say what the page itself says: no rating, no review and no figure the site does
// not show. Used by the pages (it imports the site's configuration, which exists only inside Astro).
//
// The reviews of /opiniones are in the page as text and are not marked up as `Review` or
// `AggregateRating` on purpose (D-129): they were published on Facebook and Google, not here, and a
// company's own site gets no stars in search results for what is said about it. Marking them up
// would be claiming them as the site's own.
import { SITE } from 'astrowind:config';
import logoImage from '~/assets/favicons/apple-touch-icon.png';
import { CONTACT, ORIGIN, SOCIAL_LINKS } from '~/data/carinova';
import { ACTIVE_LOCALES, LOCALE_INFO, type PageI18n } from '~/i18n';

const site = SITE?.site ?? '';

/** The company, wherever a page refers to it. */
export const ORGANIZATION_ID = `${site}/#organization`;
export const WEBSITE_ID = `${site}/#website`;

/** The languages Carinova's team answers in. */
const SERVICE_LANGUAGES = ['Spanish', 'English'];

/** The company as every page that describes it says it: its name, its logo, how to reach it, its networks. */
const organization = ({ data, ui }: PageI18n) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE?.name,
  url: site,
  logo: new URL(logoImage.src, site).toString(),
  slogan: data.TAGLINE,
  description: ui.homePage.description,
  areaServed: { '@type': 'Country', name: 'Nicaragua' },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    telephone: `+${CONTACT.whatsapp}`,
    ...(CONTACT.email ? { email: CONTACT.email } : {}),
    availableLanguage: SERVICE_LANGUAGES,
  },
  ...(SOCIAL_LINKS.length ? { sameAs: SOCIAL_LINKS.map((link) => link.href) } : {}),
});

/**
 * The home page: the site, the company and the service with its two base rates. The rates are the
 * ones the page shows (RATES): a price per pound by air and by sea.
 */
export const homeSchema = (page: PageI18n) => {
  const { locale, data, ui } = page;
  const { RATES, BRANCHES } = data;
  const { air, sea } = RATES;
  const offer = (rate: typeof air, name: string) => ({
    '@type': 'Offer',
    name,
    itemOffered: { '@type': 'Service', name },
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: rate.pricePerLb,
      priceCurrency: 'USD',
      unitCode: 'LBR',
      unitText: 'lb',
    },
  });

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: SITE?.name,
      url: site,
      inLanguage: ACTIVE_LOCALES.map((item) => LOCALE_INFO[item].htmlLang),
      publisher: { '@id': ORGANIZATION_ID },
    },
    organization(page),
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${site}/#service`,
      name: ui.homePage.service,
      serviceType: ui.homePage.service,
      description: ui.homePage.description,
      inLanguage: LOCALE_INFO[locale].htmlLang,
      provider: { '@id': ORGANIZATION_ID },
      areaServed: [
        { '@type': 'Country', name: 'Nicaragua' },
        ...BRANCHES.map((branch) => ({ '@type': 'City', name: branch.city })),
      ],
      // Named as the opening of the home page names them: "Tarifas por modalidad", "Aéreo", "Marítimo".
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: ui.landing.heroRatesLabel,
        itemListElement: [offer(air, ui.landing.air), offer(sea, ui.landing.sea)],
      },
    },
  ];
};

/** What a page about the company says of itself: its address, its title and its description. */
export interface AboutPageFacts {
  /** The page's own address (its canonical one, in its language). */
  url: string;
  name: string;
  description: string;
}

/** A page of the site that is about the company, in the language it is written in. */
const pageAbout = (
  type: 'AboutPage' | 'CollectionPage',
  { locale }: PageI18n,
  { url, name, description }: AboutPageFacts
) => ({
  '@context': 'https://schema.org',
  '@type': type,
  '@id': `${url}#webpage`,
  url,
  name,
  description,
  inLanguage: LOCALE_INFO[locale].htmlLang,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORGANIZATION_ID },
});

/**
 * The page about Carinova (/nosotros): the page, and the company with what that page adds to it:
 * where it was born (Carinova's own words: ORIGIN) and the cities where it has branches. No
 * founding date, no founders and no street address: the page does not say them.
 */
export const aboutSchema = (page: PageI18n, facts: AboutPageFacts) => {
  const { BRANCHES } = page.data;
  return [
    { ...pageAbout('AboutPage', page, facts), mainEntity: { '@id': ORGANIZATION_ID } },
    {
      ...organization(page),
      description: facts.description,
      foundingLocation: {
        '@type': 'Place',
        name: ORIGIN.city,
        address: {
          '@type': 'PostalAddress',
          addressLocality: ORIGIN.city,
          addressRegion: ORIGIN.region,
          addressCountry: ORIGIN.countryCode,
        },
      },
      location: BRANCHES.map((branch) => ({
        '@type': 'Place',
        name: `${SITE?.name} ${branch.city}`,
        address: { '@type': 'PostalAddress', addressLocality: branch.city, addressCountry: ORIGIN.countryCode },
      })),
    },
  ];
};

/**
 * The page of reviews (/opiniones): a page about the company, and the company by its name. It names
 * no review, no rating and no count (see the top of this file).
 */
export const reviewsSchema = (page: PageI18n, facts: AboutPageFacts) => [
  pageAbout('CollectionPage', page, facts),
  { '@context': 'https://schema.org', '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE?.name, url: site },
];
