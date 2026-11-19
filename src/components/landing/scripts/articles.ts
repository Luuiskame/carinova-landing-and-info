// The article search of the home page ("Carinova Bot"): fetched with Carinova's catalogue the first
// time someone searches. It says how the article travels and offers to quote it or to ask the team.
//
// How a search is answered is utils/articles.ts (it has unit tests): the catalogue, then the lists
// of what cannot be brought in the language of the page, then general merchandise. The sentences,
// the names of the kinds of article and those lists come with the page (ScriptData "articles").
// "Consultar con un asesor" opens the message ready to send, in the dialog.
import {
  ACCESSORY_WORDS,
  ARTICLE_RULES,
  ARTICLE_WORDS,
  BUNDLE_WORDS,
  DEVICE_BUNDLE,
  DEVICE_EXTRAS,
} from '~/data/articles';
import { classifyArticle, compileCatalogue } from '~/utils/articles';
import type { SearchGroup } from '~/utils/restricted';
import { fill } from '~/utils/template';
import { whatsappLink } from '~/utils/whatsapp';

import { esc, icon, need, pageData, smooth } from './dom';
import { loadCalculator, loadDialogs } from './lazy';

interface Config {
  locale: string;
  whatsapp: string;
  text: Record<
    | 'required'
    | 'prohibitedTitle'
    | 'prohibitedNote'
    | 'seaTitle'
    | 'seaNote'
    | 'volumeTitle'
    | 'volumeText'
    | 'airTitle'
    | 'airText'
    | 'allowedTitle'
    | 'allowedText'
    | 'reviewTitle'
    | 'reviewText'
    | 'identified'
    | 'unknown'
    | 'quote'
    | 'ask'
    | 'hello'
    | 'message',
    string
  >;
  kinds: Record<string, string>;
  devices: Record<string, { name: string; rate: string }>;
  groups: Array<SearchGroup>;
}

const { locale, whatsapp, text, kinds, devices, groups } = pageData<Config>('articles');

const catalogue = compileCatalogue({
  rules: ARTICLE_RULES,
  extras: DEVICE_EXTRAS,
  bundle: DEVICE_BUNDLE,
  words: ARTICLE_WORDS,
  accessoryWords: ACCESSORY_WORDS,
  bundleWords: BUNDLE_WORDS,
});

const host = need('#article-result');
const query = need<HTMLInputElement>('#article-query');

interface View {
  /** The colour of the card: the same four as the original. */
  tone: 'prohibited' | 'sea' | 'allowed' | 'review';
  mark: string;
  verdict: string;
  note: string;
  /** What "Cotizar este artículo" sets the calculator to. */
  quote?: { category: string; mode?: string };
}

const capitalised = (value: string): string => {
  const trimmed = value.trim();
  return trimmed.charAt(0).toLocaleUpperCase(locale) + trimmed.slice(1);
};

/** Answers a search in the page: the card with the verdict, or the request to type something. */
export const search = (value: string): void => {
  const article = value.trim();
  if (!article) {
    host.innerHTML = `<p class="search-hint" role="alert">${icon('alert')}<span>${esc(text.required)}</span></p>`;
    query.focus();
    return;
  }

  const answer = classifyArticle(article, catalogue, groups);
  const device = answer.electronic ? devices[answer.electronic] : undefined;
  const list = answer.item ? groups.find((group) => group.items.some((item) => item.name === answer.item)) : undefined;

  const views: Record<typeof answer.status, View> = {
    prohibited: { tone: 'prohibited', mark: 'ban', verdict: text.prohibitedTitle, note: text.prohibitedNote },
    // Not authorised yet: what Carinova's own list says about it.
    notYet: {
      tone: 'prohibited',
      mark: 'ban',
      verdict: list?.title ?? text.prohibitedTitle,
      note: list?.summary ?? text.prohibitedNote,
    },
    sea: {
      tone: 'sea',
      mark: 'ship',
      verdict: text.seaTitle,
      note: text.seaNote,
      quote: { category: 'restricted', mode: 'sea' },
    },
    volume: {
      tone: 'sea',
      mark: 'ship',
      verdict: text.volumeTitle,
      note: text.volumeText,
      quote: { category: 'volume', mode: 'sea' },
    },
    air: {
      tone: 'allowed',
      mark: 'check',
      verdict: text.airTitle,
      note: fill(text.airText, { rate: device?.rate ?? '' }),
      quote: { category: answer.electronic ?? 'general', mode: 'air' },
    },
    allowed: {
      tone: 'allowed',
      mark: 'check',
      verdict: text.allowedTitle,
      note: text.allowedText,
      quote: { category: 'general' },
    },
    review: { tone: 'review', mark: 'help', verdict: text.reviewTitle, note: text.reviewText },
  };
  const view = views[answer.status];
  const kind = device?.name ?? (answer.id ? kinds[answer.id] : answer.item);
  const message = `${text.hello}\n${fill(text.message, { article })}`;

  host.innerHTML =
    `<div class="result-card" data-status="${view.tone}"><span class="result-icon">${icon(view.mark)}</span><div>` +
    `<p class="result-title"><strong dir="auto">${esc(capitalised(article))}</strong><span class="result-verdict">${esc(view.verdict)}</span></p>` +
    `<p class="result-match">${esc(kind ? fill(text.identified, { category: kind }) : text.unknown)}</p>` +
    `<p>${esc(view.note)}</p>` +
    `<div class="result-actions">` +
    (view.quote
      ? `<button class="btn btn-secondary btn-sm" type="button" id="article-quote">${icon('calculator')}<span>${esc(text.quote)}</span></button>`
      : '') +
    `<a class="link" id="article-ask" href="${esc(whatsappLink(whatsapp, message))}" target="_blank" rel="noopener">${icon('chat')}<span>${esc(text.ask)}</span></a>` +
    `</div></div></div>`;

  // The message is shown ready to send, as in Carinova's page; if the dialog cannot be fetched, the
  // link opens WhatsApp with it.
  need<HTMLAnchorElement>('#article-ask', host).addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const link = event.currentTarget as HTMLAnchorElement;
    loadDialogs()
      .then((dialogs) => dialogs.openMessage(message))
      .catch(() => window.open(link.href, '_blank', 'noopener'));
  });

  const { quote } = view;
  if (quote) {
    need('#article-quote', host).addEventListener('click', () => {
      void loadCalculator()
        .then((calculator) => calculator.apply(quote))
        .catch(() => {});
      need('#cotizador').scrollIntoView({ behavior: smooth(), block: 'start' });
    });
  }
};
