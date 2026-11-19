// Structured data (schema.org) of the site: what search engines read about the company and what it
// offers. Everything here is built from src/config.yaml and src/data, in the language of the page,
// so it can only say what the page itself says: no rating, no review and no figure the site does
// not show. Used by the pages (it imports the site's configuration, which exists only inside Astro).
import { SITE } from 'astrowind:config';
import logoImage from '~/assets/favicons/apple-touch-icon.png';
import { CONTACT, SOCIAL_LINKS } from '~/data/carinova';
import { ACTIVE_LOCALES, LOCALE_INFO, type PageI18n } from '~/i18n';

const site = SITE?.site ?? '';

/** The company, wherever a page refers to it. */
export const ORGANIZATION_ID = `${site}/#organization`;
export const WEBSITE_ID = `${site}/#website`;

/** The languages Carinova's team answers in. */
const SERVICE_LANGUAGES = ['Spanish', 'English'];

/**
 * The home page: the site, the company and the service with its two base rates. The rates are the
 * ones the page shows (RATES): a price per pound by air and by sea.
 */
export const homeSchema = ({ locale, data, ui }: PageI18n) => {
  const { RATES, TAGLINE, BRANCHES } = data;
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
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: SITE?.name,
      url: site,
      logo: new URL(logoImage.src, site).toString(),
      slogan: TAGLINE,
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
    },
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
