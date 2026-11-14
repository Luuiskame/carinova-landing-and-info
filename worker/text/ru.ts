/** What the Worker says, in Russian. Same shape as ./es.ts (`ServerText`). The customer is addressed as "вы". */
import { LOGIN_CODE_MINUTES } from '../../src/data/account.ts';
import { BUSINESS_LIMITS } from '../../src/data/business.ts';
import { CONFIRM_LINK_HOURS } from '../../src/data/signup.ts';
import { SIGNUP_LIMITS } from '../validation.ts';
import type { ServerText } from './es.ts';

/** The form of a word that goes with a number: 1 минуту, 2 минуты, 10 минут. */
const plural = (count: number, one: string, few: string, many: string): string => {
  const tens = count % 100;
  const units = count % 10;
  if (tens >= 11 && tens <= 14) return many;
  if (units === 1) return one;
  if (units >= 2 && units <= 4) return few;
  return many;
};
/** "10 минут", "48 часов": how long something lasts. */
const minutes = `${LOGIN_CODE_MINUTES} ${plural(LOGIN_CODE_MINUTES, 'минуту', 'минуты', 'минут')}`;
const linkHours = `${CONFIRM_LINK_HOURS} ${plural(CONFIRM_LINK_HOURS, 'час', 'часа', 'часов')}`;
/** "до 100 символов", "до 21 символа", "не более 1500 символов": characters after "до" or "более". */
const characters = (count: number) => `${count} ${count % 10 === 1 && count % 100 !== 11 ? 'символа' : 'символов'}`;

export const text: ServerText = {
  tagline: 'Carinova · Доставка, которая сближает · Из США в Никарагуа',

  // worker/api.ts
  api: {
    emailMissing: 'Введите электронную почту.',
    emailInvalid: 'Проверьте адрес почты: похоже, он указан неверно.',
    emailRejected: 'Не удалось отправить письмо на этот адрес. Проверьте, правильно ли он написан.',
  },

  // worker/auth/emails.ts
  loginCode: {
    subject: 'Ваш код для входа в Carinova',
    preheader: (code: string) => `Ваш код: ${code}. Он действует ${minutes}.`,
    hello: (name: string) => `Здравствуйте, ${name}!`,
    intro: 'Используйте этот код, чтобы войти в аккаунт Carinova:',
    expires: `Код действует ${minutes} и срабатывает только один раз.`,
    never:
      'Вводите его только на нашем сайте. Мы никогда не попросим его в WhatsApp, по телефону или по почте: если кто-то его просит, не сообщайте его.',
    notYou: 'Если это были не вы, просто проигнорируйте письмо: без этого кода никто не сможет войти в ваш аккаунт.',
  },

  // worker/business/validate.ts
  businessForm: {
    company: 'Введите название компании.',
    companyLength: `Название компании должно содержать от 2 до ${characters(BUSINESS_LIMITS.company)}.`,
    contactName: 'Введите своё имя.',
    contactNameInvalid: `Используйте в имени только буквы (от 2 до ${characters(BUSINESS_LIMITS.contactName)}).`,
    email: 'Введите электронную почту.',
    emailInvalid: 'Проверьте адрес почты: похоже, он указан неверно.',
    phone: 'Введите номер телефона.',
    phoneInvalid: (example: string) =>
      `Введите полный номер, например ${example}. Если номер из другой страны, начните с + и кода страны.`,
    country: 'Выберите страну.',
    city: 'Укажите свой город.',
    cityLength: `Название города должно содержать от 2 до ${characters(BUSINESS_LIMITS.city)}.`,
    volume: 'Выберите один из вариантов.',
    message: 'Расскажите, что нужно вашей компании.',
    messageShort: 'Расскажите чуть подробнее, что нужно вашей компании.',
    messageLong: `Не более ${characters(BUSINESS_LIMITS.message)}.`,
  },

  // worker/signup/emails.ts
  verification: {
    subject: 'Подтвердите почту, чтобы создать аккаунт Carinova',
    preheader: 'Ещё один шаг — и ваш аккаунт готов.',
    hello: (name: string) => `Здравствуйте, ${name}!`,
    intro:
      'Мы получили вашу заявку на регистрацию в Carinova. Подтвердите почту, чтобы создать аккаунт и получить Carinova ID и адрес в Майами.',
    button: 'Подтвердить почту',
    expires: `Ссылка действует ${linkHours}.`,
    fallback: (openLink: string) => `Если кнопка не работает, ${openLink}.`,
    fallbackLink: 'откройте эту ссылку',
    notYou: 'Если это были не вы, просто проигнорируйте письмо: аккаунт создан не будет.',
    textIntro:
      'Мы получили вашу заявку на регистрацию в Carinova. Откройте эту ссылку, чтобы подтвердить почту, создать аккаунт и получить Carinova ID и адрес в Майами:',
  },

  // worker/signup/emails.ts
  welcome: {
    subject: (code: string) => `Ваш аккаунт Carinova готов: ${code}`,
    preheader: (code: string) => `Ваш Carinova ID: ${code}. Вот ваш адрес в Майами.`,
    title: (name: string) => `${name}, ваш аккаунт готов!`,
    thisIsId: 'Это ваш Carinova ID.',
    keepId: 'Сохраните его: по нему мы узнаём ваш аккаунт.',
    idLabel: 'Ваш Carinova ID',
    address: 'Ваш адрес в Майами',
    addressIntro: 'Указывайте его как адрес доставки при покупках в магазинах США:',
    before: 'Перед покупкой',
    seeList: 'Посмотреть этот список на сайте',
    listOnSite: 'Список на нашем сайте',
    firstShipment: 'Перед первой отправкой',
    quote:
      'Рассчитайте, сколько стоит доставить вашу покупку: самолётом, морем или по тарифу за штуку для некоторых видов электроники.',
    quoteText: 'Рассчитайте, сколько стоит доставить вашу покупку',
    online: 'Ваш аккаунт онлайн',
    onlineText:
      'На нашем сайте всегда доступны ваш Carinova ID, адрес, посылки и платежи. Вы входите по электронной почте и коду, который мы присылаем, без пароля.',
    questions: 'Есть вопросы?',
    writeUs: (number: string) => `Напишите нам в WhatsApp: ${number}`,
  },

  // worker/signup/validate.ts
  signupForm: {
    country: 'Выберите страну.',
    labels: { firstName: 'Имя', lastName: 'Фамилия' },
    nameMissing: (label: string) => `Заполните поле «${label}».`,
    nameInvalid: (label: string) =>
      `В поле «${label}» используйте только буквы (от 2 до ${characters(SIGNUP_LIMITS.name)}).`,
    emailMissing: 'Введите электронную почту.',
    emailInvalid: 'Проверьте адрес почты: похоже, он указан неверно.',
    phoneMissing: 'Введите номер телефона.',
    phoneInvalid: (example: string) =>
      `Введите полный номер, например ${example}. Если номер из другой страны, начните с + и кода страны.`,
    addressMissing: 'Введите адрес.',
    addressShort: 'Похоже, адрес указан не полностью.',
    tooLong: (max: number) => `Не более ${characters(max)}.`,
    cityMissing: 'Укажите свой город.',
    cityLength: `Название города должно содержать от 2 до ${characters(SIGNUP_LIMITS.city)}.`,
    // The label is the country's stateLabel (src/data/ru/signup.ts): "департамент", "штат".
    state: (label: string) => `Выберите ${label.toLowerCase()}.`,
    postalMissing: 'Введите почтовый индекс.',
    postalInvalid: (example: string) => `Проверьте почтовый индекс (пример: ${example}).`,
    terms: 'Чтобы продолжить, примите условия обслуживания и политику конфиденциальности.',
  },
};
