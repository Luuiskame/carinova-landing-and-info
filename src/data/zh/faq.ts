/**
 * Simplified Chinese wording of ../faq.ts: the same questions, in the same groups and the same
 * order, with the same ones on the home page (src/i18n/translations.test.ts compares them). Prices,
 * times and lists come from the Chinese data, which takes every fact from the Spanish data; the
 * names of the package stages come from the Chinese dictionary (ui.statuses).
 */
import { LOGIN_CODE_DIGITS, PACKAGE_STAGES } from '../account.ts';
import { CARINOVA_ID_EXAMPLE, type RestrictedItem } from '../carinova.ts';
import { FAQ_STORE_COUNT, type FaqGroup, type LinkTo } from '../faq.ts';
import { ui } from '../../i18n/ui/zh.ts';
import {
  CUBIC_CM_PER_CUBIC_FOOT,
  describeVolume,
  formatNumber,
  formatUSD,
  quoteByVolume,
  quoteByWeight,
} from '../../utils/rates.ts';
import { BRANCHES, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, STORES, describeHours } from './carinova.ts';
import { FORMULA_EXAMPLE } from './services.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city).join(' 和 ');
const [hours] = BRANCHES[0].hours;
const receiving = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
const soonReception = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);
const devices = electronics.items.map((item) => `${item.plural} ${formatUSD(item.price)}`).join('、');
const stores = STORES.slice(0, FAQ_STORE_COUNT)
  .map((store) => store.name)
  .join('、');
/**
 * "汽车、摩托车和重型机械"; when an item carries enumeration commas of its own, the items are
 * separated by semicolons instead: "武器、弹药及其配件；无人机".
 */
const inline = (items: Array<RestrictedItem>) => {
  const names = items.map((item) => item.name);
  if (names.some((name) => name.includes('、'))) return names.join('；');
  return names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join('、')}和${names[names.length - 1]}`;
};
const stages = PACKAGE_STAGES.map((stage) => ui.statuses.package[stage.id].name).join('、');

export const faqGroups = (link: LinkTo): Array<FaqGroup> => [
  {
    id: 'cuenta',
    title: '账户和 Carinova ID',
    items: [
      {
        title: '如何获取我的 Carinova ID？',
        description: `使用您的电子邮箱和电话号码完成${link('/registro', '注册')}，并通过我们发送的链接确认邮箱。确认后，平台会自动生成您专属的 Carinova ID（例如 ${CARINOVA_ID_EXAMPLE}）。`,
        featured: 1,
      },
      {
        title: '什么是 Carinova ID？',
        description: '它是您账户的识别号。每个人或每家企业一个，适用于我们的所有服务：空运、海运、包裹转运和代购。',
      },
      {
        title: `什么是 ${receiving.join(' 和 ')} 美国收货地址（“casillero”）？如何使用？`,
        description: `它是一个以您的名字登记的美国地址：网购时将它填为收货地址，寄到我们仓库的东西，我们会运到尼加拉瓜。在 Carinova，它随账户一起提供：注册时您会获得 Carinova ID 和收货地址。${link('/casillero-en-miami', '了解美国收货地址')}。`,
      },
      {
        title: '如何登录我的账户？',
        description: `点击${link('/ingresar', '登录')}，输入您注册时使用的邮箱：我们会发送一个${LOGIN_CODE_DIGITS}位数验证码，凭它即可登录，无需密码。在${link('/mi-cuenta', '您的账户')}中，可以查看您的 Carinova ID、美国收货地址、包裹和付款。`,
      },
      {
        title: '注册账户要多少钱？',
        description: `注册账户免费：您只需支付每件包裹的运费。${link('/registro', '在线注册')}，获取您的 Carinova ID。`,
      },
      {
        title: '我可以为公司开设账户吗？',
        description: `可以：每个人或每家企业一个 Carinova ID。请在${link('/empresas', '企业表单')}中介绍贵公司，我们会与您联系；您也可以通过 WhatsApp 联系我们。`,
      },
      {
        title: '我在美国购买的商品寄到哪里？',
        description: `您的账户中会显示我们位于 ${receiving.join(' 和 ')} 的仓库地址和收货说明。请完全按照这些信息填写，以便我们识别您的货件。${
          soonReception.length ? `${soonReception.join(' 和 ')} 的收货服务也即将开通。` : ''
        }`,
        featured: 2,
      },
    ],
  },
  {
    id: 'servicios',
    title: '服务',
    items: [
      {
        title: '空运和海运有什么区别？',
        description: `空运更快：${air.transit}，每磅 ${formatUSD(air.pricePerLb)}。海运更经济：${sea.transit}，每磅 ${formatUSD(sea.pricePerLb)} 或每立方英尺 ${formatUSD(sea.pricePerCubicFoot)}，适合大件货物和计划性采购。时效${RATES.transitFrom}。`,
      },
      {
        title: '什么是包裹转运？',
        description: '任何以您的名义寄到我们仓库的包裹：您的网购商品，或家人从美国寄给您的箱子。空运或海运，随您选择。',
      },
      {
        title: '你们可以帮我代购商品吗？',
        description: `可以。选择商店，并把链接分享给我们。代购需要确认库存、能否入境，以及商品、服务和运输的费用。${link('/#compras', '准备您的申请')}。`,
        featured: 8,
      },
      {
        title: '我可以在哪些商店购物？',
        description: `任何配送范围覆盖美国境内的网店：${stores} 等众多商店。`,
      },
      {
        title: '如何从尼加拉瓜在 Amazon、SHEIN 或 Temu 购物？',
        description: `注册账户，在商店结账时将账户中的地址填为收货地址，我们就会把您的包裹空运或海运到尼加拉瓜。如果您希望我们代为购买，可以申请代购。${link('/tiendas', '查看商店')}。`,
      },
    ],
  },
  {
    id: 'tarifas',
    title: '运费和付款',
    items: [
      {
        title: '从美国寄包裹到尼加拉瓜要多少钱？',
        description: `空运每磅 ${formatUSD(air.pricePerLb)}；海运每磅 ${formatUSD(sea.pricePerLb)} 或每立方英尺 ${formatUSD(sea.pricePerCubicFoot)}。例如，一个5磅的包裹走空运，运费为 ${formatUSD(quoteByWeight(5, air.pricePerLb).total)}。${link('/cotizador', '计算您的运费')}。`,
      },
      {
        title: '运费如何计算？',
        description: `空运：每磅 ${formatUSD(air.pricePerLb)}，特定电子产品按件计费。海运：每磅 ${formatUSD(sea.pricePerLb)} 或每立方英尺 ${formatUSD(sea.pricePerCubicFoot)}。计费基础取决于货物和服务条件。用我们的${link('/cotizador', '运费计算器')}算一算。`,
        featured: 4,
      },
      {
        title: '立方英尺如何计算？',
        description: `将箱子的长、宽、高（英寸）相乘，再将结果除以1,728；如果以厘米测量，则除以${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)}。例如：${describeVolume(
          quoteByVolume(FORMULA_EXAMPLE.dims, sea.pricePerCubicFoot, { unit: FORMULA_EXAMPLE.unit }),
          'zh'
        )}。`,
      },
      {
        title: '哪些电子产品按件计费？',
        description: `空运货件：${devices}。按件费率不与按磅费率叠加。`,
      },
      {
        title: '运费包含保险和税费吗？',
        description:
          '如适用于该货件，运费已包含保险和税费。保障范围、限额、除外情形和附加费用以服务条件为准。下单前请确认适用的条款。',
        featured: 5,
      },
      {
        title: '估算价格就是我要支付的金额吗？',
        description:
          '不一定。计算器算出的是参考运费，不包括商品购买费用和送货上门服务。最终金额将在核实尺寸、重量、内容物、运输方式和具体条件后确认。',
        featured: 9,
      },
      {
        title: '我什么时候付款？如何付款？',
        description: `您在领取包裹或安排配送时支付运费。请联系我们了解可用的付款方式。在${link('/mi-cuenta', '您的账户')}中，您可以查看账单和我们已确认的付款。`,
      },
    ],
  },
  {
    id: 'tiempos',
    title: '时效和追踪',
    items: [
      {
        title: `从 ${receiving.join(' 和 ')} 寄到尼加拉瓜需要多长时间？`,
        description: `空运${air.transit}；海运${sea.transit}。时效${RATES.transitFrom}，可能因运输、海关和目的地而有所不同。`,
      },
      {
        title: '时效从什么时候开始计算？',
        description: `从实际收到包裹时开始计算，而不是从购买日期开始。空运：${air.transit}。海运：${sea.transit}。以上均为预估时间，受运输、海关和目的地影响。`,
        featured: 3,
      },
      {
        title: '如何用一个 Carinova ID 追踪多个包裹？',
        description: `Carinova ID 对应您的账户。${link('/ingresar', '登录')}后，您可以看到每件包裹的参考号及其追踪状态。为保障安全，仅凭账户号码无法查询私人数据。`,
        featured: 10,
      },
      {
        title: '我的包裹可能有哪些状态？',
        description: `依次为：${stages}。每次变更都会记录在包裹的历史记录中，可在${link('/mi-cuenta', '您的账户')}中查看。`,
      },
    ],
  },
  {
    id: 'prohibidos',
    title: '限运物品',
    items: [
      {
        title: '我可以运送哪些物品？',
        description: `这取决于货物类型、其组成部分和运输规定。我们不接收也不运输：${inline(RESTRICTED_ITEMS.prohibited.items)}。我们暂未获准运送：${inline(RESTRICTED_ITEMS.notYet.items)}。${link('/articulos-prohibidos', '查看完整清单')}；如果您的物品不在清单上，请在购买前咨询我们。`,
        featured: 6,
      },
      {
        title: '我可以运送香水或气雾剂吗？',
        description: `可以，走海运即可：${inline(RESTRICTED_ITEMS.seaOnly.items)}不能空运。`,
      },
      {
        title: '我可以运送汽车或摩托车吗？',
        description: `暂时不行：我们目前仍未获准运送${inline(RESTRICTED_ITEMS.notYet.items)}。`,
      },
    ],
  },
  {
    id: 'retiro',
    title: '自提和配送',
    items: [
      {
        title: '我在哪里领取包裹？',
        description: `在我们位于 ${cities} 的网点领取，营业时间：${describeHours(hours)}。${link('/sucursales', '查看地址和营业时间')}。`,
      },
      ...BRANCHES.slice(1).map((branch) => ({
        title: `你们可以寄到 ${branch.city} 吗？`,
        description: `可以：除了 ${BRANCHES[0].city}，我们在 ${branch.city} 也设有自提网点。${link(`/sucursales#${branch.id}`, `查看 ${branch.city} 网点`)}。`,
      })),
      {
        title: '你们提供送货上门吗？',
        description: '我们可配送至全国各地，视协调情况和覆盖范围而定。送货上门需另行收费，费用取决于目的地和运营条件。',
        featured: 7,
      },
      {
        title: '别人可以替我领取包裹吗？',
        description: '可以。请在取件前通过 WhatsApp 告知我们被授权人的姓名；取件时，对方需出示身份证件。',
      },
      {
        title: '你们会保管我的包裹多长时间？',
        description: '建议您在包裹可交付后尽快领取。未按时领取的包裹可能会根据我们的条款产生仓储费用。',
      },
    ],
  },
];
