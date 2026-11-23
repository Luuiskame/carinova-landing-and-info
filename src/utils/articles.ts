// The article search of the home page ("Carinova Bot"): what kind of article did the visitor type,
// and how does it travel? It answers with Carinova's catalogue (src/data/articles.ts) and, for what
// the catalogue does not know, with the lists of what Carinova cannot bring (RESTRICTED_ITEMS in
// src/data/carinova.ts, written in every language of the site). Shared by the page's script (in the
// browser) and the unit tests, so both read a text the same way.
//
// What neither of them knows is for the team to look at ("Requiere revisión"): the search says an
// article can travel only when the catalogue names its kind (D-128).
import type { ArticleRule, ArticleStatus } from '../data/articles.ts';
import { findRestricted, plain, type SearchGroup } from './restricted.ts';

/** How a search is compared with the catalogue: without accents, in lower case, punctuation as spaces. */
export const normalizeArticle = (text: string): string =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[-_/.,;:()+&'"’`´!?¿¡*#|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export interface CompiledRule extends ArticleRule {
  test: RegExp;
  /** Phrases that are another article: taken out of the text before `test` looks at it. */
  aside: RegExp | null;
  skip: RegExp | null;
  /** Its words in the languages the catalogue was not written in, as the lists compare them. */
  words: Array<string>;
}

export interface CatalogueSource {
  rules: ReadonlyArray<ArticleRule>;
  /** A case, a charger, a game… beside a device. */
  extras: RegExp;
  /** "con", "with", "incluye"…: what follows comes with the device. */
  bundle: RegExp;
  /** Whole words of other languages, by the rule's id, with their own accessories and "with". */
  words?: Record<string, ReadonlyArray<string>>;
  accessoryWords?: ReadonlyArray<string>;
  bundleWords?: ReadonlyArray<string>;
}

export interface Catalogue {
  rules: ReadonlyArray<CompiledRule>;
  extras: RegExp;
  bundle: RegExp;
  accessoryWords: Array<string>;
  bundleWords: Array<string>;
}

/** The catalogue ready to search: expressions built (whole words for `terms`, anywhere for `cjk`), words made plain. */
export const compileCatalogue = (source: CatalogueSource): Catalogue => ({
  rules: source.rules.map((rule) => ({
    ...rule,
    test: new RegExp([rule.terms ? `\\b(?:${rule.terms})\\b` : '', rule.cjk || ''].filter(Boolean).join('|')),
    aside: rule.apart ? new RegExp(rule.apart, 'g') : null,
    skip: rule.unless ? new RegExp(rule.unless) : null,
    words: (source.words?.[rule.id] ?? []).map(plain),
  })),
  extras: source.extras,
  bundle: source.bundle,
  accessoryWords: (source.accessoryWords ?? []).map(plain),
  bundleWords: (source.bundleWords ?? []).map(plain),
});

export interface CatalogueMatch {
  status: ArticleStatus;
  /** The rule's id (the kind of article); for an accessory, the kind it is. */
  id: string;
  /** A device with a price per unit: its id in RATES.electronics. */
  electronic?: string;
}

/** Where a whole word (or words) starts in a text padded with spaces; -1 when it is not there. */
const at = (padded: string, word: string): number => (word ? padded.indexOf(` ${word} `) : -1);
const first = (padded: string, words: ReadonlyArray<string>): number =>
  words.reduce((found, word) => {
    const index = at(padded, word);
    return index >= 0 && (found < 0 || index < found) ? index : found;
  }, -1);

/**
 * The first rule of the catalogue the text matches. `excluded` says a rule would have matched if
 * it were not for what the text adds ("cerveza sin alcohol", "repuestos para carro"): the lists of
 * what cannot be brought must not claim it by one of its words.
 */
export const lookupCatalogue = (
  query: string,
  catalogue: Catalogue
): { match: CatalogueMatch | null; excluded: boolean } => {
  const text = normalizeArticle(query);
  const padded = ` ${plain(query)} `;
  let excluded = false;
  if (!text) return { match: null, excluded };

  for (const rule of catalogue.rules) {
    const accessory = { status: 'allowed' as const, id: rule.console ? 'games' : 'techaccessories' };
    const device = { status: 'air' as const, id: rule.id, electronic: rule.electronic };

    // What is another article by its whole phrase ("pistola de agua") is set aside; the rest of the
    // text can still be the rule's ("y una pistola 9 mm").
    const rest = rule.aside ? text.replace(rule.aside, ' ') : text;
    const hit = rule.test.exec(rest);
    if (!hit && rest !== text && rule.test.test(text)) excluded = true;
    if (hit) {
      if (rule.skip?.test(text)) {
        excluded = true;
        continue;
      }
      if (!rule.device) return { match: { status: rule.status, id: rule.id }, excluded };
      // A case for a phone is an accessory; a phone that comes with a case is a phone.
      const extra = catalogue.extras.exec(text);
      const comesWith = catalogue.bundle.exec(text);
      const bundled = extra && comesWith && hit.index < comesWith.index && comesWith.index < extra.index;
      return { match: extra && !bundled ? accessory : device, excluded };
    }

    // The same, with the words of the languages the catalogue was not written in.
    const word = first(padded, rule.words);
    if (word >= 0) {
      if (!rule.device) return { match: { status: rule.status, id: rule.id }, excluded };
      const extra = first(padded, catalogue.accessoryWords);
      const comesWith = first(padded, catalogue.bundleWords);
      const bundled = extra >= 0 && comesWith >= 0 && word < comesWith && comesWith < extra;
      return { match: extra >= 0 && !bundled ? accessory : device, excluded };
    }
  }
  return { match: null, excluded };
};

export interface ArticleAnswer {
  /** How it travels. `review` is also the answer for what nobody knows. */
  status: ArticleStatus;
  /** The kind of article in the catalogue (`landing.cat[id]`); empty when it came from a list or from nowhere. */
  id: string;
  electronic?: string;
  /** From the lists of /articulos-prohibidos: the item as Carinova lists it. */
  item?: string;
  /** Whether the catalogue or a list recognised it. */
  known: boolean;
}

/** Which list of /articulos-prohibidos means what, for the answer. */
const LIST_STATUS: Record<string, ArticleStatus> = {
  prohibited: 'prohibited',
  notYet: 'notYet',
  seaOnly: 'sea',
};

/**
 * The answer to a search: the catalogue's, then the lists' (`groups`, from the strictest to the
 * mildest, in the language of the page). What neither knows is for the team to look at: an article
 * nobody has named is never said to be allowed, whatever it is ("grúa", "tigre", "qzqzqz").
 */
export const classifyArticle = (
  query: string,
  catalogue: Catalogue,
  groups: ReadonlyArray<SearchGroup>
): ArticleAnswer => {
  const { match, excluded } = lookupCatalogue(query, catalogue);
  if (match) return { ...match, known: true };
  // What the catalogue set aside on purpose is not for a list to pick up by one of its words.
  const listed = excluded ? null : findRestricted(query, groups);
  if (listed && LIST_STATUS[listed.group.id]) {
    return { status: LIST_STATUS[listed.group.id], id: '', item: listed.name, known: true };
  }
  return { status: 'review', id: '', known: false };
};
