/**
 * Arabic wording of ../carinova.ts: the same exports with the same shapes, for the Arabic version
 * of the site (src/i18n). Facts are not repeated here: every price, number, address and id is taken
 * from the Spanish file and only the words around it are written again, so the languages cannot
 * disagree on a fact. src/i18n/translations.test.ts checks that nothing is left untranslated.
 *
 * Modern Standard Arabic, speaking to the customer in the singular. Digits stay Western (0–9), as
 * the prices and times the code writes. The names of the cities are written in Arabic letters, here
 * in the data, so every sentence that names them reads the same.
 *
 * Like ../carinova.ts, the Worker bundles this file: relative imports with the .ts extension only.
 */
import * as es from '../carinova.ts';
import type { Branch, DayOfWeek, OpeningHours, RestrictedGroupId, Store, StoreCategoryId } from '../carinova.ts';

/** "أ، ب وج": the last item takes "و", joined to it as Arabic writes it. */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join('، ')} و${items[items.length - 1]}`;

export const TAGLINE = 'شحنات تجمعنا';
export const HEADLINE: [string, string] = ['من هناك', 'إلى هنا.'];
export const VALUE_PROPOSITION =
  'ننقل مشترياتك الشخصية وطرودك العائلية وبضائع شركتك من الولايات المتحدة إلى نيكاراغوا.';

export const CTA: typeof es.CTA = {
  signup: { ...es.CTA.signup, text: 'أنشئ حسابك' },
  quote: { ...es.CTA.quote, text: 'احسب تكلفة شحنتك' },
  help: { text: 'مساعدة عبر WhatsApp' },
  account: { ...es.CTA.account, text: 'انتقل إلى حسابي', short: 'حسابي' },
  signin: { ...es.CTA.signin, text: 'تسجيل الدخول', short: 'تسجيل الدخول' },
  track: { ...es.CTA.track, text: 'تتبّع شحنتك' },
};

/** "08:00" → "8:00 ص", "17:00" → "5:00 م" */
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'ص' : 'م'}`;
};

/** "8:00 ص – 5:00 م" */
export const formatHours = ({ opens, closes }: OpeningHours): string => `${formatTime(opens)} – ${formatTime(closes)}`;

/** "من الاثنين إلى السبت، من 8:00 ص إلى 5:00 م": opening hours inside a sentence. */
export const describeHours = (hours: OpeningHours): string =>
  `${hours.days}، من ${formatTime(hours.opens)} إلى ${formatTime(hours.closes)}`;

const WEEK: Array<DayOfWeek> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NAMES = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];

/** The days a branch opens, from the structured list: "من الاثنين إلى السبت", or the days one by one. */
const daysOf = (days: Array<DayOfWeek>): string => {
  const order = days.map((day) => WEEK.indexOf(day)).sort((a, b) => a - b);
  const inARow = order.every((day, index) => index === 0 || day === order[index - 1] + 1);
  return order.length > 2 && inARow
    ? `من ${DAY_NAMES[order[0]]} إلى ${DAY_NAMES[order[order.length - 1]]}`
    : listOf(order.map((day) => DAY_NAMES[day]));
};

/** The cities as Arabic writes them, by the id of the branch or of the warehouse. */
const CITY_NAMES: Record<string, string> = {
  managua: 'ماناغوا',
  bluefields: 'بلوفيلدز',
  miami: 'ميامي',
  'los-angeles': 'لوس أنجلوس',
};
const STATE_NAMES: Record<string, string> = { Florida: 'فلوريدا', California: 'كاليفورنيا' };

export const BRANCHES: Array<Branch> = es.BRANCHES.map((branch) => ({
  ...branch,
  city: CITY_NAMES[branch.id] ?? branch.city,
  // A real address is the same in every language; only the placeholder is words.
  address: branch.address === es.ADDRESS_PENDING ? 'العنوان قيد التأكيد' : branch.address,
  hours: branch.hours.map((row) => ({ ...row, days: daysOf(row.dayOfWeek) })),
}));

export const RECEPTION_POINTS: typeof es.RECEPTION_POINTS = es.RECEPTION_POINTS.map((point) => ({
  ...point,
  city: CITY_NAMES[point.id] ?? point.city,
  state: STATE_NAMES[point.state] ?? point.state,
}));

/** When packages are received in the United States, in this language. */
export const RECEPTION_HOURS: OpeningHours = {
  ...es.RECEPTION_HOURS,
  days: daysOf(es.RECEPTION_HOURS.dayOfWeek),
};

/** How Arabic counts days after a number: "3 أيام", "20 يومًا", "100 يوم". */
const daysAfter = (count: number): string => {
  const rest = count % 100;
  if (rest >= 3 && rest <= 10) return 'أيام';
  if (rest >= 11) return 'يومًا';
  return 'يوم';
};

/** "من 3 إلى 4 أيام", "من 15 إلى 20 يومًا": the word for the days follows the last number. */
const transit = ([min, max]: [number, number]): string => `من ${min} إلى ${max} ${daysAfter(max)}`;

const DEVICE_NAMES: Record<string, { name: string; plural: string }> = {
  celular: { name: 'هاتف محمول', plural: 'هواتف محمولة' },
  tablet: { name: 'جهاز لوحي', plural: 'أجهزة لوحية' },
  laptop: { name: 'حاسوب محمول', plural: 'حواسيب محمولة' },
  xbox: { name: 'Xbox', plural: 'Xbox' },
  playstation: { name: 'PlayStation', plural: 'PlayStation' },
};

export const RATES: typeof es.RATES = {
  ...es.RATES,
  transitFrom: 'اعتبارًا من الاستلام الفعلي لطردك',
  air: { ...es.RATES.air, name: 'شحن جوي', badge: 'الأسرع', transit: transit(es.RATES.air.transitDays) },
  sea: { ...es.RATES.sea, name: 'شحن بحري', badge: 'الأوفر', transit: transit(es.RATES.sea.transitDays) },
  electronics: {
    ...es.RATES.electronics,
    name: 'الإلكترونيات',
    transit: transit(es.RATES.electronics.transitDays),
    items: es.RATES.electronics.items.map((item) => ({ ...item, ...DEVICE_NAMES[item.id] })),
  },
  notes: [
    'تُحتسب مدد التسليم اعتبارًا من الاستلام الفعلي للطرد، وقد تتغير بحسب النقل والجمارك والوجهة.',
    'نتحقق من الوزن والأبعاد وطريقة النقل والتغطية وشروط الخدمة.',
    'تشمل الأسعار التأمين والضرائب حين تنطبق على الشحنة. وتخضع التغطية والحدود والاستثناءات والرسوم الإضافية لشروط الخدمة.',
    'أسعار الإلكترونيات خاصة بالشحن الجوي، وتُحتسب لكل وحدة.',
    `عند الحساب بالوزن، تُحتسب كل شحنة بحد أدنى قدره ${es.RATES.minimumLb} رطل.`,
  ],
};

export const MIAMI_ADDRESS: typeof es.MIAMI_ADDRESS = {
  ...es.MIAMI_ADDRESS,
  notes: [
    'اكتب الاسم الأول واسم العائلة كما هما هنا تمامًا: بهما نتعرّف على طرودك.',
    'للشحن البحري، راسلنا عبر WhatsApp قبل أن تشتري.',
  ],
};

/** The labels already carry Spanish and English, as on Carinova's graphic: store checkouts are in English. */
export const miamiAddressRows = es.miamiAddressRows;

/**
 * The names of the items, in the order of the Spanish lists, with the words an Arabic speaker may
 * type for each one, without vowel marks (the search removes them). The Spanish words still match
 * too: visitors mix languages.
 */
const RESTRICTED_TEXT: Record<
  RestrictedGroupId,
  { title: string; summary: string; items: Array<{ name: string; match: Array<string> }> }
> = {
  notYet: {
    title: 'غير مصرّح لنا بنقلها بعد',
    summary: 'لم نحصل بعد على تصريح بنقلها.',
    items: [
      {
        name: 'السيارات',
        match: ['سيارة', 'سيارات', 'السيارة', 'السيارات', 'مركبة', 'مركبات', 'المركبات', 'شاحنة', 'شاحنات', 'بيك اب'],
      },
      {
        name: 'الدراجات النارية',
        match: [
          'دراجة نارية',
          'دراجات نارية',
          'الدراجة النارية',
          'الدراجات النارية',
          'موتوسيكل',
          'موتوسيكلات',
          'سكوتر',
        ],
      },
      {
        name: 'الآلات الثقيلة',
        match: [
          'آلات ثقيلة',
          'الآلات الثقيلة',
          'معدات ثقيلة',
          'المعدات الثقيلة',
          'حفارة',
          'حفارات',
          'جرافة',
          'جرافات',
          'جرار زراعي',
          'جرارات زراعية',
          'تراكتور',
          'رافعة شوكية',
        ],
      },
    ],
  },
  prohibited: {
    title: 'ممنوع استلامها ونقلها',
    summary: 'لا نستلمها ولا ننقلها.',
    items: [
      {
        name: 'الأسلحة والذخائر وملحقاتها',
        match: [
          'سلاح',
          'أسلحة',
          'السلاح',
          'الأسلحة',
          'مسدس',
          'مسدسات',
          'بندقية',
          'بنادق',
          'ذخيرة',
          'ذخائر',
          'الذخيرة',
          'الذخائر',
          'رصاصة',
          'رصاصات',
          'طلقات',
        ],
      },
      {
        name: 'التبغ والسجائر ومشتقاتها',
        match: ['تبغ', 'التبغ', 'سيجارة', 'سجائر', 'السجائر', 'سيجار', 'السيجار', 'معسل'],
      },
      {
        name: 'السجائر الإلكترونية',
        match: [
          'سيجارة إلكترونية',
          'سجائر إلكترونية',
          'السيجارة الإلكترونية',
          'السجائر الإلكترونية',
          'شيشة إلكترونية',
          'فيب',
          'الفيب',
          'فيبات',
          'فايب',
        ],
      },
      {
        name: 'المشروبات الكحولية',
        match: [
          'مشروب كحولي',
          'مشروبات كحولية',
          'المشروبات الكحولية',
          'خمر',
          'الخمر',
          'خمور',
          'الخمور',
          'نبيذ',
          'النبيذ',
          'بيرة',
          'البيرة',
          'ويسكي',
          'فودكا',
          'روم',
          'تكيلا',
        ],
      },
      {
        name: 'ملحقات الطائرات',
        match: ['طائرة', 'طائرات', 'الطائرة', 'الطائرات', 'ملحقات الطائرات', 'قطع غيار الطائرات', 'قطع طائرات'],
      },
      {
        name: 'أجهزة الإرسال اللاسلكي',
        match: [
          'جهاز إرسال',
          'أجهزة إرسال',
          'أجهزة الإرسال',
          'جهاز لاسلكي',
          'أجهزة لاسلكية',
          'جهاز إرسال لاسلكي',
          'أجهزة الإرسال اللاسلكي',
          'مرسل لاسلكي',
          'جهاز إرسال راديو',
          'ووكي توكي',
        ],
      },
      {
        name: 'الطائرات المسيّرة',
        match: [
          'درون',
          'الدرون',
          'درونز',
          'طائرة مسيرة',
          'طائرات مسيرة',
          'الطائرة المسيرة',
          'الطائرات المسيرة',
          'طائرة بدون طيار',
          'طائرات بدون طيار',
          'مسيرة',
          'مسيرات',
        ],
      },
    ],
  },
  seaOnly: {
    title: 'لا تُشحن جوًا، لكن تُشحن بحرًا',
    summary: 'لا يمكن نقلها بالطائرة: نشحنها بحرًا.',
    items: [
      {
        name: 'المنتجات القابلة للاشتعال',
        match: [
          'قابل للاشتعال',
          'قابلة للاشتعال',
          'القابلة للاشتعال',
          'مواد قابلة للاشتعال',
          'وقود',
          'الوقود',
          'بنزين',
          'البنزين',
          'طلاء',
          'مذيب',
          'مذيبات',
          'تنر',
          'كحول',
          'الكحول',
        ],
      },
      {
        name: 'بطاريات الليثيوم المنفصلة',
        match: [
          'بطارية',
          'بطاريات',
          'البطارية',
          'البطاريات',
          'بطارية ليثيوم',
          'بطاريات ليثيوم',
          'بطارية الليثيوم',
          'بطاريات الليثيوم',
          'ليثيوم',
          'الليثيوم',
          'باور بانك',
          'باوربانك',
          'شاحن متنقل',
          'بطارية متنقلة',
        ],
      },
      {
        name: 'بخاخات الجسم المعطّرة',
        match: [
          'بخاخ الجسم',
          'بخاخات الجسم',
          'بخاخ جسم',
          'معطر جسم',
          'معطر الجسم',
          'معطرات الجسم',
          'بادي سبراي',
          'بودي سبراي',
          'بادي سبلاش',
          'كولونيا',
          'الكولونيا',
        ],
      },
      { name: 'العطور', match: ['عطر', 'عطور', 'العطر', 'العطور', 'عطورات', 'برفان', 'بارفان'] },
      {
        name: 'عبوات الرذاذ المضغوط (الأيروسول)',
        match: [
          'أيروسول',
          'الأيروسول',
          'رذاذ',
          'عبوة رذاذ',
          'عبوات الرذاذ',
          'بخاخ',
          'بخاخات',
          'البخاخات',
          'سبراي',
          'مزيل عرق بخاخ',
          'مزيل العرق البخاخ',
          'سبراي شعر',
          'مثبت شعر',
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

export const RESTRICTED_EXAMPLES = ['عطر', 'درون', 'بطارية ليثيوم', 'دراجة نارية', 'سيجارة إلكترونية'];

const CATEGORY_NAMES: Record<StoreCategoryId, string> = {
  moda: 'الأزياء',
  tecnologia: 'التكنولوجيا',
  hogar: 'المنزل',
  marketplaces: 'منصات التسوق',
  belleza: 'الجمال',
};

export const STORE_CATEGORIES: typeof es.STORE_CATEGORIES = es.STORE_CATEGORIES.map((category) => ({
  ...category,
  name: CATEGORY_NAMES[category.id],
}));

const STORE_TEXT: Record<string, Pick<Store, 'tagline' | 'about'>> = {
  amazon: {
    tagline: 'عالم من الفئات في مكان واحد.',
    about: 'تصفّح مستلزمات المنزل والكتب والإكسسوارات والتكنولوجيا ومنتجات أخرى كثيرة.',
  },
  shein: {
    tagline: 'أزياء وإكسسوارات لكل الأذواق.',
    about: 'ملابس وحقائب وإكسسوارات. تحقّق من المقاسات والخامات والتوفّر.',
  },
  temu: {
    tagline: 'منتجات تكتشفها وتقارن بينها.',
    about: 'مستلزمات المنزل والإكسسوارات ومشتريات الحياة اليومية. راجع وصف كل منتج.',
  },
  walmart: {
    tagline: 'مشتريات للبيت والعائلة.',
    about: 'مستلزمات المنزل وأدوات التنظيم والإكسسوارات والاستخدام الشخصي.',
  },
  'best-buy': {
    tagline: 'تكنولوجيا للعمل والترفيه.',
    about: 'حواسيب محمولة وهواتف وأجهزة لوحية وأجهزة ألعاب. تأكّد من السعر لكل وحدة ومن شروط البطاريات.',
  },
  nike: {
    tagline: 'ملابس وأحذية لتتحرك على طريقتك.',
    about: 'أحذية وملابس رياضية وإكسسوارات من فئات مختلفة.',
  },
  apple: {
    tagline: 'أجهزة وإكسسوارات.',
    about: 'هواتف وأجهزة لوحية وحواسيب محمولة وإكسسوارات. لبعض المنتجات سعر لكل وحدة.',
  },
  target: {
    tagline: 'أفكار لبيتك وليومك.',
    about: 'ديكور ومستلزمات المنزل وهدايا وفئات أخرى.',
  },
  ebay: {
    tagline: 'منتجات جديدة ومستعملة.',
    about: 'مشتريات من بائعين مختلفين. تحقّق من الحالة والتفاصيل والشروط.',
  },
  sephora: {
    tagline: 'الجمال والعناية الشخصية.',
    about: 'مستحضرات التجميل والعناية الشخصية. العطور وعبوات الرذاذ تُشحن بحرًا فقط.',
  },
  'home-depot': {
    tagline: 'أفكار للمشاريع والتحسينات.',
    about: 'أدوات وتحسينات للمنزل. تحقّق من الحجم ومن القيود.',
  },
  adidas: {
    tagline: 'رياضة وأسلوب حياة.',
    about: 'أحذية وملابس رياضية وإكسسوارات.',
  },
};

export const STORES: Array<Store> = es.STORES.map((store) => ({ ...store, ...STORE_TEXT[store.id] }));

const hello = (text: string) => `مرحبًا Carinova 👋 ${text}`;

/** One message per place, as in Spanish: the keys are the same and each text is still unique. */
export const WA_MESSAGES: typeof es.WA_MESSAGES = {
  floating: {
    '/': hello('أريد معلومات عن نقل مشترياتي من الولايات المتحدة.'),
    '/como-comprar': hello('عندي سؤال عن طريقة عمل الخدمة.'),
    '/servicios': hello('أريد أن أعرف أي خدمة تناسبني.'),
    '/cotizador': hello('أحتاج إلى مساعدة في حساب تكلفة شحنتي.'),
    '/sucursales': hello('عندي استفسار عن فروعكم.'),
    '/casillero-en-miami': hello('أريد فتح عنواني الأمريكي في ميامي.'),
    '/tiendas': hello('أريد الشراء من متجر في الولايات المتحدة وعندي استفسار.'),
    '/rastreo': hello('أريد أن أعرف أين طردي.'),
    '/mi-cuenta': hello('أنا في حسابي وعندي استفسار.'),
    '/registro': hello('أنا أنشئ حسابي وعندي سؤال.'),
    '/registro/confirmar': hello('أنا أؤكد بريدي الإلكتروني وعندي سؤال.'),
    '/ingresar': hello('أريد الدخول إلى حسابي وعندي سؤال.'),
    '/empresas': hello('عندي استفسار عن خدمتكم للشركات.'),
    '/preguntas-frecuentes': hello('عندي سؤال لم أجد جوابه في موقعكم.'),
    '/articulos-prohibidos': hello('عندي سؤال عن الأصناف التي لا يمكنكم نقلها.'),
    '/nosotros': hello('أريد أن أعرف المزيد عن Carinova.'),
    '/terminos': hello('عندي استفسار عن شروطكم وأحكامكم.'),
    '/privacidad': hello('عندي استفسار عن بياناتي الشخصية.'),
  },
  floatingDefault: hello('وصلت إليكم من موقعكم الإلكتروني وعندي استفسار.'),
  footer: hello('وصلت إليكم من موقعكم الإلكتروني وأريد بعض المعلومات.'),
  channels: hello('وجدتكم في موقعكم الإلكتروني وأريد مراسلتكم.'),

  homeQuote: (shipment: string, total: string) =>
    hello(`حسبت في صفحتكم الرئيسية تكلفة ${shipment}: ${total}. هل تساعدونني في تأكيدها؟`),
  homeQuoteEmpty: hello('أنا في حاسبة صفحتكم الرئيسية ولا أعرف ما البيانات التي أدخلها.'),
  shopper: (link: string) =>
    hello(`أريد طلب شراء بالنيابة عني. المنتج: ${link} هل تؤكدون لي توفّره، وإن كان يمكن إدخاله، وتكلفته الإجمالية؟`),
  storeAssist: (store: string) => hello(`أريد شراءً بالنيابة عني من ${store}. هذا رابط المنتج: `),
  homeFamily: hello('أريد إرسال طرد عائلي إلى نيكاراغوا. ماذا أحتاج؟'),
  itemCheck: (item: string) => hello(`قبل أن أشتري، أريد أن أعرف إن كان بإمكانكم نقل: ${item}`),
  itemCheckEmpty: hello('أريد أن أسأل إن كان يمكن إدخال صنف ما إلى نيكاراغوا: '),
  homeBranch: (city: string) => hello(`أريد معرفة موقع فرع ${city} ومواعيد عمله.`),
  homeDelivery: hello('أريد الاستفسار عن التوصيل إلى المنزل. عنواني هو: '),
  homeFaq: hello('قرأت أسئلتكم الشائعة وعندي سؤال آخر.'),
  /** "Contactar al equipo", under the conditions of the service on the home page. */
  homeConditions: hello('قرأت شروط الخدمة في صفحتكم الرئيسية وعندي استفسار.'),

  trackItemCheck: (item: string) => hello(`أنا في صفحة التتبّع لديكم وأريد أن أعرف إن كان بإمكانكم نقل: ${item}`),
  trackItemCheckEmpty: hello('أنا في صفحة التتبّع لديكم وأريد الاستفسار عن صنف: '),
  trackPackage: (code: string, reference: string) =>
    hello(`معرّف Carinova ID الخاص بي هو ${code}. أتتبّع طردي ${reference} وعندي استفسار.`),
  trackMissing: (code: string, reference: string) =>
    hello(`معرّف Carinova ID الخاص بي هو ${code}. لا أجد الطرد ${reference} في حسابي.`),
  trackClosing: hello('لا أجد طردي في صفحة التتبّع. هل تساعدونني؟'),

  howToClosing: hello('اطّلعت على طريقة العمل وأريد مساعدة في شحنتي الأولى.'),
  example: (category: string) => hello(`رأيت مثالكم عن ${category} وأريد نقل شيء مشابه.`),

  services: {
    aereo: hello('أريد الشحن جوًا. هل تعطونني معلومات أكثر؟'),
    maritimo: hello('أريد الشحن بحرًا. هل تعطونني معلومات أكثر؟'),
    encomiendas: hello('سيرسل لي أحدهم طردًا من الولايات المتحدة. ماذا أفعل؟'),
    'compras-asistidas': hello('أريد أن تشتروا لي منتجًا. هذا هو الرابط: '),
    'retiro-en-sucursal': hello('أريد أن أعرف كيف أستلم طردي من الفرع.'),
    'entrega-a-domicilio': hello('أريد ترتيب توصيل إلى المنزل. ما التغطية وما الرسوم؟'),
  },
  servicesClosing: hello('أريد مساعدة في اختيار الخدمة المناسبة لشحنتي.'),

  lockerClosing: hello('أريد معرفة المزيد عن العنوان الأمريكي في ميامي قبل إنشاء حسابي.'),
  storesShopper: (link: string) =>
    hello(
      `أنا في صفحة المتاجر لديكم وأريد شراءً بالنيابة عني. المنتج: ${link} هل تؤكدون لي توفّره، وإن كان يمكن إدخاله، وتكلفته الإجمالية؟`
    ),
  storePageAssist: (store: string) =>
    hello(`رأيت ${store} في صفحة المتاجر لديكم وأريد أن تشتروا لي منه. هذا رابط المنتج: `),
  storesClosing: hello('أريد مساعدة في الشراء من متجر في الولايات المتحدة.'),

  quote: (shipment: string, total: string) =>
    hello(`حسبت في حاسبة الأسعار لديكم تكلفة ${shipment}: ${total}. هل تساعدونني في تأكيدها؟`),
  quoteEmpty: hello('أنا في حاسبة الأسعار لديكم ولا أعرف ما البيانات التي أدخلها.'),
  quoteClosing: hello('أريد حساب تكلفة شحنة خاصة (كبيرة جدًا، أو قابلة للكسر، أو فيها عدة أصناف).'),

  branch: (city: string) => hello(`عندي استفسار لفرع ${city}.`),
  branchesClosing: hello('أريد أن أعرف أي فرع يناسبني للاستلام.'),

  accountClosing: hello('عندي سؤال قبل إنشاء حسابي.'),

  signupAssist: hello('أفضّل إنشاء حسابي عبر WhatsApp.'),
  signupHelp: hello('حاولت التسجيل في موقعكم وأحتاج إلى مساعدة.'),
  confirmHelp: hello('لم أتمكن من تأكيد بريدي الإلكتروني لإنشاء حسابي.'),
  accountExisting: hello('لدي معرّف Carinova ID وأريد الاستفسار عن طرودي.'),
  customer: (code: string) => hello(`معرّف Carinova ID الخاص بي هو ${code} وعندي استفسار.`),
  welcomeEmail: (code: string) => hello(`معرّف Carinova ID الخاص بي هو ${code}. وصلتني رسالة الترحيب وعندي سؤال.`),

  signinHelp: hello('لا أستطيع الدخول إلى حسابي. هل تساعدونني؟'),
  signinError: hello('حاولت الدخول إلى حسابي في موقعكم وظهر لي خطأ.'),
  accountPackages: (code: string) => hello(`معرّف Carinova ID الخاص بي هو ${code}. أريد الاستفسار عن طرودي.`),
  accountPackage: (code: string, reference: string) =>
    hello(`معرّف Carinova ID الخاص بي هو ${code}. أريد الاستفسار عن طردي ${reference}.`),
  accountInvoice: (code: string, number: string) =>
    hello(`معرّف Carinova ID الخاص بي هو ${code}. أريد دفع الفاتورة ${number} أو الاستفسار عنها.`),
  accountUpdate: (code: string) => hello(`معرّف Carinova ID الخاص بي هو ${code} وأريد تحديث بياناتي.`),
  accountError: hello('حاولت فتح حسابي في موقعكم وظهر لي خطأ.'),

  accountCompany: hello('أريد فتح معرّف Carinova ID لشركتي.'),
  businessHelp: hello('حاولت إرسال نموذج الشركات وأحتاج إلى مساعدة.'),
  businessClosing: hello('أريد التحدث مع مستشار عن شحنات شركتي.'),

  faqClosing: hello('لم أجد جوابي في أسئلتكم الشائعة.'),
  restricted: hello('قبل أن أشتري، أريد أن أعرف إن كان بإمكانكم نقل هذا المنتج: '),
  aboutClosing: hello('تعرّفت على Carinova من موقعكم وأريد أن أبدأ الشحن معكم.'),
  careers: hello('أريد الانضمام إلى فريق Carinova. يهمّني هذا المجال: '),
  notFound: hello('وصلت إلى صفحة غير موجودة في موقعكم.'),
};
