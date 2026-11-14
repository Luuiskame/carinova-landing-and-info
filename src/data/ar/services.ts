/**
 * Arabic wording of ../services.ts: the same exports, in Arabic. Ids, icons, availability, links
 * and the numbers of the worked examples are taken from the Spanish file; prices and times are
 * worked out from the same rates. Only the words are written here, keyed by id, so adding a service
 * or an example in Spanish without its Arabic text fails with an error that names it.
 */
import * as es from '../services.ts';
import type { ProcessStep, Service, ServiceAxis, ServiceAxisId, ShoppingExample } from '../services.ts';
import { sentence } from '../carinova.ts';
import { formatUSD } from '../../utils/rates.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, describeHours } from './carinova.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city);
const [branchHours] = BRANCHES[0].hours;

/** "أ، ب وج" */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join('، ')} و${items[items.length - 1]}`;

/** "هواتف محمولة US$30، أجهزة لوحية US$40، …" */
const devicePrices = electronics.items.map((item) => `${item.plural} ${formatUSD(item.price)}`).join('، ');

/** The text of an id, or an error that names what is missing. */
const textOf = <T>(table: Record<string, T>, id: string, kind: string): T => {
  const text = table[id];
  if (!text) throw new Error(`The ${kind} "${id}" has no Arabic text (src/data/ar/services.ts).`);
  return text;
};

const AXIS_TEXT: Record<ServiceAxisId, Pick<ServiceAxis, 'name' | 'question' | 'rule'>> = {
  transporte: {
    name: 'طريقة النقل',
    question: 'كيف يسافر طردك؟',
    rule: 'طريقان ووجهة واحدة: السرعة أو التوفير، والاختيار لك.',
  },
  solucion: {
    name: 'الحل التجاري',
    question: 'من يقوم بالشراء؟',
    rule: 'تشتريه أنت أو ترسله لك عائلتك، أو نشتريه نحن نيابةً عنك.',
  },
  distribucion: {
    name: 'التسليم النهائي',
    question: 'كيف تستلمه في نيكاراغوا؟',
    rule: 'في فروعنا أو في منزلك، مقابل رسوم إضافية.',
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
    name: 'الشحن الجوي',
    summary: `${formatUSD(air.pricePerLb)} للرطل · ${air.transit}`,
    description: 'مصمَّم لما تريد أن يصلك قريبًا. يعتمد سعرًا أساسيًا للرطل، ولبعض الإلكترونيات سعرًا ثابتًا لكل وحدة.',
    facts: [
      `التسليم المتوقع: ${air.transit}، ${RATES.transitFrom}.`,
      `السعر الأساسي: ${formatUSD(air.pricePerLb)} للرطل.`,
      `الإلكترونيات لكل وحدة: ${devicePrices}.`,
      `لا يمكن نقلها بالطائرة، لكن يمكن شحنها بحرًا: ${listOf(RESTRICTED_ITEMS.seaOnly.items.map((item) => item.name))}.`,
      'يُؤكَّد السعر المطبَّق بحسب نوع البضاعة والتغليف وشروط الخدمة.',
    ],
    link: 'احسب تكلفة الشحن الجوي',
  },
  maritimo: {
    name: 'الشحن البحري',
    summary: `${formatUSD(sea.pricePerLb)} للرطل أو ${formatUSD(sea.pricePerCubicFoot)} لكل قدم³ · ${sea.transit}`,
    description:
      'مثالي للشحنات الكبيرة والمشتريات المخطَّط لها، وللشحنات التي تكون التكلفة فيها أولويتك. يُحسب بالوزن أو بالحجم.',
    facts: [
      `التسليم المتوقع: ${sea.transit}، ${RATES.transitFrom}.`,
      `السعر الأساسي بالوزن: ${formatUSD(sea.pricePerLb)} للرطل.`,
      `السعر بالحجم: ${formatUSD(sea.pricePerCubicFoot)} لكل قدم مكعّب.`,
      'يُحدَّد الحساب بالوزن أو بالحجم بحسب الحمولة وتغليفها وشروط الخدمة.',
    ],
    link: 'احسب تكلفة الشحن البحري',
  },
  encomiendas: {
    name: 'الطرود',
    summary: 'ما ترسله أنت أو عائلتك إلى مستودعنا.',
    description:
      'ننقل أي طرد يصل إلى مستودعنا باسمك: مشترياتك عبر الإنترنت أو الصندوق الذي ترسله لك عائلتك من الولايات المتحدة.',
    facts: [
      'اشترِ من أي متجر يشحن داخل الولايات المتحدة.',
      'يمكن لعائلتك أو أصدقائك أيضًا أن يرسلوا لك صندوقًا إلى عنوانك في ميامي.',
      'يُشحن جوًا أو بحرًا، كما تفضّل.',
    ],
    link: 'اعرف كيف يعمل',
  },
  'compras-asistidas': {
    name: 'الشراء بالنيابة عنك',
    summary: 'تختار المنتج ونحن نشتريه لك.',
    description: 'اختر المتجر وشاركنا رابط المنتج: نحن نتولّى الشراء نيابةً عنك.',
    facts: [
      'قبل الشراء نؤكد التوفّر، وإن كان يمكن إدخال الصنف، والتكلفة الإجمالية.',
      'تُؤكَّد تكلفة الشراء والضرائب وأجرة الشحن قبل أن نباشر العملية.',
      'يصل إلى مستودعنا ويُشحن مثل أي طرد آخر.',
    ],
    link: 'جهّز طلبي',
    whatsappText: 'اطلب الشراء بالنيابة عنك',
  },
  'retiro-en-sucursal': {
    name: 'الاستلام من الفرع',
    summary: `${listOf(cities)} · ${branchHours.days}`,
    description: 'حين يصبح طردك جاهزًا للتسليم، تستلمه من أقرب فرع إليك.',
    facts: [`فروعنا في ${listOf(cities)}.`, sentence(`نفتح أبوابنا ${describeHours(branchHours)}`)],
    link: 'اعرض الفروع',
  },
  'entrega-a-domicilio': {
    name: 'التوصيل إلى المنزل',
    summary: 'إلى أي مكان في البلاد، مقابل رسوم إضافية.',
    description:
      'نوصل إلى أي مكان في البلاد، وفق التنسيق والتغطية. للتوصيل إلى المنزل رسوم إضافية تتوقف على الوجهة وظروف التشغيل.',
    facts: ['يُؤكَّد العنوان والتغطية والرسوم عند ترتيب التوصيل.'],
    whatsappText: 'استفسر عن التوصيل إلى المنزل',
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
const soonNote = receivingSoon.length ? ` ${listOf(receivingSoon)}: قريبًا.` : '';

/** In the order of ../services.ts: the steps have no id. */
const STEP_TEXT: Array<Pick<ProcessStep, 'title' | 'summary' | 'details'> & { link: string }> = [
  {
    title: 'أنشئ حسابك',
    summary: `أكّد بريدك الإلكتروني واحصل على معرّف Carinova ID مع عنوانك الأمريكي: عنوان الاستلام في ${listOf(receivingNow)}.`,
    details: [
      'تملأ نموذجًا قصيرًا وتؤكد بريدك الإلكتروني بالرابط الذي نرسله إليك.',
      'عند التأكيد ترى معرّف Carinova ID وعنوانك في الولايات المتحدة، ونرسلهما إليك أيضًا بالبريد الإلكتروني.',
      'بعد ذلك تدخل ببريدك الإلكتروني ورمز يُستخدم مرة واحدة: لا توجد كلمة مرور لتتذكرها.',
    ],
    link: CTA.signup.text,
  },
  {
    title: `اشترِ وأرسل إلى ${listOf(receivingNow)}`,
    summary: 'استخدم عنوان حسابك عند الشراء. وتحقّق أولًا من أن صنفك مسموح به.',
    details: [
      `أرسل مشترياتك إلى عنوان مستودعنا في ${listOf(receivingNow)} الظاهر في حسابك.${soonNote}`,
      'عند الدفع في المتجر، اكتب اسمك الأول واسم عائلتك تمامًا كما يظهران في عنوانك.',
      'قبل أن تشتري، تحقّق إن كان يمكن إدخال الصنف: بعض الأصناف ممنوعة، وأخرى لم نحصل بعد على تصريح بنقلها، وأخرى لا تُشحن إلا بحرًا.',
      'تفضّل أن نشتري نحن لك؟ اطلب الشراء بالنيابة عنك.',
    ],
    link: 'تحقّق من صنف',
  },
  {
    title: 'استلم في نيكاراغوا',
    summary: `استلم من ${cities.join(' أو ')}. التوصيل إلى أي مكان في البلاد مقابل رسوم إضافية.`,
    details: [
      `ننقله جوًا في مدة ${air.transit} أو بحرًا في مدة ${sea.transit}، ${RATES.transitFrom}.`,
      'تتابع كل مرحلة من حسابك، برقم مرجع طردك.',
      sentence(`تفتح فروعنا أبوابها ${describeHours(branchHours)}`),
      'يُرتَّب التوصيل إلى المنزل بحسب الوجهة والتغطية.',
    ],
    link: 'اعرض الفروع',
  },
];

export const PROCESS_STEPS: Array<ProcessStep> = es.PROCESS_STEPS.map((step, index) => {
  const text = STEP_TEXT[index];
  if (!text) throw new Error(`Step ${index + 1} of "¿Cómo funciona?" has no Arabic text (src/data/ar/services.ts).`);
  return {
    ...step,
    title: text.title,
    summary: text.summary,
    details: text.details,
    link: step.link && { ...step.link, text: text.link },
  };
});

const ACCOUNT_TEXT: Record<string, { title: string; summary: string }> = {
  'carinova-id': { title: 'معرّف Carinova ID', summary: 'معرّف واحد لكل شخص أو شركة، لكل شحناتك.' },
  direccion: { title: 'عنوانك في الولايات المتحدة', summary: `${listOf(receivingNow)}.${soonNote}` },
  paquetes: {
    title: 'طرودك',
    summary: 'ما استلمناه في المستودع وما شحنّاه بالفعل، مع حالة كل طرد.',
  },
  pagos: { title: 'مدفوعاتك', summary: 'فواتيرك والمدفوعات التي أكّدناها.' },
};

export const ACCOUNT_PARTS: typeof es.ACCOUNT_PARTS = es.ACCOUNT_PARTS.map((part) => ({
  ...part,
  ...textOf(ACCOUNT_TEXT, part.id, 'account part'),
}));

const EXAMPLE_TEXT: Record<string, Pick<ShoppingExample, 'category' | 'item' | 'source'>> = {
  ropa: {
    category: 'الملابس والأحذية',
    item: 'بلوزتان وبنطال وحذاء رياضي: 3 أرطال',
    source: 'من SHEIN وNike',
  },
  celulares: { category: 'الهواتف والأجهزة اللوحية', item: 'هاتف محمول جديد', source: 'من Amazon' },
  laptops: { category: 'الحواسيب المحمولة وأجهزة الألعاب', item: 'حاسوب محمول', source: 'من Best Buy' },
  hogar: { category: 'المنزل والمطبخ', item: 'طقم أوانٍ للطبخ وزنه 18 رطلًا', source: 'من Walmart' },
  muebles: {
    category: 'الأثاث',
    item: 'كرسي مكتب، في صندوق مقاسه 28 × 26 × 14 بوصة',
    source: 'من Home Depot',
  },
  encomienda: {
    category: 'الطرود العائلية',
    item: 'صندوق وزنه 8 أرطال فيه ملابس وهدايا',
    source: 'من عائلتك في الولايات المتحدة',
  },
};

export const SHOPPING_EXAMPLES: Array<ShoppingExample> = es.SHOPPING_EXAMPLES.map((example) => ({
  ...example,
  ...textOf(EXAMPLE_TEXT, example.id, 'example'),
}));

export const quoteExample = es.exampleQuoter(
  RATES,
  {
    airWeight: 'شحن جوي، بالرطل',
    seaWeight: 'شحن بحري، بالوزن',
    seaVolume: 'شحن بحري، بالحجم',
    unit: 'شحن جوي، سعر لكل وحدة',
    unitNote: 'لا يُضاف السعر لكل وحدة إلى السعر بالرطل.',
  },
  'ar'
);

export const FORMULA_EXAMPLE: typeof es.FORMULA_EXAMPLE = { ...es.FORMULA_EXAMPLE, item: 'منصة شحن نقّالة (باليت)' };
