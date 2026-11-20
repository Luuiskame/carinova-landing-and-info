/**
 * What Carinova's home page (src/pages/index.astro) needs besides the business data of carinova.ts:
 * the limits of its forms, the icons of its lists and the stores it shows. The page is the one
 * Carinova wrote on 2026-11-18; its words are in src/i18n/ui/landing, its notices in notices.ts and
 * what the article search knows in articles.ts.
 *
 * No imports: the dictionaries read the limits, and the unit tests run this file on plain Node.
 */

/** The limits the forms of the home page check, and say in their messages. */
export const LANDING_LIMITS = {
  /** Product links a Personal Shopper request may carry. */
  links: 10,
  /** The most packages, pieces or units the calculator and the forms count. */
  quantity: 999,
  /** Digits of a phone number, whatever the country: the shortest and the longest. */
  phoneDigits: [8, 15] as [number, number],
  /** A link longer than this is not a product link. */
  urlLength: 2048,
};

/**
 * Where in Nicaragua a shipment goes, as Carinova's page lists it: the fifteen departments and the
 * two autonomous regions, each with the two letters Carinova gives it ("Managua (MG)"), in the
 * page's order. `state` is what the sign-up of the site calls the same place (src/data/signup.ts),
 * for the forms that are sent to the Worker. The two regions are named by the dictionary
 * (`uiNorthCaribbean`, `uiSouthCaribbean`); the departments keep their names in every language.
 */
export const DEPARTMENTS: ReadonlyArray<{ name: string; code: string; state: string; region?: 'north' | 'south' }> = [
  { name: 'Boaco', code: 'BO', state: 'Boaco' },
  { name: 'Carazo', code: 'CZ', state: 'Carazo' },
  { name: 'Chinandega', code: 'CH', state: 'Chinandega' },
  { name: 'Chontales', code: 'CT', state: 'Chontales' },
  { name: 'Estelí', code: 'ES', state: 'Estelí' },
  { name: 'Granada', code: 'GR', state: 'Granada' },
  { name: 'Jinotega', code: 'JI', state: 'Jinotega' },
  { name: 'León', code: 'LE', state: 'León' },
  { name: 'Madriz', code: 'MZ', state: 'Madriz' },
  { name: 'Managua', code: 'MG', state: 'Managua' },
  { name: 'Masaya', code: 'MS', state: 'Masaya' },
  { name: 'Matagalpa', code: 'MT', state: 'Matagalpa' },
  { name: 'Nueva Segovia', code: 'NS', state: 'Nueva Segovia' },
  { name: 'Río San Juan', code: 'RS', state: 'Río San Juan' },
  { name: 'Rivas', code: 'RI', state: 'Rivas' },
  { name: 'Costa Caribe Norte', code: 'CN', state: 'Costa Caribe Norte (RACCN)', region: 'north' },
  { name: 'Costa Caribe Sur', code: 'CS', state: 'Costa Caribe Sur (RACCS)', region: 'south' },
];
/** The department a form starts on. */
export const DEFAULT_DEPARTMENT = 'Managua';

/**
 * The languages in the order of the language menu of Carinova's page; the two the site adds come
 * after them.
 */
export const LANGUAGE_ORDER: ReadonlyArray<string> = ['es', 'en', 'pt', 'fr', 'zh', 'ru', 'ar'];

/**
 * The icon of each item of the two lists of the home page ("No se reciben ni transportan" and "No
 * ingresan por vía aérea"), in the order of `prohibitedList` and `noAirList` in the dictionaries,
 * which is the order of RESTRICTED_ITEMS.prohibited and .seaOnly: a new item needs its icon here
 * (landing.test.ts).
 */
export const RESTRICTED_ICONS = {
  prohibited: ['weapon', 'cigarette', 'vape', 'alcohol', 'propeller', 'radio', 'drone'],
  seaOnly: ['flame', 'battery', 'spray', 'perfume', 'aerosol'],
};

export interface LandingStore {
  /** Also the name of its logo file (src/assets/images/tiendas) and of its text in the dictionary. */
  id: string;
  name: string;
  /** The store's own site. */
  url: string;
}

/**
 * The stores of "Personal Shopper" on the home page, in the order Carinova lists them. `icon` is
 * what the tile shows if the logo does not load. What each one is: `landing.store` in the
 * dictionaries. Examples of where customers buy: no agreement with Carinova is implied, and the
 * logos are trademarks of their owners (docs/PROJECT-LOG.md → D-106).
 */
export const FEATURED_STORES: Array<LandingStore & { icon: string }> = [
  { id: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/', icon: 'box' },
  { id: 'shein', name: 'Shein', url: 'https://us.shein.com/', icon: 'hanger' },
  { id: 'temu', name: 'Temu', url: 'https://www.temu.com/', icon: 'cart' },
  { id: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/', icon: 'cart' },
  { id: 'aliexpress', name: 'AliExpress', url: 'https://www.aliexpress.com/', icon: 'cart' },
  { id: 'ebay', name: 'eBay', url: 'https://www.ebay.com/', icon: 'gavel' },
  { id: 'apple', name: 'Apple', url: 'https://www.apple.com/', icon: 'device' },
  { id: 'samsung', name: 'Samsung', url: 'https://www.samsung.com/us/', icon: 'device' },
  { id: 'bestbuy', name: 'Best Buy', url: 'https://www.bestbuy.com/', icon: 'laptop' },
  { id: 'nike', name: 'Nike', url: 'https://www.nike.com/', icon: 'sneaker' },
  { id: 'adidas', name: 'Adidas', url: 'https://www.adidas.com/us', icon: 'sneaker' },
  { id: 'target', name: 'Target', url: 'https://www.target.com/', icon: 'bag' },
  { id: 'victoriassecret', name: "Victoria's Secret", url: 'https://www.victoriassecret.com/', icon: 'hanger' },
  { id: 'bathandbodyworks', name: 'Bath & Body Works', url: 'https://www.bathandbodyworks.com/', icon: 'perfume' },
  { id: 'macys', name: "Macy's", url: 'https://www.macys.com/', icon: 'bag' },
  { id: 'oldnavy', name: 'Old Navy', url: 'https://oldnavy.gap.com/', icon: 'hanger' },
  { id: 'carters', name: "Carter's", url: 'https://www.carters.com/', icon: 'hanger' },
];

export interface StoreCategory {
  /** Its name is `landing.cat[id]` in the dictionaries. */
  id: string;
  icon: string;
  stores: Array<LandingStore>;
}

/**
 * The directory behind "Y más": a hundred stores of the United States in ten categories, each in
 * the order Carinova gave (the most asked for first). The home page loads it, and the logos, only
 * when the directory is opened.
 */
export const STORE_DIRECTORY: Array<StoreCategory> = [
  {
    id: 'deals',
    icon: 'cart',
    stores: [
      { id: 'amazon', name: 'Amazon', url: 'https://www.amazon.com/' },
      { id: 'shein', name: 'Shein', url: 'https://us.shein.com/' },
      { id: 'temu', name: 'Temu', url: 'https://www.temu.com/' },
      { id: 'walmart', name: 'Walmart', url: 'https://www.walmart.com/' },
      { id: 'aliexpress', name: 'AliExpress', url: 'https://www.aliexpress.com/' },
      { id: 'ebay', name: 'eBay', url: 'https://www.ebay.com/' },
      { id: 'target', name: 'Target', url: 'https://www.target.com/' },
      { id: 'etsy', name: 'Etsy', url: 'https://www.etsy.com/' },
      { id: 'fivebelow', name: 'Five Below', url: 'https://www.fivebelow.com/' },
      { id: 'dollartree', name: 'Dollar Tree', url: 'https://www.dollartree.com/' },
    ],
  },
  {
    id: 'fashion',
    icon: 'hanger',
    stores: [
      { id: 'oldnavy', name: 'Old Navy', url: 'https://oldnavy.gap.com/' },
      { id: 'macys', name: "Macy's", url: 'https://www.macys.com/' },
      { id: 'hm', name: 'H&M', url: 'https://www2.hm.com/en_us/' },
      { id: 'zara', name: 'Zara', url: 'https://www.zara.com/us/' },
      { id: 'nordstrom', name: 'Nordstrom', url: 'https://www.nordstrom.com/' },
      { id: 'kohls', name: "Kohl's", url: 'https://www.kohls.com/' },
      { id: 'forever21', name: 'Forever 21', url: 'https://www.forever21.com/' },
      { id: 'fashionnova', name: 'Fashion Nova', url: 'https://www.fashionnova.com/' },
      { id: 'gap', name: 'Gap', url: 'https://www.gap.com/' },
      { id: 'jcpenney', name: 'JCPenney', url: 'https://www.jcpenney.com/' },
    ],
  },
  {
    id: 'sport',
    icon: 'sneaker',
    stores: [
      { id: 'nike', name: 'Nike', url: 'https://www.nike.com/' },
      { id: 'adidas', name: 'Adidas', url: 'https://www.adidas.com/us' },
      { id: 'underarmour', name: 'Under Armour', url: 'https://www.underarmour.com/' },
      { id: 'newbalance', name: 'New Balance', url: 'https://www.newbalance.com/' },
      { id: 'skechers', name: 'Skechers', url: 'https://www.skechers.com/' },
      { id: 'footlocker', name: 'Foot Locker', url: 'https://www.footlocker.com/' },
      { id: 'puma', name: 'Puma', url: 'https://us.puma.com/' },
      { id: 'crocs', name: 'Crocs', url: 'https://www.crocs.com/' },
      { id: 'gymshark', name: 'Gymshark', url: 'https://www.gymshark.com/' },
      { id: 'converse', name: 'Converse', url: 'https://www.converse.com/' },
    ],
  },
  {
    id: 'tech',
    icon: 'laptop',
    stores: [
      { id: 'apple', name: 'Apple', url: 'https://www.apple.com/' },
      { id: 'samsung', name: 'Samsung', url: 'https://www.samsung.com/us/' },
      { id: 'bestbuy', name: 'Best Buy', url: 'https://www.bestbuy.com/' },
      { id: 'newegg', name: 'Newegg', url: 'https://www.newegg.com/' },
      { id: 'bh', name: 'B&H Photo', url: 'https://www.bhphotovideo.com/' },
      { id: 'dell', name: 'Dell', url: 'https://www.dell.com/' },
      { id: 'hp', name: 'HP', url: 'https://www.hp.com/' },
      { id: 'lenovo', name: 'Lenovo', url: 'https://www.lenovo.com/us/' },
      { id: 'gamestop', name: 'GameStop', url: 'https://www.gamestop.com/' },
      { id: 'logitech', name: 'Logitech', url: 'https://www.logitech.com/' },
    ],
  },
  {
    id: 'beauty',
    icon: 'perfume',
    stores: [
      { id: 'victoriassecret', name: "Victoria's Secret", url: 'https://www.victoriassecret.com/' },
      { id: 'bathandbodyworks', name: 'Bath & Body Works', url: 'https://www.bathandbodyworks.com/' },
      { id: 'sephora', name: 'Sephora', url: 'https://www.sephora.com/' },
      { id: 'ulta', name: 'Ulta Beauty', url: 'https://www.ulta.com/' },
      { id: 'coach', name: 'Coach', url: 'https://www.coach.com/' },
      { id: 'mac', name: 'MAC Cosmetics', url: 'https://www.maccosmetics.com/' },
      { id: 'elf', name: 'e.l.f. Cosmetics', url: 'https://www.elfcosmetics.com/' },
      { id: 'fenty', name: 'Fenty Beauty', url: 'https://fentybeauty.com/' },
      { id: 'pandora', name: 'Pandora', url: 'https://us.pandora.net/' },
      { id: 'michaelkors', name: 'Michael Kors', url: 'https://www.michaelkors.com/' },
    ],
  },
  {
    id: 'kids',
    icon: 'users',
    stores: [
      { id: 'carters', name: "Carter's", url: 'https://www.carters.com/' },
      { id: 'oshkosh', name: "OshKosh B'gosh", url: 'https://www.oshkosh.com/' },
      { id: 'childrensplace', name: "The Children's Place", url: 'https://www.childrensplace.com/' },
      { id: 'buybuybaby', name: 'buybuy BABY', url: 'https://www.buybuybaby.com/' },
      { id: 'lego', name: 'LEGO', url: 'https://www.lego.com/' },
      { id: 'mattel', name: 'Mattel', url: 'https://shop.mattel.com/' },
      { id: 'hasbro', name: 'Hasbro Pulse', url: 'https://hasbropulse.com/' },
      { id: 'nintendo', name: 'Nintendo', url: 'https://www.nintendo.com/us/store/' },
      { id: 'hannaandersson', name: 'Hanna Andersson', url: 'https://www.hannaandersson.com/' },
      { id: 'melissadoug', name: 'Melissa & Doug', url: 'https://www.melissaanddoug.com/' },
    ],
  },
  {
    id: 'home',
    icon: 'sofa',
    stores: [
      { id: 'homedepot', name: 'Home Depot', url: 'https://www.homedepot.com/' },
      { id: 'lowes', name: "Lowe's", url: 'https://www.lowes.com/' },
      { id: 'wayfair', name: 'Wayfair', url: 'https://www.wayfair.com/' },
      { id: 'ikea', name: 'IKEA', url: 'https://www.ikea.com/us/' },
      { id: 'bedbath', name: 'Bed Bath & Beyond', url: 'https://www.bedbathandbeyond.com/' },
      { id: 'williamssonoma', name: 'Williams Sonoma', url: 'https://www.williams-sonoma.com/' },
      { id: 'potterybarn', name: 'Pottery Barn', url: 'https://www.potterybarn.com/' },
      { id: 'crateandbarrel', name: 'Crate & Barrel', url: 'https://www.crateandbarrel.com/' },
      { id: 'acehardware', name: 'Ace Hardware', url: 'https://www.acehardware.com/' },
      { id: 'kirklands', name: "Kirkland's", url: 'https://www.kirklands.com/' },
    ],
  },
  {
    id: 'health',
    icon: 'plus',
    stores: [
      { id: 'cvs', name: 'CVS', url: 'https://www.cvs.com/' },
      { id: 'walgreens', name: 'Walgreens', url: 'https://www.walgreens.com/' },
      { id: 'gnc', name: 'GNC', url: 'https://www.gnc.com/' },
      { id: 'vitacost', name: 'Vitacost', url: 'https://www.vitacost.com/' },
      { id: 'vitaminshoppe', name: 'The Vitamin Shoppe', url: 'https://www.vitaminshoppe.com/' },
      { id: 'thorne', name: 'Thorne', url: 'https://www.thorne.com/' },
      { id: 'lifeextension', name: 'Life Extension', url: 'https://www.lifeextension.com/' },
      { id: 'swanson', name: 'Swanson', url: 'https://www.swansonvitamins.com/' },
      { id: 'chewy', name: 'Chewy', url: 'https://www.chewy.com/' },
      { id: 'petco', name: 'Petco', url: 'https://www.petco.com/' },
    ],
  },
  {
    id: 'auto',
    icon: 'propeller',
    stores: [
      { id: 'autozone', name: 'AutoZone', url: 'https://www.autozone.com/' },
      { id: 'advance', name: 'Advance Auto Parts', url: 'https://shop.advanceautoparts.com/' },
      { id: 'oreilly', name: "O'Reilly Auto Parts", url: 'https://www.oreillyauto.com/' },
      { id: 'napa', name: 'NAPA Auto Parts', url: 'https://www.napaonline.com/' },
      { id: 'carparts', name: 'CarParts.com', url: 'https://www.carparts.com/' },
      { id: 'tirerack', name: 'Tire Rack', url: 'https://www.tirerack.com/' },
      { id: 'harborfreight', name: 'Harbor Freight', url: 'https://www.harborfreight.com/' },
      { id: 'northerntool', name: 'Northern Tool', url: 'https://www.northerntool.com/' },
      { id: 'westmarine', name: 'West Marine', url: 'https://www.westmarine.com/' },
      { id: 'basspro', name: 'Bass Pro Shops', url: 'https://www.basspro.com/' },
    ],
  },
  {
    id: 'business',
    icon: 'warehouse',
    stores: [
      { id: 'costco', name: 'Costco', url: 'https://www.costco.com/' },
      { id: 'samsclub', name: "Sam's Club", url: 'https://www.samsclub.com/' },
      { id: 'uline', name: 'Uline', url: 'https://www.uline.com/' },
      { id: 'webstaurant', name: 'WebstaurantStore', url: 'https://www.webstaurantstore.com/' },
      { id: 'staples', name: 'Staples', url: 'https://www.staples.com/' },
      { id: 'officedepot', name: 'Office Depot', url: 'https://www.officedepot.com/' },
      { id: 'grainger', name: 'Grainger', url: 'https://www.grainger.com/' },
      { id: 'quill', name: 'Quill', url: 'https://www.quill.com/' },
      { id: 'cdw', name: 'CDW', url: 'https://www.cdw.com/' },
      { id: 'mcmaster', name: 'McMaster-Carr', url: 'https://www.mcmaster.com/' },
    ],
  },
];

/**
 * How large each logo is drawn, so a wide wordmark and a square emblem weigh the same to the eye:
 * a share of the height a logo may take (Carinova's "corrección óptica"), by the store's id.
 */
export const LOGO_SCALE: Record<string, number> = {
  amazon: 0.583,
  shein: 0.463,
  temu: 1,
  walmart: 0.492,
  aliexpress: 0.489,
  ebay: 0.637,
  target: 1,
  etsy: 0.692,
  fivebelow: 0.387,
  dollartree: 0.332,
  oldnavy: 0.575,
  macys: 0.536,
  hm: 0.814,
  zara: 0.652,
  nordstrom: 0.364,
  kohls: 0.397,
  forever21: 0.418,
  fashionnova: 0.36,
  gap: 0.869,
  jcpenney: 0.487,
  nike: 0.601,
  adidas: 0.772,
  underarmour: 0.766,
  newbalance: 0.743,
  skechers: 0.315,
  footlocker: 0.336,
  puma: 0.707,
  crocs: 0.998,
  gymshark: 0.417,
  converse: 0.821,
  apple: 1.107,
  samsung: 0.4,
  bestbuy: 0.767,
  newegg: 0.477,
  bh: 0.843,
  dell: 1,
  hp: 0.999,
  lenovo: 0.577,
  gamestop: 0.463,
  logitech: 0.556,
  victoriassecret: 0.575,
  bathandbodyworks: 0.322,
  sephora: 0.37,
  ulta: 0.64,
  coach: 0.54,
  mac: 0.337,
  elf: 1,
  fenty: 0.398,
  pandora: 0.459,
  michaelkors: 0.319,
  carters: 0.468,
  oshkosh: 0.674,
  childrensplace: 0.598,
  buybuybaby: 0.71,
  lego: 1,
  mattel: 0.999,
  hasbro: 1.047,
  nintendo: 0.501,
  hannaandersson: 0.407,
  melissadoug: 0.551,
  homedepot: 1,
  lowes: 0.681,
  wayfair: 0.489,
  ikea: 0.614,
  bedbath: 1,
  williamssonoma: 0.392,
  potterybarn: 0.277,
  crateandbarrel: 0.387,
  acehardware: 0.784,
  kirklands: 0.52,
  cvs: 0.369,
  walgreens: 0.462,
  gnc: 0.442,
  vitacost: 0.579,
  vitaminshoppe: 0.615,
  thorne: 0.397,
  lifeextension: 1,
  swanson: 0.694,
  chewy: 0.553,
  petco: 0.594,
  autozone: 0.362,
  advance: 0.669,
  oreilly: 0.462,
  napa: 0.938,
  carparts: 0.399,
  tirerack: 0.473,
  harborfreight: 0.402,
  northerntool: 0.527,
  westmarine: 0.492,
  basspro: 0.935,
  costco: 0.548,
  samsclub: 0.441,
  uline: 0.608,
  webstaurant: 1,
  staples: 0.429,
  officedepot: 0.344,
  grainger: 0.484,
  quill: 0.632,
  cdw: 0.734,
  mcmaster: 0.377,
};
