/**
 * The e-mail Carinova's owner gets when a company fills in the form on /empresas (OWNER_EMAIL).
 * Always in Spanish, whatever language the form was filled in; replying to it writes to the company.
 */
import { BUSINESS_VOLUMES } from '../../src/data/business.ts';
import { content } from '../../src/data/content.ts';
import type { Locale } from '../../src/i18n/locales.ts';
import { whatsappLink } from '../../src/utils/whatsapp.ts';
import { button, escapeHtml, h1, layout, p, table, textRows, type Message } from '../email-kit.ts';
import type { BusinessInquiry } from './validate.ts';

export const businessInquiryEmail = (inquiry: BusinessInquiry, locale: Locale = 'es'): Message => {
  const country = content('es').SIGNUP_COUNTRIES.find(({ code }) => code === inquiry.country);
  const volume = BUSINESS_VOLUMES.find(({ id }) => id === inquiry.volume);
  const rows = [
    { label: 'Empresa', value: inquiry.company },
    { label: 'Contacto', value: inquiry.contactName },
    { label: 'Correo', value: inquiry.email },
    { label: 'Teléfono', value: inquiry.phone },
    { label: 'País', value: country?.name ?? inquiry.country },
    { label: 'Ciudad', value: inquiry.city },
    { label: 'Volumen estimado', value: volume?.es ?? '—' },
    { label: 'Qué necesita', value: inquiry.message },
    // The language to answer in.
    { label: 'Idioma del formulario', value: locale === 'en' ? 'Inglés' : 'Español' },
  ];
  const chatUrl = whatsappLink(inquiry.phone);

  return {
    subject: `Solicitud de empresa: ${inquiry.company}`,
    html: layout(
      `${inquiry.contactName}, de ${inquiry.company}, pide atención para su empresa.`,
      [
        h1(`Solicitud de empresa: ${escapeHtml(inquiry.company)}`),
        p('Una empresa llenó el formulario para empresas del sitio web. Respondé este correo para escribirle.'),
        table(rows),
        button(chatUrl, 'Escribirle por WhatsApp'),
      ].join('\n')
    ),
    text: [
      `Solicitud de empresa: ${inquiry.company}`,
      'Una empresa llenó el formulario para empresas del sitio web. Respondé este correo para escribirle.',
      textRows(rows),
      `WhatsApp del contacto: ${chatUrl}`,
    ].join('\n\n'),
  };
};
