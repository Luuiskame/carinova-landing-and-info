/**
 * What the pages and the components say, in Arabic. Same shape as ./es.ts (`UI`): every entry of
 * the Spanish dictionary, translated. Modern Standard Arabic, speaking to the customer in the
 * singular; Western digits, as the prices and times the code writes.
 */
import { LOGIN_CODE_DIGITS, LOGIN_CODE_MINUTES, SESSION_DAYS } from '../../data/account.ts';
import { CONTACT, sentence } from '../../data/carinova.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, describeHours } from '../../data/ar/carinova.ts';
import { CONFIRM_LINK_HOURS } from '../../data/signup.ts';
import { CUBIC_CM_PER_CUBIC_FOOT, formatNumber, formatUSD } from '../../utils/rates.ts';
import type { UI } from './es.ts';
import { landing } from './landing/ar.ts';

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
    loading: 'جارٍ فتح حسابك…',
    noscript: 'لعرض حسابك، فعّل JavaScript في متصفحك.',
    eyebrow: 'حسابي',
    idLabel: 'معرّف Carinova ID الخاص بك',
    idNote: 'احتفظ به في متناول يدك عندما تراسلنا أو تستلم طرودك.',
    sections: 'أقسام حسابك',
    packagesIntro: 'ما استلمناه في مستودعنا وما شحنّاه بالفعل، مع حالة كل طرد.',
    filterLabel: 'تصفية الطرود',
    filters: { all: 'الكل', warehouse: 'في المستودع', shipped: 'تم الشحن', delivered: 'تم التسليم' },
    packagesEmpty: 'لم نستلم أي طرد باسمك بعد. عندما يصل أول طرد إلى مستودعنا ستراه هنا، مع حالته.',
    packagesNone: 'لا توجد لديك طرود في هذه المجموعة.',
    packagesAsk: 'استفسر عن طرودي',
    history: 'اعرض السجل',
    packageAsk: 'استفسر عن هذا الطرد',
    paymentsIntro: 'فواتيرك والمدفوعات التي أكّدناها.',
    invoicesEmpty: 'لا توجد لديك فواتير بعد. عندما نُصدر أول فاتورة ستراها هنا.',
    payments: 'المدفوعات',
    invoiceAsk: 'ادفع هذه الفاتورة أو استفسر عنها',
    paymentsNote: 'لتدفع أو لتبلغنا بدفعة، راسلنا برقم الفاتورة. تظهر الدفعة مؤكَّدة عندما يتحقق منها فريقنا.',
    activityError: 'لم نتمكن من تحميل طرودك ومدفوعاتك.',
    retry: 'حاول مرة أخرى',
    detailsTitle: 'بياناتي',
    detailsIntro: 'أنشأت حسابك بهذه البيانات.',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    since: 'عميل منذ',
    changed: 'هل تغيّر شيء؟',
    update: 'اطلب تحديث بياناتي',
    nextTitle: 'ماذا تريد أن تفعل؟',
    howItWorks: 'اعرف كيف يعمل',
    restricted: 'اعرف ما الذي يمكن إدخاله',
    signOut: 'تسجيل الخروج',
    signingOut: 'جارٍ تسجيل الخروج…',
    errorTitle: 'لم نتمكن من فتح حسابك',
    errorText: 'تحقّق من اتصالك وحاول مرة أخرى. وإن استمر الخطأ، راسلنا عبر WhatsApp.',
    script: {
      hello: 'مرحبًا، {name}',
      documentTitle: 'حسابي {code} | Carinova',
      received: 'استُلم في المستودع',
      warehouse: 'المستودع',
      weight: 'الوزن',
      pounds: '{weight} رطل',
      pieces: 'عدد القطع',
      pickup: 'الاستلام من',
      delivery: 'التسليم',
      homeDelivery: 'توصيل إلى المنزل',
      store: 'المتجر',
      carrier: 'وصل عبر',
      issued: 'صدرت في {date}',
      due: 'تستحق في {date}',
      total: 'الإجمالي',
      paid: 'المدفوع',
      balance: 'الرصيد',
      forPackage: '{description} ({reference})',
      balanceDue: 'الرصيد المستحق: {amount}',
      inReview: 'مدفوعات قيد المراجعة: {amount}',
      nothingDue: 'لا يوجد عليك رصيد مستحق.',
    },
  },

  // components/carinova/Branches.astro
  branches: {
    tagline: 'الفروع',
    title: `استلم من ${cities.join(' أو ')}`,
    directions: 'الاتجاهات',
    branch: (city: string) => `(فرع ${city})`,
  },

  // components/carinova/BusinessForm.astro
  businessForm: {
    title: 'حدّثنا عن شركتك',
    intro: 'املأ هذه البيانات وسنتواصل معك.',
    noscript: 'لإرسال النموذج، فعّل JavaScript في متصفحك. ويمكنك أيضًا مراسلتنا عبر WhatsApp.',
    company: 'اسم الشركة',
    contactName: 'اسمك',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    phoneHint: 'يُفضَّل الرقم الذي تستخدمه في WhatsApp.',
    country: 'الدولة',
    city: 'المدينة',
    volume: 'الحجم التقديري',
    optional: '(اختياري)',
    choose: 'اختر واحدًا',
    message: 'ما الذي تحتاجه شركتك؟',
    messageHint: 'ماذا تنقل، ومن أين، وكم مرة.',
    honeypot: 'اترك هذا الحقل فارغًا',
    submit: 'أرسل الطلب',
    sending: 'جارٍ الإرسال…',
    sentTitle: 'استلمنا طلبك',
    sentText: 'شكرًا لك. سيراجعه فريقنا ويتواصل معك عبر البريد الإلكتروني أو الهاتف الذي زوّدتنا به.',
    home: 'العودة إلى الصفحة الرئيسية',
    privacyNote: ['عند الإرسال، نستخدم هذه البيانات للتواصل معك، كما توضح ', 'سياسة الخصوصية', ' لدينا.'],
    messages: {
      missing: 'املأ هذا الحقل.',
      unavailable: 'النموذج غير متاح حاليًا. راسلنا عبر WhatsApp وسنخدمك.',
      busy: 'استلمنا محاولات كثيرة متتالية. انتظر دقيقة ثم حاول مرة أخرى.',
      failed: 'لم نتمكن من إرسال طلبك. تحقّق من اتصالك وحاول مرة أخرى، أو راسلنا عبر WhatsApp.',
      oneError: 'هناك حقل واحد يحتاج إلى تصحيح.',
      manyErrors: 'عدد الحقول التي تحتاج إلى تصحيح: {count}.',
    },
  },

  // components/carinova/QuoteCalculator.astro
  quoteCalculator: {
    title: 'احسب تقديرك',
    badge: 'دون تسجيل',
    mode: 'كيف تريد أن تنقله؟',
    basis: 'نوع السعر',
    basisHint: 'اختر أساسًا واحدًا للحساب: لا يُجمع الوزن والحجم والسعر لكل وحدة.',
    byWeight: 'بالوزن (الرطل)',
    byVolume: 'بالحجم (القدم المكعّب)',
    perUnit: (name: string) => `${name} (لكل وحدة)`,
    weightEach: 'وزن كل طرد (lb)',
    packages: 'عدد الطرود',
    kilos: 'هل تعرف الوزن بالكيلوغرام؟ كل كيلوغرام يساوي 2.2 رطل.',
    dimensions: ['الطول', 'العرض', 'الارتفاع'],
    unit: 'وحدة القياس',
    units: { cm: 'سنتيمتر', pulg: 'بوصة' },
    pieces: 'عدد القطع',
    quantity: 'عدد الوحدات',
    estimate: 'تقدير السعر الأساسي',
    what: 'ما الذي تحسب تكلفته؟',
    send: 'أرسل تقديري عبر WhatsApp',
    reset: 'إعادة الضبط',
    estimateNote: 'رقم استرشادي محسوب بالأسعار الأساسية الحالية.',
    footnote:
      'تقدير استرشادي، وليس عرض سعر ملزمًا. يتوقف المجموع النهائي على مراجعة الوزن والأبعاد والمحتوى والأسعار المطبَّقة وأي رسوم إضافية. ولا يشمل ثمن المنتجات ولا التوصيل إلى المنزل.',
    script: {
      delivery: 'التسليم المتوقع: {transit}، {from}.',
      explainWeight:
        'وزن كل طرد مضروبًا في عدد الطرود، بحد أدنى محتسب قدره {minimum} رطل لكل شحنة. ويُتحقق من الوزن ومن أساس الحساب المطبَّق عند الاستلام.',
      explainVolume:
        'الطول × العرض × الارتفاع، محوَّلًا إلى أقدام مكعّبة (القدم الواحد = 30.48 سم = 12 بوصة)، دون حد أدنى ودون تقريب.',
      explainUnit: 'السعر الجوي لكل وحدة من الصنف الذي اخترته. ولا يُضاف إليه السعر بالرطل.',
      comparison: 'للمقارنة فقط: لو اخترت {mode}، لكلّف الوزن نفسه {total} ({transit}).',
      check: 'راجع البيانات',
      checkHint: 'استخدم قيمًا أكبر من صفر.',
      needData: 'أدخل الوزن أو المقاسات أو الكمية لترى التقدير.',
      weightShipment: '{mode} بوزن {weight} رطل',
      weightShipmentMany: '{mode} لعدد {count} من الطرود، وزن كل منها {weight} رطل',
      volumeShipment: '{mode} لعدد {count} من القطع بمقاس {measurements} {unit}',
      unitShipment: '{units} ({mode})',
      unitCm: 'سم',
      unitIn: 'بوصة',
      announce: 'التقدير: {total}',
    },
  },

  // components/carinova/RateCards.astro
  rateCards: {
    tagline: 'الأسعار',
    title: 'طريقان. ووجهة واحدة.',
    subtitle:
      'تشمل الأسعار التأمين والضرائب حين تنطبق على الشحنة. وتُحتسب مدد التسليم اعتبارًا من الاستلام الفعلي لطردك.',
    cities: BRANCHES.map((branch) => branch.city).join(' و'),
    perPound: 'للرطل',
    perCubicFoot: 'لكل قدم³',
    airFacts: ['مصمَّم لما تريد أن يصلك قريبًا.', 'لبعض الإلكترونيات سعر ثابت لكل وحدة.'],
    seaFacts: [
      'مثالي للشحنات الكبيرة والمشتريات المخطَّط لها.',
      'يُحدَّد الحساب بالوزن أو بالحجم بحسب الحمولة وتغليفها وشروط الخدمة.',
    ],
    calculate: (name: string) => `احسب تكلفة ${name}`,
    calculateUnits: 'احسب لكل وحدة',
    electronicsNote: 'سعر لكل وحدة في الشحن الجوي. ولا يُضاف إلى السعر بالرطل.',
    pickup: 'الاستلام من الفرع:',
    homeDelivery: 'التوصيل إلى المنزل',
    howTitle: 'كيف نحسب',
    howIntro: 'أساس واحد في كل مرة: لا يُجمع الوزن والحجم والسعر لكل وحدة.',
    byPound: {
      title: 'بالرطل',
      applies: 'الشحن الجوي والبحري',
      rule: 'الوزن بالرطل × السعر للرطل، دون حد أدنى ودون تقريب. ويُتحقق من الوزن عند الاستلام.',
    },
    byCubicFoot: {
      title: 'بالقدم المكعّب',
      applies: 'الشحن البحري',
      rule: `طول الصندوق × عرضه × ارتفاعه ÷ 1,728 إن كنت تقيس بالبوصة، أو ÷ ${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)} إن كنت تقيس بالسنتيمتر = أقدام مكعّبة؛ × ${formatUSD(sea.pricePerCubicFoot)}.`,
      link: 'جرّبه في الحاسبة',
    },
    byUnit: {
      title: 'لكل وحدة',
      applies: 'الإلكترونيات، جوًا',
      rule: 'الكمية × سعر الجهاز. ولا يُضاف إليه السعر بالرطل.',
    },
  },

  // components/carinova/ServiceBadge.astro
  serviceBadge: { soon: 'قريبًا', extra: 'رسوم إضافية' },

  // components/carinova/ShippingModes.astro
  shippingModes: {
    eyebrow: 'الشحن الجوي والبحري إلى نيكاراغوا',
    title: ['طريقتان.', 'ووجهة واحدة.'],
    intro: 'اختر كيف تريد أن تستلمه. سرعة أكبر حين تحتاجها، وتوفير أكبر حين تستطيع التخطيط. قارن قبل أن تقرر.',
    air: {
      tag: 'ليصل أسرع',
      overline: 'الشحن الجوي',
      title: 'حين يكون الوقت مهمًا.',
      text: 'مثالي للمشتريات والطرود التي تريد أن تصلك قريبًا.',
    },
    sea: {
      tag: 'لتخطّط بشكل أفضل',
      overline: 'الشحن البحري',
      title: 'مساحة أكبر لخططك.',
      text: 'للمشتريات المخطَّط لها والشحنات الأكبر حجمًا.',
    },
    baseRate: 'السعر الأساسي',
    perPound: '/lb',
    orPerCubicFoot: (price: string) => `أو ${price} للقدم المكعّب`,
    electronics: 'الإلكترونيات: سعر لكل وحدة',
    delivery: 'التسليم المتوقع',
    details: (name: string) => `اعرض تفاصيل ${name}`,
    important: 'مهم:',
  },

  // components/carinova/SigninDialog.astro
  signinDialog: { label: 'سجّل الدخول إلى حسابك', close: 'إغلاق' },

  // components/carinova/SigninForm.astro
  signinForm: {
    title: 'سجّل الدخول ببريدك الإلكتروني',
    intro: `نرسل إلى بريدك الإلكتروني رمزًا من ${LOGIN_CODE_DIGITS} أرقام. لا تحتاج إلى كلمة مرور.`,
    noscript: 'لتسجيل الدخول، فعّل JavaScript في متصفحك.',
    email: 'البريد الإلكتروني',
    emailHint: 'البريد الإلكتروني الذي أنشأت به حسابك.',
    send: 'أرسل لي رمزًا',
    sending: 'جارٍ الإرسال…',
    noAccount: 'أليس لديك حساب بعد؟',
    codeTitle: 'أدخل رمزك',
    codeSent: [
      'إذا كان ',
      ` مرتبطًا بحساب، فقد أرسلنا إليه رمزًا من ${LOGIN_CODE_DIGITS} أرقام. تنتهي صلاحيته بعد ${LOGIN_CODE_MINUTES} دقائق.`,
    ],
    code: `الرمز المكوّن من ${LOGIN_CODE_DIGITS} أرقام`,
    enter: CTA.signin.text,
    entering: 'جارٍ تسجيل الدخول…',
    notes: [
      'قد يستغرق وصوله بضع دقائق. وإن لم تجده، فتحقّق من مجلد البريد العشوائي أو غير المرغوب فيه.',
      'لن نطلب منك هذا الرمز أبدًا عبر WhatsApp أو الهاتف.',
    ],
    notArriving: 'إن لم يصل، فربما لا يرتبط هذا البريد الإلكتروني بأي حساب.',
    openYours: 'أنشئ حسابك',
    resend: 'أرسل رمزًا آخر',
    change: 'استخدم بريدًا إلكترونيًا آخر',
    signedIn: 'أنت مسجّل الدخول بالفعل في هذا المتصفح.',
    messages: {
      emailMissing: 'اكتب بريدك الإلكتروني.',
      codeMissing: `اكتب الرمز المكوّن من ${LOGIN_CODE_DIGITS} أرقام.`,
      codeInvalid: 'الرمز غير صحيح أو انتهت صلاحيته. تحقّق منه أو اطلب رمزًا آخر.',
      resendIn: 'أرسل رمزًا آخر ({seconds} ث)',
      resent: 'تم: إذا كان البريد الإلكتروني مرتبطًا بحساب، فقد أرسلنا إليه رمزًا آخر. ولم يعد الرمز السابق صالحًا.',
      unavailable: 'تسجيل الدخول غير متاح حاليًا. راسلنا عبر WhatsApp وسنساعدك.',
      busy: 'استلمنا محاولات كثيرة متتالية. انتظر دقيقة ثم حاول مرة أخرى.',
      failed: 'لم نتمكن من الاتصال. تحقّق من اتصالك وحاول مرة أخرى.',
    },
  },

  // components/carinova/SignupConfirm.astro
  signupConfirm: {
    readyTitle: 'أكّد بريدك الإلكتروني',
    readyText: 'خطوة أخيرة: أكّد بريدك الإلكتروني لإنشاء حسابك ورؤية معرّف Carinova ID وعنوانك في الولايات المتحدة.',
    confirm: 'أكّد وأنشئ حسابي',
    confirming: 'جارٍ إنشاء حسابك…',
    noscript: 'لتأكيد بريدك الإلكتروني، فعّل JavaScript في متصفحك.',
    doneTitle: 'حسابك جاهز!',
    doneIntro: 'هذا معرّف Carinova ID الخاص بك. احتفظ به: به نتعرّف على حسابك.',
    emailed: 'وأرسلنا إليك هذه البيانات أيضًا بالبريد الإلكتروني.',
    beforeTitle: 'قبل أن تشتري',
    beforeText: 'راجع ما لا يمكننا نقله.',
    nextTitle: 'والآن؟',
    nextText: 'احسب تكلفة شحنتك الأولى أو اعرف كيف يعمل، مع أمثلة.',
    howToBuy: 'اعرف كيف يعمل',
    signedIn: 'أنت مسجّل الدخول في هذا المتصفح: في حسابك تجد دائمًا معرّف Carinova ID وعنوانك وطرودك ومدفوعاتك.',
    signedOut: 'لترى هذه البيانات متى شئت، سجّل الدخول إلى حسابك ببريدك الإلكتروني.',
    invalidTitle: 'هذا الرابط غير صالح',
    invalidText: 'ربما يكون ناقصًا. افتحه مجددًا من الرسالة التي أرسلناها إليك، أو سجّل من جديد.',
    expiredTitle: 'انتهت صلاحية هذا الرابط',
    expiredText: `تبقى روابط التأكيد صالحة ${CONFIRM_LINK_HOURS} ساعة. سجّل من جديد وسنرسل إليك رابطًا آخر.`,
    signupAgain: 'سجّل من جديد',
    errorTitle: 'لم نتمكن من إنشاء حسابك',
    errorText: 'المشكلة من جهتنا، لا من جهتك. حاول مرة أخرى، وإن استمر الخطأ، راسلنا عبر WhatsApp.',
    retry: 'حاول مرة أخرى',
    retrying: 'جارٍ المحاولة…',
    existingTitle: 'لديك حساب بالفعل',
    existingIntro: 'هذا البريد الإلكتروني مرتبط بالفعل بحساب في Carinova. هذا معرّف Carinova ID الخاص بك:',
    documentTitle: 'حسابك {code} | Carinova',
  },

  // components/carinova/SignupForm.astro
  signupForm: {
    signedIn: 'أنت مسجّل الدخول بالفعل إلى حسابك في هذا المتصفح.',
    title: 'بياناتك',
    intro: 'لن يستغرق الأمر سوى دقيقتين.',
    noscript: 'للتسجيل عبر الإنترنت، فعّل JavaScript في متصفحك. ويمكنك أيضًا إنشاء حسابك عبر WhatsApp.',
    country: 'الدولة',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني',
    emailHint: 'سنرسل إليك رابطًا لتأكيد حسابك.',
    phone: 'الهاتف',
    phoneHint: 'يُفضَّل الرقم الذي تستخدمه في WhatsApp.',
    address1: 'العنوان',
    address2: 'الشقة / الجناح',
    optional: '(اختياري)',
    city: 'المدينة',
    choose: 'اختر واحدًا',
    postalCode: 'الرمز البريدي',
    honeypot: 'اترك هذا الحقل فارغًا',
    sending: 'جارٍ الإرسال…',
    afterSubmit: 'عند الإرسال، نرسل إليك رسالة بالبريد الإلكتروني لتأكيد حسابك.',
    accept: ['أوافق على ', 'الشروط والأحكام', ' و', 'سياسة الخصوصية', '.'],
    sentTitle: 'تحقّق من بريدك الإلكتروني',
    sentTo: ['أرسلنا رابطًا إلى ', '. افتحه لتأكيد حسابك والحصول على معرّف Carinova ID وعنوانك في الولايات المتحدة.'],
    sentNotes: [
      'قد يستغرق وصوله بضع دقائق.',
      'إن لم تجده، فتحقّق من مجلد البريد العشوائي أو غير المرغوب فيه.',
      `تنتهي صلاحية الرابط بعد ${CONFIRM_LINK_HOURS} ساعة.`,
    ],
    edit: 'أخطأت في كتابة بريدك؟ صحّحه',
    messages: {
      missing: 'املأ هذا الحقل.',
      terms: 'للمتابعة، وافق على الشروط وسياسة الخصوصية.',
      unavailable: 'التسجيل عبر الإنترنت غير متاح حاليًا. راسلنا عبر WhatsApp وسننشئ حسابك.',
      busy: 'استلمنا محاولات كثيرة متتالية. انتظر دقيقة ثم حاول مرة أخرى.',
      failed: 'لم نتمكن من إرسال تسجيلك. تحقّق من اتصالك وحاول مرة أخرى، أو راسلنا عبر WhatsApp.',
      oneError: 'هناك حقل واحد يحتاج إلى تصحيح.',
      manyErrors: 'عدد الحقول التي تحتاج إلى تصحيح: {count}.',
    },
  },

  // components/carinova/TopStrip.astro
  topStrip: {
    connect: 'نربط',
    usa: 'الولايات المتحدة',
    with: 'مع',
    nicaragua: 'نيكاراغوا',
    soon: 'قريبًا',
    to: 'إلى',
  },

  // components/carinova/UsAddressCard.astro
  usAddressCard: {
    title: 'عنوانك في الولايات المتحدة',
    intro: 'استخدمه عنوانًا للشحن عندما تشتري من متاجر الولايات المتحدة.',
    warehouse: 'المستودع',
    soonTitle: (city: string) => `${city}: قريبًا`,
    soonText: (city: string, state: string) =>
      `قريبًا ستتمكن أيضًا من استلام مشترياتك في ${city}، ${state}. وعندما يُفتتح المستودع، سيظهر عنوانه هنا.`,
    meanwhile: (city: string) => `في هذه الأثناء، استخدم عنوانك في ${city}.`,
  },

  // components/carinova/WhatsAppFloat.astro
  whatsAppFloat: { whichBranch: 'أي فرع؟', label: 'راسلنا' },

  // components/widgets/Header.astro
  header: { navigation: 'التنقل الرئيسي', menu: 'القائمة' },

  // pages/404.astro
  notFoundPage: {
    metaTitle: 'الصفحة غير موجودة',
    title: 'لم نجد هذه الصفحة',
    lead: 'هل كنت تبحث عن شيء آخر؟',
    text: [
      'ربما كُتب الرابط بشكل خاطئ أو لم تعد الصفحة موجودة. جرّب البدء من ',
      'الصفحة الرئيسية',
      ' أو تابع ما جئت من أجله:',
    ],
  },

  // pages/articulos-prohibidos.astro
  restrictedPage: {
    tagline: 'الأصناف الممنوعة والمقيّدة',
    title: 'هل يمكن إدخاله إلى نيكاراغوا؟',
    metaTitle: 'الأصناف الممنوعة: ما لا يمكن شحنه إلى نيكاراغوا',
    description:
      'ما لا تستطيع Carinova نقله من الولايات المتحدة إلى نيكاراغوا: أصناف ممنوعة، وأصناف لم نحصل بعد على تصريح بنقلها، ومنتجات لا تُشحن جوًا لكنها تُشحن بحرًا. راجعها قبل أن تشتري.',
    subtitle:
      'بعض الأصناف لا نستلمها ولا ننقلها، وأخرى لم نحصل بعد على تصريح بنقلها، وأخرى لا تُشحن إلا بحرًا. راجع القوائم قبل أن تشتري أو ترسل.',
    closing: {
      title: 'لست متأكدًا من منتج ما؟',
      subtitle: 'اسألنا قبل أن تشتريه، وسنخبرك إن كان بإمكاننا نقله.',
      lead: 'أرسل لنا المنتج:',
    },
  },

  // pages/como-comprar.astro
  howToBuyPage: {
    tagline: 'كيف يعمل',
    title: 'كيف تشتري من الولايات المتحدة وأنت في نيكاراغوا',
    description:
      'خطوة بخطوة لتشتري من متاجر الولايات المتحدة وتستلم في نيكاراغوا، مع أمثلة على تكلفة نقل الملابس والهواتف المحمولة والحواسيب المحمولة ومستلزمات المنزل والأثاث والطرود العائلية.',
    subtitle:
      'ثلاث خطوات واضحة، من مشترياتك الأولى حتى يصبح طردك في نيكاراغوا، وأمثلة على تكلفة نقل الملابس والهواتف المحمولة والحواسيب المحمولة ومستلزمات المنزل والأثاث والطرود العائلية.',
    steps: 'الخطوات',
    examples: {
      tagline: 'أمثلة حسب الفئة',
      title: 'كم تكلفة نقل…؟',
      subtitle: 'ستة أمثلة على مشتريات، محسوبة بأسعارنا. افتح أيًا منها في الحاسبة وضع بيانات مشترياتك مكان بياناته.',
      open: 'افتح في الحاسبة',
    },
    closing: {
      title: 'ابدأ بإنشاء حسابك',
      subtitle: 'بمعرّف Carinova ID وعنوانك في الولايات المتحدة يمكنك الشراء من أي متجر.',
      lead: 'هل تريد أن نرشدك في مشترياتك الأولى؟',
    },
    total: 'الإجمالي',
  },

  // pages/cotizador.astro
  quotePage: {
    tagline: 'الأسعار والحاسبة',
    metaTitle: 'كم تكلفة إرسال طرد إلى نيكاراغوا: الأسعار والحاسبة',
    description: `كم تكلفة إرسال طرد من الولايات المتحدة إلى نيكاراغوا: جوًا ${formatUSD(air.pricePerLb)} للرطل، وبحرًا ${formatUSD(sea.pricePerLb)} للرطل أو ${formatUSD(sea.pricePerCubicFoot)} لكل قدم³، والإلكترونيات بسعر لكل وحدة. احسبها دون تسجيل.`,
    title: 'كم تكلفة إرسال طرد إلى نيكاراغوا؟',
    subtitle: 'احسب تكلفة شحنتك في ثوانٍ: اعرف كم يكلّف نقل مشترياتك أو طردك من الولايات المتحدة، دون تسجيل.',
    closing: {
      title: 'عرفت الآن كم يكلّف؟',
      subtitle: 'أنشئ حسابك واحصل على معرّف Carinova ID وعنوانك في الولايات المتحدة لتبدأ الشراء.',
      lead: 'هل شحنتك خاصة؟',
    },
  },

  // pages/empresas.astro
  businessPage: {
    tagline: 'حلول Carinova للأعمال',
    metaTitle: 'شحن البضائع للشركات من الولايات المتحدة إلى نيكاراغوا',
    description:
      'حلول لوجستية للشركات من الولايات المتحدة إلى نيكاراغوا: الاستيراد والتوريد، والشحنات المتكررة، وخدمة الشركات، جوًا أو بحرًا. أخبرنا بما تحتاجه.',
    title: 'عملياتك تستحق هي أيضًا أن تتحرك بشكل أفضل.',
    subtitle: 'من أول عملية توريد إلى نمو شركتك، نستكشف حلولًا لوجستية تناسب خصائص بضائعك.',
    offers: 'ما نستكشفه مع شركتك',
    also: 'وما تحصل عليه مثل أي عميل',
    benefits: [
      {
        icon: 'tabler:packages',
        title: 'الشحن الجوي والبحري للبضائع',
        text: `جوًا بسعر ${formatUSD(air.pricePerLb)} للرطل، في مدة ${air.transit}. وبحرًا بسعر ${formatUSD(sea.pricePerLb)} للرطل أو ${formatUSD(sea.pricePerCubicFoot)} للقدم المكعّب، في مدة ${sea.transit}.`,
      },
      {
        icon: 'tabler:id-badge-2',
        title: 'معرّف Carinova ID واحد لشركتك',
        text: `المعرّف نفسه لكل شحنات شركتك، مع الاستلام من ${cityNames.join(' أو ')}.`,
      },
    ],
    quote: 'احسب تكلفة شحنة',
    next: 'ماذا يحدث بعد ذلك؟',
    steps: [
      { title: 'نستلم طلبك', description: 'يصل مباشرةً إلى فريقنا.' },
      {
        title: 'نتواصل معك',
        description: 'بالبريد الإلكتروني أو عبر WhatsApp، لنعرف ما تحتاجه شركتك.',
      },
      {
        title: 'نفتح حساب شركتك',
        description: 'بمعرّف Carinova ID الخاص بها وعنوانها في ميامي، جاهزًا للاستلام.',
      },
    ],
    helpTitle: 'تفضّل أن تراسلنا؟',
    helpText: 'نفتح حساب شركتك أيضًا عبر WhatsApp.',
    helpLink: 'افتح حساب شركتي',
    closing: {
      title: 'تريد أن تعرف كم تكلّف بضائعك؟',
      subtitle: 'احسب التكلفة بالرطل أو بالقدم المكعّب في ثوانٍ.',
      lead: 'تفضّل التحدث مع مستشار؟',
    },
  },

  // pages/index.astro
  homePage: {
    service: 'الشحن من الولايات المتحدة إلى نيكاراغوا',
    title: `الشحن من الولايات المتحدة إلى نيكاراغوا | عنوان أمريكي في ${warehouse.city} | Carinova`,
    description: `الشحن من الولايات المتحدة إلى نيكاراغوا بعنوانك الأمريكي الخاص في ${warehouse.city}: جوًا في مدة ${air.transit} بسعر ${formatUSD(air.pricePerLb)} للرطل، وبحرًا في مدة ${sea.transit} ابتداءً من ${formatUSD(sea.pricePerLb)}. استلم من ${cityNames.join(' أو ')}.`,
  },

  // pages/ingresar.astro
  signinPage: {
    tagline: 'حسابي',
    metaTitle: 'تسجيل الدخول إلى حسابي',
    description:
      'سجّل الدخول إلى حسابك في Carinova ببريدك الإلكتروني: نرسل إليك رمزًا وتدخل دون كلمة مرور. هناك تجد معرّف Carinova ID وعنوانك في الولايات المتحدة وطرودك ومدفوعاتك.',
    title: 'سجّل الدخول إلى حسابك',
    subtitle: 'أنجز كل شيء من مكان واحد: معرّف Carinova ID وعنوانك وطرودك ومدفوعاتك.',
    howTitle: 'هكذا يعمل',
    how: [
      {
        icon: 'tabler:mail',
        title: 'دون كلمة مرور',
        text: 'لا شيء لتتذكره ولا شيء يمكن سرقته: في كل مرة تسجّل فيها الدخول نرسل رمزًا جديدًا إلى بريدك الإلكتروني.',
      },
      {
        icon: 'tabler:clock',
        title: 'رمز لمرة واحدة',
        text: `يعمل مرة واحدة فقط وتنتهي صلاحيته بعد ${LOGIN_CODE_MINUTES} دقائق.`,
      },
      {
        icon: 'tabler:shield-lock',
        title: 'جلستك، في هذا المتصفح',
        text: `تبقى مسجّل الدخول مدة ${SESSION_DAYS} يومًا أو حتى تسجّل الخروج. على جهاز مشترك، سجّل الخروج عند الانتهاء.`,
      },
    ],
    helpTitle: 'لا تستطيع الدخول؟',
    helpText: 'راسلنا بمعرّف Carinova ID الخاص بك أو بالبريد الإلكتروني المرتبط بحسابك.',
  },

  // pages/mi-cuenta.astro
  accountPage: {
    tagline: 'حسابي',
    metaTitle: 'حسابي: معرّف Carinova ID والطرود والمدفوعات',
    description: `سجّل الدخول إلى حسابك في Carinova: معرّف Carinova ID، وعنوانك في الولايات المتحدة، وطرودك مع حالتها، ومدفوعاتك. استلم من ${cityNames.join(' أو ')}.`,
    title: 'حسابك في Carinova',
    subtitle: 'أنجز كل شيء من مكان واحد: معرّف Carinova ID وعنوانك وطرودك ومدفوعاتك.',
    signin: 'سجّل الدخول إلى حسابك',
    noAccount: 'أليس لديك حساب بعد؟',
    includes: 'ما تجده في حسابك',
    looksLike: 'هكذا يبدو',
    idFacts: [
      'يخصّصه لك النظام عند تأكيد بريدك الإلكتروني.',
      'وهو نفسه للشحن الجوي والبحري والطرود والشراء بالنيابة عنك.',
    ],
    company: 'هل أنت شركة؟',
    companyLink: 'تعرّف على حلول Carinova للأعمال',
    fullAddress: 'ترى العنوان كاملًا عند تسجيل الدخول.',
    stages: 'كل طرد، مع مرحلته:',
    paymentFacts: ['كل فاتورة بمبلغها وحالتها.', 'تظهر الدفعة مؤكَّدة عندما يتحقق منها فريقنا.'],
    pickup: 'تستلم من',
    homeDelivery: 'التوصيل إلى المنزل',
    branches: 'اعرض الفروع',
    closing: {
      title: 'أنشئ حسابك في دقيقتين',
      subtitle: 'تملأ نموذجًا قصيرًا، وتؤكد بريدك الإلكتروني، وانتهى الأمر: صار لديك معرّف Carinova ID.',
      lead: 'عندك أسئلة قبل التسجيل؟',
    },
  },

  // pages/nosotros.astro
  aboutPage: {
    tagline: 'من نحن',
    metaTitle: 'من نحن ومن أين جئنا',
    description: `شركة Carinova شركة نيكاراغوية للشحن من الولايات المتحدة إلى نيكاراغوا، وُلدت في ${bluefields}. تعرّف على جذورنا وما نقدّمه وأين تجدنا في ${cityNames.join(' و')}.`,
    title: `نحن Carinova، شركة الشحن التي وُلدت في ${bluefields}`,
    subtitle: `شركة نيكاراغوية تجلب مشترياتك وطرود عائلتك وبضائع عملك من الولايات المتحدة، ولها فروع في ${cityNames.join(' و')}.`,
    roots: {
      title: 'جذورنا',
      text: 'وُلدت Carinova في بلوفيلدز، على ساحل الكاريبي الجنوبي في نيكاراغوا. نحمل في جيناتنا دفء أرضنا متعددة الثقافات والتزامها وقوتها، ونعمل كل يوم لنقرّب المسافات ونسلّمك طرودك بالثقة والمودّة اللتين تميّزاننا.',
      emblemAlt: 'شعار Carinova: ثلاثة أشخاص يحملون شعلة داخل دائرة',
    },
    whatTagline: 'ماذا نقدّم',
    whatTitle: 'نقرّب متاجر الولايات المتحدة من نيكاراغوا',
    what: `مع حسابك تحصل على Carinova ID وعنوان في ${warehouse.city} لتشتري من أي متجر. نستلم طرودك هناك وننقلها جوًا أو بحرًا، وتستلمها أنت في ${cityNames.join(' أو ')}.`,
    servicesLink: 'عرض الخدمات بالتفصيل',
    factsTagline: 'باختصار',
    factsTitle: 'Carinova في سطور',
    facts: {
      origin: 'وُلدنا في',
      originValue: `${bluefields}، ساحل الكاريبي الجنوبي في نيكاراغوا`,
      route: 'مسارنا',
      routeValue: 'من الولايات المتحدة إلى نيكاراغوا',
      reception: 'نستلم مشترياتك في',
      branches: 'فروعنا في نيكاراغوا',
      transport: 'كيف تسافر طرودك',
      contact: 'المساعدة عبر WhatsApp',
      networks: 'تابعنا على',
    },
    valuesTagline: 'قيمنا',
    valuesTitle: 'ما يحرّكنا',
    values: [
      {
        title: 'العمل الجماعي',
        description: 'كما في شعارنا: ثلاثة أشخاص يحملون معًا الشعلة نفسها. كل شحنة عمل جماعي، من ميامي حتى فرعك.',
      },
      {
        title: 'الانتشار الدولي',
        description: 'الدائرة التي تحيط بهم هي الجسر الذي نعبره كل يوم بين الولايات المتحدة ونيكاراغوا.',
      },
      {
        title: 'الالتزام',
        description: 'الشعلة وعدنا: أن نعتني بكل طرد كأنه طردنا.',
      },
    ],
    where: 'أين نحن',
    reviewsTagline: 'آراء العملاء',
    reviewsTitle: 'ماذا يقول عملاؤنا',
    faqTitle: 'أسئلة عن Carinova',
    faq: [
      {
        title: 'ما هي Carinova؟',
        description:
          'شركة Carinova شركة شحن نيكاراغوية. ننقل المشتريات الشخصية والطرود العائلية وبضائع الشركات من الولايات المتحدة إلى نيكاراغوا، جوًا أو بحرًا.',
      },
      {
        title: 'من أين Carinova؟',
        description: `وُلدت Carinova في ${bluefields}، على ساحل الكاريبي الجنوبي في نيكاراغوا، ولها اليوم فروع في ${cityNames.join(' و')}.`,
      },
      {
        title: 'أين تقع فروع Carinova وما مواعيد عملها؟',
        description: sentence(`في ${cityNames.join(' و')}. نفتح أبوابنا ${describeHours(hours)}`),
      },
      {
        title: 'من أين تجلب Carinova الطرود؟',
        description: `نستلمها في مستودعنا في ${warehouse.city}، ${warehouse.state}، وننقلها إلى نيكاراغوا جوًا في مدة ${air.transit} أو بحرًا في مدة ${sea.transit}، تُحسب من وصول الطرد إلى المستودع.`,
      },
      {
        title: 'كيف أتواصل مع Carinova؟',
        description: `عبر WhatsApp على الرقم <span dir="ltr">${CONTACT.whatsappDisplay}</span>، أو في أي فرع من فروعنا.`,
      },
      {
        title: 'أين أقرأ آراء عملاء Carinova؟',
        description:
          'في صفحة المراجعات على هذا الموقع تجد ما نشره عملاؤنا كما كتبوه، مع رابط المكان الذي نُشرت فيه كل مراجعة.',
      },
    ],
    careers: {
      title: 'انضم إلى فريقنا.',
      text: 'نبحث عن أشخاص ملتزمين بالخدمة والتميّز في العمل.',
      link: 'اعرف كيف تتقدّم',
    },
    closing: {
      title: 'لننجز شحنتك الأولى معًا',
      subtitle: 'أنشئ حسابك عبر الإنترنت أو احسب تكلفة شحنتك قبل أن تشتري.',
      lead: 'تريد أن تتعرّف علينا أكثر؟',
    },
  },

  // What a review's card says (the reviews themselves are never translated)
  reviews: {
    recommends: 'يوصي بـ Carinova',
    rating: 'التقييم {rating} من 5',
    seeOn: 'عرض على {source}',
    allOn: 'كل المراجعات على {source}',
    readAll: 'قراءة المراجعة كاملة',
    seeAll: 'عرض كل المراجعات',
    moreTitle: 'هناك مراجعات أخرى',
    moreText: 'اقرأ كل ما يرويه عملاؤنا عن شحناتهم.',
    previous: 'المراجعات السابقة',
    next: 'المراجعات التالية',
  },

  // pages/opiniones.astro
  reviewsPage: {
    tagline: 'آراء العملاء',
    metaTitle: 'آراء ومراجعات العملاء',
    description:
      'مراجعات حقيقية من عملاء Carinova عن شحناتهم من الولايات المتحدة إلى نيكاراغوا، كما نشروها على {sources}. اقرأها قبل شحنتك الأولى.',
    title: 'ماذا يقول عملاء Carinova',
    subtitle: 'مراجعات حقيقية ممن جلبوا مشترياتهم من الولايات المتحدة إلى نيكاراغوا معنا، كما نشروها على {sources}.',
    listTitle: 'مراجعات عملائنا',
    filterLabel: 'عرض المراجعات من',
    all: 'الكل',
    howTitle: 'كيف نعرض المراجعات',
    how: [
      {
        title: 'نشرها أصحابها',
        text: 'كل مراجعة نشرها صاحبها باسمه على {sources}.',
      },
      {
        title: 'دون تغيير أي كلمة',
        text: 'ننقلها كما كُتبت وبلغتها الأصلية، دون تصحيح أو ترجمة.',
      },
      {
        title: 'مع رابط المصدر',
        text: 'كل مراجعة تقود إلى صفحة Carinova التي نُشرت فيها. هناك تجد جميع المراجعات، وأحدثها أيضًا.',
      },
    ],
    writeTitle: 'هل استلمت طردك؟ أخبرنا كيف كانت تجربتك',
    writeText: 'رأيك يساعد الآخرين على اتخاذ قرارهم ويساعدنا على التحسّن.',
    writeOn: 'اكتب رأيك على {source}',
    nextTitle: 'قبل شحنتك الأولى',
    next: {
      how: 'تعرّف على طريقة العمل خطوة بخطوة',
      quote: 'احسب تكلفة شحنتك',
      branches: 'اعرف أين تستلم طردك',
      about: 'تعرّف على من نكون',
    },
    closing: {
      title: 'أرسل شحنتك الأولى مع Carinova',
      subtitle: 'أنشئ حسابك عبر الإنترنت واحصل على Carinova ID وعنوانك في الولايات المتحدة.',
      lead: 'هل تودّ أن تسألنا شيئًا أولًا؟',
    },
  },

  // pages/preguntas-frecuentes.astro
  faqPage: {
    tagline: 'المساعدة',
    title: 'الأسئلة الشائعة عن الشحن إلى نيكاراغوا',
    description:
      'العنوان الأمريكي ومعرّف Carinova ID، والخدمات، والأسعار، ومدد التسليم، والأصناف المقيّدة، والاستلام: إجابات عن أكثر الأسئلة شيوعًا حول الشحن من الولايات المتحدة إلى نيكاراغوا مع Carinova.',
    subtitle: 'كل شيء عن حسابك والخدمات والأسعار ومدد التسليم واستلام طرودك.',
    topics: 'المواضيع',
    closing: {
      title: 'لم تجد إجابتك؟',
      subtitle: 'راسلنا وسنساعدك، أو ابدأ بإنشاء حسابك.',
      lead: 'أخبرنا بسؤالك:',
    },
  },

  // pages/registro.astro
  signupPage: {
    tagline: 'حسابي',
    title: 'أنشئ حسابك',
    description: `أنشئ حسابك عبر الإنترنت واحصل على معرّف Carinova ID وعنوانك الأمريكي في ${warehouse.city}، لتشتري من أي متجر وتستلم في ${cityNames.join(' أو ')}.`,
    subtitle:
      'تسجيل واحد فقط. عندما تؤكد بريدك الإلكتروني، يخصّص لك النظام معرّف Carinova ID تلقائيًا ويعرض لك عنوانك في الولايات المتحدة.',
    existing: 'لديك حساب بالفعل؟',
    next: 'ماذا يحدث بعد ذلك؟',
    steps: [
      { title: 'أكّد بريدك الإلكتروني', description: 'نرسل إليك رابطًا. افتحه لتفعيل حسابك.' },
      {
        title: 'احصل على معرّف Carinova ID وعنوانك في الولايات المتحدة',
        description: 'تراهما على الشاشة عند التأكيد، ويصلانك أيضًا بالبريد الإلكتروني.',
      },
      {
        title: 'اشترِ، ونحن ننقله إليك',
        description: `استخدم عنوانك في المتجر، وتابع طردك من حسابك، واستلمه من ${cityNames.join(' أو ')}.`,
      },
    ],
    helpTitle: 'تفضّل أن نساعدك؟',
    helpText: 'راسلنا وسننشئ حسابك عبر WhatsApp.',
  },

  // pages/servicios.astro
  servicesPage: {
    tagline: 'الخدمات',
    metaTitle: 'الشحن الجوي والبحري إلى نيكاراغوا، والطرود، والشراء بالنيابة عنك',
    description:
      'الشحن الجوي والبحري من الولايات المتحدة إلى نيكاراغوا، والطرود، والشراء بالنيابة عنك، والاستلام من الفرع، والتوصيل إلى المنزل. اختر كيف يسافر طردك وكيف تستلمه.',
    title: 'الشحن الجوي والبحري من الولايات المتحدة إلى نيكاراغوا',
    subtitle: 'تجمع كل شحنة بين ثلاثة قرارات: كيف تسافر، ومن يقوم بالشراء، وكيف تستلمها.',
    kinds: 'أنواع الخدمة',
    closing: {
      title: 'لا تعرف ما يناسبك؟',
      subtitle: 'احسب تكلفة شحنتك وقارن بين الجوي والبحري، أو أنشئ حسابك وابدأ الشراء.',
      lead: 'تريد أن ننصحك؟',
    },
  },

  // pages/sucursales.astro
  branchesPage: {
    tagline: 'الفروع',
    title: `فروعنا في ${cityNames.join(' و')}`,
    description: `عناوين فروع Carinova ومواعيد عملها ورقم WhatsApp في ${cityNames.join(' و')}.${sameHours ? ` ${sentence(`نفتح أبوابنا ${describeHours(hours)}`)}` : ''}`,
    subtitle: sameHours
      ? sentence(`حاليًا تستلم من ${cityNames.join(' و')}، ${describeHours(hours)}`)
      : `حاليًا تستلم من ${cityNames.join(' و')}.`,
    closing: {
      title: 'مشترياتك القادمة، جاهزة للاستلام',
      subtitle: 'أنشئ حسابك واحسب تكلفة شحنتك قبل أن تشتري.',
      lead: 'لا تعرف أي فرع يناسبك للاستلام؟',
    },
  },

  // components/carinova/Tracker.astro and TrackingSection.astro
  tracker: {
    switchLabel: 'عمّ تريد أن تستعلم؟',
    tabs: { track: 'تتبّع طردًا', check: 'هل يمكن إدخاله؟' },
    track: {
      title: 'تتبّع طردك',
      visitor: 'سجّل الدخول إلى حسابك لترى طرودك: ما استلمناه في المستودع، وما هو في الطريق، وما يمكنك استلامه الآن.',
      signin: 'سجّل الدخول لترى طرودك',
      noAccount: 'أليس لديك حساب بعد؟',
      customer: 'اكتب رقم مرجع طردك، أو اترك الحقل فارغًا لترى الطرود التي في الطريق.',
      label: 'رقم مرجع الطرد أو رقم التتبّع',
      placeholder: 'مثال: PKG-000123',
      submit: 'تتبّع',
      all: 'اعرض كل طرودي ومدفوعاتي',
      privacy: 'لأسباب أمنية، معرّف Carinova ID وحده لا يتيح لأحد الاطلاع على البيانات الخاصة.',
    },
    check: {
      title: 'هل يمكن إدخاله إلى نيكاراغوا؟',
      intro: 'ابحث عن الصنف الذي تريد نقله. النتيجة إرشاد أولي، وليست تصريحًا باستيراده أو بنقله.',
      label: 'ما الذي تريد نقله؟',
      placeholder: 'مثال: حاسوب محمول، عطر، أحذية…',
      examples: 'جرّب:',
      lists: 'اعرض القوائم الكاملة',
      ask: 'اسأل عبر WhatsApp',
      note: 'لا يغني عن التحقق الجمركي ولا عن التصاريح ولا عن تأكيد Carinova.',
      script: {
        idleTitle: 'اسأل قبل أن تشتري.',
        idleText: 'اكتب اسم الصنف لتحصل على إرشاد.',
        unknownTitle: 'ليس في قوائمنا',
        unknownText: 'هذا لا يعني أنه يمكن إدخاله: بعض الأصناف تحتاج إلى تصاريح أو مراجعة. اسألنا قبل أن تشتريه.',
      },
    },
  },

  // components/widgets/Footer.astro
  footer: {
    channelsEyebrow: 'نحن متصلون',
    channelsTitle: 'تابعنا وراسلنا',
    previous: 'القنوات السابقة',
    next: 'المزيد من القنوات',
    email: 'البريد الإلكتروني',
    languages: 'اللغات',
  },

  // src/navigation.ts and the layouts: the header, the footer and the trail of a page
  nav: {
    home: 'الرئيسية',
    services: 'الخدمات',
    shopper: 'نشتري لك',
    rates: 'الأسعار',
    calculator: 'الحاسبة',
    howItWorks: 'كيف يعمل',
    business: 'الشركات',
    help: 'المساعدة',
    explore: 'استكشف',
    yours: 'رحلتك مع Carinova',
    near: 'نحن قريبون منك',
    canItEnter: 'هل يمكن إدخاله؟',
    tracking: 'التتبّع',
    faq: 'الأسئلة الشائعة',
    about: 'من نحن',
    reviews: 'آراء العملاء',
    terms: 'شروط الخدمة',
    privacy: 'الخصوصية',
    and: ' و',
    or: ' أو ',
    brand: 'شحنات تجمعنا. نقرّب إليك مشترياتك وعائلتك ومشاريع شركتك.',
    route: ['أمريكا', 'نيكاراغوا'],
    rights: 'جميع الحقوق محفوظة. الأسعار ومدد التسليم خاضعة للتحقق.',
    language: 'اللغة',
    languageChoose: 'اختر لغتك',
    locker: `عنوان أمريكي في ${warehouse.city}`,
    stores: 'المتاجر',
  },

  // components/common/Metadata.astro: what a page without its own title or description says
  meta: {
    title: `الشحن من الولايات المتحدة إلى نيكاراغوا | عنوان أمريكي في ${warehouse.city} | Carinova`,
    description: `الشحن من الولايات المتحدة إلى نيكاراغوا بعنوانك الأمريكي الخاص في ${warehouse.city}، جوًا أو بحرًا. أنشئ حسابك عبر الإنترنت واستلم من ${cityNames.join(' أو ')}.`,
  },

  // The statuses of packages, invoices and payments (src/data/account.ts), by their id
  statuses: {
    package: {
      received: { name: 'تم الاستلام في المستودع', text: 'استلام فعلي في الولايات المتحدة' },
      processing: { name: 'قيد التجهيز', text: 'الفرز والتنسيق' },
      in_transit: { name: 'في الطريق', text: 'النقل إلى نيكاراغوا' },
      ready: { name: 'جاهز للتسليم', text: 'الاستلام أو التوصيل بعد التنسيق' },
      delivered: { name: 'تم التسليم', text: 'استلمته' },
      returned: { name: 'مُعاد', text: 'أُعيد إلى المرسل' },
      cancelled: { name: 'ملغى', text: 'أُلغيت الشحنة' },
    },
    invoice: {
      unpaid: { name: 'بانتظار الدفع', text: 'لم نسجّل أي دفعة بعد' },
      in_review: { name: 'الدفعة قيد المراجعة', text: 'استلمنا دفعتك ونعمل على تأكيدها' },
      partial: { name: 'مدفوعة جزئيًا', text: 'أكّدنا جزءًا من المبلغ' },
      paid: { name: 'مدفوعة', text: 'أكّدنا دفعتك' },
      void: { name: 'ملغاة', text: 'لم تعد هذه الفاتورة سارية' },
    },
    payment: {
      pending: { name: 'قيد المراجعة', text: 'نعمل على تأكيدها' },
      confirmed: { name: 'مؤكَّدة', text: 'استلمناها' },
      rejected: { name: 'مرفوضة', text: 'لم نتمكن من تأكيدها' },
    },
    paymentMethod: { cash: 'نقدًا', bank_transfer: 'تحويل بنكي', card: 'بطاقة', other: 'وسيلة أخرى' },
  },

  // What Carinova explores with a company and the options of its form (src/data/business.ts), by their id
  business: {
    solutions: {
      importacion: {
        title: 'الاستيراد والتوريد',
        text: 'مراجعة نوع البضاعة وطريقة النقل والوزن والحجم والمستندات المطلوبة قبل تقديم عرض السعر.',
      },
      recurrentes: {
        title: 'الشحنات المتكررة',
        text: 'تقييم تجاري لوتيرة الشحن وإمكانية التجميع واحتياجات التوريد، رهنًا بالجدوى.',
      },
      corporativa: {
        title: 'خدمة الشركات',
        text: 'تحديد النطاق والتتبّع المطلوب والتغطية وشروط الخدمة بحسب طبيعة العملية.',
      },
    },
    disclaimer: 'تُصاغ ترتيبات الشركات وشروطها لكل حالة على حدة، بعد تقييم الجدوى والامتثال.',
    volumes: {
      'under-100': 'أقل من 100 رطل شهريًا',
      '100-500': 'من 100 إلى 500 رطل شهريًا',
      'over-500': 'أكثر من 500 رطل شهريًا',
      pallets: 'شحن على منصات نقّالة أو في حاوية',
      unknown: 'لا أعرف بعد',
    },
  },

  // pages/rastreo.astro and components/carinova/PackageLookup.astro
  trackPage: {
    tagline: 'التتبّع',
    metaTitle: 'تتبّع الطرود من الولايات المتحدة إلى نيكاراغوا',
    description:
      'تابع طرودك من الولايات المتحدة إلى نيكاراغوا مع Carinova: تم الاستلام في المستودع، قيد التجهيز، في الطريق، جاهز للتسليم، تم التسليم. سجّل الدخول إلى حسابك وتتبّع كل شحنة برقم مرجعها.',
    title: 'تتبّع طردك',
    subtitle: 'سجّل الدخول إلى حسابك وتابع كل شحنة برقم مرجعها، مرحلة بمرحلة.',
    stagesTitle: 'مراحل طردك',
    stagesIntro: 'هكذا تتقدّم كل شحنة، من مستودعنا في الولايات المتحدة حتى تصل إلى يديك.',
    results: {
      active: 'طرودك في الطريق',
      found: 'نتيجة بحثك',
      loading: 'جارٍ البحث عن طرودك…',
      empty: 'لم نستلم أي طرد باسمك بعد. عندما يصل أول طرد إلى مستودعنا ستراه هنا، مع مرحلته.',
      none: 'لا توجد لديك طرود في الطريق حاليًا.',
      notFoundHint: 'تحقّق من كتابته بشكل صحيح: يبدأ رقم المرجع بالحروف PKG ويظهر في حسابك.',
      askMissing: 'استفسر عن هذا المرجع',
      ask: 'استفسر عن هذا الطرد',
      history: 'اعرض السجل',
      error: 'لم نتمكن من تحميل طرودك. تحقّق من اتصالك وحاول مرة أخرى.',
      retry: 'حاول مرة أخرى',
      script: {
        notFound: 'لم نجد في حسابك طردًا برقم المرجع {reference}.',
        summary: '{reference} · {service}',
      },
    },
    closing: {
      title: 'أليس لديك حساب بعد؟',
      subtitle: 'أنشئ حسابك وتابع كل عملية شراء منذ وصولها إلى مستودعنا.',
      lead: 'لا تجد طردك؟',
    },
  },

  // components/carinova/ProductLinkForm.astro
  productLink: {
    label: 'رابط المنتج',
    placeholder: 'https://example.com/product',
    submit: 'جهّز الطلب',
    hint: 'يُفتح WhatsApp وطلبك جاهز للإرسال. لا نشتري شيئًا قبل أن نؤكد التكلفة الإجمالية.',
    invalid: 'الصق رابط المنتج كاملًا: يبدأ بـ https://',
  },

  // pages/casillero-en-miami.astro
  lockerPage: {
    tagline: 'العنوان الأمريكي',
    metaTitle: `عنوان أمريكي في ${warehouse.city} للشحن إلى نيكاراغوا`,
    description: `افتح مجانًا عنوانك الأمريكي في ${warehouse.city} مع Carinova: عنوان في الولايات المتحدة لتشتري من Amazon أو SHEIN أو Temu وتستلم في ${cityNames.join(' أو ')}. جوًا في مدة ${air.transit}، وبحرًا في مدة ${sea.transit}.`,
    title: `عنوانك الأمريكي في ${warehouse.city}، للشحن إلى نيكاراغوا`,
    subtitle: `عنوان في الولايات المتحدة باسمك، لتشتري من أي متجر وتستلم في ${cityNames.join(' أو ')}. يأتي مع حسابك في Carinova.`,
    whatTitle: `ما هو العنوان الأمريكي في ${warehouse.city} وكيف يعمل؟`,
    what: [
      'هو عنوان في الولايات المتحدة تستخدمه كأنك تعيش هناك: تكتبه عنوانًا للشحن عندما تشتري عبر الإنترنت، فيسلّم المتجر طردك إلى مستودعنا، ونحن ننقله إلى نيكاراغوا.',
      'في نيكاراغوا يُسمّى «casillero»، ويُعرف أيضًا بصندوق البريد الافتراضي أو الدولي: إنه الشيء نفسه. في Carinova لا تشترك فيه بشكل منفصل: فهو يأتي مع حسابك.',
      'عندما تنشئ حسابك تحصل على معرّف Carinova ID وعلى عنوانك. ومعرّف Carinova ID هو ما نتعرّف به على كل طرد يصل باسمك.',
    ],
    addressTitle: 'أين نستلم مشترياتك',
    addressNote: 'ترى العنوان كاملًا عند إنشاء حسابك.',
    includesTitle: 'ما يشمله عنوانك الأمريكي',
    includesLink: 'اعرض كل ما في حسابك',
    costTitle: 'كم تكلفة العنوان الأمريكي؟',
    cost: 'إنشاء حسابك مجاني: تدفع فقط ثمن شحن كل طرد، بالرطل، أو بالقدم المكعّب أيضًا في الشحن البحري.',
    costLink: 'احسب تكلفة شحنتي',
    stepsTitle: 'كيف تستخدم عنوانك الأمريكي',
    stepsLink: 'اعرض كل خطوة مع أمثلة',
    faqTitle: 'أسئلة عن العنوان الأمريكي وحسابك',
    closing: {
      title: 'افتح عنوانك الأمريكي في دقيقتين',
      subtitle: 'أنشئ حسابك عبر الإنترنت واحصل على معرّف Carinova ID وعنوانك في الولايات المتحدة.',
      lead: 'عندك أسئلة قبل أن تفتحه؟',
    },
  },

  // pages/tiendas.astro
  storesPage: {
    tagline: 'المتاجر',
    metaTitle: 'تسوّق من Amazon وSHEIN وTemu وأنت في نيكاراغوا',
    description: `كيف تتسوّق من Amazon وSHEIN وTemu وWalmart ومتاجر أخرى في الولايات المتحدة وأنت في نيكاراغوا: استخدم عنوان حسابك في Carinova أو اطلب أن نشتري لك، واستلم في ${cityNames.join(' أو ')}.`,
    title: 'تسوّق من متاجر الولايات المتحدة وأنت في نيكاراغوا',
    subtitle:
      'من Amazon وSHEIN وTemu وWalmart إلى متاجر أخرى كثيرة: تشتري بعنوان حسابك ونحن ننقل مشترياتك إلى نيكاراغوا.',
    howTitle: 'كيف تشتري من متجر في الولايات المتحدة',
    howLink: 'اعرض كل خطوة مع أمثلة',
    restrictedLink: 'تحقّق من الأصناف التي لا يمكن إدخالها',
    storesTitle: 'متاجر يمكنك الشراء منها',
    storesIntro: 'يمكنك الشراء من أي متجر إلكتروني يشحن داخل الولايات المتحدة. هذه بعض أكثرها بحثًا، حسب الفئة.',
    categories: 'فئات المتاجر',
    buyAt: (store: string) => `تسوّق من ${store} وأنت في نيكاراغوا`,
    visit: (store: string) => `انتقل إلى موقع ${store}`,
    assist: 'اطلب أن نشتري لك',
    disclosure:
      'تُعرض المتاجر كأمثلة، دون أي اتفاق أو تزكية ضمنية. تُراجع الأسعار والتوفّر وشروط كل عملية شراء في موقع كل متجر.',
    assistTitle: 'تفضّل أن نشتري نحن لك؟',
    assistIntro: 'مع خدمة الشراء بالنيابة عنك، تختار المنتج وتتولى Carinova الشراء. الصق رابط المنتج وجهّز طلبك.',
    closing: {
      title: 'مستعد لأول عملية شراء؟',
      subtitle: 'أنشئ حسابك واستخدم عنوانك في الولايات المتحدة في المتجر الذي تفضّله.',
      lead: 'عندك سؤال عن متجر ما؟',
    },
  },

  // pages/index.astro and components/landing: the home page Carinova wrote (./landing)
  landing,
};
