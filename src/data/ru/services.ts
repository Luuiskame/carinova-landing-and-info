/**
 * Russian wording of ../services.ts: the same exports, in Russian. Ids, icons, availability, links
 * and the numbers of the worked examples are taken from the Spanish file; prices and times are
 * worked out from the same rates. Only the words are written here, keyed by id, so adding a service
 * or an example in Spanish without its Russian text fails src/i18n/translations.test.ts.
 */
import * as es from '../services.ts';
import type { ProcessStep, Service, ServiceAxis, ServiceAxisId, ShoppingExample } from '../services.ts';
import { sentence } from '../carinova.ts';
import { formatUSD } from '../../utils/rates.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, RESTRICTED_ITEMS, describeHours } from './carinova.ts';

const { air, sea, electronics } = RATES;
const cities = BRANCHES.map((branch) => branch.city);
const [branchHours] = BRANCHES[0].hours;

/** "a, b и c" */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} и ${items[items.length - 1]}`;
const lowercaseFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** "смартфоны US$30, планшеты US$40, …" */
const devicePrices = electronics.items
  .map((item) => `${item.brand ? item.plural : item.plural.toLowerCase()} ${formatUSD(item.price)}`)
  .join(', ');

/** The text of an id, or an error that names what is missing. */
const textOf = <T>(table: Record<string, T>, id: string, kind: string): T => {
  const text = table[id];
  if (!text) throw new Error(`The ${kind} "${id}" has no Russian text (src/data/ru/services.ts).`);
  return text;
};

const AXIS_TEXT: Record<ServiceAxisId, Pick<ServiceAxis, 'name' | 'question' | 'rule'>> = {
  transporte: {
    name: 'Способ доставки',
    question: 'Как поедет ваша посылка?',
    rule: 'Два пути, одна цель: скорость или экономия — выбираете вы.',
  },
  solucion: {
    name: 'Коммерческое решение',
    question: 'Кто совершает покупку?',
    rule: 'Вы покупаете сами или вам присылают родные — либо мы покупаем за вас.',
  },
  distribucion: {
    name: 'Финальная доставка',
    question: 'Как вы получите посылку в Никарагуа?',
    rule: 'В наших отделениях или у вас дома — за дополнительную плату.',
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
    name: 'Авиадоставка',
    summary: `${formatUSD(air.pricePerLb)} за фунт · ${air.transit}`,
    description:
      'Для того, что вы хотите получить быстро. Действует базовый тариф за фунт, а для некоторых видов электроники — фиксированный тариф за штуку.',
    facts: [
      `Ориентировочный срок: ${air.transit} ${RATES.transitFrom}.`,
      `Базовый тариф: ${formatUSD(air.pricePerLb)} за фунт.`,
      `Электроника за штуку: ${devicePrices}.`,
      `Нельзя самолётом, но можно морем: ${listOf(RESTRICTED_ITEMS.seaOnly.items.map((item) => lowercaseFirst(item.name)))}.`,
      'Применимый тариф подтверждается в зависимости от вида товара, упаковки и условий услуги.',
    ],
    link: 'Рассчитать авиадоставку',
  },
  maritimo: {
    name: 'Морская доставка',
    summary: `${formatUSD(sea.pricePerLb)} за фунт или ${formatUSD(sea.pricePerCubicFoot)} за фут³ · ${sea.transit}`,
    description:
      'Подходит для крупных грузов, запланированных покупок и отправок, где главное — цена. Стоимость считается по весу или по объёму.',
    facts: [
      `Ориентировочный срок: ${sea.transit} ${RATES.transitFrom}.`,
      `Базовый тариф по весу: ${formatUSD(sea.pricePerLb)} за фунт.`,
      `Тариф по объёму: ${formatUSD(sea.pricePerCubicFoot)} за кубический фут.`,
      'Расчёт по весу или по объёму зависит от груза, его упаковки и условий услуги.',
    ],
    link: 'Рассчитать морскую доставку',
  },
  encomiendas: {
    name: 'Посылки',
    summary: 'То, что вы или ваши родные отправляете на наш склад.',
    description:
      'Доставим любую посылку, которая пришла на наш склад на ваше имя: ваши онлайн-покупки или коробку, которую вам отправили родные из США.',
    facts: [
      'Покупайте в любом магазине с доставкой по США.',
      'Родные или друзья тоже могут отправить вам коробку на ваш адрес в Майами.',
      'Посылка едет самолётом или морем — как вам удобнее.',
    ],
    link: 'Как это работает',
  },
  'compras-asistidas': {
    name: 'Покупка за вас',
    summary: 'Вы выбираете товар, а мы покупаем его за вас.',
    description: 'Выберите магазин и пришлите нам ссылку на товар — мы купим его за вас.',
    facts: [
      'Перед покупкой мы подтверждаем наличие, возможность ввоза и итоговую стоимость.',
      'Стоимость покупки, налоги и фрахт подтверждаются до того, как мы оформим заказ.',
      'Товар приходит на наш склад и едет как любая другая посылка.',
    ],
    link: 'Оформить заявку',
    whatsappText: 'Заказать покупку за вас',
  },
  'retiro-en-sucursal': {
    name: 'Получение в отделении',
    summary: `${listOf(cities)} · ${lowercaseFirst(branchHours.days)}`,
    description: 'Когда посылка будет готова к выдаче, заберите её в ближайшем к вам отделении.',
    facts: [`Отделения в городах ${listOf(cities)}.`, sentence(`Мы работаем ${describeHours(branchHours)}`)],
    link: 'Отделения',
  },
  'entrega-a-domicilio': {
    name: 'Доставка на дом',
    summary: 'По всей стране, за дополнительную плату.',
    description:
      'Доставляем по всей стране — по согласованию и в пределах зоны обслуживания. За доставку на дом взимается дополнительная плата, которая зависит от адреса и условий доставки.',
    facts: ['Адрес, зона обслуживания и стоимость подтверждаются при согласовании доставки.'],
    whatsappText: 'Узнать о доставке на дом',
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
/** " Лос-Анджелес — скоро." or nothing, once every warehouse is open. */
const soonNote = receivingSoon.length ? ` ${listOf(receivingSoon)} — скоро.` : '';

/** In the order of ../services.ts: the steps have no id. */
const STEP_TEXT: Array<Pick<ProcessStep, 'title' | 'summary' | 'details'> & { link: string }> = [
  {
    title: 'Создайте аккаунт',
    summary: `Подтвердите почту и получите Carinova ID вместе с адресом в США — адресом нашего склада в ${listOf(receivingNow)}.`,
    details: [
      'Заполните короткую форму и подтвердите почту по ссылке, которую мы пришлём.',
      'После подтверждения вы увидите свой Carinova ID и адрес в США, а мы также отправим их вам на почту.',
      'Затем вы входите по почте и одноразовому коду: запоминать пароль не нужно.',
    ],
    link: CTA.signup.text,
  },
  {
    title: `Покупайте и отправляйте в ${listOf(receivingNow)}`,
    summary: 'При покупке указывайте адрес из своего аккаунта. Но сначала проверьте, разрешён ли товар.',
    details: [
      `Отправляйте покупки на адрес нашего склада в ${listOf(receivingNow)}, указанный в вашем аккаунте.${soonNote}`,
      'При оформлении заказа в магазине укажите имя и фамилию точно так, как они написаны в вашем адресе.',
      'Перед покупкой проверьте, можно ли ввезти товар: одни товары запрещены, другие мы пока не можем доставлять, а третьи едут только морем.',
      'Хотите, чтобы мы купили за вас? Закажите услугу «Покупка за вас».',
    ],
    link: 'Проверить товар',
  },
  {
    title: 'Получите в Никарагуа',
    summary: `Пункты выдачи: ${cities.join(' или ')}. Доставка по всей стране — за дополнительную плату.`,
    details: [
      `Доставим самолётом за ${air.transit} или морем за ${sea.transit}, считая ${RATES.transitFrom}.`,
      'Каждый этап виден в вашем аккаунте по номеру посылки.',
      sentence(`Наши отделения работают ${describeHours(branchHours)}`),
      'Доставка на дом согласовывается в зависимости от адреса и зоны обслуживания.',
    ],
    link: 'Отделения',
  },
];

export const PROCESS_STEPS: Array<ProcessStep> = es.PROCESS_STEPS.map((step, index) => {
  const text = STEP_TEXT[index];
  if (!text) throw new Error(`Step ${index + 1} of "¿Cómo funciona?" has no Russian text (src/data/ru/services.ts).`);
  return {
    ...step,
    title: text.title,
    summary: text.summary,
    details: text.details,
    link: step.link && { ...step.link, text: text.link },
  };
});

const ACCOUNT_TEXT: Record<string, { title: string; summary: string }> = {
  'carinova-id': { title: 'Carinova ID', summary: 'Один на человека или компанию — для всех ваших отправок.' },
  direccion: { title: 'Ваш адрес в США', summary: `${listOf(receivingNow)}.${soonNote}` },
  paquetes: {
    title: 'Ваши посылки',
    summary: 'Что мы получили на складе и что уже отправили, со статусом каждой посылки.',
  },
  pagos: { title: 'Ваши платежи', summary: 'Ваши счета и подтверждённые нами платежи.' },
};

export const ACCOUNT_PARTS: typeof es.ACCOUNT_PARTS = es.ACCOUNT_PARTS.map((part) => ({
  ...part,
  ...textOf(ACCOUNT_TEXT, part.id, 'account part'),
}));

const EXAMPLE_TEXT: Record<string, Pick<ShoppingExample, 'category' | 'item' | 'source'>> = {
  ropa: {
    category: 'Одежда и обувь',
    item: 'Две блузки, брюки и кроссовки: 3 lb',
    source: 'Магазины: SHEIN и Nike',
  },
  celulares: { category: 'Смартфоны и планшеты', item: 'Новый смартфон', source: 'Магазин: Amazon' },
  laptops: { category: 'Ноутбуки и консоли', item: 'Ноутбук', source: 'Магазин: Best Buy' },
  hogar: { category: 'Дом и кухня', item: 'Набор кастрюль весом 18 lb', source: 'Магазин: Walmart' },
  muebles: {
    category: 'Мебель',
    item: 'Офисное кресло в коробке 28 × 26 × 14 дюймов',
    source: 'Магазин: Home Depot',
  },
  encomienda: {
    category: 'Семейные посылки',
    item: 'Коробка весом 8 lb с одеждой и подарками',
    source: 'От ваших родных в США',
  },
};

export const SHOPPING_EXAMPLES: Array<ShoppingExample> = es.SHOPPING_EXAMPLES.map((example) => ({
  ...example,
  ...textOf(EXAMPLE_TEXT, example.id, 'example'),
}));

export const quoteExample = es.exampleQuoter(
  RATES,
  {
    airWeight: 'Авиадоставка, за фунт',
    seaWeight: 'Морская доставка, по весу',
    seaVolume: 'Морская доставка, по объёму',
    unit: 'Авиадоставка, тариф за штуку',
    unitNote: 'Тариф за штуку не суммируется с тарифом за фунт.',
  },
  'ru'
);

export const FORMULA_EXAMPLE: typeof es.FORMULA_EXAMPLE = { ...es.FORMULA_EXAMPLE, item: 'Грузовой паллет' };
