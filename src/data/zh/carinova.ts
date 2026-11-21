/**
 * Simplified Chinese wording of ../carinova.ts: the same exports with the same shapes, for the
 * Chinese version of the site (src/i18n). Facts are not repeated here: every price, number, address
 * and id is taken from the Spanish file and only the words around it are written again, so the
 * languages cannot disagree on a fact. src/i18n/translations.test.ts checks that nothing is left
 * untranslated.
 *
 * City names (Managua, Bluefields, Miami) stay in Latin letters: they are what the customer sees on
 * maps and addresses.
 *
 * Like ../carinova.ts, the Worker bundles this file: relative imports with the .ts extension only.
 */
import * as es from '../carinova.ts';
import type { Branch, DayOfWeek, OpeningHours, RestrictedGroupId, Store, StoreCategoryId } from '../carinova.ts';

/** "a、b和c"; a space only beside a Latin word: "Managua 和 Bluefields". */
const listOf = (items: Array<string>): string => {
  if (items.length < 2) return items[0] ?? '';
  const head = items.slice(0, -1).join('、');
  const last = items[items.length - 1];
  return `${head}${/[A-Za-z]$/.test(head) ? ' ' : ''}和${/^[A-Za-z]/.test(last) ? ' ' : ''}${last}`;
};

export const TAGLINE = '寄送，连接彼此';
export const HEADLINE: [string, string] = ['从大洋彼岸', '到您身边。'];
export const VALUE_PROPOSITION = '我们把您的个人网购、亲友包裹和企业货物，从美国运到尼加拉瓜。';

export const CTA: typeof es.CTA = {
  signup: { ...es.CTA.signup, text: '注册账户' },
  quote: { ...es.CTA.quote, text: '估算运费' },
  help: { text: 'WhatsApp 咨询' },
  account: { ...es.CTA.account, text: '进入我的账户', short: '我的账户' },
  signin: { ...es.CTA.signin, text: '登录', short: '登录' },
  track: { ...es.CTA.track, text: '追踪包裹' },
};

/** "08:00" → "8:00", "17:00" → "17:00": the 24-hour clock, as mainland China writes times. */
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours}:${String(minutes).padStart(2, '0')}`;
};

/** "8:00–17:00" */
export const formatHours = ({ opens, closes }: OpeningHours): string => `${formatTime(opens)}–${formatTime(closes)}`;

/** "周一至周六，8:00至17:00": opening hours inside a sentence. */
export const describeHours = (hours: OpeningHours): string =>
  `${hours.days}，${formatTime(hours.opens)}至${formatTime(hours.closes)}`;

const WEEK: Array<DayOfWeek> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_NAMES: Record<DayOfWeek, string> = {
  Monday: '周一',
  Tuesday: '周二',
  Wednesday: '周三',
  Thursday: '周四',
  Friday: '周五',
  Saturday: '周六',
  Sunday: '周日',
};

/** The days a branch opens, from the structured list: "周一至周六", or the days one by one. */
const daysOf = (days: Array<DayOfWeek>): string => {
  const order = days.map((day) => WEEK.indexOf(day)).sort((a, b) => a - b);
  const inARow = order.every((day, index) => index === 0 || day === order[index - 1] + 1);
  return order.length > 2 && inARow
    ? `${DAY_NAMES[WEEK[order[0]]]}至${DAY_NAMES[WEEK[order[order.length - 1]]]}`
    : listOf(order.map((day) => DAY_NAMES[WEEK[day]]));
};

export const BRANCHES: Array<Branch> = es.BRANCHES.map((branch) => ({
  ...branch,
  // A real address is the same in every language; only the placeholder is words.
  address: branch.address === es.ADDRESS_PENDING ? '地址待确认' : branch.address,
  hours: branch.hours.map((row) => ({ ...row, days: daysOf(row.dayOfWeek) })),
}));

const CITY_NAMES: Record<string, string> = { 'los-angeles': 'Los Angeles' };

export const RECEPTION_POINTS: typeof es.RECEPTION_POINTS = es.RECEPTION_POINTS.map((point) => ({
  ...point,
  city: CITY_NAMES[point.id] ?? point.city,
}));

/** When packages are received in the United States, in this language. */
export const RECEPTION_HOURS: OpeningHours = {
  ...es.RECEPTION_HOURS,
  days: daysOf(es.RECEPTION_HOURS.dayOfWeek),
};

/** "3至4天" */
const transit = ([min, max]: [number, number]): string => `${min}至${max}天`;

const DEVICE_NAMES: Record<string, { name: string; plural: string }> = {
  celular: { name: '手机', plural: '手机' },
  tablet: { name: '平板电脑', plural: '平板电脑' },
  laptop: { name: '笔记本电脑', plural: '笔记本电脑' },
  xbox: { name: 'Xbox', plural: 'Xbox' },
  playstation: { name: 'PlayStation', plural: 'PlayStation' },
};

export const RATES: typeof es.RATES = {
  ...es.RATES,
  transitFrom: '自我们实际收到您的包裹起计算',
  air: { ...es.RATES.air, name: '空运', badge: '最快', transit: transit(es.RATES.air.transitDays) },
  sea: { ...es.RATES.sea, name: '海运', badge: '最经济', transit: transit(es.RATES.sea.transitDays) },
  electronics: {
    ...es.RATES.electronics,
    name: '电子产品',
    transit: transit(es.RATES.electronics.transitDays),
    items: es.RATES.electronics.items.map((item) => ({ ...item, ...DEVICE_NAMES[item.id] })),
  },
  notes: [
    '时效自实际收到包裹起计算，可能因运输、海关和目的地而有所不同。',
    '我们会核实重量、尺寸、运输方式、覆盖范围和服务条件。',
    '如适用于该货件，运费已包含保险和税费。保障范围、限额、除外情形和附加费用以服务条件为准。',
    '电子产品费率适用于空运，按件计算。',
    `按重量计费时，每票货物最低按 ${es.RATES.minimumLb} lb 计费。`,
  ],
};

export const MIAMI_ADDRESS: typeof es.MIAMI_ADDRESS = {
  ...es.MIAMI_ADDRESS,
  notes: ['请完全按照此格式填写名字和姓氏：我们凭此识别您的包裹。', '如需海运，请在购物前通过 WhatsApp 咨询我们。'],
};

/** The labels already carry both languages, as on Carinova's graphic. */
export const miamiAddressRows = es.miamiAddressRows;

/**
 * The names of the items, in the order of the Spanish lists, with the words a Chinese speaker may
 * type for each one. Chinese words are found anywhere in a search (nothing separates them from
 * their neighbours), so no word here is a short one that sits inside an unrelated longer word. The
 * Spanish words still match too.
 */
const RESTRICTED_TEXT: Record<
  RestrictedGroupId,
  { title: string; summary: string; items: Array<{ name: string; match: Array<string> }> }
> = {
  notYet: {
    title: '暂未获准运送',
    summary: '我们目前尚未获准运送这些物品。',
    items: [
      {
        name: '汽车',
        match: [
          '汽车',
          '轿车',
          '车辆',
          '卡车',
          '货车',
          '客车',
          '巴士',
          '公交车',
          '面包车',
          '皮卡',
          '越野车',
          'car',
          'cars',
        ],
      },
      { name: '摩托车', match: ['摩托车', '摩托', '踏板车', 'motorcycle', 'motorcycles'] },
      {
        name: '重型机械',
        match: ['重型机械', '工程机械', '挖掘机', '推土机', '拖拉机', '叉车', '起重机', '吊车', '装载机', '压路机'],
      },
    ],
  },
  prohibited: {
    title: '禁止接收和运输',
    summary: '我们不接收，也不运输这些物品。',
    items: [
      {
        name: '武器、弹药及其配件',
        match: ['武器', '枪支', '手枪', '步枪', '猎枪', '火器', '弹药', '子弹'],
      },
      {
        name: '烟草、香烟及烟草制品',
        match: ['烟草', '香烟', '卷烟', '雪茄', '烟丝', '烟草制品'],
      },
      { name: '电子烟', match: ['电子烟', '电子香烟', '烟弹'] },
      {
        name: '酒精饮料',
        match: [
          '酒精饮料',
          '含酒精饮料',
          '酒类',
          '洋酒',
          '香槟',
          '烈酒',
          '白酒',
          '啤酒',
          '葡萄酒',
          '红酒',
          '威士忌',
          '伏特加',
          '朗姆酒',
          '龙舌兰酒',
        ],
      },
      { name: '飞机配件', match: ['飞机配件', '飞机零件', '航空器', '飞机', '直升机'] },
      { name: '无线电发射器', match: ['无线电发射器', '无线电', '发射器', '对讲机'] },
      { name: '无人机', match: ['无人机', '航拍器'] },
    ],
  },
  seaOnly: {
    title: '不可空运，但可海运',
    summary: '这些物品不能搭乘飞机：我们通过海运为您运送。',
    items: [
      {
        name: '易燃产品',
        match: [
          '易燃产品',
          '易燃',
          '易燃品',
          '易燃物',
          '燃料',
          '汽油',
          '油漆',
          '溶剂',
          '酒精',
          '医用酒精',
          '消毒酒精',
          '打火机',
        ],
      },
      { name: '散装锂电池', match: ['散装锂电池', '锂电池', '电池', '锂', '充电宝', '移动电源'] },
      { name: '身体喷雾', match: ['身体喷雾', '香体喷雾', '古龙水'] },
      { name: '香水', match: ['香水', '香氛'] },
      { name: '气雾剂', match: ['气雾剂', '喷雾', '喷雾剂', '发胶'] },
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

export const RESTRICTED_EXAMPLES = ['香水', '无人机', '锂电池', '摩托车', '电子烟'];

const CATEGORY_NAMES: Record<StoreCategoryId, string> = {
  moda: '时尚',
  tecnologia: '科技',
  hogar: '家居',
  marketplaces: '综合平台',
  belleza: '美妆',
};

export const STORE_CATEGORIES: typeof es.STORE_CATEGORIES = es.STORE_CATEGORIES.map((category) => ({
  ...category,
  name: CATEGORY_NAMES[category.id],
}));

const STORE_TEXT: Record<string, Pick<Store, 'tagline' | 'about'>> = {
  amazon: {
    tagline: '海量品类，一站汇集。',
    about: '探索家居用品、图书、配饰、科技产品等众多商品。',
  },
  shein: {
    tagline: '适合各种风格的时尚与配饰。',
    about: '服装、包袋和配饰。请留意尺码、材质和库存。',
  },
  temu: {
    tagline: '值得发现和比较的商品。',
    about: '家居用品、配饰和日常所需。请仔细阅读每件商品的描述。',
  },
  walmart: {
    tagline: '为家庭和家人采购。',
    about: '家居用品、收纳整理、配饰和个人用品。',
  },
  'best-buy': {
    tagline: '工作娱乐两相宜的科技产品。',
    about: '笔记本电脑、手机、平板电脑和游戏机。请确认按件费率和电池的相关要求。',
  },
  nike: {
    tagline: '让您自在运动的服装和鞋履。',
    about: '多个品类的鞋履、运动服装和配饰。',
  },
  apple: {
    tagline: '设备与配件。',
    about: '手机、平板电脑、笔记本电脑和配件。部分产品按件计费。',
  },
  target: {
    tagline: '为您的家和日常生活带来灵感。',
    about: '家居装饰、家居用品、礼品等多种品类。',
  },
  ebay: {
    tagline: '全新和二手商品。',
    about: '向不同卖家购买。请查看商品状况、详情和条款。',
  },
  sephora: {
    tagline: '美妆与个人护理。',
    about: '彩妆和个人护理用品。香水和气雾剂只能海运。',
  },
  'home-depot': {
    tagline: '为家居项目和改造提供灵感。',
    about: '工具和家居改造用品。请确认尺寸和相关限制。',
  },
  adidas: {
    tagline: '运动与生活方式。',
    about: '鞋履、运动服装和配饰。',
  },
};

export const STORES: Array<Store> = es.STORES.map((store) => ({ ...store, ...STORE_TEXT[store.id] }));

const hello = (text: string) => `你好 Carinova 👋 ${text}`;

/** One message per place, as in Spanish: the keys are the same and each text is still unique. */
export const WA_MESSAGES: typeof es.WA_MESSAGES = {
  floating: {
    '/': hello('我想了解如何把我在美国买的东西运过来。'),
    '/como-comprar': hello('我对服务的运作方式有个疑问。'),
    '/servicios': hello('我想知道哪种服务适合我。'),
    '/cotizador': hello('我需要帮忙估算运费。'),
    '/sucursales': hello('我想咨询一下你们的网点。'),
    '/casillero-en-miami': hello('我想开通我的 Miami 收货地址。'),
    '/tiendas': hello('我想在美国的商店购物，有个问题想问。'),
    '/rastreo': hello('我想知道我的包裹现在在哪里。'),
    '/mi-cuenta': hello('我在我的账户里，有个问题想咨询。'),
    '/registro': hello('我正在注册账户，有个疑问。'),
    '/registro/confirmar': hello('我正在确认邮箱，有个疑问。'),
    '/ingresar': hello('我想登录我的账户，有个疑问。'),
    '/empresas': hello('我想咨询你们的企业服务。'),
    '/preguntas-frecuentes': hello('我有一个问题在你们网站上没找到答案。'),
    '/articulos-prohibidos': hello('我对你们不能运送的物品有个疑问。'),
    '/nosotros': hello('我想多了解一下 Carinova。'),
    '/opiniones': hello('我看了你们客户的评价，想咨询一下。'),
    '/terminos': hello('我想咨询你们的条款和条件。'),
    '/privacidad': hello('我想咨询关于我个人信息的问题。'),
  },
  floatingDefault: hello('我从你们的网站过来，有个问题想咨询。'),
  footer: hello('我从你们的网站过来，想了解一些信息。'),
  channels: hello('我在你们的网站上找到了你们，想和你们联系。'),

  /** "Contactar al equipo", under the conditions of the service on the home page. */
  homeConditions: hello('我在你们的首页看了服务条款，有一个问题想咨询。'),

  trackItemCheck: (item: string) => hello(`我在你们的包裹追踪页面，想知道你们能不能运送：${item}`),
  trackItemCheckEmpty: hello('我在你们的包裹追踪页面，想咨询某件物品：'),
  trackPackage: (code: string, reference: string) =>
    hello(`我的 Carinova ID 是 ${code}。我正在追踪我的包裹 ${reference}，有个问题想咨询。`),
  trackMissing: (code: string, reference: string) =>
    hello(`我的 Carinova ID 是 ${code}。我在账户里找不到包裹 ${reference}。`),
  trackClosing: hello('我在包裹追踪里找不到我的包裹。能帮帮我吗？'),

  howToClosing: hello('我已经了解了使用流程，想请你们帮我完成第一次寄件。'),
  example: (category: string) => hello(`我看到了你们“${category}”的示例，想运送类似的东西。`),

  services: {
    aereo: hello('我想走空运。能告诉我更多信息吗？'),
    maritimo: hello('我想走海运。能告诉我更多信息吗？'),
    encomiendas: hello('有人要从美国给我寄包裹。我该怎么做？'),
    'compras-asistidas': hello('我想请你们帮我代购一件商品。这是链接：'),
    'retiro-en-sucursal': hello('我想知道如何在网点领取我的包裹。'),
    'entrega-a-domicilio': hello('我想预约送货上门。覆盖范围和费用是怎样的？'),
  },
  servicesClosing: hello('我想请你们帮我选择寄件服务。'),

  lockerClosing: hello('注册账户之前，我想多了解一下 Miami 收货地址。'),
  storesShopper: (link: string) =>
    hello(`我在你们的商店页面，想申请代购。商品：${link} 能帮我确认一下库存、能否寄送和总费用吗？`),
  storePageAssist: (store: string) => hello(`我在你们的商店页面看到了 ${store}，想请你们帮我代购。这是商品链接：`),
  storesClosing: hello('我想请你们帮我在美国的商店购物。'),

  quote: (shipment: string, total: string) =>
    hello(`我用你们的运费计算器估算了运费，${shipment}：${total}。能帮我确认一下吗？`),
  quoteEmpty: hello('我在你们的运费计算器上，不知道该填什么。'),
  quoteClosing: hello('我想估算一票特殊货件的运费（体积很大、易碎或包含多件物品）。'),

  branch: (city: string) => hello(`我有个问题想咨询 ${city} 网点。`),
  branchesClosing: hello('我想知道在哪个网点取件更方便。'),

  accountClosing: hello('注册账户之前，我有个疑问。'),

  signupAssist: hello('我更想通过 WhatsApp 注册账户。'),
  signupHelp: hello('我尝试在你们的网站注册，需要帮助。'),
  confirmHelp: hello('我无法确认邮箱来创建账户。'),
  accountExisting: hello('我已经有 Carinova ID 了，想咨询我的包裹。'),
  customer: (code: string) => hello(`我的 Carinova ID 是 ${code}，有个问题想咨询。`),
  welcomeEmail: (code: string) => hello(`我的 Carinova ID 是 ${code}。我收到了欢迎邮件，有个疑问。`),

  signinHelp: hello('我无法登录我的账户。能帮帮我吗？'),
  signinError: hello('我尝试在你们的网站登录账户，但出现了错误。'),
  accountPackages: (code: string) => hello(`我的 Carinova ID 是 ${code}。我想咨询我的包裹。`),
  accountPackage: (code: string, reference: string) =>
    hello(`我的 Carinova ID 是 ${code}。我想咨询我的包裹 ${reference}。`),
  accountInvoice: (code: string, number: string) =>
    hello(`我的 Carinova ID 是 ${code}。我想支付或咨询账单 ${number}。`),
  accountUpdate: (code: string) => hello(`我的 Carinova ID 是 ${code}，我想更新我的资料。`),
  accountError: hello('我尝试在你们的网站打开我的账户，但出现了错误。'),

  accountCompany: hello('我想为我的公司开通一个 Carinova ID。'),
  businessHelp: hello('我尝试提交企业表单，需要帮助。'),
  businessClosing: hello('我想和顾问聊聊我们公司的货运。'),

  faqClosing: hello('我在你们的常见问题里没有找到答案。'),
  restricted: hello('购买之前，我想知道你们能不能运送这件商品：'),
  aboutClosing: hello('我在你们的网站上认识了 Carinova，想开始通过你们寄件。'),
  /** The closing band of the page of reviews. */
  reviewsClosing: hello('我看了其他客户的评价，想通过你们寄第一件包裹。'),
  careers: hello('我想加入 Carinova 团队。我感兴趣的领域是：'),
  notFound: hello('我打开了你们网站上一个不存在的页面。'),
};
