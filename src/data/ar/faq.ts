/**
 * Arabic wording of ../faq.ts: the same questions, in the same groups and the same order, with the
 * same ones on the home page (src/i18n/translations.test.ts compares them). Prices, times and lists
 * come from the Arabic data, which takes every fact from the Spanish data; the names of the stages
 * come from the Arabic dictionary of the pages.
 */
import { LOGIN_CODE_DIGITS, PACKAGE_STAGES } from '../account.ts';
import { CARINOVA_ID_EXAMPLE, sentence, type RestrictedItem } from '../carinova.ts';
import { FAQ_STORE_COUNT, type FaqGroup, type LinkTo } from '../faq.ts';
import {
  CUBIC_CM_PER_CUBIC_FOOT,
  describeVolume,
  formatNumber,
  formatUSD,
  quoteByVolume,
  quoteByWeight,
} from '../../utils/rates.ts';
import { ui } from '../../i18n/ui/ar.ts';
import { BRANCHES, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, STORES, describeHours } from './carinova.ts';
import { FORMULA_EXAMPLE } from './services.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city).join(' و');
const [hours] = BRANCHES[0].hours;
const receiving = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
const soonReception = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);
const devices = electronics.items.map((item) => `${item.plural} ${formatUSD(item.price)}`).join('، ');
const stores = STORES.slice(0, FAQ_STORE_COUNT)
  .map((store) => store.name)
  .join('، ');
/**
 * "السيارات، الدراجات النارية والآلات الثقيلة": the Arabic names carry no commas of their own, so
 * they are listed as Arabic lists them, the last one joined with "و".
 */
const inline = (items: Array<RestrictedItem>) => {
  const names = items.map((item) => item.name);
  return names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join('، ')} و${names[names.length - 1]}`;
};
const stages = PACKAGE_STAGES.map((stage) => ui.statuses.package[stage.id].name).join('، ');

export const faqGroups = (link: LinkTo): Array<FaqGroup> => [
  {
    id: 'cuenta',
    title: 'الحساب ومعرّف Carinova ID',
    items: [
      {
        title: 'كيف أحصل على معرّف Carinova ID؟',
        description: `أكمل ${link('/registro', 'التسجيل')} ببريدك الإلكتروني ورقم هاتفك، ثم أكّد بريدك بالرابط الذي نرسله إليك. عند التأكيد، تُنشئ المنصة تلقائيًا معرّف Carinova ID الفريد الخاص بك (مثلًا ${CARINOVA_ID_EXAMPLE}).`,
        featured: 1,
      },
      {
        title: 'ما هو معرّف Carinova ID؟',
        description:
          'هو معرّف حسابك. هناك معرّف واحد لكل شخص أو لكل شركة، وهو نفسه في جميع خدماتنا: الشحن الجوي والشحن البحري والطرود والشراء بالنيابة عنك.',
      },
      {
        title: `ما هو العنوان الأمريكي في ${receiving.join(' و')} («casillero») وكيف يعمل؟`,
        description: `هو عنوان في الولايات المتحدة باسمك: تكتبه عنوانًا للشحن عندما تشتري عبر الإنترنت، وما يصل إلى مستودعنا ننقله إلى نيكاراغوا. في Carinova يأتي مع حسابك: عند إنشائه تحصل على معرّف Carinova ID وعلى عنوانك. ${link('/casillero-en-miami', 'تعرّف على العنوان الأمريكي')}.`,
      },
      {
        title: 'كيف أدخل إلى حسابي؟',
        description: `اضغط ${link('/ingresar', 'تسجيل الدخول')} واكتب البريد الإلكتروني الذي سجّلت به: نرسل إليك رمزًا من ${LOGIN_CODE_DIGITS} أرقام وتدخل به، دون كلمة مرور. في ${link('/mi-cuenta', 'حسابك')} تجد معرّف Carinova ID وعنوانك في الولايات المتحدة وطرودك ومدفوعاتك.`,
      },
      {
        title: 'كم تكلفة إنشاء حسابي؟',
        description: `إنشاء حسابك مجاني: تدفع فقط ثمن شحن كل طرد. ${link('/registro', 'أنشئه عبر الإنترنت')} واحصل على معرّف Carinova ID.`,
      },
      {
        title: 'هل يمكنني فتح حساب لشركتي؟',
        description: `نعم: هناك معرّف Carinova ID واحد لكل شخص أو لكل شركة. حدّثنا عن شركتك في ${link('/empresas', 'نموذج الشركات')} وسنتواصل معك، أو راسلنا عبر WhatsApp.`,
      },
      {
        title: 'إلى أين أرسل مشترياتي من الولايات المتحدة؟',
        description: `يعرض حسابك عنوان مستودعنا في ${receiving.join(' و')} وتعليمات الاستلام فيه. استخدم هذه البيانات كما هي تمامًا حتى نتعرّف على شحنتك.${
          soonReception.length ? ` قريبًا ستتمكن أيضًا من الاستلام في ${soonReception.join(' و')}.` : ''
        }`,
        featured: 2,
      },
    ],
  },
  {
    id: 'servicios',
    title: 'الخدمات',
    items: [
      {
        title: 'ما الفرق بين الشحن الجوي والشحن البحري؟',
        description: `الشحن الجوي أسرع: ${air.transit}، بسعر ${formatUSD(air.pricePerLb)} للرطل. والشحن البحري أوفر: ${sea.transit}، بسعر ${formatUSD(sea.pricePerLb)} للرطل أو ${formatUSD(sea.pricePerCubicFoot)} للقدم المكعّب؛ وهو مناسب للشحنات الكبيرة والمشتريات المخطَّط لها. تُحتسب المدد ${RATES.transitFrom}.`,
      },
      {
        title: 'ما المقصود بالطرد؟',
        description:
          'أي شيء يصل إلى مستودعنا باسمك: مشترياتك عبر الإنترنت أو الصندوق الذي ترسله لك عائلتك من الولايات المتحدة. ويُشحن جوًا أو بحرًا، كما تفضّل.',
      },
      {
        title: 'هل يمكنكم شراء منتج نيابةً عني؟',
        description: `نعم. اختر المتجر وشاركنا الرابط. يتطلب الشراء بالنيابة عنك تأكيد التوفّر وإمكانية الإدخال وتكاليف المنتج والخدمة والنقل. ${link('/#personal-shopper', 'جهّز طلبك')}.`,
        featured: 8,
      },
      {
        title: 'من أي المتاجر يمكنني الشراء؟',
        description: `من أي متجر إلكتروني يشحن داخل الولايات المتحدة: ${stores} ومتاجر أخرى كثيرة.`,
      },
      {
        title: 'كيف أشتري من Amazon أو SHEIN أو Temu من نيكاراغوا؟',
        description: `أنشئ حسابك، واستخدم عنوان حسابك عنوانًا للشحن عند الدفع في المتجر، ونحن ننقل طردك إلى نيكاراغوا جوًا أو بحرًا. وإن كنت تفضّل أن نشتري نحن لك، فاطلب الشراء بالنيابة عنك. ${link('/tiendas', 'اعرض المتاجر')}.`,
      },
    ],
  },
  {
    id: 'tarifas',
    title: 'الأسعار والمدفوعات',
    items: [
      {
        title: 'كم تكلفة إرسال طرد من الولايات المتحدة إلى نيكاراغوا؟',
        description: `جوًا، ${formatUSD(air.pricePerLb)} للرطل؛ وبحرًا، ${formatUSD(sea.pricePerLb)} للرطل أو ${formatUSD(sea.pricePerCubicFoot)} للقدم المكعّب. مثلًا، طرد وزنه 5 أرطال يكلّف جوًا ${formatUSD(quoteByWeight(5, air.pricePerLb).total)}. ${link('/cotizador', 'احسب تكلفة شحنتك')}.`,
      },
      {
        title: 'كيف يُحسب السعر؟',
        description: `الشحن الجوي: ${formatUSD(air.pricePerLb)} للرطل، مع أسعار لكل وحدة لبعض الإلكترونيات. الشحن البحري: ${formatUSD(sea.pricePerLb)} للرطل أو ${formatUSD(sea.pricePerCubicFoot)} للقدم المكعّب. يُحدَّد أساس الحساب بحسب البضاعة وشروط الخدمة. احسبه في ${link('/cotizador', 'حاسبة الأسعار')} لدينا.`,
        featured: 4,
      },
      {
        title: 'كيف تُحسب القدم المكعّبة؟',
        description: `اضرب طول الصندوق في عرضه في ارتفاعه بالبوصة واقسم الناتج على 1,728؛ وإن كنت تقيس بالسنتيمتر، فاقسمه على ${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)}. مثال: <span dir="ltr">${describeVolume(
          quoteByVolume(FORMULA_EXAMPLE.dims, sea.pricePerCubicFoot, { unit: FORMULA_EXAMPLE.unit }),
          'ar'
        )}</span>.`,
      },
      {
        title: 'ما الإلكترونيات التي لها سعر لكل وحدة؟',
        description: `في الشحن الجوي: ${devices}. ولا يُضاف السعر لكل وحدة إلى السعر بالرطل.`,
      },
      {
        title: 'هل يشمل السعر التأمين والضرائب؟',
        description:
          'تشمل الأسعار التأمين والضرائب حين تنطبق على الشحنة. وتخضع التغطية والحدود والاستثناءات والرسوم الإضافية لشروط الخدمة. تأكّد من الشروط المطبَّقة قبل التعاقد على الخدمة.',
        featured: 5,
      },
      {
        title: 'هل السعر التقديري هو ما سأدفعه؟',
        description:
          'ليس بالضرورة. تحسب الحاسبة سعرًا مرجعيًا، لا يشمل شراء المنتج ولا خدمة التوصيل إلى المنزل. ويُؤكَّد المبلغ النهائي بعد مراجعة الأبعاد والوزن والمحتوى وطريقة النقل والشروط الخاصة.',
        featured: 9,
      },
      {
        title: 'متى أدفع وكيف؟',
        description: `تدفع ثمن الشحن عند استلام طردك أو عند ترتيب توصيله. راسلنا لتعرف طرق الدفع المتاحة. في ${link('/mi-cuenta', 'حسابك')} ترى فواتيرك والمدفوعات التي أكّدناها.`,
      },
    ],
  },
  {
    id: 'tiempos',
    title: 'المدد والتتبّع',
    items: [
      {
        title: `كم تستغرق الشحنة من ${receiving.join(' و')} إلى نيكاراغوا؟`,
        description: `جوًا: ${air.transit}؛ وبحرًا: ${sea.transit}. تُحتسب مدد التسليم ${RATES.transitFrom}، وقد تتغير بحسب النقل والجمارك والوجهة.`,
      },
      {
        title: 'متى يبدأ احتساب مدد التسليم؟',
        description: `من الاستلام الفعلي للطرد، لا من تاريخ الشراء. الشحن الجوي: ${air.transit}. الشحن البحري: ${sea.transit}. وهي مدد تقديرية تخضع للنقل والجمارك والوجهة.`,
        featured: 3,
      },
      {
        title: 'كيف أتتبّع عدة طرود بمعرّف Carinova ID واحد؟',
        description: `معرّف Carinova ID مرتبط بحسابك. عندما ${link('/ingresar', 'تسجّل الدخول')} ترى كل طرد برقم مرجعه وحالات تتبّعه. ولأسباب أمنية، رقم الحساب وحده لا يتيح لأحد الاطلاع على البيانات الخاصة.`,
        featured: 10,
      },
      {
        title: 'ما الحالات التي قد يمر بها طردي؟',
        description: `بالترتيب: ${stages}. ويُحفظ كل تغيير في سجل الطرد، في ${link('/mi-cuenta', 'حسابك')}.`,
      },
    ],
  },
  {
    id: 'prohibidos',
    title: 'الأصناف المقيّدة',
    items: [
      {
        title: 'ما الأصناف التي يمكنني نقلها؟',
        description: `يتوقف ذلك على نوع البضاعة ومكوّناتها وقواعد النقل. لا نستلم ولا ننقل: ${inline(RESTRICTED_ITEMS.prohibited.items)}. ولم نحصل بعد على تصريح بنقل: ${inline(RESTRICTED_ITEMS.notYet.items)}. ${link('/articulos-prohibidos', 'راجع القوائم الكاملة')}، وإن لم يكن صنفك فيها، فاسألنا قبل أن تشتريه.`,
        featured: 6,
      },
      {
        title: 'هل يمكنني نقل العطور أو عبوات الرذاذ؟',
        description: `نعم، بحرًا. فهذه الأصناف لا تُقبل في الشحن الجوي: ${inline(RESTRICTED_ITEMS.seaOnly.items)}.`,
      },
      {
        title: 'هل يمكنني نقل سيارة أو دراجة نارية؟',
        description: `ليس بعد: لم نحصل حتى الآن على تصريح بنقل ${inline(RESTRICTED_ITEMS.notYet.items)}.`,
      },
    ],
  },
  {
    id: 'retiro',
    title: 'الاستلام والتوصيل',
    items: [
      {
        title: 'أين أستلم طردي؟',
        description: `${sentence(`في فروعنا في ${cities}، ${describeHours(hours)}`)} ${link('/sucursales', 'اعرض العناوين ومواعيد العمل')}.`,
      },
      ...BRANCHES.slice(1).map((branch) => ({
        title: `هل تشحنون إلى ${branch.city}؟`,
        description: `نعم: لدينا فرع للاستلام في ${branch.city}، إلى جانب ${BRANCHES[0].city}. ${link(`/sucursales#${branch.id}`, `اعرض فرع ${branch.city}`)}.`,
      })),
      {
        title: 'هل توصلون إلى المنزل؟',
        description:
          'نوصل إلى أي مكان في البلاد، وفق التنسيق والتغطية. للتوصيل إلى المنزل رسوم إضافية تتوقف على الوجهة وظروف التشغيل.',
        featured: 7,
      },
      {
        title: 'هل يمكن لشخص آخر أن يستلم طردي؟',
        description: 'نعم. أخبرنا عبر WhatsApp قبل الاستلام باسم الشخص الذي تفوّضه؛ وسيُطلب منه إبراز بطاقة هويته.',
      },
      {
        title: 'كم من الوقت تحتفظون بطردي؟',
        description:
          'ننصحك باستلامه فور أن يصبح جاهزًا للتسليم. وقد تترتب على الطرود التي لا تُستلم في الوقت المحدد رسوم تخزين، وفقًا لشروطنا.',
      },
    ],
  },
];
