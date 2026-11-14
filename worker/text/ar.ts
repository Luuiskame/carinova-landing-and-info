/** What the Worker says, in Arabic. Same shape as ./es.ts (`ServerText`). */
import { LOGIN_CODE_MINUTES } from '../../src/data/account.ts';
import { BUSINESS_LIMITS } from '../../src/data/business.ts';
import { CONFIRM_LINK_HOURS } from '../../src/data/signup.ts';
import { SIGNUP_LIMITS } from '../validation.ts';
import type { ServerText } from './es.ts';

export const text: ServerText = {
  tagline: 'شحنات تجمعنا · Carinova · من الولايات المتحدة إلى نيكاراغوا',

  // worker/api.ts
  api: {
    emailMissing: 'اكتب بريدك الإلكتروني.',
    emailInvalid: 'تحقّق من بريدك الإلكتروني: يبدو أنه غير صالح.',
    emailRejected: 'لم نتمكن من إرسال رسالة إلى هذا البريد الإلكتروني. تحقّق من أنه مكتوب بشكل صحيح.',
  },

  // worker/auth/emails.ts
  loginCode: {
    subject: 'رمز تسجيل الدخول إلى Carinova',
    preheader: (code: string) => `رمزك هو ${code}. تنتهي صلاحيته بعد ${LOGIN_CODE_MINUTES} دقائق.`,
    hello: (name: string) => `مرحبًا ${name}،`,
    intro: 'استخدم هذا الرمز لتسجيل الدخول إلى حسابك في Carinova:',
    expires: `تنتهي صلاحيته بعد ${LOGIN_CODE_MINUTES} دقائق ويعمل مرة واحدة فقط.`,
    never:
      'اكتبه في موقعنا فقط. لن نطلبه منك أبدًا عبر WhatsApp أو الهاتف أو البريد الإلكتروني: إذا طلبه منك أحد، فلا تعطه إياه.',
    notYou: 'إن لم تكن أنت من طلبه، فتجاهل هذه الرسالة: بدون هذا الرمز لا يستطيع أحد الدخول إلى حسابك.',
  },

  // worker/business/validate.ts
  businessForm: {
    company: 'اكتب اسم شركتك.',
    companyLength: `يجب أن يتراوح عدد أحرف اسم الشركة بين 2 و${BUSINESS_LIMITS.company}.`,
    contactName: 'اكتب اسمك.',
    contactNameInvalid: `استخدم الحروف فقط في اسمك (عدد الأحرف بين 2 و${BUSINESS_LIMITS.contactName}).`,
    email: 'اكتب بريدك الإلكتروني.',
    emailInvalid: 'تحقّق من بريدك الإلكتروني: يبدو أنه غير صالح.',
    phone: 'اكتب رقم هاتفك.',
    phoneInvalid: (example: string) =>
      `اكتب الرقم كاملًا، مثلًا ${example}. وإن كان من دولة أخرى، فابدأ بعلامة + ورمز الدولة.`,
    country: 'اختر دولة.',
    city: 'اكتب مدينتك.',
    cityLength: `يجب أن يتراوح عدد أحرف اسم مدينتك بين 2 و${BUSINESS_LIMITS.city}.`,
    volume: 'اختر أحد الخيارات.',
    message: 'أخبرنا بما تحتاجه شركتك.',
    messageShort: 'أخبرنا بمزيد من التفاصيل عمّا تحتاجه شركتك.',
    messageLong: `الحد الأقصى لعدد الأحرف: ${BUSINESS_LIMITS.message}.`,
  },

  // worker/signup/emails.ts
  verification: {
    subject: 'أكّد بريدك الإلكتروني لإنشاء حسابك في Carinova',
    preheader: 'خطوة أخيرة ويصبح حسابك جاهزًا.',
    hello: (name: string) => `مرحبًا ${name}،`,
    intro:
      'استلمنا تسجيلك في Carinova. أكّد بريدك الإلكتروني لإنشاء حسابك والحصول على معرّف Carinova ID وعنوانك في ميامي.',
    button: 'أكّد بريدي الإلكتروني',
    expires: `تنتهي صلاحية الرابط بعد ${CONFIRM_LINK_HOURS} ساعة.`,
    fallback: (openLink: string) => `إن لم يعمل الزر، ${openLink}.`,
    fallbackLink: 'افتح هذا الرابط',
    notYou: 'إن لم تكن أنت من سجّل، فتجاهل هذه الرسالة: لن يُنشأ أي حساب.',
    textIntro:
      'استلمنا تسجيلك في Carinova. افتح هذا الرابط لتأكيد بريدك الإلكتروني وإنشاء حسابك والحصول على معرّف Carinova ID وعنوانك في ميامي:',
  },

  // worker/signup/emails.ts
  welcome: {
    subject: (code: string) => `حسابك في Carinova جاهز: ${code}`,
    preheader: (code: string) => `معرّف Carinova ID الخاص بك هو ${code}. وهذا عنوانك في ميامي.`,
    title: (name: string) => `حسابك جاهز يا ${name}!`,
    thisIsId: 'هذا معرّف Carinova ID الخاص بك.',
    keepId: 'احتفظ به: به نتعرّف على حسابك.',
    idLabel: 'معرّف Carinova ID الخاص بك',
    address: 'عنوانك في ميامي',
    addressIntro: 'استخدمه عنوانًا للشحن عندما تشتري من متاجر الولايات المتحدة:',
    before: 'قبل أن تشتري',
    seeList: 'اعرض هذه القائمة في موقعنا',
    listOnSite: 'القائمة في موقعنا',
    firstShipment: 'قبل شحنتك الأولى',
    quote: 'احسب تكلفة نقل مشترياتك: جوًا أو بحرًا أو بالسعر لكل وحدة لبعض الإلكترونيات.',
    quoteText: 'احسب تكلفة نقل مشترياتك',
    online: 'حسابك عبر الإنترنت',
    onlineText:
      'في موقعنا تجد دائمًا معرّف Carinova ID وعنوانك وطرودك ومدفوعاتك. تدخل ببريدك الإلكتروني ورمز نرسله إليك، دون كلمة مرور.',
    questions: 'عندك أسئلة؟',
    writeUs: (number: string) => `راسلنا عبر WhatsApp على الرقم ${number}`,
  },

  // worker/signup/validate.ts
  signupForm: {
    country: 'اختر دولة.',
    labels: { firstName: 'الاسم الأول', lastName: 'اسم العائلة' },
    nameMissing: (label: string) => `اكتب ${label}.`,
    nameInvalid: (label: string) => `استخدم الحروف فقط في ${label} (عدد الأحرف بين 2 و${SIGNUP_LIMITS.name}).`,
    emailMissing: 'اكتب بريدك الإلكتروني.',
    emailInvalid: 'تحقّق من بريدك الإلكتروني: يبدو أنه غير صالح.',
    phoneMissing: 'اكتب رقم هاتفك.',
    phoneInvalid: (example: string) =>
      `اكتب الرقم كاملًا، مثلًا ${example}. وإن كان من دولة أخرى، فابدأ بعلامة + ورمز الدولة.`,
    addressMissing: 'اكتب عنوانك.',
    addressShort: 'يبدو أن عنوانك غير مكتمل.',
    tooLong: (max: number) => `الحد الأقصى لعدد الأحرف: ${max}.`,
    cityMissing: 'اكتب مدينتك.',
    cityLength: `يجب أن يتراوح عدد أحرف اسم مدينتك بين 2 و${SIGNUP_LIMITS.city}.`,
    state: (label: string) => `اختر ${label}.`,
    postalMissing: 'اكتب رمزك البريدي.',
    postalInvalid: (example: string) => `تحقّق من الرمز البريدي (مثال: ${example}).`,
    terms: 'للمتابعة، وافق على الشروط وسياسة الخصوصية.',
  },
};
