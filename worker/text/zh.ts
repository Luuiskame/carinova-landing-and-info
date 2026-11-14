/** What the Worker says, in Simplified Chinese. Same shape as ./es.ts (`ServerText`). */
import { LOGIN_CODE_MINUTES } from '../../src/data/account.ts';
import { BUSINESS_LIMITS } from '../../src/data/business.ts';
import { CONFIRM_LINK_HOURS } from '../../src/data/signup.ts';
import { SIGNUP_LIMITS } from '../validation.ts';
import type { ServerText } from './es.ts';

export const text: ServerText = {
  tagline: 'Carinova · 寄送，连接彼此 · 从美国到尼加拉瓜',

  // worker/api.ts
  api: {
    emailMissing: '请输入您的电子邮箱。',
    emailInvalid: '请检查您的邮箱：格式似乎不正确。',
    emailRejected: '我们无法向此邮箱发送邮件。请检查是否输入正确。',
  },

  // worker/auth/emails.ts
  loginCode: {
    subject: '您的 Carinova 登录验证码',
    preheader: (code: string) => `您的验证码是 ${code}，${LOGIN_CODE_MINUTES}分钟内有效。`,
    hello: (name: string) => `${name}，您好：`,
    intro: '请使用此验证码登录您的 Carinova 账户：',
    expires: `验证码${LOGIN_CODE_MINUTES}分钟内有效，且只能使用一次。`,
    never:
      '请只在我们的网站上输入验证码。我们绝不会通过 WhatsApp、电话或电子邮件向您索要：如果有人向您索要，请不要提供。',
    notYou: '如果这不是您本人的操作，请忽略此邮件：没有此验证码，任何人都无法登录您的账户。',
  },

  // worker/business/validate.ts
  businessForm: {
    company: '请输入贵公司的名称。',
    companyLength: `公司名称须为2至${BUSINESS_LIMITS.company}个字符。`,
    contactName: '请输入您的姓名。',
    contactNameInvalid: `姓名只能使用字母或汉字（2至${BUSINESS_LIMITS.contactName}个字符）。`,
    email: '请输入您的电子邮箱。',
    emailInvalid: '请检查您的邮箱：格式似乎不正确。',
    phone: '请输入您的电话号码。',
    phoneInvalid: (example: string) => `请输入完整号码，例如 ${example}。如果是其他国家的号码，请以 + 和国家代码开头。`,
    country: '请选择国家。',
    city: '请输入您所在的城市。',
    cityLength: `城市名称须为2至${BUSINESS_LIMITS.city}个字符。`,
    volume: '请选择一个选项。',
    message: '请告诉我们贵公司的需求。',
    messageShort: '请再多介绍一些贵公司的需求。',
    messageLong: `最多可输入${BUSINESS_LIMITS.message}个字符。`,
  },

  // worker/signup/emails.ts
  verification: {
    subject: '确认您的邮箱，创建 Carinova 账户',
    preheader: '再完成一步，您的账户就准备好了。',
    hello: (name: string) => `${name}，您好：`,
    intro: '我们已收到您在 Carinova 的注册申请。请确认您的邮箱，以创建账户并获取您的 Carinova ID 和 Miami 收货地址。',
    button: '确认我的邮箱',
    expires: `链接将在${CONFIRM_LINK_HOURS}小时后失效。`,
    fallback: (openLink: string) => `如果按钮无法使用，请${openLink}。`,
    fallbackLink: '打开此链接',
    notYou: '如果这不是您本人的操作，请忽略此邮件：系统不会创建任何账户。',
    textIntro:
      '我们已收到您在 Carinova 的注册申请。请打开此链接，确认您的邮箱、创建账户，并获取您的 Carinova ID 和 Miami 收货地址：',
  },

  // worker/signup/emails.ts
  welcome: {
    subject: (code: string) => `您的 Carinova 账户已准备就绪：${code}`,
    preheader: (code: string) => `您的 Carinova ID 是 ${code}。这是您的 Miami 收货地址。`,
    title: (name: string) => `${name}，您的账户已准备就绪！`,
    thisIsId: '这是您的 Carinova ID。',
    keepId: '请妥善保存：我们凭它识别您的账户。',
    idLabel: '您的 Carinova ID',
    address: '您的 Miami 收货地址',
    addressIntro: '在美国商店购物时，请将它用作收货地址：',
    before: '购物之前',
    seeList: '在我们的网站上查看此清单',
    listOnSite: '网站上的清单',
    firstShipment: '第一次寄件之前',
    quote: '算一算运送您的商品要多少钱：空运、海运，或部分电子产品的按件费率。',
    quoteText: '算一算运送您的商品要多少钱',
    online: '您的在线账户',
    onlineText:
      '在我们的网站上，您随时可以查看您的 Carinova ID、地址、包裹和付款。只需用邮箱和我们发送的验证码登录，无需密码。',
    questions: '有疑问？',
    writeUs: (number: string) => `请通过 WhatsApp 联系我们：${number}`,
  },

  // worker/signup/validate.ts
  signupForm: {
    country: '请选择国家。',
    labels: { firstName: '名字', lastName: '姓氏' },
    nameMissing: (label: string) => `请输入您的${label}。`,
    nameInvalid: (label: string) => `${label}只能使用字母或汉字（2至${SIGNUP_LIMITS.name}个字符）。`,
    emailMissing: '请输入您的电子邮箱。',
    emailInvalid: '请检查您的邮箱：格式似乎不正确。',
    phoneMissing: '请输入您的电话号码。',
    phoneInvalid: (example: string) => `请输入完整号码，例如 ${example}。如果是其他国家的号码，请以 + 和国家代码开头。`,
    addressMissing: '请输入您的地址。',
    addressShort: '您的地址似乎不完整。',
    tooLong: (max: number) => `最多可输入${max}个字符。`,
    cityMissing: '请输入您所在的城市。',
    cityLength: `城市名称须为2至${SIGNUP_LIMITS.city}个字符。`,
    state: (label: string) => `请选择您所在的${label}。`,
    postalMissing: '请输入您的邮政编码。',
    postalInvalid: (example: string) => `请检查邮政编码（例如：${example}）。`,
    terms: '请先接受条款和隐私政策再继续。',
  },
};
