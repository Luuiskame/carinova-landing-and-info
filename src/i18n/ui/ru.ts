/**
 * What the pages and the components say, in Russian. Same shape as ./es.ts (`UI`): every entry of
 * the Spanish dictionary, translated. The customer is addressed as "вы".
 *
 * Cities are inserted where Russian keeps them in the nominative ("в городах Манагуа и Блуфилдс",
 * after a colon): Блуфилдс declines and the code cannot decline it. Майами does not decline, so
 * "в Майами" is written as it is.
 */
import { LOGIN_CODE_DIGITS, LOGIN_CODE_MINUTES, SESSION_DAYS } from '../../data/account.ts';
import { CONTACT, sentence } from '../../data/carinova.ts';
import { BRANCHES, CTA, RATES, RECEPTION_POINTS, describeHours } from '../../data/ru/carinova.ts';
import { CONFIRM_LINK_HOURS } from '../../data/signup.ts';
import { CUBIC_CM_PER_CUBIC_FOOT, formatNumber, formatUSD } from '../../utils/rates.ts';
import type { UI } from './es.ts';
import { landing } from './landing/ru.ts';

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

/** The form of a word that goes with a number: 1 минуту, 2 минуты, 10 минут. */
const plural = (count: number, one: string, few: string, many: string): string => {
  const tens = count % 100;
  const units = count % 10;
  if (tens >= 11 && tens <= 14) return many;
  if (units === 1) return one;
  if (units >= 2 && units <= 4) return few;
  return many;
};
/** How long something lasts: "10 минут", "48 часов", "30 дней". */
const minutes = `${LOGIN_CODE_MINUTES} ${plural(LOGIN_CODE_MINUTES, 'минуту', 'минуты', 'минут')}`;
const linkHours = `${CONFIRM_LINK_HOURS} ${plural(CONFIRM_LINK_HOURS, 'час', 'часа', 'часов')}`;
const sessionDays = `${SESSION_DAYS} ${plural(SESSION_DAYS, 'день', 'дня', 'дней')}`;

export const ui: UI = {
  // components/carinova/AccountPanel.astro
  accountPanel: {
    loading: 'Открываем ваш аккаунт…',
    noscript: 'Чтобы увидеть свой аккаунт, включите JavaScript в браузере.',
    eyebrow: 'Мой аккаунт',
    idLabel: 'Ваш Carinova ID',
    idNote: 'Держите его под рукой, когда пишете нам или забираете посылки.',
    sections: 'Разделы аккаунта',
    packagesIntro: 'Что мы получили на складе и что уже отправили, со статусом каждой посылки.',
    filterLabel: 'Фильтр посылок',
    filters: { all: 'Все', warehouse: 'На складе', shipped: 'Отправлены', delivered: 'Доставлены' },
    packagesEmpty:
      'Мы пока не получали посылок на ваше имя. Когда первая придёт на наш склад, вы увидите её здесь вместе со статусом.',
    packagesNone: 'В этой группе посылок нет.',
    packagesAsk: 'Спросить о моих посылках',
    history: 'История',
    packageAsk: 'Спросить об этой посылке',
    paymentsIntro: 'Ваши счета и подтверждённые нами платежи.',
    invoicesEmpty: 'Счетов пока нет. Когда мы выставим первый, вы увидите его здесь.',
    payments: 'Платежи',
    invoiceAsk: 'Оплатить счёт или задать вопрос',
    paymentsNote:
      'Чтобы оплатить счёт или сообщить об оплате, напишите нам и укажите номер счёта. Платёж отображается как подтверждённый после проверки нашей командой.',
    activityError: 'Не удалось загрузить ваши посылки и платежи.',
    retry: 'Повторить',
    detailsTitle: 'Мои данные',
    detailsIntro: 'С этими данными вы создали аккаунт.',
    name: 'Имя',
    email: 'Электронная почта',
    phone: 'Телефон',
    address: 'Адрес',
    since: 'Клиент с',
    changed: 'Что-то изменилось?',
    update: 'Попросить обновить мои данные',
    nextTitle: 'Что вы хотите сделать?',
    howItWorks: 'Как это работает',
    restricted: 'Что можно ввезти',
    signOut: 'Выйти',
    signingOut: 'Выходим…',
    errorTitle: 'Не удалось открыть ваш аккаунт',
    errorText: 'Проверьте подключение и попробуйте ещё раз. Если ошибка повторится, напишите нам в WhatsApp.',
    script: {
      hello: 'Здравствуйте, {name}',
      documentTitle: 'Мой аккаунт {code} | Carinova',
      received: 'Получено на складе',
      warehouse: 'Склад',
      weight: 'Вес',
      pounds: '{weight} lb',
      pieces: 'Количество мест',
      pickup: 'Пункт выдачи',
      delivery: 'Доставка',
      homeDelivery: 'На дом',
      store: 'Магазин',
      carrier: 'Служба доставки',
      issued: 'Выставлен {date}',
      due: 'оплатить до {date}',
      total: 'Итого',
      paid: 'Оплачено',
      balance: 'Остаток',
      forPackage: '{description} ({reference})',
      balanceDue: 'К оплате: {amount}',
      inReview: 'Платежи на проверке: {amount}',
      nothingDue: 'У вас нет задолженности.',
    },
  },

  // components/carinova/Branches.astro
  branches: {
    tagline: 'Отделения',
    title: `Где забрать посылку: ${cities.join(' или ')}`,
    directions: 'Как добраться',
    branch: (city: string) => `(отделение: ${city})`,
  },

  // components/carinova/BusinessForm.astro
  businessForm: {
    title: 'Расскажите о своей компании',
    intro: 'Заполните эти данные, и мы свяжемся с вами.',
    noscript: 'Чтобы отправить форму, включите JavaScript в браузере. Также можно написать нам в WhatsApp.',
    company: 'Название компании',
    contactName: 'Ваше имя',
    email: 'Электронная почта',
    phone: 'Телефон',
    phoneHint: 'Лучше номер, который вы используете в WhatsApp.',
    country: 'Страна',
    city: 'Город',
    volume: 'Ориентировочный объём',
    optional: '(необязательно)',
    choose: 'Выберите',
    message: 'Что нужно вашей компании?',
    messageHint: 'Что вы привозите, откуда и как часто.',
    honeypot: 'Оставьте это поле пустым',
    submit: 'Отправить заявку',
    sending: 'Отправляем…',
    sentTitle: 'Мы получили вашу заявку',
    sentText: 'Спасибо. Наша команда её рассмотрит и свяжется с вами по почте или телефону, которые вы указали.',
    home: 'На главную',
    privacyNote: [
      'После отправки мы используем эти данные, чтобы связаться с вами, как описано в нашей ',
      'Политике конфиденциальности',
      '.',
    ],
    messages: {
      missing: 'Заполните это поле.',
      unavailable: 'Форма сейчас недоступна. Напишите нам в WhatsApp — мы поможем.',
      busy: 'Слишком много попыток подряд. Подождите минуту и попробуйте снова.',
      failed: 'Не удалось отправить заявку. Проверьте подключение и попробуйте снова или напишите нам в WhatsApp.',
      oneError: 'Нужно исправить одно поле.',
      manyErrors: 'Полей с ошибками: {count}.',
    },
  },

  // components/carinova/QuoteCalculator.astro
  quoteCalculator: {
    title: 'Рассчитайте стоимость',
    badge: 'Без регистрации',
    mode: 'Как доставить?',
    basis: 'Тип тарифа',
    basisHint: 'Выберите одну основу расчёта: вес, объём и тариф за штуку не суммируются.',
    byWeight: 'По весу (фунт)',
    byVolume: 'По объёму (кубический фут)',
    perUnit: (name: string) => `${name} (за штуку)`,
    weightEach: 'Вес каждой посылки (lb)',
    packages: 'Количество посылок',
    kilos: 'Знаете вес в килограммах? 1 кг = 2.2 lb.',
    dimensions: ['Длина', 'Ширина', 'Высота'],
    unit: 'Единицы измерения',
    units: { cm: 'Сантиметры', pulg: 'Дюймы' },
    pieces: 'Количество мест',
    quantity: 'Количество, шт.',
    estimate: 'Ориентировочный базовый тариф',
    what: 'Что вы рассчитываете?',
    send: 'Отправить расчёт в WhatsApp',
    reset: 'Сбросить',
    estimateNote: 'Ориентировочный расчёт по действующим базовым тарифам.',
    footnote:
      'Это ориентировочная оценка, а не договорное предложение. Итоговая сумма зависит от проверки веса, габаритов, содержимого, применимых тарифов и возможных дополнительных сборов. Стоимость товаров и доставка на дом не включены.',
    script: {
      delivery: 'Ориентировочный срок доставки: {transit} {from}.',
      explainWeight:
        'Вес каждой посылки, умноженный на количество посылок; минимальный оплачиваемый вес отправления — {minimum} lb. Вес и применимая основа расчёта проверяются при получении.',
      explainVolume:
        'Длина × ширина × высота в пересчёте на кубические футы (1 фут = 30.48 см = 12 дюймов), без минимумов и округлений.',
      explainUnit: 'Авиатариф за штуку выбранного товара. Тариф за фунт к нему не добавляется.',
      comparison: 'Только для сравнения: {mode} — тот же вес обойдётся в {total} ({transit}).',
      check: 'Проверьте данные',
      checkHint: 'Используйте значения больше нуля.',
      needData: 'Введите вес, размеры или количество, чтобы увидеть оценку.',
      weightShipment: '{mode}, {weight} lb',
      weightShipmentMany: '{mode}, {count} шт. × {weight} lb',
      volumeShipment: '{mode}, {count} шт., {measurements} {unit}',
      unitShipment: '{units}, {mode}',
      unitCm: 'см',
      unitIn: 'дюйм.',
      announce: 'Оценка: {total}',
    },
  },

  // components/carinova/RateCards.astro
  rateCards: {
    tagline: 'Тарифы',
    title: 'Два пути. Одна цель.',
    subtitle:
      'Тарифы включают страховку и налоги, если они применимы к отправке. Сроки отсчитываются с момента физического получения вашей посылки.',
    cities: BRANCHES.map((branch) => branch.city).join(' и '),
    perPound: 'за фунт',
    perCubicFoot: 'за фут³',
    airFacts: [
      'Для того, что нужно получить быстро.',
      'Для некоторых видов электроники — фиксированный тариф за штуку.',
    ],
    seaFacts: [
      'Идеально для крупных грузов и запланированных покупок.',
      'Расчёт по весу или по объёму зависит от груза, его упаковки и условий услуги.',
    ],
    calculate: (name: string) => `${name}: рассчитать стоимость`,
    calculateUnits: 'Рассчитать по штукам',
    electronicsNote: 'Тариф за штуку при авиадоставке. Не суммируется с тарифом за фунт.',
    pickup: 'Получение в отделении:',
    homeDelivery: 'Доставка на дом',
    howTitle: 'Как мы считаем',
    howIntro: 'Одна основа расчёта за раз: вес, объём и тариф за штуку не суммируются.',
    byPound: {
      title: 'За фунт',
      applies: 'Авиа- и морская доставка',
      rule: 'Вес в фунтах × тариф за фунт, без минимумов и округлений. Вес проверяется при получении.',
    },
    byCubicFoot: {
      title: 'За кубический фут',
      applies: 'Морская доставка',
      rule: `Длина × ширина × высота коробки ÷ 1,728, если измеряете в дюймах, или ÷ ${formatNumber(CUBIC_CM_PER_CUBIC_FOOT)}, если в сантиметрах = кубические футы; × ${formatUSD(sea.pricePerCubicFoot)}.`,
      link: 'Попробовать в калькуляторе',
    },
    byUnit: {
      title: 'За штуку',
      applies: 'Электроника, авиадоставка',
      rule: 'Количество × тариф за устройство. Тариф за фунт к нему не добавляется.',
    },
  },

  // components/carinova/ServiceBadge.astro
  serviceBadge: { soon: 'Скоро', extra: 'Доплата' },

  // components/carinova/ShippingModes.astro
  shippingModes: {
    eyebrow: 'Авиа- и морская доставка в Никарагуа',
    title: ['Два способа.', 'Одна цель.'],
    intro:
      'Выберите, как получить посылку. Больше скорости, когда нужно, больше экономии, когда можно спланировать. Сравните, прежде чем решать.',
    air: {
      tag: 'Чтобы получить быстрее',
      overline: 'Авиадоставка',
      title: 'Когда важно время.',
      text: 'Идеально для покупок и посылок, которые хочется получить поскорее.',
    },
    sea: {
      tag: 'Чтобы спланировать заранее',
      overline: 'Морская доставка',
      title: 'Больше места для ваших планов.',
      text: 'Для запланированных покупок и крупных грузов.',
    },
    baseRate: 'Базовый тариф',
    perPound: '/lb',
    orPerCubicFoot: (price: string) => `или ${price} за кубический фут`,
    electronics: 'Электроника: тариф за штуку',
    delivery: 'Ориентировочный срок',
    details: (name: string) => `${name}: подробнее`,
    important: 'Важно:',
  },

  // components/carinova/SigninDialog.astro
  signinDialog: { label: 'Вход в аккаунт', close: 'Закрыть' },

  // components/carinova/SigninForm.astro
  signinForm: {
    title: 'Вход по электронной почте',
    intro: `Мы отправим ${LOGIN_CODE_DIGITS}-значный код на вашу почту. Пароль не нужен.`,
    noscript: 'Чтобы войти, включите JavaScript в браузере.',
    email: 'Электронная почта',
    emailHint: 'Почта, с которой вы создали аккаунт.',
    send: 'Получить код',
    sending: 'Отправляем…',
    noAccount: 'Ещё нет аккаунта?',
    codeTitle: 'Введите код',
    codeSent: [
      'Если адрес ',
      ` привязан к аккаунту, мы отправили на него ${LOGIN_CODE_DIGITS}-значный код. Он действует ${minutes}.`,
    ],
    code: `${LOGIN_CODE_DIGITS}-значный код`,
    enter: CTA.signin.text,
    entering: 'Входим…',
    notes: [
      'Письмо может прийти через пару минут. Если его нет, проверьте папку «Спам».',
      'Мы никогда не попросим этот код в WhatsApp или по телефону.',
    ],
    notArriving: 'Если письмо не пришло, возможно, к этой почте не привязан аккаунт.',
    openYours: 'Создайте свой',
    resend: 'Отправить код ещё раз',
    change: 'Указать другую почту',
    signedIn: 'Вы уже вошли в этом браузере.',
    messages: {
      emailMissing: 'Введите электронную почту.',
      codeMissing: `Введите ${LOGIN_CODE_DIGITS}-значный код.`,
      codeInvalid: 'Код неверный или устарел. Проверьте его или запросите новый.',
      resendIn: 'Отправить код ещё раз ({seconds} с)',
      resent: 'Готово: если к почте привязан аккаунт, мы отправили новый код. Предыдущий больше не действует.',
      unavailable: 'Вход сейчас недоступен. Напишите нам в WhatsApp — мы поможем.',
      busy: 'Слишком много попыток подряд. Подождите минуту и попробуйте снова.',
      failed: 'Не удалось подключиться. Проверьте подключение и попробуйте снова.',
    },
  },

  // components/carinova/SignupConfirm.astro
  signupConfirm: {
    readyTitle: 'Подтвердите почту',
    readyText: 'Остался один шаг: подтвердите почту, чтобы создать аккаунт и увидеть свой Carinova ID и адрес в США.',
    confirm: 'Подтвердить и создать аккаунт',
    confirming: 'Создаём ваш аккаунт…',
    noscript: 'Чтобы подтвердить почту, включите JavaScript в браузере.',
    doneTitle: 'Ваш аккаунт готов!',
    doneIntro: 'Это ваш Carinova ID. Сохраните его: по нему мы узнаём ваш аккаунт.',
    emailed: 'Мы также отправили эти данные вам на почту.',
    beforeTitle: 'Перед покупкой',
    beforeText: 'Проверьте, что мы не можем доставить.',
    nextTitle: 'Что дальше?',
    nextText: 'Рассчитайте первую отправку или посмотрите на примерах, как всё работает.',
    howToBuy: 'Как это работает',
    signedIn: 'Вы вошли в этом браузере: в аккаунте всегда есть ваш Carinova ID, адрес, посылки и платежи.',
    signedOut: 'Чтобы видеть эти данные в любое время, войдите в аккаунт по электронной почте.',
    invalidTitle: 'Ссылка недействительна',
    invalidText:
      'Возможно, она неполная. Откройте её снова из письма, которое мы прислали, или зарегистрируйтесь заново.',
    expiredTitle: 'Срок действия ссылки истёк',
    expiredText: `Ссылки для подтверждения действуют ${linkHours}. Зарегистрируйтесь заново — мы пришлём новую.`,
    signupAgain: 'Зарегистрироваться заново',
    errorTitle: 'Не удалось создать аккаунт',
    errorText:
      'Проблема на нашей стороне, а не на вашей. Попробуйте ещё раз, а если ошибка повторится, напишите нам в WhatsApp.',
    retry: 'Повторить',
    retrying: 'Пробуем…',
    existingTitle: 'У вас уже есть аккаунт',
    existingIntro: 'Эта почта уже привязана к аккаунту Carinova. Ваш Carinova ID:',
    documentTitle: 'Ваш аккаунт {code} | Carinova',
  },

  // components/carinova/SignupForm.astro
  signupForm: {
    signedIn: 'Вы уже вошли в свой аккаунт в этом браузере.',
    title: 'Ваши данные',
    intro: 'Это займёт пару минут.',
    noscript:
      'Чтобы зарегистрироваться онлайн, включите JavaScript в браузере. Также можно создать аккаунт через WhatsApp.',
    country: 'Страна',
    firstName: 'Имя',
    lastName: 'Фамилия',
    email: 'Электронная почта',
    emailHint: 'Мы пришлём ссылку для подтверждения аккаунта.',
    phone: 'Телефон',
    phoneHint: 'Лучше номер, который вы используете в WhatsApp.',
    address1: 'Адрес',
    address2: 'Квартира / офис',
    optional: '(необязательно)',
    city: 'Город',
    choose: 'Выберите',
    postalCode: 'Почтовый индекс',
    honeypot: 'Оставьте это поле пустым',
    sending: 'Отправляем…',
    afterSubmit: 'После отправки мы пришлём письмо для подтверждения аккаунта.',
    accept: ['Я принимаю ', 'Условия обслуживания', ' и ', 'Политику конфиденциальности', '.'],
    sentTitle: 'Проверьте почту',
    sentTo: [
      'Мы отправили ссылку на адрес ',
      '. Откройте её, чтобы подтвердить аккаунт и получить Carinova ID и адрес в США.',
    ],
    sentNotes: [
      'Письмо может прийти через пару минут.',
      'Если его нет, проверьте папку «Спам».',
      `Ссылка действует ${linkHours}.`,
    ],
    edit: 'Ошиблись в адресе почты? Исправьте',
    messages: {
      missing: 'Заполните это поле.',
      terms: 'Чтобы продолжить, примите условия обслуживания и политику конфиденциальности.',
      unavailable: 'Онлайн-регистрация сейчас недоступна. Напишите нам в WhatsApp — мы создадим аккаунт за вас.',
      busy: 'Слишком много попыток подряд. Подождите минуту и попробуйте снова.',
      failed: 'Не удалось отправить регистрацию. Проверьте подключение и попробуйте снова или напишите нам в WhatsApp.',
      oneError: 'Нужно исправить одно поле.',
      manyErrors: 'Полей с ошибками: {count}.',
    },
  },

  // components/carinova/TopStrip.astro
  topStrip: {
    connect: 'Соединяем',
    usa: 'США',
    with: 'и',
    nicaragua: 'Никарагуа',
    soon: 'скоро',
    to: 'в',
  },

  // components/carinova/UsAddressCard.astro
  usAddressCard: {
    title: 'Ваш адрес в США',
    intro: 'Указывайте его как адрес доставки при покупках в магазинах США.',
    warehouse: 'Склад',
    soonTitle: (city: string) => `${city}: скоро`,
    soonText: (city: string, state: string) =>
      `Скоро вы сможете получать покупки и в городе ${city} (${state}). Когда склад откроется, его адрес появится здесь.`,
    meanwhile: (city: string) => `А пока используйте адрес в городе ${city}.`,
  },

  // components/carinova/WhatsAppFloat.astro
  whatsAppFloat: { whichBranch: 'Какое отделение?', label: 'Напишите нам' },

  // components/widgets/Header.astro
  header: { navigation: 'Основная навигация', menu: 'Меню' },

  // pages/404.astro
  notFoundPage: {
    metaTitle: 'Страница не найдена',
    title: 'Мы не нашли эту страницу',
    lead: 'Искали что-то другое?',
    text: [
      'Возможно, в ссылке ошибка или страницы больше нет. Начните с ',
      'главной страницы',
      ' или продолжите то, ради чего пришли:',
    ],
  },

  // pages/articulos-prohibidos.astro
  restrictedPage: {
    tagline: 'Запрещённые и ограниченные товары',
    title: 'Можно ли ввезти в Никарагуа?',
    metaTitle: 'Запрещённые товары: что нельзя отправить в Никарагуа',
    description:
      'Что Carinova не может доставить из США в Никарагуа: запрещённые товары, товары, которые мы пока не можем доставлять, и товары, которые нельзя везти самолётом, но можно морем. Проверьте до покупки.',
    subtitle:
      'Одни товары мы не принимаем и не перевозим, другие пока не можем доставлять, а третьи едут только морем. Проверьте списки перед покупкой или отправкой.',
    closing: {
      title: 'Сомневаетесь насчёт товара?',
      subtitle: 'Спросите нас перед покупкой — мы скажем, сможем ли его доставить.',
      lead: 'Расскажите нам о товаре:',
    },
  },

  // pages/como-comprar.astro
  howToBuyPage: {
    tagline: 'Как это работает',
    title: 'Как покупать в США из Никарагуа',
    description:
      'Пошагово: как покупать в магазинах США и получать в Никарагуа, с примерами стоимости доставки одежды, смартфонов, ноутбуков, товаров для дома, мебели и семейных посылок.',
    subtitle:
      'Три понятных шага — от первой покупки до посылки в Никарагуа — и примеры того, сколько стоит доставить одежду, смартфоны, ноутбуки, товары для дома, мебель и семейные посылки.',
    steps: 'Шаги',
    examples: {
      tagline: 'Примеры по категориям',
      title: 'Сколько стоит доставить…?',
      subtitle:
        'Шесть примеров покупок, рассчитанных по нашим тарифам. Откройте любой в калькуляторе и подставьте данные своей покупки.',
      open: 'Открыть в калькуляторе',
    },
    closing: {
      title: 'Начните с создания аккаунта',
      subtitle: 'С Carinova ID и адресом в США вы уже можете покупать в любом магазине.',
      lead: 'Помочь вам с первой покупкой?',
    },
    total: 'Итого',
  },

  // pages/cotizador.astro
  quotePage: {
    tagline: 'Тарифы и калькулятор',
    metaTitle: 'Сколько стоит отправить посылку в Никарагуа: тарифы и калькулятор',
    description: `Сколько стоит отправить посылку из США в Никарагуа: авиадоставка — ${formatUSD(air.pricePerLb)} за фунт, морская — ${formatUSD(sea.pricePerLb)} за фунт или ${formatUSD(sea.pricePerCubicFoot)} за фут³, электроника — по тарифу за штуку. Рассчитайте без регистрации.`,
    title: 'Сколько стоит отправить посылку в Никарагуа?',
    subtitle:
      'Рассчитайте доставку за секунды: узнайте, сколько стоит привезти вашу покупку или посылку из США, без регистрации.',
    closing: {
      title: 'Теперь знаете, сколько это стоит?',
      subtitle: 'Создайте аккаунт, получите Carinova ID и адрес в США — и начинайте покупать.',
      lead: 'У вас особая отправка?',
    },
  },

  // pages/empresas.astro
  businessPage: {
    tagline: 'Carinova для бизнеса',
    metaTitle: 'Грузы и доставка для компаний из США в Никарагуа',
    description:
      'Логистические решения из США в Никарагуа для компаний: импорт и снабжение, регулярные отправки и корпоративное обслуживание, самолётом или морем. Расскажите, что вам нужно.',
    title: 'Ваши процессы тоже заслуживают лучшей логистики.',
    subtitle:
      'От первой закупки до роста вашей компании — мы подбираем логистические решения под особенности вашего груза.',
    offers: 'Что мы прорабатываем с вашей компанией',
    also: 'И что вы получаете, как любой клиент',
    benefits: [
      {
        icon: 'tabler:packages',
        title: 'Авиа- и морские грузы',
        text: `Авиадоставка — ${formatUSD(air.pricePerLb)} за фунт, ${air.transit}. Морская — ${formatUSD(sea.pricePerLb)} за фунт или ${formatUSD(sea.pricePerCubicFoot)} за кубический фут, ${sea.transit}.`,
      },
      {
        icon: 'tabler:id-badge-2',
        title: 'Один Carinova ID для компании',
        text: `Один ID для всех отправок вашей компании. Пункты выдачи: ${cityNames.join(' или ')}.`,
      },
    ],
    quote: 'Рассчитать отправку',
    next: 'Что дальше?',
    steps: [
      { title: 'Мы получаем вашу заявку', description: 'Она сразу попадает к нашей команде.' },
      {
        title: 'Мы связываемся с вами',
        description: 'По почте или в WhatsApp, чтобы узнать, что нужно вашей компании.',
      },
      {
        title: 'Мы открываем аккаунт вашей компании',
        description: 'С Carinova ID и адресом в Майами — всё готово к приёму посылок.',
      },
    ],
    helpTitle: 'Удобнее написать нам?',
    helpText: 'Аккаунт для компании мы также открываем через WhatsApp.',
    helpLink: 'Открыть аккаунт для моей компании',
    closing: {
      title: 'Хотите узнать, сколько стоит доставка вашего груза?',
      subtitle: 'Рассчитайте по фунтам или кубическим футам за секунды.',
      lead: 'Предпочитаете поговорить с консультантом?',
    },
  },

  // pages/index.astro
  homePage: {
    service: 'Доставка из США в Никарагуа',
    title: `Доставка из США в Никарагуа | Адрес в ${warehouse.city} | Carinova`,
    description: `Доставка из США в Никарагуа с собственным адресом в ${warehouse.city}: самолётом за ${air.transit} по ${formatUSD(air.pricePerLb)} за фунт и морем за ${sea.transit} от ${formatUSD(sea.pricePerLb)}. Пункты выдачи: ${cityNames.join(' или ')}.`,
  },

  // pages/ingresar.astro
  signinPage: {
    tagline: 'Мой аккаунт',
    metaTitle: 'Вход в аккаунт',
    description:
      'Войдите в аккаунт Carinova по электронной почте: мы пришлём код, и вы войдёте без пароля. Там ваш Carinova ID, адрес в США, посылки и платежи.',
    title: 'Вход в аккаунт',
    subtitle: 'Всё в одном месте: ваш Carinova ID, адрес, посылки и платежи.',
    howTitle: 'Как это работает',
    how: [
      {
        icon: 'tabler:mail',
        title: 'Без пароля',
        text: 'Нечего запоминать и нечего украсть: при каждом входе мы присылаем на почту новый код.',
      },
      {
        icon: 'tabler:clock',
        title: 'Одноразовый код',
        text: `Он срабатывает только один раз и истекает через ${minutes}.`,
      },
      {
        icon: 'tabler:shield-lock',
        title: 'Сессия в этом браузере',
        text: `Вы остаётесь в аккаунте ${sessionDays} или до выхода. На общем устройстве выходите из аккаунта, когда закончите.`,
      },
    ],
    helpTitle: 'Не получается войти?',
    helpText: 'Напишите нам и укажите свой Carinova ID или почту аккаунта.',
  },

  // pages/mi-cuenta.astro
  accountPage: {
    tagline: 'Мой аккаунт',
    metaTitle: 'Мой аккаунт: Carinova ID, посылки и платежи',
    description: `Войдите в аккаунт Carinova: ваш Carinova ID, адрес в США, посылки со статусами и платежи. Пункты выдачи: ${cityNames.join(' или ')}.`,
    title: 'Ваш аккаунт Carinova',
    subtitle: 'Всё в одном месте: ваш Carinova ID, адрес, посылки и платежи.',
    signin: 'Войти в аккаунт',
    noAccount: 'Ещё нет аккаунта?',
    includes: 'Что есть в вашем аккаунте',
    looksLike: 'Вот как это выглядит',
    idFacts: [
      'Система присваивает его, когда вы подтверждаете почту.',
      'Он один для авиа- и морской доставки, посылок и покупки за вас.',
    ],
    company: 'Представляете компанию?',
    companyLink: 'Carinova для бизнеса',
    fullAddress: 'Полный адрес виден после входа.',
    stages: 'Каждая посылка со своим этапом:',
    paymentFacts: [
      'Каждый счёт с суммой и статусом.',
      'Платёж отображается как подтверждённый после проверки нашей командой.',
    ],
    pickup: 'Пункты выдачи:',
    homeDelivery: 'Доставка на дом',
    branches: 'Отделения',
    closing: {
      title: 'Создайте аккаунт за пару минут',
      subtitle: 'Заполните короткую форму, подтвердите почту — и всё: у вас есть Carinova ID.',
      lead: 'Есть вопросы перед регистрацией?',
    },
  },

  // pages/nosotros.astro
  aboutPage: {
    tagline: 'О нас',
    metaTitle: 'О нас: кто мы и откуда',
    description: `Carinova — никарагуанская компания, которая доставляет посылки из США в Никарагуа. Она родилась в городе ${bluefields}. Узнайте о наших корнях, о том, что мы делаем и где нас найти: ${cityNames.join(' и ')}.`,
    title: `Мы — Carinova, служба доставки родом из города ${bluefields}`,
    subtitle: `Никарагуанская компания, которая привозит из США ваши покупки, посылки от родных и грузы для бизнеса. Отделения в городах ${cityNames.join(' и ')}.`,
    roots: {
      title: 'Наши корни',
      text: 'Carinova родилась в Блуфилдсе, на Южном Карибском побережье Никарагуа. Теплота, преданность делу и сила нашей многокультурной родной земли — в нашей ДНК, и каждый день мы работаем, чтобы сокращать расстояния и доставлять ваши посылки с той надёжностью и заботой, которые нас отличают.',
      emblemAlt: 'Эмблема Carinova: три фигуры держат пламя внутри круга',
    },
    whatTagline: 'Чем мы занимаемся',
    whatTitle: 'Мы делаем магазины США ближе к Никарагуа',
    what: `С аккаунтом вы получаете Carinova ID и адрес в городе ${warehouse.city}, чтобы покупать в любом магазине. Мы принимаем там ваши посылки, доставляем их самолётом или морем, а вы забираете их в городах ${cityNames.join(' или ')}.`,
    servicesLink: 'Подробнее об услугах',
    factsTagline: 'В двух словах',
    factsTitle: 'Carinova в фактах',
    facts: {
      origin: 'Откуда мы',
      originValue: `${bluefields}, Южное Карибское побережье Никарагуа`,
      route: 'Наш маршрут',
      routeValue: 'Из США в Никарагуа',
      reception: 'Где мы принимаем ваши покупки',
      branches: 'Отделения в Никарагуа',
      transport: 'Как едут ваши посылки',
      contact: 'Поддержка в WhatsApp',
      networks: 'Мы в соцсетях',
    },
    valuesTagline: 'Наши ценности',
    valuesTitle: 'Что нами движет',
    values: [
      {
        title: 'Командная работа',
        description:
          'Как на нашей эмблеме: три фигуры вместе держат одно пламя. Каждая отправка — работа команды, от Майами до вашего отделения.',
      },
      {
        title: 'Международный охват',
        description: 'Круг, который их окружает, — это мост, который мы каждый день проходим между США и Никарагуа.',
      },
      {
        title: 'Ответственность',
        description: 'Пламя — наше обещание: беречь каждую посылку как свою.',
      },
    ],
    where: 'Где мы находимся',
    reviewsTagline: 'Отзывы',
    reviewsTitle: 'Что говорят наши клиенты',
    faqTitle: 'Вопросы о Carinova',
    faq: [
      {
        title: 'Что такое Carinova?',
        description:
          'Carinova — никарагуанская компания по доставке. Мы привозим личные покупки, посылки от родных и грузы для бизнеса из США в Никарагуа, самолётом или морем.',
      },
      {
        title: 'Откуда Carinova?',
        description: `Carinova родилась в городе ${bluefields}, на Южном Карибском побережье Никарагуа, а сегодня у неё есть отделения в городах ${cityNames.join(' и ')}.`,
      },
      {
        title: 'Где находятся отделения Carinova и когда они работают?',
        description: sentence(`В городах ${cityNames.join(' и ')}. Мы работаем ${describeHours(hours)}`),
      },
      {
        title: 'Откуда Carinova привозит посылки?',
        description: `Мы принимаем их на нашем складе в городе ${warehouse.city}, ${warehouse.state}, и доставляем в Никарагуа: самолётом — ${air.transit}, морем — ${sea.transit}, считая с момента поступления посылки на склад.`,
      },
      {
        title: 'Как связаться с Carinova?',
        description: `Через WhatsApp по номеру <span dir="ltr">${CONTACT.whatsappDisplay}</span> или в любом из наших отделений.`,
      },
      {
        title: 'Где прочитать отзывы клиентов Carinova?',
        description:
          'На странице отзывов этого сайта собраны те, что опубликовали наши клиенты, — в том виде, в каком они написаны, и со ссылкой на место публикации каждого.',
      },
    ],
    careers: {
      title: 'Присоединяйтесь к нашей команде.',
      text: 'Мы ищем людей, преданных сервису и безупречной работе.',
      link: 'Как откликнуться',
    },
    closing: {
      title: 'Давайте сделаем вашу первую отправку',
      subtitle: 'Создайте аккаунт онлайн или рассчитайте доставку до покупки.',
      lead: 'Хотите узнать нас поближе?',
    },
  },

  // What a review's card says (the reviews themselves are never translated)
  reviews: {
    recommends: 'Рекомендует Carinova',
    rating: 'Оценка {rating} из 5',
    seeOn: 'Открыть в {source}',
    allOn: 'Все отзывы в {source}',
    readAll: 'Читать отзыв полностью',
    seeAll: 'Смотреть все отзывы',
    moreTitle: 'Есть и другие отзывы',
    moreText: 'Прочитайте всё, что клиенты рассказывают о своих отправлениях.',
    previous: 'Предыдущие отзывы',
    next: 'Следующие отзывы',
  },

  // pages/opiniones.astro
  reviewsPage: {
    tagline: 'Отзывы',
    metaTitle: 'Отзывы клиентов',
    description:
      'Настоящие отзывы клиентов Carinova о доставке из США в Никарагуа — в том виде, в каком они опубликованы в {sources}. Прочитайте их перед первой отправкой.',
    title: 'Что говорят клиенты Carinova',
    subtitle:
      'Настоящие отзывы тех, кто уже привёз с нами свои покупки из США в Никарагуа, — в том виде, в каком они опубликованы в {sources}.',
    listTitle: 'Отзывы наших клиентов',
    filterLabel: 'Показать отзывы из',
    all: 'Все',
    howTitle: 'Как мы показываем отзывы',
    how: [
      {
        title: 'Опубликованы самими авторами',
        text: 'Каждый отзыв опубликован автором под своим именем в {sources}.',
      },
      {
        title: 'Ни одного изменённого слова',
        text: 'Мы приводим их так, как они написаны, на языке оригинала, без правок и перевода.',
      },
      {
        title: 'Со ссылкой на источник',
        text: 'Каждый ведёт на страницу Carinova, где он опубликован. Там есть все отзывы, включая самые новые.',
      },
    ],
    writeTitle: 'Уже получили посылку? Расскажите, как всё прошло',
    writeText: 'Ваш отзыв помогает другим определиться, а нам — становиться лучше.',
    writeOn: 'Оставить отзыв в {source}',
    nextTitle: 'Перед первой отправкой',
    next: {
      how: 'Посмотрите, как это работает, шаг за шагом',
      quote: 'Рассчитайте стоимость доставки',
      branches: 'Узнайте, где забрать посылку',
      about: 'Узнайте, кто мы',
    },
    closing: {
      title: 'Сделайте первую отправку с Carinova',
      subtitle: 'Создайте аккаунт онлайн и получите свой Carinova ID и адрес в США.',
      lead: 'Хотите сначала задать вопрос?',
    },
  },

  // pages/preguntas-frecuentes.astro
  faqPage: {
    tagline: 'Помощь',
    title: 'Частые вопросы о доставке в Никарагуа',
    description:
      'Адрес в США и Carinova ID, услуги, тарифы, сроки, ограниченные товары и получение посылок: ответы на самые частые вопросы о доставке из США в Никарагуа с Carinova.',
    subtitle: 'Всё об аккаунте, услугах, тарифах, сроках доставки и получении посылок.',
    topics: 'Темы',
    closing: {
      title: 'Не нашли ответ?',
      subtitle: 'Напишите нам — мы поможем. Или начните с создания аккаунта.',
      lead: 'Задайте свой вопрос:',
    },
  },

  // pages/registro.astro
  signupPage: {
    tagline: 'Мой аккаунт',
    title: 'Создайте аккаунт',
    description: `Создайте аккаунт онлайн и получите Carinova ID и свой адрес в ${warehouse.city}, чтобы покупать в любом магазине и забирать посылки в Никарагуа. Пункты выдачи: ${cityNames.join(' или ')}.`,
    subtitle:
      'Одна регистрация. Когда вы подтвердите почту, система автоматически присвоит вам Carinova ID и покажет ваш адрес в США.',
    existing: 'Уже есть аккаунт?',
    next: 'Что дальше?',
    steps: [
      { title: 'Подтвердите почту', description: 'Мы пришлём ссылку. Откройте её, чтобы активировать аккаунт.' },
      {
        title: 'Получите Carinova ID и адрес в США',
        description: 'Вы увидите их на экране после подтверждения, а также получите письмом.',
      },
      {
        title: 'Покупайте — мы доставим',
        description: `Указывайте свой адрес в магазине, следите за посылкой в аккаунте и забирайте её в отделении: ${cityNames.join(' или ')}.`,
      },
    ],
    helpTitle: 'Хотите, чтобы мы помогли?',
    helpText: 'Напишите нам — мы создадим аккаунт через WhatsApp.',
  },

  // pages/servicios.astro
  servicesPage: {
    tagline: 'Услуги',
    metaTitle: 'Авиа- и морская доставка в Никарагуа, посылки и покупка за вас',
    description:
      'Авиа- и морская доставка из США в Никарагуа, посылки, покупка за вас, получение в отделении и доставка на дом. Выберите, как поедет посылка и как вы её получите.',
    title: 'Авиа- и морская доставка из США в Никарагуа',
    subtitle: 'Каждая отправка — это три решения: как она поедет, кто совершает покупку и как вы её получите.',
    kinds: 'Виды услуг',
    closing: {
      title: 'Не знаете, что вам подходит?',
      subtitle: 'Рассчитайте доставку и сравните самолёт и море — или создайте аккаунт и начните покупать.',
      lead: 'Нужен совет?',
    },
  },

  // pages/sucursales.astro
  branchesPage: {
    tagline: 'Отделения',
    title: `Отделения: ${cityNames.join(' и ')}`,
    description: `Адреса, часы работы и WhatsApp Carinova в городах ${cityNames.join(' и ')}.${sameHours ? ` ${sentence(`Мы работаем ${describeHours(hours)}`)}` : ''}`,
    subtitle: sameHours
      ? sentence(`Сейчас посылки можно забрать в городах ${cityNames.join(' и ')}, ${describeHours(hours)}`)
      : `Сейчас посылки можно забрать в городах ${cityNames.join(' и ')}.`,
    closing: {
      title: 'Ваша следующая покупка — готова к выдаче',
      subtitle: 'Создайте аккаунт и рассчитайте доставку до покупки.',
      lead: 'Не знаете, в каком отделении удобнее забирать?',
    },
  },

  // components/carinova/Tracker.astro and TrackingSection.astro
  tracker: {
    switchLabel: 'Что вы хотите узнать?',
    tabs: { track: 'Отследить посылку', check: 'Можно ли ввезти?' },
    track: {
      title: 'Отследите посылку',
      visitor:
        'Войдите в аккаунт, чтобы увидеть свои посылки: что мы получили на складе, что уже в пути и что можно забрать.',
      signin: 'Войти и увидеть посылки',
      noAccount: 'Ещё нет аккаунта?',
      customer: 'Введите номер посылки или оставьте поле пустым, чтобы увидеть те, что в пути.',
      label: 'Номер посылки или трек-номер',
      placeholder: 'Напр.: PKG-000123',
      submit: 'Отследить',
      all: 'Все мои посылки и платежи',
      privacy: 'В целях безопасности один только Carinova ID не даёт доступа к личным данным.',
    },
    check: {
      title: 'Можно ли ввезти в Никарагуа?',
      intro:
        'Найдите товар, который хотите привезти. Результат — предварительная подсказка, а не разрешение на ввоз или перевозку.',
      label: 'Что вы хотите привезти?',
      placeholder: 'Напр.: ноутбук, духи, обувь…',
      examples: 'Попробуйте:',
      lists: 'Полные списки',
      ask: 'Спросить в WhatsApp',
      note: 'Не заменяет таможенную проверку, разрешения и подтверждение Carinova.',
      script: {
        idleTitle: 'Спросите до покупки.',
        idleText: 'Введите название товара, чтобы получить подсказку.',
        unknownTitle: 'Этого нет в наших списках',
        unknownText:
          'Это не значит, что товар можно ввезти: некоторым товарам нужны разрешения или проверка. Спросите нас перед покупкой.',
      },
    },
  },

  // components/widgets/Footer.astro
  footer: {
    channelsEyebrow: 'Мы на связи',
    channelsTitle: 'Подписывайтесь и пишите нам',
    previous: 'Предыдущие каналы',
    next: 'Ещё каналы',
    email: 'Почта',
    languages: 'Языки',
  },

  // src/navigation.ts and the layouts: the header, the footer and the trail of a page
  nav: {
    home: 'Главная',
    services: 'Услуги',
    shopper: 'Купим за вас',
    rates: 'Тарифы',
    calculator: 'Калькулятор',
    howItWorks: 'Как это работает',
    business: 'Бизнесу',
    help: 'Помощь',
    explore: 'Обзор',
    yours: 'Ваш Carinova',
    near: 'Мы рядом',
    canItEnter: 'Можно ли ввезти?',
    tracking: 'Отслеживание',
    faq: 'Частые вопросы',
    about: 'О нас',
    reviews: 'Отзывы',
    terms: 'Условия обслуживания',
    privacy: 'Конфиденциальность',
    and: ' и ',
    or: ' или ',
    brand: 'Доставка, которая сближает. Мы приближаем к вам покупки, родных и проекты вашей компании.',
    route: ['США', 'Никарагуа'],
    rights: 'Все права защищены. Тарифы и сроки подлежат проверке.',
    language: 'Язык',
    languageChoose: 'Выберите язык',
    locker: `Адрес в ${warehouse.city}`,
    stores: 'Магазины',
  },

  // components/common/Metadata.astro: what a page without its own title or description says
  meta: {
    title: `Доставка из США в Никарагуа | Адрес в ${warehouse.city} | Carinova`,
    description: `Доставка из США в Никарагуа с собственным адресом в ${warehouse.city}, самолётом или морем. Создайте аккаунт онлайн и забирайте посылки в отделении: ${cityNames.join(' или ')}.`,
  },

  // The statuses of packages, invoices and payments (src/data/account.ts), by their id
  statuses: {
    package: {
      received: { name: 'Получено на складе', text: 'Физическое получение в США' },
      processing: { name: 'Готовится к отправке', text: 'Сортировка и согласование' },
      in_transit: { name: 'В пути', text: 'Перевозка в Никарагуа' },
      ready: { name: 'Готово к выдаче', text: 'Получение в отделении или согласованная доставка' },
      delivered: { name: 'Доставлено', text: 'Вы получили посылку' },
      returned: { name: 'Возвращено', text: 'Возвращено отправителю' },
      cancelled: { name: 'Отменено', text: 'Отправка отменена' },
    },
    invoice: {
      unpaid: { name: 'Ожидает оплаты', text: 'Оплата ещё не зарегистрирована' },
      in_review: { name: 'Оплата на проверке', text: 'Мы получили ваш платёж и подтверждаем его' },
      partial: { name: 'Оплачен частично', text: 'Мы подтвердили часть суммы' },
      paid: { name: 'Оплачен', text: 'Мы подтвердили вашу оплату' },
      void: { name: 'Аннулирован', text: 'Этот счёт больше не действует' },
    },
    payment: {
      pending: { name: 'На проверке', text: 'Мы его подтверждаем' },
      confirmed: { name: 'Подтверждён', text: 'Мы его получили' },
      rejected: { name: 'Отклонён', text: 'Нам не удалось его подтвердить' },
    },
    paymentMethod: {
      cash: 'Наличные',
      bank_transfer: 'Банковский перевод',
      card: 'Карта',
      other: 'Другой способ',
    },
  },

  // What Carinova explores with a company and the options of its form (src/data/business.ts), by their id
  business: {
    solutions: {
      importacion: {
        title: 'Импорт и снабжение',
        text: 'Анализ вида товара, способа доставки, веса, объёма и необходимых документов до расчёта стоимости.',
      },
      recurrentes: {
        title: 'Регулярные отправки',
        text: 'Коммерческая оценка частоты, возможной консолидации и потребностей в снабжении — если это осуществимо.',
      },
      corporativa: {
        title: 'Корпоративное обслуживание',
        text: 'Определение объёма услуг, необходимой прослеживаемости, зоны покрытия и условий обслуживания под вашу задачу.',
      },
    },
    disclaimer:
      'Условия для бизнеса формируются индивидуально, после оценки осуществимости и соответствия требованиям.',
    volumes: {
      'under-100': 'Менее 100 lb в месяц',
      '100-500': 'От 100 до 500 lb в месяц',
      'over-500': 'Более 500 lb в месяц',
      pallets: 'Груз на паллетах или в контейнере',
      unknown: 'Пока не знаю',
    },
  },

  // pages/rastreo.astro and components/carinova/PackageLookup.astro
  trackPage: {
    tagline: 'Отслеживание',
    metaTitle: 'Отслеживание посылок из США в Никарагуа',
    description:
      'Следите за посылками из США в Никарагуа с Carinova: получено на складе, готовится к отправке, в пути, готово к выдаче и доставлено. Войдите в аккаунт и отслеживайте каждую отправку по её номеру.',
    title: 'Отследите посылку',
    subtitle: 'Войдите в аккаунт и следите за каждой отправкой по её номеру — этап за этапом.',
    stagesTitle: 'Этапы доставки вашей посылки',
    stagesIntro: 'Так проходит каждая отправка — от нашего склада в США до ваших рук.',
    results: {
      active: 'Ваши посылки в пути',
      found: 'Результат поиска',
      loading: 'Ищем ваши посылки…',
      empty:
        'Мы пока не получали посылок на ваше имя. Когда первая придёт на наш склад, вы увидите её здесь вместе с текущим этапом.',
      none: 'Сейчас у вас нет посылок в пути.',
      notFoundHint: 'Проверьте, правильно ли введён номер: он начинается с PKG и указан в вашем аккаунте.',
      askMissing: 'Спросить об этом номере',
      ask: 'Спросить об этой посылке',
      history: 'История',
      error: 'Не удалось загрузить ваши посылки. Проверьте подключение и попробуйте снова.',
      retry: 'Повторить',
      script: {
        notFound: 'В вашем аккаунте нет посылки с номером {reference}.',
        summary: '{reference} · {service}',
      },
    },
    closing: {
      title: 'Ещё нет аккаунта?',
      subtitle: 'Создайте аккаунт и следите за каждой покупкой с момента, когда она придёт на наш склад.',
      lead: 'Не можете найти посылку?',
    },
  },

  // components/carinova/ProductLinkForm.astro
  productLink: {
    label: 'Ссылка на товар',
    placeholder: 'https://shop.com/item',
    submit: 'Подготовить заявку',
    hint: 'Откроется WhatsApp с готовой заявкой. Мы ничего не покупаем, пока не подтвердим итоговую стоимость.',
    invalid: 'Вставьте полную ссылку на товар: она начинается с https://',
  },

  // pages/casillero-en-miami.astro
  lockerPage: {
    tagline: 'Адрес в США',
    metaTitle: `Адрес в ${warehouse.city} для доставки в Никарагуа`,
    description: `Получите бесплатно свой адрес в ${warehouse.city} с Carinova: адрес в США для покупок на Amazon, SHEIN или Temu с получением в Никарагуа (${cityNames.join(' или ')}). Самолётом — ${air.transit}, морем — ${sea.transit}.`,
    title: `Ваш адрес в ${warehouse.city} для Никарагуа`,
    subtitle: `Адрес в США на ваше имя — чтобы покупать в любом магазине и получать посылки в Никарагуа (${cityNames.join(' или ')}). Он входит в ваш аккаунт Carinova.`,
    whatTitle: `Что такое адрес в ${warehouse.city} и как он работает?`,
    what: [
      'Это адрес в США, которым вы пользуетесь так, будто живёте там: указываете его как адрес доставки при онлайн-покупках, магазин доставляет посылку на наш склад, а мы привозим её в Никарагуа.',
      'В Никарагуа такой адрес называют «casillero», а ещё — виртуальным или международным почтовым ящиком: это одно и то же. В Carinova его не нужно оформлять отдельно: он входит в ваш аккаунт.',
      'Создав аккаунт, вы получаете Carinova ID и свой адрес. По Carinova ID мы узнаём каждую посылку, пришедшую на ваше имя.',
    ],
    addressTitle: 'Куда мы принимаем ваши покупки',
    addressNote: 'Полный адрес вы увидите, когда создадите аккаунт.',
    includesTitle: 'Что входит в ваш адрес в США',
    includesLink: 'Всё, что есть в аккаунте',
    costTitle: 'Сколько стоит адрес в США?',
    cost: 'Создать аккаунт бесплатно: вы платите только за доставку каждой посылки — за фунт или, при морской доставке, также за кубический фут.',
    costLink: 'Рассчитать стоимость моей отправки',
    stepsTitle: 'Как пользоваться адресом в США',
    stepsLink: 'Каждый шаг с примерами',
    faqTitle: 'Вопросы об адресе в США и аккаунте',
    closing: {
      title: 'Получите адрес в США за пару минут',
      subtitle: 'Создайте аккаунт онлайн и получите Carinova ID и адрес в США.',
      lead: 'Есть вопросы, прежде чем начать?',
    },
  },

  // pages/tiendas.astro
  storesPage: {
    tagline: 'Магазины',
    metaTitle: 'Покупки на Amazon, SHEIN и Temu из Никарагуа',
    description: `Как покупать на Amazon, SHEIN, Temu, Walmart и в других магазинах США из Никарагуа: укажите адрес из аккаунта Carinova или попросите нас купить за вас — и получите посылку в отделении: ${cityNames.join(' или ')}.`,
    title: 'Покупайте в магазинах США из Никарагуа',
    subtitle:
      'Amazon, SHEIN, Temu, Walmart и многие другие: вы покупаете на адрес из аккаунта, а мы доставляем в Никарагуа.',
    howTitle: 'Как купить в магазине США',
    howLink: 'Каждый шаг с примерами',
    restrictedLink: 'Какие товары нельзя ввезти',
    storesTitle: 'Магазины, где можно покупать',
    storesIntro:
      'Покупать можно в любом интернет-магазине с доставкой по США. Вот некоторые из самых популярных — по категориям.',
    categories: 'Категории магазинов',
    buyAt: (store: string) => `${store}: покупки из Никарагуа`,
    visit: (store: string) => `Перейти на сайт ${store}`,
    assist: 'Попросить купить за меня',
    disclosure:
      'Магазины приведены как примеры: это не означает соглашения с ними или их одобрения. Цены, наличие и условия каждой покупки уточняйте на сайте магазина.',
    assistTitle: 'Хотите, чтобы мы купили за вас?',
    assistIntro:
      'С услугой «Покупка за вас» вы выбираете товар, а Carinova совершает покупку. Вставьте ссылку на товар и подготовьте заявку.',
    closing: {
      title: 'Готовы к первой покупке?',
      subtitle: 'Создайте аккаунт и указывайте свой адрес в США в любом магазине.',
      lead: 'Есть вопрос о магазине?',
    },
  },

  // pages/index.astro and components/landing: the home page Carinova wrote (./landing)
  landing,
};
