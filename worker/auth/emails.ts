/**
 * The e-mail that carries a sign-in code (/ingresar), in the language of the page it was asked from.
 * It says who may ask for the code: nobody. A code is only ever typed into the site.
 */
import { LOGIN_CODE_MINUTES } from '../../src/data/account.ts';
import type { Locale } from '../../src/i18n/locales.ts';
import { TAGLINE, big, escapeHtml, h1, layout, p, small, type Message } from '../email-kit.ts';

const LOGIN_CODE = {
  es: {
    subject: 'Tu código para ingresar a Carinova',
    preheader: (code: string) => `Tu código es ${code}. Vence en ${LOGIN_CODE_MINUTES} minutos.`,
    hello: (name: string) => `Hola, ${name}:`,
    intro: 'Usá este código para ingresar a tu casillero de Carinova:',
    expires: `Vence en ${LOGIN_CODE_MINUTES} minutos y sirve una sola vez.`,
    never:
      'Escribilo solo en nuestro sitio. Nunca te lo vamos a pedir por WhatsApp, por teléfono ni por correo: si alguien te lo pide, no se lo des.',
    notYou: 'Si no fuiste vos, ignorá este mensaje: sin este código nadie puede ingresar a tu cuenta.',
  },
  en: {
    subject: 'Your code to sign in to Carinova',
    preheader: (code: string) => `Your code is ${code}. It expires in ${LOGIN_CODE_MINUTES} minutes.`,
    hello: (name: string) => `Hi, ${name}:`,
    intro: 'Use this code to sign in to your Carinova mailbox:',
    expires: `It expires in ${LOGIN_CODE_MINUTES} minutes and works only once.`,
    never:
      'Type it only on our site. We will never ask you for it on WhatsApp, by phone or by e-mail: if someone asks for it, do not give it to them.',
    notYou: 'If it was not you, ignore this message: without this code nobody can sign in to your account.',
  },
};

export const loginCodeEmail = (firstName: string, code: string, locale: Locale = 'es'): Message => {
  const t = LOGIN_CODE[locale];
  return {
    subject: t.subject,
    html: layout(
      t.preheader(code),
      [
        h1(t.hello(escapeHtml(firstName))),
        p(t.intro),
        big(code),
        small(t.expires),
        small(t.never),
        small(t.notYou),
      ].join('\n'),
      locale
    ),
    text: [t.hello(firstName), `${t.intro}\n\n${code}`, t.expires, t.never, t.notYou, TAGLINE[locale]].join('\n\n'),
  };
};
