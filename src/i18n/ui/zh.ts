/**
 * What the pages and the components say, in Simplified Chinese. Same shape as ./es.ts (`UI`): every
 * entry of the Spanish dictionary, translated.
 *
 * - 您 for the customer, full-width punctuation; a space only between Chinese and a Latin word.
 * - City names (Managua, Bluefields, Miami) stay in Latin letters, as on maps and addresses.
 */
import { LOGIN_CODE_DIGITS, LOGIN_CODE_MINUTES, SESSION_DAYS } from '../../data/account.ts';
import { CONTACT } from '../../data/carinova.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, describeHours } from '../../data/zh/carinova.ts';
import { CONFIRM_LINK_HOURS } from '../../data/signup.ts';
import { CUBIC_CM_PER_CUBIC_FOOT, formatNumber, formatUSD } from '../../utils/rates.ts';
import type { UI } from './es.ts';
import { landing } from './landing/zh.ts';

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
    loading: '正在打开您的账户…',
    noscript: '要查看您的账户，请在浏览器中启用 JavaScript。',
    eyebrow: '我的账户',
    idLabel: '您的 Carinova ID',
    idNote: '联系我们或领取包裹时，请备好此 ID。',
    sections: '账户栏目',
    packagesIntro: '我们仓库已收到和已发出的包裹，以及每件包裹的状态。',
    filterLabel: '筛选包裹',
    filters: { all: '全部', warehouse: '在仓库', shipped: '已发出', delivered: '已交付' },
    packagesEmpty: '我们尚未收到寄给您的包裹。第一件包裹到达我们的仓库后，您会在这里看到它及其状态。',
    packagesNone: '此分类下没有包裹。',
    packagesAsk: '咨询我的包裹',
    history: '查看记录',
    packageAsk: '咨询此包裹',
    paymentsIntro: '您的账单以及我们已确认的付款。',
    invoicesEmpty: '您还没有账单。我们开出第一张账单后，您会在这里看到。',
    payments: '付款',
    invoiceAsk: '支付或咨询此账单',
    paymentsNote: '如需付款或告知我们您已付款，请联系我们并注明账单编号。付款经我们的团队核实后，会显示为已确认。',
    activityError: '无法加载您的包裹和付款信息。',
    retry: '重试',
    detailsTitle: '我的资料',
    detailsIntro: '这是您注册账户时填写的资料。',
    name: '姓名',
    email: '电子邮箱',
    phone: '电话',
    address: '地址',
    since: '加入时间',
    changed: '资料有变动？',
    update: '申请更新我的资料',
    nextTitle: '您想做什么？',
    howItWorks: '了解使用流程',
    restricted: '查看哪些物品可以寄送',
    signOut: '退出登录',
    signingOut: '正在退出…',
    errorTitle: '无法打开您的账户',
    errorText: '请检查网络连接后重试。如果仍然失败，请通过 WhatsApp 联系我们。',
    script: {
      hello: '{name}，您好',
      documentTitle: '我的账户 {code} | Carinova',
      received: '仓库签收',
      warehouse: '仓库',
      weight: '重量',
      pounds: '{weight} 磅',
      pieces: '件数',
      pickup: '取件网点',
      delivery: '配送方式',
      homeDelivery: '送货上门',
      store: '商店',
      carrier: '承运商',
      issued: '开具于 {date}',
      due: '{date} 到期',
      total: '合计',
      paid: '已付',
      balance: '未付',
      forPackage: '{description}（{reference}）',
      balanceDue: '待付金额：{amount}',
      inReview: '审核中的付款：{amount}',
      nothingDue: '您没有待付款项。',
    },
  },

  // components/carinova/Branches.astro
  branches: {
    tagline: '网点',
    title: `在 ${cities.join(' 或 ')} 自提`,
    directions: '如何到达',
    branch: (city: string) => `（${city} 网点）`,
  },

  // components/carinova/BusinessForm.astro
  businessForm: {
    title: '介绍一下您的公司',
    intro: '填写以下信息，我们会与您联系。',
    noscript: '要提交表单，请在浏览器中启用 JavaScript。您也可以通过 WhatsApp 联系我们。',
    company: '公司名称',
    contactName: '您的姓名',
    email: '电子邮箱',
    phone: '电话',
    phoneHint: '最好填写您使用 WhatsApp 的号码。',
    country: '国家',
    city: '城市',
    volume: '预计货量',
    optional: '（选填）',
    choose: '请选择',
    message: '贵公司有什么需求？',
    messageHint: '运什么货、从哪里运、多久运一次。',
    honeypot: '此栏请留空',
    submit: '提交申请',
    sending: '正在提交…',
    sentTitle: '我们已收到您的申请',
    sentText: '谢谢。我们的团队会审核您的申请，并通过您留下的邮箱或电话与您联系。',
    home: '返回首页',
    privacyNote: ['提交后，我们将按照', '隐私政策', '的说明，使用这些信息与您联系。'],
    messages: {
      missing: '请填写此栏。',
      unavailable: '表单暂时无法使用。请通过 WhatsApp 联系我们，我们会为您服务。',
      busy: '尝试次数过多。请稍等一分钟后再试。',
      failed: '无法提交您的申请。请检查网络连接后重试，或通过 WhatsApp 联系我们。',
      oneError: '有1个字段需要修改。',
      manyErrors: '有{count}个字段需要修改。',
    },
  },

  // components/carinova/QuoteCalculator.astro
  quoteCalculator: {
    title: '估算您的运费',
    badge: '无需注册',
    mode: '您想怎么运？',
    basis: '计费方式',
    basisHint: '只能选择一种计费基础：重量、体积和按件费率不会相加。',
    byWeight: '按重量（磅）',
    byVolume: '按体积（立方英尺）',
    perUnit: (name: string) => `${name}（按件）`,
    weightEach: '每件包裹的重量（lb）',
    packages: '包裹数量',
    kilos: '只知道公斤数？1 kg = 2.2 lb。',
    dimensions: ['长', '宽', '高'],
    unit: '尺寸单位',
    units: { cm: '厘米', pulg: '英寸' },
    pieces: '件数',
    quantity: '数量',
    estimate: '基础运费估算',
    what: '您要估算什么？',
    send: '通过 WhatsApp 发送我的估算',
    reset: '重置',
    estimateNote: '根据现行基础费率计算的参考数字。',
    footnote:
      '这是参考估算，并非合同报价。最终费用取决于对重量、尺寸、内容物、适用费率及可能的附加费用的核实。不包括商品费用和送货上门费用。',
    script: {
      delivery: '预计送达：{transit}，{from}。',
      explainWeight:
        '每件包裹的重量乘以包裹数量，每票货物最低按 {minimum} lb 计费。重量和适用的计费基础将在收货时核实。',
      explainVolume: '长 × 宽 × 高，换算为立方英尺（1 英尺 = 30.48 cm = 12 英寸），无最低限额，不做进位。',
      explainUnit: '所选物品的空运按件费率，不再另加按磅费用。',
      comparison: '仅供比较：同样的重量走{mode}，费用为 {total}（{transit}）。',
      check: '请检查数据',
      checkHint: '请填写大于零的数值。',
      needData: '请输入重量、尺寸或数量，查看估算结果。',
      weightShipment: '一件{weight} lb 的{mode}包裹',
      weightShipmentMany: '{count}件{mode}包裹，每件{weight} lb',
      volumeShipment: '{count}件{mode}货物，尺寸 {measurements} {unit}',
      unitShipment: '{units}（{mode}）',
      unitCm: 'cm',
      unitIn: '英寸',
      announce: '估算：{total}',
    },
  },

  // components/carinova/RateCards.astro
  rateCards: {
    tagline: '运费',
    title: '两条路线，同一个目的地。',
    subtitle: '如适用于您的货件，运费已包含保险和税费。时效从实际收到您的包裹时起算。',
    cities: BRANCHES.map((branch) => branch.city).join(' 和 '),
    perPound: '每磅',
    perCubicFoot: '每立方英尺',
    airFacts: ['专为想尽快收到的物品设计。', '部分电子产品按件收取固定费用。'],
    seaFacts: ['适合大件货物和计划性采购。', '按重量还是按体积计费，取决于货物、包装和服务条件。'],
    calculate: (name: string) => `计算${name}运费`,
    calculateUnits: '按件计算',
    electronicsNote: '空运按件费率，不与按磅费率叠加。',
    pickup: '网点自提：',
    homeDelivery: '送货上门',
    howTitle: '我们如何计费',
    howIntro: '每次只采用一种计费基础：重量、体积和按件费率不会相加。',
    byPound: {
      title: '按磅',
      applies: '空运和海运',
      rule: '重量（磅）× 每磅费率，无最低限额，不做进位。重量在收货时核实。',
    },
    byCubicFoot: {
      title: '按立方英尺',
      applies: '海运',
      rule: `箱子的长 × 宽 × 高，以英寸测量时 ÷ 1,728，以厘米测量时 ÷ ${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)}，得出立方英尺数；再 × ${formatUSD(sea.pricePerCubicFoot)}。`,
      link: '在计算器中试试',
    },
    byUnit: {
      title: '按件',
      applies: '电子产品，空运',
      rule: '数量 × 设备费率，不再另加按磅费用。',
    },
  },

  // components/carinova/ServiceBadge.astro
  serviceBadge: { soon: '即将推出', extra: '另行收费' },

  // components/carinova/ShippingModes.astro
  shippingModes: {
    eyebrow: '寄往尼加拉瓜的空运和海运',
    title: ['两种方式。', '一个目的地。'],
    intro: '选择您想要的收货方式。急需时选择更快，能提前计划时更省钱。比较之后再决定。',
    air: {
      tag: '更快送达',
      overline: '空运',
      title: '当时间很重要时。',
      text: '适合想尽快收到的网购商品和包裹。',
    },
    sea: {
      tag: '提前规划',
      overline: '海运',
      title: '为您的计划留出更多空间。',
      text: '适合计划性采购和较大的货物。',
    },
    baseRate: '基础费率',
    perPound: '/磅',
    orPerCubicFoot: (price: string) => `或每立方英尺 ${price}`,
    electronics: '电子产品：按件计费',
    delivery: '预计送达',
    details: (name: string) => `查看${name}详情`,
    important: '重要提示：',
  },

  // components/carinova/SigninDialog.astro
  signinDialog: { label: '登录您的账户', close: '关闭' },

  // components/carinova/SigninForm.astro
  signinForm: {
    title: '使用电子邮箱登录',
    intro: `我们会向您的邮箱发送一个${LOGIN_CODE_DIGITS}位数验证码，无需密码。`,
    noscript: '要登录，请在浏览器中启用 JavaScript。',
    email: '电子邮箱',
    emailHint: '您注册账户时使用的邮箱。',
    send: '发送验证码',
    sending: '正在发送…',
    noAccount: '还没有账户？',
    codeTitle: '输入验证码',
    codeSent: ['如果 ', ` 已注册账户，我们已向其发送${LOGIN_CODE_DIGITS}位数验证码，${LOGIN_CODE_MINUTES}分钟内有效。`],
    code: `${LOGIN_CODE_DIGITS}位数验证码`,
    enter: CTA.signin.text,
    entering: '正在登录…',
    notes: [
      '验证码可能需要几分钟才能送达。如果没有收到，请检查垃圾邮件文件夹。',
      '我们绝不会通过 WhatsApp 或电话向您索要此验证码。',
    ],
    notArriving: '如果一直没有收到，可能该邮箱尚未注册账户。',
    openYours: '立即注册',
    resend: '重新发送验证码',
    change: '使用其他邮箱',
    signedIn: '您已在此浏览器中登录。',
    messages: {
      emailMissing: '请输入您的电子邮箱。',
      codeMissing: `请输入${LOGIN_CODE_DIGITS}位数验证码。`,
      codeInvalid: '验证码不正确或已过期。请检查，或重新获取验证码。',
      resendIn: '重新发送验证码（{seconds}秒）',
      resent: '已完成：如果该邮箱已注册账户，我们已重新发送验证码。之前的验证码已失效。',
      unavailable: '登录功能暂时无法使用。请通过 WhatsApp 联系我们，我们会帮助您。',
      busy: '尝试次数过多。请稍等一分钟后再试。',
      failed: '无法连接。请检查网络连接后重试。',
    },
  },

  // components/carinova/SignupConfirm.astro
  signupConfirm: {
    readyTitle: '确认您的电子邮箱',
    readyText: '还差一步：确认您的邮箱，即可创建账户，并查看您的 Carinova ID 和美国收货地址。',
    confirm: '确认并创建我的账户',
    confirming: '正在创建您的账户…',
    noscript: '要确认您的邮箱，请在浏览器中启用 JavaScript。',
    doneTitle: '您的账户已准备就绪！',
    doneIntro: '这是您的 Carinova ID。请妥善保存：我们凭它识别您的账户。',
    emailed: '我们也已通过邮件将这些信息发送给您。',
    beforeTitle: '购物之前',
    beforeText: '请查看我们无法运送的物品。',
    nextTitle: '接下来做什么？',
    nextText: '估算您第一次寄件的运费，或通过示例了解使用流程。',
    howToBuy: '了解使用流程',
    signedIn: '您已在此浏览器中登录：您的账户里随时可以查看 Carinova ID、地址、包裹和付款。',
    signedOut: '如需随时查看这些信息，请用您的邮箱登录账户。',
    invalidTitle: '此链接无效',
    invalidText: '链接可能不完整。请从我们发给您的邮件中重新打开，或重新注册。',
    expiredTitle: '此链接已过期',
    expiredText: `确认链接的有效期为${CONFIRM_LINK_HOURS}小时。请重新注册，我们会再给您发送一个链接。`,
    signupAgain: '重新注册',
    errorTitle: '无法创建您的账户',
    errorText: '问题出在我们这边，不是您的问题。请重试；如果仍然失败，请通过 WhatsApp 联系我们。',
    retry: '重试',
    retrying: '正在重试…',
    existingTitle: '您已有账户',
    existingIntro: '此邮箱已有 Carinova 账户。这是您的 Carinova ID：',
    documentTitle: '您的账户 {code} | Carinova',
  },

  // components/carinova/SignupForm.astro
  signupForm: {
    signedIn: '您已在此浏览器中登录账户。',
    title: '您的资料',
    intro: '只需几分钟。',
    noscript: '要在线注册，请在浏览器中启用 JavaScript。您也可以通过 WhatsApp 创建账户。',
    country: '国家',
    firstName: '名字',
    lastName: '姓氏',
    email: '电子邮箱',
    emailHint: '我们会向您发送一个确认账户的链接。',
    phone: '电话',
    phoneHint: '最好填写您使用 WhatsApp 的号码。',
    address1: '地址',
    address2: '公寓 / 套房',
    optional: '（选填）',
    city: '城市',
    choose: '请选择',
    postalCode: '邮政编码',
    honeypot: '此栏请留空',
    sending: '正在提交…',
    afterSubmit: '提交后，我们会向您发送一封确认账户的邮件。',
    accept: ['我接受', '条款和条件', '及', '隐私政策', '。'],
    sentTitle: '请查收您的邮件',
    sentTo: ['我们已向 ', ' 发送了一个链接。打开链接即可确认账户，并获取您的 Carinova ID 和美国收货地址。'],
    sentNotes: [
      '邮件可能需要几分钟才能送达。',
      '如果没有收到，请检查垃圾邮件文件夹。',
      `链接将在${CONFIRM_LINK_HOURS}小时后失效。`,
    ],
    edit: '邮箱填错了？点此更正',
    messages: {
      missing: '请填写此栏。',
      terms: '请先接受条款和隐私政策再继续。',
      unavailable: '在线注册暂时无法使用。请通过 WhatsApp 联系我们，我们会为您创建账户。',
      busy: '尝试次数过多。请稍等一分钟后再试。',
      failed: '无法提交您的注册。请检查网络连接后重试，或通过 WhatsApp 联系我们。',
      oneError: '有1个字段需要修改。',
      manyErrors: '有{count}个字段需要修改。',
    },
  },

  // components/carinova/UsAddressCard.astro
  usAddressCard: {
    title: '您的美国收货地址',
    intro: '在美国商店购物时，请将它用作收货地址。',
    warehouse: '仓库',
    soonTitle: (city: string) => `${city}：即将开通`,
    soonText: (city: string, state: string) =>
      `很快，您也可以在 ${city}（${state}）接收您的网购商品。仓库开通后，其地址将显示在这里。`,
    meanwhile: (city: string) => `在此期间，请使用您的 ${city} 地址。`,
  },

  // pages/404.astro
  notFoundPage: {
    metaTitle: '页面未找到',
    title: '找不到此页面',
    lead: '您在找其他内容吗？',
    text: ['链接可能输入有误，或页面已不存在。请从', '首页', '重新开始，或继续您要做的事：'],
  },

  // pages/articulos-prohibidos.astro
  restrictedPage: {
    tagline: '禁运和限运物品',
    title: '可以寄往尼加拉瓜吗？',
    metaTitle: '禁运物品：哪些物品不能寄往尼加拉瓜',
    description:
      'Carinova 无法从美国运往尼加拉瓜的物品：禁运物品、我们尚未获准运送的物品，以及不能空运但可以海运的产品。购物前请先查看。',
    subtitle: '有些物品我们不接收也不运输，有些我们尚未获准运送，还有些只能海运。购买或寄送前，请先查看清单。',
    closing: {
      title: '不确定某件商品？',
      subtitle: '购买前先问我们，我们会告诉您能否运送。',
      lead: '把商品发给我们：',
    },
  },

  // pages/como-comprar.astro
  howToBuyPage: {
    tagline: '使用流程',
    title: '如何从尼加拉瓜在美国购物',
    description:
      '一步步教您在美国商店购物、在尼加拉瓜收货，并附有运送衣服、手机、笔记本电脑、家居用品、家具和亲友包裹的费用示例。',
    subtitle:
      '从第一次购物到包裹抵达尼加拉瓜，三个清晰的步骤，并附有运送衣服、手机、笔记本电脑、家居用品、家具和亲友包裹的费用示例。',
    steps: '步骤',
    examples: {
      tagline: '分类示例',
      title: '运过来要多少钱？',
      subtitle: '六个购物示例，按我们的费率计算。在计算器中打开任意一个，换成您自己的购物数据即可。',
      open: '在计算器中打开',
    },
    closing: {
      title: '从注册账户开始',
      subtitle: '有了 Carinova ID 和美国收货地址，您就可以在任何商店购物。',
      lead: '需要我们指导您完成第一次购物吗？',
    },
    total: '合计',
  },

  // pages/cotizador.astro
  quotePage: {
    tagline: '运费与计算器',
    metaTitle: '寄包裹到尼加拉瓜要多少钱：运费与计算器',
    description: `从美国寄包裹到尼加拉瓜要多少钱：空运每磅 ${formatUSD(air.pricePerLb)}，海运每磅 ${formatUSD(sea.pricePerLb)} 或每立方英尺 ${formatUSD(sea.pricePerCubicFoot)}，电子产品按件计费。无需注册即可计算。`,
    title: '寄包裹到尼加拉瓜要多少钱？',
    subtitle: '几秒钟即可估算运费：无需注册，算出从美国运送您的网购商品或包裹的费用。',
    closing: {
      title: '已经知道费用了？',
      subtitle: '注册账户，获取您的 Carinova ID 和美国收货地址，开始购物。',
      lead: '您的货件比较特殊？',
    },
  },

  // pages/empresas.astro
  businessPage: {
    tagline: 'Carinova 企业服务',
    metaTitle: '从美国到尼加拉瓜的企业货运与寄送',
    description:
      '为企业提供从美国到尼加拉瓜的物流方案：进口与供应、定期发货和企业专属服务，空运或海运均可。告诉我们您的需求。',
    title: '您的业务运营，也值得更顺畅地流转。',
    subtitle: '从第一次采购补货到公司发展壮大，我们根据您货物的特点，探索量身定制的物流方案。',
    offers: '我们与贵公司共同探索的方案',
    also: '以及您和所有客户一样享有的服务',
    benefits: [
      {
        icon: 'tabler:packages',
        title: '空运与海运货物',
        text: `空运每磅 ${formatUSD(air.pricePerLb)}，${air.transit}送达。海运每磅 ${formatUSD(sea.pricePerLb)} 或每立方英尺 ${formatUSD(sea.pricePerCubicFoot)}，${sea.transit}送达。`,
      },
      {
        icon: 'tabler:id-badge-2',
        title: '贵公司专属的 Carinova ID',
        text: `贵公司所有货件都使用同一个 ID，可在 ${cityNames.join(' 或 ')} 自提。`,
      },
    ],
    quote: '估算一票货的运费',
    next: '接下来会怎样？',
    steps: [
      { title: '我们收到您的申请', description: '申请会直接送达我们的团队。' },
      {
        title: '我们与您联系',
        description: '通过电子邮件或 WhatsApp，了解贵公司的需求。',
      },
      {
        title: '我们为贵公司开设账户',
        description: '附带 Carinova ID 和 Miami 收货地址，即可开始收货。',
      },
    ],
    helpTitle: '更想直接联系我们？',
    helpText: '我们也可以通过 WhatsApp 为贵公司开设账户。',
    helpLink: '为我的公司开设账户',
    closing: {
      title: '想知道您的货物运费吗？',
      subtitle: '几秒钟内按磅或按立方英尺估算运费。',
      lead: '更想与顾问沟通？',
    },
  },

  // pages/index.astro
  homePage: {
    service: '从美国寄往尼加拉瓜',
    title: `从美国寄往尼加拉瓜 | ${warehouse.city} 美国收货地址 | Carinova`,
    description: `从美国寄往尼加拉瓜，使用您专属的 ${warehouse.city} 美国收货地址：空运${air.transit}送达，每磅 ${formatUSD(air.pricePerLb)}；海运${sea.transit}送达，每磅 ${formatUSD(sea.pricePerLb)} 起。可在 ${cityNames.join(' 或 ')} 自提。`,
  },

  // pages/ingresar.astro
  signinPage: {
    tagline: '我的账户',
    metaTitle: '登录我的账户',
    description:
      '使用您的电子邮箱登录 Carinova 账户：我们会向您发送验证码，无需密码即可进入。您的 Carinova ID、美国收货地址、包裹和付款都在这里。',
    title: '登录您的账户',
    subtitle: '在同一个地方处理所有事务：您的 Carinova ID、地址、包裹和付款。',
    howTitle: '运作方式',
    how: [
      {
        icon: 'tabler:mail',
        title: '无需密码',
        text: '没有需要记住的密码，也没有可被盗取的密码：每次登录，我们都会向您的邮箱发送新的验证码。',
      },
      {
        icon: 'tabler:clock',
        title: '一次性验证码',
        text: `只能使用一次，${LOGIN_CODE_MINUTES}分钟后失效。`,
      },
      {
        icon: 'tabler:shield-lock',
        title: '您的登录状态，保存在此浏览器',
        text: `您将保持登录${SESSION_DAYS}天，或直到您退出登录。在共用设备上，使用完毕请退出登录。`,
      },
    ],
    helpTitle: '无法登录？',
    helpText: '请提供您的 Carinova ID 或账户邮箱联系我们。',
  },

  // pages/mi-cuenta.astro
  accountPage: {
    tagline: '我的账户',
    metaTitle: '我的账户：Carinova ID、包裹和付款',
    description: `登录您的 Carinova 账户：您的 Carinova ID、美国收货地址、包裹及其状态，以及您的付款。可在 ${cityNames.join(' 或 ')} 自提。`,
    title: '您的 Carinova 账户',
    subtitle: '在同一个地方处理所有事务：您的 Carinova ID、地址、包裹和付款。',
    signin: '登录您的账户',
    noAccount: '还没有账户？',
    includes: '账户里有什么',
    looksLike: '页面示例',
    idFacts: ['确认邮箱后，系统会自动为您分配。', '空运、海运、包裹转运和代购都使用同一个 ID。'],
    company: '您是企业客户？',
    companyLink: '了解 Carinova 企业服务',
    fullAddress: '登录后即可查看完整地址。',
    stages: '每件包裹及其所处阶段：',
    paymentFacts: ['每张账单的金额和状态。', '付款经我们的团队核实后，会显示为已确认。'],
    pickup: '自提网点：',
    homeDelivery: '送货上门',
    branches: '查看网点',
    closing: {
      title: '几分钟即可注册账户',
      subtitle: '填写一份简短表格，确认您的邮箱，就完成了：您将获得 Carinova ID。',
      lead: '注册前有疑问？',
    },
  },

  // pages/nosotros.astro
  aboutPage: {
    tagline: '关于我们',
    metaTitle: '关于我们：我们是谁，来自哪里',
    description: `Carinova 是一家尼加拉瓜公司，提供从美国到尼加拉瓜的寄送服务，诞生于 ${bluefields}。了解我们的根、我们做什么，以及在 ${cityNames.join(' 和 ')} 哪里可以找到我们。`,
    title: `我们是 Carinova，诞生于 ${bluefields} 的快递公司`,
    subtitle: `一家尼加拉瓜公司，把您的网购商品、家人的包裹和企业货物从美国运来，在 ${cityNames.join(' 和 ')} 设有网点。`,
    roots: {
      title: '我们的根',
      text: 'Carinova 诞生于尼加拉瓜南加勒比海岸的 Bluefields。多元文化故乡的热情、责任与力量融入我们的基因；我们每天努力缩短距离，以值得信赖的用心为你送达每一件包裹。',
      emblemAlt: 'Carinova 品牌徽章：三个人物在圆环内共同托起火焰',
    },
    whatTagline: '我们做什么',
    whatTitle: '让美国的商店离尼加拉瓜更近',
    what: `注册账户后，您会获得 Carinova ID 和一个位于 ${warehouse.city} 的地址，可在任何商店购物。我们在那里接收您的包裹，通过空运或海运运来，您在 ${cityNames.join(' 或 ')} 取件。`,
    servicesLink: '查看各项服务详情',
    factsTagline: '简单来说',
    factsTitle: 'Carinova 概况',
    facts: {
      origin: '我们诞生于',
      originValue: `尼加拉瓜南加勒比海岸的 ${bluefields}`,
      route: '我们的线路',
      routeValue: '从美国到尼加拉瓜',
      reception: '我们接收包裹的地点',
      branches: '尼加拉瓜的网点',
      transport: '包裹的运输方式',
      contact: 'WhatsApp 客服',
      networks: '关注我们',
    },
    valuesTagline: '我们的价值观',
    valuesTitle: '我们的动力',
    values: [
      {
        title: '团队合作',
        description: '就像我们的徽章：三个人物共同托起同一团火焰。从 Miami 到您的网点，每一次寄送都是团队合作的成果。',
      },
      {
        title: '跨越国界',
        description: '环绕他们的圆环，是我们每天往返于美国和尼加拉瓜之间的桥梁。',
      },
      {
        title: '责任承诺',
        description: '火焰是我们的承诺：像对待自己的东西一样，用心照顾每一个包裹。',
      },
    ],
    where: '我们在哪里',
    reviewsTagline: '客户评价',
    reviewsTitle: '客户怎么说',
    faqTitle: '关于 Carinova 的常见问题',
    faq: [
      {
        title: 'Carinova 是什么？',
        description:
          'Carinova 是一家尼加拉瓜的寄送公司。我们通过空运或海运，把个人网购商品、家人包裹和企业货物从美国运到尼加拉瓜。',
      },
      {
        title: 'Carinova 来自哪里？',
        description: `Carinova 诞生于尼加拉瓜南加勒比海岸的 ${bluefields}，如今在 ${cityNames.join(' 和 ')} 设有网点。`,
      },
      {
        title: 'Carinova 的网点在哪里？营业时间是什么？',
        description: `网点位于 ${cityNames.join(' 和 ')}。营业时间：${describeHours(hours)}。`,
      },
      {
        title: 'Carinova 从哪里把包裹运来？',
        description: `我们在位于 ${warehouse.state} ${warehouse.city} 的仓库接收包裹，再运往尼加拉瓜：空运${air.transit}，海运${sea.transit}，自包裹到达仓库之时起计算。`,
      },
      {
        title: '怎样联系 Carinova？',
        description: `通过 WhatsApp 联系我们，号码是 <span dir="ltr">${CONTACT.whatsappDisplay}</span>，也可以到任一网点咨询。`,
      },
      {
        title: '在哪里可以看到 Carinova 客户的评价？',
        description: '本网站的评价页面汇集了客户发布的评价，原文照录，并附有每条评价的发布链接。',
      },
    ],
    careers: {
      title: '加入我们的团队。',
      text: '我们正在寻找致力于优质服务和卓越运营的人才。',
      link: '了解如何申请',
    },
    closing: {
      title: '让我们完成您的第一次寄件',
      subtitle: '在线注册账户，或在购物前估算运费。',
      lead: '想更了解我们？',
    },
  },

  // What a review's card says (the reviews themselves are never translated)
  reviews: {
    recommends: '推荐 Carinova',
    rating: '{rating} 星（满分 5 星）',
    seeOn: '在 {source} 上查看',
    allOn: '{source} 上的全部评价',
    readAll: '阅读全文',
    seeAll: '查看全部评价',
    moreTitle: '还有更多评价',
    moreText: '看看客户们怎样讲述他们的寄件体验。',
  },

  // pages/opiniones.astro
  reviewsPage: {
    tagline: '客户评价',
    metaTitle: '客户评价与口碑',
    description: 'Carinova 客户对从美国寄往尼加拉瓜的包裹的真实评价，原文照录自 {sources}。首次寄件前不妨先看看。',
    title: 'Carinova 的客户怎么说',
    subtitle: '已经通过我们把在美国购买的商品带到尼加拉瓜的客户写下的真实评价，原文照录自 {sources}。',
    listTitle: '来自客户的评价',
    filterLabel: '显示以下来源的评价',
    all: '全部',
    howTitle: '我们如何展示评价',
    how: [
      {
        title: '由作者本人发布',
        text: '每条评价都由作者本人以自己的名字发布在 {sources} 上。',
      },
      {
        title: '一字不改',
        text: '我们按原文、原语言照录，不修改，也不翻译。',
      },
      {
        title: '附有来源链接',
        text: '每条评价都链接到它在 Carinova 主页上发布的位置，那里有全部评价，包括最新的。',
      },
    ],
    writeTitle: '已经收到包裹了？告诉我们您的体验',
    writeText: '您的评价能帮助其他人做决定，也帮助我们改进。',
    writeOn: '在 {source} 上评价',
    nextTitle: '首次寄件之前',
    next: {
      how: '了解运作方式，一步一步来',
      quote: '计算您的运费',
      branches: '查看在哪里取件',
      about: '了解我们是谁',
    },
    closing: {
      title: '通过 Carinova 寄出您的第一件包裹',
      subtitle: '在线创建账户，获取您的 Carinova ID 和美国地址。',
      lead: '想先问我们一些问题吗？',
    },
  },

  // pages/preguntas-frecuentes.astro
  faqPage: {
    tagline: '帮助',
    title: '寄往尼加拉瓜常见问题',
    description:
      '美国收货地址和 Carinova ID、服务、运费、时效、限运物品和自提：关于通过 Carinova 从美国寄往尼加拉瓜的常见问题解答。',
    subtitle: '关于您的账户、服务、运费、送达时间和包裹自提的一切。',
    topics: '主题',
    closing: {
      title: '没有找到答案？',
      subtitle: '联系我们，我们来帮您；或者先注册账户。',
      lead: '告诉我们您的问题：',
    },
  },

  // pages/registro.astro
  signupPage: {
    tagline: '我的账户',
    title: '注册账户',
    description: `在线注册账户，获取您的 Carinova ID 和 ${warehouse.city} 美国收货地址，即可在任何商店购物，并在 ${cityNames.join(' 或 ')} 收货。`,
    subtitle: '只需注册一次。确认邮箱后，系统会自动为您分配 Carinova ID，并显示您的美国收货地址。',
    existing: '已有账户？',
    next: '接下来会怎样？',
    steps: [
      { title: '确认您的邮箱', description: '我们会给您发送一个链接，打开即可激活账户。' },
      {
        title: '获取您的 Carinova ID 和美国收货地址',
        description: '确认后即可在屏幕上看到，同时也会通过邮件发送给您。',
      },
      {
        title: '您购物，我们运送',
        description: `在商店使用您的地址下单，在账户中跟踪包裹，然后在 ${cityNames.join(' 或 ')} 取件。`,
      },
    ],
    helpTitle: '希望我们帮您？',
    helpText: '联系我们，我们通过 WhatsApp 为您创建账户。',
  },

  // pages/servicios.astro
  servicesPage: {
    tagline: '服务',
    metaTitle: '寄往尼加拉瓜的空运和海运、包裹转运与代购',
    description: '从美国到尼加拉瓜的空运和海运、包裹转运、代购、网点自提和送货上门。选择您的包裹如何运输、如何接收。',
    title: '从美国到尼加拉瓜的空运和海运',
    subtitle: '每一次寄件都由三个选择组成：如何运输、由谁购买、如何接收。',
    kinds: '服务类型',
    closing: {
      title: '不确定哪种适合您？',
      subtitle: '估算运费并比较空运和海运，或注册账户开始购物。',
      lead: '需要我们的建议吗？',
    },
  },

  // pages/sucursales.astro
  branchesPage: {
    tagline: '网点',
    title: `${cityNames.join(' 和 ')} 网点`,
    description: `Carinova 在 ${cityNames.join(' 和 ')} 的地址、营业时间和 WhatsApp。${sameHours ? `营业时间：${describeHours(hours)}。` : ''}`,
    subtitle: sameHours
      ? `目前您可在 ${cityNames.join(' 和 ')} 取件，营业时间：${describeHours(hours)}。`
      : `目前您可在 ${cityNames.join(' 和 ')} 取件。`,
    closing: {
      title: '您的下一次购物，随时等您来取',
      subtitle: '注册账户，购物前先估算运费。',
      lead: '不确定在哪个网点取件更方便？',
    },
  },

  // components/carinova/Tracker.astro and TrackingSection.astro
  tracker: {
    switchLabel: '您想查询什么？',
    tabs: { track: '追踪包裹', check: '可以寄吗？' },
    track: {
      title: '追踪您的包裹',
      visitor: '登录账户即可查看您的包裹：仓库已收到的、正在运输途中的，以及已经可以领取的。',
      signin: '登录查看您的包裹',
      noAccount: '还没有账户？',
      customer: '输入包裹参考号，或留空以查看运输中的包裹。',
      label: '包裹参考号或追踪号码',
      placeholder: '例如：PKG-000123',
      submit: '追踪',
      all: '查看我的所有包裹和付款',
      privacy: '为保障安全，仅凭 Carinova ID 无法查询私人数据。',
    },
    check: {
      title: '可以寄往尼加拉瓜吗？',
      intro: '搜索您想运送的物品。结果仅为初步参考，不构成进口或运输许可。',
      label: '您想运送什么？',
      placeholder: '例如：笔记本电脑、香水、鞋子…',
      examples: '试试：',
      lists: '查看完整清单',
      ask: '通过 WhatsApp 咨询',
      note: '不能替代海关核验、相关许可或 Carinova 的确认。',
      script: {
        idleTitle: '购物前先咨询。',
        idleText: '输入物品名称，获取参考信息。',
        unknownTitle: '不在我们的清单上',
        unknownText: '这并不代表可以入境：有些物品需要许可或审核。购买前请先咨询我们。',
      },
    },
  },

  // The trail of a page (PageLayout.astro), the link to the reviews of the home page's footer, and "or".
  nav: {
    home: '首页',
    reviews: '客户评价',
    or: ' 或 ',
  },

  // components/common/Metadata.astro: what a page without its own title or description says
  meta: {
    title: `从美国寄往尼加拉瓜 | ${warehouse.city} 美国收货地址 | Carinova`,
    description: `从美国寄往尼加拉瓜，使用您专属的 ${warehouse.city} 美国收货地址，空运或海运均可。在线注册账户，在 ${cityNames.join(' 或 ')} 自提。`,
  },

  // The statuses of packages, invoices and payments (src/data/account.ts), by their id
  statuses: {
    package: {
      received: { name: '仓库已签收', text: '已在美国实际签收' },
      processing: { name: '准备中', text: '分拣与安排' },
      in_transit: { name: '运输中', text: '正在运往尼加拉瓜' },
      ready: { name: '待交付', text: '网点自提或预约送货' },
      delivered: { name: '已交付', text: '您已收到' },
      returned: { name: '已退回', text: '已退回寄件人' },
      cancelled: { name: '已取消', text: '该货件已取消' },
    },
    invoice: {
      unpaid: { name: '待付款', text: '我们尚未登记付款' },
      in_review: { name: '付款审核中', text: '我们已收到您的付款，正在确认' },
      partial: { name: '部分付款', text: '我们已确认部分金额' },
      paid: { name: '已付款', text: '我们已确认您的付款' },
      void: { name: '已作废', text: '此账单已不再适用' },
    },
    payment: {
      pending: { name: '审核中', text: '我们正在确认' },
      confirmed: { name: '已确认', text: '我们已收到' },
      rejected: { name: '未通过', text: '我们无法确认此笔付款' },
    },
    paymentMethod: { cash: '现金', bank_transfer: '银行转账', card: '银行卡', other: '其他方式' },
  },

  // What Carinova explores with a company and the options of its form (src/data/business.ts), by their id
  business: {
    solutions: {
      importacion: {
        title: '进口与供应',
        text: '在报价前，审核货物类型、运输方式、重量、体积和所需单证。',
      },
      recurrentes: {
        title: '定期发货',
        text: '对发货频率、可能的集运方式和供应需求进行商业评估，视可行性而定。',
      },
      corporativa: {
        title: '企业专属服务',
        text: '根据业务运营，确定服务范围、所需的可追溯性、覆盖范围和服务条件。',
      },
    },
    disclaimer: '企业合作方式及其条件，将在可行性与合规评估之后逐案制定。',
    volumes: {
      'under-100': '每月不足100磅',
      '100-500': '每月100至500磅',
      'over-500': '每月超过500磅',
      pallets: '按托盘或集装箱计的货物',
      unknown: '我还不确定',
    },
  },

  // pages/rastreo.astro and components/carinova/PackageLookup.astro
  trackPage: {
    tagline: '包裹追踪',
    metaTitle: '从美国到尼加拉瓜的包裹追踪',
    description:
      '通过 Carinova 跟踪您从美国寄往尼加拉瓜的包裹：仓库已签收、准备中、运输中、待交付和已交付。登录账户，凭参考号追踪每一票货件。',
    title: '追踪您的包裹',
    subtitle: '登录账户，凭参考号逐个阶段跟踪每一票货件。',
    stagesTitle: '您包裹的各个阶段',
    stagesIntro: '每票货件都是这样推进的：从我们的美国仓库，直到您手中。',
    results: {
      active: '运输中的包裹',
      found: '您的搜索结果',
      loading: '正在查找您的包裹…',
      empty: '我们尚未收到寄给您的包裹。第一件包裹到达我们的仓库后，您会在这里看到它及其所处阶段。',
      none: '您目前没有运输中的包裹。',
      notFoundHint: '请检查是否输入正确：参考号以 PKG 开头，可在您的账户中找到。',
      askMissing: '咨询此参考号',
      ask: '咨询此包裹',
      history: '查看记录',
      error: '无法加载您的包裹。请检查网络连接后重试。',
      retry: '重试',
      script: {
        notFound: '在您的账户中找不到参考号为 {reference} 的包裹。',
        summary: '{reference} · {service}',
      },
    },
    closing: {
      title: '还没有账户？',
      subtitle: '注册账户，从包裹到达我们仓库的那一刻起，跟踪每一笔网购。',
      lead: '找不到您的包裹？',
    },
  },

  // components/carinova/ProductLinkForm.astro
  productLink: {
    label: '商品链接',
    placeholder: 'https://store.com/product',
    submit: '准备申请',
    hint: 'WhatsApp 会打开，您的申请已准备好发送。在我们确认总费用之前，不会购买任何东西。',
    invalid: '请粘贴完整的商品链接：以 https:// 开头',
  },

  // pages/casillero-en-miami.astro
  lockerPage: {
    tagline: '美国收货地址',
    metaTitle: `寄往尼加拉瓜的 ${warehouse.city} 美国收货地址`,
    description: `通过 Carinova 免费开通您的 ${warehouse.city} 美国收货地址：一个美国地址，可在 Amazon、SHEIN 或 Temu 购物，并在 ${cityNames.join(' 或 ')} 收货。空运${air.transit}，海运${sea.transit}。`,
    title: `您的 ${warehouse.city} 美国收货地址，寄往尼加拉瓜`,
    subtitle: `一个以您的名字登记的美国地址，可在任何商店购物，并在 ${cityNames.join(' 或 ')} 收货。它随您的 Carinova 账户一起提供。`,
    whatTitle: `什么是 ${warehouse.city} 美国收货地址？如何使用？`,
    what: [
      '这是一个美国地址，您可以像住在美国一样使用它：网购时将它填为收货地址，商店会把包裹送到我们的仓库，再由我们运到尼加拉瓜。',
      '在尼加拉瓜，人们称它为“casillero”，也叫虚拟信箱或国际信箱，中文常说“转运地址”：其实都是一回事。在 Carinova，它无需单独申请：注册账户即可获得。',
      '注册账户后，您将获得 Carinova ID 和收货地址。我们凭 Carinova ID 识别每一件寄给您的包裹。',
    ],
    addressTitle: '我们在哪里接收您的网购商品',
    addressNote: '注册账户后即可查看完整地址。',
    includesTitle: '您的美国收货地址包括什么',
    includesLink: '查看账户中的全部内容',
    costTitle: '美国收货地址要多少钱？',
    cost: '注册账户免费：您只需支付每件包裹的运费，按磅计费；海运也可按立方英尺计费。',
    costLink: '计算我的运费',
    stepsTitle: '如何使用您的美国收货地址',
    stepsLink: '查看每个步骤及示例',
    faqTitle: '关于美国收货地址和您的账户的问题',
    closing: {
      title: '几分钟即可开通您的美国收货地址',
      subtitle: '在线注册账户，获取您的 Carinova ID 和美国收货地址。',
      lead: '开通前有疑问？',
    },
  },

  // pages/tiendas.astro
  storesPage: {
    tagline: '商店',
    metaTitle: '从尼加拉瓜在 Amazon、SHEIN 和 Temu 购物',
    description: `如何从尼加拉瓜在 Amazon、SHEIN、Temu、Walmart 等美国商店购物：使用您 Carinova 账户中的地址，或请我们代购，然后在 ${cityNames.join(' 或 ')} 收货。`,
    title: '从尼加拉瓜在美国商店购物',
    subtitle: 'Amazon、SHEIN、Temu、Walmart 等众多商店：您用账户中的地址下单，我们负责运到尼加拉瓜。',
    howTitle: '如何在美国商店购物',
    howLink: '查看每个步骤及示例',
    restrictedLink: '查看哪些物品不能寄送',
    storesTitle: '可以购物的商店',
    storesIntro: '您可以在任何配送范围覆盖美国境内的网店购物。以下是按类别列出的一些热门商店。',
    categories: '商店类别',
    buyAt: (store: string) => `从尼加拉瓜在 ${store} 购物`,
    visit: (store: string) => `前往 ${store} 网站`,
    assist: '请我们代购',
    disclosure: '这些商店仅作示例展示，不代表任何合作或背书。价格、库存和每笔购买的条件请以各商店网站为准。',
    assistTitle: '更希望我们帮您买？',
    assistIntro: '使用代购服务，您选择商品，由 Carinova 完成购买。粘贴商品链接，准备您的申请。',
    closing: {
      title: '准备好第一次购物了吗？',
      subtitle: '注册账户，在您喜欢的商店使用您的美国收货地址。',
      lead: '对某家商店有疑问？',
    },
  },

  // pages/index.astro and components/landing: the home page Carinova wrote (./landing)
  landing,
};
