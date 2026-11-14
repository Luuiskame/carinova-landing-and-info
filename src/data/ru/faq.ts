/**
 * Russian wording of ../faq.ts: the same questions, in the same groups and the same order, with the
 * same ones on the home page (src/i18n/translations.test.ts compares them). Prices, times and lists
 * come from the Russian data, which takes every fact from the Spanish data; the names of the stages
 * come from the Russian dictionary (src/i18n/ui/ru.ts).
 */
import { LOGIN_CODE_DIGITS, PACKAGE_STAGES } from '../account.ts';
import { CARINOVA_ID_EXAMPLE, sentence, type RestrictedItem } from '../carinova.ts';
import { FAQ_STORE_COUNT, type FaqGroup, type LinkTo } from '../faq.ts';
import { ui } from '../../i18n/ui/ru.ts';
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
const cities = BRANCHES.map((branch) => branch.city).join(' и ');
const [hours] = BRANCHES[0].hours;
const receiving = RECEPTION_POINTS.filter((point) => point.available).map((point) => point.city);
const soonReception = RECEPTION_POINTS.filter((point) => !point.available).map((point) => point.city);
const devices = electronics.items
  .map((item) => `${item.brand ? item.plural : item.plural.toLowerCase()} ${formatUSD(item.price)}`)
  .join(', ');
const stores = STORES.slice(0, FAQ_STORE_COUNT)
  .map((store) => store.name)
  .join(', ');
/** "Оружие, Дроны" → "оружие; дроны": the items carry commas of their own. */
const inline = (items: Array<RestrictedItem>) =>
  items.map((item) => item.name.charAt(0).toLowerCase() + item.name.slice(1)).join('; ');
const stages = PACKAGE_STAGES.map((stage) => ui.statuses.package[stage.id].name.toLowerCase()).join(', ');

export const faqGroups = (link: LinkTo): Array<FaqGroup> => [
  {
    id: 'cuenta',
    title: 'Аккаунт и Carinova ID',
    items: [
      {
        title: 'Как получить Carinova ID?',
        description: `Пройдите ${link('/registro', 'регистрацию')}, указав электронную почту и телефон, и подтвердите почту по ссылке, которую мы пришлём. После подтверждения платформа автоматически создаст ваш уникальный Carinova ID (например, ${CARINOVA_ID_EXAMPLE}).`,
        featured: 1,
      },
      {
        title: 'Что такое Carinova ID?',
        description:
          'Это идентификатор вашего аккаунта. Он один на человека или на компанию и одинаков для всех наших услуг: авиа- и морской доставки, посылок и покупки за вас.',
      },
      {
        title: `Что такое адрес в ${receiving.join(' и ')} и как он работает?`,
        description: `Это адрес в США на ваше имя: вы указываете его как адрес доставки при покупках в интернете, а всё, что приходит на наш склад, мы доставляем в Никарагуа. В Carinova адрес входит в аккаунт: создав его, вы получаете Carinova ID и свой адрес. ${link('/casillero-en-miami', 'Подробнее об адресе в США')}.`,
      },
      {
        title: 'Как войти в аккаунт?',
        description: `Нажмите ${link('/ingresar', 'Войти')} и введите почту, с которой вы регистрировались: мы пришлём ${LOGIN_CODE_DIGITS}-значный код, и вы войдёте с ним без пароля. В ${link('/mi-cuenta', 'вашем аккаунте')} — ваш Carinova ID, адрес в США, посылки и платежи.`,
      },
      {
        title: 'Сколько стоит создать аккаунт?',
        description: `Создать аккаунт бесплатно: вы платите только за доставку каждой посылки. ${link('/registro', 'Создайте его онлайн')} и получите Carinova ID.`,
      },
      {
        title: 'Можно ли открыть аккаунт для компании?',
        description: `Да: Carinova ID выдаётся на человека или на компанию. Расскажите о своей компании в ${link('/empresas', 'форме для компаний')}, и мы свяжемся с вами, или напишите нам в WhatsApp.`,
      },
      {
        title: 'Куда отправлять покупки из США?',
        description: `В вашем аккаунте указаны адрес и инструкции по приёму посылок на нашем складе в ${receiving.join(' и ')}. Используйте именно эти данные, чтобы мы могли опознать вашу отправку.${
          soonReception.length ? ` Скоро можно будет получать посылки и здесь: ${soonReception.join(' и ')}.` : ''
        }`,
        featured: 2,
      },
    ],
  },
  {
    id: 'servicios',
    title: 'Услуги',
    items: [
      {
        title: 'Чем авиадоставка отличается от морской?',
        description: `Авиадоставка быстрее: ${air.transit}, ${formatUSD(air.pricePerLb)} за фунт. Морская дешевле: ${sea.transit}, ${formatUSD(sea.pricePerLb)} за фунт или ${formatUSD(sea.pricePerCubicFoot)} за кубический фут; она подходит для крупных грузов и запланированных покупок. Сроки отсчитываются ${RATES.transitFrom}.`,
      },
      {
        title: 'Что считается посылкой?',
        description:
          'Всё, что приходит на наш склад на ваше имя: ваши онлайн-покупки или коробка, которую вам отправили родные из США. Посылка едет самолётом или морем — как вам удобнее.',
      },
      {
        title: 'Можете купить товар за меня?',
        description: `Да. Выберите магазин и пришлите нам ссылку. Для покупки за вас нужно подтвердить наличие товара, возможность его ввоза и стоимость товара, услуги и доставки. ${link('/#compras', 'Оформите заявку')}.`,
        featured: 8,
      },
      {
        title: 'В каких магазинах можно покупать?',
        description: `В любом интернет-магазине с доставкой по США: ${stores} и многих других.`,
      },
      {
        title: 'Как покупать на Amazon, SHEIN или Temu из Никарагуа?',
        description: `Создайте аккаунт, при оформлении заказа в магазине укажите адрес из аккаунта как адрес доставки, и мы доставим посылку в Никарагуа самолётом или морем. Если хотите, чтобы мы купили за вас, закажите услугу «Покупка за вас». ${link('/tiendas', 'Смотреть магазины')}.`,
      },
    ],
  },
  {
    id: 'tarifas',
    title: 'Тарифы и оплата',
    items: [
      {
        title: 'Сколько стоит отправить посылку из США в Никарагуа?',
        description: `Авиадоставка — ${formatUSD(air.pricePerLb)} за фунт; морская — ${formatUSD(sea.pricePerLb)} за фунт или ${formatUSD(sea.pricePerCubicFoot)} за кубический фут. Например, посылка весом 5 фунтов самолётом обойдётся в ${formatUSD(quoteByWeight(5, air.pricePerLb).total)}. ${link('/cotizador', 'Рассчитайте свою отправку')}.`,
      },
      {
        title: 'Как рассчитывается тариф?',
        description: `Авиадоставка: ${formatUSD(air.pricePerLb)} за фунт, а для некоторых видов электроники — тариф за штуку. Морская доставка: ${formatUSD(sea.pricePerLb)} за фунт или ${formatUSD(sea.pricePerCubicFoot)} за кубический фут. Основа расчёта зависит от товара и условий услуги. Посчитайте стоимость в нашем ${link('/cotizador', 'калькуляторе')}.`,
        featured: 4,
      },
      {
        title: 'Как рассчитать кубический фут?',
        description: `Перемножьте длину, ширину и высоту коробки в дюймах и разделите результат на 1,728; если измеряете в сантиметрах — на ${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)}. Например: ${describeVolume(
          quoteByVolume(FORMULA_EXAMPLE.dims, sea.pricePerCubicFoot, { unit: FORMULA_EXAMPLE.unit }),
          'ru'
        )}.`,
      },
      {
        title: 'Для какой электроники действует тариф за штуку?',
        description: `Для авиадоставки: ${devices}. Тариф за штуку не суммируется с тарифом за фунт.`,
      },
      {
        title: 'Включены ли страховка и налоги?',
        description:
          'Тарифы включают страховку и налоги, если они применимы к отправке. Покрытие, лимиты, исключения и дополнительные сборы зависят от условий услуги. Уточните применимые условия до заказа услуги.',
        featured: 5,
      },
      {
        title: 'Расчётная стоимость — это то, что я заплачу?',
        description:
          'Не обязательно. Калькулятор считает ориентировочный тариф без учёта стоимости товара и доставки на дом. Итоговая сумма подтверждается после проверки габаритов, веса, содержимого, способа доставки и конкретных условий.',
        featured: 9,
      },
      {
        title: 'Когда и как платить?',
        description: `Вы оплачиваете доставку, когда забираете посылку или когда согласуете её доставку. Напишите нам, чтобы узнать доступные способы оплаты. В ${link('/mi-cuenta', 'вашем аккаунте')} видны ваши счета и подтверждённые нами платежи.`,
      },
    ],
  },
  {
    id: 'tiempos',
    title: 'Сроки и отслеживание',
    items: [
      {
        title: `Сколько идёт отправка из ${receiving.join(' и ')} в Никарагуа?`,
        description: `Авиадоставка — ${air.transit}, морская — ${sea.transit}. Сроки отсчитываются ${RATES.transitFrom} и могут меняться из-за транзита, таможни и пункта назначения.`,
      },
      {
        title: 'С какого момента отсчитываются сроки?',
        description: `С момента физического получения посылки, а не с даты покупки. Авиадоставка: ${air.transit}. Морская доставка: ${sea.transit}. Это ориентировочные сроки: они зависят от транзита, таможни и пункта назначения.`,
        featured: 3,
      },
      {
        title: 'Как отслеживать несколько посылок с одним Carinova ID?',
        description: `Carinova ID привязан к вашему аккаунту. ${link('/ingresar', 'Войдя в аккаунт')}, вы увидите каждую посылку с её номером и статусами отслеживания. В целях безопасности один только номер аккаунта не даёт доступа к личным данным.`,
        featured: 10,
      },
      {
        title: 'Какие статусы бывают у посылки?',
        description: `По порядку: ${stages}. Каждое изменение сохраняется в истории посылки, в ${link('/mi-cuenta', 'вашем аккаунте')}.`,
      },
    ],
  },
  {
    id: 'prohibidos',
    title: 'Ограниченные товары',
    items: [
      {
        title: 'Какие товары можно привезти?',
        description: `Это зависит от вида товара, его компонентов и правил перевозки. Мы не принимаем и не перевозим: ${inline(RESTRICTED_ITEMS.prohibited.items)}. Пока не можем доставлять: ${inline(RESTRICTED_ITEMS.notYet.items)}. ${link('/articulos-prohibidos', 'Посмотрите полные списки')} и, если вашего товара там нет, спросите нас перед покупкой.`,
        featured: 6,
      },
      {
        title: 'Можно ли привезти духи или аэрозоли?',
        description: `Да, морем. Самолётом нельзя перевозить: ${inline(RESTRICTED_ITEMS.seaOnly.items)}.`,
      },
      {
        title: 'Можно ли привезти автомобиль или мотоцикл?',
        description: `Пока нет. У нас ещё нет разрешения на доставку таких товаров: ${inline(RESTRICTED_ITEMS.notYet.items)}.`,
      },
    ],
  },
  {
    id: 'retiro',
    title: 'Получение и доставка',
    items: [
      {
        title: 'Где забрать посылку?',
        description: `${sentence(`В наших отделениях в городах ${cities}, ${describeHours(hours)}`)} ${link('/sucursales', 'Адреса и часы работы')}.`,
      },
      ...BRANCHES.slice(1).map((branch) => ({
        title: `Вы доставляете в город ${branch.city}?`,
        description: `Да: кроме отделения в городе ${BRANCHES[0].city}, у нас есть пункт выдачи в городе ${branch.city}. ${link(`/sucursales#${branch.id}`, `Отделение в городе ${branch.city}`)}.`,
      })),
      {
        title: 'Вы доставляете на дом?',
        description:
          'Мы доставляем по всей стране — по согласованию и в пределах зоны обслуживания. За доставку на дом взимается дополнительная плата, которая зависит от адреса и условий доставки.',
        featured: 7,
      },
      {
        title: 'Может ли посылку забрать другой человек?',
        description:
          'Да. До получения сообщите нам в WhatsApp имя человека, которому вы доверяете получение; ему нужно будет предъявить удостоверение личности.',
      },
      {
        title: 'Сколько вы храните посылку?',
        description:
          'Рекомендуем забрать посылку, как только она будет готова к выдаче. За посылки, которые не забрали вовремя, может взиматься плата за хранение согласно нашим условиям.',
      },
    ],
  },
];
