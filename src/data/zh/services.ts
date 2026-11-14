/**
 * Simplified Chinese wording of ../services.ts: the same exports, in Chinese. Ids, icons,
 * availability, links and the numbers of the worked examples are taken from the Spanish file; prices
 * and times are worked out from the same rates. Only the words are written here, keyed by id, so
 * adding a service or an example in Spanish without its Chinese text fails the unit tests.
 */
import * as es from '../services.ts';
import type { ProcessStep, Service, ServiceAxis, ServiceAxisId, ShoppingExample } from '../services.ts';
import { formatUSD } from '../../utils/rates.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, describeHours } from './carinova.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city);
const [branchHours] = BRANCHES[0].hours;

/** "a、b和c"; a space only beside a Latin word: "Managua 和 Bluefields". */
const listOf = (items: Array<string>): string => {
  if (items.length < 2) return items[0] ?? '';
  const head = items.slice(0, -1).join('、');
  const last = items[items.length - 1];
  return `${head}${/[A-Za-z]$/.test(head) ? ' ' : ''}和${/^[A-Za-z]/.test(last) ? ' ' : ''}${last}`;
};

/** "手机 US$30、平板电脑 US$40、…" */
const devicePrices = electronics.items.map((item) => `${item.plural} ${formatUSD(item.price)}`).join('、');

/** The text of an id, or an error that names what is missing. */
const textOf = <T>(table: Record<string, T>, id: string, kind: string): T => {
  const text = table[id];
  if (!text) throw new Error(`The ${kind} "${id}" has no Chinese text (src/data/zh/services.ts).`);
  return text;
};

const AXIS_TEXT: Record<ServiceAxisId, Pick<ServiceAxis, 'name' | 'question' | 'rule'>> = {
  transporte: {
    name: '运输方式',
    question: '您的包裹怎么运？',
    rule: '两条路线，同一个目的地：要速度还是要省钱，由您决定。',
  },
  solucion: {
    name: '商业方案',
    question: '由谁来购买？',
    rule: '您自己购买或由家人寄给您，也可以由我们为您代购。',
  },
  distribucion: {
    name: '最终配送',
    question: '您在尼加拉瓜如何收货？',
    rule: '在我们的网点自提，或送货上门（另行收费）。',
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
    name: '空运',
    summary: `每磅 ${formatUSD(air.pricePerLb)} · ${air.transit}`,
    description: '专为想尽快收到的物品设计。按磅收取基础运费，部分电子产品按件收取固定费用。',
    facts: [
      `预计送达：${air.transit}，${RATES.transitFrom}。`,
      `基础费率：每磅 ${formatUSD(air.pricePerLb)}。`,
      `电子产品按件计费：${devicePrices}。`,
      `以下物品不能空运，但可以海运：${listOf(RESTRICTED_ITEMS.seaOnly.items.map((item) => item.name))}。`,
      '适用费率将根据货物类型、包装和服务条件确认。',
    ],
    link: '计算空运运费',
  },
  maritimo: {
    name: '海运',
    summary: `每磅 ${formatUSD(sea.pricePerLb)} 或每立方英尺 ${formatUSD(sea.pricePerCubicFoot)} · ${sea.transit}`,
    description: '适合大件货物、计划性采购以及优先考虑成本的货件。按重量或按体积报价。',
    facts: [
      `预计送达：${sea.transit}，${RATES.transitFrom}。`,
      `按重量的基础费率：每磅 ${formatUSD(sea.pricePerLb)}。`,
      `按体积的费率：每立方英尺 ${formatUSD(sea.pricePerCubicFoot)}。`,
      '按重量还是按体积计费，取决于货物、包装和服务条件。',
    ],
    link: '计算海运运费',
  },
  encomiendas: {
    name: '包裹转运',
    summary: '您或您的家人寄到我们仓库的东西。',
    description: '凡是以您的名义寄到我们仓库的包裹，我们都能运送：无论是您的网购商品，还是家人从美国寄给您的箱子。',
    facts: [
      '您可以在任何配送范围覆盖美国境内的商店购物。',
      '您的家人或朋友也可以把箱子寄到您的 Miami 地址。',
      '空运或海运，随您选择。',
    ],
    link: '了解使用流程',
  },
  'compras-asistidas': {
    name: '代购',
    summary: '您选择商品，我们替您购买。',
    description: '选择商店，把商品链接分享给我们：我们替您完成购买。',
    facts: [
      '购买前，我们会确认库存、该物品能否寄送以及总费用。',
      '在办理之前，我们会确认商品费用、税费和运费。',
      '商品送达我们的仓库后，会像其他包裹一样运送。',
    ],
    link: '准备我的申请',
    whatsappText: '申请代购',
  },
  'retiro-en-sucursal': {
    name: '网点自提',
    summary: `${listOf(cities)} · ${branchHours.days}`,
    description: '当您的包裹可以交付时，到离您最近的网点领取即可。',
    facts: [`网点位于 ${listOf(cities)}。`, `营业时间：${describeHours(branchHours)}。`],
    link: '查看网点',
  },
  'entrega-a-domicilio': {
    name: '送货上门',
    summary: '全国范围，另行收费。',
    description: '我们可配送至全国各地，视协调情况和覆盖范围而定。送货上门需另行收费，费用取决于目的地和运营条件。',
    facts: ['地址、覆盖范围和费用将在安排配送时确认。'],
    whatsappText: '咨询送货上门',
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
/** "Los Angeles 即将开通。" or nothing, once every warehouse is open. */
const soonNote = receivingSoon.length ? `${listOf(receivingSoon)} 即将开通。` : '';

/** In the order of ../services.ts: the steps have no id. */
const STEP_TEXT: Array<Pick<ProcessStep, 'title' | 'summary' | 'details'> & { link: string }> = [
  {
    title: '注册账户',
    summary: `确认邮箱，即可获得 Carinova ID 和您的美国收货地址：位于 ${listOf(receivingNow)} 的收货地址。`,
    details: [
      '填写一份简短表格，并通过我们发送的链接确认您的邮箱。',
      '确认后，您会看到您的 Carinova ID 和美国收货地址，我们也会通过邮件发送给您。',
      '之后，您只需用邮箱和一次性验证码登录：无需记住任何密码。',
    ],
    link: CTA.signup.text,
  },
  {
    title: `购物并寄到 ${listOf(receivingNow)}`,
    summary: '购物时使用您账户中的地址。请先确认您的物品允许寄送。',
    details: [
      `将您购买的商品寄到账户中显示的、我们位于 ${listOf(receivingNow)} 的仓库地址。${soonNote}`,
      '在商店结账时，请完全按照地址中显示的内容填写您的名字和姓氏。',
      '购物前，请先查看该物品能否寄送：有些物品被禁止，有些我们尚未获准运送，还有些只能海运。',
      '更希望我们帮您买？申请代购即可。',
    ],
    link: '查看物品',
  },
  {
    title: '在尼加拉瓜收货',
    summary: `在 ${cities.join(' 或 ')} 自提。全国各地均可送货上门，另行收费。`,
    details: [
      `空运${air.transit}、海运${sea.transit}即可送达，${RATES.transitFrom}。`,
      '您可以在账户中凭包裹参考号跟踪每个阶段。',
      `我们网点的营业时间：${describeHours(branchHours)}。`,
      '送货上门将根据目的地和覆盖范围安排。',
    ],
    link: '查看网点',
  },
];

export const PROCESS_STEPS: Array<ProcessStep> = es.PROCESS_STEPS.map((step, index) => {
  const text = STEP_TEXT[index];
  if (!text) throw new Error(`Step ${index + 1} of "¿Cómo funciona?" has no Chinese text (src/data/zh/services.ts).`);
  return {
    ...step,
    title: text.title,
    summary: text.summary,
    details: text.details,
    link: step.link && { ...step.link, text: text.link },
  };
});

const ACCOUNT_TEXT: Record<string, { title: string; summary: string }> = {
  'carinova-id': { title: 'Carinova ID', summary: '每个人或每家企业一个，用于您的所有货件。' },
  direccion: { title: '您的美国收货地址', summary: `${listOf(receivingNow)}。${soonNote}` },
  paquetes: {
    title: '您的包裹',
    summary: '我们仓库已收到和已发出的包裹，以及每件包裹的状态。',
  },
  pagos: { title: '您的付款', summary: '您的账单以及我们已确认的付款。' },
};

export const ACCOUNT_PARTS: typeof es.ACCOUNT_PARTS = es.ACCOUNT_PARTS.map((part) => ({
  ...part,
  ...textOf(ACCOUNT_TEXT, part.id, 'account part'),
}));

const EXAMPLE_TEXT: Record<string, Pick<ShoppingExample, 'category' | 'item' | 'source'>> = {
  ropa: {
    category: '服装和鞋子',
    item: '两件女式衬衫、一条裤子和一双运动鞋：3 lb',
    source: '来自 SHEIN 和 Nike',
  },
  celulares: { category: '手机和平板电脑', item: '一部新手机', source: '来自 Amazon' },
  laptops: { category: '笔记本电脑和游戏机', item: '一台笔记本电脑', source: '来自 Best Buy' },
  hogar: { category: '家居和厨房', item: '一套锅具（18 lb）', source: '来自 Walmart' },
  muebles: {
    category: '家具',
    item: '一把办公椅，装在28 × 26 × 14英寸的箱子里',
    source: '来自 Home Depot',
  },
  encomienda: {
    category: '亲友包裹',
    item: '一箱衣服和礼物（8 lb）',
    source: '来自您在美国的家人',
  },
};

export const SHOPPING_EXAMPLES: Array<ShoppingExample> = es.SHOPPING_EXAMPLES.map((example) => ({
  ...example,
  ...textOf(EXAMPLE_TEXT, example.id, 'example'),
}));

export const quoteExample = es.exampleQuoter(
  RATES,
  {
    airWeight: '空运，按磅',
    seaWeight: '海运，按重量',
    seaVolume: '海运，按体积',
    unit: '空运，按件费率',
    unitNote: '按件费率不与按磅费率叠加。',
  },
  'zh'
);

export const FORMULA_EXAMPLE: typeof es.FORMULA_EXAMPLE = { ...es.FORMULA_EXAMPLE, item: '一个货运托盘' };
