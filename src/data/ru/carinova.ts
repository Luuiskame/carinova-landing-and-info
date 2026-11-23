/**
 * Russian wording of ../carinova.ts: the same exports with the same shapes, for the Russian version
 * of the site (src/i18n). Facts are not repeated here: every price, number, address and id is taken
 * from the Spanish file and only the words around it are written again, so the languages cannot
 * disagree on a fact. src/i18n/translations.test.ts checks that nothing is left untranslated.
 *
 * Cities are written as Russian maps write them (Манагуа, Блуфилдс, Майами, Лос-Анджелес). Sentences
 * that insert a city keep it in the nominative ("в городе Блуфилдс", "Пункты выдачи: …"), because
 * some of the names decline and the code cannot decline them.
 *
 * Like ../carinova.ts, the Worker bundles this file: relative imports with the .ts extension only.
 */
import * as es from '../carinova.ts';
import type { Branch, DayOfWeek, OpeningHours, RestrictedGroupId, Store, StoreCategoryId } from '../carinova.ts';

/** "a, b и c" */
const listOf = (items: Array<string>): string =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} и ${items[items.length - 1]}`;

/** The form of a word that goes with a number: 1 день, 3 дня, 15 дней, 21 день. */
const plural = (count: number, one: string, few: string, many: string): string => {
  const tens = count % 100;
  const units = count % 10;
  if (tens >= 11 && tens <= 14) return many;
  if (units === 1) return one;
  if (units >= 2 && units <= 4) return few;
  return many;
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const lowercaseFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

export const TAGLINE = 'Доставка, которая сближает';
export const HEADLINE: [string, string] = ['Оттуда —', 'сюда.'];
export const VALUE_PROPOSITION =
  'Доставляем ваши личные покупки, семейные посылки и грузы для бизнеса из США в Никарагуа.';

export const CTA: typeof es.CTA = {
  signup: { ...es.CTA.signup, text: 'Создать аккаунт' },
  quote: { ...es.CTA.quote, text: 'Рассчитать доставку' },
  help: { text: 'Помощь в WhatsApp' },
  account: { ...es.CTA.account, text: 'Перейти в аккаунт', short: 'Мой аккаунт' },
  signin: { ...es.CTA.signin, text: 'Войти', short: 'Войти' },
  track: { ...es.CTA.track, text: 'Отследить посылку' },
};

/** "08:00" → "8:00", "17:00" → "17:00": the 24-hour clock, without a leading zero. */
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours}:${String(minutes).padStart(2, '0')}`;
};

/** "8:00–17:00" */
export const formatHours = ({ opens, closes }: OpeningHours): string => `${formatTime(opens)}–${formatTime(closes)}`;

/** "с понедельника по субботу, с 8:00 до 17:00": opening hours inside a sentence. */
export const describeHours = (hours: OpeningHours): string =>
  `${lowercaseFirst(hours.days)}, с ${formatTime(hours.opens)} до ${formatTime(hours.closes)}`;

const WEEK: Array<DayOfWeek> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Each day by itself, as the first day of a range ("с понедельника") and as its last one ("по субботу"). */
const DAY_NAMES: Record<DayOfWeek, { name: string; from: string; to: string }> = {
  Monday: { name: 'понедельник', from: 'с понедельника', to: 'по понедельник' },
  Tuesday: { name: 'вторник', from: 'со вторника', to: 'по вторник' },
  Wednesday: { name: 'среда', from: 'со среды', to: 'по среду' },
  Thursday: { name: 'четверг', from: 'с четверга', to: 'по четверг' },
  Friday: { name: 'пятница', from: 'с пятницы', to: 'по пятницу' },
  Saturday: { name: 'суббота', from: 'с субботы', to: 'по субботу' },
  Sunday: { name: 'воскресенье', from: 'с воскресенья', to: 'по воскресенье' },
};

/** The days a branch opens, from the structured list: "С понедельника по субботу", or the days one by one. */
const daysOf = (days: Array<DayOfWeek>): string => {
  const order = days.map((day) => WEEK.indexOf(day)).sort((a, b) => a - b);
  const inARow = order.every((day, index) => index === 0 || day === order[index - 1] + 1);
  return capitalize(
    order.length > 2 && inARow
      ? `${DAY_NAMES[WEEK[order[0]]].from} ${DAY_NAMES[WEEK[order[order.length - 1]]].to}`
      : listOf(order.map((day) => DAY_NAMES[WEEK[day]].name))
  );
};

/** The branches' cities, by the branch's id. */
const BRANCH_CITIES: Record<string, string> = { managua: 'Манагуа', bluefields: 'Блуфилдс' };

export const BRANCHES: Array<Branch> = es.BRANCHES.map((branch) => ({
  ...branch,
  city: BRANCH_CITIES[branch.id] ?? branch.city,
  // A real address is the same in every language; only the placeholder is words.
  address: branch.address === es.ADDRESS_PENDING ? 'Адрес уточняется' : branch.address,
  hours: branch.hours.map((row) => ({ ...row, days: daysOf(row.dayOfWeek) })),
}));

/** The warehouses' cities and states, by the warehouse's id. The Miami address itself is not translated. */
const RECEPTION_PLACES: Record<string, { city: string; state: string }> = {
  miami: { city: 'Майами', state: 'Флорида' },
  'los-angeles': { city: 'Лос-Анджелес', state: 'Калифорния' },
};

export const RECEPTION_POINTS: typeof es.RECEPTION_POINTS = es.RECEPTION_POINTS.map((point) => ({
  ...point,
  ...RECEPTION_PLACES[point.id],
}));

/** When packages are received in the United States, in this language. */
export const RECEPTION_HOURS: OpeningHours = {
  ...es.RECEPTION_HOURS,
  days: daysOf(es.RECEPTION_HOURS.dayOfWeek),
};

/** "3–4 дня", "15–20 дней": the word agrees with the last number. */
const transit = ([min, max]: [number, number]): string => `${min}–${max} ${plural(max, 'день', 'дня', 'дней')}`;

const DEVICE_NAMES: Record<string, { name: string; plural: string }> = {
  celular: { name: 'Смартфон', plural: 'Смартфоны' },
  tablet: { name: 'Планшет', plural: 'Планшеты' },
  laptop: { name: 'Ноутбук', plural: 'Ноутбуки' },
  xbox: { name: 'Xbox', plural: 'Xbox' },
  playstation: { name: 'PlayStation', plural: 'PlayStation' },
};

export const RATES: typeof es.RATES = {
  ...es.RATES,
  transitFrom: 'с момента физического получения вашей посылки',
  air: {
    ...es.RATES.air,
    name: 'Авиадоставка',
    badge: 'Быстрее всего',
    transit: transit(es.RATES.air.transitDays),
  },
  sea: {
    ...es.RATES.sea,
    name: 'Морская доставка',
    badge: 'Выгоднее всего',
    transit: transit(es.RATES.sea.transitDays),
  },
  electronics: {
    ...es.RATES.electronics,
    name: 'Электроника',
    transit: transit(es.RATES.electronics.transitDays),
    items: es.RATES.electronics.items.map((item) => ({ ...item, ...DEVICE_NAMES[item.id] })),
  },
  notes: [
    'Сроки отсчитываются с момента физического получения посылки и могут меняться из-за транзита, таможни и пункта назначения.',
    'Мы проверяем вес, габариты, способ доставки, зону обслуживания и условия услуги.',
    'Тарифы включают страховку и налоги, если они применимы к отправке. Покрытие, лимиты, исключения и дополнительные сборы зависят от условий услуги.',
    'Тарифы на электронику действуют для авиадоставки и считаются за штуку.',
    `При расчёте по весу каждое отправление оплачивается минимум за ${es.RATES.minimumLb} lb.`,
  ],
};

export const MIAMI_ADDRESS: typeof es.MIAMI_ADDRESS = {
  ...es.MIAMI_ADDRESS,
  notes: [
    'Указывайте имя и фамилию точно так, как здесь: по ним мы узнаём ваши посылки.',
    'Если хотите отправить покупку морем, перед покупкой напишите нам в WhatsApp.',
  ],
};

/** The labels already carry both languages, as on Carinova's graphic: store checkouts are in English. */
export const miamiAddressRows = es.miamiAddressRows;

/**
 * The names of the items, in the order of the Spanish lists, with the words a Russian speaker may
 * type for each one (the search compares "й" as "и" and "ё" as "е"). The Spanish words still match
 * too.
 */
const RESTRICTED_TEXT: Record<
  RestrictedGroupId,
  { title: string; summary: string; items: Array<{ name: string; match: Array<string> }> }
> = {
  notYet: {
    title: 'Пока не разрешено ввозить',
    summary: 'У нас пока нет разрешения на их доставку.',
    items: [
      {
        name: 'Автомобили',
        match: [
          'автомобиль',
          'автомобили',
          'авто',
          'легковой автомобиль',
          'транспортное средство',
          'транспортные средства',
          'грузовик',
          'грузовики',
          'пикап',
          'пикапы',
          'автобус',
          'автобусы',
          'внедорожник',
          'квадроцикл',
        ],
      },
      {
        name: 'Мотоциклы',
        match: ['мотоцикл', 'мотоциклы', 'мотороллер', 'мотороллеры', 'скутер', 'скутеры', 'мопед', 'мопеды'],
      },
      {
        name: 'Тяжёлая техника',
        match: [
          'тяжелая техника',
          'спецтехника',
          'экскаватор',
          'экскаваторы',
          'трактор',
          'тракторы',
          'погрузчик',
          'погрузчики',
          'бульдозер',
          'бульдозеры',
          'автокран',
          'подъемный кран',
          'башенный кран',
        ],
      },
    ],
  },
  prohibited: {
    title: 'Запрещено к приёму и перевозке',
    summary: 'Мы их не принимаем и не перевозим.',
    items: [
      {
        name: 'Оружие, боеприпасы и аксессуары к ним',
        match: [
          'оружие',
          'огнестрельное оружие',
          'пистолет',
          'пистолеты',
          'ружье',
          'ружья',
          'винтовка',
          'винтовки',
          'боеприпасы',
          'пуля',
          'пули',
        ],
      },
      {
        name: 'Табак, сигареты и табачные изделия',
        match: ['табак', 'сигарета', 'сигареты', 'сигара', 'сигары', 'сигариллы', 'табачные изделия'],
      },
      {
        name: 'Электронные сигареты',
        match: ['электронная сигарета', 'электронные сигареты', 'электронную сигарету', 'электронка', 'вейп', 'вейпы'],
      },
      {
        name: 'Алкогольные напитки',
        match: [
          'алкогольный напиток',
          'алкогольные напитки',
          'алкогольных напитков',
          'алкоголь',
          'спиртное',
          'шампанское',
          'коньяк',
          'джин',
          'спиртные напитки',
          'ром',
          'виски',
          'водка',
          'водку',
          'текила',
          'пиво',
          'вино',
        ],
      },
      {
        name: 'Комплектующие для летательных аппаратов',
        match: [
          'летательный аппарат',
          'летательные аппараты',
          'летательных аппаратов',
          'самолет',
          'самолеты',
          'самолета',
          'самолетов',
          'авиазапчасти',
          'вертолет',
          'вертолеты',
        ],
      },
      {
        name: 'Радиопередатчики',
        match: ['радиопередатчик', 'радиопередатчики', 'передатчик', 'передатчики', 'рация', 'рации', 'радиостанция'],
      },
      {
        name: 'Дроны',
        match: ['дрон', 'дроны', 'квадрокоптер', 'квадрокоптеры', 'коптер', 'беспилотник', 'беспилотники'],
      },
    ],
  },
  seaOnly: {
    title: 'Нельзя самолётом, но можно морем',
    summary: 'Их нельзя перевозить самолётом: мы доставляем их морем.',
    items: [
      {
        name: 'Легковоспламеняющиеся товары',
        match: [
          'легковоспламеняющиеся',
          'легковоспламеняющийся',
          'горючее',
          'топливо',
          'бензин',
          'краска',
          'краски',
          'растворитель',
          'спирт',
          'медицинский спирт',
          'антисептик',
          'зажигалка',
          'зажигалки',
        ],
      },
      {
        name: 'Отдельные литиевые батареи',
        match: [
          'батарея',
          'батареи',
          'батарейка',
          'батарейки',
          'литиевая батарея',
          'литиевые батареи',
          'аккумулятор',
          'аккумуляторы',
          'литиевый аккумулятор',
          'литий',
          'пауэрбанк',
          'повербанк',
        ],
      },
      {
        name: 'Спреи для тела',
        match: ['спрей для тела', 'спреи для тела', 'мист для тела', 'боди спрей', 'одеколон'],
      },
      {
        name: 'Духи',
        match: ['духи', 'парфюм', 'парфюмерия', 'туалетная вода', 'парфюмерная вода', 'аромат'],
      },
      {
        name: 'Аэрозоли',
        match: ['аэрозоль', 'аэрозоли', 'баллончик', 'баллончики', 'спрей', 'спреи', 'лак для волос'],
      },
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

export const RESTRICTED_EXAMPLES = ['Духи', 'Дрон', 'Литиевая батарея', 'Мотоцикл', 'Электронная сигарета'];

const CATEGORY_NAMES: Record<StoreCategoryId, string> = {
  moda: 'Мода',
  tecnologia: 'Электроника',
  hogar: 'Для дома',
  marketplaces: 'Маркетплейсы',
  belleza: 'Красота',
};

export const STORE_CATEGORIES: typeof es.STORE_CATEGORIES = es.STORE_CATEGORIES.map((category) => ({
  ...category,
  name: CATEGORY_NAMES[category.id],
}));

const STORE_TEXT: Record<string, Pick<Store, 'tagline' | 'about'>> = {
  amazon: {
    tagline: 'Целая вселенная категорий в одном месте.',
    about: 'Товары для дома, книги, аксессуары, техника и многое другое.',
  },
  shein: {
    tagline: 'Мода и аксессуары на любой вкус.',
    about: 'Одежда, сумки и аксессуары. Проверяйте размеры, материалы и наличие.',
  },
  temu: {
    tagline: 'Товары, которые интересно находить и сравнивать.',
    about: 'Товары для дома, аксессуары и покупки на каждый день. Читайте описание каждого товара.',
  },
  walmart: {
    tagline: 'Покупки для дома и всей семьи.',
    about: 'Товары для дома, хранение, аксессуары и предметы личного пользования.',
  },
  'best-buy': {
    tagline: 'Техника для работы и отдыха.',
    about: 'Ноутбуки, смартфоны, планшеты и консоли. Уточняйте тариф за штуку и требования к аккумуляторам.',
  },
  nike: {
    tagline: 'Одежда и обувь, чтобы двигаться по-своему.',
    about: 'Обувь, спортивная одежда и аксессуары разных категорий.',
  },
  apple: {
    tagline: 'Устройства и аксессуары.',
    about: 'Смартфоны, планшеты, ноутбуки и аксессуары. Для некоторых товаров действует тариф за штуку.',
  },
  target: {
    tagline: 'Идеи для дома и для каждого дня.',
    about: 'Декор, товары для дома, подарки и другие категории.',
  },
  ebay: {
    tagline: 'Новые и подержанные товары.',
    about: 'Покупки у разных продавцов. Проверяйте состояние, описание и условия.',
  },
  sephora: {
    tagline: 'Красота и уход.',
    about: 'Косметика и средства ухода. Духи и аэрозоли можно отправить только морем.',
  },
  'home-depot': {
    tagline: 'Идеи для ремонта и улучшений.',
    about: 'Инструменты и товары для ремонта дома. Проверяйте размеры и ограничения.',
  },
  adidas: {
    tagline: 'Спорт и стиль жизни.',
    about: 'Обувь, спортивная одежда и аксессуары.',
  },
};

export const STORES: Array<Store> = es.STORES.map((store) => ({ ...store, ...STORE_TEXT[store.id] }));

const hello = (text: string) => `Здравствуйте, Carinova 👋 ${text}`;

/**
 * One message per place, as in Spanish: the keys are the same and each text is still unique. The
 * customer writes them, so they never use a first-person past tense (it would say whether the
 * customer is a man or a woman).
 */
export const WA_MESSAGES: typeof es.WA_MESSAGES = {
  floating: {
    '/': hello('Хочу узнать, как доставить мои покупки из США.'),
    '/como-comprar': hello('У меня вопрос о том, как работает ваш сервис.'),
    '/servicios': hello('Хочу понять, какая услуга мне подойдёт.'),
    '/cotizador': hello('Нужна помощь с расчётом стоимости доставки.'),
    '/sucursales': hello('У меня вопрос о ваших отделениях.'),
    '/casillero-en-miami': hello('Хочу получить свой адрес в США, в Майами.'),
    '/tiendas': hello('Хочу купить в магазине в США, и у меня есть вопрос.'),
    '/rastreo': hello('Хочу узнать, где сейчас моя посылка.'),
    '/mi-cuenta': hello('Я в своём аккаунте, и у меня есть вопрос.'),
    '/registro': hello('Создаю аккаунт, и у меня есть вопрос.'),
    '/registro/confirmar': hello('Подтверждаю электронную почту, и у меня есть вопрос.'),
    '/ingresar': hello('Хочу войти в свой аккаунт, и у меня есть вопрос.'),
    '/empresas': hello('У меня вопрос о вашей услуге для компаний.'),
    '/preguntas-frecuentes': hello('У меня вопрос, ответа на который нет на вашем сайте.'),
    '/articulos-prohibidos': hello('У меня вопрос о товарах, которые вы не можете привезти.'),
    '/nosotros': hello('Хочу больше узнать о Carinova.'),
    '/opiniones': hello('Читаю отзывы ваших клиентов, и у меня есть вопрос.'),
    '/terminos': hello('У меня вопрос по вашим условиям обслуживания.'),
    '/privacidad': hello('У меня вопрос о моих персональных данных.'),
  },
  floatingDefault: hello('Пишу с вашего сайта, у меня вопрос.'),
  footer: hello('Пишу с вашего сайта, хочу получить информацию.'),
  channels: hello('Вижу ваши контакты на сайте и хочу вам написать.'),

  /** "Contactar al equipo", under the conditions of the service on the home page. */
  homeConditions: hello('У меня вопрос по условиям услуги, которые указаны на вашей главной странице.'),

  trackItemCheck: (item: string) =>
    hello(`Я на вашей странице отслеживания и хочу узнать, сможете ли вы привезти: ${item}`),
  trackItemCheckEmpty: hello('Я на вашей странице отслеживания и хочу спросить о товаре: '),
  trackPackage: (code: string, reference: string) =>
    hello(`Мой Carinova ID: ${code}. Отслеживаю посылку ${reference}, и у меня есть вопрос.`),
  trackMissing: (code: string, reference: string) =>
    hello(`Мой Carinova ID: ${code}. Не могу найти в своём аккаунте посылку ${reference}.`),
  trackClosing: hello('Не могу найти свою посылку на странице отслеживания. Поможете?'),

  howToClosing: hello('Теперь я знаю, как всё работает, и хочу помощи с первой отправкой.'),
  example: (category: string) => hello(`Меня заинтересовал ваш пример «${category}»: хочу привезти что-то похожее.`),

  services: {
    aereo: hello('Хочу отправить авиадоставкой. Расскажете подробнее?'),
    maritimo: hello('Хочу отправить морской доставкой. Расскажете подробнее?'),
    encomiendas: hello('Мне собираются отправить посылку из США. Что нужно сделать?'),
    'compras-asistidas': hello('Хочу, чтобы вы купили товар за меня. Вот ссылка: '),
    'retiro-en-sucursal': hello('Хочу узнать, как забрать посылку в отделении.'),
    'entrega-a-domicilio': hello('Хочу заказать доставку на дом. Куда вы доставляете и сколько это стоит?'),
  },
  servicesClosing: hello('Помогите, пожалуйста, выбрать услугу для моей отправки.'),

  lockerClosing: hello('Хочу узнать больше об адресе в США (Майами), прежде чем создавать аккаунт.'),
  storesShopper: (link: string) =>
    hello(
      `Я на вашей странице магазинов и хочу заказать покупку за меня. Товар: ${link} Подтвердите, пожалуйста, наличие, возможность ввоза и итоговую стоимость.`
    ),
  storePageAssist: (store: string) =>
    hello(`На вашей странице магазинов есть ${store}: хочу, чтобы вы купили там товар для меня. Вот ссылка: `),
  storesClosing: hello('Помогите, пожалуйста, купить в магазине в США.'),

  quote: (shipment: string, total: string) =>
    hello(`Мой расчёт в вашем калькуляторе: ${shipment} — ${total}. Поможете его подтвердить?`),
  quoteEmpty: hello('Я в вашем калькуляторе и не знаю, какие данные ввести.'),
  quoteClosing: hello('Хочу рассчитать особую отправку (очень крупную, хрупкую или из нескольких товаров).'),

  branch: (city: string) => hello(`У меня вопрос к отделению в городе ${city}.`),
  branchesClosing: hello('Хочу понять, в каком отделении мне удобнее забирать посылки.'),

  accountClosing: hello('У меня вопрос перед созданием аккаунта.'),

  signupAssist: hello('Хочу создать аккаунт через WhatsApp.'),
  signupHelp: hello('Не получается зарегистрироваться на вашем сайте, нужна помощь.'),
  confirmHelp: hello('Не получается подтвердить почту, чтобы создать аккаунт.'),
  accountExisting: hello('У меня уже есть Carinova ID, хочу узнать о своих посылках.'),
  customer: (code: string) => hello(`Мой Carinova ID: ${code}, у меня вопрос.`),
  welcomeEmail: (code: string) =>
    hello(`Мой Carinova ID: ${code}. Мне пришло приветственное письмо, и у меня есть вопрос.`),

  signinHelp: hello('Не могу войти в свой аккаунт. Поможете?'),
  signinError: hello('При входе в аккаунт на вашем сайте возникла ошибка.'),
  accountPackages: (code: string) => hello(`Мой Carinova ID: ${code}. Хочу узнать о своих посылках.`),
  accountPackage: (code: string, reference: string) =>
    hello(`Мой Carinova ID: ${code}. Хочу узнать о посылке ${reference}.`),
  accountInvoice: (code: string, number: string) =>
    hello(`Мой Carinova ID: ${code}. Хочу оплатить счёт ${number} или задать по нему вопрос.`),
  accountUpdate: (code: string) => hello(`Мой Carinova ID: ${code}. Хочу обновить свои данные.`),
  accountError: hello('При открытии аккаунта на вашем сайте возникла ошибка.'),

  accountCompany: hello('Хочу оформить Carinova ID для своей компании.'),
  businessHelp: hello('Не получается отправить форму для компаний, нужна помощь.'),
  businessClosing: hello('Хочу поговорить с консультантом об отправках моей компании.'),

  faqClosing: hello('В ваших частых вопросах нет ответа на мой вопрос.'),
  restricted: hello('Перед покупкой хочу уточнить, сможете ли вы привезти этот товар: '),
  aboutClosing: hello('Читаю о Carinova на вашем сайте и хочу начать отправлять посылки с вами.'),
  /** The closing band of the page of reviews. */
  reviewsClosing: hello('Читаю отзывы других клиентов и хочу оформить с вами первую отправку.'),
  careers: hello('Хочу работать в команде Carinova. Меня интересует направление: '),
  notFound: hello('На вашем сайте открылась страница, которой не существует.'),
};
