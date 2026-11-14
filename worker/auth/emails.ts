/**
 * The e-mail that carries a sign-in code (/ingresar), in the language of the page it was asked from.
 * It says who may ask for the code: nobody. A code is only ever typed into the site.
 */
import type { Locale } from '../../src/i18n/locales.ts';
import { big, escapeHtml, h1, layout, p, small, taglineOf, type Message } from '../email-kit.ts';
import { textOf } from '../text/index.ts';

export const loginCodeEmail = (firstName: string, code: string, locale: Locale = 'es'): Message => {
  const t = textOf(locale).loginCode;
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
    text: [t.hello(firstName), `${t.intro}\n\n${code}`, t.expires, t.never, t.notYou, taglineOf(locale)].join('\n\n'),
  };
};
